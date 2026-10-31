import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HotelsSection } from './HotelsSection';
import { TransitSection } from './TransitSection';
import { InteractiveMap } from './InteractiveMap';
import { EssentialAddress, AddressCategory, Hotel as HotelType } from '../types';
import {
  MapPin,
  Phone,
  Clock,
  Copy,
  ExternalLink,
  Search,
  AlertTriangle,
  Building2,
  ShieldAlert,
  HeartPulse,
  Landmark,
  Coins,
  Check,
  Info,
  Navigation,
  Hotel,
  Train,
  CheckCircle,
  LayoutList,
  Map as MapIcon,
  Columns,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  X,
  ShieldCheck,
} from 'lucide-react';

const CATEGORY_TABS: { key: string; label: string; icon: any }[] = [
  { key: 'all', label: 'همه مراکز اداری', icon: Building2 },
  { key: 'emergency', label: 'خطوط فوری و اضطراری', icon: ShieldAlert },
  { key: 'embassy', label: 'سفارت و کنسولگری‌های ایران', icon: Landmark },
  { key: 'immigration', label: 'اداره مهاجرت (Göç İdaresi)', icon: MapPin },
  { key: 'hospital', label: 'بیمارستان‌های دولتی', icon: HeartPulse },
  { key: 'exchange', label: 'صرافی‌ها و تبدیل ارز', icon: Coins },
];

import { CITIES_WITH_ALL } from '../data/turkeyCities';

const CITIES = CITIES_WITH_ALL;

