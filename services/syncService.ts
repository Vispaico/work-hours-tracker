import type { Job, WorkEntry, ReminderSettings, Currency } from '../types';
import { EntryType } from '../types';
import { backendClient } from './backendClient';
import { supabase } from './supabaseClient';

interface SyncPayload {
  jobs: Job[];
  entries: WorkEntry[];
  reminderSettings?: ReminderSettings;
}

const noop = async () => { };
const METADATA_KEY = 'workHoursTracker';

const sanitizeCurrency = (currency: unknown): Currency => {
  const valid: Currency[] = ['USD', 'EUR', 'VND'];
  return valid.includes(currency as Currency) ? (currency as Currency) : 'USD';
};

const sanitizeJob = (job: any, userId?: string | null): Job | null => {
  if (!job || typeof job !== 'object') {
    return null;
  }

  const { id, name } = job as { id?: unknown; name?: unknown };
  if (typeof id !== 'string' || typeof name !== 'string') {
    return null;
  }

  const hourlyRateValue = Number((job as { hourlyRate?: unknown }).hourlyRate);
  const scheduleValue = Array.isArray(job.schedule)
    ? (job.schedule as unknown[]).filter((day): day is number => typeof day === 'number')
    : [];

  return {
    id,
    name,
    hourlyRate: Number.isFinite(hourlyRateValue) ? hourlyRateValue : 0,
    currency: sanitizeCurrency((job as { currency?: unknown }).currency),
    schedule: scheduleValue,
    userId: userId ?? (typeof job.userId === 'string' ? job.userId : undefined),
  };
};

const sanitizeEntry = (entry: any, userId?: string | null): WorkEntry | null => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const { id, jobId, date, entryType } = entry as {
    id?: unknown;
    jobId?: unknown;
    date?: unknown;
    entryType?: unknown;
  };

  if (typeof id !== 'string' || typeof jobId !== 'string' || typeof date !== 'string' || typeof entryType !== 'string') {
    return null;
  }

  const validEntryTypes: EntryType[] = [EntryType.TimeRange, EntryType.Duration, EntryType.Status];
  if (!validEntryTypes.includes(entryType as EntryType)) {
    return null;
  }

  const normalized: WorkEntry = {
    id,
    jobId,
    date,
    entryType: entryType as EntryType,
    userId: userId ?? (typeof entry.userId === 'string' ? entry.userId : undefined),
  };

  if (typeof entry.startTime === 'string') {
    normalized.startTime = entry.startTime;
  }

  if (typeof entry.endTime === 'string') {
    normalized.endTime = entry.endTime;
  }

  if (typeof entry.durationHours === 'number') {
    normalized.durationHours = entry.durationHours;
  } else if (typeof entry.durationHours === 'string') {
    const parsed = Number(entry.durationHours);
    if (Number.isFinite(parsed)) {
      normalized.durationHours = parsed;
    }
  }

  if (typeof entry.status === 'string') {
    normalized.status = entry.status;
  }

  return normalized;
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
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      if (error) {
        throw error;
      }
      return { jobs: [], entries: [] };
    }

    const metadata = (data.user.user_metadata ?? {})[METADATA_KEY];
    if (!metadata || typeof metadata !== 'object') {
      return { jobs: [], entries: [] };
    }

    const jobs = Array.isArray((metadata as { jobs?: unknown }).jobs)
      ? ((metadata as { jobs?: unknown[] }).jobs ?? [])
        .map(job => sanitizeJob(job, userId))
        .filter(Boolean) as Job[]
      : [];

    const entries = Array.isArray((metadata as { entries?: unknown }).entries)
      ? ((metadata as { entries?: unknown[] }).entries ?? [])
        .map(entry => sanitizeEntry(entry, userId))
        .filter(Boolean) as WorkEntry[]
      : [];

    const reminderSettings = (metadata as { reminderSettings?: unknown }).reminderSettings as ReminderSettings | undefined;

    return { jobs, entries, reminderSettings };
  } catch (err) {
    console.warn('[sync] Unable to fetch data from Supabase metadata', err);
    return null;
  }
};

const pushData = async (payload: SyncPayload, userId?: string | null): Promise<void> => {
  if (userId && supabase) {
    try {
      // We need to fetch existing metadata to preserve reminderSettings if not provided in payload,
      // OR we assume payload has everything.
      // Usually pushData is called with full state.

      const serialized = {
        jobs: payload.jobs.map(job => ({
          id: job.id,
          name: job.name,
          hourlyRate: job.hourlyRate,
          currency: job.currency,
          schedule: job.schedule ?? [],
        })),
        entries: payload.entries.map(entry => ({
          id: entry.id,
          jobId: entry.jobId,
          date: entry.date,
          entryType: entry.entryType,
          startTime: entry.startTime ?? null,
          endTime: entry.endTime ?? null,
          durationHours: entry.durationHours ?? null,
          status: entry.status ?? null,
        })),
        reminderSettings: payload.reminderSettings,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase.auth.updateUser({
        data: {
          [METADATA_KEY]: serialized,
        },
      });

      if (error) {
        throw error;
      }

      return;
    } catch (error) {
      console.warn('[sync] Unable to persist data to Supabase metadata', error);
      // fall back to backend if configured
    }
  }

  if (!backendClient.isConfigured) {
    return noop();
  }

  try {
    await Promise.all([
      backendClient.post('/sync/jobs', { jobs: payload.jobs }),
      backendClient.post('/sync/entries', { entries: payload.entries }),
      // Backend might not support reminderSettings yet, but we are focusing on Supabase
    ]);
  } catch (error) {
    console.warn('[sync] Unable to push data via backend API', error);
  }
};

const registerReminder = async (
  settings: ReminderSettings & { subscription?: PushSubscriptionJSON | null; userId?: string | null }
) => {
  const { userId, ...rest } = settings;

  if (userId && supabase) {
    try {
      // Fetch current metadata to merge
      const { data: userData } = await supabase.auth.getUser();
      const currentMetadata = (userData.user?.user_metadata ?? {})[METADATA_KEY] || {};

      const updatedMetadata = {
        ...currentMetadata,
        reminderSettings: rest,
        updatedAt: new Date().toISOString(),
      };

      await supabase.auth.updateUser({
        data: {
          [METADATA_KEY]: updatedMetadata,
        },
      });
      return;
    } catch (error) {
      console.warn('[sync] Unable to register reminder preference to Supabase', error);
    }
  }

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
  pushData,
  registerReminder,
};
