// Service Worker for Acessibilidade Orla da Atalaia App
const CACHE_NAME = 'acessibilidade-orla-atalaia-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  '/images/ramp.png',
  '/images/bathroom.png',
  '/images/parking.png',
  '/images/tactile.png',
  '/images/info.png',
  '/images/restaurant.png',
  '/images/playground.png',
  '/images/viewpoint.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/map-shortcut.png',
  '/icons/list-shortcut.png',
  '/screenshots/screen1.png',
  '/screenshots/screen2.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            // Don't cache map tiles to avoid excessive storage usage
            if (!event.request.url.includes('tile.openstreetmap.org')) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, show a fallback page for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle offline map tiles
self.addEventListener('fetch', event => {
  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network request fails, return a placeholder image for map tiles
          return new Response(
            '<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">' +
            '<rect width="100%" height="100%" fill="#f1f1f1"/>' +
            '<text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle">' +
            'Mapa offline' +
            '</text>' +
            '</svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        })
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  }
});

// Function to sync feedback when back online
function syncFeedback() {
  return localforage.getItem('pendingFeedback')
    .then(data => {
      if (!data) return;
      
      return fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          return localforage.removeItem('pendingFeedback');
        }
      });
    });
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
