import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLanguage, TargetCountry, Gender } from '../types';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { IRAN_PROVINCES, IRAN_CITIES_BY_PROVINCE } from '../data/iranCities';
import { CommitmentModal } from './CommitmentModal';
import {
  Globe,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Building2,
  Lock,
  User,
  KeyRound,
  Phone,
  Briefcase,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Search,
  LogIn,
  Check,
  MapPin,
  CreditCard,
  Camera,
  Upload,
  IdCard,
  FileText,
  AlertCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

const DESTINATION_COUNTRIES: { id: TargetCountry; name: string; flag: string; desc: string }[] = [
  { id: 'ترکیه', name: 'ترکیه (Türkiye)', flag: '🇹🇷', desc: 'فرصت‌های کاری رستورانی، تولیدی پوشاک، هتل‌ها و چالیشما' },
  { id: 'ارمنستان', name: 'ارمنستان (Armenia)', flag: '🇦🇲', desc: 'بدون ویزا، هزینه‌های مناسب، مشاغل خدماتی و بازرگانی' },
  { id: 'عراق', name: 'عراق (Iraq)', flag: '🇮🇶', desc: 'درآمد دلاری در اقلیم کردستان، حوزه‌های فنی و ساختمانی' },
  { id: 'آلمان', name: 'آلمان (Germany)', flag: '🇩🇪', desc: 'ویزای فرصت کار (Chancenkarte)، کادر درمان و مهندسی' },
];

export const OnboardingFlow: React.FC = () => {
  const {
    appLanguage,
    setAppLanguage,
    setHasCompletedOnboarding,
    registerSeeker,
    loginSeeker,
    loginAdmin,
    loginPartner,
    showToast,
    brokerSettings,
  } = useApp();

  // Mode: 'language' | 'register' | 'login'
  const [viewMode, setViewMode] = useState<'language' | 'register' | 'login'>('language');

  // 4-step wizard step
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: مشخصات فردی، اکانت، کارت واریزکننده و کشور مقصد
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+98');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payerCardNumber, setPayerCardNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<Gender>('male');
  const [targetCountry, setTargetCountry] = useState<TargetCountry>('ترکیه');

  // STEP 2: محل سکونت در ایران
  const [iranProvince, setIranProvince] = useState('تهران');
  const [iranCity, setIranCity] = useState('تهران');
  const [iranAddress, setIranAddress] = useState('');

  // STEP 3: عکس‌ها و دو بخش مهارت‌ها
  const [fullBodyPhotoUrl, setFullBodyPhotoUrl] = useState('');
  const [passportPhotoUrl, setPassportPhotoUrl] = useState('');
  const [nationalCardPhotoUrl, setNationalCardPhotoUrl] = useState('');
  const [selectedCommonJobs, setSelectedCommonJobs] = useState<string[]>([]);
  const [isJobsMenuOpen, setIsJobsMenuOpen] = useState(false);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('restaurant');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [customWrittenSkills, setCustomWrittenSkills] = useState('');

  // STEP 4: تعهدنامه تسویه حساب کارگزار و امضای دیجیتال
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<'seeker' | 'admin' | 'partner'>('seeker');
  const [loginError, setLoginError] = useState<string | null>(null);

  const languages: { code: AppLanguage; label: string; nativeName: string; flag: string; welcome: string; desc: string }[] = [
    {
      code: 'fa',
      label: 'فارسی',
      nativeName: 'فارسی',
      flag: '🇮🇷',
      welcome: 'به سامانه رسمی کاریابی کارباما خوش آمدید',
      desc: 'مرجع رسمی ثبت‌نام کارجویان، پرونده‌های استخدامی و اعزام نیروی کار',
    },
    {
      code: 'tr',
      label: 'Türkçe',
      nativeName: 'Türkçe',
      flag: '🇹🇷',
      welcome: 'Karbama Uygulamasına Hoş Geldiniz',
      desc: "Türkiye'deki İranlılar için İş ve İkamet Sistemi",
    },
    {
      code: 'en',
      label: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      welcome: 'Welcome to Karbama App',
      desc: 'The official recruitment and residence system for Turkey',
    },
    {
      code: 'ar',
      label: 'العربية',
      nativeName: 'العربية',
      flag: '🇸🇦',
      welcome: 'مرحباً بكم في تطبيق كارباما',
      desc: 'نظام التوظيف والإقامة الرسمي في تركيا',
    },
  ];

  const currentLangObj = languages.find((l) => l.code === appLanguage) || languages[0];

  const toggleCommonJob = (jobTitle: string) => {
    setSelectedCommonJobs((prev) =>
      prev.includes(jobTitle) ? prev.filter((j) => j !== jobTitle) : [...prev, jobTitle]
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('حجم فایل تصویر باید کمتر از ۸ مگابایت باشد.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        showToast('فایل تصویر با موفقیت بارگذاری گردید.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = (): boolean => {
    if (!firstName.trim() || !lastName.trim() || !fatherName.trim() || !nationalId.trim()) {
      showToast('لطفاً مشخصات فردی (نام، نام خانوادگی، نام پدر و کد ملی) را تکمیل فرمایید.', 'error');
      return false;
    }
    if (nationalId.replace(/\s/g, '').length < 10) {
      showToast('کد ملی وارد شده باید ۱۰ رقم کامل باشد.', 'error');
      return false;
    }
    if (!phoneNumber.trim()) {
      showToast('لطفاً شماره تلفن/واتساپ را وارد فرمایید.', 'error');
      return false;
    }
    if (!payerCardNumber.trim() || payerCardNumber.replace(/\D/g, '').length < 16) {
      showToast('لطفاً شماره کارت ۱۶ رقمی واریزکننده (مشتری) را وارد فرمایید.', 'error');
      return false;
    }
    if (!username.trim() || !password.trim()) {
      showToast('لطفاً نام کاربری و رمز عبور ورود را وارد فرمایید.', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!iranProvince.trim() || !iranCity.trim() || !iranAddress.trim()) {
      showToast('لطفاً آدرس دقیق سکونت در ایران (استان، شهرستان و آدرس پستی) را وارد کنید.', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (selectedCommonJobs.length === 0 && !customWrittenSkills.trim()) {
      showToast('لطفاً حداقل یک شغل از منوی شغل‌های رایج انتخاب کنید یا تخصص خود را بنویسید.', 'error');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (regStep === 1) {
      if (validateStep1()) setRegStep(2);
    } else if (regStep === 2) {
      if (validateStep2()) setRegStep(3);
    } else if (regStep === 3) {
      if (validateStep3()) setRegStep(4);
    }
  };

  const handlePrevStep = () => {
    if (regStep > 1) {
      setRegStep((prev) => (prev - 1) as any);
    }
  };

  const handleRegisterFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep1()) {
      setRegStep(1);
      return;
    }
    if (!validateStep2()) {
      setRegStep(2);
      return;
    }
    if (!validateStep3()) {
      setRegStep(3);
      return;
    }

    if (!acceptTerms) {
      showToast('لطفاً قوانین و ضوابط کاریابی را تایید نمایید.', 'error');
      return;
    }

    const combinedSkills = [...selectedCommonJobs];
    if (customWrittenSkills.trim()) {
      combinedSkills.push(customWrittenSkills.trim());
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const res = registerSeeker({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      fatherName: fatherName.trim(),
      nationalId: nationalId.trim(),
      gender,
      phoneCountryCode,
      phoneNumber: phoneNumber.trim(),
      phone: `${phoneCountryCode} ${phoneNumber.trim()}`,
      username: username.trim().toLowerCase(),
      password: password.trim(),
      iranProvince: iranProvince.trim(),
      iranCity: iranCity.trim(),
      iranAddress: iranAddress.trim(),
      targetCountry,
      targetCity: 'استانبول',
      turkishLevel: 'basic',
      residenceStatus: 'none',
      skills: combinedSkills.length > 0 ? combinedSkills : ['کار عمومی'],
      selectedJobs: selectedCommonJobs,
      customProfession: customWrittenSkills.trim(),
      passportPhotoUrl,
      fullBodyPhotoUrl,
      nationalCardPhotoUrl,
      payerCardNumber: payerCardNumber.trim(),
      signatureDataUrl,
      contractAccepted: true,
      bio: 'کارجو ثبت‌نام شده در سامانه کارباما',
    });

    if (res.success) {
      setIsCommitmentModalOpen(false);
      setHasCompletedOnboarding(true);
      showToast('ثبت‌نام رسمی شما انجام گردید. پرونده جهت بررسی و فعال‌سازی ارجاع داده شد.', 'success');
    } else {
      showToast(res.error || 'خطا در ثبت‌نام. لطفاً ورودی‌های خود را بررسی نمایید.', 'error');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginRole === 'admin') {
      const res = loginAdmin(loginUsername, loginPassword);
      if (res.success) {
        setHasCompletedOnboarding(true);
      } else {
        setLoginError(res.error || 'ورود مدیر ناموفق بود.');
      }
    } else if (loginRole === 'partner') {
      const res = loginPartner(loginUsername, loginPassword);
      if (res.success) {
        setHasCompletedOnboarding(true);
      } else {
        setLoginError(res.error || 'ورود همکار ناموفق بود.');
      }
    } else {
      const res = loginSeeker(loginUsername, loginPassword);
      if (res.success) {
        setHasCompletedOnboarding(true);
      } else {
        setLoginError(res.error || 'نام کاربری یا رمز عبور کارجو اشتباه است.');
      }
    }
  };

  const formattedPhone = `${phoneCountryCode} ${phoneNumber}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div style={{ background: 'var(--primary-topbar)' }} className="h-1.5 w-full shrink-0" />

        {/* Top Header Mode Indicator */}
        <div className="px-6 py-3.5 flex items-center justify-between text-xs border-b border-slate-800/80 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="کارباما"
              className="w-8 h-8 rounded-full object-cover border border-amber-400/80 shadow-sm"
            />
            <div>
              <span className="font-black text-sm text-white">کارباما | KARBAMA</span>
              <p className="text-[10px] text-slate-400">سامانه رسمی کاریابی و اعزام نیروی کار</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode('language')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'language' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              انتخاب زبان
            </button>
            <button
              type="button"
              onClick={() => setViewMode('register')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'register' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ثبت‌نام کارجو
            </button>
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'login' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ورود به حساب
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-7">
          {/* SCREEN 1: WELCOME & LANGUAGE SELECTION */}
          {viewMode === 'language' && (
            <div className="space-y-6 text-center py-2">
              <div className="relative inline-block mx-auto">
                <img
                  src="/logo.png"
                  alt="کارباما"
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-2xl ring-4 ring-amber-500/20"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {currentLangObj.welcome}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  {currentLangObj.desc}
                </p>
              </div>

              {/* Language Selection Grid */}
              <div className="space-y-2 pt-2 text-right">
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-red-400" />
                  لطفاً زبان مورد نظر خود را انتخاب کنید (Choose Language):
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {languages.map((l) => {
                    const isSelected = appLanguage === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setAppLanguage(l.code)}
                        className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-lg scale-[1.02]'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{l.flag}</span>
                          <div>
                            <p className="text-sm font-bold">{l.label}</p>
                            <p className="text-[10px] text-slate-400">{l.nativeName}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-700/30 transition flex items-center justify-center gap-2 group"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>شروع مرحله ثبت‌نام کارجو</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full sm:w-auto py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 shrink-0"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>ورود به حساب کاربری موجود</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: 4-STEP REGISTRATION WIZARD */}
          {viewMode === 'register' && (
            <div className="space-y-5">
              {/* Wizard Steps Progress Indicator */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between text-xs mb-2 font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>مرحله {regStep} از ۴ ثبت‌نام کارجو</span>
                  </span>
                  <span className="text-amber-400">
                    {regStep === 1 && '۱. مشخصات فردی، اکانت و کشور مقصد'}
                    {regStep === 2 && '۲. محل سکونت در ایران'}
                    {regStep === 3 && '۳. بارگذاری مدارک و مهارت‌ها'}
                    {regStep === 4 && '۴. تعهدنامه تسویه حساب کارگزار و امضا'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] text-center font-bold">
                  <div className={`py-1.5 rounded-lg transition ${regStep === 1 ? 'bg-red-600 text-white' : regStep > 1 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    ۱. مشخصات
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 2 ? 'bg-red-600 text-white' : regStep > 2 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    ۲. آدرس ایران
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 3 ? 'bg-red-600 text-white' : regStep > 3 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    ۳. مدارک و شغل
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 4 ? 'bg-red-600 text-white' : 'text-slate-500'}`}>
                    ۴. تعهدنامه و امضا
                  </div>
                </div>
              </div>

              {/* STEP 1: مشخصات هویتی + شماره کارت واریزکننده + تعیین کشور مقصد */}
              {regStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    بخش اول: دریافت مشخصات هویتی، اکانت، شماره کارت واریزکننده و کشور مقصد
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: علی"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام خانوادگی *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: رضایی"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام پدر *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: حسین"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">کد ملی ۱۰ رقمی *</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="کد ۱۰ رقمی ملی"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">شماره موبایل / واتساپ *</label>
                      <div className="flex gap-1.5" dir="ltr">
                        <select
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2.5 text-white text-xs font-mono shrink-0"
                        >
                          <option value="+98">🇮🇷 +98</option>
                          <option value="+90">🇹🇷 +90</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+964">🇮🇶 +964</option>
                          <option value="+374">🇦🇲 +374</option>
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="9123456789"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium text-amber-300">شماره کارت ۱۶ رقمی واریزکننده (مشتری) *</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        dir="ltr"
                        placeholder="6037-9975-XXXX-XXXX"
                        value={payerCardNumber}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = clean.match(/.{1,4}/g)?.join('-') || clean;
                          setPayerCardNumber(formatted);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono font-bold text-left focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام کاربری جهت ورود *</label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        placeholder="مثال: ali_karbama"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">رمز عبور دلخواه *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          dir="ltr"
                          placeholder="حداقل ۴ کاراکتر"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-2.5 top-3 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div className="text-xs space-y-1 pt-1">
                    <label className="text-slate-300 font-medium">تعیین جنسیت *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                          gender === 'male' ? 'bg-blue-600/30 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>👨 آقا</span>
                        {gender === 'male' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                          gender === 'female' ? 'bg-pink-600/30 border-pink-500 text-pink-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>👩 خانم</span>
                        {gender === 'female' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Destination Country Cards */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>انتخاب کشور مقصد کاریابی *</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {DESTINATION_COUNTRIES.map((c) => {
                        const isSelected = targetCountry === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setTargetCountry(c.id)}
                            className={`p-3 rounded-xl border text-right transition ${
                              isSelected ? 'bg-red-600/25 border-red-500 text-white font-bold ring-1 ring-red-500/40' : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="flex items-center gap-2 text-sm font-extrabold">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-red-400 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">{c.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                    >
                      <span>مرحله بعد: محل سکونت در ایران</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: محل سکونت مختص ایران */}
              {regStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    بخش دوم: دریافت آدرس دقیق محل سکونت مختص ایران
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">استان محل سکونت در ایران *</label>
                      <select
                        value={iranProvince}
                        onChange={(e) => {
                          const newProv = e.target.value;
                          setIranProvince(newProv);
                          const cities = IRAN_CITIES_BY_PROVINCE[newProv] || [];
                          if (cities.length > 0) {
                            setIranCity(cities[0]);
                          }
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-red-500"
                      >
                        {IRAN_PROVINCES.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">شهرستان / شهر محل سکونت *</label>
                      <select
                        value={iranCity}
                        onChange={(e) => setIranCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-red-500 font-bold"
                      >
                        {(IRAN_CITIES_BY_PROVINCE[iranProvince] || ['تهران']).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-medium">آدرس دقیق پستی و محل سکونت در ایران *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="مثال: خیابان شریعتی، بالاتر از سیدخندان، پلاک ۱۲۴، واحد ۳"
                      value={iranAddress}
                      onChange={(e) => setIranAddress(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 leading-relaxed"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>مرحله قبل</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-700/30 transition flex items-center gap-2"
                    >
                      <span>مرحله بعد: مدارک و مهارت‌ها</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: بارگذاری مدارک + مهارت‌ها و شغل درخواستی */}
              {regStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    بخش سوم: بارگذاری مدارک پرسنلی + مهارت‌ها و شغل درخواستی (دارای دو قسمت مجزا)
                  </p>

                  {/* 1. DOCUMENT UPLOADS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-red-500" />
                      <span>قسمت اول: بارگذاری مدارک هویتی</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Full body photo with strict notice */}
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-white block mb-0.5">عکس تمام قد ایستاده</span>
                          <div className="p-2 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[10px] text-amber-200 space-y-0.5">
                            <strong className="block text-amber-300 font-bold">راهنمای عکس تمام قد:</strong>
                            <div>• خانم‌ها بدون آرایش</div>
                            <div>• آقایان بدون ریش بلند (حداکثر ته‌ریش)</div>
                            <div>• تمام قد، واضح، بدون فیلتر با لباس مرتب</div>
                          </div>
                        </div>

                        {fullBodyPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-700 h-28 bg-slate-900">
                            <img src={fullBodyPhotoUrl} alt="عکس قدی" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFullBodyPhotoUrl('')}
                              className="absolute top-1 left-1 p-1 bg-red-600 text-white rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60">
                            <Upload className="w-5 h-5 text-slate-500 mb-1" />
                            <span className="text-[11px] font-bold text-slate-300">انتخاب عکس تمام قد</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setFullBodyPhotoUrl)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* Passport/ID photo */}
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-white block mb-0.5">عکس پاسپورت یا کارت ملی</span>
                          <p className="text-[10px] text-slate-400">تصویر واضح از صفحه اول پاسپورت یا کارت ملی</p>
                        </div>

                        {passportPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-700 h-28 bg-slate-900">
                            <img src={passportPhotoUrl} alt="عکس پاسپورت" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPassportPhotoUrl('')}
                              className="absolute top-1 left-1 p-1 bg-red-600 text-white rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60">
                            <IdCard className="w-5 h-5 text-slate-500 mb-1" />
                            <span className="text-[11px] font-bold text-slate-300">انتخاب عکس پاسپورت/کارت ملی</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPassportPhotoUrl)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. TWO-PART SKILLS & REQUESTED JOB */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        قسمت دوم: مهارت‌ها و شغل درخواستی (دو بخش مجزا)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        بخش اول: انتخاب از منوی تمامی شغل‌های رایج با تیک‌گذاری | بخش دوم: نوشتن دستی توسط شما
                      </p>
                    </div>

                    {/* Part 1: Expandable Menu */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-[10px] font-mono">
                            ۱
                          </span>
                          <span>بخش اول: منوی شغل‌های رایج (قابل تیک‌گذاری از جزء تا کل)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsJobsMenuOpen(!isJobsMenuOpen)}
                          className="px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <span>{isJobsMenuOpen ? 'بستن منو' : 'باز کردن منوی شغل‌ها'}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono">
                            {selectedCommonJobs.length} انتخاب شده
                          </span>
                          {isJobsMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {selectedCommonJobs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                          {selectedCommonJobs.map((title) => (
                            <span key={title} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-600/25 text-red-200 border border-red-500/30 text-[11px]">
                              <Check className="w-3 h-3 text-red-400" />
                              <span>{title}</span>
                              <button type="button" onClick={() => toggleCommonJob(title)} className="text-red-400 hover:text-white mr-1">×</button>
                            </span>
                          ))}
                        </div>
                      )}

                      {isJobsMenuOpen && (
                        <div className="p-3 bg-slate-900 border border-slate-700/80 rounded-2xl space-y-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                            <input
                              type="text"
                              placeholder="جستجوی سریع میان شغل‌ها (آشپز، چرخکار، برقکار، باریستا، آرایشگر)..."
                              value={jobSearchTerm}
                              onChange={(e) => setJobSearchTerm(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-8 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                            {JOB_CATEGORIES_DATA.map((cat) => (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => setActiveCategoryKey(cat.key)}
                                className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition shrink-0 ${
                                  activeCategoryKey === cat.key ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                            {JOB_CATEGORIES_DATA.find((c) => c.key === activeCategoryKey)?.subcategories
                              .filter((sub) => (jobSearchTerm ? sub.toLowerCase().includes(jobSearchTerm.toLowerCase()) : true))
                              .map((jobTitle) => {
                                const isChecked = selectedCommonJobs.includes(jobTitle);
                                return (
                                  <label
                                    key={jobTitle}
                                    className={`p-2 rounded-xl border cursor-pointer text-xs flex items-center justify-between gap-2 transition ${
                                      isChecked ? 'bg-red-600/20 border-red-500 text-white font-bold' : 'bg-slate-800/70 border-slate-700 text-slate-300'
                                    }`}
                                  >
                                    <span>{jobTitle}</span>
                                    <input type="checkbox" checked={isChecked} onChange={() => toggleCommonJob(jobTitle)} className="accent-red-600" />
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part 2: Manual Text Input */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-mono">
                          ۲
                        </span>
                        <span>بخش دوم: نوشتن توسط ثبت‌نام‌کننده (شغل درخواستی و سوابق)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="اگر سوابق یا شغل خاصی مد نظرتان است در اینجا بنویسید (مثلاً: ۵ سال سابقه کباب‌زنی، آشنایی با ترکی)..."
                        value={customWrittenSkills}
                        onChange={(e) => setCustomWrittenSkills(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>مرحله قبل</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-700/30 transition flex items-center gap-2"
                    >
                      <span>مرحله بعد: تعهدنامه و امضا</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: تعهدنامه حقوقی تسویه حساب کارگزار + امضای دیجیتال */}
              {regStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    بخش چهارم: مطالعه، تایید و امضای تعهدنامه حقوقی تسویه حساب کارگزار
                  </p>

                  <div className="p-4 bg-slate-950 border-2 border-red-500/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>تعهدنامه تسویه حساب هزینه کارگزار</span>
                      </h4>
                      <span className="text-[10px] bg-red-600/20 text-red-300 px-2 py-0.5 rounded-full font-bold">
                        الزامی حقوقی
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      این سند به منزله تسویه حساب کامل هزینه خدمات کارگزار، مشاوره و معرفی به کارفرما می‌باشد. جهت مشاهده متن کامل با فونت درشت، مشخصات متقاضی و رسم امضا کلیک نمایید.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsCommitmentModalOpen(true)}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>مشاهده و امضای الکترونیکی تعهدنامه تسویه حساب کارگزار</span>
                    </button>

                    {signatureDataUrl && (
                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>امضای دیجیتال شما با موفقیت به تعهدنامه پیوست گردید ✓</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="accent-red-600 rounded w-4 h-4"
                      />
                      <span>قوانین، ضوابط کاریابی و مفاد تعهدنامه فوق را می‌پذیرم.</span>
                    </label>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>مرحله قبل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRegisterFinalSubmit()}
                      className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>تکمیل ثبت‌نام و ارجاع پرونده به مدیر</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: LOGIN FORM */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1 pb-2 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white">ورود به سامانه کارباما</h2>
                <p className="text-xs text-slate-400">
                  لطفاً نام کاربری و رمز عبور خود را وارد نمایید
                </p>
              </div>

              {/* Role Selector */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginRole('seeker')}
                  className={`py-2 rounded-lg transition ${
                    loginRole === 'seeker' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  کارجو
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('partner')}
                  className={`py-2 rounded-lg transition ${
                    loginRole === 'partner' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  همکار
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('admin')}
                  className={`py-2 rounded-lg transition ${
                    loginRole === 'admin' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مدیریت
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs">
                  {loginError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">نام کاربری (Username)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="نام کاربری..."
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">رمز عبور (Password)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      placeholder="رمز عبور..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-9 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute left-2.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به حساب کاربری</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
                >
                  حساب ندارید؟ ثبت‌نام کارجو
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* COMMITMENT MODAL POPUP */}
      <CommitmentModal
        isOpen={isCommitmentModalOpen}
        onClose={() => setIsCommitmentModalOpen(false)}
        fullName={`${firstName} ${lastName}`.trim()}
        fatherName={fatherName}
        nationalId={nationalId}
        phone={formattedPhone}
        iranProvince={iranProvince}
        iranCity={iranCity}
        iranAddress={iranAddress}
        targetCountry={targetCountry}
        payerCardNumber={payerCardNumber}
        passportPhotoUrl={passportPhotoUrl}
        fullBodyPhotoUrl={fullBodyPhotoUrl}
        nationalCardPhotoUrl={nationalCardPhotoUrl}
        signatureDataUrl={signatureDataUrl}
        onSaveSignature={(sigUrl) => setSignatureDataUrl(sigUrl)}
        onAcceptAndSubmit={() => {
          setIsCommitmentModalOpen(false);
          handleRegisterFinalSubmit();
        }}
      />
    </div>
  );
};