export const EssentialAddresses: React.FC = () => {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    isAdminLoggedIn,
    showToast,
  } = useApp();

  // Top Section Mode: 'official' | 'map' | 'hotels' | 'transit'
  const [sectionMode, setSectionMode] = useState<'official' | 'map' | 'hotels' | 'transit'>('official');

  // View mode inside official section: 'cards' | 'split' | 'map'
  const [viewMode, setViewMode] = useState<'cards' | 'split' | 'map'>('cards');

  // Focused location on map
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null);

  // Official addresses filtering
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('همه شهرها');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Address Add & Edit State
  const [showAddAddrModal, setShowAddAddrModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<EssentialAddress | null>(null);

  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrTitleTr, setNewAddrTitleTr] = useState('');
  const [newAddrCategory, setNewAddrCategory] = useState<AddressCategory>('immigration');
  const [newAddrCity, setNewAddrCity] = useState('استانبول');
  const [newAddrDistrict, setNewAddrDistrict] = useState('فاتیح');
  const [newAddrAddress, setNewAddrAddress] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('+90 ');
  const [newAddrHours, setNewAddrHours] = useState('۰۸:۳۰ الی ۱۷:۰۰');
  const [newAddrDesc, setNewAddrDesc] = useState('');

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTitle.trim() || !newAddrAddress.trim()) {
      showToast('لطفاً عنوان و آدرس مرکز را وارد نمایید', 'error');
      return;
    }

    addAddress({
      title: newAddrTitle.trim(),
      titleTr: newAddrTitleTr.trim() || newAddrTitle.trim(),
      category: newAddrCategory,
      city: newAddrCity,
      district: newAddrDistrict.trim(),
      address: newAddrAddress.trim(),
      phones: [newAddrPhone.trim()],
      workingHours: newAddrHours.trim(),
      description: newAddrDesc.trim() || 'ارائه خدمات اداری و کنسولی در ترکیه',
      isEmergency24h: false,
    });

    setShowAddAddrModal(false);
    setNewAddrTitle('');
    setNewAddrAddress('');
    showToast('مرکز جدید با موفقیت به راهنمای آدرس‌ها اضافه شد', 'success');
  };

  const handleSaveEditAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    updateAddress(editingAddress.id, editingAddress);
    setEditingAddress(null);
    showToast('مشخصات مرکز با موفقیت بروزرسانی شد', 'success');
  };

  const filteredAddresses = useMemo(() => {
    return addresses.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedCity !== 'همه شهرها' && item.city !== selectedCity && item.city !== 'سراسری ترکیه') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTitleTr = item.titleTr.toLowerCase().includes(q);
        const matchesAddr = item.address.toLowerCase().includes(q);
        const matchesDistrict = item.district.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTitleTr && !matchesAddr && !matchesDistrict && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [addresses, selectedCategory, selectedCity, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Absorb clipboard SecurityError in sandboxed iframe
    }
    setCopiedId(id);
    showToast('آدرس در حافظه کپی شد', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFocusOnMap = (id: string) => {
    setFocusedLocationId(id);
    // If not in map or split view, switch to split view so user sees both
    if (viewMode === 'cards') {
      setViewMode('split');
    }
    showToast('مکان مورد نظر روی نقشه مشخص گردید', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 4 Main Segmented Tabs Requested by User */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <button
          onClick={() => setSectionMode('official')}
          style={sectionMode === 'official' ? { backgroundColor: 'var(--primary-color)' } : undefined}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            sectionMode === 'official'
              ? 'text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          مراکز ضروری و سفارت
        </button>

        <button
          onClick={() => setSectionMode('hotels')}
          style={sectionMode === 'hotels' ? { backgroundColor: 'var(--primary-color)' } : undefined}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            sectionMode === 'hotels'
              ? 'text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Hotel className="w-4 h-4" />
          هتل‌های نزدیک و رزرو
        </button>

        <button
          onClick={() => setSectionMode('transit')}
          style={sectionMode === 'transit' ? { backgroundColor: 'var(--primary-color)' } : undefined}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            sectionMode === 'transit'
              ? 'text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Train className="w-4 h-4" />
          راهنمای متروبوس و مترو
        </button>

        <button
          onClick={() => setSectionMode('map')}
          style={sectionMode === 'map' ? { backgroundColor: 'var(--primary-color)' } : undefined}
          className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 relative ${
            sectionMode === 'map'
              ? 'text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          نقشه روی صفحه
        </button>
      </div>

      {/* RENDER SELECTED SUB-SECTION */}
      {sectionMode === 'hotels' && <HotelsSection />}
      {sectionMode === 'transit' && <TransitSection />}

      {/* DEDICATED FULL INTERACTIVE MAP TAB */}
      {sectionMode === 'map' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950/40 border border-slate-800 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-2">
                  <Navigation className="w-3.5 h-3.5" />
                  نقشه زنده اماکن با موقعیت‌یابی ماهواره‌ای و شهری
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
                  مشاهده موقعیت سفارت‌ها، ایستگاه‌های متروبوس و مراکز اقامتی
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  برای مشاهده جزئیات، شماره‌های تماس و مسیریابی روی نشانگرهای رنگی کلیک کنید یا از دکمه «موقعیت من» برای یافتن نزدیک‌ترین مراکز استفاده نمایید.
                </p>
              </div>

              <button
                onClick={() => setSectionMode('official')}
                className="self-start sm:self-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0"
              >
                <LayoutList className="w-3.5 h-3.5" />
                مشاهده در فهرست متنی
              </button>
            </div>
          </div>

          <InteractiveMap
            initialCity="استانبول"
            focusedLocationId={focusedLocationId}
            heightClass="h-[600px]"
            showCategoryFilters={true}
            onBookHotel={() => {
              setSectionMode('hotels');
            }}
          />
        </div>
      )}

      {/* OFFICIAL ADDRESSES SECTION (WITH EMBEDDED VIEW CONTROLS) */}
      {sectionMode === 'official' && (
        <div className="space-y-6">
          {/* Top Banner (Dynamically adapts to selected theme color) */}
          <div
            style={{ background: 'var(--primary-banner)' }}
            className="rounded-3xl border border-red-500/30 p-6 sm:p-8 shadow-xl transition-all duration-300"
          >
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-semibold mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                راهنمای جامع و مراکز پاسخگویی فارسی‌زبان در ترکیه
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                آدرس‌های مهم، سفارت و ادارات مهاجرت ترکیه
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                دسترسی سریع به شماره خطوط رایگان مهاجرتی با زبان فارسی، آدرس شعب کنسولگری ایران، ادارات مهاجرت جهت مصاحبه کیملیک، بیمارستان‌های دولتی و صرافی‌ها.
              </p>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
                <input
                  type="text"
                  placeholder="جستجوی آدرس، کنسولگری، اداره مهاجرت یا شماره تلفن اضطراری..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 hover:border-red-500/50 focus:border-red-500 text-white placeholder-slate-400 pr-12 pl-4 py-3 rounded-2xl text-sm focus:outline-hidden shadow-lg transition"
                />
              </div>
            </div>
          </div>

          {/* Admin Action Bar for Addresses (Visible when admin is logged in) */}
          {isAdminLoggedIn && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">پنل مدیریت مراکز اداری و سفارت‌ها فعال است</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    امکان ثبت مراکز جدید، شماره‌های فوری، ادارات مهاجرت، بیمارستان‌ها و صرافی‌ها و ویرایش اطلاعات آن‌ها فعال می‌باشد.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddAddrModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-700/30 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ افزودن مرکز یا آدرس جدید</span>
              </button>
            </div>
          )}

          {/* Emergency Spotlight Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-red-950/70 to-slate-900 border border-red-500/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  پاسخگویی فارسی مهاجرت
                </div>
                <div className="text-xl font-extrabold text-white font-mono">157 (YİMER)</div>
                <div className="text-[11px] text-slate-300">رایگان و شبانه‌روزی با اپراتور فارسی</div>
              </div>
              <a
                href="tel:157"
                className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                تماس
              </a>
            </div>

            <div className="bg-gradient-to-br from-amber-950/70 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  وزارت کار ترکیه (شکایت و بیمه)
                </div>
                <div className="text-xl font-extrabold text-white font-mono">170 (Alo 170)</div>
                <div className="text-[11px] text-slate-300">پیگیری حقوق پرداخت‌نشده و اقامت کاری</div>
              </div>
              <a
                href="tel:170"
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                تماس
              </a>
            </div>

            <div className="bg-gradient-to-br from-blue-950/70 to-slate-900 border border-blue-500/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                  اورژانس و پلیس سراسری
                </div>
                <div className="text-xl font-extrabold text-white font-mono">112 (Acil)</div>
                <div className="text-[11px] text-slate-300">آمبولانس، پلیس و آتش‌نشانی یکپارچه</div>
              </div>
              <a
                href="tel:112"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                تماس
              </a>
            </div>
          </div>

          {/* Filter Tabs & View Mode Switcher */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {CATEGORY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = selectedCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedCategory(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 transition ${
                        isSelected
                          ? 'bg-red-600 text-white font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle (Cards / Split / Map) */}
              <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 self-start md:self-auto">
                <button
                  onClick={() => setViewMode('cards')}
                  title="نمای فهرست کارتی"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'cards'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">فهرست کارتی</span>
                </button>

                <button
                  onClick={() => setViewMode('split')}
                  title="نمای همزمان نقشه و فهرست"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'split'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نقشه + کارت‌ها</span>
                </button>

                <button
                  onClick={() => setViewMode('map')}
                  title="نمای نقشه کامل"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نقشه کامل</span>
                </button>
              </div>
            </div>

            {/* City Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 shrink-0 ml-2 font-medium">فیلتر شهر:</span>
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                    selectedCity === c
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW: FULL MAP */}
          {viewMode === 'map' && (
            <InteractiveMap
              initialCity={selectedCity !== 'همه شهرها' ? selectedCity : 'استانبول'}
              focusedLocationId={focusedLocationId}
              heightClass="h-[560px]"
              showCategoryFilters={true}
              onBookHotel={() => setSectionMode('hotels')}
            />
          )}

          {/* VIEW: SPLIT (MAP ON TOP/LEFT + CARDS) */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 sticky top-4">
                <InteractiveMap
                  initialCity={selectedCity !== 'همه شهرها' ? selectedCity : 'استانبول'}
                  focusedLocationId={focusedLocationId}
                  heightClass="h-[520px]"
                  showCategoryFilters={false}
                  onBookHotel={() => setSectionMode('hotels')}
                />
              </div>

              <div className="lg:col-span-5 space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {filteredAddresses.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-slate-900 border rounded-2xl p-4 shadow-lg transition ${
                      focusedLocationId === item.id
                        ? 'border-red-500 ring-2 ring-red-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 text-[11px] font-bold">
                        {item.city}
                      </span>
                      <button
                        onClick={() => handleFocusOnMap(item.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-600/10 px-2 py-1 rounded-lg"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        نشان روی نقشه
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-0.5">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mb-2" dir="ltr">
                      {item.titleTr}
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      {item.phones[0] && (
                        <a
                          href={`tel:${item.phones[0].replace(/\s/g, '')}`}
                          className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 font-mono"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {item.phones[0]}
                        </a>
                      )}
                      <button
                        onClick={() => handleCopy(item.id, `${item.title}\n${item.address}`)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                        title="کپی آدرس"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: CARDS ONLY (STANDARD VIEW) */}
          {viewMode === 'cards' && (
            <div className="space-y-4">
              {filteredAddresses.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-bold">
                          {item.city}
                        </span>
                        <span className="text-xs text-slate-400">{item.district}</span>

                        {item.isEmergency24h && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            ۲۴ ساعته شبانه‌روزی
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white mb-0.5">{item.title}</h3>
                        <p className="text-xs text-slate-400 font-mono" dir="ltr">
                          {item.titleTr}
                        </p>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800/80">
                        <Info className="w-3.5 h-3.5 text-amber-400 inline ml-1.5 -mt-0.5" />
                        {item.description}
                      </p>

                      <div className="flex items-start gap-2 text-xs text-slate-300 pt-1">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="font-mono text-[11px] leading-relaxed" dir="ltr">
                          {item.address}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>ساعات کاری: {item.workingHours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 shrink-0 justify-end md:min-w-[170px]">
                      {/* Highlight on interactive map button */}
                      <button
                        onClick={() => handleFocusOnMap(item.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        نمایش روی نقشه تعاملی
                      </button>

                      {item.phones.map((phone, idx) => (
                        <a
                          key={idx}
                          href={`tel:${phone.replace(/\s/g, '')}`}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition font-mono"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {phone}
                        </a>
                      ))}

                      <button
                        onClick={() =>
                          handleCopy(
                            item.id,
                            `${item.title}\n${item.address}\nتلفن: ${item.phones.join(' - ')}`
                          )
                        }
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            کپی شد!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            کپی آدرس
                          </>
                        )}
                      </button>

                      {item.mapsUrl && (
                        <a
                          href={item.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-medium transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          گوگل مپس
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Admin Controls on Address Card */}
                  {isAdminLoggedIn && (
                    <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-amber-400 font-bold">کنترل مدیر:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingAddress(item)}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>ویرایش مرکز</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`آیا از حذف مرکز «${item.title}» مطمئن هستید؟`)) {
                              deleteAddress(item.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
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
        </div>
      )}

      {/* ADMIN ADD ADDRESS MODAL */}
      {showAddAddrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">افزودن مرکز جدید یا سفارت (ویژه مدیر)</h3>
              </div>
              <button
                onClick={() => setShowAddAddrModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان مرکز (فارسی) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: سرکنسولگری جمهوری اسلامی ایران در استانبول"
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان مرکز (ترکی / انگلیسی)</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="İran İslam Cumhuriyeti Başkonsolosluğu"
                  value={newAddrTitleTr}
                  onChange={(e) => setNewAddrTitleTr(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">دسته‌بندی</label>
                  <select
                    value={newAddrCategory}
                    onChange={(e) => setNewAddrCategory(e.target.value as AddressCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="embassy">سفارت و کنسولگری</option>
                    <option value="immigration">اداره مهاجرت (Göç)</option>
                    <option value="emergency">خطوط فوری و اضطراری</option>
                    <option value="hospital">بیمارستان دولتی</option>
                    <option value="exchange">صرافی و مالی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="ترابزون">ترابزون</option>
                    <option value="ارزروم">ارزروم</option>
                    <option value="سراسری ترکیه">سراسری ترکیه</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">آدرس کامل *</label>
                <textarea
                  required
                  rows={2}
                  value={newAddrAddress}
                  onChange={(e) => setNewAddrAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ساعات کاری</label>
                  <input
                    type="text"
                    value={newAddrHours}
                    onChange={(e) => setNewAddrHours(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات و خدمات</label>
                <textarea
                  rows={2}
                  value={newAddrDesc}
                  onChange={(e) => setNewAddrDesc(e.target.value)}
                  placeholder="مدارک لازم، نوبت‌دهی و..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAddrModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ثبت مرکز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN EDIT ADDRESS MODAL */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-600/20 text-amber-400 rounded-xl">
                  <Edit className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">ویرایش مشخصات مرکز «{editingAddress.title}»</h3>
              </div>
              <button
                onClick={() => setEditingAddress(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAddress} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان مرکز (فارسی)</label>
                <input
                  type="text"
                  required
                  value={editingAddress.title}
                  onChange={(e) => setEditingAddress({ ...editingAddress, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان مرکز (ترکی / انگلیسی)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingAddress.titleTr}
                  onChange={(e) => setEditingAddress({ ...editingAddress, titleTr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">دسته‌بندی</label>
                  <select
                    value={editingAddress.category}
                    onChange={(e) => setEditingAddress({ ...editingAddress, category: e.target.value as AddressCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="embassy">سفارت و کنسولگری</option>
                    <option value="immigration">اداره مهاجرت (Göç)</option>
                    <option value="emergency">خطوط فوری و اضطراری</option>
                    <option value="hospital">بیمارستان دولتی</option>
                    <option value="exchange">صرافی و مالی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={editingAddress.city}
                    onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="ترابزون">ترابزون</option>
                    <option value="ارزروم">ارزروم</option>
                    <option value="سراسری ترکیه">سراسری ترکیه</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">آدرس کامل</label>
                <textarea
                  rows={2}
                  value={editingAddress.address}
                  onChange={(e) => setEditingAddress({ ...editingAddress, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingAddress.phones ? editingAddress.phones[0] : ''}
                    onChange={(e) => setEditingAddress({ ...editingAddress, phones: [e.target.value] })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ساعات کاری</label>
                  <input
                    type="text"
                    value={editingAddress.workingHours}
                    onChange={(e) => setEditingAddress({ ...editingAddress, workingHours: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات</label>
                <textarea
                  rows={2}
                  value={editingAddress.description}
                  onChange={(e) => setEditingAddress({ ...editingAddress, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ذخیره تغییرات مرکز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
