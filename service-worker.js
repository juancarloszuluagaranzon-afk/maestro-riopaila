// service-worker.js
const CACHE_VERSION = 'v1.9.0'; // ⚡️Incrementa siempre este número en cada actualización
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/maestro.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 📦 Instalar y guardar en caché los archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 🧹 Activar y eliminar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 🌐 Fetch con estrategia “Network first” para CSV y “Cache first” para el resto
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1️⃣ Para CSV → siempre intenta primero en la red
  if (url.pathname.endsWith('.csv')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2️⃣ Para todo lo demás → cache first
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        const clone = fetchResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return fetchResponse;
      });
    })
  );
});

// 🔄 Mensaje para actualización inmediata
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
