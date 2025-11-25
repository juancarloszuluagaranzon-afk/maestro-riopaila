const CACHE_VERSION = 'v1.7.7';
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;
const BASE = '/';

// Archivos CRÍTICOS que deben cachearse inmediatamente
const CRITICAL_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'maestro.html', 
  BASE + 'maestro.csv', // ✅ CRÍTICO - debe estar aquí
  BASE + 'manifest.json',
  BASE + 'service-worker.js', // ✅ IMPORTANTE - incluirse a sí mismo
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

// Instalar - Estrategia más agresiva para cachear
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión', CACHE_VERSION, 'con URLs:', CRITICAL_URLS);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos críticos...');
        // Estrategia: cachear TODOS los archivos críticos sin importar errores
        return Promise.allSettled(
          CRITICAL_URLS.map(url => {
            return fetch(url, { cache: 'reload' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                throw new Error(`HTTP ${response.status} for ${url}`);
              })
              .catch(err => {
                console.warn(`[SW] No se pudo cachear ${url}:`, err.message);
                // No rechazamos la promesa, continuamos con otros archivos
                return Promise.resolve();
              });
          })
        ).then(results => {
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          console.log(`[SW] Cacheo completado: ${successful} exitosos, ${failed} fallidos`);
        });
      })
      .then(() => {
        console.log('[SW] Activando inmediatamente...');
        return self.skipWaiting(); // ⚡ Activación inmediata
      })
      .catch(err => {
        console.error('[SW] Error crítico en instalación:', err);
      })
  );
});

// Activar - Limpiar caches viejas inmediatamente
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients...');
      return self.clients.claim(); // ⚡ Tomar control inmediato
    })
  );
});

// Fetch - Estrategia ultra-robusta
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejar requests de nuestro origen
  if (url.origin !== location.origin) {
    return; // Dejar pasar requests externos
  }

  // Estrategia: Network First con fallback agresivo a Cache
  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        // Si la red responde, actualizar caché en segundo plano
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone).then(() => {
              console.log('[SW] Actualizado en caché:', request.url);
            });
          });
        }
        return networkResponse;
      })
      .catch(async (error) => {
        console.log('[SW] Red falló, buscando en caché:', request.url);
        
        // Buscar en caché
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
          console.log('[SW] ✅ Sirviendo desde caché (offline):', request.url);
          return cachedResponse;
        }
        
        // Estrategia de fallback para HTML
        if (request.destination === 'document' || request.url.includes('.html')) {
          console.log('[SW] 🆘 Fallback para HTML:', request.url);
          const fallback = await caches.match('/maestro.html') || await caches.match('/index.html');
          if (fallback) {
            console.log('[SW] ✅ Sirviendo fallback HTML');
            return fallback;
          }
        }
        
        // Estrategia de fallback para CSV
        if (request.url.includes('.csv')) {
          console.log('[SW] 🆘 Fallback para CSV');
          const csvFallback = await caches.match('/maestro.csv');
          if (csvFallback) {
            console.log('[SW] ✅ Sirviendo CSV desde caché');
            return csvFallback;
          }
        }
        
        console.error('[SW] ❌ No hay caché disponible para:', request.url);
        return Promise.reject(new Error('Offline y sin caché disponible'));
      })
  );
});

// Mensajes para control desde la UI
self.addEventListener('message', event => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  switch (event.data?.type) {
    case 'SKIP_WAITING':
      console.log('[SW] Activación forzada solicitada');
      self.skipWaiting();
      break;
      
    case 'VERIFY_CACHE':
      event.ports[0]?.postMessage({ 
        type: 'CACHE_STATUS', 
        cacheName: CACHE_NAME 
      });
      break;
      
    case 'PRELOAD_CRITICAL':
      preloadCriticalFiles();
      break;
  }
});

// Función para precargar archivos críticos
async function preloadCriticalFiles() {
  console.log('[SW] Precargando archivos críticos...');
  const cache = await caches.open(CACHE_NAME);
  
  for (const url of CRITICAL_URLS) {
    try {
      const response = await fetch(url, { cache: 'reload' });
      if (response.ok) {
        await cache.put(url, response);
        console.log(`[SW] ✅ Precargado: ${url}`);
      }
    } catch (err) {
      console.warn(`[SW] ❌ No se pudo precargar ${url}:`, err.message);
    }
  }
  console.log('[SW] Precarga completada');
}
