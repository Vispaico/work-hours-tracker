import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../hooks/useI18n';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="space-y-10 text-slate-100">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wide text-slate-200">
                {t('auth.heroEyebrow')}
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                {t('auth.heroHeadline')}
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                {t('auth.heroSubheadline')}
              </p>
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50"
                onClick={() => {
                  setMode('signUp');
                  setError(null);
                  setInfo(null);
                }}
              >
                {t('auth.heroCta')}
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {features.map(feature => (
                <div key={feature.key} className="rounded-2xl bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur">
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-200">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                {t('auth.downloadTitle')}
              </p>
              <p className="mt-2 text-sm text-slate-200">{t('auth.downloadSubtitle')}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                {[1, 2].map(index => (
                  <div
                    key={index}
                    className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-400/50 bg-white/5 text-xs font-semibold uppercase tracking-wide text-slate-300"
                  >
                    {t('auth.downloadPlaceholder')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-colors">
              <header className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-dark dark:text-gray-100 transition-colors">{t('auth.title')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                  {mode === 'signIn'
                    ? t('auth.subtitleSignIn')
                    : t('auth.subtitleSignUp')}
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
            className="w-full px-4 py-2 bg-primary text-white rounded-md disabled:bg-gray-300"
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
      </div>
    </div>
  );
};
