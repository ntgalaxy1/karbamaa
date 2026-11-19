import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AddressCategory, EssentialAddress } from '../types';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import { getDistrictsForCity } from '../data/turkeyData';
import { InteractiveMap } from './InteractiveMap';
import { MapLocationPicker } from './MapLocationPicker';
import {
  MapPin,
  Phone,
  Clock,
  Building2,
  Landmark,
  ShieldAlert,
  Coins,
  HeartPulse,
  Search,
  Copy,
  Check,
  Navigation,
  Siren,
  Plus,
  Edit,
  Trash2,
  X,
  Compass,
  ShieldCheck,
  Train,
  ExternalLink,
  Filter,
} from 'lucide-react';

type UnifiedCenterCategory = 'all' | 'immigration' | 'embassy' | 'hospital' | 'emergency_police' | 'transit' | 'exchange';

interface UnifiedCenterCard {
  id: string;
  groupKey: UnifiedCenterCategory;
  rawCategory: string;
  title: string;
  titleTr: string;
  city: string;
  district: string;
  address: string;
  phones: string[];
  workingHours: string;
  description: string;
  isEmergency24h?: boolean;
  mapsUrl?: string;
  coordinates?: { lat: number; lng: number };
  isEditableAddress?: boolean;
  rawAddress?: EssentialAddress;
}

const CATEGORY_TABS: {
  key: UnifiedCenterCategory;
  label: string;
  icon: React.FC<{ className?: string }>;
  badgeColor: string;
}[] = [
  {
    key: 'all',
    label: 'همه مراکز ضروری',
    icon: MapPin,
    badgeColor: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
  },
  {
    key: 'immigration',
    label: 'اداره مهاجرت (Göç İdaresi)',
    icon: Building2,
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    key: 'embassy',
    label: 'کنسولگری و سفارت ایران',
    icon: Landmark,
    badgeColor: 'bg-red-600 text-white',
  },
  {
    key: 'hospital',
    label: 'بیمارستان‌ها و مراکز درمانی',
    icon: HeartPulse,
    badgeColor: 'bg-rose-600 text-white',
  },
  {
    key: 'emergency_police',
    label: 'پلیس و اورژانس ۲۴ ساعته',
    icon: Siren,
    badgeColor: 'bg-sky-600 text-white',
  },
  {
    key: 'transit',
    label: 'متروبوس و حمل‌ونقل عمومی',
    icon: Train,
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    key: 'exchange',
    label: 'صرافی‌ها و مراکز ارزی',
    icon: Coins,
    badgeColor: 'bg-purple-600 text-white',
  },
];

