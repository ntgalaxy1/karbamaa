import React from 'react';
import { X, Send, MessageCircle, Instagram, ShieldAlert, HeartHandshake, PhoneCall } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">درباره کارباما (KARBAMA)</h3>
              <p className="text-xs text-amber-300/80 font-mono">سامانه رسمی کاریابی و خدمات اقامت در ترکیه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-right">

          {/* Warning Banner: No Branches Notice */}
          <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-2xl flex items-start gap-3 shadow-lg">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-red-300">هشدار و اطلاعیه مهم</h4>
              <p className="text-xs text-red-100 font-bold leading-relaxed">
                ما هیچ شعبه‌، دفتر جانبی یا نماینده‌ای در هیچ شهری نداریم.
              </p>
              <p className="text-[11px] text-red-200/80">
                لطفا مراقب افراد سودجو و کلاهبردار باشید. تنها راه‌های ارتباطی معتبر کارباما موارد زیر می‌باشد.
              </p>
            </div>
          </div>

          {/* Official Communication Links Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 border-b border-slate-800 pb-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>تنها راه‌های ارتباطی با ما:</span>
            </div>

            {/* Telegram Channel */}
            <a
              href="https://t.me/karbama34"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition">کانال تلگرام کارباما</h5>
                  <p className="text-[11px] text-slate-400 font-mono dir-ltr">https://t.me/karbama34</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md">
                ورود به کانال
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/905521213486"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">واتس‌اپ پشتیبانی کارباما</h5>
                  <p className="text-[11px] text-slate-400 font-mono dir-ltr">https://wa.me/905521213486</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md">
                ارسال پیام
              </span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/karbama34?stkn=YmxyOGVqYWlxamth&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-rose-600/20 border border-slate-700 hover:border-rose-500/50 rounded-2xl transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-rose-300 transition">پیج اینستاگرام کارباما</h5>
                  <p className="text-[11px] text-slate-400 font-mono dir-ltr">@karbama34</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md">
                مشاهده پیج
              </span>
            </a>
          </div>

          {/* Raw Copy Text for User Assurance */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed text-center font-sans">
            <p className="font-extrabold text-amber-300">ما هیچ‌ شعبه‌ یا نماینده‌ای نداریم</p>
            <p className="text-slate-400 text-[11px]">تنها راه‌های ارتباطی با ما:</p>
            <div className="text-[11px] font-mono text-slate-400 space-y-1 dir-ltr text-center">
              <p className="text-blue-400 font-bold">https://t.me/karbama34</p>
              <p className="text-emerald-400 font-bold">https://wa.me/905521213486</p>
              <p className="text-rose-400 font-bold">https://www.instagram.com/karbama34</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            متوجه شدم
          </button>
        </div>

      </div>
    </div>
  );
};
