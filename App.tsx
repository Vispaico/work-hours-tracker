
import React, { useState } from 'react';
import { CalendarView } from './components/CalendarView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { AddEntryModal } from './components/AddEntryModal';
import { useWorkLog } from './hooks/useWorkLog';
import { CalendarIcon, ChartBarIcon, CogIcon, PlusIcon, SunIcon, MoonIcon } from './components/shared/Icons';
import type { WorkEntry } from './types';
import { useI18n } from './hooks/useI18n';
import { useAuth } from './contexts/AuthContext';
import { AuthGate } from './components/AuthGate';
import { useTheme } from './contexts/ThemeContext';
import { normalizeToLocalDate, parseISODate } from './utils/dateUtils';

type View = 'calendar' | 'dashboard' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => normalizeToLocalDate(new Date()));
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  const { user, isEnabled: authEnabled, signOut } = useAuth();
  const workLog = useWorkLog(user?.id ?? null);
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  if (authEnabled && !user) {
    return <AuthGate />;
  }

  const openModalForDate = (date: Date) => {
    setSelectedDate(normalizeToLocalDate(date));
    setEditingEntry(null);
    setIsModalOpen(true);
  };
  
  const openModalForEdit = (entry: WorkEntry) => {
    setSelectedDate(parseISODate(entry.date));
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView workLog={workLog} onAddEntry={openModalForDate} onEditEntry={openModalForEdit} />;
      case 'dashboard':
        return <DashboardView workLog={workLog} />;
      case 'settings':
        return <SettingsView workLog={workLog} />;
      default:
        return <CalendarView workLog={workLog} onAddEntry={openModalForDate} onEditEntry={openModalForEdit} />;
    }
  };

  const NavItem = ({ view, label, icon }: { view: View, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
        currentView === view ? 'text-primary' : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen bg-neutral dark:bg-gray-950 flex flex-col font-sans text-dark dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-lg p-4 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-dark dark:text-gray-100 text-center flex-1 md:text-left transition-colors">{t('app.title')}</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={t(theme === 'dark' ? 'settings.theme.switchToLight' : 'settings.theme.switchToDark')}
              title={t('settings.theme.toggle')}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            {authEnabled && user && (
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
                <button
                  onClick={() => void signOut()}
                  className="text-sm text-primary hover:underline"
                >
                  {t('auth.signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto px-4 pt-4 pb-28 md:px-6 md:pt-6 md:pb-32 transition-colors">
        {renderView()}
      </main>

      {currentView === 'calendar' && (
        <div
          className="fixed right-4 z-20"
          style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={() => openModalForDate(new Date())}
            className="bg-primary hover:bg-blue-800 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"
            aria-label={t('app.addEntryAria')}
          >
            <PlusIcon className="h-8 w-8" />
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-t border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] min-h-[4.5rem] z-10 transition-colors">
        <NavItem view="calendar" label={t('nav.calendar')} icon={<CalendarIcon className="h-6 w-6 mb-1" />} />
        <NavItem view="dashboard" label={t('nav.dashboard')} icon={<ChartBarIcon className="h-6 w-6 mb-1" />} />
        <NavItem view="settings" label={t('nav.settings')} icon={<CogIcon className="h-6 w-6 mb-1" />} />
      </nav>

      {isModalOpen && (
        <AddEntryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          workLog={workLog}
          selectedDate={selectedDate}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
};

export default App;
