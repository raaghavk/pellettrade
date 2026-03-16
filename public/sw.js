const CACHE_NAME = 'pellettrade-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  '/favicon.svg',
  '/manifest.json',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Ignore cache errors during install
        console.log('Some resources failed to cache during install');
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls and external resources - always use network
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('supabase') ||
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('analytics')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses for next visit
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return a fallback response if both cache and network fail
        // For HTML pages, return the app shell (index.html)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return null;
      });
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Implement sync logic here if needed
      Promise.resolve()
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PelletTrade';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'pellettrade-notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window with the target URL open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
