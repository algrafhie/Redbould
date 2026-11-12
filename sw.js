const CACHE_NAME = 'redbound-app-v2.1.6.4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Permintaan lintas origin (server cloud / broker) TIDAK disentuh service worker:
  // gagal jaringan harus sampai ke game apa adanya, bukan diganti file HTML
  // (fallback HTML ke respons API dulu bisa membuat sesi/progress gagal dibaca).
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        // Fallback ke shell HANYA untuk navigasi halaman (bukan untuk data/API).
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return caches.match(event.request);
      })
  );
});
