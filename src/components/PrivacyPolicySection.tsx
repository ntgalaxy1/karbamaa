import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  Database,
  Eye,
  UserCheck,
  PhoneCall,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  ShieldAlert,
  Server,
  Cookie,
  HardDrive,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Printer,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PrivacyPolicySection: React.FC = () => {
  const { setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.origin + '/privacy-policy';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto dir-rtl text-right">
      {/* Top Banner Navigation & Title */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setActiveTab('jobs');
                window.history.pushState({}, '', '/');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md transition"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به صفحه اصلی
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition"
                title="چاپ یا ذخیره PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ سند</span>
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition border border-amber-500/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'لینک کپی شد!' : 'اشتراک‌گذاری'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono tracking-wider text-amber-400 font-bold uppercase">
                KARBAMA PRIVACY POLICY
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                سیاست حفظ حریم خصوصی و محرمانگی اطلاعات
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            کارباما به عنوان سامانه جامع کاریابی، اقامت و مشاوره ایرانیان در ترکیه، متعهد به حفاظت همه‌جانبه از داده‌ها، مدارک و حریم شخصی شماست. این سند نحوه جمع‌آوری، ذخیره‌سازی، استفاده و حفاظت از اطلاعات شما را شفاف‌سازی می‌کند.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-300/90 font-medium">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>تاریخ آخرین به‌روزرسانی: ۱۲ آبان ۱۴۰۵ (نوامبر ۲۰۲۶)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>رمزنگاری SSL/TLS و دیتابیس ابری Firebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <a
          href="#section-collected-data"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition flex items-center gap-2 text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <Database className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-bold truncate">۱. اطلاعات جمع‌آوری شده</span>
        </a>
        <a
          href="#section-data-usage"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition flex items-center gap-2 text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <Eye className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-bold truncate">۲. نحوه استفاده</span>
        </a>
        <a
          href="#section-cookies"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition flex items-center gap-2 text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <Cookie className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold truncate">۳. کوکی‌ها و حافظه محلی</span>
        </a>
        <a
          href="#section-security"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition flex items-center gap-2 text-slate-700 dark:text-slate-300 shadow-xs"
        >
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-bold truncate">۴. امنیت داده‌ها</span>
        </a>
      </div>

      {/* SECTION 1: Collected Data */}
      <section id="section-collected-data" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۱. اطلاعاتی که از کاربران جمع‌آوری می‌شود
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              داده‌هایی که برای ارائه خدمات کاریابی، ساخت رزومه و احراز هویت ثبت می‌کنید
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          سامانه کارباما تنها داده‌هایی را جمع‌آوری می‌کند که مستقیماً برای فرایند کاریابی در ترکیه، صدور رزومه آنلاین، ارتباط با مدیریت و ارائه خدمات ضروری اقامتی مورد نیاز است. هیچ داده غیرضروری بدون آگاهی شما جمع‌آوری نمی‌شود.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>اطلاعات هویت و ثبت‌نام کارجویان</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pr-2 leading-relaxed">
              <li>نام و نام خانوادگی، نام پدر و کد ملی</li>
              <li>شماره تلفن همراه (جهت احراز هویت و ورود)</li>
              <li>جنسیت و وضعیت خدمت نظام وظیفه</li>
              <li>شهر و استان محل سکونت در ایران</li>
              <li>کشور و شهر مقصد (مانند ترکیه‌/استانبول)</li>
              <li>وضعیت فعلی اقامت و سطح تسلط به زبان ترکی</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>مدارک و تصاویر ارسالی</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pr-2 leading-relaxed">
              <li>عکس پرسنلی و عکس تمام‌رخ (جهت ارائه به کارفرما)</li>
              <li>تصویر پاسپورت (جهت استعلام اقامت و پذیرش شغلی)</li>
              <li>تصویر کارت بانکی (جهت احراز هویت مالی و تسویه)</li>
              <li>امضای دیجیتال کاربر در فرم‌های ثبت‌نام</li>
              <li>سابقه شغلی، مهارت‌ها و مدرک تحصیلی</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>پیام‌ها و چت آنلاین با مدیر</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pr-2 leading-relaxed">
              <li>نام و شماره تماس وارد شده در ویجت چت آنلاین</li>
              <li>متن پیام‌ها و درخواست‌های ارسالی به مدیر</li>
              <li>وضعیت تایید و پاسخ‌های ارسال شده از سوی مدیریت</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>اطلاعات فنی و دستگاه</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pr-2 leading-relaxed">
              <li>آدرس IP و نوع دستگاه (موبایل یا دسکتاپ)</li>
              <li>وضعیت اتصال شبکه و کش آفلاین سامانه PWA</li>
              <li>لاگ‌های فنی ثبت خطا در صورت بروز ایراد شبکه</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 2: How Data is Used */}
      <section id="section-data-usage" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۲. نحوه استفاده از اطلاعات
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اهداف کارباما از پردازش و استفاده از اطلاعات ثبت‌شده
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              ۱
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">تطبیق فرصت‌های شغلی</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              ارزیابی رزومه، مهارت‌ها و سطح زبان برای معرفی و انطباق شما با موقعیت‌های شغلی فعال کارفرمایان در ترکیه.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              ۲
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">پشتیبانی و چت مستقیم</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              برقراری ارتباط مستقیم در بخش «چت آنلاین با مدیر» و اطلاع‌رسانی درباره وضعیت پذیرش درخواست کاریابی.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              ۳
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">احراز هویت و امنیت مالی</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              جلوگیری از فعالیت کلاهبرداران، احراز هویت واقعی کارجویان و تضمین تسویه حساب امن با کارفرمایان.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">تضمین عدم فروش داده‌ها:</span>
            <p className="leading-relaxed text-amber-800 dark:text-amber-300">
              اطلاعات شخصی شما به هیچ وجه فروخته نشده و تحت هیچ شرایطی در اختیار شرکت‌های تبلیغاتی یا بازاریابی شخص ثالث قرار نمی‌گیرد.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Cookies & Local Storage */}
      <section id="section-cookies" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/30 text-amber-600 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۳. کوکی‌ها و ذخیره‌سازی محلی (Local Storage & IndexedDB)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تکنولوژی‌های ذخیره‌سازی محلی جهت عملکرد بدون اینترنت و حفظ جلسه کاربر
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          برای ارتقای تجربه کاربری و ارائه قابلیت «پشتیبانی کامل آفلاین PWA»، کارباما از مکانیزم‌های استاندارد ذخیره‌سازی مرورگر استفاده می‌کند:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <HardDrive className="w-4 h-4 text-amber-500" />
              <span>حافظه مرورگر (localStorage & sessionStorage)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              ذخیره وضعیت ورود (جلسه کاری فعلی)، تم رنگی انتخابی (تاریک/روشن) و پیش‌نویس فرم‌های ثبت‌نام تا در صورت بسته‌شدن مرورگر اطلاعات شما از دست نرود.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>پایگاه داده آفلاین (IndexedDB: KarbamaOfflineDB)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              ذخیره محلی آگهی‌های شغلی و رزومه کاربر در دیتابیس درون مرورگر شما جهت امکان مرور فرصت‌های شغلی و شماره‌های ضروری حتی بدون داشتن اتصال به اینترنت.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: Data Security */}
      <section id="section-security" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۴. امنیت اطلاعات کاربران
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              استاندارهای فنی و امنیتی به‌کاررفته برای حفاظت از داده‌های شما
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">رمزنگاری ارتباطات (SSL / HTTPS)</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                تمام ارتباطات میان مرورگر شما و سرورهای کارباما از طریق پروتکل امن SSL/TLS رمزنگاری می‌شود تا امکان شنود یا سرقت اطلاعات وجود نداشته باشد.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50">
            <Server className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">قوانین دسترسی دیتابیس (Firestore Security Rules)</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                پایگاه داده ابری کارباما مجهز به قوانین امنیتی هوشمند است که مانع از دسترسی یا دستکاری اطلاعات حساب توسط افراد ناشناس می‌شود.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50">
            <UserCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">کنترل سطح دسترسی (RBAC)</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                مدارک حساس مانند عکس پاسپورت، عکس کارت بانکی و امضای دیجیتال تنها توسط مدیریت ارشد کارباما برای احراز هویت قابل مشاهده است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Third-Party Services */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۵. خدمات و ابزارهای شخص ثالث
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سرویس‌ها و زیرساخت‌های متصل به پروژه کارباما
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          پروژه کارباما از خدمات زیرساختی معتبر زیر برای میزبانی و پردازش داده‌ها استفاده می‌کند:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Google Firebase</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">پایگاه داده ابری Firestore & Auth</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Vercel & Cloud Hosting</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">میزبانی وب و تحویل سریع محتوا</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Vazirmatn Fonts</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">فونت استاندارد فارسی کارباما</span>
          </div>
        </div>
      </section>

      {/* SECTION 6: User Rights */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-500 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۶. حقوق کاربران درباره اطلاعاتشان
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اختیارات شما نسبت به داده‌های شخصی ثبت‌شده در کارباما
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-2">
            <span className="font-bold text-teal-700 dark:text-teal-300 block">حق دسترسی و ویرایش</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              شما می‌توانید در هر زمان با ورود به بخش «تنظیمات و پروفایل»، اطلاعات شخصی، سوابق کاری و رزومه خود را ویرایش و به‌روزرسانی کنید.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-2">
            <span className="font-bold text-teal-700 dark:text-teal-300 block">حق حذف و پاکسازی حساب</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              می‌توانید از طریق ارتباط با مدیریت در «چت آنلاین»، درخواست پاکسازی کامل حساب و مدارک خود را ثبت کنید تا داده‌ها به طور دائم حذف شوند.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: Contacting Site Administrator */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ۷. نحوه تماس با مسئول سایت و پشتیبانی
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              کانال‌های رسمی جهت طرح سوالات، انتقادات یا درخواست‌های حریم خصوصی
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-2">
            <MessageSquare className="w-6 h-6 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">چت آنلاین با مدیر</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              دکمه گرد شناور در گوشه پایین تمام صفحات
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-2">
            <PhoneCall className="w-6 h-6 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">تلفن‌های ضروری اقامت</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              شماره ۱۵۷ (اقامت ترکیه) و ۱۷۰ (وزارت کار)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-blue-500 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">مسئول فنی و توسعه‌دهنده</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
              Naser Tavakkoli . @Ntgalaxy
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: Last Updated Date & Bottom Notice */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 text-center space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
          <Calendar className="w-4 h-4" />
          <span>۸. تاریخ آخرین به‌روزرسانی سند: ۱۲ آبان ۱۴۰۵ (نوامبر ۲۰۲۶)</span>
        </div>
        <p className="max-w-2xl mx-auto text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          هرگونه تغییر در مفاد این سیاست‌نامه از طریق همین صفحه به اطلاع تمامی کاربران کارباما خواهد رسید. ادامه استفاده از خدمات کارباما به منزله پذیرش آخرین نسخه این سند می‌باشد.
        </p>
      </div>
    </div>
  );
};
