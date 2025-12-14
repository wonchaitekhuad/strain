/**
 * Service Worker for STRIAN
 * Provides offline caching for static resources
 */

const CACHE_NAME = 'strian-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/kickstart.min.css',
  '/js/jquery-3.6.0.min.js',
  '/js/jquery-ui.min.js',
  '/js/svg.min.js',
  '/js/chat.min.js',
  '/js/solver.32.min.js',
  '/js/sections.min.js',
  '/js/offline-features.js',
  '/fonts/Glyphter.eot',
  '/fonts/Glyphter.ttf',
  '/images/Glyphter.svg',
  '/images/StrianIcon_Transp_48x48.ico'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cache URLs individually to track failures
        const cachePromises = urlsToCache.map(url => {
          return cache.add(new Request(url, { cache: 'reload' }))
            .catch(err => {
              console.error('Failed to cache resource:', url, err);
              // Don't reject - allow partial caching
            });
        });
        return Promise.all(cachePromises);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              // Only cache GET requests
              if (event.request.method === 'GET') {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Network request failed, return offline page if available
          return caches.match('/index.html');
        });
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
