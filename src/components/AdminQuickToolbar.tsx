import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapLocationPicker } from './MapLocationPicker';
import { JobImagePicker } from './JobImagePicker';
import { JobCategory, ContractType, TurkishLevel, AddressCategory } from '../types';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import {
  ShieldCheck,
  Plus,
  Briefcase,
  Hotel as HotelIcon,
  Building2,
  Settings,
  LogOut,
  X,
  Check,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  FileCheck,
  Shield,
  Utensils,
  Home,
  Clock,
  Compass,
} from 'lucide-react';

export const AdminQuickToolbar: React.FC = () => {
  const {
    isAdminLoggedIn,
    logoutAdmin,
    setActiveTab,
    addJob,
    addHotel,
    addAddress,
    showToast,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Modals state
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // New Job State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobCity, setJobCity] = useState('استانبول');
  const [jobDistrict, setJobDistrict] = useState('فاتیح');
  const [jobCategory, setJobCategory] = useState<JobCategory>('restaurant');
  const [jobSubcategory, setJobSubcategory] = useState('کمک‌آشپز و سالن‌کار');
  const [jobPayFrequency, setJobPayFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [jobSalaryMin, setJobSalaryMin] = useState(32000);
  const [jobSalaryMax, setJobSalaryMax] = useState(40000);
  const [jobAccommodation, setJobAccommodation] = useState(true);
  const [jobMeals, setJobMeals] = useState(true);
  const [jobHasLeave, setJobHasLeave] = useState(true);
  const [jobLeaveDetails, setJobLeaveDetails] = useState('۱ روز در هفته (یک‌شنبه یا توافقی)');
  const [jobWorkPermit, setJobWorkPermit] = useState(true);
  const [jobContractType, setJobContractType] = useState<ContractType>('full_time');
  const [jobTurkishLevel, setJobTurkishLevel] = useState<TurkishLevel>('basic');
  const [jobKeywords, setJobKeywords] = useState('رستوران، آشپزی، جای خواب');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPhone, setJobPhone] = useState('+90 532 000 0000');
  const [jobWhatsapp, setJobWhatsapp] = useState('+90 532 000 0000');
  const [jobImageUrl, setJobImageUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');

  // New Hotel State (with Map Pin Picker)
  const [hotelName, setHotelName] = useState('');
  const [hotelNameTr, setHotelNameTr] = useState('');
  const [hotelCity, setHotelCity] = useState('استانبول');
  const [hotelDistrict, setHotelDistrict] = useState('آکسارای');
  const [hotelType, setHotelType] = useState<'hotel' | 'hostel' | 'apart' | 'pension'>('hotel');
  const [hotelStars, setHotelStars] = useState(3);
  const [hotelPrice, setHotelPrice] = useState(900);
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelPhone, setHotelPhone] = useState('+90 212 588 0000');
  const [hotelWhatsapp, setHotelWhatsapp] = useState('+90 534 000 0000');
  const [hotelImageUrl, setHotelImageUrl] = useState('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
  const [hotelAmenities, setHotelAmenities] = useState('وای‌فای رایگان، صبحانه، پرسنل فارسی‌زبان');
  const [hotelNearTransit, setHotelNearTransit] = useState('نزدیک به ایستگاه مترو');
  const [hotelDesc, setHotelDesc] = useState('');
  const [hotelCoordinates, setHotelCoordinates] = useState<{ lat: number; lng: number }>({ lat: 41.0082, lng: 28.9484 });

  // New Address State
  const [addrTitle, setAddrTitle] = useState('');
  const [addrTitleTr, setAddrTitleTr] = useState('');
  const [addrCategory, setAddrCategory] = useState<AddressCategory>('immigration');
  const [addrCity, setAddrCity] = useState('استانبول');
  const [addrDistrict, setAddrDistrict] = useState('فاتیح');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrPhone, setAddrPhone] = useState('+90 ');
  const [addrHours, setAddrHours] = useState('۰۸:۳۰ الی ۱۷:۰۰');
  const [addrDesc, setAddrDesc] = useState('');

  if (!isAdminLoggedIn) return null;

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobCompany.trim() || !jobDescription.trim()) {
      showToast('لطفاً عنوان، نام کارفرما و توضیحات کار را وارد نمایید', 'error');
      return;
    }
    const kwList = jobKeywords.split('،').join(',').split(',').map((k) => k.trim()).filter(Boolean);

    addJob({
      title: jobTitle.trim(),
      company: jobCompany.trim(),
      city: jobCity,
      district: jobDistrict.trim(),
      category: jobCategory,
      subcategory: jobSubcategory.trim(),
      contractType: jobContractType,
      payFrequency: jobPayFrequency,
      keywords: kwList.length > 0 ? kwList : [jobCategory, jobCity],
      salaryMin: Number(jobSalaryMin) || 30000,
      salaryMax: Number(jobSalaryMax) || 38000,
      currency: 'TRY',
      accommodation: jobAccommodation,
      meals: jobMeals,
      hasLeave: jobHasLeave,
      leaveDetails: jobHasLeave ? jobLeaveDetails.trim() : undefined,
      workPermitSupport: jobWorkPermit,
      turkishRequired: jobTurkishLevel,
      gender: 'all',
      imageUrl: jobImageUrl.trim(),
      description: jobDescription.trim(),
      requirements: ['انضباط کاری و مسئولیت‌پذیری'],
      contactPhone: jobPhone.trim(),
      contactWhatsapp: jobWhatsapp.trim(),
      isActive: true,
    });

    setShowAddJobModal(false);
    setJobTitle('');
    setJobCompany('');
    setJobDescription('');
    showToast('فرصت شغلی جدید با مشخصات کامل ثبت و منتشر شد', 'success');
  };

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName.trim() || !hotelPrice) {
      showToast('لطفاً نام هتل و قیمت را وارد نمایید', 'error');
      return;
    }
    const amenitiesList = hotelAmenities.split('،').join(',').split(',').map((a) => a.trim()).filter(Boolean);

    addHotel({
      name: hotelName.trim(),
      nameTr: hotelNameTr.trim() || hotelName.trim(),
      city: hotelCity,
      district: hotelDistrict.trim(),
      stars: Number(hotelStars) || 3,
      type: hotelType,
      pricePerNight: Number(hotelPrice) || 850,
      address: hotelAddress.trim() || `${hotelDistrict}, ${hotelCity}`,
      phone: hotelPhone.trim(),
      whatsapp: hotelWhatsapp.trim(),
      imageUrl: hotelImageUrl.trim(),
      amenities: amenitiesList.length > 0 ? amenitiesList : ['وای‌فای رایگان'],
      nearTransit: hotelNearTransit.trim() || 'نزدیک به ایستگاه مترو',
      description: hotelDesc.trim() || 'هتل اقتصادی و تمیز با دسترسی عالی به حمل و نقل',
      mapsUrl: `https://www.google.com/maps?q=${hotelCoordinates.lat},${hotelCoordinates.lng}`,
      coordinates: hotelCoordinates,
    });

    setShowAddHotelModal(false);
    setHotelName('');
    setHotelNameTr('');
    setHotelAddress('');
    showToast('هتل جدید با موقعیت مکانی دقیق روی نقشه افزوده شد', 'success');
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle.trim() || !addrAddress.trim()) {
      showToast('لطفاً عنوان و آدرس مرکز را وارد نمایید', 'error');
      return;
    }

    addAddress({
      title: addrTitle.trim(),
      titleTr: addrTitleTr.trim() || addrTitle.trim(),
      category: addrCategory,
      city: addrCity,
      district: addrDistrict.trim(),
      address: addrAddress.trim(),
      phones: [addrPhone.trim()],
      workingHours: addrHours.trim(),
      description: addrDesc.trim() || 'ارائه خدمات اداری و کنسولی در ترکیه',
      isEmergency24h: false,
    });

    setShowAddAddressModal(false);
    setAddrTitle('');
    setAddrAddress('');
    showToast('مرکز جدید با موفقیت به راهنمای آدرس‌ها اضافه شد', 'success');
  };

  return (
    <>
      {/* Omnipresent Floating Admin Bar */}
      <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-xl animate-in slide-in-from-bottom duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/70 rounded-2xl shadow-2xl p-2.5 flex items-center justify-between gap-2 text-xs">
          {/* Status info */}
          <div className="flex items-center gap-2 pr-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div className="hidden sm:block">
              <span className="font-extrabold text-amber-300 block text-xs">دسترسی مدیر فعال است</span>
              <span className="text-[10px] text-slate-400">امکانات افزودن و ویرایش تمام بخش‌ها</span>
            </div>
            <span className="sm:hidden font-bold text-amber-300 text-xs">مدیر فعال</span>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowAddJobModal(true)}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1 text-xs"
              title="افزودن آگهی کار جدید با بیمه، غذا و خوابگاه"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ کار</span>
            </button>

            <button
              onClick={() => setShowAddHotelModal(true)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1 text-xs"
              title="افزودن هتل جدید با انتخاب لوکیشن دقیق از روی نقشه"
            >
              <HotelIcon className="w-3.5 h-3.5" />
              <span>+ هتل</span>
            </button>

            <button
              onClick={() => setShowAddAddressModal(true)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1 text-xs hidden md:flex"
              title="افزودن مرکز جدید یا سفارت"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ آدرس</span>
            </button>

            <button
              onClick={() => setActiveTab('partner')}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1 text-xs"
              title="ورود به بخش همکاران و دفاتر"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">همکاران</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1 text-xs"
              title="ورود به پنل مدیریت جامع"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پنل مدیریت</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
              title="خروج از حالت مدیریت"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADD JOB MODAL */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-600/20 text-red-400 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">افزودن فرصت شغلی جدید (ویژه مدیر)</h3>
              </div>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عنوان شغل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: کمک‌آشپز و سالن‌کار"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام کارفرما یا شرکت *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: هتل و رستوران آناتولی"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">دسته‌بندی شغل *</label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value as JobCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="restaurant">رستوران و کافه (آشپز، کمک‌آشپز، سالن‌کار، باریستا)</option>
                  <option value="textile">خیاطی و پوشاک (چرخکار، راسته‌دوز، اتوکار، بسته‌بندی)</option>
                  <option value="construction">ساختمانی و فنی (نقاش، کاشی‌کار، کناف، برق‌کار)</option>
                  <option value="hotel">هتل و گردشگری (پذیرش، خانه‌داری، تورلیدر)</option>
                  <option value="realestate">املاک و مستغلات (مشاور فروش، اجاره ملک)</option>
                  <option value="beauty">آرایشگری و زیبایی (آرایشگر مردانه، ناخن‌کار، میکاپ)</option>
                  <option value="warehouse">انبار و کارگو (بسته‌بندی، لجستیک کالا)</option>
                  <option value="sales">فروش و بازاریابی (بوتیک، مارکت، صندوق‌دار)</option>
                  <option value="transport">رانندگی و دلیوری (پیک موتوری، ترنسفر فرودگاهی)</option>
                  <option value="furniture">نجاری و مبلمان (کابینت‌کار MDF، نجار)</option>
                  <option value="automotive">تعمیرات خودرو (مکانیک، جلوبندی، صافکاری)</option>
                  <option value="translator">مترجمی و سلامت (کلینیک درمانی، دارالترجمه)</option>
                  <option value="technical">فنی و مهندسی (جوشکار CO2، تکنسین CNC)</option>
                  <option value="it">فناوری اطلاعات و دیجیتال مارکتینگ</option>
                  <option value="general">کارهای عمومی و ساده</option>
                </select>

                {/* Subcategories Multi-Select Checklist */}
                {(() => {
                  const catInfo = JOB_CATEGORIES_DATA.find((c) => c.key === jobCategory);
                  if (!catInfo || catInfo.subcategories.length === 0) return null;
                  const currentSubs = jobSubcategory.split('،').map((s) => s.trim()).filter(Boolean);

                  return (
                    <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <span className="font-bold text-amber-300 block text-[11px]">
                        تخصص‌ها و زیرشاخه‌های {catInfo.label} (انتخاب چندتایی با تیک):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {catInfo.subcategories.map((sub, sidx) => {
                          const isChecked = currentSubs.includes(sub);
                          return (
                            <label key={sidx} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const updated = [...currentSubs, sub];
                                    setJobSubcategory(updated.join('، '));
                                  } else {
                                    const updated = currentSubs.filter((s) => s !== sub);
                                    setJobSubcategory(updated.join('، '));
                                  }
                                }}
                                className="rounded accent-amber-500"
                              />
                              <span>{sub}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر (تمام شهرهای ترکیه)</label>
                  <select
                    value={jobCity}
                    onChange={(e) => setJobCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله</label>
                  <input
                    type="text"
                    value={jobDistrict}
                    onChange={(e) => setJobDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداقل حقوق (لیر)</label>
                  <input
                    type="number"
                    value={jobSalaryMin}
                    onChange={(e) => setJobSalaryMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداکثر حقوق (لیر)</label>
                  <input
                    type="number"
                    value={jobSalaryMax}
                    onChange={(e) => setJobSalaryMax(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Perks: بیمه، غذا، جای خواب */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="font-bold text-amber-300 block">مزایای رفاهی و اقامتی شغل:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={jobAccommodation}
                      onChange={(e) => setJobAccommodation(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>جای خواب / اسکان</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={jobMeals}
                      onChange={(e) => setJobMeals(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>وعده غذایی</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={jobHasLeave}
                      onChange={(e) => setJobHasLeave(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>مرخصی کاری</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={jobWorkPermit}
                      onChange={(e) => setJobWorkPermit(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>چالیشما ایزنی</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس کارفرما</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={jobPhone}
                    onChange={(e) => setJobPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره واتساپ</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={jobWhatsapp}
                    onChange={(e) => setJobWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">کلمات کلیدی (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  value={jobKeywords}
                  onChange={(e) => setJobKeywords(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Photo Picker: Native Gallery Upload or Curated Presets */}
              <JobImagePicker
                value={jobImageUrl}
                onChange={setJobImageUrl}
                category={jobCategory}
              />

              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات و شرایط کار *</label>
                <textarea
                  required
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="شرح وظایف، ساعات کاری، شرایط اسکان و..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ثبت و انتشار آگهی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD HOTEL MODAL WITH MAP PICKER */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <HotelIcon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">افزودن هتل و اقامتگاه جدید (با نقشه)</h3>
              </div>
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              {/* INTERACTIVE MAP PICKER FOR HOTEL */}
              <div className="p-4 bg-slate-950/80 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    انتخاب لوکیشن دقیق هتل از روی نقشه ماهواره‌ای ترکیه:
                  </span>
                  <span className="text-[11px] text-slate-400">روی نقشه کلیک یا نشانگر را جابجا کنید</span>
                </div>

                <MapLocationPicker
                  initialCoordinates={hotelCoordinates}
                  onChange={(coords) => setHotelCoordinates(coords)}
                  defaultCity={hotelCity}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono" dir="ltr">
                  <span>Lat: {hotelCoordinates.lat.toFixed(5)}</span>
                  <span>Lng: {hotelCoordinates.lng.toFixed(5)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام هتل یا اقامتگاه (فارسی) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: هتل بزرگ آکسارای"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام هتل (ترکی / لاتین)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Aksaray Grand Hotel"
                    value={hotelNameTr}
                    onChange={(e) => setHotelNameTr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-left font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر</label>
                  <select
                    value={hotelCity}
                    onChange={(e) => setHotelCity(e.target.value)}
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
                    value={hotelDistrict}
                    onChange={(e) => setHotelDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">قیمت هر شب (لیر) *</label>
                  <input
                    type="number"
                    required
                    value={hotelPrice}
                    onChange={(e) => setHotelPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ستاره هتل</label>
                  <select
                    value={hotelStars}
                    onChange={(e) => setHotelStars(Number(e.target.value))}
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

              <div>
                <label className="block text-slate-300 font-bold mb-1">امکانات هتل (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  value={hotelAmenities}
                  onChange={(e) => setHotelAmenities(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس هتل</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={hotelPhone}
                    onChange={(e) => setHotelPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نزدیک به ایستگاه</label>
                  <input
                    type="text"
                    value={hotelNearTransit}
                    onChange={(e) => setHotelNearTransit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">آدرس متنی کامل</label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  placeholder="مثلاً: استانبول، فاتیح، میدان آکسارای، پلاک ۱۲"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
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

      {/* QUICK ADD ADDRESS MODAL */}
      {showAddAddressModal && (
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
                onClick={() => setShowAddAddressModal(false)}
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
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">دسته‌بندی</label>
                  <select
                    value={addrCategory}
                    onChange={(e) => setAddrCategory(e.target.value as AddressCategory)}
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
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="ترابزون">ترابزون</option>
                    <option value="ارزروم">ارزروم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">آدرس کامل *</label>
                <textarea
                  required
                  rows={2}
                  value={addrAddress}
                  onChange={(e) => setAddrAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ساعات کاری</label>
                  <input
                    type="text"
                    value={addrHours}
                    onChange={(e) => setAddrHours(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
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
    </>
  );
};
