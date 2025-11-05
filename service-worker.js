const CACHE_VERSION = 'v1.7.4';
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;

// ⚠️ Ajusta según tu estructura de carpetas
// Si está en raíz: const BASE = '/';
// Si está en subdirectorio: const BASE = '/maestro-riopaila/';
const BASE = '/'; 

const urlsToCache = [
  BASE,
  BASE + 'index.html',
  BASE + 'maestro.html',
  BASE + 'maestro.csv',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
];

// Instalar
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Error al cachear:', err))
  );
});

// Activar
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorar requests externos
  if (url.origin !== location.origin) return;

  // CSV: Cache first con revalidación en background
  if (request.url.includes('.csv')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => null);

        // Devolver caché inmediatamente, actualizar en background
        return cachedResponse || fetchPromise || Promise.reject('Sin conexión y sin caché');
      })
    );
    return;
  }

  // Resto: Cache first
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        console.log('[SW] Sirviendo desde caché:', request.url);
        return response;
      }
      
      return fetch(request).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return networkRes;
      });
    })
  );
});

// Actualizar inmediatamente
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Activación forzada');
    self.skipWaiting();
  }
});
