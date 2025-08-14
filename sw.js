const CACHE = 'hadiths-cache-v1';
const OFFLINE = [
  '/', '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

// Mets ici les JSON que tu veux pré-cacher si tu veux un vrai hors-ligne immédiat :
const DATA = [
  // '/data/bukhari.json',
  // '/data/muslim.json',
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...OFFLINE, ...DATA])));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=> e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  // Cache-first pour HTML/CSS/JS/Images, Network-first pour data JSON
  if(req.url.endsWith('.json')){
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
        return res;
      }).catch(()=> caches.match(req))
    );
  }else{
    e.respondWith(
      caches.match(req).then(cached=> cached || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
        return res;
      }).catch(()=> caches.match('/index.html')))
    );
  }
});
