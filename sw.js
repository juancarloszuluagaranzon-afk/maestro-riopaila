
const CACHE_NAME = 'riopaila-maestro-v1';
const TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(TO_CACHE)));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
