self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push notifications from server
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '📈 Stock Analysis Update';
  const options = {
    body: data.body || 'New analysis published on the vault.',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: true
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let url = event.notification.data?.url || '/';
  // Always open the notification on the public domain, never a tunnel/dev origin.
  // A relative URL would resolve against whatever origin the service worker was
  // registered from (which may be a cloudflared tunnel URL in some tabs).
  const SITE = 'https://stocksfundamentals.online';
  let full;
  try {
    full = new URL(url, SITE).href;   // absolute https URL, or relative → public domain
  } catch {
    full = SITE + '/';
  }
  // Guard: even if a subscriber stored a tunnel/dev origin, point it back to the site.
  if (/\.trycloudflare\.com|localhost|127\.0\.0\.1|\.workers\.dev/.test(full)) {
    const rel = full.split('/').slice(3).join('/');
    full = SITE + '/' + (rel || '');
  }
  url = full;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
