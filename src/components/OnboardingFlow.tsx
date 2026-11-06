import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppLanguage, TargetCountry, Gender, JobSeeker } from '../types';
import { t } from '../utils/translations';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { IRAN_PROVINCES, IRAN_CITIES_BY_PROVINCE } from '../data/iranCities';
import { CITY_DISTRICTS_MAP, getDistrictsForCity } from '../data/turkeyData';
import { checkPasswordStrength, isValidEmail } from '../utils/validators';
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
  Mail,
  Award,
  CheckCircle2,
} from 'lucide-react';

const DESTINATION_COUNTRIES: { id: TargetCountry; nameKey: string; flag: string; descKey: string }[] = [
  { id: 'ترکیه', nameKey: 'countryTurkeyName', flag: '🇹🇷', descKey: 'countryTurkeyDesc' },
  { id: 'ارمنستان', nameKey: 'countryArmeniaName', flag: '🇦🇲', descKey: 'countryArmeniaDesc' },
  { id: 'عراق', nameKey: 'countryIraqName', flag: '🇮🇶', descKey: 'countryIraqDesc' },
  { id: 'آلمان', nameKey: 'countryGermanyName', flag: '🇩🇪', descKey: 'countryGermanyDesc' },
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
    recoverPassword,
    showToast,
    brokerSettings,
  } = useApp();

  // Mode: 'language' | 'register' | 'login'
  const [viewMode, setViewMode] = useState<'language' | 'register' | 'login'>('language');

  // 5-step wizard step (1: Info, 2: Destination & Address, 3: Docs & Skills, 4: Commitment & Signature, 5: Official Dossier Issued)
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [registeredSeeker, setRegisteredSeeker] = useState<JobSeeker | null>(null);

  // STEP 1: مشخصات فردی، اکانت، کارت واریزکننده و کشور مقصد
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+98');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [payerCardNumber, setPayerCardNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<Gender>('male');
  const [targetCountry, setTargetCountry] = useState<TargetCountry>('ترکیه');
  const [targetCity, setTargetCity] = useState('استانبول');
  const [targetDistrict, setTargetDistrict] = useState('فاتیح (Fatih)');

  // STEP 2: محل سکونت در ایران
  const [iranProvince, setIranProvince] = useState('تهران');
  const [iranCity, setIranCity] = useState('تهران');
  const [iranAddress, setIranAddress] = useState('');

  // STEP 3: عکس‌ها و دو بخش مهارت‌ها
  const [fullBodyPhotoUrl, setFullBodyPhotoUrl] = useState('');
  const [passportPhotoUrl, setPassportPhotoUrl] = useState('');
  const [nationalCardPhotoUrl, setNationalCardPhotoUrl] = useState('');
  const fullBodyInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const nationalCardInputRef = useRef<HTMLInputElement>(null);
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

  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [recoverInput, setRecoverInput] = useState('');
  const [recoverResult, setRecoverResult] = useState<{ success: boolean; message: string } | null>(null);

  const passCheck = checkPasswordStrength(password);

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
      showToast('لطفاً مشخصات فردی (نام، نام خانوادگی، نام پدر، کد ملی یا شماره پاسپورت) را تکمیل فرمایید.', 'error');
      return false;
    }
    if (nationalId.replace(/\s/g, '').length < 6) {
      showToast('کد ملی یا شماره پاسپورت باید حداقل ۶ کاراکتر باشد.', 'error');
      return false;
    }
    if (!phoneNumber.trim()) {
      showToast('لطفاً شماره تلفن/واتساپ را وارد فرمایید.', 'error');
      return false;
    }
    if (!email.trim() || !isValidEmail(email)) {
      showToast('لطفاً آدرس ایمیل معتبر (جهت بازیابی رمز عبور) وارد فرمایید.', 'error');
      return false;
    }
    if (!payerCardNumber.trim() || payerCardNumber.replace(/\D/g, '').length < 16) {
      showToast('لطفاً شماره کارت ۱۶ رقمی واریزکننده (مشتری) را وارد فرمایید.', 'error');
      return false;
    }
    if (!username.trim() || username.trim().length < 3) {
      showToast('نام کاربری باید حداقل ۳ کاراکتر باشد.', 'error');
      return false;
    }
    if (!passCheck.isValid) {
      showToast(passCheck.error || 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و اعداد انگلیسی باشد.', 'error');
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
    if (!fullBodyPhotoUrl) {
      showToast('بارگذاری عکس تمام قد / پرسنلی الزامی است.', 'error');
      return false;
    }
    if (!passportPhotoUrl) {
      showToast('بارگذاری عکس پاسپورت الزامی است (چهار گوشه پاسپورت باید کاملاً مشخص باشد).', 'error');
      return false;
    }
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
      email: email.trim(),
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
      targetCity: targetCity || 'استانبول',
      targetDistrict: targetDistrict || undefined,
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
      setRegisteredSeeker(res.seeker || null);
      setRegStep(5);
      showToast('🎉 ثبت‌نام با موفقیت انجام شد و پرونده رسمی کارجو صادر گردید.', 'success');
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
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative h-[88vh] min-h-[560px] max-h-[720px] flex flex-col">
        {/* Top bar */}
        <div style={{ background: 'var(--primary-topbar)' }} className="h-1.5 w-full shrink-0" />

        {/* Top Header Mode Indicator */}
        <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between text-xs border-b border-slate-800/80 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/logo.png"
              alt="کارباما"
              className="w-8 h-8 rounded-full object-cover border border-amber-400/80 shadow-sm"
            />
            <div>
              <span className="font-black text-xs sm:text-sm text-white">کارباما | KARBAMA</span>
              <p className="text-[10px] text-slate-400">{t('appOfficialTag', appLanguage)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode('language')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'language' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('selectLanguage', appLanguage)}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('register')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'register' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('register', appLanguage)}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'login' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('login', appLanguage)}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-7">
          {/* SCREEN 1: WELCOME & LANGUAGE SELECTION */}
          {viewMode === 'language' && (
            <div className="min-h-full flex flex-col justify-between py-1 text-center">
              <div className="space-y-4">
                <div className="relative inline-block mx-auto">
                  <img
                    src="/logo.png"
                    alt="کارباما"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-2xl ring-4 ring-amber-500/20"
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {currentLangObj.welcome}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    {currentLangObj.desc}
                  </p>
                </div>

                {/* Language Selection Grid */}
                <div className="space-y-2 pt-1 text-right">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-red-400" />
                    {t('selectLanguagePrompt', appLanguage)}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {languages.map((l) => {
                      const isSelected = appLanguage === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => setAppLanguage(l.code)}
                          className={`p-3 rounded-2xl border text-right transition flex items-center justify-between gap-2 sm:gap-3 ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-lg scale-[1.02]'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl">{l.flag}</span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold">{l.label}</p>
                              <p className="text-[10px] text-slate-400">{l.nativeName}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  className="w-full py-3 sm:py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-700/30 transition flex items-center justify-center gap-2 group"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t('startSeekerRegBtn', appLanguage)}</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full sm:w-auto py-3 sm:py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 shrink-0"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>{t('existingAccountLoginBtn', appLanguage)}</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: 4-STEP REGISTRATION WIZARD */}
          {viewMode === 'register' && (
            <div className="space-y-5 pb-4">
              {/* Wizard Steps Progress Indicator */}
              <div className="sticky -top-5 sm:-top-7 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-1">
                <div className="flex items-center justify-between text-xs mb-2 font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {regStep === 5
                        ? 'مرحله نهایی: صدور پرونده رسمی کارجو'
                        : `${t('regStepOfFour', appLanguage)} ${regStep} ${t('regStepOfFourSuffix', appLanguage)}`}
                    </span>
                  </span>
                  <span className="text-amber-400">
                    {regStep === 1 && t('regStep1Title', appLanguage)}
                    {regStep === 2 && t('regStep2Title', appLanguage)}
                    {regStep === 3 && t('regStep3Title', appLanguage)}
                    {regStep === 4 && t('regStep4Title', appLanguage)}
                    {regStep === 5 && 'تاییدیه و پرونده صادر شده ✓'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] text-center font-bold">
                  <div className={`py-1.5 rounded-lg transition ${regStep === 1 ? 'bg-red-600 text-white' : regStep > 1 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    {t('step1Short', appLanguage)}
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 2 ? 'bg-red-600 text-white' : regStep > 2 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    {t('step2Short', appLanguage)}
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 3 ? 'bg-red-600 text-white' : regStep > 3 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    {t('step3Short', appLanguage)}
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 4 ? 'bg-red-600 text-white' : regStep > 4 ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-500'}`}>
                    {t('step4Short', appLanguage)}
                  </div>
                  <div className={`py-1.5 rounded-lg transition ${regStep === 5 ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
                    ۵. پرونده رسمی
                  </div>
                </div>
              </div>

              {/* STEP 1: مشخصات هویتی + شماره کارت واریزکننده + تعیین کشور مقصد */}
              {regStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    {t('step1SectionHeader', appLanguage)}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('firstNameInputLabel', appLanguage)}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('firstNamePlaceholderText', appLanguage)}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('lastNameInputLabel', appLanguage)}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('lastNamePlaceholderText', appLanguage)}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('fatherNameInputLabel', appLanguage)}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('fatherNamePlaceholderText', appLanguage)}
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('nationalIdInputLabel', appLanguage)}</label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        placeholder={t('nationalIdPlaceholderText', appLanguage)}
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value.trim())}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('mobileWhatsAppInputLabel', appLanguage)}</label>
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
                      <label className="text-slate-300 font-medium text-amber-300">{t('payerCardNumberInputLabel', appLanguage)}</label>
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

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-slate-300 font-medium flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>آدرس ایمیل معتبر (جهت بازیابی رمز عبور) *</span>
                      </label>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('usernameInputLabel', appLanguage)}</label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        placeholder={t('usernamePlaceholderText', appLanguage)}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('passwordInputLabel', appLanguage)}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          dir="ltr"
                          placeholder="Abc12345"
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
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                        <span className={passCheck.hasMinLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {passCheck.hasMinLength ? '✓' : '○'} حداقل ۸ کاراکتر
                        </span>
                        <span className={passCheck.hasUppercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {passCheck.hasUppercase ? '✓' : '○'} حروف بزرگ (A-Z)
                        </span>
                        <span className={passCheck.hasLowercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {passCheck.hasLowercase ? '✓' : '○'} حروف کوچک (a-z)
                        </span>
                        <span className={passCheck.hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {passCheck.hasNumber ? '✓' : '○'} شامل عدد (0-9)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div className="text-xs space-y-1 pt-1">
                    <label className="text-slate-300 font-medium">{t('genderSelectorLabel', appLanguage)}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                          gender === 'male' ? 'bg-blue-600/30 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{t('genderMaleText', appLanguage)}</span>
                        {gender === 'male' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                          gender === 'female' ? 'bg-pink-600/30 border-pink-500 text-pink-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{t('genderFemaleText', appLanguage)}</span>
                        {gender === 'female' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Destination Country Cards */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>{t('destinationCountryLabel', appLanguage)}</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {DESTINATION_COUNTRIES.map((c) => {
                        const isSelected = targetCountry === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setTargetCountry(c.id);
                              if (c.id === 'ترکیه') {
                                setTargetCity('استانبول');
                                setTargetDistrict('فاتیح (Fatih)');
                              }
                            }}
                            className={`p-3 rounded-xl border text-right transition ${
                              isSelected ? 'bg-red-600/25 border-red-500 text-white font-bold ring-1 ring-red-500/40' : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="flex items-center gap-2 text-sm font-extrabold">
                                <span>{c.flag}</span>
                                <span>{t(c.nameKey, appLanguage)}</span>
                              </span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-red-400 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">{t(c.descKey, appLanguage)}</p>
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
                      <span>{t('nextStepAddressBtn', appLanguage)}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: محل سکونت مختص ایران */}
              {regStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    {t('step2SectionHeader', appLanguage)}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('provinceInputLabel', appLanguage)}</label>
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
                      <label className="text-slate-300 font-medium">{t('cityInputLabel', appLanguage)}</label>
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
                    <label className="text-slate-300 font-medium">{t('addressInputLabel', appLanguage)}</label>
                    <textarea
                      rows={3}
                      required
                      placeholder={t('addressPlaceholderText', appLanguage)}
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
                      <span>{t('prevStepBtnText', appLanguage)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-700/30 transition flex items-center gap-2"
                    >
                      <span>{t('nextStepDocsBtn', appLanguage)}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: بارگذاری مدارک + مهارت‌ها و شغل درخواستی */}
              {regStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    {t('step3SectionHeader', appLanguage)}
                  </p>

                  {/* 1. DOCUMENT UPLOADS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-red-500" />
                      <span>{t('part1DocsTitle', appLanguage)}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* 1. Full Body / Personal Photo (REQUIRED) */}
                      <div className="p-3.5 bg-slate-950 border-2 border-red-500/40 rounded-2xl space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-white text-xs">عکس تمام قد / پرسنلی</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-300 text-[10px] font-black">
                              الزامی *
                            </span>
                          </div>
                          <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[10px] text-amber-200 space-y-0.5">
                            <strong className="block text-amber-300 font-bold">{t('fullBodyGuideTitle', appLanguage)}</strong>
                            <div>{t('fullBodyRule1', appLanguage)}</div>
                            <div>{t('fullBodyRule2', appLanguage)}</div>
                          </div>
                        </div>

                        {fullBodyPhotoUrl ? (
                          <div className="space-y-1.5">
                            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/60 h-32 bg-slate-900 shadow-md">
                              <img src={fullBodyPhotoUrl} alt="عکس تمام قد" className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] rounded font-bold">
                                بارگذاری شد ✓
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFullBodyPhotoUrl('');
                                if (fullBodyInputRef.current) fullBodyInputRef.current.value = '';
                              }}
                              className="w-full py-1.5 bg-slate-800 hover:bg-red-950/60 text-red-400 hover:text-red-300 rounded-lg text-[10.5px] font-bold border border-slate-700 transition flex items-center justify-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>حذف و انتخاب مجدد</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => fullBodyInputRef.current?.click()}
                              className="w-full border-2 border-dashed border-red-500/50 hover:border-red-400 hover:bg-red-950/20 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/80 gap-1"
                            >
                              <Camera className="w-6 h-6 text-red-400 mb-0.5" />
                              <span className="text-[11px] font-black text-white">انتخاب عکس یا دوربین</span>
                              <span className="text-[9.5px] text-slate-400">فرمت‌های JPG و PNG (حداکثر ۱۰ مگابایت)</span>
                            </button>
                            <input
                              ref={fullBodyInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setFullBodyPhotoUrl)}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>

                      {/* 2. Passport Photo (MANDATORY - WITH FOUR CORNERS VISIBLE) */}
                      <div className="p-3.5 bg-slate-950 border-2 border-amber-500/40 rounded-2xl space-y-2.5 flex flex-col justify-between relative">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-white text-xs flex items-center gap-1">
                              <span>عکس صفحه اول پاسپورت</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-300 text-[10px] font-black">
                              الزامی * (چهارگوش مشخص)
                            </span>
                          </div>
                          <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[10px] text-amber-200 space-y-0.5">
                            <strong className="block text-amber-300 font-bold">شرط الزامی: چهارگوش پاسپورت مشخص باشد:</strong>
                            <div>• هر ۴ گوشه برگه پاسپورت باید کاملاً داخل کادر دیده شوند</div>
                            <div>• بدون بریدگی لبه‌ها، عکس پرسنلی یا کدهای پایینی پاسپورت</div>
                            <div>• بدون انعکاس نور فلاش، روی سطحی کاملاً صاف و خوانا</div>
                          </div>
                        </div>

                        {passportPhotoUrl ? (
                          <div className="space-y-1.5">
                            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/80 h-32 bg-slate-900 shadow-md group">
                              <img src={passportPhotoUrl} alt="پاسپورت با چهارگوش مشخص" className="w-full h-full object-cover" />
                              {/* 4 Corner Markers */}
                              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400 rounded-tr pointer-events-none" />
                              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400 rounded-tl pointer-events-none" />
                              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400 rounded-br pointer-events-none" />
                              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400 rounded-bl pointer-events-none" />

                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] rounded font-bold shadow-sm flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                چهارگوشه پاسپورت تایید شد ✓
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPassportPhotoUrl('');
                                if (passportInputRef.current) passportInputRef.current.value = '';
                              }}
                              className="w-full py-1.5 bg-slate-800 hover:bg-red-950/60 text-red-400 hover:text-red-300 rounded-lg text-[10.5px] font-bold border border-slate-700 transition flex items-center justify-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>حذف و انتخاب مجدد</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => passportInputRef.current?.click()}
                              className="relative w-full border-2 border-dashed border-amber-500/60 hover:border-amber-400 hover:bg-amber-950/20 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/80 gap-1 group"
                            >
                              {/* Corner Guides */}
                              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/80 rounded-tr pointer-events-none" />
                              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none" />
                              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none" />
                              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/80 rounded-bl pointer-events-none" />

                              <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 mb-0.5 transition-transform" />
                              <span className="text-[11px] font-black text-white">انتخاب عکس پاسپورت (۴ گوشه مشخص)</span>
                              <span className="text-[9.5px] text-amber-300/80">تصویر صفحه اول پاسپورت با کادربندی کامل</span>
                            </button>
                            <input
                              ref={passportInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setPassportPhotoUrl)}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. TWO-PART SKILLS & REQUESTED JOB */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        {t('part2SkillsTitle', appLanguage)}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t('part2SkillsSubtitle', appLanguage)}
                      </p>
                    </div>

                    {/* Part 1: Expandable Menu */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-[10px] font-mono">
                            ۱
                          </span>
                          <span>{t('commonJobsSectionTitle', appLanguage)}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsJobsMenuOpen(!isJobsMenuOpen)}
                          className="px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <span>{isJobsMenuOpen ? t('closeJobsMenuBtn', appLanguage) : t('openJobsMenuBtn', appLanguage)}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono">
                            {selectedCommonJobs.length} {t('selectedCountText', appLanguage)}
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
                              placeholder={t('jobSearchInputPlaceholder', appLanguage)}
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
                        <span>{t('manualSkillsSectionTitle', appLanguage)}</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder={t('manualSkillsPlaceholderText', appLanguage)}
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
                      <span>{t('prevStepBtnText', appLanguage)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-700/30 transition flex items-center gap-2"
                    >
                      <span>{t('nextStepCommitmentBtn', appLanguage)}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: تعهدنامه حقوقی تسویه حساب کارگزار + امضای دیجیتال */}
              {regStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
                    {t('step4SectionHeader', appLanguage)}
                  </p>

                  <div className="p-4 bg-slate-950 border-2 border-red-500/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>{t('commitmentCardTitle', appLanguage)}</span>
                      </h4>
                      <span className="text-[10px] bg-red-600/20 text-red-300 px-2 py-0.5 rounded-full font-bold">
                        {t('legalRequiredBadgeText', appLanguage)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {t('commitmentCardDescText', appLanguage)}
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsCommitmentModalOpen(true)}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('openCommitmentModalBtn', appLanguage)}</span>
                    </button>

                    {signatureDataUrl && (
                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{t('signatureSuccessText', appLanguage)}</span>
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
                      <span>{t('acceptTermsCheckboxLabel', appLanguage)}</span>
                    </label>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>{t('prevStepBtnText', appLanguage)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRegisterFinalSubmit()}
                      className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('completeRegistrationBtn', appLanguage)}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: تاییدیه نهایی و پرونده رسمی کارجو */}
              {regStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200 py-2">
                  {/* Top Success Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/80 rounded-3xl p-5 sm:p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/40">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-white">
                      🎉 پرونده رسمی کارجو با موفقیت صادر گردید!
                    </h2>
                    <p className="text-xs text-emerald-300 font-semibold mt-1.5 max-w-lg mx-auto leading-relaxed">
                      حساب کاربری شما فعال شد و تمامی مدارک (پاسپورت با ۴ گوشه مشخص، عکس پرسنلی و امضای دیجیتال رسمی) در پرونده مرکزی کارباما ثبت و ذخیره گردید.
                    </p>

                    <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-full text-xs text-emerald-200 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>کد پرونده الکترونیک: <strong className="font-mono text-white text-sm" dir="ltr">{registeredSeeker?.id || `KB-${Date.now().toString().slice(-6)}`}</strong></span>
                    </div>
                  </div>

                  {/* کارت پرونده جامع الکترونیک کارجو */}
                  <div className="bg-slate-950 border-2 border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/logo.png"
                          alt="کارباما"
                          className="w-10 h-10 rounded-full border border-amber-400 shadow-md object-cover"
                        />
                        <div>
                          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                            <span>کارت پرونده رسمی کارجو</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                              معتبر و تایید شده
                            </span>
                          </h3>
                          <p className="text-[10px] text-slate-400">سامانه کاریابی و اعزام نیروی کار کارباما</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Photos Grid (Passport & Full-Body) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full-Body Photo */}
                      <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span>عکس پرسنلی تمام قد</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            تایید شده ✓
                          </span>
                        </div>
                        <div className="h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                          {fullBodyPhotoUrl ? (
                            <img
                              src={fullBodyPhotoUrl}
                              alt="عکس تمام قد کارجو"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-slate-500">تصویر ثبت شده</div>
                          )}
                        </div>
                      </div>

                      {/* Passport Photo */}
                      <div className="bg-slate-900 p-2.5 rounded-2xl border border-emerald-500/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>عکس پاسپورت (۴ گوشه مشخص)</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            چهارگوشه احراز شد ✓
                          </span>
                        </div>
                        <div className="relative h-40 rounded-xl overflow-hidden bg-slate-950 border border-emerald-500/30 flex items-center justify-center">
                          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400 rounded-tr pointer-events-none z-10" />
                          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400 rounded-tl pointer-events-none z-10" />
                          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400 rounded-br pointer-events-none z-10" />
                          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400 rounded-bl pointer-events-none z-10" />

                          {passportPhotoUrl ? (
                            <img
                              src={passportPhotoUrl}
                              alt="عکس پاسپورت با چهارگوش مشخص"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-slate-500">تصویر پاسپورت</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Identity Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">نام و نام خانوادگی:</span>
                        <strong className="text-white text-xs sm:text-sm font-black">{firstName} {lastName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">نام پدر:</span>
                        <strong className="text-white">{fatherName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">کد ملی / پاسپورت:</span>
                        <strong className="text-amber-300 font-mono" dir="ltr">{nationalId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">شماره تماس:</span>
                        <strong className="text-emerald-300 font-mono" dir="ltr">{phoneCountryCode} {phoneNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">کشور مقصد:</span>
                        <strong className="text-white">{targetCountry} ({targetCity})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">شغل‌های درخواستی:</span>
                        <strong className="text-white truncate block">{selectedCommonJobs.join('، ') || customWrittenSkills || 'عمومی'}</strong>
                      </div>
                    </div>

                    {/* Signature Preview */}
                    {signatureDataUrl && (
                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>امضای الکترونیکی ثبت شده متقاضی</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            دارای اعتبار حقوقی
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex justify-center">
                          <img
                            src={signatureDataUrl}
                            alt="امضای رسمی متقاضی"
                            className="max-h-20 w-auto object-contain filter drop-shadow-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions to enter Karbama or view contract */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCommitmentModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>مشاهده و چاپ تعهدنامه حقوقی با امضا</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasCompletedOnboarding(true)}
                      className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>ورود به سامانه کارباما و مشاهده آگهی‌های شغلی</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: LOGIN FORM */}
          {viewMode === 'login' && (
            <div className="min-h-full flex flex-col justify-center py-2 animate-in fade-in duration-150">
              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md w-full mx-auto">
                <div className="text-center space-y-1 pb-2 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t('loginModalHeadline', appLanguage)}</h2>
                  <p className="text-xs text-slate-400">
                    {t('loginModalSubtitle', appLanguage)}
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
                    {t('jobseekerRole', appLanguage)}
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
                    {t('adminRole', appLanguage)}
                  </button>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs">
                    {loginError}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">{t('loginUsernameInputLabel', appLanguage)}</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <input
                        type="text"
                        required
                        dir="ltr"
                        placeholder={t('loginUsernamePlaceholderText', appLanguage)}
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-medium">{t('loginPasswordInputLabel', appLanguage)}</label>
                      {loginRole === 'seeker' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPasswordModal(true);
                            setRecoverResult(null);
                            setRecoverInput('');
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          فراموشی رمز عبور؟
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        placeholder={t('loginPasswordPlaceholderText', appLanguage)}
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
                    <span>{t('loginSubmitBtnText', appLanguage)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('register')}
                    className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
                  >
                    {t('noAccountRegBtnText', appLanguage)}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <KeyRound className="w-5 h-5" />
                <span>بازیابی رمز عبور کارباما</span>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              جهت بازیابی رمز عبور، آدرس ایمیل ثبت‌شده هنگام ثبت‌نام یا نام کاربری خود را وارد نمایید.
            </p>

            {recoverResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  recoverResult.success
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
                }`}
              >
                {recoverResult.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ایمیل یا نام کاربری (یوزرنیم)
              </label>
              <input
                type="text"
                dir="ltr"
                value={recoverInput}
                onChange={(e) => setRecoverInput(e.target.value)}
                placeholder="example@gmail.com / username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!recoverInput.trim()) return;
                  const res = recoverPassword(recoverInput);
                  setRecoverResult({
                    success: res.success,
                    message: res.message || res.error || '',
                  });
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-700/30"
              >
                ارسال لینک / بازیابی رمز
              </button>
            </div>
          </div>
        </div>
      )}

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
