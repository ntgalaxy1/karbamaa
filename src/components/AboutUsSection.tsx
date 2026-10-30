import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  MessageCircle,
  Instagram,
  PhoneCall,
  Check,
  Copy,
  ExternalLink,
  Info,
  ShieldCheck,
  Building2,
  Users2,
  MapPin,
  Clock,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutUsSection: React.FC = () => {
  const { setActiveTab } = useApp();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/80 border border-slate-800 p-6 sm:p-8 text-right shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>سامانه رسمی کارباما (KARBAMA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              درباره سامانه کارباما
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              کارباما تخصصی‌ترین پلتفرم هوشمند کاریابی، اقامت، ساخت رزومه استاندارد اداری و خدمات اقامتی در سراسر ترکیه برای هموطنان و فارسی‌زبانان عزیز است.
            </p>
          </div>

          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <img
              src="/logo.png"
              alt="لوگوی کارباما"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500/40 shadow-xl"
            />
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              ver 3.5 PWA
            </span>
          </div>
        </div>
      </div>

      {/* CRITICAL WARNING BANNER: NO BRANCHES OR REPRESENTATIVES */}
      <div className="p-6 bg-gradient-to-r from-red-950/90 via-red-900/60 to-slate-900 border-2 border-red-500/70 rounded-3xl shadow-xl space-y-3 text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 text-red-300 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="inline-block px-3 py-1 rounded-lg bg-red-600 text-white text-[11px] font-extrabold shadow-sm">
              هشدار بسیار مهم و سلب مسئولیت
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              ما هیچ‌ شعبه یا نماینده ای نداریم
            </h2>
            <p className="text-sm font-bold text-red-100 leading-relaxed">
              توجه داشته باشید که کارباما در هیچ یک از شهرهای ایران یا ترکیه دارای نماینده، وکیل یا دفتر رابط نمی‌باشد. تمامی هماهنگی‌ها، مشاوره‌ها و پیگیری امور متقاضیان صرفاً و منحصراً از طریق راه‌های ارتباطی زیر انجام می‌پذیرد.
            </p>
            <p className="text-xs text-red-200/90 leading-relaxed">
              لطفاً از پرداخت وجه یا تحویل مدارک به هر شخص یا کانال متفرقه‌ای که ادعای نمایندگی کارباما را دارد جداً خودداری فرمایید.
            </p>
          </div>
        </div>
      </div>

      {/* OFFICIAL COMMUNICATION CHANNELS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 text-right shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">تنها راه‌های ارتباطی رسمی با ما</h3>
              <p className="text-xs text-slate-400">کلیک روی هر گزینه جهت ورود مستقیم</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            تایید شده و امن
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Telegram Channel */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/60 hover:bg-blue-600/10 border border-slate-700/80 hover:border-blue-500/60 transition group space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                  کانال تلگرام
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">کانال رسمی تلگرام</h4>
                <p className="text-xs text-slate-400 mt-1">مشاهده فرصت‌های شغلی جدید، آموزش‌ها و اخبار فوری اقامت</p>
                <p className="text-xs font-mono text-blue-300 mt-2 dir-ltr text-right select-all">
                  https://t.me/karbama34
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
              <a
                href="https://t.me/karbama34"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <span>ورود به کانال</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleCopy('https://t.me/karbama34', 'telegram')}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition"
                title="کپی لینک"
              >
                {copiedLink === 'telegram' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/60 hover:bg-emerald-600/10 border border-slate-700/80 hover:border-emerald-500/60 transition group space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  واتس‌اپ
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">واتس‌اپ پشتیبانی مستقیم</h4>
                <p className="text-xs text-slate-400 mt-1">پاسخگویی سریع به سوالات کارجویان، کارفرمایان و مشاوره کاریابی</p>
                <p className="text-xs font-mono text-emerald-300 mt-2 dir-ltr text-right select-all">
                  https://wa.me/905521213486
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
              <a
                href="https://wa.me/905521213486"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <span>ارسال پیام در واتس‌اپ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleCopy('https://wa.me/905521213486', 'whatsapp')}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition"
                title="کپی لینک"
              >
                {copiedLink === 'whatsapp' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Instagram Page */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/60 hover:bg-rose-600/10 border border-slate-700/80 hover:border-rose-500/60 transition group space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                  اینستاگرام
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">پیج رسمی اینستاگرام</h4>
                <p className="text-xs text-slate-400 mt-1">معرفی فرصت‌های شغلی ویدیویی، تجربیات ایرانیان مقیم و آموزش زبان ترکی</p>
                <p className="text-xs font-mono text-rose-300 mt-2 dir-ltr text-right select-all">
                  @karbama34
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
              <a
                href="https://www.instagram.com/karbama34?stkn=YmxyOGVqYWlxamth&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <span>مشاهده پیج</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleCopy('https://www.instagram.com/karbama34?stkn=YmxyOGVqYWlxamth&utm_source=qr', 'instagram')}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition"
                title="کپی لینک"
              >
                {copiedLink === 'instagram' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Services Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-right">
        
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">کاریابی تایید شده</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            ثبت و اعتبارسنجی دقیق آگهی‌های کارفرمایان ترکیه با بررسی جای خواب و حقوق منظم.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">هتل‌ها و اقامت</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            معرفی هتل‌ها، هاستل‌ها و پانسیون‌های مناسب و نزدیک به مترو برای اقامت امن اولیه.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">آدرس‌های ضروری</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            لوکیشن و شماره تماس کنسولگری، گوچ ایدارسی (اداره مهاجرت)، مراکز درمانی و صرافی‌ها.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Users2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">رزومه‌ساز استاندارد</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            ساخت رزومه دو زبانه (فارسی-ترکی) با امکان پرینت و ارسال مستقیم به کارفرمایان.
          </p>
        </div>

      </div>

      {/* Quick Action Button to Post Job or Search */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-sm">کارفرما هستید و می‌خواهید آگهی استخدام ثبت کنید؟</h4>
          <p className="text-xs text-slate-400 mt-1">تعرفه ثبت آگهی ۵۰۰ لیر ثابت با امکان پرداخت از درگاه زرین‌پال، حساب ترکیه یا کارت به کارت ایران</p>
        </div>
        <button
          onClick={() => setActiveTab('post-job')}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg transition shrink-0"
        >
          ثبت آگهی استخدام (۵۰۰ لیر)
        </button>
      </div>

    </div>
  );
};
