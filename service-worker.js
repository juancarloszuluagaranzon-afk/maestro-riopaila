const CACHE_VERSION = 'v1.7.5'; // Incrementa la versión
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;
const BASE = '/';

// Archivos a cachear - INCLUYE EXPLÍCITAMENTE EL CSV
const urlsToCache = [
  BASE,
  BASE + 'index.html',
  BASE + 'maestro.html',
  BASE + 'maestro.csv', // ✅ Asegúrate de que esté aquí
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
        // Usa cache.addAll pero con mejor manejo de errores
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[SW] No se pudo cachear ${url}:`, err);
            });
          })
        );
      })
      .then(() => {
        console.log('[SW] Todos los archivos procesados, activando...');
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Error crítico al cachear:', err))
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
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch - Estrategia más robusta
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejar requests de nuestro origen
  if (url.origin !== location.origin) return;

  // Para el CSV: Network First con fallback a caché
  if (request.url.includes('.csv')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // Si la red responde, actualizar caché
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
              console.log('[SW] CSV actualizado en caché');
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback a caché si la red falla
          const cached = await caches.match(request);
          if (cached) {
            console.log('[SW] Sirviendo CSV desde caché (offline)');
            return cached;
          }
          // Si no hay caché, rechazar
          return Promise.reject(new Error('Offline y sin caché'));
        })
    );
    return;
  }

  // Para otros archivos: Cache First
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Sirviendo desde caché:', request.url);
          return cachedResponse;
        }
        
        return fetch(request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] Error de fetch:', error);
            throw error;
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
