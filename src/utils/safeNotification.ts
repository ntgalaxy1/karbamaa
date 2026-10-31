/**
 * Safe Browser Notification Wrapper
 * Prevents DOMException / SecurityError: "The operation is insecure" in sandboxed iframes.
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
    if (isNotificationSupported() && Notification.permission === 'granted') {
      new Notification(title, options);
      return true;
    }
  } catch {
    // Absorb SecurityError
  }
  return false;
}
