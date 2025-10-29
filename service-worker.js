// service-worker.js
const CACHE_VERSION = 'v1.2.0'; // CAMBIAR ESTE NÚMERO CON CADA ACTUALIZACIÓN
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192.png'
  // NO incluir el CSV aquí para que siempre se cargue fresco
];

// Instalar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - estrategia Network First para CSV
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Si es el CSV, siempre ir a la red primero
  if (url.pathname.includes('.csv')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Para otros recursos, cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Escuchar mensajes para actualización inmediata
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
