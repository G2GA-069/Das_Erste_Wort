/**
 * Das erste Wort — Service Worker
 * Cache-first strategy for offline-capable PWA experience.
 * Precaches core assets on install, caches chapters on first visit.
 */

const CACHE_NAME = 'dew-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './game-engine.css',
  './game-engine.js',
  './card-overlay.js',
  './quiz-enhancer.js',
  './progress-renderer.js',
  './vocab-data.js',
  './nav-bar.js',
  './progress-store.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Generate chapter URLs (prologue + 100 chapters)
const CHAPTER_URLS = ['./prologue.html'];
for (let i = 1; i <= 100; i++) {
  CHAPTER_URLS.push(`./chapter${i}.html`);
}

// All assets including chapters
const ALL_ASSETS = [...CORE_ASSETS, ...CHAPTER_URLS];

// ─── Install: precache core assets only (chapters cached on demand) ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: cache-first for same-origin, network-first for fonts/CDN ───
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Google Fonts & CDN: network-first with cache fallback
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Same-origin: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Return cached, but also update in background (stale-while-revalidate)
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          }
          return response;
        }).catch(() => {});
        return cached;
      }

      // Not cached: fetch from network and cache the response
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ─── Background sync: precache nearby chapters when idle ───
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PRECACHE_CHAPTERS') {
    const current = event.data.chapter || 1;
    // Cache current chapter + next 5 + previous 2
    const toCache = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(100, current + 5); i++) {
      toCache.push(`./chapter${i}.html`);
    }
    caches.open(CACHE_NAME).then(cache => {
      toCache.forEach(url => {
        cache.match(url).then(existing => {
          if (!existing) {
            fetch(url).then(resp => {
              if (resp.ok) cache.put(url, resp);
            }).catch(() => {});
          }
        });
      });
    });
  }

  if (event.data && event.data.type === 'CACHE_ALL') {
    // Progressive background caching of all chapters
    caches.open(CACHE_NAME).then(cache => {
      let delay = 0;
      ALL_ASSETS.forEach(url => {
        setTimeout(() => {
          cache.match(url).then(existing => {
            if (!existing) {
              fetch(url).then(resp => {
                if (resp.ok) cache.put(url, resp);
              }).catch(() => {});
            }
          });
        }, delay);
        delay += 200; // Stagger requests to avoid overwhelming
      });
    });
  }
});
