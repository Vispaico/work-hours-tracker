import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { CalendarIcon, ChartBarIcon, WandIcon, ExcelExportIcon } from './shared/Icons';

type Mode = 'signIn' | 'signUp';

export const AuthGate: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, isAuthenticating, isEnabled } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const features = useMemo(
    () => [
      {
        key: 'tracking',
        title: t('auth.features.tracking.title'),
        description: t('auth.features.tracking.description'),
      },
      {
        key: 'schedule',
        title: t('auth.features.schedule.title'),
        description: t('auth.features.schedule.description'),
      },
      {
        key: 'sync',
        title: t('auth.features.sync.title'),
        description: t('auth.features.sync.description'),
      },
    ],
    [t]
  );

  const heroMetrics = useMemo(
    () => [
      {
        key: 'multiJobs',
        label: t('auth.metrics.multiJobs.label'),
        value: t('auth.metrics.multiJobs.value'),
        detail: t('auth.metrics.multiJobs.detail'),
      },
      {
        key: 'accuracy',
        label: t('auth.metrics.accuracy.label'),
        value: t('auth.metrics.accuracy.value'),
        detail: t('auth.metrics.accuracy.detail'),
      },
      {
        key: 'sync',
        label: t('auth.metrics.sync.label'),
        value: t('auth.metrics.sync.value'),
        detail: t('auth.metrics.sync.detail'),
      },
    ],
    [t]
  );

  const whatHighlights = useMemo(
    () => [
      {
        key: 'planner',
        title: t('auth.what.planner.title'),
        description: t('auth.what.planner.description'),
        icon: <CalendarIcon className="h-5 w-5 text-sky-300" />,
      },
      {
        key: 'capture',
        title: t('auth.what.capture.title'),
        description: t('auth.what.capture.description'),
        icon: <WandIcon className="h-5 w-5 text-rose-300" />,
      },
      {
        key: 'earnings',
        title: t('auth.what.earnings.title'),
        description: t('auth.what.earnings.description'),
        icon: <ChartBarIcon className="h-5 w-5 text-emerald-300" />,
      },
      {
        key: 'export',
        title: t('auth.what.export.title'),
        description: t('auth.what.export.description'),
        icon: <ExcelExportIcon className="h-5 w-5 text-emerald-300" />,
      },
    ],
    [t]
  );

  const previewEntries = useMemo(
    () => [
      { id: 'job-1', job: 'Barrista', label: 'Morning Coffee', time: '06:00 – 10:00', gradient: 'from-rose-400 to-rose-500' },
      { id: 'job-2', job: 'FrontEnd Dev', label: 'Remote Studio Session', time: '12:00 – 15:00', gradient: 'from-emerald-400 to-emerald-500' },
      { id: 'job-3', job: 'Freelance', label: 'German Language Coach', time: '17:00 – 20:00', gradient: 'from-sky-400 to-blue-500' },
    ],
    []
  );

  const previewStats = useMemo(
    () => [
      { key: 'hours', label: t('dashboard.stats.totalHours'), value: '7.5h' },
      { key: 'earnings', label: t('dashboard.stats.totalEarnings'), value: '$248' },
      { key: 'jobs', label: t('nav.calendar'), value: '3 jobs' },
    ],
    [t]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === 'signIn') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setPassword('');
        setInfo(t('auth.checkEmail'));
        setMode('signIn');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isEnabled) {
    return null;
  }

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral dark:bg-gray-950 transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 w-full max-w-sm text-center transition-colors">
          <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[160px]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-10 text-slate-100">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {t('auth.heroEyebrow')}
              </div>
              <div>
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                  {t('auth.heroHeadline')}
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-300">
                  {t('auth.heroSubheadline')}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  className="inline-flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:-translate-y-0.5"
                  onClick={() => {
                    setMode('signUp');
                    setError(null);
                    setInfo(null);
                  }}
                >
                  {t('auth.heroCta')}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40"
                  onClick={() => {
                    setMode('signIn');
                    setError(null);
                    setInfo(null);
                  }}
                >
                  {t('auth.signIn')}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {heroMetrics.map(metric => (
                <div key={metric.key} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/10">
                  <p className="text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  {t('auth.whatTitle')}
                </p>
                <p className="text-sm text-slate-400">{t('auth.heroEyebrow')}</p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {whatHighlights.map(item => (
                  <div key={item.key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="mb-3 inline-flex rounded-xl bg-white/5 p-2 text-white">
                      {item.icon}
                    </div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/10 p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  {t('auth.whyTitle')}
                </p>
                <span className="text-xs text-slate-400">{t('auth.heroSubheadline')}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map(feature => (
                  <div key={feature.key} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-linear-to-b from-slate-900/60 to-slate-900/20 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t('nav.calendar')}</span>
                <span>{t('auth.metrics.sync.value')}</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-white">Today</p>
              <div className="mt-6 space-y-4">
                {previewEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.job}</p>
                      <p className="text-xs text-slate-300">{entry.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full bg-linear-to-r ${entry.gradient} px-3 py-1 text-xs font-medium text-white`}>{entry.time}</span>
                      <span className="h-2 w-2 rounded-full bg-white/80" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {previewStats.map(stat => (
                  <div key={stat.key} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 text-dark shadow-xl dark:bg-gray-900 dark:text-gray-100">
              <header className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">{t('auth.title')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {mode === 'signIn' ? t('auth.subtitleSignIn') : t('auth.subtitleSignUp')}
                </p>
              </header>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              {t('auth.emailLabel')}
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              {t('auth.passwordLabel')}
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input mt-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition disabled:bg-gray-300"
            disabled={submitting}
          >
            {submitting
              ? t('auth.submitting')
              : mode === 'signIn'
                ? t('auth.signIn')
                : t('auth.signUp')}
          </button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300 transition-colors">
                {mode === 'signIn' ? (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setMode('signUp');
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    {t('auth.switchToSignUp')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setMode('signIn');
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    {t('auth.switchToSignIn')}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-5 text-center text-sm text-slate-300">
              <p className="font-semibold text-white">{t('auth.downloadTitle')}</p>
              <p className="mt-2 text-slate-300">{t('auth.downloadSubtitle')}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">{t('auth.downloadPlaceholder')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
