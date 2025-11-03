
import React, { useState, useMemo } from 'react';
import type { WorkLog } from '../hooks/useWorkLog';
import type { WorkEntry } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, XMarkIcon } from './shared/Icons';
import { useI18n } from '../hooks/useI18n';

interface CalendarViewProps {
  workLog: WorkLog;
  onAddEntry: (date: Date) => void;
  onEditEntry: (entry: WorkEntry) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ workLog, onAddEntry, onEditEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusedDay, setFocusedDay] = useState<Date | null>(null);
  const { t, language } = useI18n();
  const openDayDetail = (date: Date) => {
    setFocusedDay(new Date(date));
  };

  const closeDayDetail = () => {
    setFocusedDay(null);
  };

  const handleAddFromDetail = (date: Date) => {
    onAddEntry(new Date(date));
    closeDayDetail();
  };

  const handleEditFromDetail = (entry: WorkEntry) => {
    onEditEntry(entry);
    closeDayDetail();
  };

  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDayOfMonth = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(new Date(currentYear, currentMonth, 1));
  }, [language, currentMonth, currentYear]);

  const dayNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language, { weekday: 'short' });
    const reference = new Date(Date.UTC(2021, 7, 1)); // Sunday
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(reference);
      date.setUTCDate(reference.getUTCDate() + index);
      return formatter.format(date);
    });
  }, [language]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + delta, 1));
  };
  
  const focusedEntries = focusedDay ? workLog.getEntriesForDate(focusedDay) : [];

  const getEntryDisplay = (entry: WorkEntry) => {
      const job = workLog.getJobById(entry.jobId);
      const hours = workLog.getEntryHours(entry);
      let text = '';
      if(hours > 0) {
          text = `${hours.toFixed(1)}h`;
      } else {
          const statusKey = entry.status?.toLowerCase();
          const knownStatuses = ['worked', 'off', 'holiday', 'sick'];
          text = statusKey && knownStatuses.includes(statusKey)
            ? t(`statuses.${statusKey}`)
            : entry.status || '';
      }
      return {
          jobName: job?.name || t('calendar.unknownJob'),
          text,
      }
  }

  const handleDelete = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();

    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const shouldConfirm = !isTouchDevice;

    if (!shouldConfirm || window.confirm(t('calendar.deleteConfirm'))){
      workLog.deleteEntry(entryId);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 md:p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-semibold text-dark dark:text-gray-100 capitalize transition-colors">{monthLabel}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-3 sm:gap-2 md:gap-1 text-center text-[0.7rem] sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
        {dayNames.map(day => <div key={day} className="font-medium p-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-3 sm:gap-2 md:gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border rounded-md border-transparent"></div>)}
        {daysInMonth.map(day => {
          const entriesForDay = workLog.getEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          const isFocused = focusedDay ? isSameDay(day, focusedDay) : false;
          return (
            <div 
              key={day.toString()} 
              onClick={() => openDayDetail(day)}
              className={`relative border rounded-xl px-3 py-3 min-h-[120px] sm:min-h-[130px] transition-colors ${
                isFocused
                  ? 'border-primary ring-2 ring-primary/40'
                  : isToday
                  ? 'border-primary'
                  : 'border-gray-200 dark:border-gray-700'
              } hover:bg-blue-50 dark:hover:bg-blue-900/40 flex flex-col cursor-pointer`}
            >
              <div className={`flex justify-between items-center ${isToday ? 'font-bold' : ''}`}>
                <span className={`text-base sm:text-lg ${isToday ? 'text-white bg-primary rounded-full h-8 w-8 flex items-center justify-center' : 'text-gray-700 dark:text-gray-200'}`}>
                    {day.getDate()}
                </span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddEntry(day);
                  }}
                  className="md:hidden text-primary hover:text-blue-700 opacity-60 hover:opacity-100"
                  aria-label={t('app.addEntryAria')}
                >
                    <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto text-xs sm:text-sm mt-3 space-y-2 pr-1">
                {entriesForDay.map(entry => {
                  const display = getEntryDisplay(entry);
                  return (
                    <div 
                      key={entry.id} 
                      onClick={(event) => {
                        event.stopPropagation();
                        openDayDetail(day);
                      }}
                      className="group relative bg-secondary text-white rounded px-2 py-1 cursor-pointer hover:bg-blue-600"
                    >
                        <p className="font-semibold truncate">{display.jobName}</p>
                        <p className="truncate">{display.text}</p>
                        <button
                          onClick={(e) => handleDelete(e, entry.id)}
                          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                          aria-label={t('calendar.deleteConfirm')}
                        >
                            <TrashIcon className="h-4 w-4"/>
                        </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {focusedDay && (
        <div
          className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeDayDetail}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {new Intl.DateTimeFormat(language, { weekday: 'long' }).format(focusedDay)}
                </p>
                <h3 className="text-2xl font-semibold text-dark dark:text-gray-100">
                  {new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric', year: 'numeric' }).format(focusedDay)}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDayDetail}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label={t('common.cancel')}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {focusedEntries.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('calendar.noEntries')}
                </p>
              )}

              {focusedEntries.map(entry => {
                const display = getEntryDisplay(entry);
                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-dark dark:text-gray-100">{display.jobName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{display.text}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditFromDetail(entry)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => handleDelete(event, entry.id)}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDayDetail}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleAddFromDetail(focusedDay)}
                className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-blue-800"
              >
                {t('entryModal.addButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
