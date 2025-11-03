
import React, { useState, useMemo } from 'react';
import type { WorkLog } from '../hooks/useWorkLog';
import type { WorkEntry } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from './shared/Icons';
import { useI18n } from '../hooks/useI18n';

interface CalendarViewProps {
  workLog: WorkLog;
  onAddEntry: (date: Date) => void;
  onEditEntry: (entry: WorkEntry) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ workLog, onAddEntry, onEditEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t, language } = useI18n();
  
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
    if(window.confirm(t('calendar.deleteConfirm'))){
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
      <div className="grid grid-cols-7 gap-2 md:gap-1 text-center text-[0.7rem] sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
        {dayNames.map(day => <div key={day} className="font-medium p-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border rounded-md border-transparent"></div>)}
        {daysInMonth.map(day => {
          const entriesForDay = workLog.getEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={day.toString()} 
              className={`relative border rounded-xl px-2 py-2 min-h-[110px] sm:min-h-[120px] transition-colors ${isToday ? 'border-primary' : 'border-gray-200 dark:border-gray-700'} hover:bg-blue-50 dark:hover:bg-blue-900/40 flex flex-col`}
            >
              <div className={`flex justify-between items-center ${isToday ? 'font-bold' : ''}`}>
                <span className={`text-base ${isToday ? 'text-white bg-primary rounded-full h-7 w-7 flex items-center justify-center' : 'text-gray-700 dark:text-gray-200'}`}>
                    {day.getDate()}
                </span>
                <button onClick={() => onAddEntry(day)} className="md:hidden text-primary hover:text-blue-700 opacity-50 hover:opacity-100" aria-label={t('app.addEntryAria')}>
                    <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto text-xs mt-2 space-y-1.5">
                {entriesForDay.map(entry => {
                  const display = getEntryDisplay(entry);
                  return (
                    <div 
                      key={entry.id} 
                      onClick={() => onEditEntry(entry)}
                      className="group relative bg-secondary text-white rounded px-2 py-1 cursor-pointer hover:bg-blue-600"
                    >
                        <p className="font-semibold truncate">{display.jobName}</p>
                        <p className="truncate">{display.text}</p>
                        <button onClick={(e) => handleDelete(e, entry.id)} className="absolute top-0 right-0 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="h-3 w-3 text-white"/>
                        </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
