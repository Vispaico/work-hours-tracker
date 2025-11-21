import React, { useState, useMemo } from 'react';
import { utils, writeFile } from 'xlsx';
import { useI18n } from '../hooks/useI18n';
import type { WorkLog } from '../hooks/useWorkLog';
import { XMarkIcon } from './shared/Icons';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    workLog: WorkLog;
}

type ExportColumn = 'date' | 'job' | 'time' | 'duration' | 'earnings' | 'notes';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, workLog }) => {
    const { t, language } = useI18n();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedJobId, setSelectedJobId] = useState<string>('all');
    const [selectedColumns, setSelectedColumns] = useState<Record<ExportColumn, boolean>>({
        date: true,
        job: true,
        time: true,
        duration: true,
        earnings: true,
        notes: true,
    });

    const months = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(language, { month: 'long' });
        return Array.from({ length: 12 }, (_, i) => {
            const date = new Date(2000, i, 1);
            return { value: i, label: formatter.format(date) };
        });
    }, [language]);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    }, []);

    const handleExport = () => {
        // 1. Filter Entries
        const filteredEntries = workLog.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            const monthMatch = entryDate.getMonth() === selectedMonth;
            const yearMatch = entryDate.getFullYear() === selectedYear;
            const jobMatch = selectedJobId === 'all' || entry.jobId === selectedJobId;
            return monthMatch && yearMatch && jobMatch;
        });

        if (filteredEntries.length === 0) {
            alert(t('common.noEntriesFound') || 'No entries found for the selected period.');
            return;
        }

        // 2. Prepare Data
        const exportData = filteredEntries.map(entry => {
            const job = workLog.jobs.find(j => j.id === entry.jobId);
            const row: any = {};

            if (selectedColumns.date) row['Date'] = entry.date;
            if (selectedColumns.job) row['Job'] = job?.name || 'Unknown Job';
            if (selectedColumns.time) row['Time'] = `${entry.startTime || ''} - ${entry.endTime || ''}`;

            let duration = entry.durationHours || 0;
            if (duration === 0 && entry.startTime && entry.endTime) {
                const [startHour, startMinute] = entry.startTime.split(':').map(Number);
                const [endHour, endMinute] = entry.endTime.split(':').map(Number);
                const start = new Date(0, 0, 0, startHour, startMinute);
                const end = new Date(0, 0, 0, endHour, endMinute);
                let diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
                if (diff < 0) diff += 24; // Handle overnight

                // Deduct break time
                const breakHours = (entry.breakMinutes || 0) / 60;
                duration = Math.max(0, diff - breakHours);
            }

            if (selectedColumns.duration) row['Duration (h)'] = Number(duration.toFixed(2));

            if (selectedColumns.earnings) {
                const rate = job?.hourlyRate || 0;
                const earnings = duration * rate;
                row['Earnings'] = Number(earnings.toFixed(2));
                row['Currency'] = job?.currency || '';
            }

            if (selectedColumns.notes) row['Notes'] = ''; // Placeholder if we add notes later

            return row;
        });

        // 3. Generate Excel
        const ws = utils.json_to_sheet(exportData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Work Log");

        const fileName = `work-log-${selectedYear}-${selectedMonth + 1}.xlsx`;
        writeFile(wb, fileName);

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Data</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Job Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job</label>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Jobs</option>
                            {workLog.jobs.map((job) => (
                                <option key={job.id} value={job.id}>{job.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Columns */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Columns to Export</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(selectedColumns) as ExportColumn[]).map((col) => (
                                <label key={col} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns[col]}
                                        onChange={(e) => setSelectedColumns(prev => ({ ...prev, [col]: e.target.checked }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{col}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>
        </div>
    );
};
