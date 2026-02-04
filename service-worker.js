const CACHE_VERSION = 'v2.0.0'; // 2026 Edition
const CACHE_NAME = `riopaila-maestro-${CACHE_VERSION}`;
const BASE = '/';

// Archivos esenciales para modo offline
const CRITICAL_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'maestro.html',
  BASE + 'maestro.csv',
  BASE + 'manifest.json',
  BASE + 'service-worker.js',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

// ===============================
// 1. INSTALAR – Cacheo inicial
// ===============================
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('[SW] Cacheando archivos críticos...');
        // Usamos un bucle para intentar cachear uno por uno y reportar errores
        for (const url of CRITICAL_URLS) {
          try {
            const response = await fetch(url);
            if (response && response.ok) {
              await cache.put(url, response.clone());
            } else {
              console.warn(`[SW] ⚠ No se pudo cachear ${url} (Status: ${response.status})`);
            }
          } catch (err) {
            console.warn(`[SW] ⚠ Error de red al cachear ${url}:`, err.message);
          }
        }
      })
      .then(() => {
        console.log('[SW] Instalación completa. ESPERANDO confirmación del usuario...');
        // CAMBIO CRÍTICO: NO hacer skipWaiting automáticamente
        // return self.skipWaiting(); // <-- REMOVIDO
      })
  );
});

// ===============================
// 2. ACTIVAR – Limpiar viejos caches
// ===============================
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            console.log('[SW] 🗑 Eliminando caché antigua:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Tomando control de clientes...');
      return self.clients.claim();
    })
  );
});

// ===============================
// 3. FETCH – La lógica híbrida (Lo mejor de ambos mundos)
// ===============================
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo interceptamos peticiones de nuestro propio dominio
  if (url.origin !== location.origin) return;

  // A. ESTRATEGIA ESPECIAL PARA CSV (Prioridad: Velocidad)
  // Muestra el dato viejo rápido mientras descarga el nuevo en segundo plano
  if (url.pathname.endsWith('maestro.csv')) {
    event.respondWith(cacheFirstCSV(request));
    return;
  }

  // B. ESTRATEGIA GENERAL (Prioridad: Red fresca + Fallback robusto)
  event.respondWith(
    fetch(request)
      .then(res => {
        // Si hay red y responde OK, actualizamos la caché
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      })
      .catch(async () => {
        console.log('[SW] Red falló, buscando en caché:', request.url);

        // 1. Intentar obtener el archivo exacto de la caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        // 2. FALLBACK DE EMERGENCIA
        // Si el usuario navega a una URL que no tiene caché, le damos el HTML principal
        if (request.destination === 'document' || request.url.includes('.html')) {
          console.log('[SW] 🆘 Sirviendo Fallback HTML');
          const fallback = await caches.match('/maestro.html') || await caches.match('/index.html');
          if (fallback) return fallback;
        }

        // Si no hay nada, no podemos hacer nada
        return Promise.reject(new Error('Offline y sin contenido disponible'));
      })
  );
});

// ===============================
// 4. FUNCIONES AUXILIARES
// ===============================

// Estrategia "Stale-While-Revalidate" para el CSV
async function cacheFirstCSV(request) {
  const cache = await caches.open(CACHE_NAME);

  // Buscar en caché primero
  const cached = await cache.match(request);

  // Lanzar petición de red en segundo plano para actualizar la próxima vez
  const networkPromise = fetch(request).then(res => {
    if (res.ok) {
      cache.put(request, res.clone());
      console.log('[SW] CSV actualizado en segundo plano');
    }
  }).catch(() => console.log('[SW] No se pudo actualizar CSV en segundo plano (Offline)'));

  // Si tenemos caché, la devolvemos YA (velocidad). Si no, esperamos a la red.
  return cached || await fetch(request);
}

// Mensajes desde la UI (Botones de actualizar, etc.)
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] ✅ Usuario confirmó actualización. Activando nueva versión...');
    self.skipWaiting();
  }
});
