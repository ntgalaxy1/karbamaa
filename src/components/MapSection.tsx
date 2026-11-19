import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { HotelsSection } from './HotelsSection';
import { TransitSection } from './TransitSection';
import { Hotel } from '../types';
import {
  Map,
  Hotel as HotelIcon,
  Train,
  Compass,
  Navigation,
  Phone,
  Calendar,
  X,
  CheckCircle,
  MapPin,
  ShieldAlert,
  Sparkles,
  Globe,
  ExternalLink,
  Coins,
} from 'lucide-react';

export const MapSection: React.FC = () => {
  const { bookHotel, currentSeeker, addresses, hotels, transitHubs, formatTryToIrr, liveRates } = useApp();

  const [subTab, setSubTab] = useState<'map' | 'hotels' | 'transit'>('map');
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null);

  // Quick booking modal triggered directly from interactive map pin
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null);
  const [guestName, setGuestName] = useState(currentSeeker?.fullName || '');
  const [guestPhone, setGuestPhone] = useState(currentSeeker?.phone || '');
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [nights, setNights] = useState(2);
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingNote, setBookingNote] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleOpenMapHotelBooking = (hotel: Hotel) => {
    setBookingHotel(hotel);
    setGuestName(currentSeeker?.fullName || '');
    setGuestPhone(currentSeeker?.phone || '');
    setBookingConfirmed(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHotel) return;

    const totalPrice = bookingHotel.pricePerNight * nights;
    const res = bookHotel({
      hotelId: bookingHotel.id,
      hotelName: bookingHotel.name,
      city: bookingHotel.city,
      guestName,
      guestPhone,
      checkInDate,
      nights,
      guestsCount,
      totalPrice,
      note: bookingNote,
    });

    if (res.success) {
      setBookingConfirmed(true);
    }
  };

  const totalLocations = addresses.length + hotels.length + transitHubs.length;

  return (
    <div className="space-y-6 text-right">
      {/* Top Hero Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-red-600/20 text-blue-900 dark:text-red-300 border border-blue-300 dark:border-red-500/30 text-xs font-extrabold">
              <Compass className="w-3.5 h-3.5" />
              <span>نقشه تعاملی، دایرکتوری هتل‌ها و شبکه متروبوس ترکیه</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              نقشه زنده هتل‌ها، مراکز مهاجرت، کنسولگری و متروبوس
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              موقعیت دقیق {totalLocations.toLocaleString('fa-IR')} مرکز مهم، هتل‌های اقتصادی، ایستگاه‌های متروبوس ۲۴ ساعته و بیمارستان‌ها به همراه قیمت لحظه‌ای به لیر و ریال/تومان و لینک مستقیم وب‌سایت رزرو هر هتل.
            </p>
          </div>

          {/* Sub-Tab Switcher Pills */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setSubTab('map')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                subTab === 'map'
                  ? 'bg-blue-600 dark:bg-red-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>نقشه تعاملی ({totalLocations.toLocaleString('fa-IR')})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('hotels')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                subTab === 'hotels'
                  ? 'bg-blue-600 dark:bg-red-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <HotelIcon className="w-4 h-4" />
              <span>هتل‌ها و رزرو ({hotels.length.toLocaleString('fa-IR')})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('transit')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                subTab === 'transit'
                  ? 'bg-blue-600 dark:bg-red-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>متروبوس و مترو</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Based on Sub-Tab */}
      {subTab === 'map' && (
        <div className="space-y-6">
          {/* Interactive Map Component */}
          <InteractiveMap
            initialCity="استانبول"
            focusedLocationId={focusedLocationId}
            onBookHotel={handleOpenMapHotelBooking}
            heightClass="h-[560px]"
          />

          {/* Quick Jump Directory below the map */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hotels Quick Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5">
                    <HotelIcon className="w-3.5 h-3.5" />
                    اسکان اقتصادی و هتل‌ها
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold">
                    {hotels.length.toLocaleString('fa-IR')} هتل فعال
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  دایرکتوری هتل‌ها با لینک رزرو آنلاین
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  مشاهده لیست کامل هتل‌ها و پانسیون‌های آکسارای، تقسیم، شیشلی، مرتر، اسنیورت و کادیکوی با معادل لحظه‌ای ریال/تومان و وب‌سایت رسمی هر هتل.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('hotels')}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <HotelIcon className="w-4 h-4" />
                <span>مشاهده لیست هتل‌ها و رزرو آنلاین</span>
              </button>
            </div>

            {/* Transit Quick Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 text-xs font-extrabold flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5" />
                    حمل‌ونقل ۲۴ ساعته
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold">
                    {transitHubs.length.toLocaleString('fa-IR')} ایستگاه
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  خطوط متروبوس، مترو و مارمارای
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  راهنمای تردد شبانه‌روزی در استانبول، نحوه خرید استانبول‌کارت و ایستگاه‌های تقاطعی مهم بین بخش اروپایی و آسیایی.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('transit')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Train className="w-4 h-4" />
                <span>راهنمای متروبوس و خطوط مترو</span>
              </button>
            </div>

            {/* Emergency & Consulates Quick Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30 text-xs font-extrabold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    تلفن‌های فوریتی ترکیه
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    شبانه‌روزی ۲۴/۷
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  شماره‌های اضطراری و اداره مهاجرت
                </h3>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:112"
                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-500/40 text-center hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                  >
                    <span className="text-base font-black text-red-700 dark:text-red-400 font-mono block">
                      112
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                      اورژانس و پلیس
                    </span>
                  </a>
                  <a
                    href="tel:157"
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-center hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                  >
                    <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono block">
                      157
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                      اداره مهاجرت (فارسی)
                    </span>
                  </a>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>پاسخگویی خط ۱۵۷ اداره مهاجرت به زبان فارسی ۲۴ ساعته فعال است.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'hotels' && <HotelsSection />}

      {subTab === 'transit' && <TransitSection />}

      {/* Quick Hotel Booking Modal from Interactive Map */}
      {bookingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  رزرو مستقیم از روی نقشه: {bookingHotel.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono" dir="ltr">
                  {bookingHotel.city} - {bookingHotel.district}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingHotel(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  درخواست رزرو شما ثبت شد!
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                  رزرو شما برای هتل <strong>{bookingHotel.name}</strong> ثبت شد. مبلغ کل اقامت (
                  <strong>{(bookingHotel.pricePerNight * nights).toLocaleString('fa-IR')} لیر</strong> / معادل لحظه‌ای:{' '}
                  <strong>{formatTryToIrr(bookingHotel.pricePerNight * nights).combinedText}</strong>) هنگام
                  ورود به هتل پرداخت می‌شود.
                </p>
                {bookingHotel.websiteUrl && (
                  <a
                    href={bookingHotel.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    <Globe className="w-4 h-4" />
                    <span>مشاهده سایت رسمی هتل و رزرو آنلاین</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setBookingHotel(null)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  بستن
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={bookingHotel.imageUrl}
                      alt={bookingHotel.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        {bookingHotel.name}
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono font-bold mt-0.5">
                        هر شب: {bookingHotel.pricePerNight.toLocaleString('fa-IR')} لیر (
                        {formatTryToIrr(bookingHotel.pricePerNight).tomanText})
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">
                        {bookingHotel.nearTransit}
                      </p>
                    </div>
                  </div>
                  {bookingHotel.websiteUrl && (
                    <a
                      href={bookingHotel.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>سایت هتل</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                      شماره تماس / واتساپ *
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-left"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                      تاریخ ورود *
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                      تعداد شب
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                      تعداد نفرات
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      مبلغ کل ({nights} شب):
                    </span>
                    <span className="text-base font-black text-amber-700 dark:text-amber-300 font-mono">
                      {(bookingHotel.pricePerNight * nights).toLocaleString('fa-IR')} لیر
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 dark:text-slate-400">معادل لحظه‌ای به نرخ روز:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatTryToIrr(bookingHotel.pricePerNight * nights).combinedText}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 dark:bg-red-600 hover:bg-blue-500 dark:hover:bg-red-500 text-white font-black rounded-xl shadow-lg transition cursor-pointer"
                >
                  تایید و ثبت رایگان رزرو
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
