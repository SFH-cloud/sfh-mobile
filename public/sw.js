// SFH Operations — Service Worker for Web Push Notifications
const CACHE = 'sfh-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Handle incoming push notification
self.addEventListener('push', e => {
  if (!e.data) return;
  let data;
  try { data = e.data.json(); } catch { data = { title: 'SFH Operations', body: e.data.text() }; }

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'sfh-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/', taskId: data.taskId || null },
    actions: data.actions || [],
  };

  e.waitUntil(self.registration.showNotification(data.title || 'SFH Operations', options));
});

// Handle notification click — open app and navigate
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', taskId: e.notification.data?.taskId });
          return;
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
