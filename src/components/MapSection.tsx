import React, { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { useApp } from '../context/AppContext';
import { Hotel as HotelType } from '../types';
import {
  MapPin,
  Navigation,
  Building2,
  Hotel,
  Train,
  HeartPulse,
  Landmark,
  Coins,
  ShieldAlert,
  Search,
  Compass,
  Plus,
  ShieldCheck,
  Calendar,
  Phone,
  MessageCircle,
  ExternalLink,
  X,
  CheckCircle2,
  Users,
  Moon,
  Sparkles,
} from 'lucide-react';

export const MapSection: React.FC = () => {
  const { setActiveTab, isAdminLoggedIn, bookHotel, showToast, currentSeeker } = useApp();
  const [selectedCity, setSelectedCity] = useState('استانبول');

  // Selected Hotel from Map for Booking / Details Modal
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<HotelType | null>(null);

  // Booking Form State
  const [guestName, setGuestName] = useState(currentSeeker?.fullName || '');
  const [guestPhone, setGuestPhone] = useState(currentSeeker?.phone || '');
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [nights, setNights] = useState(3);
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingNote, setBookingNote] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleOpenBookingModal = (hotel: HotelType) => {
    setSelectedHotelForBooking(hotel);
    setBookingSuccess(false);
    if (currentSeeker?.fullName && !guestName) {
      setGuestName(currentSeeker.fullName);
    }
    if (currentSeeker?.phone && !guestPhone) {
      setGuestPhone(currentSeeker.phone);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelForBooking) return;

    if (!guestName.trim() || !guestPhone.trim()) {
      showToast('لطفاً نام و شماره تماس مسافر را وارد نمایید', 'error');
      return;
    }

    const totalPrice = selectedHotelForBooking.pricePerNight * nights;

    const res = bookHotel({
      hotelId: selectedHotelForBooking.id,
      hotelName: selectedHotelForBooking.name,
      city: selectedHotelForBooking.city,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      checkInDate,
      nights,
      guestsCount,
      totalPrice,
      note: bookingNote.trim() || 'رزرو مستقیم از روی نقشه ماهواره‌ای کارباما',
    });

    if (res.success) {
      setBookingSuccess(true);
      showToast(`رزرو هتل ${selectedHotelForBooking.name} با موفقیت ثبت شد`, 'success');
    } else {
      showToast(res.error || 'خطا در ثبت رزرو', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Dynamically adapts to selected theme color) */}
      <div
        style={{ background: 'var(--primary-banner)' }}
        className="relative rounded-3xl overflow-hidden border border-red-500/30 p-6 sm:p-8 shadow-2xl transition-all duration-300"
      >
        <div
          style={{ backgroundColor: 'var(--primary-color)' }}
          className="absolute top-0 left-0 w-96 h-96 opacity-15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-color)',
                borderColor: 'var(--primary-border)',
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3"
            >
              <Compass className="w-3.5 h-3.5" />
              سامانه ماهواره‌ای و ناوبری شهری کارباما
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              نقشه تعاملی و جامع اماکن ترکیه
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              مشاهده دقیق موقعیت سفارت و کنسولگری‌های ایران، ادارات مهاجرت (Göç)، هتل‌ها و خوابگاه‌های اقتصادی، ایستگاه‌های متروبوس ۲۴ ساعته و بیمارستان‌های دولتی.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('addresses')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Hotel className="w-4 h-4 text-amber-400" />
              لیست متنی هتل‌ها و آدرس‌ها
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              style={{ backgroundColor: 'var(--primary-color)' }}
              className="px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-lg transition hover:opacity-90 flex items-center gap-1.5"
            >
              فرصت‌های استخدام
            </button>
          </div>
        </div>
      </div>

      {/* Admin Action Ribbon */}
      {isAdminLoggedIn && (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-amber-300 text-sm">دسترسی مدیریت نقشه و اماکن فعال است</h3>
              <p className="text-xs text-slate-300">
                شما می‌توانید هتل‌ها و اقامتگاه‌های جدید را با پین‌گذاری دقیق روی نقشه ماهواره‌ای ثبت یا ویرایش کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('addresses')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ افزودن هتل جدید با نقشه</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs transition"
            >
              پنل مدیریت کامل
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <InteractiveMap
          initialCity={selectedCity}
          heightClass="h-[620px]"
          showCategoryFilters={true}
          onBookHotel={(hotel) => {
            if (hotel) {
              handleOpenBookingModal(hotel);
            }
          }}
          onSelectLocation={(point) => {
            if (point.category === 'hotel' && point.rawItem) {
              handleOpenBookingModal(point.rawItem);
            }
          }}
        />
      </div>

      {/* DIRECT HOTEL BOOKING & DETAILS MODAL FROM MAP */}
      {selectedHotelForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6 text-right">
            {/* Modal Header */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src={selectedHotelForBooking.imageUrl}
                alt={selectedHotelForBooking.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex items-end p-5">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-slate-950 font-black text-xs">
                      {selectedHotelForBooking.stars} ستاره
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      {selectedHotelForBooking.pricePerNight.toLocaleString()} لیر / هر شب
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white leading-tight">
                    {selectedHotelForBooking.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono" dir="ltr">
                    {selectedHotelForBooking.nameTr}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHotelForBooking(null)}
                className="absolute top-3 left-3 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition backdrop-blur-xs shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {/* Hotel Quick Info */}
              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{selectedHotelForBooking.address}</span>
                </div>
                {selectedHotelForBooking.nearTransit && (
                  <div className="flex items-center gap-2 text-blue-300">
                    <Train className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{selectedHotelForBooking.nearTransit}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <span className="text-slate-400 font-bold block mb-1.5">امکانات و خدمات هتل:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHotelForBooking.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {selectedHotelForBooking.phone && (
                  <a
                    href={`tel:${selectedHotelForBooking.phone.replace(/\s/g, '')}`}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>تماس تلفنی</span>
                  </a>
                )}
                {selectedHotelForBooking.whatsapp && (
                  <a
                    href={`https://wa.me/${selectedHotelForBooking.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساپ هتل</span>
                  </a>
                )}
                <a
                  href={
                    selectedHotelForBooking.mapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${selectedHotelForBooking.coordinates?.lat},${selectedHotelForBooking.coordinates?.lng}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md col-span-2 sm:col-span-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>مسیریابی نقشه</span>
                </a>
              </div>

              {/* Booking Form or Success State */}
              {bookingSuccess ? (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">رزرو اقامتگاه با موفقیت ثبت شد</h4>
                  <p className="text-xs text-slate-300">
                    هماهنگی لازم با پذیرش هتل انجام شد. اطلاعات رزرو در بخش «درخواست‌های من» ذخیره گردید.
                  </p>
                  <button
                    onClick={() => setSelectedHotelForBooking(null)}
                    className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                  >
                    بستن
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      فرم رزرو سریع و مستقیم هتل
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      مجموع: {(nights * selectedHotelForBooking.pricePerNight).toLocaleString()} لیر
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">نام و نام خانوادگی مسافر *</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="مثلاً: علی رضایی"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">شماره تماس مسافر *</label>
                      <input
                        type="text"
                        dir="ltr"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+90 534 000 0000"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">تاریخ ورود</label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">تعداد شب</label>
                      <select
                        value={nights}
                        onChange={(e) => setNights(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                      >
                        {[1, 2, 3, 4, 5, 7, 10, 14, 30].map((n) => (
                          <option key={n} value={n}>
                            {n} شب
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">تعداد نفرات</label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                      >
                        {[1, 2, 3, 4, 5].map((g) => (
                          <option key={g} value={g}>
                            {g} نفر
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">یادداشت برای هتل (اختیاری)</label>
                    <input
                      type="text"
                      value={bookingNote}
                      onChange={(e) => setBookingNote(e.target.value)}
                      placeholder="ساعت ورود تقریبی، درخواست اتاق آرام و..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedHotelForBooking(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition"
                    >
                      ثبت نهایی رزرو هتل
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
