// The museum's service worker.
//
// It exists for one reason: Chrome only fires `beforeinstallprompt` — the
// event behind a one-tap "Add to home screen" button — for a site that has a
// registered service worker WITH a fetch handler. Installing from the browser
// menu stopped needing one in Chrome 108 (mobile) / 112 (desktop), but the
// prompt still does, which is why friends were having to dig through the
// three-dot menu.
//
// So the fetch handler below is the point, and it is deliberately thin. This
// app is a museum whose whole premise is a finite daily collection served from
// the backend; caching the feed would either serve yesterday's exhibits or
// quietly hand out a second helping of today's. Neither is wanted. Only the
// shell is cached, and only so a cold launch from the home screen doesn't sit
// on a white screen.

const CACHE = 'antisocial-shell-v1';

// The bits that make the app *look* like itself before any data arrives.
const SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  // addAll rejects the whole batch if any one entry 404s, which would leave
  // the worker uninstalled and the install button permanently absent. Each
  // entry is fetched on its own so a missing icon costs an icon, not the
  // prompt.
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Anything that isn't a plain GET, and anything addressed to the API, goes
  // straight to the network untouched. A cached session is a wrong session.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network first, cache only as the offline fallback, so an
  // updated build is picked up on the next launch rather than on the one
  // after it.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((r) => r || Response.error()))
    );
    return;
  }

  // Static assets: serve from cache when we have it, and refresh in the
  // background so the next launch gets the newer file.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
