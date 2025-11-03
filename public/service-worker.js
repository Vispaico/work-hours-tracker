const FALLBACK_TITLE = 'Work Hours Tracker';
const FALLBACK_BODY = 'Any work today to clock?';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  const data = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch (error) {
      console.error('[service-worker] Unable to parse push payload', error);
      return {};
    }
  })();

  const title = data.title || FALLBACK_TITLE;
  const body = data.body || FALLBACK_BODY;
  const options = {
    body,
    tag: 'work-hours-reminder',
    data: data.url ? { url: data.url } : undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const client = allClients.find(c => c.url === targetUrl);

      if (client) {
        return client.focus();
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});
