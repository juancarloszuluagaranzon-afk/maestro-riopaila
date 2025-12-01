const CACHE_VERSION = 'v1.7.9'; // Versión actualizada
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;
const BASE = '/';

// Archivos CRÍTICOS (Deben estar para que la app arranque)
const CRITICAL_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'maestro.html',
  BASE + 'maestro.csv', // Datos vitales
  BASE + 'manifest.json',
  BASE + 'service-worker.js',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

// ======================================================
// 1. INSTALAR: Cacheo inicial robusto
// ======================================================
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('[SW] Cacheando archivos críticos...');
        
        // Intentamos cachear todo, pero no detenemos la instalación si un icono falla
        // (Mezcla de robustez de v1.7.7 con la limpieza de v1.7.8)
        const promises = CRITICAL_URLS.map(url => 
          fetch(url).then(res => {
            if (res.ok) return cache.put(url, res.clone());
            throw new Error(`Fallo al descargar ${url}`);
          }).catch(err => console.warn('[SW] ⚠️', err.message))
        );
        
        await Promise.all(promises);
      })
      .then(() => {
        console.log('[SW] Instalación completa. Esperando activación...');
        return self.skipWaiting(); // Forzamos espera para activar
      })
  );
});

// ======================================================
// 2. ACTIVAR: Limpieza de versiones viejas
// ======================================================
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 🗑 Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Ahora controlando clientes');
      return self.clients.claim(); // Tomar control inmediato de las pestañas
    })
  );
});

// ======================================================
// 3. FETCH: El Cerebro (Lógica Híbrida)
// ======================================================
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo interceptamos nuestro propio origen
  if (url.origin !== location.origin) return;

  // A) ESTRATEGIA CSV: Stale-While-Revalidate (Velocidad máxima)
  // Muestra lo que tiene guardado YA, y actualiza en segundo plano.
  if (url.pathname.endsWith('maestro.csv')) {
    event.respondWith(cacheFirstCSV(request));
    return;
  }

  // B) ESTRATEGIA HTML/NAV: Network First + Fallback Robusto
  // Intenta internet, si falla busca caché, si falla usa el maestro.html de respaldo.
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // C) RESTO DE RECURSOS (JS, CSS, IMG): Network First Simple
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

// Estrategia Especial para CSV (Prioridad: Velocidad)
async function cacheFirstCSV(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] ⚡ Sirviendo CSV desde caché (actualizando en background)');
    // Actualización en segundo plano ("Background Sync" manual)
    fetch(request).then(res => {
      if (res.ok) {
        cache.put(request, res.clone());
        console.log('[SW] 🔄 CSV actualizado en caché silenciosamente');
      }
    }).catch(err => console.log('[SW] Sin conexión para actualizar CSV'));
    
    return cached; // Retornamos inmediatamente el caché
  }

  // Si no hay caché, vamos a la red
  try {
    const network = await fetch(request);
    if (network.ok) cache.put(request, network.clone());
    return network;
  } catch (err) {
    console.error('[SW] ❌ CSV no disponible (ni red ni caché)');
    throw err;
  }
}

// Estrategia Especial para Navegación (Prioridad: Seguridad Offline)
async function networkFirstWithFallback(request) {
  try {
    // 1. Intentar red
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Red falló, buscando en caché:', request.url);
  }

  // 2. Intentar caché exacta
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  // 3. FALLBACK DE EMERGENCIA (Recuperado de v1.7.7)
  // Si el usuario recarga en una ruta interna y no tiene red, le damos el maestro.html
  console.log('[SW] 🆘 Activando Fallback para HTML');
  const cache = await caches.open(CACHE_NAME);
  const fallback = await cache.match('/maestro.html') || await cache.match('/index.html');
  
  if (fallback) return fallback;

  // Si llegamos aquí, no hay nada que hacer
  return new Response('Estás offline y esta página no está disponible.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain' })
  });
}

// ======================================================
// MENSAJES (Para el botón "Nueva versión disponible")
// ======================================================
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
