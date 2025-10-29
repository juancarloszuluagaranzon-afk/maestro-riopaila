// ===============================
// Service Worker - Maestro Riopaila
// Versión: v1.6.1
// ===============================

const CACHE_VERSION = 'v1.6.2';
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

// Recursos que se guardan en caché (sin incluir el CSV)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ===============================
// INSTALACIÓN
// ===============================
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando versión', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ===============================
// ACTIVACIÓN (limpiar cachés viejas)
// ===============================
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando y limpiando versiones antiguas...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché obsoleta:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ===============================
// FETCH: Política de red
// ===============================
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 👉 CSV SIEMPRE desde la red (no se guarda en caché)
  if (url.pathname.endsWith('.csv')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          console.log('[Service Worker] CSV actualizado desde la red.');
          return response;
        })
        .catch(() => {
          console.warn('[Service Worker] No hay conexión, no se puede actualizar el CSV.');
          return caches.match(event.request);
        })
    );
    return;
  }

  // 👉 Otros recursos: Cache First
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

// ===============================
// MENSAJE: Activar nueva versión
// ===============================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Actualización forzada.');
    self.skipWaiting();
  }
});

