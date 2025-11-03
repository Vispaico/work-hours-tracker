
import React, { useState, useMemo } from 'react';
import type { WorkLog } from '../hooks/useWorkLog';
import type { TimePeriod, Currency } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../hooks/useI18n';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow transition-colors">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-dark dark:text-gray-100 transition-colors">{value}</p>
  </div>
);

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  VND: '₫',
};

export const DashboardView: React.FC<{ workLog: WorkLog }> = ({ workLog }) => {
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [selectedJobId, setSelectedJobId] = useState<'all' | string>('all');
  const [date, setDate] = useState(new Date()); // For navigating periods
  const { t, language } = useI18n();

  const totals = useMemo(() => 
    workLog.calculateTotals(period, date, selectedJobId),
    [workLog, period, date, selectedJobId]
  );

  const numberFormatter = useMemo(() => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [language]);
  const integerFormatter = useMemo(() => new Intl.NumberFormat(language, { maximumFractionDigits: 0 }), [language]);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [language]);
  
  const chartData = useMemo(() => {
    return workLog.jobs.map(job => ({
        name: job.name,
        Hours: totals.hoursByJob[job.id] || 0
    }));
  }, [totals, workLog.jobs]);

  const earningsSummary = useMemo(() => {
    const entries = Object.entries(totals.earningsByCurrency);
    if (entries.length === 0) {
      return integerFormatter.format(0);
    }

    return entries
      .map(([currency, value]) => {
        const typedCurrency = currency as Currency;
        const prefix = currencySymbols[typedCurrency] ?? '';
        return `${prefix}${currencyFormatter.format(value ?? 0)} ${currency}`;
      })
      .join(' · ');
  }, [totals.earningsByCurrency, currencyFormatter]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(new Date(e.target.value));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow transition-colors">
        <h2 className="text-xl font-bold text-dark dark:text-gray-100 mb-4 transition-colors">{t('dashboard.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('dashboard.filters.period')}</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as TimePeriod)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="day">{t('dashboard.periodOptions.day')}</option>
              <option value="week">{t('dashboard.periodOptions.week')}</option>
              <option value="month">{t('dashboard.periodOptions.month')}</option>
              <option value="year">{t('dashboard.periodOptions.year')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('dashboard.filters.job')}</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="all">{t('dashboard.allJobs')}</option>
              {workLog.jobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{t('dashboard.filters.date')}</label>
            <input 
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title={t('dashboard.stats.totalHours')} value={numberFormatter.format(totals.totalHours)} />
        <StatCard title={t('dashboard.stats.totalDays')} value={integerFormatter.format(totals.totalDays)} />
        <StatCard title={t('dashboard.stats.totalEarnings')} value={earningsSummary} />
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow h-80 transition-colors">
        <h3 className="text-lg font-semibold text-dark dark:text-gray-100 mb-4 transition-colors">{t('dashboard.chart.title')}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Hours" name={t('dashboard.chart.hoursLabel')} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
