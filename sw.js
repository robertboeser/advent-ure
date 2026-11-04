// Service Worker: macht das Spiel nach dem ersten Laden offline spielbar.
// Strategie: Cache zuerst, im Hintergrund aktualisieren (stale-while-revalidate).
// Bei einer neuen Version VERSION erhöhen – tests/release.test.mjs prüft,
// dass sie zur Version in package.json passt und alle Dateien gelistet sind.

const VERSION = '1.0.0';
const CACHE = `advent-ure-${VERSION}`;

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/base.css',
  'css/theme.css',
  'css/effects.css',
  'css/menus.css',
  'js/main.js',
  'js/engine/conditions.js',
  'js/engine/effects.js',
  'js/engine/engine.js',
  'js/engine/state.js',
  'js/engine/storage.js',
  'js/fx/atmosphere.js',
  'js/fx/audio.js',
  'js/fx/snow.js',
  'js/ui/format.js',
  'js/ui/menu.js',
  'js/ui/renderer.js',
  'js/ui/typewriter.js',
  'data/config.js',
  'data/index.js',
  'data/items.js',
  'data/memories.js',
  'data/stations/a-ankunft.js',
  'data/stations/b-omas-haus.js',
  'data/stations/c-dorfplatz.js',
  'data/stations/d-kirche.js',
  'data/stations/e-muehle.js',
  'data/stations/f-wald.js',
  'data/stations/g-turm.js',
  'data/stations/x-enden.js',
  'assets/fonts/cormorant-sc-500-latin.woff2',
  'assets/fonts/eb-garamond-italic-latin.woff2',
  'assets/fonts/eb-garamond-latin.woff2',
  'assets/img/favicon.svg',
  'assets/img/frost.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('advent-ure-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => (request.mode === 'navigate' ? cache.match('index.html') : undefined));
      if (cached) {
        event.waitUntil(network.catch(() => {}));
        return cached;
      }
      return (await network) ?? Response.error();
    }),
  );
});
