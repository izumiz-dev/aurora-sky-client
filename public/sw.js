const CACHE_NAME = 'aurora-sky-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'no-cache' })));
      })
  );
  self.skipWaiting();
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // APIリクエストと外部画像はキャッシュしない
  if (request.url.includes('/api/') || 
      request.url.includes('bsky.social') || 
      request.url.includes('bsky.network') ||
      request.url.includes('googleapis.com') ||
      request.url.includes('gstatic.com') ||
      // 外部のアバター画像URLをキャッシュから除外
      (request.destination === 'image' && !url.origin.includes(self.location.origin))) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // キャッシュがある場合はそれを返す
        if (response) {
          // バックグラウンドで更新
          fetch(request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          });
          return response;
        }
        
        // ネットワークからフェッチ
        return fetch(request).then((networkResponse) => {
          // 成功したレスポンスをキャッシュに追加
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // オフラインフォールバック
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// プッシュ通知の処理（将来の機能）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});