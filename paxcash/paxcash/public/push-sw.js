self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'PaxCash Notification';
    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      data: data.data || {},
      actions: data.actions || []
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // fallback for non-JSON payloads
    event.waitUntil(self.registration.showNotification('PaxCash', {
      body: event.data ? event.data.text() : '',
    }));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });
    let client = allClients.find(c => c.url.includes(self.location.origin));
    if (client) {
      client.focus();
      client.postMessage({ type: 'notification_action', action, data: event.notification.data });
      client.navigate(targetUrl);
    } else {
      clients.openWindow(targetUrl);
    }
  })());
});


