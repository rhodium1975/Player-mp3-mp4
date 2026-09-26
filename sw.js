const CACHE = 'tocador-shell-v1';
const SHELL = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// App shell (HTML/manifest/icons): cache-first.
// Chamadas de API de letras e qualquer outra coisa: sempre rede (nunca cacheadas).
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isShell = SHELL.some((p) => url.pathname.endsWith(p.replace('./', '')));
  if (!isShell || e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
