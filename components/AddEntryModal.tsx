
import React, { useState, useEffect } from 'react';
import type { WorkLog } from '../hooks/useWorkLog';
import { EntryType } from '../types';
import type { WorkEntry, Job } from '../types';
import { formatToISODate, calculateDuration } from '../utils/dateUtils';
import { XMarkIcon, WandIcon } from './shared/Icons';
import { parseWorkLogWithGemini } from '../services/geminiService';
import { useI18n } from '../hooks/useI18n';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workLog: WorkLog;
  selectedDate: Date;
  editingEntry: WorkEntry | null;
}

const AiEntry: React.FC<{ onParse: (data: any) => void, jobs: Job[] }> = ({ onParse, jobs }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useI18n();

  const handleParse = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await parseWorkLogWithGemini(prompt);
      if (result) {
        const jobName = result.jobName as string | undefined;
        const job = jobName ? jobs.find(j => j.name.toLowerCase() === jobName.toLowerCase()) : undefined;

        if (jobName && !job) {
          setError(t('entryModal.ai.jobNotFound', { job: jobName }));
        } else {
          onParse({ ...result, jobId: job?.id });
        }

      } else {
        setError(t('entryModal.ai.unrecognized'));
      }
    } catch (e: any) {
      console.error("Smart Entry Error:", e);
      setError(e.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-t border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 transition-colors">
      <div className="flex items-center space-x-2 mb-2">
        <WandIcon className="h-6 w-6 text-primary" />
        <h3 className="font-semibold text-primary">{t('entryModal.ai.title')}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors">
        {t('entryModal.ai.examples')}
      </p>
      <div className="flex space-x-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('entryModal.ai.placeholder')}
          className="form-input grow dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          disabled={isLoading}
        />
        <button
          onClick={handleParse}
          disabled={isLoading || !prompt}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:bg-gray-400"
        >
          {isLoading ? t('entryModal.ai.parsing') : t('entryModal.ai.parse')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};


export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, workLog, selectedDate, editingEntry }) => {
  const { t, language } = useI18n();
  const [jobId, setJobId] = useState<string>('');
  const [entryType, setEntryType] = useState<EntryType>(EntryType.TimeRange);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [status, setStatus] = useState('worked');

  useEffect(() => {
    if (editingEntry) {
      setJobId(editingEntry.jobId);
      setEntryType(editingEntry.entryType);
      setStartTime(editingEntry.startTime || '');
      setEndTime(editingEntry.endTime || '');
      setBreakMinutes(editingEntry.breakMinutes || '');
      setDuration(editingEntry.durationHours || '');
      setStatus(editingEntry.status || 'worked');
    } else {
      // Reset form
      setJobId(workLog.jobs[0]?.id || '');
      setEntryType(EntryType.TimeRange);
      setStartTime('09:00');
      setEndTime('17:00');
      setBreakMinutes('');
      setDuration('');
      setStatus('worked');
    }
  }, [editingEntry, workLog.jobs, isOpen]);

  const handleAiParse = (data: any) => {
    if (data.jobId) setJobId(data.jobId);
    if (data.entryType) setEntryType(data.entryType);
    if (data.startTime) setStartTime(data.startTime);
    if (data.endTime) setEndTime(data.endTime);
    if (data.durationHours) setDuration(data.durationHours);
    if (data.status) setStatus(data.status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) {
      alert(t('entryModal.selectJobError'));
      return;
    }
    const entryData: Omit<WorkEntry, 'id'> = {
      jobId,
      date: formatToISODate(selectedDate),
      entryType,
      startTime: entryType === EntryType.TimeRange ? startTime : undefined,
      endTime: entryType === EntryType.TimeRange ? endTime : undefined,
      breakMinutes: entryType === EntryType.TimeRange ? Number(breakMinutes) : undefined,
      durationHours: entryType === EntryType.Duration ? Number(duration) : undefined,
      status: entryType === EntryType.Status ? status : undefined,
    };

    if (editingEntry) {
      workLog.updateEntry({ ...entryData, id: editingEntry.id });
    } else {
      workLog.addEntry(entryData);
    }
    onClose();
  };

  const calculatedHours = entryType === EntryType.TimeRange
    ? Math.max(0, calculateDuration(startTime, endTime) - ((Number(breakMinutes) || 0) / 60))
    : 0;
  const headerText = t('entryModal.header', {
    title: editingEntry ? t('entryModal.editTitle') : t('entryModal.addTitle'),
    date: selectedDate.toLocaleDateString(language),
  });
  const typeLabels: Record<EntryType, string> = {
    [EntryType.TimeRange]: t('entryModal.types.timeRange'),
    [EntryType.Duration]: t('entryModal.types.duration'),
    [EntryType.Status]: t('entryModal.types.status'),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-full flex flex-col transition-colors">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-bold text-dark dark:text-gray-100 transition-colors">{headerText}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('common.close')}
            title={t('common.close')}
            type="button"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        <div className="overflow-y-auto">
          <AiEntry onParse={handleAiParse} jobs={workLog.jobs} />

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="job-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('entryModal.job')}</label>
              <select
                id="job-select"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="form-select mt-1 block w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="" disabled>{t('entryModal.selectJob')}</option>
                {workLog.jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">{t('entryModal.entryType')}</label>
              <div className="flex rounded-md shadow-xs">
                {(Object.values(EntryType)).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEntryType(type)}
                    className={`px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium transition-colors ${entryType === type ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                      } ${type === EntryType.TimeRange ? 'rounded-l-md' : ''} ${type === EntryType.Status ? 'rounded-r-md' : ''}`}
                  >
                    {typeLabels[type as EntryType]}
                  </button>
                ))}
              </div>
            </div>

            {entryType === EntryType.TimeRange && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('entryModal.startTime')}</label>
                    <input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="form-input mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  </div>
                  <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('entryModal.endTime')}</label>
                    <input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="form-input mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  </div>
                </div>

                <div>
                  <label htmlFor="break-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Break (minutes)</label>
                  <input
                    id="break-minutes"
                    type="number"
                    min="0"
                    value={breakMinutes}
                    onChange={e => setBreakMinutes(parseFloat(e.target.value) || '')}
                    className="form-input mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    placeholder="e.g., 30"
                  />
                </div>

                {calculatedHours > 0 && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      {t('common.totalHours', { hours: calculatedHours.toFixed(2) })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {entryType === EntryType.Duration && (
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('entryModal.duration')}</label>
                <input id="duration" type="number" step="0.1" value={duration} onChange={e => setDuration(parseFloat(e.target.value) || '')} className="form-input mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g., 8" />
              </div>
            )}

            {entryType === EntryType.Status && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('entryModal.status')}</label>
                <select id="status" value={status} onChange={e => setStatus(e.target.value)} className="form-select mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                  <option value="worked">{t('statuses.worked')}</option>
                  <option value="off">{t('statuses.off')}</option>
                  <option value="holiday">{t('statuses.holiday')}</option>
                  <option value="sick">{t('statuses.sick')}</option>
                </select>
              </div>
            )}

            <footer className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 transition-colors">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                {t('common.cancel')}
              </button>
              <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-emerald-600">
                {editingEntry ? t('entryModal.saveButton') : t('entryModal.addButton')}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
};