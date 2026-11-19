import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Hotel } from '../types';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import { getDistrictsForCity } from '../data/turkeyData';
import { InteractiveMap, calculateDistanceKm } from './InteractiveMap';
import {
  Hotel as HotelIcon,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Calendar,
  CheckCircle,
  Search,
  Train,
  X,
  ShieldCheck,
  Building,
  Crosshair,
  Compass,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Globe,
  ExternalLink,
  Coins,
  Filter,
  Sparkles,
} from 'lucide-react';
import { MapLocationPicker } from './MapLocationPicker';

const QUICK_DISTRICTS = [
  { label: 'همه مناطق', value: 'همه' },
  { label: 'فاتیح / آکسارای', value: 'فاتیح' },
  { label: 'میدان تقسیم', value: 'تقسیم' },
  { label: 'شیشلی / مجیدیه‌کوی', value: 'شیشلی' },
  { label: 'مرتر / زیتون‌بورنو', value: 'مرتر' },
  { label: 'اسنیورت / بیلیک‌دوزو', value: 'اسنیورت' },
  { label: 'کادیکوی (آسیایی)', value: 'کادیکوی' },
  { label: 'کیزیلای (آنکارا)', value: 'کیزیلای' },
  { label: 'مورات‌پاشا / لارا (آنتالیا)', value: 'مورات' },
];

