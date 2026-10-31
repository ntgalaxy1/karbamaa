import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Hotel } from '../types';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import { InteractiveMap, calculateDistanceKm } from './InteractiveMap';
import {
  Hotel as HotelIcon,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Calendar,
  Users,
  CheckCircle,
  Search,
  Sparkles,
  Train,
  X,
  CreditCard,
  ShieldCheck,
  Building,
  Crosshair,
  Compass,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Layers,
} from 'lucide-react';
import { MapLocationPicker } from './MapLocationPicker';

export const HotelsSection: React.FC = () => {
  const {
    hotels,
    addHotel,
    updateHotel,
    deleteHotel,
    bookHotel,
    currentSeeker,
    isAdminLoggedIn,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('همه');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Quick User Geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [sortByNearest, setSortByNearest] = useState<boolean>(true);

  // Booking modal
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
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

  // Admin Hotel Add & Edit State (Enabled when Admin is logged in)
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelNameTr, setNewHotelNameTr] = useState('');
  const [newHotelCity, setNewHotelCity] = useState('استانبول');
  const [newHotelDistrict, setNewHotelDistrict] = useState('آکسارای');
  const [newHotelType, setNewHotelType] = useState<'hotel' | 'hostel' | 'apart' | 'pension'>('hotel');
  const [newHotelStars, setNewHotelStars] = useState(3);
  const [newHotelPrice, setNewHotelPrice] = useState(900);
  const [newHotelAddress, setNewHotelAddress] = useState('');
  const [newHotelPhone, setNewHotelPhone] = useState('+90 212 588 0000');
  const [newHotelWhatsapp, setNewHotelWhatsapp] = useState('+90 534 000 0000');
  const [newHotelImageUrl, setNewHotelImageUrl] = useState('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
  const [newHotelAmenities, setNewHotelAmenities] = useState('وای‌فای رایگان، صبحانه بوفه، پرسنل فارسی‌زبان، لاندری');
  const [newHotelNearTransit, setNewHotelNearTransit] = useState('۲ دقیقه تا ایستگاه مترو و تراموا');
  const [newHotelDesc, setNewHotelDesc] = useState('هتل تمیز و اقتصادی مناسب اقامت کارجویان و مسافران با دسترسی عالی');
  const [newHotelCoordinates, setNewHotelCoordinates] = useState<{ lat: number; lng: number }>({ lat: 41.0082, lng: 28.9484 });

  // Fast auto-locate on mount
  const detectUserLocation = (isAuto = false) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        if (!isAuto) showToast('مرورگر شما از مکان‌یابی پشتیبانی نمی‌کند', 'info');
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setSortByNearest(true);
          showToast('موقعیت کنونی شما سریعاً شناسایی شد و نزدیک‌ترین هتل‌ها محاسبه شدند', 'success');
        },
        () => {
          setIsLocating(false);
          if (!isAuto) {
            showToast('دسترسی به مکان‌یابی امکان‌پذیر نشد یا مسدود است.', 'info');
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } catch {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    detectUserLocation(true);
  }, []);

  const hotelsWithDistance = useMemo(() => {
    const list = hotels
      .filter((h) => {
        if (selectedCity !== 'همه' && h.city !== selectedCity) return false;
        if (h.pricePerNight > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = h.name.toLowerCase().includes(q) || h.nameTr.toLowerCase().includes(q);
          const matchesDistrict = h.district.toLowerCase().includes(q);
          const matchesDesc = h.description.toLowerCase().includes(q);
          if (!matchesName && !matchesDistrict && !matchesDesc) return false;
        }
        return true;
      })
      .map((h) => {
        let distanceKm: number | null = null;
        if (userCoords && h.coordinates) {
          distanceKm = calculateDistanceKm(
            userCoords.lat,
            userCoords.lng,
            h.coordinates.lat,
            h.coordinates.lng
          );
        }
        return { ...h, distanceKm };
      });

    if (sortByNearest && userCoords) {
      list.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
    }

    return list;
  }, [hotels, selectedCity, maxPrice, searchQuery, userCoords, sortByNearest]);

  const handleOpenBooking = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setGuestName(currentSeeker?.fullName || '');
    setGuestPhone(currentSeeker?.phone || '');
    setBookingConfirmed(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel) return;

    const totalPrice = selectedHotel.pricePerNight * nights;
    const res = bookHotel({
      hotelId: selectedHotel.id,
      hotelName: selectedHotel.name,
      city: selectedHotel.city,
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

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim() || !newHotelPrice) {
      showToast('لطفاً نام هتل و قیمت را وارد نمایید', 'error');
      return;
    }
    const amenitiesList = newHotelAmenities.split('،').join(',').split(',').map((a) => a.trim()).filter(Boolean);

    addHotel({
      name: newHotelName.trim(),
      nameTr: newHotelNameTr.trim() || newHotelName.trim(),
      city: newHotelCity,
      district: newHotelDistrict.trim(),
      stars: Number(newHotelStars) || 3,
      type: newHotelType,
      pricePerNight: Number(newHotelPrice) || 850,
      address: newHotelAddress.trim() || `${newHotelDistrict}, ${newHotelCity}`,
      phone: newHotelPhone.trim(),
      whatsapp: newHotelWhatsapp.trim(),
      imageUrl: newHotelImageUrl.trim(),
      amenities: amenitiesList.length > 0 ? amenitiesList : ['وای‌فای رایگان'],
      nearTransit: newHotelNearTransit.trim() || 'نزدیک به ایستگاه مترو',
      description: newHotelDesc.trim() || 'هتل تمیز و اقتصادی مناسب اقامت کارجویان و مسافران با دسترسی عالی',
      mapsUrl: `https://www.google.com/maps?q=${newHotelCoordinates.lat},${newHotelCoordinates.lng}`,
      coordinates: newHotelCoordinates,
    });

    setShowAddHotelModal(false);
    setNewHotelName('');
    setNewHotelNameTr('');
    setNewHotelAddress('');
    showToast('هتل جدید با موقعیت مکانی دقیق روی نقشه با موفقیت ثبت شد', 'success');
  };

  const handleSaveEditHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    updateHotel(editingHotel.id, editingHotel);
    setEditingHotel(null);
    showToast('مشخصات هتل با موفقیت بروزرسانی شد', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/30 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-semibold mb-3">
            <HotelIcon className="w-3.5 h-3.5" />
            هتل‌های نزدیک من، اقتصادی و دارای پرسنل فارسی‌زبان
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            اقامتگاه‌ها و هتل‌های نزدیک در ترکیه
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            محل‌های اسکان ارزان‌قیمت، خوابگاه‌های تمیز و هتل‌های واقع در نزدیکی خطوط مترو و تراموا (آکسارای، تقسیم، کادیکوی، لارا) برای روزهای اول ورود و تا زمان استخدام در کار دارای جای خواب.
          </p>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              placeholder="جستجو در هتل‌ها بر اساس نام یا منطقه (آکسارای، تقسیم، کادیکوی، لارا)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 hover:border-red-500/50 focus:border-red-500 text-white placeholder-slate-400 pr-12 pl-4 py-3 rounded-2xl text-sm focus:outline-hidden shadow-lg transition"
            />
          </div>
        </div>
      </div>

      {/* Admin Action Bar (Only visible when logged in as Admin with username/password) */}
      {isAdminLoggedIn && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">دسترسی مدیریت هتل‌ها و اقامتگاه‌ها فعال است</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                امکان افزودن هتل جدید با انتخاب لوکیشن مستقیم از روی نقشه ماهواره‌ای و ویرایش تمام هتل‌ها فعال می‌باشد.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddHotelModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-700/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن هتل و اقامتگاه جدید (با نقشه)</span>
          </button>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* City Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium ml-1">شهر:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold"
          >
            <option value="همه">همه شهرهای ترکیه</option>
            {ALL_TURKEY_CITIES_FA.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Price Slider */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span>حداکثر قیمت:</span>
          <span className="font-mono font-bold text-amber-300">{maxPrice.toLocaleString('fa-IR')} لیر / شب</span>
          <input
            type="range"
            min={400}
            max={2500}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-32 accent-red-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Geolocation Live Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              userCoords
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              {isLocating ? (
                <span className="text-blue-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                  در حال جستجوی سریع موقعیت مکانی شما...
                </span>
              ) : userCoords ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  موقعیت مکانی شما شناسایی شد — مرتب‌شده بر اساس نزدیک‌ترین هتل‌ها
                </span>
              ) : (
                <span className="text-slate-300">مکان‌یابی سریع برای یافتن نزدیک‌ترین هتل‌ها به شما</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {userCoords
                ? 'فواصل دقیقاً محاسبه شده و هتل‌ها از نزدیک‌ترین به دورترین چیده شده‌اند.'
                : 'برای مشاهده هتل‌های نزدیک به محل اقامت یا ورود خود، دکمه مکان‌یابی را بزنید.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userCoords && (
            <button
              onClick={() => setSortByNearest((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                sortByNearest
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>نزدیک‌ترین به من {sortByNearest ? '✓' : ''}</span>
            </button>
          )}

          <button
            onClick={() => detectUserLocation(false)}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{userCoords ? 'بروزرسانی موقعیت' : 'یافتن موقعیت من'}</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle: Grid Cards vs Interactive Map */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-bold">
            {viewMode === 'grid'
              ? `نمایش ${hotelsWithDistance.length} هتل و اقامتگاه در ترکیه`
              : 'انتخاب مستقیم و رزرو هتل از روی نقشه ماهواره‌ای'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">({selectedCity})</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>لیست و کارت‌ها</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>انتخاب از روی نقشه</span>
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              روی نشانگر هر هتل یا پین زرد کلیک کنید تا مشخصات و فرم رزرو مستقیم باز شود:
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{hotelsWithDistance.length} هتل فعال</span>
          </div>
          <InteractiveMap
            initialCity={selectedCity === 'همه' ? 'استانبول' : selectedCity}
            heightClass="h-[600px]"
            showCategoryFilters={false}
            onBookHotel={(hotel) => {
              if (hotel) {
                setSelectedHotel(hotel);
                setBookingConfirmed(false);
              }
            }}
            onSelectLocation={(pt) => {
              if (pt.category === 'hotel' && pt.rawItem) {
                setSelectedHotel(pt.rawItem);
                setBookingConfirmed(false);
              }
            }}
          />
        </div>
      ) : (
        /* Hotels Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hotelsWithDistance.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition"
            >
              <div>
                {/* Hotel Image with Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                {/* Stars badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{hotel.stars} ستاره</span>
                </div>

                {/* Live Distance badge */}
                {hotel.distanceKm !== null && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 text-xs font-extrabold shadow-lg">
                    <Navigation className="w-3.5 h-3.5 shrink-0" />
                    <span>{hotel.distanceKm.toLocaleString('fa-IR')} ک.م از شما</span>
                  </div>
                )}

                {/* Price tag */}
                <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-extrabold shadow-md font-mono">
                  {hotel.pricePerNight.toLocaleString('fa-IR')} لیر / شب
                </div>

                {/* District badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {hotel.city} - {hotel.district}
                </div>
              </div>

              {/* Hotel Details */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">
                    {hotel.nameTr}
                  </p>
                </div>

                {/* Distance in details */}
                {hotel.distanceKm !== null && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                    <Navigation className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>فاصله از موقعیت کنونی شما: {hotel.distanceKm.toLocaleString('fa-IR')} کیلومتر</span>
                  </div>
                )}

                {/* Proximity to Transit */}
                <div className="flex items-center gap-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                  <Train className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{hotel.nearTransit}</span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {hotel.description}
                </p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hotel.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[11px] border border-slate-700/60"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${hotel.phone.replace(/\s/g, '')}`}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                  title="تماس تلفنی با هتل"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                </a>

                {hotel.whatsapp && (
                  <a
                    href={`https://wa.me/${hotel.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition"
                    title="ارسال پیام به واتساپ هتل"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}

                <a
                  href={
                    hotel.coordinates && userCoords
                      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${hotel.coordinates.lat},${hotel.coordinates.lng}`
                      : hotel.mapsUrl ||
                        (hotel.coordinates
                          ? `https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.lat},${hotel.coordinates.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.city)}`)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl transition flex items-center gap-1"
                  title="مسیریابی مستقیم از موقعیت شما"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              </div>

              <button
                onClick={() => handleOpenBooking(hotel)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                رزرو آنلاین هتل
              </button>
            </div>

            {/* Admin Controls on Hotel Card */}
            {isAdminLoggedIn && (
              <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-amber-400 font-bold">کنترل مدیر:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingHotel(hotel);
                    }}
                    className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    title="ویرایش اطلاعات این هتل"
                  >
                    <Edit className="w-3 h-3" />
                    <span>ویرایش</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`آیا از حذف هتل «${hotel.name}» اطمینان دارید؟`)) {
                        deleteHotel(hotel.id);
                      }
                    }}
                    className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    title="حذف هتل"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Booking Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">رزرو اقامت در {selectedHotel.name}</h3>
                <p className="text-xs text-slate-400 font-mono" dir="ltr">{selectedHotel.city} - {selectedHotel.district}</p>
              </div>
              <button
                onClick={() => setSelectedHotel(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-white">درخواست رزرو شما تایید شد!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  رزرو شما برای هتل <strong>{selectedHotel.name}</strong> با موفقیت ثبت گردید. نیازی به پرداخت اینترنتی نیست؛ مبلغ <strong>{(selectedHotel.pricePerNight * nights).toLocaleString('fa-IR')} لیر</strong> هنگام تحویل کلید در هتل به صورت نقدی یا کارت پرداخت خواهد شد.
                </p>
                <div className="p-3 bg-slate-800 rounded-xl text-xs font-mono text-slate-300">
                  شماره هماهنگی پذیرش: {selectedHotel.phone}
                </div>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                >
                  بستن
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 text-xs">
                {/* Hotel Summary */}
                <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
                  <img
                    src={selectedHotel.imageUrl}
                    alt={selectedHotel.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">{selectedHotel.name}</h4>
                    <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                      هر شب: {selectedHotel.pricePerNight.toLocaleString('fa-IR')} لیر
                    </p>
                    <p className="text-[10px] text-slate-400">{selectedHotel.nearTransit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">نام و نام خانوادگی رزروکننده *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: علی رضایی"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">شماره تماس / واتساپ *</label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="+90 5XX XXX XXXX یا ایران"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-red-500 text-left"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">تاریخ ورود *</label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">تعداد شب‌ها</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">تعداد نفرات</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">توضیحات یا درخواست ویژه (اختیاری)</label>
                  <input
                    type="text"
                    placeholder="مثلاً: ورود دیرهنگام در نیمه‌شب، اتاق آرام..."
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                {/* Price summary */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">مبلغ کل اقامت ({nights} شب):</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {(selectedHotel.pricePerNight * nights).toLocaleString('fa-IR')} لیر
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 text-left">
                    پرداخت در هتل به صورت نقدی یا ارزی
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  تایید و ثبت رایگان رزرو هتل
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADMIN ADD HOTEL MODAL WITH MAP LOCATION PICKER */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <HotelIcon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">افزودن هتل و اقامتگاه جدید (با انتخاب از روی نقشه)</h3>
              </div>
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              {/* Interactive Map Picker */}
              <div className="p-4 bg-slate-950/80 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    انتخاب لوکیشن دقیق هتل روی نقشه ماهواره‌ای ترکیه:
                  </span>
                  <span className="text-[11px] text-slate-400">روی نقشه کلیک یا مارکر را جابجا کنید</span>
                </div>

                <MapLocationPicker
                  initialCoordinates={newHotelCoordinates}
                  onChange={(coords) => setNewHotelCoordinates(coords)}
                  defaultCity={newHotelCity}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono" dir="ltr">
                  <span>Lat: {newHotelCoordinates.lat.toFixed(5)}</span>
                  <span>Lng: {newHotelCoordinates.lng.toFixed(5)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام هتل (فارسی) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: هتل بزرگ آکسارای"
                    value={newHotelName}
                    onChange={(e) => setNewHotelName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام هتل (ترکی / لاتین)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Aksaray Grand Hotel"
                    value={newHotelNameTr}
                    onChange={(e) => setNewHotelNameTr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={newHotelCity}
                    onChange={(e) => setNewHotelCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="ازمیر">ازمیر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله</label>
                  <input
                    type="text"
                    value={newHotelDistrict}
                    onChange={(e) => setNewHotelDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">قیمت هر شب (لیر) *</label>
                  <input
                    type="number"
                    required
                    value={newHotelPrice}
                    onChange={(e) => setNewHotelPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تعداد ستاره</label>
                  <select
                    value={newHotelStars}
                    onChange={(e) => setNewHotelStars(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  >
                    <option value={1}>۱ ستاره</option>
                    <option value={2}>۲ ستاره</option>
                    <option value={3}>۳ ستاره</option>
                    <option value={4}>۴ ستاره</option>
                    <option value={5}>۵ ستاره</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس هتل</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelPhone}
                    onChange={(e) => setNewHotelPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره واتساپ هتل</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelWhatsapp}
                    onChange={(e) => setNewHotelWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">امکانات (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  value={newHotelAmenities}
                  onChange={(e) => setNewHotelAmenities(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">آدرس متنی کامل</label>
                <input
                  type="text"
                  value={newHotelAddress}
                  onChange={(e) => setNewHotelAddress(e.target.value)}
                  placeholder="مثلاً: استانبول، فاتیح، میدان آکسارای، پلاک ۱۲"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHotelModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ثبت هتل روی نقشه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN EDIT HOTEL MODAL WITH MAP LOCATION PICKER */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-600/20 text-amber-400 rounded-xl">
                  <Edit className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">ویرایش اطلاعات و لوکیشن هتل «{editingHotel.name}»</h3>
              </div>
              <button
                onClick={() => setEditingHotel(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditHotel} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              {/* Interactive Map Picker for editing coordinates */}
              <div className="p-4 bg-slate-950/80 border border-amber-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                    <Compass className="w-4 h-4 text-amber-400" />
                    ویرایش موقعیت مکانی هتل روی نقشه:
                  </span>
                  <span className="text-[11px] text-slate-400">برای تغییر لوکیشن روی نقشه کلیک کنید</span>
                </div>

                <MapLocationPicker
                  initialCoordinates={editingHotel.coordinates || { lat: 41.0082, lng: 28.9484 }}
                  onChange={(coords) =>
                    setEditingHotel((prev) => (prev ? { ...prev, coordinates: coords } : null))
                  }
                  defaultCity={editingHotel.city}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام هتل (فارسی)</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام هتل (ترکی / لاتین)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingHotel.nameTr}
                    onChange={(e) => setEditingHotel({ ...editingHotel, nameTr: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={editingHotel.city}
                    onChange={(e) => setEditingHotel({ ...editingHotel, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="ازمیر">ازمیر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه</label>
                  <input
                    type="text"
                    value={editingHotel.district}
                    onChange={(e) => setEditingHotel({ ...editingHotel, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">قیمت هر شب (لیر)</label>
                  <input
                    type="number"
                    value={editingHotel.pricePerNight}
                    onChange={(e) => setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ستاره</label>
                  <select
                    value={editingHotel.stars}
                    onChange={(e) => setEditingHotel({ ...editingHotel, stars: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  >
                    <option value={1}>۱ ستاره</option>
                    <option value={2}>۲ ستاره</option>
                    <option value={3}>۳ ستاره</option>
                    <option value={4}>۴ ستاره</option>
                    <option value={5}>۵ ستاره</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingHotel.phone}
                    onChange={(e) => setEditingHotel({ ...editingHotel, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نزدیک به ایستگاه</label>
                  <input
                    type="text"
                    value={editingHotel.nearTransit}
                    onChange={(e) => setEditingHotel({ ...editingHotel, nearTransit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">آدرس کامل</label>
                <input
                  type="text"
                  value={editingHotel.address}
                  onChange={(e) => setEditingHotel({ ...editingHotel, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات</label>
                <textarea
                  rows={2}
                  value={editingHotel.description}
                  onChange={(e) => setEditingHotel({ ...editingHotel, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ذخیره تغییرات هتل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
