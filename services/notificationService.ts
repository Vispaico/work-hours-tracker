import type { ReminderSettings } from '../types';
import { getFromStorage, saveToStorage } from '../utils/localStorage';
import { syncService } from './syncService';

const REMINDER_STORAGE_KEY = 'work_reminder_settings';
const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  emailEnabled: false,
  time: '19:00',
  lastScheduledAt: null,
};

const SERVICE_WORKER_PATH = '/service-worker.js';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

let serviceWorkerRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
let nextReminderTimeout: number | undefined;

const fallbackTitle = 'Work Hours Tracker';
const fallbackBody = 'Any work today to clock?';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[notifications] Service workers are not supported in this environment.');
    return null;
  }

  if (!serviceWorkerRegistrationPromise) {
    serviceWorkerRegistrationPromise = navigator.serviceWorker
      .register(SERVICE_WORKER_PATH)
      .catch(error => {
        console.error('[notifications] Failed to register service worker', error);
        return null;
      });
  }

  return serviceWorkerRegistrationPromise;
};

const requestPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[notifications] Notification API not supported.');
    return 'denied';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('[notifications] Unable to request permission', error);
    return 'denied';
  }
};

const subscribeToPush = async (registration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
  if (!registration.pushManager) {
    console.warn('[notifications] Push manager not available.');
    return null;
  }

  try {
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn('[notifications] VAPID public key not configured. Skipping push subscription.');
      return null;
    }

    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } catch (error) {
    console.error('[notifications] Failed to subscribe to push notifications', error);
    return null;
  }
};

const unsubscribeFromPush = async () => {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
    return;
  }

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) {
    return;
  }

  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.error('[notifications] Unable to unsubscribe from push', error);
  }
};

const scheduleInPageReminder = (settings: ReminderSettings) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  if (nextReminderTimeout) {
    window.clearTimeout(nextReminderTimeout);
    nextReminderTimeout = undefined;
  }

  const [hours, minutes] = settings.time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return;
  }

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const timeout = target.getTime() - now.getTime();

  nextReminderTimeout = window.setTimeout(() => {
    new Notification(fallbackTitle, {
      body: fallbackBody,
      tag: 'work-hours-reminder',
    });
    scheduleInPageReminder(settings);
  }, timeout);
};

const clearInPageReminder = () => {
  if (nextReminderTimeout && typeof window !== 'undefined') {
    window.clearTimeout(nextReminderTimeout);
    nextReminderTimeout = undefined;
  }
};

const loadReminderSettings = (): ReminderSettings => {
  return getFromStorage<ReminderSettings>(REMINDER_STORAGE_KEY, DEFAULT_REMINDER);
};

const persistReminderSettings = (settings: ReminderSettings) => {
  saveToStorage(REMINDER_STORAGE_KEY, settings);
};

interface ApplyReminderResult {
  settings: ReminderSettings;
  permission: NotificationPermission;
  subscription?: PushSubscriptionJSON | null;
}

const applyReminderSettings = async (
  settings: ReminderSettings,
  userId?: string | null
): Promise<ApplyReminderResult> => {
  if (!settings.enabled) {
    clearInPageReminder();
    await unsubscribeFromPush();
    persistReminderSettings(settings);
    await syncService.registerReminder({ ...settings, subscription: null, userId });
    return { settings, permission: Notification.permission ?? 'default', subscription: null };
  }

  const permission = await requestPermission();
  if (permission !== 'granted') {
    const disabledSettings = { ...settings, enabled: false };
    persistReminderSettings(disabledSettings);
    return { settings: disabledSettings, permission, subscription: null };
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    console.warn('[notifications] Service worker registration unavailable; scheduling in-page reminder only.');
    scheduleInPageReminder(settings);
    persistReminderSettings(settings);
    await syncService.registerReminder({ ...settings, subscription: null, userId });
    return { settings, permission, subscription: null };
  }

  const subscription = await subscribeToPush(registration);

  scheduleInPageReminder(settings);
  persistReminderSettings(settings);
  await syncService.registerReminder({ ...settings, subscription: subscription?.toJSON() ?? null, userId });

  return { settings, permission, subscription: subscription?.toJSON() ?? null };
};

export const notificationService = {
  ensureServiceWorker: registerServiceWorker,
  loadReminderSettings,
  applyReminderSettings,
};
