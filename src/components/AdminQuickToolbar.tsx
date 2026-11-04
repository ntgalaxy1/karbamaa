import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapLocationPicker } from './MapLocationPicker';
import { JobImagePicker } from './JobImagePicker';
import { JobCategory, ContractType, TurkishLevel, AddressCategory, PayFrequency } from '../types';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import { getDistrictsForCity } from '../data/turkeyData';
import {
  Plus,
  Briefcase,
  Hotel as HotelIcon,
  Building2,
  X,
  FileCheck,
  Utensils,
  Home,
  Compass,
  Calendar,
} from 'lucide-react';

export const AdminQuickToolbar: React.FC = () => {
  const {
    isAdminLoggedIn,
    addJob,
    addHotel,
    addAddress,
    showToast,
    adminJobModalOpen,
    setAdminJobModalOpen,
    adminHotelModalOpen,
    setAdminHotelModalOpen,
    adminAddressModalOpen,
    setAdminAddressModalOpen,
  } = useApp();

  // Unified Job Posting & Position Registration State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobCity, setJobCity] = useState('استانبول');
  const [jobDistrict, setJobDistrict] = useState('فاتیح');
  const [jobCategory, setJobCategory] = useState<JobCategory>('restaurant');
  const [jobSubcategory, setJobSubcategory] = useState('کمک‌آشپز و سالن‌کار');
  const [jobPayFrequency, setJobPayFrequency] = useState<PayFrequency>('monthly');
  const [jobSalaryMin, setJobSalaryMin] = useState(32000);
  const [jobSalaryMax, setJobSalaryMax] = useState(40000);
  const [jobAccommodation, setJobAccommodation] = useState(true);
  const [jobAccommodationDetails, setJobAccommodationDetails] = useState(
    'خوابگاه پرسنلی مجهز با تخت، کمد اختصاصی، اینترنت پرسرعت رایگان و سرویس مجزا'
  );
  const [jobMeals, setJobMeals] = useState(true);
  const [jobMealDetails, setJobMealDetails] = useState(
    '۳ وعده غذای گرم کامل (صبحانه، ناهار و شام) رایگان در محل کارگاه'
  );
  const [jobHasLeave, setJobHasLeave] = useState(true);
  const [jobLeaveDetails, setJobLeaveDetails] = useState('۱ روز در هفته (یک‌شنبه یا توافقی)');
  const [jobWorkPermit, setJobWorkPermit] = useState(true);
  const [jobContractType, setJobContractType] = useState<ContractType>('full_time');
  const [jobTurkishLevel, setJobTurkishLevel] = useState<TurkishLevel>('basic');
  const [jobGender, setJobGender] = useState<'all' | 'male' | 'female'>('all');
  const [jobKeywords, setJobKeywords] = useState('رستوران، آشپزی، جای خواب، اقامت کاری');
  const [jobRequirements, setJobRequirements] = useState('سابقه کار مرتبط، انضباط کاری و مسئولیت‌پذیری');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPhone, setJobPhone] = useState('+90 532 000 0000');
  const [jobWhatsapp, setJobWhatsapp] = useState('+90 532 000 0000');
  const [jobImageUrl, setJobImageUrl] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  );

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
  const [hotelImageUrl, setHotelImageUrl] = useState(
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  );
  const [hotelAmenities, setHotelAmenities] = useState('وای‌فای رایگان، صبحانه، پرسنل فارسی‌زبان');
  const [hotelNearTransit, setHotelNearTransit] = useState('نزدیک به ایستگاه مترو');
  const [hotelDesc, setHotelDesc] = useState('');
  const [hotelCoordinates, setHotelCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 41.0082,
    lng: 28.9484,
  });

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
    const kwList = jobKeywords
      .split('،')
      .join(',')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const reqList = jobRequirements
      .split('،')
      .join(',')
      .split(/[\n,]+/)
      .map((r) => r.trim())
      .filter(Boolean);

    addJob({
      title: jobTitle.trim(),
      company: jobCompany.trim(),
      city: jobCity,
      district: jobDistrict.trim() || 'مرکز شهر',
      category: jobCategory,
      subcategory: jobSubcategory.trim(),
      contractType: jobContractType,
      payFrequency: jobPayFrequency,
      keywords: kwList.length > 0 ? kwList : [jobCategory, jobCity, jobDistrict],
      salaryMin: Number(jobSalaryMin) || 30000,
      salaryMax: Number(jobSalaryMax) || 38000,
      currency: 'TRY',
      accommodation: jobAccommodation,
      accommodationDetails: jobAccommodation ? jobAccommodationDetails.trim() : undefined,
      meals: jobMeals,
      mealDetails: jobMeals ? jobMealDetails.trim() : undefined,
      hasLeave: jobHasLeave,
      leaveDetails: jobHasLeave ? jobLeaveDetails.trim() : undefined,
      workPermitSupport: jobWorkPermit,
      turkishRequired: jobTurkishLevel,
      gender: jobGender,
      imageUrl: jobImageUrl.trim(),
      description: jobDescription.trim(),
      requirements: reqList.length > 0 ? reqList : ['انضباط کاری و مسئولیت‌پذیری'],
      contactPhone: jobPhone.trim(),
      contactWhatsapp: jobWhatsapp.trim(),
      isActive: true,
    });

    setAdminJobModalOpen(false);
    setJobTitle('');
    setJobCompany('');
    setJobDescription('');
    showToast('آگهی استخدام و موقعیت شغلی جدید با موفقیت ثبت و منتشر شد', 'success');
  };

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName.trim() || !hotelPrice) {
      showToast('لطفاً نام هتل و قیمت را وارد نمایید', 'error');
      return;
    }
    const amenitiesList = hotelAmenities
      .split('،')
      .join(',')
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

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

    setAdminHotelModalOpen(false);
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

    setAdminAddressModalOpen(false);
    setAddrTitle('');
    setAddrAddress('');
    showToast('مرکز جدید با موفقیت به راهنمای آدرس‌ها اضافه شد', 'success');
  };

  return (
    <>
      {/* UNIFIED JOB POSTING & POSITION REGISTRATION MODAL (ادغام ثبت آگهی استخدام و ثبت موقعیت شغلی) */}
      {adminJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    ثبت آگهی استخدام و موقعیت شغلی جدید
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    فرم جامع و یکپارچه ثبت فرصت شغلی در ترکیه با انتشار فوری
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdminJobModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateJob}
              className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs text-right"
            >
              {/* Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عنوان شغل / آگهی استخدام *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: کمک‌آشپز و سالن‌کار رستوران"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام کارفرما یا مجموعه *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: مجموعه رستوران‌های آناتولی"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category & Multi-Select Subcategories */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">دسته‌بندی شغل *</label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value as JobCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-hidden focus:border-amber-500"
                >
                  {JOB_CATEGORIES_DATA.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                {(() => {
                  const catInfo = JOB_CATEGORIES_DATA.find((c) => c.key === jobCategory);
                  if (!catInfo || catInfo.subcategories.length === 0) return null;
                  const currentSubs = jobSubcategory
                    .split('،')
                    .map((s) => s.trim())
                    .filter(Boolean);

                  return (
                    <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <span className="font-bold text-amber-300 block text-[11px]">
                        تخصص‌ها و زیرشاخه‌های {catInfo.label} (انتخاب چندتایی با تیک):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {catInfo.subcategories.map((sub, sidx) => {
                          const isChecked = currentSubs.includes(sub);
                          return (
                            <label
                              key={sidx}
                              className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white"
                            >
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

              {/* City (All Turkey Cities) + Dynamic District Dropdown + Contract Type + Pay Frequency */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر ترکیه *</label>
                  <select
                    value={jobCity}
                    onChange={(e) => {
                      const nextCity = e.target.value;
                      setJobCity(nextCity);
                      const dists = getDistrictsForCity(nextCity);
                      if (dists.length > 0) setJobDistrict(dists[0]);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله *</label>
                  <select
                    value={jobDistrict}
                    onChange={(e) => setJobDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {getDistrictsForCity(jobCity).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع قرارداد</label>
                  <select
                    value={jobContractType}
                    onChange={(e) => setJobContractType(e.target.value as ContractType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="full_time">تمام وقت (Full-Time)</option>
                    <option value="part_time">پاره وقت (Part-Time)</option>
                    <option value="seasonal">فصلی / پروژه‌ای</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">نحوه پرداخت حقوق</label>
                  <select
                    value={jobPayFrequency}
                    onChange={(e) => setJobPayFrequency(e.target.value as PayFrequency)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="monthly">ماهانه</option>
                    <option value="weekly">هفتگی (Haftalık)</option>
                    <option value="daily">روزانه (Yevmiye)</option>
                  </select>
                </div>
              </div>

              {/* Salary Min/Max + Turkish Level + Gender */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداقل حقوق (لیر ₺)</label>
                  <input
                    type="number"
                    value={jobSalaryMin}
                    onChange={(e) => setJobSalaryMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداکثر حقوق (لیر ₺)</label>
                  <input
                    type="number"
                    value={jobSalaryMax}
                    onChange={(e) => setJobSalaryMax(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سطح زبان ترکی</label>
                  <select
                    value={jobTurkishLevel}
                    onChange={(e) => setJobTurkishLevel(e.target.value as TurkishLevel)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="none">بدون نیاز به زبان</option>
                    <option value="basic">ترکی مقدماتی / پایه</option>
                    <option value="intermediate">ترکی متوسط</option>
                    <option value="fluent">ترکی پیشرفته / مسلط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">جنسیت کارجو</label>
                  <select
                    value={jobGender}
                    onChange={(e) => setJobGender(e.target.value as 'all' | 'male' | 'female')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="all">فرقی ندارد (آقا و خانم)</option>
                    <option value="male">فقط آقا</option>
                    <option value="female">فقط خانم</option>
                  </select>
                </div>
              </div>

              {/* Comprehensive Welfare & Perks Section with Presets */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-300 block">
                  مزایای رفاهی، اسکان، غذا، مرخصی و اقامت کاری:
                </span>

                {/* 1. Accommodation */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobAccommodation}
                        onChange={(e) => setJobAccommodation(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-blue-400" />
                        امکان اسکان و جای خواب رایگان
                      </span>
                    </label>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        jobAccommodation ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {jobAccommodation ? 'فعال ✓' : 'غیرفعال'}
                    </span>
                  </div>

                  {jobAccommodation && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">پیش‌فرض‌های سریع:</span>
                        {[
                          'خوابگاه پرسنلی مجهز با اینترنت',
                          'اتاق مستقل ۲ نفره',
                          'پانسیون در محل کارگاه',
                          'کمک‌هزینه مسکن ماهانه',
                        ].map((preset, pidx) => (
                          <button
                            key={pidx}
                            type="button"
                            onClick={() => setJobAccommodationDetails(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="شرح دقیق امکانات اسکان..."
                        value={jobAccommodationDetails}
                        onChange={(e) => setJobAccommodationDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Meals */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobMeals}
                        onChange={(e) => setJobMeals(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-amber-400" />
                        وعده‌های غذایی رایگان
                      </span>
                    </label>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        jobMeals ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {jobMeals ? 'فعال ✓' : 'غیرفعال'}
                    </span>
                  </div>

                  {jobMeals && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">پیش‌فرض‌های سریع:</span>
                        {[
                          '۳ وعده کامل (صبحانه، ناهار، شام)',
                          'ناهار گرم روزانه رایگان',
                          'صبحانه و ناهار',
                          'بن خرید غذا / Sodexo',
                        ].map((preset, pidx) => (
                          <button
                            key={pidx}
                            type="button"
                            onClick={() => setJobMealDetails(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="شرح وعده‌های غذایی..."
                        value={jobMealDetails}
                        onChange={(e) => setJobMealDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Leave */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobHasLeave}
                        onChange={(e) => setJobHasLeave(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        مرخصی کاری هفتگی / ماهانه
                      </span>
                    </label>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        jobHasLeave ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {jobHasLeave ? 'دارای مرخصی ✓' : 'بدون مرخصی'}
                    </span>
                  </div>

                  {jobHasLeave && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">پیش‌فرض‌های سریع:</span>
                        {[
                          '۱ روز در هفته (یک‌شنبه یا توافقی)',
                          '۲ روز در ماه مرخصی با حقوق',
                          'مرخصی فصلی و توافقی',
                        ].map((preset, pidx) => (
                          <button
                            key={pidx}
                            type="button"
                            onClick={() => setJobLeaveDetails(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="شرح جزئیات مرخصی..."
                        value={jobLeaveDetails}
                        onChange={(e) => setJobLeaveDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Work Permit */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobWorkPermit}
                      onChange={(e) => setJobWorkPermit(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      پشتیبانی از اخذ چالیشما ایزنی (اقامت کاری رسمی ترکیه)
                    </span>
                  </label>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      jobWorkPermit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {jobWorkPermit ? 'پشتیبانی دارد' : 'بدون چالیشما'}
                  </span>
                </div>
              </div>

              {/* Contact Phone & WhatsApp */}
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
                  <label className="block text-slate-300 font-bold mb-1">شماره واتساپ کارفرما</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={jobWhatsapp}
                    onChange={(e) => setJobWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
              </div>

              {/* Keywords & Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">کلمات کلیدی جستجو (با کاما)</label>
                  <input
                    type="text"
                    value={jobKeywords}
                    onChange={(e) => setJobKeywords(e.target.value)}
                    placeholder="مثال: آشپز، رستوران، جای خواب"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شرایط احراز و مهارت‌ها</label>
                  <input
                    type="text"
                    value={jobRequirements}
                    onChange={(e) => setJobRequirements(e.target.value)}
                    placeholder="مثال: سابقه کار مرتبط، انضباط کاری"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Photo Picker: Native Gallery Upload or Curated Presets */}
              <JobImagePicker value={jobImageUrl} onChange={setJobImageUrl} category={jobCategory} />

              {/* Job Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات کامل و شرح وظایف *</label>
                <textarea
                  required
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="شرح وظایف، ساعات کاری، شرایط اسکان و مزایا..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdminJobModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت و انتشار فوری آگهی استخدام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD HOTEL MODAL WITH MAP PICKER */}
      {adminHotelModalOpen && (
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
                onClick={() => setAdminHotelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateHotel}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right"
            >
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

                <div
                  className="flex items-center justify-between text-[11px] text-slate-400 font-mono"
                  dir="ltr"
                >
                  <span>Lat: {hotelCoordinates.lat.toFixed(5)}</span>
                  <span>Lng: {hotelCoordinates.lng.toFixed(5)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    نام هتل یا اقامتگاه (فارسی) *
                  </label>
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
                    onChange={(e) => {
                      const nextC = e.target.value;
                      setHotelCity(nextC);
                      const dists = getDistrictsForCity(nextC);
                      if (dists.length > 0) setHotelDistrict(dists[0]);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله</label>
                  <select
                    value={hotelDistrict}
                    onChange={(e) => setHotelDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {getDistrictsForCity(hotelCity).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
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
                <label className="block text-slate-300 font-bold mb-1">
                  امکانات هتل (با ویرگول جدا کنید)
                </label>
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
                  onClick={() => setAdminHotelModalOpen(false)}
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
      {adminAddressModalOpen && (
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
                onClick={() => setAdminAddressModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateAddress}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right"
            >
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    onChange={(e) => {
                      const nextC = e.target.value;
                      setAddrCity(nextC);
                      const dists = getDistrictsForCity(nextC);
                      if (dists.length > 0) setAddrDistrict(dists[0]);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله</label>
                  <select
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {getDistrictsForCity(addrCity).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
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
                  onClick={() => setAdminAddressModalOpen(false)}
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
