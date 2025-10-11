const CACHE_NAME = 'riopaila-maestro-v1';
const TO_CACHE = [
  '/maestro-riopaila/',
  '/maestro-riopaila/index.html',
  '/maestro-riopaila/manifest.json',
  '/maestro-riopaila/icon-192.png',
  '/maestro-riopaila/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
