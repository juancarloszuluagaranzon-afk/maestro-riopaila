// ✅ service-worker.js
// Versión actual — CAMBIA este número cada vez que actualices archivos en el repo
const CACHE_VERSION = 'v1.7.1';
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

// ✅ Archivos a cachear
const urlsToCache = [
  '/',             // Página principal
  '/index.html',
  '/maestro.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
  // ❌ No incluyas el CSV, así siempre se carga fresco del servidor
];

// ✅ Instalación
self.addEventListener('install', event => {
  console.log('Instalando nueva versión del SW:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ✅ Activación — limpia versiones antiguas
self.addEventListener('activate', event => {
  console.log('Activando versión:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('🧹 Eliminando caché antigua:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ✅ Estrategia de red
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Para CSV siempre red primero (no usar caché)
  if (url.pathname.endsWith('.csv')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Para los demás, cache-first con fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ✅ Permitir actualización inmediata
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Activando nueva versión del SW inmediatamente...');
    self.skipWaiting();
  }
});
