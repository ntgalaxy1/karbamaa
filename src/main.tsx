import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Immediately hydrate theme to prevent flash
try {
  const savedTheme = localStorage.getItem('karbama_theme_v3') || 'dark';
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(savedTheme);
  document.documentElement.style.colorScheme = savedTheme;
} catch {
  document.documentElement.classList.add('dark');
}

// Safely suppress sandboxed iframe DOMException & transient Firestore offline console errors
if (typeof window !== 'undefined') {
  const origConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (
      firstArg.includes('Could not reach Cloud Firestore backend') ||
      firstArg.includes('The client will operate in offline mode') ||
      firstArg.includes('@firebase/firestore')
    ) {
      console.warn('[Firestore Offline Notice]', ...args);
      return;
    }
    origConsoleError(...args);
  };

  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('The operation is insecure') ||
        event.message.includes('SecurityError'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    const name = event.reason?.name || '';
    if (
      name === 'SecurityError' ||
      msg.includes('The operation is insecure') ||
      msg.includes('SecurityError') ||
      msg.includes('Could not reach Cloud Firestore backend') ||
      msg.includes('client is offline')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // Immediately purge any stale caches (including Workbox precaches) from previous versions
  if ('caches' in window) {
    caches
      .keys()
      .then((names) => {
        for (const name of names) {
          if (name !== 'karbama-cache-v19') {
            caches.delete(name);
          }
        }
      })
      .catch(() => {});
  }

  // Register PWA Service Worker (Required for Chrome/Android "Install app" capability)
  if (
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      try {
        if (!sessionStorage.getItem('karbama_sw_v28_reloaded')) {
          sessionStorage.setItem('karbama_sw_v28_reloaded', '1');
          refreshing = true;
          window.location.reload();
        }
      } catch {
        // ignore storage errors
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration handled:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
