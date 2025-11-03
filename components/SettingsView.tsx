
import React, { useEffect, useMemo, useState } from 'react';
import type { WorkLog } from '../hooks/useWorkLog';
import { DayOfWeek, type Job, type Language, type Currency, type ReminderSettings } from '../types';
import { TrashIcon } from './shared/Icons';
import { useI18n } from '../hooks/useI18n';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const currencyOptions: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'VND', label: 'VND', symbol: '₫' },
];

const currencySymbolMap = currencyOptions.reduce<Record<Currency, string>>((acc, option) => {
  acc[option.value] = option.symbol;
  return acc;
}, {} as Record<Currency, string>);

export const SettingsView: React.FC<{ workLog: WorkLog }> = ({ workLog }) => {
  const { t, language, setLanguage, languageOptions: availableLanguages } = useI18n();
  const { user } = useAuth();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({ name: '', hourlyRate: '', currency: 'USD' as Currency });
  const [reminders, setReminders] = useState<ReminderSettings>(() => notificationService.loadReminderSettings());
  const [reminderUpdating, setReminderUpdating] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const dayOptions = useMemo(() => {
      const shortFormatter = new Intl.DateTimeFormat(language, { weekday: 'short' });
      const longFormatter = new Intl.DateTimeFormat(language, { weekday: 'long' });
      return (Object.values(DayOfWeek) as Array<DayOfWeek | string>)
        .filter((value): value is DayOfWeek => typeof value === 'number')
        .map((value) => {
          const reference = new Date(Date.UTC(2021, 7, 1));
          reference.setUTCDate(reference.getUTCDate() + value);
          return {
            value,
            short: shortFormatter.format(reference),
            full: longFormatter.format(reference),
          };
        });
  }, [language]);

  useEffect(() => {
    void notificationService.ensureServiceWorker();
  }, []);

  const applyReminder = async (nextSettings: ReminderSettings, showPermissionWarning = false) => {
    setReminderUpdating(true);
    setReminderError(null);

    try {
      const result = await notificationService.applyReminderSettings(nextSettings, user?.id);
      setReminders(result.settings);

      if (showPermissionWarning && result.settings.enabled && result.permission !== 'granted') {
        setReminderError(t('settings.notifications.permissionDenied'));
      }
    } catch (error) {
      console.error('[settings] Failed to update reminder', error);
      setReminderError(t('settings.notifications.updateError'));
      setReminders(notificationService.loadReminderSettings());
    } finally {
      setReminderUpdating(false);
    }
  };

  useEffect(() => {
    if (reminders.enabled) {
      void applyReminder(reminders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleReminderToggle = async (enabled: boolean) => {
    const next = { ...reminders, enabled };
    await applyReminder(next, true);
  };

  const handleReminderTimeChange = async (time: string) => {
    const next = { ...reminders, time };
    setReminders(next);
    await applyReminder(next);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob({ ...job });
  };
  
  const handleSaveJob = () => {
    if (editingJob) {
      workLog.updateJob(editingJob);
      setEditingJob(null);
    }
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (newJob.name && newJob.hourlyRate) {
      workLog.addJob({ name: newJob.name, hourlyRate: parseFloat(newJob.hourlyRate), currency: newJob.currency, schedule: [] });
      setNewJob({ name: '', hourlyRate: '', currency: newJob.currency });
    }
  };

  const handleScheduleChange = (day: DayOfWeek) => {
      if(editingJob) {
          const newSchedule = editingJob.schedule.includes(day)
            ? editingJob.schedule.filter(d => d !== day)
            : [...editingJob.schedule, day];
          setEditingJob({ ...editingJob, schedule: newSchedule });
      }
  }

  return (
    <div className="space-y-8">
      {/* Job Management */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow transition-colors">
        <h2 className="text-xl font-bold text-dark dark:text-gray-100 mb-4 transition-colors">{t('settings.jobs.title')}</h2>
        <div className="space-y-4">
          {workLog.jobs.map(job => (
            <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-3 rounded-md transition-colors">
              {editingJob?.id === job.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingJob.name}
                    onChange={(e) => setEditingJob({ ...editingJob, name: e.target.value })}
                    className="form-input w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder={t('settings.jobs.nameLabel')}
                  />
                  <input
                    type="number"
                    value={editingJob.hourlyRate}
                    onChange={(e) => setEditingJob({ ...editingJob, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="form-input w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder={t('settings.jobs.rateLabel')}
                  />
                  <select
                    value={editingJob.currency}
                    onChange={(e) => setEditingJob({ ...editingJob, currency: e.target.value as Currency })}
                    className="form-select w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    aria-label={t('settings.jobs.currencyLabel')}
                  >
                    {currencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">{t('settings.jobs.schedule')}</p>
                    <div className="flex space-x-1 flex-wrap gap-1">
                        {dayOptions.map(({ value, short, full }) => (
                            <button
                                key={value}
                                onClick={() => handleScheduleChange(value)}
                                className={`h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                                    editingJob.schedule.includes(value) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                                title={full}
                            >
                                {short}
                            </button>
                        ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setEditingJob(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm transition-colors">{t('common.cancel')}</button>
                    <button onClick={handleSaveJob} className="px-4 py-2 bg-primary text-white rounded-md text-sm">{t('common.save')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{job.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{`${t('settings.jobs.rateDisplay', { amount: `${currencySymbolMap[job.currency]}${job.hourlyRate.toFixed(2)}` })} (${job.currency})`}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                     <button onClick={() => handleEditJob(job)} className="px-3 py-1 bg-secondary text-white rounded-md text-sm">{t('common.edit')}</button>
                     <button onClick={() => workLog.deleteJob(job.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors">
                         <TrashIcon className="h-5 w-5"/>
                     </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAddJob} className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 transition-colors">
            <h3 className="font-semibold">{t('settings.jobs.addTitle')}</h3>
            <input
                type="text"
                value={newJob.name}
                onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                className="form-input w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                placeholder={t('settings.jobs.nameLabel')}
            />
            <input
                type="number"
                value={newJob.hourlyRate}
                onChange={(e) => setNewJob({ ...newJob, hourlyRate: e.target.value })}
                className="form-input w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                placeholder={t('settings.jobs.rateLabel')}
            />
            <select
                value={newJob.currency}
                onChange={(e) => setNewJob({ ...newJob, currency: e.target.value as Currency })}
                className="form-select w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                aria-label={t('settings.jobs.currencyLabel')}
            >
                {currencyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <button type="submit" className="w-full px-4 py-2 bg-accent text-white rounded-md">{t('settings.jobs.addButton')}</button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow transition-colors">
        <h2 className="text-xl font-bold text-dark dark:text-gray-100 mb-4 transition-colors">{t('settings.language.title')}</h2>
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('settings.language.label')}</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          {availableLanguages.map(option => (
            <option key={option.code} value={option.code}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow transition-colors">
        <h2 className="text-xl font-bold text-dark dark:text-gray-100 mb-4 transition-colors">{t('settings.notifications.title')}</h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300 transition-colors">{t('settings.notifications.reminderLabel')}</span>
          <div className="flex items-center space-x-4">
              <input
                type="time"
                value={reminders.time}
                onChange={(e) => void handleReminderTimeChange(e.target.value)}
                disabled={!reminders.enabled || reminderUpdating}
                className="form-input disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                aria-label={t('settings.notifications.reminderLabel')}
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.enabled}
                  onChange={(e) => void handleReminderToggle(e.target.checked)}
                  disabled={reminderUpdating}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
          </div>
        </div>
        {reminders.enabled && !reminderError && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors">{t('settings.notifications.reminderNote', { time: reminders.time })}</p>
        )}
        {reminderError && <p className="text-sm text-red-500 mt-2">{reminderError}</p>}
      </div>
    </div>
  );
};