// ÄNDERE DIESE VERSION, WENN DU EIN UPDATE AUF GITHUB HOCHLÄDST (z.B. v2, v3, v4...)
const CACHE_NAME = 'zz-dental-v3';

const ASSETS = [
  './',
  './index.html',
  './config.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  // Sofort aktivieren, ohne auf das Schließen alter Tabs zu warten
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  // Alte Cache-Versionen löschen
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
