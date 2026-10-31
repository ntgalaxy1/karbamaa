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

// Safely suppress sandboxed iframe DOMException: "The operation is insecure."
if (typeof window !== 'undefined') {
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
      msg.includes('SecurityError')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // Register PWA Service Worker (Required for Chrome Android "Install app" capability)
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Check for worker updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version ready.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration handled:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
