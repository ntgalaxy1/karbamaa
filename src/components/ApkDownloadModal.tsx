import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  X,
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Github,
  Terminal,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'github-release' | 'seeker' | 'google-play' | 'raw-apk'>('github-release');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedAssetLinks, setCopiedAssetLinks] = useState(false);
  const [copiedGhCmd, setCopiedGhCmd] = useState(false);
  const [copiedApkDirect, setCopiedApkDirect] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin + window.location.pathname
      : 'https://ais-pre-r4qqj5f5kpgcwzdzjus5mk-972518644509.europe-west2.run.app';

  const shareTextToSeeker = `سلام، اپلیکیشن رسمی کاریابی و اعزام کارباما را جهت ثبت‌نام، انتخاب شغل و دریافت قرارداد رسمی روی گوشی اندروید خود نصب کنید:\n\n${appUrl}\n\n(پس از باز کردن در مرورگر گوشی، گزینه «نصب برنامه» یا Install App را بزنید تا آیکون برنامه به صفحه گوشی شما اضافه شود).`;

  const assetLinksJson = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.karbama.twa",
      "sha256_cert_fingerprints": [
        "14:6D:E9:DE:0F:73:98:E8:..."
      ]
    }
  }
]`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyMsg = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareTextToSeeker);
      }
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyAssetLinks = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(assetLinksJson);
      }
      setCopiedAssetLinks(true);
      setTimeout(() => setCopiedAssetLinks(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      alert(
        'برای نصب در گوشی:\nدر مرورگر کروم گوشی خود، علامت سه نقطه (منو) بالای صفحه را بزنید و گزینه «نصب برنامه» (Install app) یا «افزودن به صفحه اصلی» (Add to Home screen) را لمس کنید تا فایل برنامه به گوشی شما اضافه شود.'
      );
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900/40 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="لوگوی کارباما"
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/60 shadow-lg shadow-emerald-600/20 shrink-0"
            />
            <div>
              <h3 className="font-extrabold text-white text-base">
                خروجی APK و انتشار در گوگل‌پلی (Google Play Store)
              </h3>
              <p className="text-xs text-slate-400">راهنمای دریافت فایل‌های نصبی اندروید و پکیج استاندارد فروشگاه گوگل با آیکون کارباما</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('github-release')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'github-release'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-emerald-400" />
            <span>دانلود APK آخرین نسخه (گیت‌هاب و سرور)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seeker')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'seeker'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>نصب وب‌اپلیکیشن (PWA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google-play')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'google-play'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>انتشار در گوگل‌پلی (AAB / Play Store)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw-apk')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'raw-apk'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>مبدل‌های کمکی APK</span>
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[72vh] overflow-y-auto">
          {/* TAB 0: Official GitHub Release APK v10.0.0.11 */}
          {activeTab === 'github-release' && (
            <div className="space-y-4">
              {/* Highlight Hero Card */}
              <div className="p-5 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      نسخه رسمی کارباما (v10.0.0.12)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      آخرین نسخه پایدار
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">حجم: ۱۱.۸ مگابایت</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-base">
                    دانلود مستقیم فایل نصبی اندروید (karbama-v10.0.0.12.apk)
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    فایل نصبی استاندارد اپلیکیشن کارباما با نام پکیج رسمی <code className="text-amber-300 font-mono">app.karbama.twa</code> و نسخه <strong className="text-emerald-400">10.0.0.12</strong> آماده دریافت مستقیم از سرور و هماهنگ‌شده با آخرین انتشار رسمی در گیت‌هاب (GitHub Releases).
                  </p>
                </div>

                {/* Primary Download Action Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href="/karbama-latest.apk"
                    download="karbama-v10.0.0.12.apk"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-700/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود مستقیم سرور ۱ (karbama-latest.apk)</span>
                  </a>

                  <a
                    href="/downloads/karbama-latest.apk"
                    download="karbama-v10.0.0.12.apk"
                    className="py-3 px-4 bg-teal-700 hover:bg-teal-600 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود مستقیم سرور ۲ (لینک کمکی)</span>
                  </a>

                  <a
                    href="https://github.com/ntgalaxy1/karbamaa/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs sm:col-span-2"
                    title="مشاهده و دانلود در صفحه ریلیزهای رسمی گیت‌هاب"
                  >
                    <Github className="w-4 h-4 text-amber-400" />
                    <span>دانلود از سرور جهانی گیت‌هاب (GitHub Releases v10.0.0.12)</span>
                  </a>
                </div>
              </div>

              {/* GitHub Releases Integration Card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Github className="w-4 h-4 text-slate-300" />
                    <span>دسترسی و استقرار در گیت‌هاب (GitHub Releases)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                    Tag: v10.0.0.12
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  فایل APK و پکیج‌های بیلد در مخزن گیت کامیت شده و گردش‌کار خودکار گیت‌هاب اکشنز (<code className="text-indigo-300 font-mono">.github/workflows/release-apk.yml</code>) جهت ساخت Release رسمی در دسترس است:
                </p>

                {/* Script execute snippet */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      دستور ریلیز خودکار و پوش تگ به گیت‌هاب:
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText('bash scripts/publish-to-github.sh');
                          setCopiedGhCmd(true);
                          setTimeout(() => setCopiedGhCmd(false), 2000);
                        } catch {}
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {copiedGhCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedGhCmd ? 'کپی شد!' : 'کپی دستور'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-950 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto text-left" dir="ltr">
                    bash scripts/publish-to-github.sh
                  </pre>
                </div>

                {/* Direct guide link button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <a
                    href="/TWA_APK_GITHUB_GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>مطالعه راهنمای کامل تنظیم نام بسته و کلید امضا (TWA_APK_GITHUB_GUIDE.md)</span>
                  </a>

                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>ورود به گیت‌هاب</span>
                  </a>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">شماره نسخه (Version):</span>
                  <span className="font-mono font-bold text-white text-xs">10.0.0.8</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">کد نسخه (versionCode):</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">100001</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">نام پکیج اندروید:</span>
                  <span className="font-mono font-bold text-sky-300 text-xs">app.karbama.twa</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">حداقل سیستم‌عامل:</span>
                  <span className="font-bold text-slate-200 text-xs">اندروید ۵.۰ به بالا</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">نوع معماری خروجی:</span>
                  <span className="font-bold text-emerald-300 text-xs">Universal (ARM/x86)</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">توسعه‌دهنده:</span>
                  <span className="font-bold text-slate-200 text-xs">Naser Tavakkoli</span>
                </div>
              </div>

              {/* Installation Guide */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>راهنمای ۳ مرحله‌ای نصب فایل APK روی گوشی:</span>
                </h4>
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ۱
                    </span>
                    <span>روی دکمه سبز «دانلود مستقیم فایل APK نسخه ۱۰.۰.۰.۱» بزنید تا فایل در گوشی ذخیره شود.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ۲
                    </span>
                    <span>پس از پایان دانلود، اعلان گوشی را لمس کرده یا به پوشه Downloads رفته و فایل را باز کنید.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ۳
                    </span>
                    <span>در صورت نمایش اخطار امنیتی اندروید، گزینه «نصب از این منبع» (Allow from this source) را تایید کرده و دکمه Install را بزنید.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Seeker Install */}
          {activeTab === 'seeker' && (
            <>
              {/* Method 1: Direct Install on Android (PWA / WebAPK) */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    روش اول: نصب مستقیم و سریع (پیشنهادی)
                  </span>
                  <span className="text-slate-400 text-[10px]">بدون نیاز به فایل نصبی سنگین</span>
                </div>

                <h4 className="font-bold text-white text-sm">
                  نصب برنامه کارباما به عنوان اپلیکیشن مستقل روی گوشی کارجو
                </h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  با این روش، برنامه مانند یک فایل APK واقعی روی صفحه اصلی و لیست برنامه‌های گوشی کارجو نصب می‌شود، آیکون اختصاصی کارباما ایجاد شده و به صورت تمام‌صفحه و مستقل از مرورگر اجرا می‌گردد.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-700/30 transition flex items-center justify-center gap-2 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>نصب فوری اپلیکیشن روی همین گوشی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>{showQr ? 'بستن QR' : 'اسکن با گوشی'}</span>
                  </button>
                </div>

                {showQr && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2 text-center animate-fadeIn">
                    <div className="bg-white p-2.5 rounded-xl">
                      <img src={qrCodeUrl} alt="QR Code نصب کارباما" className="w-36 h-36 object-contain" />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      کارجو می‌تواند دوربین گوشی اندروید خود را روی این کد بگیرد تا بلافاصله گزینه نصب ظاهر شود.
                    </p>
                  </div>
                )}
              </div>

              {/* Method 2: Send Direct Installation Link to Job Seeker via WhatsApp / Telegram */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                  روش دوم: ارسال لینک نصب مستقیم به کارجو
                </span>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  می‌توانید پیام آماده زیر را برای کارجو در تلگرام، واتساپ یا پیامک بفرستید. کارجو با باز کردن لینک در گوشی خود، با ۱ کلیک دکمه «نصب برنامه» را می‌زند و اپلیکیشن در منوی گوشی‌اش قرار می‌گیرد:
                </p>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
                  <div className="text-slate-400 text-[10px] font-sans">متن آماده جهت ارسال به کارجو:</div>
                  <p className="text-slate-200 leading-relaxed font-sans">{shareTextToSeeker}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyMsg}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                      copiedMsg
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMsg ? 'متن کپی شد!' : 'کپی متن پیام'}</span>
                  </button>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(
                      'اپلیکیشن کاریابی و اقامت کارباما جهت نصب روی گوشی'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-[#229ED9] hover:bg-[#1d8cc2] text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs"
                  >
                    <span>ارسال در تلگرام</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTextToSeeker)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs"
                  >
                    <span>ارسال در واتساپ</span>
                  </a>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: Google Play Store Guide */}
          {activeTab === 'google-play' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>آیا خروجی کارباما را می‌توان در گوگل‌پلی (Google Play) منتشر کرد؟</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  <strong>بله، ۱۰۰٪ و کاملاً استاندارد!</strong> به دلیل اینکه برنامه کارباما مطابق استاندارد رسمی <strong>TWA (Trusted Web Activity)</strong> شرکت گوگل پیاده‌سازی شده، مستقیماً به بسته نصبی رسمی گوگل‌پلی تبدیل می‌شود.
                </p>
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-200 text-[11px] leading-relaxed">
                  <strong>نکته مهم گوگل‌پلی:</strong> از سال ۲۰۲۱، گوگل‌پلی فایل‌های با پسوند <code className="bg-blue-950 px-1.5 py-0.5 rounded text-amber-300">.apk</code> را برای برنامه‌های جدید نمی‌پذیرد و حتماً بسته مدرن <strong>Android App Bundle (.aab)</strong> را درخواست می‌کند. ابزار زیر هر دو فایل (.apk و .aab) را به شما تحویل می‌دهد.
                </div>
              </div>

              {/* Step by step */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3.5">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>۴ مرحله اصلی انتشار کارباما در Google Play Console:</span>
                </h4>

                <div className="space-y-3 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ۱
                    </span>
                    <div>
                      <strong className="text-white">دریافت بسته .aab و کلید اختصاصی امضا:</strong>
                      <p className="text-slate-400 text-[10.5px] mt-0.5">
                        وارد ابزار رسمی مایکروسافت و گوگل در <span className="text-amber-400 font-mono">PWABuilder.com</span> شوید، آدرس سایت برنامه را قرار دهید و گزینه <strong>Package for Stores ➔ Google Play</strong> را بزنید تا فایل فشرده حاوی فایل <code className="text-emerald-400">app-release-bundle.aab</code> و کلید امنیتی دانلود شود.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ۲
                    </span>
                    <div>
                      <strong className="text-white">حساب توسعه‌دهنده گوگل (Google Play Developer Console):</strong>
                      <p className="text-slate-400 text-[10.5px] mt-0.5">
                        نیاز به یک حساب گوگل‌پلی دولوپر دارید (هزینه ثبت یک‌باره ۲۵ دلار). پس از ورود، دکمه <strong>Create app</strong> را زده و نام «کارباما | اعزام و کاریابی بین‌المللی» را وارد کنید.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ۳
                    </span>
                    <div>
                      <strong className="text-white">آپلود مدارک و اطلاعات فروشگاه (Store Listing):</strong>
                      <p className="text-slate-400 text-[10.5px] mt-0.5">
                        آیکون ۵۱۲×۵۱۲، بنر سربرگ ۱۰۲۴×۵۰۰، اسکرین‌شات از صفحات ثبت‌نام و فرم‌ها، توضیحات کوتاه و کامل برنامه و تکمیل پرسشنامه رده‌بندی سنی (IARC).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ۴
                    </span>
                    <div>
                      <strong className="text-white">آپلود فایل AAB در بخش Production و انتشار:</strong>
                      <p className="text-slate-400 text-[10.5px] mt-0.5">
                        در منوی سمت چپ پنل گوگل‌پلی به بخش <strong>Production ➔ Create new release</strong> رفته و فایل <code className="text-emerald-400">app-release-bundle.aab</code> را بکشید و رها کنید. پس از فشردن دکمه Send for review، ظرف ۱ تا ۳ روز کاری برنامه در گوگل‌پلی منتشر می‌شود.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-700/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>تولید خودکار پکیج Google Play (در سامانه PWABuilder)</span>
                  </a>

                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs"
                  >
                    <span>ورود به Google Play Console</span>
                  </a>
                </div>
              </div>

              {/* Digital Asset Links */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>تأییدیه مالکیت دامنه گوگل (Digital Asset Links)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAssetLinks}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {copiedAssetLinks ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAssetLinks ? 'کپی شد' : 'کپی نمونه assetlinks.json'}</span>
                  </button>
                </div>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">
                  گوگل برای اینکه نوار آدرس مرورگر داخل اپلیکیشن پنهان شود، فایلی به نام <code className="text-blue-300">/.well-known/assetlinks.json</code> در روت سرور می‌خواند که اثر انگشت SHA-256 کلید ساخت شما در آن قرار دارد. این فایل به صورت خودکار در پکیج دریافتی شما از PWABuilder وجود دارد.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Raw APK */}
          {activeTab === 'raw-apk' && (
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                  تولید فایل خام با پسوند APK. (قابل ارسال با بلوتوث، فلش، تلگرام یا انتشار در کافه‌بازار و مایکت)
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed text-[11px]">
                اگر می‌خواهید یک فایل خام با پسوند <strong>app-release.apk</strong> در دست داشته باشید که کارجو بدون هیچ نرم‌افزار واسطی آن را مانند برنامه‌های معمولی اندروید نصب کند، یا آن را در <strong>کافه‌بازار (Bazaar)</strong> و <strong>مایکت (Myket)</strong> آپلود نمایید:
              </p>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    ۱
                  </span>
                  <span>روی دکمه ورود به سامانه PWABuilder در پایین کلیک کنید.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    ۲
                  </span>
                  <span>لینک برنامه به طور خودکار آنالیز شده و نمره ۱۰۰٪ سازگاری دریافت می‌کند.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    ۳
                  </span>
                  <span>روی <strong>Package for Stores ➔ Android</strong> بزنید و گزینه <strong>Download APK</strong> را لمس کنید تا فایل APK خام مستقیماً دانلود شود.</span>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`https://www.appsgeyser.com/create-url-app/?url=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs shadow-md shadow-emerald-700/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>تولید فوری APK خام با AppsGeyser (تضمینی و بدون خطای فایروال)</span>
                </a>

                <a
                  href="/manifest.json"
                  download="manifest.json"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl border border-amber-500/30 transition flex items-center gap-1.5 text-xs"
                  title="دانلود مستقیم فایل مانیفست برای آپلود دستی در PWABuilder"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فایل manifest.json</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedLink ? 'کپی شد!' : 'کپی لینک برنامه'}</span>
                </button>
              </div>

              {/* Troubleshooting / Alternative APK converters if firewall blocks */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>راهکارهای سریع در صورت مسدود شدن ربات PWABuilder توسط فایروال سرور:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[10.5px]">
                  سرورهای هاستینگ ابری (Google Cloud Run) گاهی به ربات‌های خارجی خودکار مثل PWABuilder خطای ۴۰۳ می‌دهند. برای دور زدن این مشکل می‌توانید:
                </p>
                <div className="space-y-1.5 pr-2 border-r-2 border-amber-500/40 text-[10.5px]">
                  <p>
                    <strong>۱. آپلود دستی فایل مانیفست:</strong> با زدن دکمه «دانلود فایل manifest.json» در بالا، فایل را دانلود کرده و در PWABuilder مستقیماً در بخش Manifest آپلود کنید تا نیازی به اسکن ربات نباشد.
                  </p>
                  <p>
                    <strong>۲. سرویس‌های آنلاین جایگزین APK بدون مسدودی فایروال:</strong> سامانه‌هایی مانند <strong>AppsGeyser.com</strong> یا <strong>Web2App</strong> با وارد کردن آدرس سایت، ظرف ۳۰ ثانیه فایل APK مستقیم را تولید می‌کنند.
                  </p>
                  <p>
                    <strong>۳. دیتابیس هیچ ارتباطی با این خطا ندارد:</strong> خطای ۴۰۳ یا MIME مربوط به دسترسی ربات‌های وب به فایل‌های آیکون است و دیتابیس برنامه ۱۰۰٪ مستقل و سالم است.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>بسته استاندارد Google Play TWA و مانیفست کامل فعال است</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};

