import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { CalendarIcon, ChartBarIcon, WandIcon, ExcelExportIcon, XMarkIcon } from './shared/Icons';

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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [demoReady, setDemoReady] = useState(false);

  const openAuthPanel = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setInfo(null);
    setIsAuthOpen(true);
  };

  const closeAuthPanel = () => {
    setIsAuthOpen(false);
    setError(null);
    setInfo(null);
  };

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
        icon: <CalendarIcon className="h-6 w-6 text-sky-200" />,
      },
      {
        key: 'capture',
        title: t('auth.what.capture.title'),
        description: t('auth.what.capture.description'),
        icon: <WandIcon className="h-6 w-6 text-fuchsia-200" />,
      },
      {
        key: 'earnings',
        title: t('auth.what.earnings.title'),
        description: t('auth.what.earnings.description'),
        icon: <ChartBarIcon className="h-6 w-6 text-emerald-200" />,
      },
      {
        key: 'export',
        title: t('auth.what.export.title'),
        description: t('auth.what.export.description'),
        icon: <ExcelExportIcon className="h-6 w-6 text-amber-200" />,
      },
    ],
    [t]
  );

  const previewEntries = useMemo(
    () => [
      { id: 'job-1', job: 'Café Shift', label: 'Morning barista', time: '07:00 – 10:30', gradient: 'from-amber-400 to-rose-500' },
      { id: 'job-2', job: 'Product Design', label: 'Sprint planning', time: '12:00 – 15:30', gradient: 'from-emerald-400 to-teal-500' },
      { id: 'job-3', job: 'Freelance Dev', label: 'Checkout fixes', time: '18:00 – 21:00', gradient: 'from-sky-400 to-indigo-500' },
    ],
    []
  );

  const previewStats = useMemo(
    () => [
      { key: 'hours', label: t('dashboard.stats.totalHours'), value: '8.0h' },
      { key: 'earnings', label: t('dashboard.stats.totalEarnings'), value: '$312' },
      { key: 'jobs', label: t('nav.calendar'), value: '3 gigs' },
    ],
    [t]
  );

  const revealClass = 'reveal';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (elements.length === 0) {
      return;
    }
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.setAttribute('data-revealed', 'true'));
      return;
    }
    elements.forEach((element) => element.setAttribute('data-revealed', 'false'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.setAttribute('data-revealed', 'true');
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    if (!isAuthOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAuthOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthOpen]);

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
      <div className="relative">
        <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span>{t('auth.heroEyebrow')}</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-white/50 hover:text-white"
              onClick={() => openAuthPanel('signIn')}
            >
              {t('auth.signIn')}
            </button>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 lg:pt-16">
          <div className="space-y-16 lg:space-y-20">
            <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-12 text-slate-100">
                <div className={`${revealClass} space-y-6`} data-reveal>
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {t('auth.heroEyebrow')}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                      {t('auth.heroHeadline')}
                    </h1>
                    <p className="mt-4 max-w-2xl text-xl leading-relaxed text-slate-200">
                      {t('auth.heroSubheadline')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:-translate-y-0.5 hover:shadow-sky-400/50"
                      onClick={() => openAuthPanel('signUp')}
                    >
                      {t('auth.heroCta')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                      onClick={() => openAuthPanel('signIn')}
                    >
                      {t('auth.signIn')}
                    </button>
                  </div>
                </div>

                <div className={`${revealClass} rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200`} data-reveal>
                  <p className="text-sm font-semibold text-white">{t('auth.socialProofHeadline')}</p>
                  <p className="mt-1 text-sm text-slate-300">{t('auth.socialProofDetail')}</p>
                </div>

                <div className={`${revealClass} grid gap-4 sm:grid-cols-3`} data-reveal>
                  {heroMetrics.map(metric => {
                    const isHighlight = metric.key === 'accuracy';
                    return (
                      <div
                        key={metric.key}
                        className={`relative rounded-2xl border p-4 ${isHighlight
                          ? 'border-sky-300/40 bg-white/10 shadow-lg shadow-sky-500/30'
                          : 'border-white/10 bg-white/5'
                          }`}
                      >
                        {isHighlight && (
                          <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-sky-400/20 blur-2xl motion-safe:animate-pulse" />
                        )}
                        <p className="text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
                        <p className={`mt-2 font-semibold text-white ${isHighlight ? 'text-4xl sm:text-5xl' : 'text-2xl'}`}>
                          {metric.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">{metric.detail}</p>
                      </div>
                    );
                  })}
                </div>

                <div className={`${revealClass} rounded-3xl border border-white/10 bg-white/5 p-6`} data-reveal>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {t('auth.whatTitle')}
                    </p>
                    <p className="text-sm text-slate-400">{t('auth.heroEyebrow')}</p>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {whatHighlights.map(item => (
                      <div
                        key={item.key}
                        className="group rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-white/30 hover:bg-white/5"
                      >
                        <div className="mb-3 inline-flex rounded-xl bg-white/5 p-3 text-white shadow-sm transition group-hover:scale-105 group-hover:bg-white/10">
                          {item.icon}
                        </div>
                        <p className="text-base font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-base leading-relaxed text-slate-300">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${revealClass} rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/10 p-6`} data-reveal>
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {t('auth.whyTitle')}
                    </p>
                    <span className="text-sm text-slate-400">{t('auth.heroSubheadline')}</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {features.map(feature => (
                      <div key={feature.key} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-base font-semibold text-white">{feature.title}</p>
                        <p className="mt-2 text-base leading-relaxed text-slate-300">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div
                  className={`${revealClass} rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/70 to-slate-900/30 p-6 shadow-2xl shadow-black/40`}
                  data-reveal
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span>{t('auth.demoLabel')}</span>
                    <span className="text-[11px]">{t('auth.demoDuration')}</span>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                    <div className="relative aspect-video">
                      <video
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/demo-poster.jpg"
                        onCanPlay={() => setDemoReady(true)}
                        onError={() => setDemoReady(false)}
                      >
                        <source src="/demo.mp4" type="video/mp4" />
                      </video>
                      {!demoReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 text-center text-sm text-slate-200">
                          <span className="text-sm font-semibold text-white">{t('auth.demoFallbackTitle')}</span>
                          <span className="text-xs text-slate-300">{t('auth.demoFallbackSubtitle')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{t('auth.demoSubtitle')}</p>
                </div>
              </section>
            </div>

            <section
              className={`${revealClass} mx-auto max-w-4xl rounded-3xl border border-white/10 bg-linear-to-b from-slate-900/60 to-slate-900/20 p-6 shadow-2xl shadow-black/40`}
              data-reveal
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                    {t('auth.previewBadge')}
                  </span>
                  <span className="text-xs text-slate-400">{t('auth.previewNote')}</span>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('auth.previewTitle')}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{t('auth.previewHeadline')}</p>
              <div className="mt-6 space-y-4">
                {previewEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.job}</p>
                      <p className="text-xs text-slate-300">{entry.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full bg-linear-to-r ${entry.gradient} px-3 py-1 text-xs font-medium text-white`}>
                        {entry.time}
                      </span>
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
            </section>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 ${isAuthOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isAuthOpen}>
        <div
          className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity ${isAuthOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeAuthPanel}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white p-8 text-dark shadow-2xl transition-transform duration-300 dark:bg-gray-900 dark:text-gray-100 ${isAuthOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
        >
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {mode === 'signIn' ? t('auth.title') : t('auth.signUp')}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300">
                {mode === 'signIn' ? t('auth.subtitleSignIn') : t('auth.subtitleSignUp')}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={closeAuthPanel}
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </header>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
      </div>
    </div>
  );
};
