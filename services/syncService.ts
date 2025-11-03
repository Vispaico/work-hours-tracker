import type { Job, WorkEntry, ReminderSettings } from '../types';
import { backendClient } from './backendClient';

interface SyncPayload {
  jobs: Job[];
  entries: WorkEntry[];
}

const noop = async () => {};

const fetchInitialData = async (): Promise<SyncPayload | null> => {
  if (!backendClient.isConfigured) {
    return null;
  }

  try {
    return await backendClient.get<SyncPayload>('/sync');
  } catch (error) {
    console.warn('[sync] Unable to fetch initial data', error);
    return null;
  }
};

const pushJobs = async (jobs: Job[]): Promise<void> => {
  if (!backendClient.isConfigured) {
    return noop();
  }

  try {
    await backendClient.post('/sync/jobs', { jobs });
  } catch (error) {
    console.warn('[sync] Unable to push jobs', error);
  }
};

const pushEntries = async (entries: WorkEntry[]): Promise<void> => {
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
