
import type { DayOfWeek } from '../types';

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getFirstDayOfMonth = (year: number, month: number): DayOfWeek => {
  return new Date(year, month, 1).getDay() as DayOfWeek;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatToISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const normalizeToLocalDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const parseISODate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date((year ?? 0), (month ?? 1) - 1, day ?? 1);
};

export const getMonthName = (month: number): string => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month];
};

export const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = new Date(0, 0, 0, startH, startM);
    const end = new Date(0, 0, 0, endH, endM);
    if (end < start) { // handles overnight shifts, assumes next day
        end.setDate(end.getDate() + 1);
    }
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
};
