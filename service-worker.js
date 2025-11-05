const CACHE_VERSION = 'v1.9.5';
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

const BASE = '/maestro-riopaila/'; // 👈 IMPORTANTÍSIMO

const urlsToCache = [
  BASE,
  BASE + 'index.html',
  BASE + 'maestro.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
];

// Instalar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {
  const request = event.request;

  // CSV: Network first
  if (request.url.endsWith('.csv')) {
    event.respondWith(
      fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Resto: Cache first
  event.respondWith(
    caches.match(request).then(response =>
      response || fetch(request).then(networkRes => {
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return networkRes;
      })
    )
  );
});

// Actualizar inmediatamente
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
