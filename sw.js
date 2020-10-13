const filesToCache = [
  '/',
  '/dog.svg',
  '/style.css'
];
const CACHE_NAME = 'static-v1';
const DATA_CACHE_NAME = 'static-db-v1';

// install
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// activate
self.addEventListener('activate', evt => {
  console.log('now ready to handle fetches!');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  ); // end e.waitUntil
});

// fetch
self.addEventListener('fetch', evt => {
  if (evt.request.url.includes('/people')) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);
    evt.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) => {
          return fetch(evt.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
                return response;
              }).catch((err) => {
                return cache.match(evt.request);
              });
        }));
    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
          .then((response) => {
            return response || fetch(evt.request);
          });
    })
  );
});