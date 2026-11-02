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

/**
 * Plays a crystal-clear 2-tone "Ding-Dong / Bell Chime" notification sound
 * using Web Audio API (100% reliable, offline-compatible, no external mp3 files required).
 */
export function playNotificationDingSound(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First Chime Tone: High crisp bell note (E6 - 1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Second Chime Tone: Warm harmonic note (A6 - 1760 Hz) shortly after (+0.1s)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.1);
    gain2.gain.setValueAtTime(0.4, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.75);
  } catch (err) {
    console.warn('playNotificationDingSound error:', err);
  }
}

/**
 * Plays a distinct, cheerful 4-tone ascending musical chime (C5 -> E5 -> G5 -> C6)
 * using Web Audio API specifically when a new Job or new Hotel is added.
 */
export function playNewJobHotelDingSound(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0,  duration: 0.22, gain: 0.35 }, // C5
      { freq: 659.25, time: 0.08, duration: 0.22, gain: 0.38 }, // E5
      { freq: 783.99, time: 0.16, duration: 0.26, gain: 0.42 }, // G5
      { freq: 1046.5, time: 0.24, duration: 0.50, gain: 0.45 }, // C6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // Warm musical bell tone
      osc.frequency.setValueAtTime(note.freq, now + note.time);
      gain.gain.setValueAtTime(note.gain, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration);
    });
  } catch (err) {
    console.warn('playNewJobHotelDingSound error:', err);
  }
}

export function showSafeNotification(
  title: string,
  options?: NotificationOptions,
  soundType: 'chat' | 'job_hotel' | 'none' = 'chat'
): boolean {
  try {
    // Play appropriate sound effect whenever a notification is triggered
    if (soundType === 'job_hotel') {
      playNewJobHotelDingSound();
    } else if (soundType === 'chat') {
      playNotificationDingSound();
    }

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
