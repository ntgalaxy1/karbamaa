import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppLanguage, TargetCountry, Gender, JobSeeker } from '../types';
import { t } from '../utils/translations';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { IRAN_PROVINCES, IRAN_CITIES_BY_PROVINCE } from '../data/iranCities';
import { CITY_DISTRICTS_MAP, getDistrictsForCity } from '../data/turkeyData';
import {
  checkPasswordStrength,
  isValidEmail,
  validateEmail,
  validatePhoneNumber,
  validateIranianBankCard,
  validateIranianNationalId,
} from '../utils/validators';
import {
  toEnglishDigits,
  sanitizeNumericOnly,
  sanitizeCardNumber,
} from '../utils/inputUtils';
import { CommitmentModal } from './CommitmentModal';
import { KARBAMA_LOGO_DATA_URI } from '../utils/brandAssets';
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
  UserPlus,
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
  Loader2,
  Sun,
  Moon,
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
    registerPartner,
    partnerPlans,
    checkDuplicateSeekerField,
    loginSeeker,
    loginPartner,
    recoverPassword,
    showToast,
    brokerSettings,
    theme,
    toggleTheme,
  } = useApp();

  // Mode: 'language' | 'register' | 'login'
  const [viewMode, setViewMode] = useState<'language' | 'register' | 'login'>('language');
  // Independent registration type: 'seeker' (کارجو) vs 'partner' (همکار)
  const [regAccountType, setRegAccountType] = useState<'seeker' | 'partner'>('seeker');

  // Partner Registration Form State
  const [partnerCompanyName, setPartnerCompanyName] = useState('');
  const [partnerFullName, setPartnerFullName] = useState('');
  const [partnerNationalId, setPartnerNationalId] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerCardNumber, setPartnerCardNumber] = useState('');
  const [partnerCity, setPartnerCity] = useState('استانبول');
  const [partnerUsername, setPartnerUsername] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [showPartnerPassword, setShowPartnerPassword] = useState(false);
  const [partnerPlanId, setPartnerPlanId] = useState<'1_month' | '3_months' | '6_months' | '1_year'>('1_month');
  const [partnerRegError, setPartnerRegError] = useState<string | null>(null);

  // Duplicate field validation errors
  const [duplicateErrors, setDuplicateErrors] = useState<{
    email?: string;
    phoneNumber?: string;
    nationalId?: string;
    payerCardNumber?: string;
  }>({});

  const checkFieldDuplicate = (
    field: 'email' | 'phoneNumber' | 'nationalId' | 'payerCardNumber',
    val: string
  ) => {
    const res = checkDuplicateSeekerField(field, val);
    setDuplicateErrors((prev) => ({
      ...prev,
      [field]: res.isDuplicate ? res.message : undefined,
    }));
    return res;
  };

  const changeAppLanguage = (code: AppLanguage) => {
    setAppLanguage(code);
    document.documentElement.lang = code;
    document.documentElement.dir = (code === 'en' || code === 'tr') ? 'ltr' : 'rtl';
  };

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
  const [inquiredPayerBank, setInquiredPayerBank] = useState<string | null>(null);
  const [isInquiringPayerBank, setIsInquiringPayerBank] = useState(false);

  const inquireSepalBank = async (rawCard: string) => {
    if (rawCard.length !== 16) {
      setInquiredPayerBank(null);
      return;
    }
    setIsInquiringPayerBank(true);
    try {
      const res = await fetch('/api/sepal/card-to-iban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: rawCard }),
      });
      const data = await res.json();
      if (data.success && data.data?.bankName) {
        setInquiredPayerBank(data.data.bankName);
      }
    } catch {
      // ignore
    } finally {
      setIsInquiringPayerBank(false);
    }
  };
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
  const [loginRole, setLoginRole] = useState<'seeker' | 'partner'>('seeker');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [recoverInput, setRecoverInput] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverResult, setRecoverResult] = useState<{ success: boolean; message: string } | null>(null);

  const passCheck = checkPasswordStrength(password);
  const partnerPassCheck = checkPasswordStrength(partnerPassword);

  // Real-time live validation checks for Job Seeker Registration (Step 1)
  const seekerNatIdLiveCheck = nationalId.trim() ? validateIranianNationalId(nationalId) : null;
  const seekerPhoneLiveCheck = phoneNumber.trim() ? validatePhoneNumber(phoneNumber, phoneCountryCode) : null;
  const seekerEmailLiveCheck = email.trim() ? validateEmail(email) : null;
  const seekerCardLiveCheck = payerCardNumber.trim() ? validateIranianBankCard(payerCardNumber) : null;

  // Real-time live validation checks for Partner Registration
  const partnerNatIdLiveCheck = partnerNationalId.trim() ? validateIranianNationalId(partnerNationalId) : null;
  const partnerPhoneLiveCheck = partnerPhone.trim() ? validatePhoneNumber(partnerPhone, '+98') : null;
  const partnerEmailLiveCheck = partnerEmail.trim() ? validateEmail(partnerEmail) : null;
  const partnerCardLiveCheck = partnerCardNumber.trim() ? validateIranianBankCard(partnerCardNumber) : null;

  const languages: { code: AppLanguage; label: string; nativeName: string; flag: string; welcome: string; desc: string }[] = [
    {
      code: 'fa',
      label: 'فارسی',
      nativeName: 'فارسی',
      flag: '🇮🇷',
      welcome: 'پل ارتباطی مستقیم کارجویان و متخصصان با بهترین کارفرمایان و فرصت‌های شغلی واقعی',
      desc: 'در سامانه رسمی کارباما، پرونده شغلی خود را ثبت کنید و بدون واسطه‌های غیرمعتبر، مستقیماً به صدها فرصت شغلی تاییدشده همراه با جای خواب، وعده غذایی و قرارداد قانونی متصل شوید.',
    },
    {
      code: 'tr',
      label: 'Türkçe',
      nativeName: 'Türkçe',
      flag: '🇹🇷',
      welcome: 'İş Arayanlar ve Uzmanları Doğrudan Güvenilir İşverenlerle Buluşturan Resmi Köprü',
      desc: 'Resmi Karbama sisteminde iş dosyanızı oluşturun; konaklama, yemek ve yasal sözleşmeli yüzlerce onaylı iş fırsatına doğrudan ulaşın.',
    },
    {
      code: 'en',
      label: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      welcome: 'Direct Bridge Connecting Job Seekers & Specialists with Verified Employers & Real Jobs',
      desc: 'Register your official career profile on Karbama and connect directly to hundreds of verified jobs with accommodation, meals, and legal contracts.',
    },
    {
      code: 'ar',
      label: 'العربية',
      nativeName: 'العربية',
      flag: '🇸🇦',
      welcome: 'الجسر المباشر الذي يربط الباحثين عن عمل والمتخصصين بأفضل أصحاب العمل وفرص العمل الحقيقية',
      desc: 'سجّل ملفك المهني في منصة كارباما الرسمية وتواصل مباشرة مع مئات فرص العمل المعتمدة مع السكن والوجبات والعقود القانونية.',
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
    if (!firstName.trim() || !lastName.trim() || !fatherName.trim()) {
      showToast('لطفاً مشخصات فردی (نام، نام خانوادگی و نام پدر) را تکمیل فرمایید.', 'error');
      return false;
    }
    const natCheck = validateIranianNationalId(nationalId);
    if (!natCheck.isValid) {
      showToast(natCheck.error || 'کد ملی ۱۰ رقمی وارد شده معتبر نیست.', 'error');
      return false;
    }
    const phoneCheck = validatePhoneNumber(phoneNumber, phoneCountryCode);
    if (!phoneCheck.isValid) {
      showToast(phoneCheck.error || 'شماره موبایل وارد شده معتبر نیست (باید با 09 شروع شود).', 'error');
      return false;
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      showToast(emailCheck.error || 'لطفاً آدرس ایمیل معتبر وارد فرمایید.', 'error');
      return false;
    }
    const cardCheck = validateIranianBankCard(payerCardNumber);
    if (!cardCheck.isValid) {
      showToast(cardCheck.error || 'شماره کارت ۱۶ رقمی بانکی وارد شده معتبر نیست.', 'error');
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

    // Instant duplicate validation
    const dupNatId = checkFieldDuplicate('nationalId', nationalId);
    if (dupNatId.isDuplicate) {
      showToast(dupNatId.message || 'این کد ملی یا شماره پاسپورت قبلاً در سامانه ثبت شده است.', 'error');
      return false;
    }
    const dupPhone = checkFieldDuplicate('phoneNumber', phoneNumber);
    if (dupPhone.isDuplicate) {
      showToast(dupPhone.message || 'این شماره تلفن قبلاً در سامانه ثبت شده است.', 'error');
      return false;
    }
    const dupCard = checkFieldDuplicate('payerCardNumber', payerCardNumber);
    if (dupCard.isDuplicate) {
      showToast(dupCard.message || 'این شماره کارت بانکی قبلاً در سامانه ثبت شده است.', 'error');
      return false;
    }
    const dupEmail = checkFieldDuplicate('email', email);
    if (dupEmail.isDuplicate) {
      showToast(dupEmail.message || 'این آدرس ایمیل قبلاً در سامانه ثبت شده است.', 'error');
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

    if (!signatureDataUrl) {
      showToast('لطفاً ابتدا تعهدنامه را باز کرده و امضای دیجیتال خود را ثبت نمایید.', 'error');
      setIsCommitmentModalOpen(true);
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
      showToast('🎉 ثبت‌نام شما با موفقیت انجام شد! به سامانه کاریابی کارباما خوش آمدید.', 'success');
      setHasCompletedOnboarding(true);
    } else {
      showToast(res.error || 'خطا در ثبت‌نام. لطفاً ورودی‌های خود را بررسی نمایید.', 'error');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginRole === 'partner') {
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

  const handlePartnerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerRegError(null);

    const natCheck = validateIranianNationalId(partnerNationalId);
    if (!natCheck.isValid) {
      const msg = natCheck.error || 'کد ملی نماینده معتبر نیست.';
      setPartnerRegError(msg);
      showToast(msg, 'error');
      return;
    }

    const phoneCheck = validatePhoneNumber(partnerPhone, '+98');
    if (!phoneCheck.isValid) {
      const msg = phoneCheck.error || 'شماره موبایل وارد شده معتبر نیست.';
      setPartnerRegError(msg);
      showToast(msg, 'error');
      return;
    }

    const emailCheck = validateEmail(partnerEmail);
    if (!emailCheck.isValid) {
      const msg = emailCheck.error || 'آدرس ایمیل وارد شده معتبر نیست.';
      setPartnerRegError(msg);
      showToast(msg, 'error');
      return;
    }

    const cardCheck = validateIranianBankCard(partnerCardNumber);
    if (!cardCheck.isValid) {
      const msg = cardCheck.error || 'شماره کارت بانکی ۱۶ رقمی معتبر نیست.';
      setPartnerRegError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!partnerPassCheck.isValid) {
      const msg = partnerPassCheck.error || 'رمز عبور همکار معتبر نیست.';
      setPartnerRegError(msg);
      showToast(msg, 'error');
      return;
    }

    const res = registerPartner({
      companyName: partnerCompanyName,
      fullName: partnerFullName,
      nationalId: partnerNationalId,
      phone: partnerPhone,
      email: partnerEmail,
      cardNumber: partnerCardNumber,
      city: partnerCity,
      username: partnerUsername,
      password: partnerPassword,
      planId: partnerPlanId,
    });
    if (res.success) {
      setHasCompletedOnboarding(true);
    } else {
      setPartnerRegError(res.error || 'خطا در ثبت‌نام همکار.');
      showToast(res.error || 'خطا در ثبت‌نام همکار.', 'error');
    }
  };

  const formattedPhone = `${phoneCountryCode} ${phoneNumber}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div
        className={`${
          viewMode === 'language' ? 'max-w-6xl' : 'max-w-2xl'
        } w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative max-h-[94vh] min-h-[580px] flex flex-col transition-all duration-300`}
      >
        {/* Top bar */}
        <div style={{ background: 'var(--primary-topbar)' }} className="h-1.5 w-full shrink-0" />

        {/* Top Header Mode Indicator */}
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs border-b border-slate-800/80 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src={KARBAMA_LOGO_DATA_URI}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = KARBAMA_LOGO_DATA_URI;
              }}
              alt="کارباما"
              className="w-9 h-9 rounded-full object-cover border border-amber-400/80 shadow-sm"
            />
            <div>
              <span className="font-black text-xs sm:text-sm text-white">کارباما | KARBAMA</span>
              <p className="text-[10px] text-slate-400">{t('appOfficialTag', appLanguage)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
              title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
              className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-700" />
              )}
            </button>

            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => setViewMode('language')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'language' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                صفحه اصلی
              </button>
              <button
                type="button"
                onClick={() => setViewMode('register')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'register' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('register', appLanguage)}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'login' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('login', appLanguage)}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-7">
          {/* SCREEN 1: ULTRA-MODERN HOMEPAGE HERO + DEVICE MOCKUP + SOCIAL PROOF STATS */}
          {viewMode === 'language' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* SPLIT-SCREEN HERO SECTION */}
              <div
                style={{ background: 'var(--primary-banner)' }}
                className="relative rounded-3xl border border-slate-800/80 p-5 sm:p-8 lg:p-10 overflow-hidden shadow-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
                  {/* Hero Text & Dual CTA Column */}
                  <div className="lg:col-span-7 space-y-5 text-right">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>سامانه رسمی کاریابی، اعزام و اشتغال بین‌المللی | karbama34.ir</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.35] tracking-tight">
                      {currentLangObj.welcome}
                    </h1>

                    <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed max-w-2xl">
                      {currentLangObj.desc}
                    </p>

                    {/* Dual Call-to-Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRegAccountType('seeker');
                          setViewMode('register');
                        }}
                        className="flex-1 py-3.5 sm:py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                      >
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span>پیدا کردن شغل دلخواه</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegAccountType('partner');
                          setViewMode('register');
                        }}
                        className="flex-1 py-3.5 sm:py-4 px-6 bg-slate-800/90 hover:bg-slate-800 text-white border-2 border-blue-500/40 hover:border-blue-500 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                        <span>ثبت آگهی استخدام و همکاری</span>
                        <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform shrink-0" />
                      </button>
                    </div>

                    {/* Quick Login & Trust Highlights */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          قرارداد رسمی و جای خواب
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          احراز هویت کارفرمایان
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          پشتیبانی تا شروع به کار
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewMode('login')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('existingAccountLoginBtn', appLanguage)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sleek Device Mockup / App Preview Column */}
                  <div className="lg:col-span-5 flex items-center justify-center">
                    <div className="relative w-full max-w-sm">
                      {/* Device Frame */}
                      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-4 shadow-2xl space-y-3.5 relative z-10">
                        {/* App Mockup Top Bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={KARBAMA_LOGO_DATA_URI}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = KARBAMA_LOGO_DATA_URI;
                              }}
                              alt="کارباما"
                              className="w-9 h-9 rounded-full object-cover border border-amber-400 shadow-xs"
                            />
                            <div className="text-right">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-white">اپلیکیشن کارباما</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                  رسمی ✓
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                karbama34.ir
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                            آگهی‌های زنده
                          </span>
                        </div>

                        {/* Mockup Live Job Card 1 */}
                        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-right">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-black text-white block">
                                سرآشپز و کباب‌پز ماهر (استانبول)
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                منطقه شیشلی • رستوران زنجیره‌ای معتبر
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black shrink-0">
                              ۴۸,۰۰۰ لیر
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                              ✓ جای خواب رایگان
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                              ✓ قرارداد رسمی و اقامت کاری
                            </span>
                          </div>
                        </div>

                        {/* Mockup Live Job Card 2 */}
                        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-right">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-black text-white block">
                                چرخکار صنعتی و خیاط ماهر (مرتر)
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                                استانبول • تولیدی پوشاک صادراتی
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black shrink-0">
                              ۴۲,۰۰۰ لیر
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                              ✓ ۳ وعده غذا + خوابگاه
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                              ✓ تسویه منظم هفتگی
                            </span>
                          </div>
                        </div>

                        {/* Mockup Bottom Status Pill */}
                        <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-[11px] font-bold text-white">
                              صدور فوری پرونده استخدامی کد رهگیری‌دار
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">24/7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOCIAL PROOF & TRUST STATISTICS SECTION DIRECTLY BELOW HERO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white">+۱,۴۸۰</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                        بروزرسانی روزانه
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white">فرصت‌های شغلی فعال</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      آگهی‌های استخدامی احراز هویت‌شده با جای خواب، وعده غذایی و قرارداد معتبر در ترکیه، آلمان، ارمنستان و عراق
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white">+۴,۳۵۰</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 text-[10px] font-bold">
                        احراز هویت‌شده
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white">کارجویان و همکاران تاییدشده</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      متخصصان دارای پرونده رسمی کد رهگیری‌دار و کارفرمایان و آژانس‌های کاریابی معتبر
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white">۹۸.۶٪</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold">
                        تضمین امنیت
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white">نرخ موفقیت و رضایت</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      اعزام موفق کارجویان، پشتیبانی گام‌به‌گام حقوقی و رضایت بالای کارفرمایان از نیروهای معرفی‌شده
                    </p>
                  </div>
                </div>
              </div>

              {/* COMPACT LANGUAGE SELECTOR BAR */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{t('selectLanguagePrompt', appLanguage)}</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {languages.map((l) => {
                    const isSelected = appLanguage === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => changeAppLanguage(l.code)}
                        className={`px-3 py-2 rounded-xl border text-right transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-xs'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{l.flag}</span>
                          <span className="text-xs font-bold">{l.label}</span>
                        </div>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: SEPARATE REGISTRATION FLOWS (JOB SEEKER VS PARTNER) */}
          {viewMode === 'register' && (
            <div className="space-y-5 pb-4">
              {/* Top Role Switcher: Job Seeker vs Partner */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setRegAccountType('seeker')}
                  className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    regAccountType === 'seeker'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ثبت‌نام کارجو</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegAccountType('partner')}
                  className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    regAccountType === 'partner'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>ثبت‌نام همکار / کارفرما</span>
                </button>
              </div>

              {/* INDEPENDENT PARTNER REGISTRATION FORM */}
              {regAccountType === 'partner' && (
                <form onSubmit={handlePartnerRegisterSubmit} className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-indigo-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>ثبت‌نام اختصاصی همکاران و دفاتر کاریابی</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      پس از تکمیل فرم ثبت‌نام همکار، جهت فعال‌سازی پنل و دسترسی به امکانات ثبت و مدیریت کارجویان، پرداخت آنلاین حق اشتراک از طریق درگاه بانکی و تایید مدیریت الزامی است.
                    </p>
                  </div>

                  {partnerRegError && (
                    <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{partnerRegError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام شرکت / دفتر کاریابی یا کارگاه *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثلاً: آژانس کاریابی امید"
                        value={partnerCompanyName}
                        onChange={(e) => setPartnerCompanyName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام و نام خانوادگی مدیر / نماینده *</label>
                      <input
                        type="text"
                        required
                        placeholder="نام کامل نماینده"
                        value={partnerFullName}
                        onChange={(e) => setPartnerFullName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium flex items-center justify-between">
                        <span>کد ملی ۱۰ رقمی مدیر / نماینده *</span>
                        <span className="text-[10px] text-slate-400 font-mono">الگوریتم ثبت احوال</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="0012345678"
                        value={partnerNationalId}
                        onChange={(e) => setPartnerNationalId(sanitizeNumericOnly(e.target.value, 10))}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                          partnerNatIdLiveCheck && !partnerNatIdLiveCheck.isValid
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      {partnerNatIdLiveCheck && !partnerNatIdLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{partnerNatIdLiveCheck.error}</span>
                        </div>
                      )}
                      {partnerNatIdLiveCheck && partnerNatIdLiveCheck.isValid && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>کد ملی ۱۰ رقمی معتبر است ✓</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium flex items-center justify-between">
                        <span>شماره موبایل و واتساپ (با پیش‌شماره 09) *</span>
                        <span className="text-[10px] text-slate-400 font-mono">09XXXXXXXXX</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="09123456789"
                        value={partnerPhone}
                        onChange={(e) => setPartnerPhone(sanitizeNumericOnly(e.target.value, 11))}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                          partnerPhoneLiveCheck && !partnerPhoneLiveCheck.isValid
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      {partnerPhoneLiveCheck && !partnerPhoneLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{partnerPhoneLiveCheck.error}</span>
                        </div>
                      )}
                      {partnerPhoneLiveCheck && partnerPhoneLiveCheck.isValid && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>شماره موبایل معتبر ({partnerPhoneLiveCheck.operatorName || 'تایید شده'}) ✓</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium flex items-center justify-between">
                        <span>شماره کارت بانکی ۱۶ رقمی همکار *</span>
                        <span className="text-[10px] text-slate-400 font-mono">الگوریتم شاپرک (Luhn)</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="6037-9975-XXXX-XXXX"
                        value={partnerCardNumber}
                        onChange={(e) => setPartnerCardNumber(sanitizeCardNumber(e.target.value))}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                          partnerCardLiveCheck && !partnerCardLiveCheck.isValid
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      {partnerCardLiveCheck && !partnerCardLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{partnerCardLiveCheck.error}</span>
                        </div>
                      )}
                      {partnerCardLiveCheck && partnerCardLiveCheck.isValid && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>کارت معتبر: {partnerCardLiveCheck.bankName} ✓</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">شهر محل فعالیت *</label>
                      <input
                        type="text"
                        required
                        placeholder="استانبول، تهران، آنکارا..."
                        value={partnerCity}
                        onChange={(e) => setPartnerCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-slate-300 font-medium flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>آدرس ایمیل معتبر (جهت بازیابی رمز عبور) *</span>
                      </label>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        placeholder="partner@gmail.com"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value.trim())}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                          partnerEmailLiveCheck && !partnerEmailLiveCheck.isValid
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      {partnerEmailLiveCheck && !partnerEmailLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{partnerEmailLiveCheck.error}</span>
                        </div>
                      )}
                      {partnerEmailLiveCheck && partnerEmailLiveCheck.isValid && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>فرمت ایمیل معتبر است ✓</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-slate-300 font-medium">انتخاب پلن اشتراک همکاری (قابل پرداخت آنلاین پس از ثبت‌نام)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {partnerPlans.map((pl) => (
                          <button
                            key={pl.id}
                            type="button"
                            onClick={() => setPartnerPlanId(pl.id)}
                            className={`p-3 rounded-xl border text-right transition flex items-center justify-between cursor-pointer ${
                              partnerPlanId === pl.id
                                ? 'bg-indigo-600/25 border-indigo-400 text-white font-bold'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-white">{pl.title}</p>
                              <p className="text-[10px] text-indigo-300 font-mono mt-0.5">
                                {pl.priceToman.toLocaleString('fa-IR')} تومان ({pl.priceTL.toLocaleString('fa-IR')} لیر)
                              </p>
                            </div>
                            {partnerPlanId === pl.id && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">نام کاربری همکار (انگلیسی) *</label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        placeholder="partner_agency"
                        value={partnerUsername}
                        onChange={(e) =>
                          setPartnerUsername(
                            toEnglishDigits(e.target.value)
                              .replace(/[^a-zA-Z0-9_.-]/g, '')
                              .toLowerCase()
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">رمز عبور همکار *</label>
                      <div className="relative">
                        <input
                          type={showPartnerPassword ? 'text' : 'password'}
                          required
                          dir="ltr"
                          placeholder="Abc12345"
                          value={partnerPassword}
                          onChange={(e) => setPartnerPassword(toEnglishDigits(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPartnerPassword(!showPartnerPassword)}
                          className="absolute left-2.5 top-3 text-slate-400 hover:text-white"
                        >
                          {showPartnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                        <span className={partnerPassCheck.hasMinLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {partnerPassCheck.hasMinLength ? '✓' : '○'} حداقل ۸ کاراکتر
                        </span>
                        <span className={partnerPassCheck.hasUppercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {partnerPassCheck.hasUppercase ? '✓' : '○'} حروف بزرگ (A-Z)
                        </span>
                        <span className={partnerPassCheck.hasLowercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {partnerPassCheck.hasLowercase ? '✓' : '○'} حروف کوچک (a-z)
                        </span>
                        <span className={partnerPassCheck.hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {partnerPassCheck.hasNumber ? '✓' : '○'} شامل عدد (0-9)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>ثبت‌نام همکار و ادامه جهت پرداخت آنلاین اشتراک</span>
                  </button>
                </form>
              )}

              {/* INDEPENDENT JOB SEEKER REGISTRATION WIZARD */}
              {regAccountType === 'seeker' && (
                <>
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
                        lang={appLanguage}
                        dir={appLanguage === 'en' || appLanguage === 'tr' ? 'ltr' : 'rtl'}
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
                        lang={appLanguage}
                        dir={appLanguage === 'en' || appLanguage === 'tr' ? 'ltr' : 'rtl'}
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
                        lang={appLanguage}
                        dir={appLanguage === 'en' || appLanguage === 'tr' ? 'ltr' : 'rtl'}
                        placeholder={t('fatherNamePlaceholderText', appLanguage)}
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium flex items-center justify-between">
                        <span>کد ملی ۱۰ رقمی متقاضی *</span>
                        <span className="text-[10px] text-slate-400 font-mono">الگوریتم ثبت احوال</span>
                      </label>
                      <input
                        type="text"
                        required
                        lang="en"
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="0012345678"
                        value={nationalId}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericOnly(e.target.value, 10);
                          setNationalId(sanitized);
                          checkFieldDuplicate('nationalId', sanitized);
                        }}
                        onBlur={() => checkFieldDuplicate('nationalId', nationalId)}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                          duplicateErrors.nationalId || (seekerNatIdLiveCheck && !seekerNatIdLiveCheck.isValid)
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-red-500'
                        }`}
                      />
                      {seekerNatIdLiveCheck && !seekerNatIdLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{seekerNatIdLiveCheck.error}</span>
                        </div>
                      )}
                      {seekerNatIdLiveCheck && seekerNatIdLiveCheck.isValid && !duplicateErrors.nationalId && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>کد ملی ۱۰ رقمی معتبر است ✓</span>
                        </div>
                      )}
                      {duplicateErrors.nationalId && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{duplicateErrors.nationalId}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium flex items-center justify-between">
                        <span>{t('mobileWhatsAppInputLabel', appLanguage)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">09XXXXXXXXX</span>
                      </label>
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
                          lang="en"
                          dir="ltr"
                          inputMode="numeric"
                          placeholder="09123456789"
                          value={phoneNumber}
                          onChange={(e) => {
                            const sanitized = sanitizeNumericOnly(e.target.value, 11);
                            setPhoneNumber(sanitized);
                            checkFieldDuplicate('phoneNumber', sanitized);
                          }}
                          onBlur={() => checkFieldDuplicate('phoneNumber', phoneNumber)}
                          className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                            duplicateErrors.phoneNumber || (seekerPhoneLiveCheck && !seekerPhoneLiveCheck.isValid)
                              ? 'border-red-500 ring-1 ring-red-500/50'
                              : 'border-slate-700 focus:border-red-500'
                          }`}
                        />
                      </div>
                      {seekerPhoneLiveCheck && !seekerPhoneLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{seekerPhoneLiveCheck.error}</span>
                        </div>
                      )}
                      {seekerPhoneLiveCheck && seekerPhoneLiveCheck.isValid && !duplicateErrors.phoneNumber && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>شماره موبایل معتبر ({seekerPhoneLiveCheck.operatorName || 'تایید شده'}) ✓</span>
                        </div>
                      )}
                      {duplicateErrors.phoneNumber && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{duplicateErrors.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium text-amber-300 flex items-center justify-between">
                        <span>{t('payerCardNumberInputLabel', appLanguage)}</span>
                        <span className="text-[10px] text-amber-400/80 font-mono">۱۶ رقم (الگوریتم Luhn)</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        lang="en"
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="6037-9975-XXXX-XXXX"
                        value={payerCardNumber}
                        onChange={(e) => {
                          const sanitized = sanitizeCardNumber(e.target.value);
                          setPayerCardNumber(sanitized);
                          checkFieldDuplicate('payerCardNumber', sanitized);
                          const clean = sanitized.replace(/\D/g, '');
                          if (clean.length === 16) {
                            const check = validateIranianBankCard(clean);
                            if (check.isValid) {
                              if (check.bankName) setInquiredPayerBank(check.bankName);
                              inquireSepalBank(clean);
                            } else {
                              setInquiredPayerBank(null);
                            }
                          } else {
                            setInquiredPayerBank(null);
                          }
                        }}
                        onBlur={() => checkFieldDuplicate('payerCardNumber', payerCardNumber)}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono font-bold text-left focus:outline-hidden ${
                          duplicateErrors.payerCardNumber || (seekerCardLiveCheck && !seekerCardLiveCheck.isValid)
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-amber-500'
                        }`}
                      />

                      {seekerCardLiveCheck && !seekerCardLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{seekerCardLiveCheck.error}</span>
                        </div>
                      )}

                      {/* Sepal Card Inquiry Feedback */}
                      {isInquiringPayerBank && seekerCardLiveCheck?.isValid && (
                        <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-bold bg-teal-950/40 border border-teal-500/30 p-2 rounded-xl animate-in fade-in">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>در حال استعلام نام بانک...</span>
                        </div>
                      )}

                      {!isInquiringPayerBank && seekerCardLiveCheck?.isValid && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/40 p-2 rounded-xl animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>بانک صادرکننده: {inquiredPayerBank || seekerCardLiveCheck.bankName} (کارت معتبر شتاب ✓)</span>
                        </div>
                      )}

                      {duplicateErrors.payerCardNumber && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{duplicateErrors.payerCardNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-slate-300 font-medium flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>آدرس ایمیل معتبر (جهت بازیابی رمز عبور) *</span>
                      </label>
                      <input
                        type="email"
                        required
                        lang="en"
                        dir="ltr"
                        inputMode="email"
                        placeholder="name@gmail.com"
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setEmail(val);
                          checkFieldDuplicate('email', val);
                        }}
                        onBlur={() => checkFieldDuplicate('email', email)}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden ${
                          duplicateErrors.email || (seekerEmailLiveCheck && !seekerEmailLiveCheck.isValid)
                            ? 'border-red-500 ring-1 ring-red-500/50'
                            : 'border-slate-700 focus:border-red-500'
                        }`}
                      />
                      {seekerEmailLiveCheck && !seekerEmailLiveCheck.isValid && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{seekerEmailLiveCheck.error}</span>
                        </div>
                      )}
                      {seekerEmailLiveCheck && seekerEmailLiveCheck.isValid && !duplicateErrors.email && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>ساختار ایمیل معتبر است ✓</span>
                        </div>
                      )}
                      {duplicateErrors.email && (
                        <div className="p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{duplicateErrors.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('usernameInputLabel', appLanguage)}</label>
                      <input
                        type="text"
                        required
                        lang="en"
                        dir="ltr"
                        placeholder={t('usernamePlaceholderText', appLanguage)}
                        value={username}
                        onChange={(e) => setUsername(toEnglishDigits(e.target.value).replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase())}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">{t('passwordInputLabel', appLanguage)}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          lang="en"
                          dir="ltr"
                          placeholder="Abc12345"
                          value={password}
                          onChange={(e) => setPassword(toEnglishDigits(e.target.value))}
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

                          <div className="flex flex-wrap items-center gap-1.5 pb-1 text-[11px]">
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

                    {signatureDataUrl ? (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>امضای الکترونیکی رسمی متقاضی ثبت شد ✓</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsCommitmentModalOpen(true)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline"
                          >
                            مشاهده و ویرایش امضا
                          </button>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-center">
                          <img src={signatureDataUrl} alt="امضای دیجیتال متقاضی" className="max-h-16 object-contain" />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCommitmentModalOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{t('openCommitmentModalBtn', appLanguage)}</span>
                      </button>
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
                      className="px-8 py-3 bg-gradient-to-r from-red-600 to-emerald-600 hover:from-red-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-700/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>ثبت نهایی و ورود به سامانه کارباما</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: تاییدیه نهایی و پرونده رسمی کارجو */}
              {regStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200 py-2 text-[#0F172A] dark:text-slate-100">
                  {/* Top Success Banner */}
                  <div className="bg-[#ECFDF5] dark:bg-emerald-950/80 border-2 border-emerald-400 dark:border-emerald-500/80 rounded-3xl p-5 sm:p-6 text-center shadow-lg relative overflow-hidden">
                    <div className="w-14 h-14 bg-[#10B981] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-[#065F46] dark:text-white">
                      🎉 پرونده رسمی کارجو با موفقیت صادر گردید!
                    </h2>
                    <p className="text-xs text-[#064E3B] dark:text-emerald-200 font-bold mt-1.5 max-w-lg mx-auto leading-relaxed">
                      حساب کاربری شما فعال شد و تمامی مدارک (پاسپورت با ۴ گوشه مشخص، عکس پرسنلی و امضای دیجیتال رسمی) در پرونده مرکزی کارباما ثبت و ذخیره گردید.
                    </p>

                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-white dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 rounded-full text-xs text-[#065F46] dark:text-emerald-200 font-black">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      <span>کد پرونده الکترونیک: <strong className="font-mono text-[#0F172A] dark:text-white text-sm" dir="ltr">{registeredSeeker?.id || `KB-${Date.now().toString().slice(-6)}`}</strong></span>
                    </div>
                  </div>

                  {/* کارت پرونده جامع الکترونیک کارجو */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-[#CBD5E1] dark:border-slate-700 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={KARBAMA_LOGO_DATA_URI}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = KARBAMA_LOGO_DATA_URI;
                          }}
                          alt="کارباما"
                          className="w-10 h-10 rounded-full border-2 border-[#2563EB] dark:border-amber-400 shadow-xs object-cover"
                        />
                        <div>
                          <h3 className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>کارت پرونده رسمی کارجو</span>
                            <span className="text-[10px] bg-[#D1FAE5] dark:bg-emerald-500/20 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-2.5 py-0.5 rounded-full font-black">
                              معتبر و تایید شده
                            </span>
                          </h3>
                          <p className="text-[11px] font-bold text-[#334155] dark:text-slate-300">سامانه کاریابی و اعزام نیروی کار کارباما</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Photos Grid (Passport & Full-Body) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full-Body Photo */}
                      <div className="bg-[#F8FAFC] dark:bg-slate-800/80 p-3 rounded-2xl border border-[#CBD5E1] dark:border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black text-[#0F172A] dark:text-slate-200">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
                            <span>عکس پرسنلی تمام قد</span>
                          </span>
                          <span className="text-[10px] text-[#065F46] dark:text-emerald-300 bg-[#D1FAE5] dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-md font-black">
                            تایید شده ✓
                          </span>
                        </div>
                        <div className="h-40 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 flex items-center justify-center">
                          {fullBodyPhotoUrl ? (
                            <img
                              src={fullBodyPhotoUrl}
                              alt="عکس تمام قد کارجو"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs font-bold text-[#475569] dark:text-slate-400">تصویر ثبت شده</div>
                          )}
                        </div>
                      </div>

                      {/* Passport Photo */}
                      <div className="bg-[#F8FAFC] dark:bg-slate-800/80 p-3 rounded-2xl border border-[#CBD5E1] dark:border-emerald-500/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black text-[#0F172A] dark:text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#2563EB] dark:text-amber-400" />
                            <span>عکس پاسپورت (۴ گوشه مشخص)</span>
                          </span>
                          <span className="text-[10px] text-[#065F46] dark:text-emerald-300 bg-[#D1FAE5] dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-black">
                            <Check className="w-3 h-3" />
                            چهارگوشه احراز شد ✓
                          </span>
                        </div>
                        <div className="relative h-40 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-emerald-500/30 flex items-center justify-center">
                          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#10B981] rounded-tr pointer-events-none z-10" />
                          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#10B981] rounded-tl pointer-events-none z-10" />
                          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#10B981] rounded-br pointer-events-none z-10" />
                          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#10B981] rounded-bl pointer-events-none z-10" />

                          {passportPhotoUrl ? (
                            <img
                              src={passportPhotoUrl}
                              alt="عکس پاسپورت با چهارگوش مشخص"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs font-bold text-[#475569] dark:text-slate-400">تصویر پاسپورت</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Identity Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-[#F8FAFC] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-[#CBD5E1] dark:border-slate-700">
                      <div>
                        <span className="text-[#334155] dark:text-slate-300 font-bold block text-[11px]">نام و نام خانوادگی:</span>
                        <strong className="text-[#0F172A] dark:text-white text-xs sm:text-sm font-black">{firstName} {lastName}</strong>
                      </div>
                      <div>
                        <span className="text-[#334155] dark:text-slate-300 font-bold block text-[11px]">نام پدر:</span>
                        <strong className="text-[#0F172A] dark:text-white font-black">{fatherName}</strong>
                      </div>
                      <div>
                        <span className="text-[#334155] dark:text-slate-300 font-bold block text-[11px]">کد ملی / پاسپورت:</span>
                        <strong className="text-[#0F172A] dark:text-amber-300 font-mono font-black" dir="ltr">{nationalId}</strong>
                      </div>
                      <div>
                        <span className="text-[#334155] dark:text-slate-300 font-bold block text-[11px]">شماره تماس:</span>
                        <strong className="text-[#065F46] dark:text-emerald-300 font-mono font-black" dir="ltr">{phoneCountryCode} {phoneNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[#334155] dark:text-slate-300 font-bold block text-[11px]">کشور مقصد:</span>
                        <strong className="text-[#1E3A8A] dark:text-white font-black">{targetCountry} ({targetCity})</strong>
                      </div>
                      <div>
                        <span className="text-[#334155] dark:text-slate-300 font-bold block text-[11px]">شغل‌های درخواستی:</span>
                        <strong className="text-[#0F172A] dark:text-white font-black truncate block">{selectedCommonJobs.join('، ') || customWrittenSkills || 'عمومی'}</strong>
                      </div>
                    </div>

                    {/* Signature Preview */}
                    {signatureDataUrl && (
                      <div className="bg-[#F8FAFC] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-[#CBD5E1] dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
                            <span>امضای الکترونیکی ثبت شده متقاضی</span>
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D1FAE5] dark:bg-emerald-500/20 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-black">
                            دارای اعتبار حقوقی
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#CBD5E1] flex justify-center">
                          <img
                            src={signatureDataUrl}
                            alt="امضای رسمی متقاضی"
                            className="max-h-20 w-auto object-contain"
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
                      className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-[#F1F5F9] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-100 border border-[#CBD5E1] dark:border-slate-700 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <FileText className="w-4 h-4 text-[#2563EB] dark:text-amber-400" />
                      <span>مشاهده و چاپ تعهدنامه حقوقی با امضا</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasCompletedOnboarding(true)}
                      className="w-full sm:flex-1 py-3.5 px-6 bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>ورود به سامانه کارباما و مشاهده آگهی‌های شغلی</span>
                    </button>
                  </div>
                </div>
              )}
                </>
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

                {/* Role Selector (Standard Users: Job Seeker & Partner only) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLoginRole('seeker')}
                    className={`py-2.5 rounded-lg transition cursor-pointer ${
                      loginRole === 'seeker' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t('jobseekerRole', appLanguage)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('partner')}
                    className={`py-2.5 rounded-lg transition cursor-pointer ${
                      loginRole === 'partner' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    همکار / کارفرما
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
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPasswordModal(true);
                          setRecoverResult(null);
                          setRecoverInput('');
                          setRecoverNewPassword('');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>{loginRole === 'partner' ? 'فراموشی رمز عبور همکار؟' : 'فراموشی رمز عبور کارجو؟'}</span>
                      </button>
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

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    className={`w-full py-3 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                      loginRole === 'partner'
                        ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-700/30'
                        : 'bg-red-600 hover:bg-red-500 shadow-red-700/30'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loginRole === 'partner' ? 'ورود به پنل همکار' : t('loginSubmitBtnText', appLanguage)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegAccountType(loginRole === 'partner' ? 'partner' : 'seeker');
                      setViewMode('register');
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      loginRole === 'partner'
                        ? 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {loginRole === 'partner'
                        ? 'حساب ندارید؟ ثبت‌نام همکار'
                        : 'حساب کاربری ندارید؟ ثبت‌نام کارجو'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* SEPARATE ROLE-SPECIFIC FORGOT PASSWORD MODAL (EMAIL BASED) */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                <KeyRound className="w-5 h-5 shrink-0" />
                <span>
                  {loginRole === 'partner'
                    ? 'بازیابی رمز عبور همکار / کارفرما (با ایمیل)'
                    : 'بازیابی رمز عبور کارجو (با ایمیل)'}
                </span>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('seeker');
                  setRecoverResult(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  loginRole === 'seeker' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                بازیابی حساب کارجو
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('partner');
                  setRecoverResult(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  loginRole === 'partner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                بازیابی حساب همکار
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {loginRole === 'partner'
                ? 'جهت بازیابی یا بازنشانی رمز عبور حساب همکار از طریق سرور ایمیل رسمی (mail.karbama34.ir)، آدرس ایمیل ثبت‌شده همکار را وارد نمایید.'
                : 'جهت بازیابی یا بازنشانی رمز عبور حساب کارجو از طریق سرور ایمیل رسمی (mail.karbama34.ir)، آدرس ایمیل ثبت‌شده کارجو را وارد نمایید.'}
            </p>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">سرور ایمیل احراز هویت و بازیابی:</span>
              <span className="font-mono font-bold text-emerald-400" dir="ltr">mail.karbama34.ir</span>
            </div>

            {recoverResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                  recoverResult.success
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
                }`}
              >
                {recoverResult.message}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {loginRole === 'partner' ? 'ایمیل ثبت‌شده همکار (یا نام کاربری)' : 'ایمیل ثبت‌شده کارجو (یا نام کاربری)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={recoverInput}
                  onChange={(e) => setRecoverInput(e.target.value)}
                  placeholder={loginRole === 'partner' ? 'partner@gmail.com' : 'seeker@gmail.com'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رمز عبور جدید (اختیاری - در صورت تمایل به تغییر مستقیم رمز)
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={recoverNewPassword}
                  onChange={(e) => setRecoverNewPassword(e.target.value)}
                  placeholder="رمز جدید (حداقل ۶ کاراکتر)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                بستن
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!recoverInput.trim()) return;
                  const res = recoverPassword(
                    recoverInput,
                    loginRole,
                    recoverNewPassword.trim() ? recoverNewPassword.trim() : undefined
                  );
                  setRecoverResult({
                    success: res.success,
                    message: res.message || res.error || '',
                  });
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-700/30 cursor-pointer"
              >
                {recoverNewPassword.trim() ? 'تایید ایمیل و تغییر رمز عبور' : 'تایید ایمیل و بازیابی رمز عبور'}
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
          setRegStep(4);
          showToast('امضای دیجیتال با موفقیت ثبت شد. لطفاً تاییدیه نهایی را بررسی و دکمه ثبت نهایی را بزنید.', 'success');
        }}
      />
    </div>
  );
};
