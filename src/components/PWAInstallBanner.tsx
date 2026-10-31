import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { ApkDownloadModal } from './ApkDownloadModal';
import { Download, Smartphone, Apple, CheckCircle2, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Top Banner or Notification Bar */}
      <div
        style={{ background: 'var(--primary-topbar)' }}
        className="bg-slate-900 border-b border-red-500/30 px-4 py-2.5 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-600/30 text-red-400 border border-red-500/30">
              <Smartphone className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong>نسخه موبایل (اندروید و آیفون):</strong> این سامانه را مانند اپلیکیشن بومی روی گوشی خود نصب یا فایل APK را برای کارجو ارسال کنید.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApkModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm transition"
              title="ارسال و دانلود فایل APK برای کارجو"
            >
              <Smartphone className="w-3.5 h-3.5" />
              ارسال و دانلود APK
            </button>

            {isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                نصب مستقیم در اندروید
              </button>
            )}

            <button
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
            >
              <Apple className="w-3.5 h-3.5 text-white" />
              راهنمای نصب در آیفون (iOS)
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-white p-1"
              title="بستن پیام"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Offline status indicator */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs text-center font-medium shadow-md">
          شما در حالت آفلاین هستید - اطلاعات ذخیره شده و کدهای ضروری در دسترس هستند.
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <Apple className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">نصب اپلیکیشن روی آیفون و آیپد (Apple iOS)</h3>
                <p className="text-xs text-slate-400">بدون نیاز به اپ‌استور، مانند یک اپلیکیشن واقعی</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 mb-5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px] mt-0.5">
                  ۱
                </div>
                <div>
                  سایت را در مرورگر <strong>Safari (سافاری)</strong> آیفون باز کنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px] mt-0.5">
                  ۲
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  دکمه اشتراک‌گذاری 
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded text-slate-100 font-mono">
                    <Share2 className="w-3 h-3 text-blue-400" /> Share
                  </span>
                  را در پایین صفحه بزنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px] mt-0.5">
                  ۳
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  گزینه 
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded text-slate-100 font-mono">
                    <PlusSquare className="w-3 h-3 text-emerald-400" /> Add to Home Screen
                  </span>
                  (افزودن به صفحه اصلی) را انتخاب کنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px] mt-0.5">
                  ۴
                </div>
                <div>
                  روی دکمه <strong>Add</strong> در گوشه بالا بزنید. آیکون برنامه کاریابی به صفحه گوشی شما اضافه خواهد شد.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl text-xs transition"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

      <ApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </>
  );
};
