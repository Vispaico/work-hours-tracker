import type { Job, WorkEntry, ReminderSettings } from '../types';
import { backendClient } from './backendClient';
import { supabase } from './supabaseClient';

interface SyncPayload {
  jobs: Job[];
  entries: WorkEntry[];
}

const noop = async () => {};

const JOB_TABLE = 'work_jobs';
const ENTRY_TABLE = 'work_entries';

const mapJobRow = (row: any): Job | null => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    hourlyRate: row.hourly_rate,
    currency: row.currency,
    schedule: Array.isArray(row.schedule) ? row.schedule : [],
    userId: row.user_id ?? undefined,
  } as Job;
};

const mapEntryRow = (row: any): WorkEntry | null => {
  if (!row) return null;
  return {
    id: row.id,
    jobId: row.job_id,
    date: row.date,
    entryType: row.entry_type,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    durationHours: row.duration_hours ?? undefined,
    status: row.status ?? undefined,
    userId: row.user_id ?? undefined,
  } as WorkEntry;
};

const fetchInitialData = async (userId?: string | null): Promise<SyncPayload | null> => {
  if (!userId || !supabase) {
    if (!backendClient.isConfigured) {
      return null;
    }
    try {
      return await backendClient.get<SyncPayload>('/sync');
    } catch (error) {
      console.warn('[sync] Unable to fetch initial data', error);
      return null;
    }
  }

  try {
    const { data: jobsData, error: jobsError } = await supabase
      .from(JOB_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: true });

    if (jobsError) {
      throw jobsError;
    }

    const { data: entriesData, error: entriesError } = await supabase
      .from(ENTRY_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('updated_at', { ascending: true });

    if (entriesError) {
      throw entriesError;
    }

    return {
      jobs: (jobsData ?? []).map(mapJobRow).filter(Boolean) as Job[],
      entries: (entriesData ?? []).map(mapEntryRow).filter(Boolean) as WorkEntry[],
    };
  } catch (error) {
    console.warn('[sync] Unable to fetch initial data from Supabase', error);
    return null;
  }
};

const upsertSupabaseRecords = async (
  table: string,
  records: Record<string, unknown>[],
  userId: string
) => {
  if (!supabase) {
    return;
  }

  if (!records.length) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.warn(`[sync] Unable to clear ${table}`, error);
    }
    return;
  }

  const upsertResponse = await supabase.from(table).upsert(records, { onConflict: 'id' });
  if (upsertResponse.error) {
    console.warn(`[sync] Unable to upsert into ${table}`, upsertResponse.error);
    return;
  }

  const ids = records.map(record => String(record.id));
  const formattedIds = ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',');

  const deleteResponse = await supabase
    .from(table)
    .delete()
    .eq('user_id', userId)
    .not('id', 'in', `(${formattedIds})`);

  if (deleteResponse.error && deleteResponse.error.code !== 'PGRST116') {
    console.warn(`[sync] Unable to prune ${table}`, deleteResponse.error);
  }
};

const pushJobs = async (jobs: Job[], userId?: string | null): Promise<void> => {
  if (userId && supabase) {
    const rows = jobs.map(job => ({
      id: job.id,
      user_id: userId,
      name: job.name,
      hourly_rate: job.hourlyRate,
      currency: job.currency,
      schedule: job.schedule,
      updated_at: new Date().toISOString(),
    }));

    await upsertSupabaseRecords(JOB_TABLE, rows, userId);
    return;
  }

  if (!backendClient.isConfigured) {
    return noop();
  }

  try {
    await backendClient.post('/sync/jobs', { jobs });
  } catch (error) {
    console.warn('[sync] Unable to push jobs', error);
  }
};

const pushEntries = async (entries: WorkEntry[], userId?: string | null): Promise<void> => {
  if (userId && supabase) {
    const rows = entries.map(entry => ({
      id: entry.id,
      user_id: userId,
      job_id: entry.jobId,
      date: entry.date,
      entry_type: entry.entryType,
      start_time: entry.startTime ?? null,
      end_time: entry.endTime ?? null,
      duration_hours: entry.durationHours ?? null,
      status: entry.status ?? null,
      updated_at: new Date().toISOString(),
    }));

    await upsertSupabaseRecords(ENTRY_TABLE, rows, userId);
    return;
  }

  if (!backendClient.isConfigured) {
    return noop();
  }

  try {
    await backendClient.post('/sync/entries', { entries });
  } catch (error) {
    console.warn('[sync] Unable to push entries', error);
  }
};

const registerReminder = async (
  settings: ReminderSettings & { subscription?: PushSubscriptionJSON | null; userId?: string | null }
) => {
  if (!backendClient.isConfigured) {
    return noop();
  }

  try {
    await backendClient.post('/notifications/register', settings);
  } catch (error) {
    console.warn('[sync] Unable to register reminder preference', error);
  }
};

export const syncService = {
  fetchInitialData,
  pushJobs,
  pushEntries,
  registerReminder,
};