const QUICK_AMENITIES = [
  'وای‌فای',
  'صبحانه',
  'فارسی‌زبان',
  'لاندری',
  'آشپزخانه',
  '۲۴ ساعته',
];

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
    formatTryToIrr,
    liveRates,
  } = useApp();

  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('همه');
  const [selectedDistrict, setSelectedDistrict] = useState('همه');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [focusedHotelId, setFocusedHotelId] = useState<string | null>(null);
  const [activeDetailHotel, setActiveDetailHotel] = useState<Hotel | null>(null);

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

  // Admin Hotel Add & Edit State
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelNameTr, setNewHotelNameTr] = useState('');
  const [newHotelCity, setNewHotelCity] = useState('استانبول');
  const [newHotelDistrict, setNewHotelDistrict] = useState('فاتیح (آکسارای)');
  const [newHotelType, setNewHotelType] = useState<'hotel' | 'hostel' | 'apart' | 'pension'>('hotel');
  const [newHotelStars, setNewHotelStars] = useState(3);
  const [newHotelPrice, setNewHotelPrice] = useState(1100);
  const [newHotelMonthlyPrice, setNewHotelMonthlyPrice] = useState(23000);
  const [newHotelAddress, setNewHotelAddress] = useState('');
  const [newHotelPhone, setNewHotelPhone] = useState('+90 212 588 0000');
  const [newHotelWhatsapp, setNewHotelWhatsapp] = useState('+90 534 000 0000');
  const [newHotelWebsiteUrl, setNewHotelWebsiteUrl] = useState('https://www.booking.com');
  const [newHotelImageUrl, setNewHotelImageUrl] = useState(
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  );
  const [newHotelAmenities, setNewHotelAmenities] = useState(
    'وای‌فای رایگان، صبحانه بوفه، پرسنل فارسی‌زبان، لاندری'
  );
  const [newHotelNearTransit, setNewHotelNearTransit] = useState('۲ دقیقه تا ایستگاه مترو و تراموا');
  const [newHotelDesc, setNewHotelDesc] = useState(
    'هتل تمیز و اقتصادی مناسب اقامت کارجویان و مسافران با دسترسی عالی'
  );
  const [newHotelCoordinates, setNewHotelCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 41.0082,
    lng: 28.9484,
  });

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
          if (!isAuto) {
            showToast('موقعیت کنونی شما شناسایی شد و نزدیک‌ترین هتل‌ها محاسبه شدند', 'success');
          }
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

  const toggleAmenity = (am: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(am) ? prev.filter((item) => item !== am) : [...prev, am]
    );
  };

  const hotelsWithDistance = useMemo(() => {
    const list = hotels
      .filter((h) => {
        if (selectedCity !== 'همه' && h.city !== selectedCity) return false;
        if (selectedDistrict !== 'همه') {
          const distMatch =
            (h.district && h.district.includes(selectedDistrict)) ||
            (h.name && h.name.includes(selectedDistrict)) ||
            (h.address && h.address.includes(selectedDistrict));
          if (!distMatch) return false;
        }
        if (h.pricePerNight > maxPrice) return false;
        if (selectedAmenities.length > 0) {
          const joinedAmenities = (h.amenities || []).join(' ') + ' ' + h.description;
          const allMatched = selectedAmenities.every((am) => joinedAmenities.includes(am));
          if (!allMatched) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName =
            h.name.toLowerCase().includes(q) || h.nameTr.toLowerCase().includes(q);
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
  }, [hotels, selectedCity, selectedDistrict, selectedAmenities, maxPrice, searchQuery, userCoords, sortByNearest]);

  const handleSelectHotelOnMap = (hotel: Hotel) => {
    setFocusedHotelId(hotel.id);
    setActiveDetailHotel(hotel);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast(`موقعیت «${hotel.name}» روی نقشه تعاملی مشخص شد`, 'info');
  };

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
    const amenitiesList = newHotelAmenities
      .split('،')
      .join(',')
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    addHotel({
      name: newHotelName.trim(),
      nameTr: newHotelNameTr.trim() || newHotelName.trim(),
      city: newHotelCity,
      district: newHotelDistrict.trim(),
      stars: Number(newHotelStars) || 3,
      type: newHotelType,
      pricePerNight: Number(newHotelPrice) || 850,
      monthlyPrice: Number(newHotelMonthlyPrice) || undefined,
      address: newHotelAddress.trim() || `${newHotelDistrict}, ${newHotelCity}`,
      phone: newHotelPhone.trim(),
      whatsapp: newHotelWhatsapp.trim(),
      websiteUrl: newHotelWebsiteUrl.trim() || undefined,
      imageUrl: newHotelImageUrl.trim(),
      amenities: amenitiesList.length > 0 ? amenitiesList : ['وای‌فای رایگان'],
      nearTransit: newHotelNearTransit.trim() || 'نزدیک به ایستگاه مترو',
      description:
        newHotelDesc.trim() || 'هتل تمیز و اقتصادی مناسب اقامت کارجویان و مسافران با دسترسی عالی',
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
    <div className="space-y-6 text-right">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-extrabold">
              <HotelIcon className="w-3.5 h-3.5" />
              <span>راهنمای جامع هتل‌ها، پانسیون‌ها و اقامتگاه‌های اقتصادی ترکیه</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              دایرکتوری زنده هتل‌ها و رزرو مستقیم روی نقشه
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              اقامتگاه‌های امن و اقتصادی در مناطق آکسارای، تقسیم، شیشلی، مرتر، اسنیورت، کادیکوی، آنکارا و آنتالیا به همراه قیمت لحظه‌ای به لیر و معادل ریال/تومان و لینک مستقیم سایت رسمی و رزرو آنلاین هر هتل.
            </p>
          </div>

          {/* Live TRY Rate Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 space-y-1">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>نرخ لحظه‌ای محاسبه قیمت هتل‌ها:</span>
            </div>
            <div className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400">
              هر ۱ لیر (₺) = {liveRates.tryToman.toLocaleString('fa-IR')} تومان ({liveRates.tryRial.toLocaleString('fa-IR')} ریال)
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              بروزرسانی خودکار: {liveRates.lastUpdated}
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative mt-5">
          <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 absolute right-4 top-3.5" />
          <input
            type="text"
            placeholder="جستجو در هتل‌ها بر اساس نام، محله یا امکانات (آکسارای، تقسیم، شیشلی، مرتر، اسنیورت، کادیکوی)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-red-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-12 pl-4 py-3 rounded-2xl text-sm focus:outline-none shadow-sm transition"
          />
        </div>
      </div>

      {/* Admin Action Bar */}
      {isAdminLoggedIn && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-400 dark:border-amber-500/40 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  دسترسی مدیریت هتل‌ها و اقامتگاه‌ها فعال است
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                امکان افزودن هتل جدید با لینک سایت رسمی و انتخاب لوکیشن مستقیم از روی نقشه فعال می‌باشد.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddHotelModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن هتل و اقامتگاه جدید</span>
          </button>
        </div>
      )}

      {/* Filter Panel: District Pills, Price Slider & Amenities */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* City Select */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-red-400" />
              شهر:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict('همه');
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              <option value="همه">همه شهرهای ترکیه ({hotels.length})</option>
              {ALL_TURKEY_CITIES_FA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Slider with Live Rial/Toman Equivalent */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">حداکثر قیمت هر شب:</span>
            <span className="font-mono font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30">
              {maxPrice.toLocaleString('fa-IR')} ₺ ({formatTryToIrr(maxPrice).tomanText})
            </span>
            <input
              type="range"
              min={500}
              max={2500}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-36 accent-blue-600 dark:accent-red-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick District Filter Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300 block">
            فیلتر سریع منطقه و محله:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_DISTRICTS.map((d) => {
              const isSelected = selectedDistrict === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDistrict(d.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 dark:bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenities Filter Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300 ml-1">
              فیلتر امکانات:
            </span>
            {QUICK_AMENITIES.map((am) => {
              const isSelected = selectedAmenities.includes(am);
              return (
                <button
                  key={am}
                  type="button"
                  onClick={() => toggleAmenity(am)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isSelected ? `✓ ${am}` : am}
                </button>
              );
            })}
          </div>

          {(selectedCity !== 'همه' ||
            selectedDistrict !== 'همه' ||
            selectedAmenities.length > 0 ||
            maxPrice < 2500 ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCity('همه');
                setSelectedDistrict('همه');
                setSelectedAmenities([]);
                setMaxPrice(2500);
                setSearchQuery('');
              }}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              پاک کردن فیلترها
            </button>
          )}
        </div>
      </div>

      {/* Live Interactive Map Section (Synchronized with Hotels Directory) */}
      <div ref={mapSectionRef} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-amber-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              نقشه زنده موقعیت هتل‌ها و مراکز اطراف
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            با کلیک روی هر کارت هتل در پایین، مکان دقیق آن روی نقشه هایلایت می‌شود
          </span>
        </div>

        <InteractiveMap
          initialCity={selectedCity === 'همه' ? 'استانبول' : selectedCity}
          focusedLocationId={focusedHotelId}
          heightClass="h-[460px]"
          showCategoryFilters={true}
          defaultCategory="hotel"
          onBookHotel={(hotel) => {
            if (hotel) {
              handleOpenBooking(hotel);
            }
          }}
          onSelectLocation={(pt) => {
            if (pt.category === 'hotel' && pt.rawItem) {
              setActiveDetailHotel(pt.rawItem);
            }
          }}
        />
      </div>

      {/* Selected Hotel Highlight Detail Banner (When a hotel is clicked) */}
      {activeDetailHotel && (
        <div className="bg-blue-50 dark:bg-slate-900 border-2 border-blue-500 dark:border-amber-500/70 rounded-3xl p-5 shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={activeDetailHotel.imageUrl}
                alt={activeDetailHotel.name}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-black">
                    انتخاب‌شده روی نقشه ✓
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {activeDetailHotel.city} - {activeDetailHotel.district}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeDetailHotel.name}{' '}
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    ({activeDetailHotel.nameTr})
                  </span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeDetailHotel.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                  <span className="font-black text-amber-800 dark:text-amber-300">
                    هر شب: {activeDetailHotel.pricePerNight.toLocaleString('fa-IR')} ₺
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    معادل لحظه‌ای: {formatTryToIrr(activeDetailHotel.pricePerNight).combinedText}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end shrink-0">
              {(activeDetailHotel.websiteUrl || activeDetailHotel.mapsUrl) && (
                <a
                  href={activeDetailHotel.websiteUrl || activeDetailHotel.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md"
                >
                  <Globe className="w-4 h-4" />
                  <span>مشاهده سایت و رزرو آنلاین</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => handleOpenBooking(activeDetailHotel)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>ثبت رزرو در کارباما</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailHotel(null)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hotelsWithDistance.map((hotel) => {
          const isFocused = focusedHotelId === hotel.id;
          const nightIrr = formatTryToIrr(hotel.pricePerNight);
          const monthlyIrr = hotel.monthlyPrice ? formatTryToIrr(hotel.monthlyPrice) : null;

          return (
            <div
              key={hotel.id}
              onClick={() => handleSelectHotelOnMap(hotel)}
              className={`bg-white dark:bg-slate-900 border-2 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between group transition cursor-pointer ${
                isFocused
                  ? 'border-blue-600 dark:border-amber-500 ring-2 ring-blue-500/20 dark:ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Hotel Image with Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-800">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                  {/* Stars badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-amber-400 text-xs font-extrabold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{hotel.stars} ستاره</span>
                  </div>

                  {/* Live Distance badge */}
                  {hotel.distanceKm !== null && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/40 text-emerald-300 text-xs font-extrabold shadow-lg">
                      <Navigation className="w-3.5 h-3.5 shrink-0" />
                      <span>{hotel.distanceKm.toLocaleString('fa-IR')} ک.م از شما</span>
                    </div>
                  )}

                  {/* Price tag on image */}
                  <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow-md font-mono">
                    {hotel.pricePerNight.toLocaleString('fa-IR')} ₺ / شب
                  </div>

                  {/* District badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-bold border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>
                      {hotel.city} - {hotel.district}
                    </span>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                        {hotel.nameTr}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectHotelOnMap(hotel);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-amber-300 border border-blue-200 dark:border-slate-700 text-[11px] font-bold flex items-center gap-1 shrink-0 hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>نمایش روی نقشه</span>
                    </button>
                  </div>

                  {/* Live TRY + Rial/Toman Price Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        تعرفه هر شب:
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-amber-300 text-sm">
                        {hotel.pricePerNight.toLocaleString('fa-IR')} لیر ترکیه (₺)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-slate-400">معادل لحظه‌ای ریال و تومان:</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        {nightIrr.tomanText} ({nightIrr.rialText})
                      </span>
                    </div>
                    {hotel.monthlyPrice && monthlyIrr && (
                      <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-600 dark:text-slate-400">تعرفه ماهانه ({hotel.monthlyPrice.toLocaleString('fa-IR')} ₺):</span>
                        <span className="font-bold text-blue-700 dark:text-sky-400">
                          {monthlyIrr.tomanText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Proximity to Transit */}
                  <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    <Train className="w-4 h-4 text-blue-600 dark:text-amber-400 shrink-0" />
                    <span>{hotel.nearTransit}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Direct Website Booking Link + Internal Booking + Call/WhatsApp */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="p-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 mt-2 space-y-2.5"
              >
                {/* Direct External Website & Online Booking Link (Mandatory Requirement 1) */}
                {(hotel.websiteUrl || hotel.mapsUrl) && (
                  <a
                    href={hotel.websiteUrl || hotel.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>مشاهده سایت و رزرو آنلاین</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${hotel.phone.replace(/\s/g, '')}`}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition"
                      title={`تماس تلفنی: ${hotel.phone}`}
                    >
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </a>

                    {hotel.whatsapp && (
                      <a
                        href={`https://wa.me/${hotel.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 rounded-xl transition"
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
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  hotel.name + ' ' + hotel.city
                                )}`)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 rounded-xl transition flex items-center gap-1"
                      title="مسیریابی روی نقشه گوگل"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBooking(hotel)}
                    className="flex-1 py-2.5 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>ثبت درخواست رزرو</span>
                  </button>
                </div>
              </div>

              {/* Admin Controls on Hotel Card */}
              {isAdminLoggedIn && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2"
                >
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    کنترل مدیر:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingHotel(hotel)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteHotel(hotel.id)}
                      className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  رزرو اقامت در {selectedHotel.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono" dir="ltr">
                  {selectedHotel.city} - {selectedHotel.district}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHotel(null)}
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
                  رزرو شما برای هتل <strong>{selectedHotel.name}</strong> ثبت گردید. مبلغ{' '}
                  <strong>{(selectedHotel.pricePerNight * nights).toLocaleString('fa-IR')} لیر</strong>{' '}
                  (معادل لحظه‌ای:{' '}
                  <strong>{formatTryToIrr(selectedHotel.pricePerNight * nights).combinedText}</strong>) هنگام
                  تحویل اتاق در هتل تسویه می‌شود.
                </p>
                {selectedHotel.websiteUrl && (
                  <a
                    href={selectedHotel.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    <Globe className="w-4 h-4" />
                    <span>ورود به وب‌سایت رسمی هتل جهت بررسی آنلاین اتاق‌ها</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedHotel(null)}
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
                      src={selectedHotel.imageUrl}
                      alt={selectedHotel.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs">
                        {selectedHotel.name}
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono font-bold mt-0.5">
                        هر شب: {selectedHotel.pricePerNight.toLocaleString('fa-IR')} لیر (
                        {formatTryToIrr(selectedHotel.pricePerNight).tomanText})
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">
                        {selectedHotel.nearTransit}
                      </p>
                    </div>
                  </div>
                  {selectedHotel.websiteUrl && (
                    <a
                      href={selectedHotel.websiteUrl}
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
                      نام و نام خانوادگی رزروکننده *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: علی رضایی"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
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
                      placeholder="+90 5XX XXX XXXX"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-left focus:outline-none"
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
                      تعداد شب‌ها
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

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    توضیحات یا درخواست ویژه (اختیاری)
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: ورود در شب، اتاق ۲ تخته..."
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Price summary with Live Rial/Toman */}
                <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      مبلغ کل اقامت ({nights} شب):
                    </span>
                    <span className="text-base font-black text-amber-700 dark:text-amber-300 font-mono">
                      {(selectedHotel.pricePerNight * nights).toLocaleString('fa-IR')} لیر (₺)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 dark:text-slate-400">معادل لحظه‌ای به نرخ روز:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatTryToIrr(selectedHotel.pricePerNight * nights).combinedText}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 dark:bg-red-600 hover:bg-blue-500 dark:hover:bg-red-500 text-white font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>تایید و ثبت درخواست رزرو هتل</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADMIN ADD HOTEL MODAL */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <HotelIcon className="w-5 h-5" />
                </span>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  افزودن هتل و اقامتگاه جدید (با لینک سایت و لوکیشن نقشه)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHotelModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateHotel}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-sm">
                    <Compass className="w-4 h-4" />
                    انتخاب لوکیشن دقیق هتل روی نقشه ترکیه:
                  </span>
                </div>

                <MapLocationPicker
                  initialCoordinates={newHotelCoordinates}
                  onChange={(coords) => setNewHotelCoordinates(coords)}
                  defaultCity={newHotelCity}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    نام هتل (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: هتل بزرگ آکسارای"
                    value={newHotelName}
                    onChange={(e) => setNewHotelName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    نام هتل (ترکی / لاتین)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Aksaray Grand Hotel"
                    value={newHotelNameTr}
                    onChange={(e) => setNewHotelNameTr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={newHotelCity}
                    onChange={(e) => {
                      const newC = e.target.value;
                      setNewHotelCity(newC);
                      const dists = getDistrictsForCity(newC);
                      if (dists.length > 0) setNewHotelDistrict(dists[0]);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    منطقه / محله
                  </label>
                  <input
                    type="text"
                    value={newHotelDistrict}
                    onChange={(e) => setNewHotelDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    قیمت هر شب (لیر) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newHotelPrice}
                    onChange={(e) => setNewHotelPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    قیمت ماهانه (لیر)
                  </label>
                  <input
                    type="number"
                    value={newHotelMonthlyPrice}
                    onChange={(e) => setNewHotelMonthlyPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    شماره تماس هتل
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelPhone}
                    onChange={(e) => setNewHotelPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    شماره واتساپ هتل
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelWhatsapp}
                    onChange={(e) => setNewHotelWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    لینک وب‌سایت رسمی / رزرو آنلاین
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://..."
                    value={newHotelWebsiteUrl}
                    onChange={(e) => setNewHotelWebsiteUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  امکانات (با ویرگول جدا کنید)
                </label>
                <input
                  type="text"
                  value={newHotelAmenities}
                  onChange={(e) => setNewHotelAmenities(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  آدرس متنی کامل
                </label>
                <input
                  type="text"
                  value={newHotelAddress}
                  onChange={(e) => setNewHotelAddress(e.target.value)}
                  placeholder="مثلاً: استانبول، فاتیح، میدان آکسارای، پلاک ۱۲"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHotelModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  ثبت هتل روی نقشه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN EDIT HOTEL MODAL */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-600/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Edit className="w-5 h-5" />
                </span>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  ویرایش اطلاعات و لوکیشن هتل «{editingHotel.name}»
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingHotel(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditHotel}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-amber-500/40 rounded-2xl space-y-2">
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
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    نام هتل (فارسی)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    لینک وب‌سایت رسمی / رزرو آنلاین
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={editingHotel.websiteUrl || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, websiteUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">شهر</label>
                  <input
                    type="text"
                    value={editingHotel.city}
                    onChange={(e) => setEditingHotel({ ...editingHotel, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">منطقه</label>
                  <input
                    type="text"
                    value={editingHotel.district}
                    onChange={(e) => setEditingHotel({ ...editingHotel, district: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    قیمت هر شب (لیر)
                  </label>
                  <input
                    type="number"
                    value={editingHotel.pricePerNight}
                    onChange={(e) =>
                      setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    شماره تماس
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingHotel.phone}
                    onChange={(e) => setEditingHotel({ ...editingHotel, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
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
