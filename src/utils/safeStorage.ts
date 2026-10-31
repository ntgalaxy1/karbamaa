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
    if (storageAvailable) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Absorb SecurityError
      }
    }
    memoryStore.set(key, value);
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
