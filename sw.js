// Versions-Nummer hochzählen bei Änderungen
const CACHE_NAME = 'dentis-v8';

const ASSETS = [
  './',
  './index.html',
  './config.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Sofort als aktiver Worker installieren
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Übernehme sofort die Kontrolle über alle offenen Fenster
  );
});

// Network-First Strategie: Versuche immer erst den Server zu erreichen
self.addEventListener('fetch', (e) => {
  // Nur GET Anfragen cachen, API-POSTs direkt durchlassen
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Erfolgreich geladen -> Aktualisiere Cache im Hintergrund
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline -> Nimm Daten aus dem Cache
        return caches.match(e.request);
      })
  );
});
