const CACHE_NAME = 'gameacg-v2';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/admin.js',
  './js/cloud-sync.js',
  './js/review.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  console.log('Service Worker: 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: 缓存文件中...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: 跳过等待');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: 激活中...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: 删除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: 立即接管');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }).catch(() => {
          console.log('Service Worker: 网络请求失败，使用缓存');
        });
      })
  );
});
