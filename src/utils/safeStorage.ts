/**
 * Resilient Storage wrapper that safely absorbs SecurityError / DOMException
 * in sandboxed iframes or environments where third-party localStorage is blocked.
 */

const memoryStore = new Map<string, string>();

function isLocalStorageWorking(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    const storage = window.localStorage;
    if (!storage) {
      return false;
    }
    const testKey = '__karbama_test_key__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isLocalStorageWorking();

export const safeStorage = {
  getItem(key: string): string | null {
    if (storageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Insecure operation or sandbox restriction
      }
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    memoryStore.set(key, value);
    if (!storageAvailable) return;

    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Likely QuotaExceededError when base64 images fill up the 5MB localStorage limit.
      try {
        // 1. If saving seekers, strip heavy base64 image dataUrls from older entries or current payload so credentials ALWAYS persist in localStorage
        if (key.includes('seekers') && value.startsWith('[')) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const lightweight = parsed.map((item) => {
              if (!item || typeof item !== 'object') return item;
              const copy = { ...item };
              for (const k of ['passportPhotoUrl', 'fullBodyPhotoUrl', 'nationalCardPhotoUrl', 'signatureDataUrl']) {
                if (typeof copy[k] === 'string' && copy[k].length > 35000) {
                  copy[k] = '';
                }
              }
              return copy;
            });
            window.localStorage.setItem(key, JSON.stringify(lightweight));
            return;
          }
        }
        // 2. Otherwise free up non-user cache keys and retry
        window.localStorage.removeItem('karbama_jobs_v10');
        window.localStorage.removeItem('karbama_hotels_v10');
        window.localStorage.removeItem('karbama_addresses_v10');
        window.localStorage.setItem(key, value);
      } catch {
        // Keep in memoryStore
      }
    }
  },

  removeItem(key: string): void {
    if (storageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Absorb SecurityError
      }
    }
    memoryStore.delete(key);
  },

  clear(): void {
    if (storageAvailable) {
      try {
        window.localStorage.clear();
      } catch {
        // Absorb SecurityError
      }
    }
    memoryStore.clear();
  },
};
