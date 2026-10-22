// Offline: tenta a rede (sempre pega a versão nova), sem internet usa o cache.
// ponytail: rede primeiro deixa a abertura lenta em sinal ruim; se incomodar, trocar por cache primeiro + atualizar em segundo plano.
importScripts('data.js');
const CACHE = 'resenha';
const ESSENCIAIS = [
  './', 'index.html', 'app.js', 'logic.js', 'data.js', 'online.js', 'firebase-config.js', 'manifest.webmanifest',
  'icones/icone-180.png', 'icones/icone-192.png', 'icones/icone-512.png',
  ...CLUBES.map(c => c.escudo),
];

// cache: 'no-cache' = sempre confere com o servidor. Sem isso o fetch passava pelo cache HTTP do
// navegador (GitHub Pages manda max-age=600) e "rede primeiro" entregava o arquivo velho por até 10 min
// depois de cada atualização (v1.4 apareceu com o menu antigo por isso).
const daRede = req => (new URL(req.url).origin === location.origin ? new Request(req.url, { cache: 'no-cache' }) : req);

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE)
  .then(c => c.addAll(ESSENCIAIS.map(u => new Request(u, { cache: 'no-cache' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(daRede(e.request))
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));   // fontes do Google entram aqui também
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
