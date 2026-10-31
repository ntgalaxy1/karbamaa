import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  QrCode,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  // Resolve current app URL
  const appUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin + window.location.pathname
      : 'https://ais-pre-r4qqj5f5kpgcwzdzjus5mk-972518644509.europe-west2.run.app';

  const shareTitle = 'کارباما | سامانه جامع کاریابی و اقامت ترکیه، ارمنستان، عراق و آلمان';
  const shareText =
    'سامانه هوشمند کاریابی و اقامت کارباما: فرصت‌های شغلی با جای خواب، ساخت رزومه آنلاین و تعهدنامه رسمی کاریابی در خارج از کشور 🚀';

  const fullShareMessage = `${shareTitle}\n\n${shareText}\n\nورود به سامانه: ${appUrl}`;

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareMessage);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Web Share API (native share on mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: appUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const socialLinks = [
    {
      name: 'تلگرام (Telegram)',
      color: 'bg-[#229ED9] hover:bg-[#1d8cc2] text-white',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'واتساپ (WhatsApp)',
      color: 'bg-[#25D366] hover:bg-[#20ba5a] text-white',
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`,
    },
    {
      name: 'ایتا (Eitaa)',
      color: 'bg-[#e26922] hover:bg-[#ca5c1c] text-white',
      icon: '🟠',
      url: `https://eitaa.com/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'روبیکا (Rubika)',
      color: 'bg-[#893297] hover:bg-[#742880] text-white',
      icon: '🟣',
      url: `https://rubika.ir`,
    },
    {
      name: 'لینکدین (LinkedIn)',
      color: 'bg-[#0077B5] hover:bg-[#006097] text-white',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`,
    },
    {
      name: 'توییتر / اکس (X)',
      color: 'bg-black hover:bg-slate-900 text-white border border-slate-700',
      icon: '✖️',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  // SVG QR Code generator (fallback clean QR URL via api.qrserver.com)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-700/30 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="لوگوی کارباما"
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/60 shadow-lg shadow-red-700/30 shrink-0"
            />
            <div>
              <h3 className="font-extrabold text-white text-base">اشتراک‌گذاری برنامه کارباما</h3>
              <p className="text-xs text-slate-400">ارسال به دوستان، شبکه‌ها و کانال‌های کاریابی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Branded Card Preview */}
          <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/30 flex items-center gap-3">
            <img
              src="/logo.png"
              alt="لوگوی کارباما"
              className="w-14 h-14 rounded-full object-cover border border-amber-400/60 shadow-md shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-sm">کارباما | KARBAMA</span>
                <span className="px-1.5 py-0.2 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold">رسمی</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">کاریابی تخصصی، اقامت و ویزای کار در ترکیه، ارمنستان، عراق و آلمان</p>
            </div>
          </div>
          {/* Direct Copy Link Box */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">لینک اختصاصی برنامه کارباما:</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl p-2" dir="ltr">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="bg-transparent text-slate-200 text-xs flex-1 outline-hidden font-mono px-2 truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-700/30'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'کپی شد!' : 'کپی لینک'}</span>
              </button>
            </div>
          </div>

          {/* Native Mobile Share Button (if supported) */}
          {'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>اشتراک‌گذاری مستقیم از طریق گوشی (منوی اشتراک سیستم)</span>
            </button>
          )}

          {/* Social Network Share Buttons */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">ارسال مستقیم به شبکه‌های اجتماعی:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${s.color}`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="truncate">{s.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* QR Code toggle */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQr ? 'مخفی کردن کد QR' : 'نمایش کد QR جهت اسکن با دوربین'}</span>
              </button>
              <span className="text-[10px] text-slate-500">مناسب پوستر، کانال و استوری اینستاگرام</span>
            </div>

            {showQr && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2 text-center animate-fadeIn">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <img src={qrCodeUrl} alt="QR Code کارباما" className="w-40 h-40 object-contain" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  دیگران می‌توانند با دوربین گوشی خود این کد را اسکن کنند و مستقیماً وارد برنامه شوند.
                </p>
              </div>
            )}
          </div>

          {/* Suggested Post Text for Telegram & Instagram Bio */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">متن پیشنهادی برای بیو، استوری یا تلگرام:</span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
              >
                <Copy className="w-3 h-3" />
                <span>کپی متن پیام</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
              «سامانه جامع کاریابی و اقامت کارباما: ثبت‌نام متقاضیان کار در ترکیه، ارمنستان، عراق و آلمان با امکان انتخاب مشاغل با جای خواب و اقامت قانونی: {appUrl}»
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
