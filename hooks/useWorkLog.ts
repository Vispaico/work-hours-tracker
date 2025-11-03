
import { useState, useEffect, useCallback } from 'react';
import type { Job, WorkEntry, CalculatedTotals, TimePeriod, Currency } from '../types';
import { EntryType, DayOfWeek } from '../types';
import { getFromStorage, saveToStorage } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';
import { calculateDuration } from '../utils/dateUtils';
import { syncService } from '../services/syncService';

const defaultCurrency: Currency = 'USD';

const defaultJobs: Job[] = [
  {
    id: 'job-1',
    name: 'Job 1',
    hourlyRate: 25,
    currency: defaultCurrency,
    schedule: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
  },
  {
    id: 'job-2',
    name: 'Job 2',
    hourlyRate: 30,
    currency: defaultCurrency,
    schedule: [DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday],
  },
];

const normalizeJob = (job: Job): Job => ({
  ...job,
  currency: job.currency ?? defaultCurrency,
  schedule: job.schedule ?? [],
});

export const useWorkLog = (userId?: string | null) => {
  const jobsStorageKey = userId ? `work_jobs_${userId}` : 'work_jobs';
  const entriesStorageKey = userId ? `work_entries_${userId}` : 'work_entries';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [syncInitialized, setSyncInitialized] = useState(!userId);

  useEffect(() => {
    const initialJobs = getFromStorage<Job[]>(jobsStorageKey, userId ? [] : defaultJobs)
      .map(normalizeJob)
      .map(job => (userId ? { ...job, userId } : job));

    const initialEntries = getFromStorage<WorkEntry[]>(entriesStorageKey, []).map(entry =>
      userId ? { ...entry, userId } : entry
    );

    setJobs(initialJobs);
    setEntries(initialEntries);
    setSyncInitialized(!userId);
  }, [jobsStorageKey, entriesStorageKey, userId]);

  useEffect(() => {
    saveToStorage(jobsStorageKey, jobs);
  }, [jobs, jobsStorageKey]);

  useEffect(() => {
    saveToStorage(entriesStorageKey, entries);
  }, [entries, entriesStorageKey]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;
    setSyncInitialized(false);

    (async () => {
      const remote = await syncService.fetchInitialData();
      if (cancelled) {
        return;
      }

      if (remote) {
        if (Array.isArray(remote.jobs)) {
          setJobs(
            remote.jobs.map(job =>
              normalizeJob({ ...job, userId: userId ?? job.userId } as Job)
            )
          );
        }

        if (Array.isArray(remote.entries)) {
          setEntries(
            remote.entries.map(entry => ({ ...entry, userId: userId ?? entry.userId }))
          );
        }
      }

      setSyncInitialized(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!syncInitialized || !userId) {
      return;
    }

    const jobsWithUser = jobs.map(job => (job.userId ? job : { ...job, userId }));
    void syncService.pushJobs(jobsWithUser);
  }, [jobs, syncInitialized, userId]);

  useEffect(() => {
    if (!syncInitialized || !userId) {
      return;
    }

    const entriesWithUser = entries.map(entry => (entry.userId ? entry : { ...entry, userId }));
    void syncService.pushEntries(entriesWithUser);
  }, [entries, syncInitialized, userId]);

  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob = normalizeJob({ ...job, id: uuidv4(), userId: userId ?? job.userId } as Job);
    setJobs(prev => [...prev, newJob]);
  };

  const updateJob = (updatedJob: Job) => {
    const nextJob = normalizeJob({ ...updatedJob, userId: userId ?? updatedJob.userId });
    setJobs(prev => prev.map(job => (job.id === updatedJob.id ? nextJob : job)));
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    setEntries(prev => prev.filter(entry => entry.jobId !== jobId));
  };

  const addEntry = (entry: Omit<WorkEntry, 'id'>) => {
    const newEntry: WorkEntry = { ...entry, id: uuidv4(), userId: userId ?? entry.userId };
    setEntries(prev => [...prev, newEntry]);
  };

  const updateEntry = (updatedEntry: WorkEntry) => {
    const nextEntry: WorkEntry = { ...updatedEntry, userId: userId ?? updatedEntry.userId };
    setEntries(prev => prev.map(entry => (entry.id === updatedEntry.id ? nextEntry : entry)));
  };

  const deleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const getEntriesForDate = useCallback(
    (date: Date) => {
      const isoDate = date.toISOString().split('T')[0];
      return entries.filter(entry => entry.date === isoDate);
    },
    [entries]
  );

  const getJobById = useCallback(
    (jobId: string) => jobs.find(job => job.id === jobId),
    [jobs]
  );

  const getEntryHours = useCallback((entry: WorkEntry): number => {
    switch (entry.entryType) {
      case EntryType.TimeRange:
        return calculateDuration(entry.startTime!, entry.endTime!);
      case EntryType.Duration:
        return entry.durationHours || 0;
      case EntryType.Status:
        return entry.status?.toLowerCase() === 'worked' ? 8 : 0;
      default:
        return 0;
    }
  }, []);

  const calculateTotals = useCallback(
    (period: TimePeriod, date: Date, selectedJobId: string | 'all'): CalculatedTotals => {
      let startDate: Date;
      let endDate: Date;

      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      switch (period) {
        case 'day':
          startDate = new Date(year, month, day);
          endDate = new Date(year, month, day, 23, 59, 59);
          break;
        case 'week': {
          const firstDayOfWeek = new Date(date);
          firstDayOfWeek.setDate(day - date.getDay());
          startDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate());
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59);
          break;
        }
        case 'month':
          startDate = new Date(year, month, 1);
          endDate = new Date(year, month + 1, 0, 23, 59, 59);
          break;
        case 'year':
        default:
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31, 23, 59, 59);
          break;
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const filteredEntries = entries.filter(entry => {
        const entryDate = entry.date;
        const jobMatch = selectedJobId === 'all' || entry.jobId === selectedJobId;
        return entryDate >= startStr && entryDate <= endStr && jobMatch;
      });

      let totalHours = 0;
      const hoursByJob: Record<string, number> = {};
      const workedDays = new Set<string>();

      filteredEntries.forEach(entry => {
        const hours = getEntryHours(entry);
        if (hours > 0) {
          workedDays.add(entry.date);
        }
        totalHours += hours;

        if (!hoursByJob[entry.jobId]) {
          hoursByJob[entry.jobId] = 0;
        }
        hoursByJob[entry.jobId] += hours;
      });

      const relevantJobs = selectedJobId === 'all' ? jobs : jobs.filter(job => job.id === selectedJobId);

      const earningsByJob: Record<string, number> = {};
      const earningsByCurrency: Partial<Record<Currency, number>> = {};

      relevantJobs.forEach(job => {
        const hours = hoursByJob[job.id] || 0;
        if (hours <= 0) {
          return;
        }

        const earnings = hours * job.hourlyRate;
        earningsByJob[job.id] = earnings;
        earningsByCurrency[job.currency] = (earningsByCurrency[job.currency] ?? 0) + earnings;
      });

      return {
        totalHours,
        totalDays: workedDays.size,
        hoursByJob,
        earningsByJob,
        earningsByCurrency,
      };
    },
    [entries, jobs, getEntryHours]
  );

  return {
    jobs,
    entries,
    addJob,
    updateJob,
    deleteJob,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForDate,
    getJobById,
    getEntryHours,
    calculateTotals,
  };
};

export type WorkLog = ReturnType<typeof useWorkLog>;
