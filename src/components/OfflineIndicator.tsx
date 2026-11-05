import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Database } from 'lucide-react';
import { idbCache } from '../utils/idbCache';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestoredToast, setShowRestoredToast] = useState<boolean>(false);
  const [cachedCounts, setCachedCounts] = useState<{ jobsCount: number; addrsCount: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredToast(true);
      const timer = setTimeout(() => setShowRestoredToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = async () => {
      setIsOnline(false);
      // Fetch cached count from IndexedDB
      try {
        const jobs = await idbCache.getJobs();
        const addrs = await idbCache.getAddresses();
        setCachedCounts({ jobsCount: jobs.length, addrsCount: addrs.length });
      } catch {
        // ignore
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredToast) {
    return null;
  }

  if (showRestoredToast) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-300">
        <Wifi className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
        <span>اتصال به اینترنت دوباره برقرار شد</span>
      </div>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col sm:flex-row items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-950/95 text-amber-100 border border-amber-500/50 shadow-2xl backdrop-blur-md text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-300 max-w-lg text-center dir-rtl">
      <div className="flex items-center gap-2 shrink-0 font-bold text-amber-300">
        <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>حالت آفلاین فعال است</span>
      </div>
      <div className="hidden sm:inline-block text-amber-500/60">|</div>
      <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
        <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          بارگذاری از حافظه محلی IndexedDB
          {cachedCounts ? ` (${cachedCounts.jobsCount} شغل و ${cachedCounts.addrsCount} آدرس)` : ''}
        </span>
      </div>
    </div>
  );
};
