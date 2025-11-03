
export type Currency = 'USD' | 'EUR' | 'VND';
export type Language = 'en' | 'de' | 'vi' | 'es';

export interface Job {
  id: string;
  name: string;
  hourlyRate: number;
  currency: Currency;
  schedule: DayOfWeek[];
  userId?: string;
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export enum EntryType {
  TimeRange = 'time_range',
  Duration = 'duration',
  Status = 'status',
}

export interface WorkEntry {
  id: string;
  jobId: string;
  date: string; // ISO string for date
  entryType: EntryType;
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  durationHours?: number;
  status?: 'worked' | 'off' | 'holiday' | 'sick' | string; // Allow custom statuses
  userId?: string;
}

export interface CalculatedTotals {
  totalHours: number;
  totalDays: number;
  hoursByJob: { [jobId: string]: number };
  earningsByJob: { [jobId: string]: number };
  earningsByCurrency: Partial<Record<Currency, number>>;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export interface ReminderSettings {
  enabled: boolean;
  time: string;
  lastScheduledAt?: string | null;
}
