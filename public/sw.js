/**
 * Karbama PWA Service Worker
 * Handles offline support, static asset caching, push notifications,
 * and IndexedDB data synchronization for Job Listings & Essential Addresses.
 */

const CACHE_NAME = 'karbama-cache-v19';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/pwa-1024x1024.png',
  '/apple-touch-icon.png',
  '/logo.png',
  '/favicon.ico',
  '/icon.svg',
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

// Install Event - Pre-cache critical PWA assets and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Cache addAll partial warning:', err);
        });
      })
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

// Fetch Event - Network-First for code/pages & installation routes so updates apply immediately; fallback to cache offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip non-HTTP(S) or untrusted origins
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes('fonts.googleapis.com') &&
    !url.hostname.includes('fonts.gstatic.com')
  ) {
    return;
  }

  // Never cache Vite HMR / dev internal endpoints or APK/ZIP binary downloads
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules') ||
    url.pathname.endsWith('.apk') ||
    url.pathname.endsWith('.zip')
  ) {
    return;
  }

  const isInstallOrAppRoute =
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/install' ||
    url.pathname === '/index.html';

  // Network-First for all HTML navigations, installation routes, JS/TS/TSX/CSS bundles, and JSON configs
  const isCodeOrPage =
    isInstallOrAppRoute ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.mjs') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.json');

  if (isCodeOrPage) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          }
          // If navigating to /install on a static server that returns 404, serve cached or live /index.html
          if (isInstallOrAppRoute && (!response || response.status === 404)) {
            const rootRes = await fetch('/index.html').catch(() => null);
            if (rootRes && rootRes.status === 200) return rootRes;
            const cachedApp = (await caches.match('/index.html')) || (await caches.match('/'));
            if (cachedApp) return cachedApp;
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (isInstallOrAppRoute) {
            return (await caches.match('/index.html')) || (await caches.match('/'));
          }
          return new Response('Offline mode', { status: 503 });
        })
    );
    return;
  }

  // Images & Fonts: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
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
