// Service Worker for SkillSwap PWA
const CACHE_NAME = 'skillswap-v2';

// Only cache core shell; built assets will be cached on-demand
const CORE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(CORE_URLS);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Network-first for assets and pages; fall back to cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Cache assets under /assets and core documents
          if (url.pathname.startsWith('/assets/') || CORE_URLS.includes(url.pathname)) {
            cache.put(req, resClone);
          }
        });
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
}); 