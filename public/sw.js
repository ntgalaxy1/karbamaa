/**
 * Karbama PWA Service Worker
 * Handles offline support, static asset caching, push notifications,
 * and IndexedDB data synchronization for Job Listings & Essential Addresses.
 */

const CACHE_NAME = 'karbama-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

const DB_NAME = 'KarbamaOfflineDB';
const DB_VERSION = 1;

// Helper to open IndexedDB inside Service Worker
function openSWDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper to read cached store inside Service Worker
async function getStoreDataSW(storeName) {
  try {
    const db = await openSWDB();
    if (!db.objectStoreNames.contains(storeName)) return [];
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    console.warn('[SW IDB] Failed to read store:', storeName, e);
    return [];
  }
}

// Install Event - Pre-cache critical PWA assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Cache addAll partial warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Crucial for Chrome PWA Installability & Offline Operation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip non-HTTP(S) or untrusted origins
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Static Assets (Images, scripts, styles): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset and update in background when online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Offline background fetch failure - silently ignore
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline and asset is missing
          return new Response('Network unavailable. Karbama PWA operating in offline mode.', {
            status: 503,
            statusText: 'Offline Mode',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
          });
        });
    })
  );
});

// Push Event - Receive background notifications even when app is closed
self.addEventListener('push', (event) => {
  let data = {
    title: 'کارباما | کاریابی و اقامت 📱',
    body: 'آگهی جدید استخدام یا تغییرات در حساب کارجو ثبت گردید.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    url: '/',
  };

  try {
    if (event.data) {
      const json = event.data.json();
      data = { ...data, ...json };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'karbama-push-alert',
    renotify: true,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'مشاهده در کارباما 📱' },
      { action: 'close', title: 'بستن' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Event - Open or focus Karbama app when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Message Event - Handle triggers and offline data queries from client
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  if (event.data.type === 'TRIGGER_NOTIFICATION') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title || 'کارباما 📱', {
      body: body || 'اطلاعیه جدید از سامانه کاریابی کارباما',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      tag: tag || 'karbama-direct-alert',
      renotify: true,
      data: { url: '/' },
    });
  }

  if (event.data.type === 'GET_OFFLINE_JOBS' && event.ports && event.ports[0]) {
    const cachedJobs = await getStoreDataSW('jobs');
    event.ports[0].postMessage({ type: 'OFFLINE_JOBS_RESPONSE', jobs: cachedJobs });
  }

  if (event.data.type === 'GET_OFFLINE_ADDRESSES' && event.ports && event.ports[0]) {
    const cachedAddresses = await getStoreDataSW('addresses');
    event.ports[0].postMessage({ type: 'OFFLINE_ADDRESSES_RESPONSE', addresses: cachedAddresses });
  }
});
