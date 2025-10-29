// ===============================
// Service Worker - Maestro Riopaila
// Versión: v1.6.2  ⬅️ CORREGIDO
// ===============================
const CACHE_VERSION = 'v1.6.3';
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
  // ⬅️ CAMBIO: skipWaiting() INMEDIATAMENTE
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Guardando recursos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[Service Worker] Error al cachear:', err))
  );
});

// ===============================
// ACTIVACIÓN (limpiar cachés viejas)
// ===============================
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando versión', CACHE_VERSION);
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
    }).then(() => {
      console.log('[Service Worker] Tomando control de todas las páginas');
      return self.clients.claim();
    })
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
      fetch(event.request, { cache: 'no-store' })  // ⬅️ AÑADIDO: no-store
        .then(response => {
          console.log('[Service Worker] CSV cargado desde la red');
          return response;
        })
        .catch(err => {
          console.warn('[Service Worker] Error al cargar CSV:', err);
          // Intentar caché como fallback
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 👉 Otros recursos: Cache First con actualización en background
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Si está en caché, devolverlo pero actualizar en background
      if (cachedResponse) {
        // Actualizar caché en background
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }
      
      // Si no está en caché, traerlo de la red
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});

// ===============================
// MENSAJE: Activar nueva versión
// ===============================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Forzando actualización inmediata');
    self.skipWaiting();
  }
});
