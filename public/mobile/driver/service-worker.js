/**
 * Service Worker
 */

const _version = 'v8';
const cacheName = 'v5';
const cacheList = [
  '/public/mobile/driver/',
  '/public/mobile/driver/main.html',
  '/public/mobile/driver/manifest.json',
  '/public/mobile/driver/scripts/app.js',
  '/public/mobile/driver/styles/index.css',
  '/public/mobile/driver/images/icons/icon-128x128.png',
  '/public/mobile/driver/images/tab_commute.png',
  '/public/mobile/driver/images/tab_item.png'
];

const log = msg => {
  console.log(`[ServiceWorker ${_version}] ${msg}`);
}

// Life cycle: INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  log('INSTALL');
  caches.open(cacheName).then(cache => {
    log('Caching app shell');
    return cache.addAll(cacheList);
  })
});

// Life cycle: ACTIVATE
self.addEventListener('activate', event => {
  log('Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheName) {
          log('Removing old cache ' + key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Functional: FETCH
self.addEventListener('fetch', event => {
  log('Fetch ' + event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Functional: PUSH
self.addEventListener('push', event => {
  log('Push ' + event.data.text());

  const title = 'My PWA!';
  const options = {
    body: event.data.text()
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// TODO: Notification click event
self.addEventListener('notificationclick', function(event) {
  log('Push clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://github.com/leegeunhyeok/pwa-example')
  );
});
