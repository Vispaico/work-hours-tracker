
import React, { useState, useMemo } from 'react';
import type { WorkLog } from '../hooks/useWorkLog';
import type { WorkEntry } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils/dateUtils';
import { getJobColor } from '../utils/colorUtils';
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

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDayOfMonth = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const allSlots = [
      ...Array(firstDayOfMonth).fill(null),
      ...daysInMonth
    ];
    const weeksArray: (Date | null)[][] = [];
    for (let i = 0; i < allSlots.length; i += 7) {
      weeksArray.push(allSlots.slice(i, i + 7));
    }
    return weeksArray;
  }, [daysInMonth, firstDayOfMonth]);

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
    setFocusedDay(null); // Reset focus when changing month
  };

  const handleDayClick = (day: Date) => {
    if (focusedDay && isSameDay(day, focusedDay)) {
      // Toggle off if clicking same day? Or maybe just keep it open.
      // User said "once finished or the user closes the 'edit' field", so maybe clicking another day switches focus.
      // Let's allow switching focus.
      return;
    }
    setFocusedDay(day);
  };

  const closeDashboard = () => {
    setFocusedDay(null);
  };

  const focusedEntries = focusedDay ? workLog.getEntriesForDate(focusedDay) : [];

  const getEntryDisplay = (entry: WorkEntry) => {
    const job = workLog.getJobById(entry.jobId);
    const hours = workLog.getEntryHours(entry);
    let text = '';
    if (hours > 0) {
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
    if (window.confirm(t('calendar.deleteConfirm'))) {
      workLog.deleteEntry(entryId);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 md:p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-semibold text-dark dark:text-gray-100 capitalize transition-colors">{monthLabel}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {dayNames.map(day => <div key={day}>{day}</div>)}
      </div>

      {/* Weeks Grid */}
      <div className="space-y-4">
        {weeks.map((week, weekIndex) => {
          // If a day is focused, only show the week containing that day
          const isFocusedWeek = focusedDay && week.some(d => d && isSameDay(d, focusedDay));
          if (focusedDay && !isFocusedWeek) return null;

          return (
            <div key={weekIndex} className="flex flex-col">
              <div className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square"></div>;

                  const entriesForDay = workLog.getEntriesForDate(day);
                  const jobIndicators = Array.from(new Set(entriesForDay.map(entry => entry.jobId))).map(jobId => ({
                    jobId,
                    color: getJobColor(jobId),
                  }));
                  const isToday = isSameDay(day, new Date());
                  const isFocused = focusedDay ? isSameDay(day, focusedDay) : false;
                  const hasEntries = jobIndicators.length > 0;

                  return (
                    <div key={day.toString()} className="flex justify-center items-center aspect-square md:aspect-auto md:h-full">
                      <button
                        onClick={() => handleDayClick(day)}
                        className={`
                          relative flex items-center justify-center transition-all duration-200
                          w-10 h-10 sm:w-12 sm:h-12 rounded-full
                          md:w-full md:h-24 md:rounded-xl md:items-start md:justify-start md:p-2
                          ${isFocused
                            ? 'bg-primary text-white ring-4 ring-primary/20 scale-110 z-10 md:scale-100 md:ring-2'
                            : isToday
                              ? 'bg-blue-100 text-primary dark:bg-blue-900/50 dark:text-blue-200 font-bold'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 md:bg-gray-50 md:dark:bg-gray-800/50'
                          }
                        `}
                      >
                        <span className="z-10">{day.getDate()}</span>
                        {/* Entry Indicator */}
                        {hasEntries && !isFocused && (
                          <div
                            className={`
                              pointer-events-none absolute flex items-center justify-center gap-0.5
                              bottom-1 left-1/2 -translate-x-1/2
                              md:top-2 md:right-2 md:bottom-auto md:left-auto md:translate-x-0
                            `}
                          >
                            {jobIndicators.slice(0, 4).map(({ jobId, color }) => (
                              <span
                                key={jobId}
                                className="block rounded-full w-1.5 h-1.5 md:w-2 md:h-2"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {jobIndicators.length > 4 && (
                              <span
                                className="block rounded-full w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400"
                                aria-hidden="true"
                                title={`+${jobIndicators.length - 4}`}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Inline Dashboard */}
              {isFocusedWeek && focusedDay && (
                <div className="mt-6 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                        {new Intl.DateTimeFormat(language, { weekday: 'long' }).format(focusedDay)}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric' }).format(focusedDay)}
                      </h3>
                    </div>
                    <button
                      onClick={closeDashboard}
                      className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors"
                      aria-label={t('common.close')}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {focusedEntries.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="mb-3">{t('calendar.noEntries')}</p>
                        <button
                          onClick={() => onAddEntry(focusedDay)}
                          className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          {t('entryModal.addButton')}
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {focusedEntries.map(entry => {
                          const display = getEntryDisplay(entry);
                          return (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{display.jobName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{display.text}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onEditEntry(entry)}
                                  className="px-3 py-1.5 text-sm font-medium text-primary bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                  {t('common.edit')}
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, entry.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  aria-label={t('common.delete')}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 flex justify-center">
                          <button
                            onClick={() => onAddEntry(focusedDay)}
                            className="flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            {t('entryModal.addButton')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

