import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { APP_VERSION, APP_VERSION_CODE, APP_PACKAGE_NAME } from '../version';
import {
  X,
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Github,
  Terminal,
  Package,
  Store,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const { isAdminLoggedIn } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPkg, setCopiedPkg] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copiedGhCmd, setCopiedGhCmd] = useState(false);
  const [installGuideMsg, setInstallGuideMsg] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin + window.location.pathname
      : 'https://karbama.app';

  const copyText = async (text: string, setter: (v: boolean) => void) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setter(true);
      setTimeout(() => setter(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setInstallGuideMsg(true);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click-outside Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Screen-bounded Modal Box */}
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col z-10 animate-in zoom-in-95 duration-150">
        
        {/* Compact Modern Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">
                دانلود اپلیکیشن و پکیج کافه‌بازار (APK / AAB)
              </h3>
              <p className="text-[11px] text-slate-400">
                نسخه رسمی اندروید v{APP_VERSION} (کد نسخه: {APP_VERSION_CODE})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain">
          
          {/* Cafe Bazaar & Store Release Card (APK + AAB) */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs sm:text-sm">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>دانلود مستقیم سایت + فایل‌های آماده آپلود کافه‌بازار، مایکت و گوگل‌پلی</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                v{APP_VERSION} (کد: {APP_VERSION_CODE})
              </span>
            </div>

            <p className="text-slate-300 text-[11.5px] leading-relaxed">
              با هر بار به‌روزرسانی سامانه، نسخه جدید اپلیکیشن به صورت خودکار ساخته و امضا می‌شود؛ هم برای <strong>دانلود مستقیم کاربران از داخل سایت</strong> و هم برای بارگذاری در <strong>کافه‌بازار، مایکت</strong> (<code className="text-emerald-300 font-mono">.apk</code>) و <strong>گوگل‌پلی</strong> (<code className="text-amber-300 font-mono">.aab</code>) با امضای دیجیتال <code className="text-emerald-300 font-mono">V1 + V2</code>:
            </p>

            {/* Primary Download Buttons: Direct APK, Store APK, Google Play AAB, Complete Store Bundle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={`/downloads/karbama-v${APP_VERSION}.apk`}
                download={`karbama-v${APP_VERSION}.apk`}
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition flex flex-col items-center justify-center gap-1 text-xs shadow-md shadow-emerald-700/30"
              >
                <div className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>دانلود مستقیم APK (نصب در گوشی / کافه‌بازار و مایکت)</span>
                </div>
                <span className="text-[10px] text-emerald-100 font-mono">
                  karbama-v{APP_VERSION}.apk (Signed V1+V2)
                </span>
              </a>

              <a
                href={`/downloads/karbama-v${APP_VERSION}.aab`}
                download={`karbama-v${APP_VERSION}.aab`}
                className="py-3 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl transition flex flex-col items-center justify-center gap-1 text-xs shadow-md shadow-amber-700/20"
              >
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>دانلود باندل AAB (مخصوص گوگل‌پلی و کافه‌بازار)</span>
                </div>
                <span className="text-[10px] text-slate-900 font-mono font-bold">
                  karbama-v{APP_VERSION}.aab (Android App Bundle)
                </span>
              </a>

              <a
                href={`/downloads/karbama-cafebazaar-v${APP_VERSION}.zip`}
                download={`karbama-cafebazaar-v${APP_VERSION}.zip`}
                className="sm:col-span-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition flex items-center justify-between gap-2 text-xs shadow-md shadow-indigo-700/20"
              >
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4" />
                  <span>دانلود بسته کامل انتشار در کافه‌بازار، مایکت و گوگل‌پلی (شامل APK + AAB + راهنما)</span>
                </div>
                <span className="text-[10px] bg-indigo-950/60 px-2 py-0.5 rounded font-mono">
                  v{APP_VERSION}.zip
                </span>
              </a>
            </div>

            {/* Cafe Bazaar Technical Specs Box */}
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>نام بسته (Package Name):</span>
                <button
                  type="button"
                  onClick={() => copyText(APP_PACKAGE_NAME, setCopiedPkg)}
                  className="font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold"
                >
                  <span>{APP_PACKAGE_NAME}</span>
                  {copiedPkg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>کد نسخه (Version Code):</span>
                <span className="font-mono text-emerald-400 font-bold">{APP_VERSION_CODE}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>نام نسخه (Version Name):</span>
                <span className="font-mono text-white font-bold">{APP_VERSION}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>نسخه SDK و امضا:</span>
                <span className="font-mono text-sky-400">MinSDK 21 / TargetSDK 34 (V1+V2 Signed)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href="https://github.com/ntgalaxy1/karbamaa/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Github className="w-4 h-4 text-emerald-400" />
                <span>دریافت از GitHub Releases</span>
              </a>

              <button
                type="button"
                onClick={handleInstallClick}
                className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>نصب وب‌اپلیکیشن (PWA)</span>
              </button>
            </div>

            {installGuideMsg && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-[11px] leading-relaxed">
                در مرورگر گوشی خود (Chrome یا Safari)، منوی سه نقطه یا دکمه Share را بزنید و گزینه <strong>«Install app»</strong> یا <strong>«Add to Home Screen»</strong> را انتخاب کنید.
              </div>
            )}
          </div>

          {/* Quick Share Link & QR Code */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-rose-400" />
                <span>اشتراک‌گذاری آدرس برنامه:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-amber-300 hover:underline text-[11px] flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{showQr ? 'بستن کد QR' : 'نمایش کد QR'}</span>
              </button>
            </div>

            {showQr && (
              <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center gap-2 text-center animate-in zoom-in-95 duration-150">
                <img src={qrCodeUrl} alt="کد QR برنامه" className="w-36 h-36 rounded-lg" />
                <span className="text-[10px] text-slate-800 font-bold">اسکن با دوربین گوشی برای دانلود و ورود سریع</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px] outline-none"
              />
              <button
                type="button"
                onClick={() => copyText(appUrl, setCopiedLink)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition flex items-center gap-1 text-[11px] shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
              </button>
            </div>
          </div>

          {/* Admin Exclusive Tools Section - Strictly for Management */}
          {isAdminLoggedIn ? (
            <div className="p-4 bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>ابزارهای اختصاصی انتشار کافه‌بازار و هاست (ویژه مدیریت)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  دسترسی مدیر
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Zip Build Download for cPanel/DirectAdmin */}
                <a
                  href="/karbama-dist.zip"
                  download="karbama-dist.zip"
                  className="py-2.5 px-3 bg-indigo-900/60 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-500/40 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>دانلود فایل زیپ هاست (dist.zip)</span>
                </a>

                {/* GitHub Releases Link */}
                <a
                  href="https://github.com/ntgalaxy1/karbamaa/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <Github className="w-3.5 h-3.5 text-amber-400" />
                  <span>ریلیزهای گیت‌هاب (Releases)</span>
                </a>
              </div>

              {/* Terminal Release Command */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    دستور ساخت و پوش خودکار APK و AAB در گیت‌هاب:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText('bash scripts/publish-to-github.sh', setCopiedGhCmd)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                  >
                    {copiedGhCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedGhCmd ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </div>
                <pre className="p-2 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[10.5px] overflow-x-auto text-left" dir="ltr">
                  bash scripts/publish-to-github.sh
                </pre>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10.5px] text-slate-400">
                <a
                  href="/TWA_APK_GITHUB_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>راهنمای کامل کافه‌بازار و کلید امضا</span>
                </a>
                <a
                  href="/DEPLOYMENT_GUIDE_FA.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>راهنمای آپلود هاست</span>
                </a>
              </div>
            </div>
          ) : (
            /* User Info Banner */
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>نسخه تاییدشده و امن کارباما v{APP_VERSION}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Package: {APP_PACKAGE_NAME}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
