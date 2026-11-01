/**
 * Safe Browser Notification Wrapper with Service Worker Background Push Support
 * Prevents DOMException / SecurityError in sandboxed iframes while delivering system notifications on mobile & desktop.
 */

export function isNotificationSupported(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      typeof Notification !== 'undefined'
    );
  } catch {
    return false;
  }
}

export function getSafeNotificationPermission(): 'granted' | 'denied' | 'default' | 'unsupported' {
  try {
    if (isNotificationSupported()) {
      return Notification.permission as 'granted' | 'denied' | 'default';
    }
  } catch {
    // Thrown in sandboxed iframe when Notification is restricted
  }
  return 'unsupported';
}

export async function requestSafeNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  try {
    if (isNotificationSupported() && typeof Notification.requestPermission === 'function') {
      const res = await Notification.requestPermission();
      return res as 'granted' | 'denied' | 'default';
    }
  } catch {
    // Insecure context or iframe policy blocked
  }
  return 'unsupported';
}

export function showSafeNotification(title: string, options?: NotificationOptions): boolean {
  try {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
      return false;
    }

    const defaultOptions: any = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'karbama-system-alert',
      renotify: true,
      data: {
        url: typeof window !== 'undefined' ? window.location.origin : '/',
        timestamp: Date.now(),
      },
      ...options,
    };

    // First attempt: ServiceWorker registration.showNotification (works in background & phone status bar)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, defaultOptions);
        })
        .catch(() => {
          // Fallback to standard window Notification
          try {
            new Notification(title, defaultOptions);
          } catch (e) {
            console.warn('Fallback Notification failed', e);
          }
        });
      return true;
    }

    // Fallback: Standard Window Notification
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.warn('showSafeNotification absorbed security error:', err);
  }
  return false;
}
