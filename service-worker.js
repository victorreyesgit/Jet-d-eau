// Offline helper. Online: always loads the newest version. Offline: opens the saved copy.
// Bump the version number if installed copies ever need to drop old files.
const CACHE = 'vr-jet-d-eau-v1';
const PREFIX = 'vr-jet-d-eau-';   // only this app's caches: other apps share the same domain
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.open(CACHE).then(c => c.match(e.request, {ignoreSearch: true}).then(hit => hit || c.match('index.html'))))
  );
});
