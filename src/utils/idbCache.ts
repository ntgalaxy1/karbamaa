/**
 * Karbama IndexedDB Cache Manager
 * Caches Job Listings, Essential Addresses, and Hotels locally
 * for fast access and offline operation even with poor or lost internet.
 */

import { JobVacancy, EssentialAddress, Hotel, JobSeeker } from '../types';

const DB_NAME = 'KarbamaOfflineDB';
const DB_VERSION = 2;

export const STORES = {
  JOBS: 'jobs',
  ADDRESSES: 'addresses',
  HOTELS: 'hotels',
  SEEKERS: 'seekers',
  META: 'meta',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.JOBS)) {
        db.createObjectStore(STORES.JOBS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.ADDRESSES)) {
        db.createObjectStore(STORES.ADDRESSES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.HOTELS)) {
        db.createObjectStore(STORES.HOTELS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SEEKERS)) {
        db.createObjectStore(STORES.SEEKERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const idbCache = {
  async saveSeekers(seekers: JobSeeker[]): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction([STORES.SEEKERS, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.SEEKERS);

      store.clear();
      for (const seeker of seekers) {
        if (seeker && seeker.id) {
          store.put(seeker);
        }
      }

      const metaStore = tx.objectStore(STORES.META);
      metaStore.put({ key: 'lastSeekersSync', timestamp: Date.now(), count: seekers.length });

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('[IDBCache] Error saving seekers to IndexedDB:', err);
    }
  },

  async getSeekers(): Promise<JobSeeker[]> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.SEEKERS, 'readonly');
      const store = tx.objectStore(STORES.SEEKERS);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (err) {
      console.warn('[IDBCache] Error reading seekers from IndexedDB:', err);
      return [];
    }
  },

  async saveJobs(jobs: JobVacancy[]): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction([STORES.JOBS, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.JOBS);
      
      // Clear old entries and insert fresh batch
      store.clear();
      for (const job of jobs) {
        store.put(job);
      }

      const metaStore = tx.objectStore(STORES.META);
      metaStore.put({ key: 'lastJobsSync', timestamp: Date.now(), count: jobs.length });

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve(); // Graceful resolve on error
      });
    } catch (err) {
      console.warn('[IDBCache] Error saving jobs to IndexedDB:', err);
    }
  },

  async getJobs(): Promise<JobVacancy[]> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.JOBS, 'readonly');
      const store = tx.objectStore(STORES.JOBS);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (err) {
      console.warn('[IDBCache] Error reading jobs from IndexedDB:', err);
      return [];
    }
  },

  async saveAddresses(addresses: EssentialAddress[]): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction([STORES.ADDRESSES, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.ADDRESSES);

      store.clear();
      for (const addr of addresses) {
        store.put(addr);
      }

      const metaStore = tx.objectStore(STORES.META);
      metaStore.put({ key: 'lastAddressesSync', timestamp: Date.now(), count: addresses.length });

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('[IDBCache] Error saving addresses to IndexedDB:', err);
    }
  },

  async getAddresses(): Promise<EssentialAddress[]> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.ADDRESSES, 'readonly');
      const store = tx.objectStore(STORES.ADDRESSES);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (err) {
      console.warn('[IDBCache] Error reading addresses from IndexedDB:', err);
      return [];
    }
  },

  async saveHotels(hotels: Hotel[]): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.HOTELS, 'readwrite');
      const store = tx.objectStore(STORES.HOTELS);

      store.clear();
      for (const hotel of hotels) {
        store.put(hotel);
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('[IDBCache] Error saving hotels to IndexedDB:', err);
    }
  },

  async getHotels(): Promise<Hotel[]> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.HOTELS, 'readonly');
      const store = tx.objectStore(STORES.HOTELS);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (err) {
      console.warn('[IDBCache] Error reading hotels from IndexedDB:', err);
      return [];
    }
  },

  async getSyncStatus(): Promise<{ lastJobsSync?: number; lastAddressesSync?: number }> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.META, 'readonly');
      const store = tx.objectStore(STORES.META);

      const jobsReq = store.get('lastJobsSync');
      const addrReq = store.get('lastAddressesSync');

      return new Promise((resolve) => {
        tx.oncomplete = () => {
          resolve({
            lastJobsSync: jobsReq.result?.timestamp,
            lastAddressesSync: addrReq.result?.timestamp,
          });
        };
        tx.onerror = () => resolve({});
      });
    } catch {
      return {};
    }
  },
};