export const EssentialAddresses: React.FC = () => {
  const {
    addresses,
    transitHubs,
    addAddress,
    updateAddress,
    deleteAddress,
    isAdminLoggedIn,
    showToast,
  } = useApp();

  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<UnifiedCenterCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [focusedMapLocationId, setFocusedMapLocationId] = useState<string | null>(null);

  // Admin Add/Edit Address State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState<EssentialAddress | null>(null);

  const [newCategory, setNewCategory] = useState<AddressCategory>('immigration');
  const [newTitle, setNewTitle] = useState('');
  const [newTitleTr, setNewTitleTr] = useState('');
  const [newCity, setNewCity] = useState('استانبول');
  const [newDistrict, setNewDistrict] = useState('فاتیح (آکسارای)');
  const [newAddressText, setNewAddressText] = useState('');
  const [newPhones, setNewPhones] = useState('+90 212 000 0000');
  const [newWorkingHours, setNewWorkingHours] = useState('دوشنبه تا جمعه: ۰۸:۳۰ تا ۱۷:۰۰');
  const [newDescription, setNewDescription] = useState('');
  const [newIsEmergency24h, setNewIsEmergency24h] = useState(false);
  const [newCoordinates, setNewCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 41.015,
    lng: 28.97,
  });

  // Combine EssentialAddresses + TransitHubs into one unified, structured dataset
  const unifiedCenters: UnifiedCenterCard[] = useMemo(() => {
    const items: UnifiedCenterCard[] = [];

    addresses.forEach((addr) => {
      let groupKey: UnifiedCenterCategory = 'immigration';
      if (addr.category === 'immigration') groupKey = 'immigration';
      else if (addr.category === 'embassy') groupKey = 'embassy';
      else if (addr.category === 'hospital') groupKey = 'hospital';
      else if (addr.category === 'emergency' || addr.category === 'police') groupKey = 'emergency_police';
      else if (addr.category === 'exchange') groupKey = 'exchange';

      items.push({
        id: addr.id,
        groupKey,
        rawCategory: addr.category,
        title: addr.title,
        titleTr: addr.titleTr,
        city: addr.city,
        district: addr.district,
        address: addr.address,
        phones: addr.phones && addr.phones.length > 0 ? addr.phones : ['112'],
        workingHours: addr.workingHours || '۰۸:۳۰ الی ۱۷:۰۰',
        description: addr.description,
        isEmergency24h: addr.isEmergency24h,
        mapsUrl: addr.mapsUrl,
        coordinates: addr.coordinates,
        isEditableAddress: true,
        rawAddress: addr,
      });
    });

    transitHubs.forEach((hub) => {
      items.push({
        id: hub.id,
        groupKey: 'transit',
        rawCategory: 'transit',
        title: hub.name,
        titleTr: hub.nameTr,
        city: hub.city,
        district: hub.district,
        address: `${hub.district} — خطوط متصل: ${hub.lines.join('، ')}`,
        phones: ['153'],
        workingHours: hub.schedule || '۲۴ ساعته شبانه‌روزی',
        description: `${hub.description} (${hub.connections})`,
        isEmergency24h: hub.schedule.includes('۲۴'),
        mapsUrl: hub.googleMapsUrl,
        coordinates: hub.coordinates,
        isEditableAddress: false,
      });
    });

    return items;
  }, [addresses, transitHubs]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<UnifiedCenterCategory, number> = {
      all: unifiedCenters.length,
      immigration: 0,
      embassy: 0,
      hospital: 0,
      emergency_police: 0,
      transit: 0,
      exchange: 0,
    };
    unifiedCenters.forEach((item) => {
      counts[item.groupKey] = (counts[item.groupKey] || 0) + 1;
    });
    return counts;
  }, [unifiedCenters]);

  const filteredCenters = useMemo(() => {
    return unifiedCenters.filter((item) => {
      if (selectedCategory !== 'all' && item.groupKey !== selectedCategory) return false;
      if (
        selectedCity !== 'همه' &&
        item.city !== selectedCity &&
        item.city !== 'سراسری ترکیه'
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTr = item.titleTr.toLowerCase().includes(q);
        const matchAddr = item.address.toLowerCase().includes(q);
        const matchDist = item.district.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchTitle && !matchTr && !matchAddr && !matchDist && !matchDesc) return false;
      }
      return true;
    });
  }, [unifiedCenters, selectedCategory, selectedCity, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('آدرس کپی شد', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowOnMap = (center: UnifiedCenterCard) => {
    setFocusedMapLocationId(center.id);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast(`موقعیت «${center.title}» روی نقشه تعاملی مشخص شد`, 'info');
  };

  const getCategoryMeta = (groupKey: UnifiedCenterCategory) => {
    switch (groupKey) {
      case 'immigration':
        return {
          label: 'اداره مهاجرت (Göç İdaresi)',
          badgeClass:
            'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
        };
      case 'embassy':
        return {
          label: 'کنسولگری و سفارت ایران',
          badgeClass:
            'bg-red-100 dark:bg-red-500/20 text-red-900 dark:text-red-300 border-red-300 dark:border-red-500/40',
        };
      case 'hospital':
        return {
          label: 'بیمارستان و مرکز درمانی',
          badgeClass:
            'bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-500/40',
        };
      case 'emergency_police':
        return {
          label: 'پلیس و اورژانس ۲۴ ساعته',
          badgeClass:
            'bg-sky-100 dark:bg-sky-500/20 text-sky-900 dark:text-sky-300 border-sky-300 dark:border-sky-500/40',
        };
      case 'transit':
        return {
          label: 'متروبوس و ایستگاه حمل‌ونقل',
          badgeClass:
            'bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-500/40',
        };
      case 'exchange':
        return {
          label: 'صرافی و خدمات ارزی',
          badgeClass:
            'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-500/40',
        };
      default:
        return {
          label: 'مرکز ضروری',
          badgeClass:
            'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700',
        };
    }
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAddressText.trim()) {
      showToast('لطفاً عنوان مرکز و آدرس را وارد نمایید', 'error');
      return;
    }
    const phonesList = newPhones
      .split('،')
      .join(',')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    addAddress({
      category: newCategory,
      title: newTitle.trim(),
      titleTr: newTitleTr.trim() || newTitle.trim(),
      city: newCity,
      district: newDistrict.trim(),
      address: newAddressText.trim(),
      phones: phonesList.length > 0 ? phonesList : ['112'],
      workingHours: newWorkingHours.trim() || '۰۸:۳۰ الی ۱۷:۰۰',
      description: newDescription.trim() || 'مرکز رسمی و ضروری برای ایرانیان در ترکیه',
      isEmergency24h: newIsEmergency24h,
      mapsUrl: `https://www.google.com/maps?q=${newCoordinates.lat},${newCoordinates.lng}`,
      coordinates: newCoordinates,
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewTitleTr('');
    setNewAddressText('');
    setNewDescription('');
  };

  const handleSaveEditAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddr) return;
    updateAddress(editingAddr.id, editingAddr);
    setEditingAddr(null);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Clean Modern Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-red-600/20 text-blue-900 dark:text-red-300 border border-blue-300 dark:border-red-500/30 text-xs font-extrabold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>بانک اطلاعات جامع مراکز رسمی، درمانی، کنسولی و حمل‌ونقل ترکیه</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              مراکز ضروری و شماره‌های فوریتی ایرانیان در ترکیه
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              دسترسی سریع به آدرس، شماره تماس مستقیم، ساعات کاری و موقعیت دقیق روی نقشه برای اداره مهاجرت (Göç İdaresi)، سفارت و کنسولگری ایران، بیمارستان‌ها، پلیس و ایستگاه‌های متروبوس.
            </p>
          </div>

          {/* 24/7 Emergency Direct Dial Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0">
            <a
              href="tel:112"
              className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-500/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
                112
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">اورژانس و آمبولانس</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">تماس رایگان ۲۴ ساعته</div>
              </div>
            </a>

            <a
              href="tel:157"
              className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
                157
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">خط اداره مهاجرت</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">پاسخگویی به زبان فارسی</div>
              </div>
            </a>

            <a
              href="tel:155"
              className="px-4 py-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-500/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
                155
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">پلیس فوریتی ترکیه</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">پلیس امنیت (Polis)</div>
              </div>
            </a>

            <a
              href="tel:153"
              className="px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
                153
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">شهرداری و متروبوس</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">بیضاماسا (Alo 153)</div>
              </div>
            </a>
          </div>
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
                  مدیریت مراکز ضروری، بیمارستان‌ها و ادارات مهاجرت فعال است
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                می‌توانید مرکز جدید را به همراه لوکیشن دقیق روی نقشه اضافه کرده یا مراکز فعلی را ویرایش کنید.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن مرکز یا آدرس ضروری جدید</span>
          </button>
        </div>
      )}

      {/* Search, City Filter & Category Filter Pills */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="جستجو در مراکز ضروری (مثلاً: اداره مهاجرت فاتیح، کنسولگری، بیمارستان، متروبوس، صرافی)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-red-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-10 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none"
            />
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-red-400" />
              شهر:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold"
            >
              <option value="همه">همه شهرهای ترکیه</option>
              {ALL_TURKEY_CITIES_FA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {CATEGORY_TABS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 dark:bg-red-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? 'bg-black/25 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {count.toLocaleString('fa-IR')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured 3-Column Card Grid (Requirement 2: grid-cols-1 md:grid-cols-2 lg:grid-cols-3) */}
      {filteredCenters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            مرکزی با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            لطفاً فیلتر دسته‌بندی یا شهر را تغییر دهید.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCity('همه');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            نمایش همه مراکز ضروری
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCenters.map((center) => {
            const meta = getCategoryMeta(center.groupKey);
            const isFocused = focusedMapLocationId === center.id;

            return (
              <div
                key={center.id}
                className={`bg-white dark:bg-slate-900 border-2 rounded-3xl p-5 shadow-md flex flex-col justify-between transition ${
                  isFocused
                    ? 'border-blue-600 dark:border-amber-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Top Metadata Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {center.isEmergency24h && (
                        <span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30 text-[10px] font-black">
                          ۲۴ ساعته
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                        {center.city}
                      </span>
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {center.title}
                    </h3>
                    <p
                      className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5 truncate"
                      dir="ltr"
                    >
                      {center.titleTr}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                    {center.description}
                  </p>

                  {/* Structured Address, Working Hours & Phone Details */}
                  <div className="space-y-2 text-xs">
                    {/* Address Row with Copy */}
                    <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                            منطقه: {center.district}
                          </span>
                          <span
                            className="text-slate-800 dark:text-slate-200 font-mono text-[11px] break-words block"
                            dir="ltr"
                          >
                            {center.address}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(center.address, center.id)}
                        title="کپی آدرس"
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      >
                        {copiedId === center.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Working Hours */}
                    <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-[11px] font-bold">ساعات کاری:</span>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                        {center.workingHours}
                      </span>
                    </div>

                    {/* Direct Clickable Phone Links */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {center.phones.map((phone, idx) => (
                        <a
                          key={idx}
                          href={`tel:${phone.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-mono font-bold transition"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{phone}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions: "نمایش روی نقشه" + External Google Maps */}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShowOnMap(center)}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>نمایش روی نقشه</span>
                    </button>

                    <a
                      href={
                        center.mapsUrl ||
                        (center.coordinates
                          ? `https://www.google.com/maps/search/?api=1&query=${center.coordinates.lat},${center.coordinates.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              center.titleTr + ' ' + center.city
                            )}`)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                      title="مسیریابی در گوگل مپس"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>گوگل‌مپ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Admin Edit/Delete Controls */}
                  {isAdminLoggedIn && center.isEditableAddress && center.rawAddress && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        مدیریت مرکز:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingAddr(center.rawAddress!)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAddress(center.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Interactive Map at Bottom for Direct Panning ("نمایش روی نقشه") */}
      <div ref={mapSectionRef} className="pt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-red-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              نقشه تعاملی مراکز ضروری، ادارات مهاجرت، کنسولگری و بیمارستان‌ها
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            با کلیک روی دکمه «نمایش روی نقشه» در هر کارت، نقشه مستقیماً روی آن مرکز زوم می‌کند
          </span>
        </div>

        <InteractiveMap
          initialCity={selectedCity === 'همه' ? 'استانبول' : selectedCity}
          focusedLocationId={focusedMapLocationId}
          heightClass="h-[500px]"
          showCategoryFilters={true}
        />
      </div>

      {/* ADMIN ADD ADDRESS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                افزودن مرکز یا آدرس ضروری جدید
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateAddress}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right"
            >
              <MapLocationPicker
                initialCoordinates={newCoordinates}
                onChange={(coords) => setNewCoordinates(coords)}
                defaultCity={newCity}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    عنوان مرکز (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثلاً: اداره مهاجرت استانبول (فاتیح)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    عنوان ترکی / لاتین
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newTitleTr}
                    onChange={(e) => setNewTitleTr(e.target.value)}
                    placeholder="İstanbul İl Göç İdaresi"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    دسته‌بندی
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AddressCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="immigration">اداره مهاجرت (Göç)</option>
                    <option value="embassy">سفارت و کنسولگری ایران</option>
                    <option value="hospital">بیمارستان و مرکز درمانی</option>
                    <option value="emergency">اورژانس ۲۴ ساعته</option>
                    <option value="police">پلیس و امنیت</option>
                    <option value="exchange">صرافی مجاز</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={newCity}
                    onChange={(e) => {
                      const c = e.target.value;
                      setNewCity(c);
                      const dists = getDistrictsForCity(c);
                      if (dists.length > 0) setNewDistrict(dists[0]);
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
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    شماره تماس (با کاما جدا کنید)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newPhones}
                    onChange={(e) => setNewPhones(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    ساعات کاری
                  </label>
                  <input
                    type="text"
                    value={newWorkingHours}
                    onChange={(e) => setNewWorkingHours(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  آدرس کامل پستی *
                </label>
                <input
                  type="text"
                  required
                  value={newAddressText}
                  onChange={(e) => setNewAddressText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  توضیحات راهنما برای ایرانیان
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  ثبت مرکز جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN EDIT ADDRESS MODAL */}
      {editingAddr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                ویرایش مرکز «{editingAddr.title}»
              </h3>
              <button
                type="button"
                onClick={() => setEditingAddr(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditAddress}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right"
            >
              <MapLocationPicker
                initialCoordinates={editingAddr.coordinates || { lat: 41.015, lng: 28.97 }}
                onChange={(coords) =>
                  setEditingAddr((prev) => (prev ? { ...prev, coordinates: coords } : null))
                }
                defaultCity={editingAddr.city}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    عنوان فارسی
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAddr.title}
                    onChange={(e) => setEditingAddr({ ...editingAddr, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                    عنوان ترکی / لاتین
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingAddr.titleTr}
                    onChange={(e) => setEditingAddr({ ...editingAddr, titleTr: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white text-left font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  آدرس کامل
                </label>
                <input
                  type="text"
                  value={editingAddr.address}
                  onChange={(e) => setEditingAddr({ ...editingAddr, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
                  توضیحات
                </label>
                <textarea
                  rows={2}
                  value={editingAddr.description}
                  onChange={(e) => setEditingAddr({ ...editingAddr, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAddr(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
