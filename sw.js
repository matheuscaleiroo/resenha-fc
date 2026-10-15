// Offline: tenta a rede (sempre pega a versão nova), sem internet usa o cache.
// ponytail: rede primeiro deixa a abertura lenta em sinal ruim; se incomodar, trocar por cache primeiro + atualizar em segundo plano.
importScripts('data.js');
const CACHE = 'resenha';
const ESSENCIAIS = [
  './', 'index.html', 'app.js', 'logic.js', 'data.js', 'online.js', 'firebase-config.js', 'manifest.webmanifest',
  'icones/icone-180.png', 'icones/icone-192.png', 'icones/icone-512.png',
  ...CLUBES.map(c => c.escudo),
];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));   // fontes do Google entram aqui também
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
