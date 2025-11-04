// service-worker.js
const CACHE_VERSION = 'v1.9.1'; // ⚡️ Incrementa siempre este número con cada actualización
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

const urlsToCache = [
  '/index.html',
  '/', // para compatibilidad en GitHub Pages
  '/maestro.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/service-worker.js'
];

// 📦 INSTALACIÓN → guarda en caché los archivos esenciales
self.addEventListener('install', event => {
  console.log('📦 Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📁 Archivos cacheados:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 🧹 ACTIVACIÓN → elimina cachés antiguas
self.addEventListener('activate', event => {
  console.log('🧹 Activando nueva versión de caché:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 🌐 FETCH → estrategia combinada (Network First para CSV, Cache First para otros)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1️⃣ CSV → “Network First” con fallback a caché o maestro.html si no hay red
  if (url.pathname.endsWith('.csv')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Guarda la respuesta en caché para uso offline posterior
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => 
          caches.match(event.request)
            .then(resp => resp || caches.match('/maestro.html'))
        )
    );
    return;
  }

  // 2️⃣ Otros archivos → “Cache First” con actualización silenciosa
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        const clone = fetchResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return fetchResponse;
      }).catch(() => {
        // Fallback: si falla completamente (por ejemplo, offline total)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// 🔄 MENSAJE → actualizar inmediatamente cuando haya una nueva versión
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🚀 Activando nueva versión del Service Worker inmediatamente');
    self.skipWaiting();
  }
});

