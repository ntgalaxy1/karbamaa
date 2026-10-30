import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PartnerSubscriptionPlanId,
  PaymentMethod,
  TargetCountry,
  TurkishLevel,
  ResidenceStatus,
  Gender,
} from '../types';
import {
  Users,
  ShieldCheck,
  CheckCircle,
  PlusCircle,
  Clock,
  CreditCard,
  Building2,
  Phone,
  User,
  Key,
  Calendar,
  Sparkles,
  AlertCircle,
  Lock,
  LogOut,
  Upload,
  Camera,
  Check,
  Search,
  MessageCircle,
  FileCheck2,
  Award,
  ChevronLeft,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';

const COMMON_PARTNER_JOBS = [
  'سرآشپز و کباب‌پز غذاهای سنتی و فرنگی',
  'کمک‌آشپز و سالن‌کار رستوران',
  'باریستا و بارتندر کافی‌شاپ',
  'پذیرش و فرانت‌آفیس هتل',
  'خانه‌داری و نظافت هتل',
  'چرخکار راسته و زیگزال پوشاک',
  'برشکار و الگوساز پارچه',
  'برقکار صنعتی و تاسیسات',
  'جوشکار برق و آرگون',
  'آرایشگر و گریمور مردانه/زنانه',
  'فروشنده و ویزیتور فروشگاه',
  'مترجم همزمان ترکی به فارسی',
  'کارگر ساده انبار و تولید',
];

export const PartnerSection: React.FC = () => {
  const {
    currentPartner,
    partners,
    partnerPlans,
    isPartnerLoggedIn,
    loginPartner,
    registerPartner,
    logoutPartner,
    submitPartnerSubscriptionPayment,
    registerSeekerByPartner,
    jobSeekers,
    paymentSettings,
    switchToDemoPartner,
    activatePartnerInstantly,
    showToast,
    setActiveTab,
    isAdminLoggedIn,
  } = useApp();

  // Auth form states (if not logged in)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('استانبول');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Partner Dashboard state
  const [activePartnerTab, setActivePartnerTab] = useState<'add_seeker' | 'my_seekers' | 'subscription'>('add_seeker');

  // Subscription Payment selection state
  const [selectedPlanId, setSelectedPlanId] = useState<PartnerSubscriptionPlanId>('3_months');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('turkey_bank');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [paymentRefId, setPaymentRefId] = useState<string>('');
  const [paymentPayerName, setPaymentPayerName] = useState<string>('');
  const [paymentSubmitting, setPaymentSubmitting] = useState<boolean>(false);

  // Add Seeker form states
  const [seekerFullName, setSeekerFullName] = useState('');
  const [seekerFatherName, setSeekerFatherName] = useState('');
  const [seekerNationalId, setSeekerNationalId] = useState('');
  const [seekerGender, setSeekerGender] = useState<Gender>('male');
  const [seekerCountryCode, setSeekerCountryCode] = useState('+90');
  const [seekerPhoneNumber, setSeekerPhoneNumber] = useState('');
  const [seekerProvince, setSeekerProvince] = useState('تهران');
  const [seekerCity, setSeekerCity] = useState('تهران');
  const [seekerTargetCountry, setSeekerTargetCountry] = useState<TargetCountry>('ترکیه');
  const [seekerTargetCity, setSeekerTargetCity] = useState('استانبول');
  const [seekerJob, setSeekerJob] = useState(COMMON_PARTNER_JOBS[0]);
  const [seekerCustomJob, setSeekerCustomJob] = useState('');
  const [seekerTurkishLevel, setSeekerTurkishLevel] = useState<TurkishLevel>('basic');
  const [seekerResidence, setSeekerResidence] = useState<ResidenceStatus>('none');
  const [isTemporary, setIsTemporary] = useState(false);
  const [partnerNote, setPartnerNote] = useState('');
  const [registeredSuccessInfo, setRegisteredSuccessInfo] = useState<{
    fullName: string;
    nationalId: string;
    isTemporary: boolean;
  } | null>(null);

  // Search in my seekers
  const [seekerFilterQuery, setSeekerFilterQuery] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginPartner(loginUsername, loginPassword);
    if (!res.success) {
      setAuthError(res.error || 'خطا در ورود به پنل همکار');
    }
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = registerPartner({
      companyName: regCompanyName,
      fullName: regFullName,
      phone: regPhone,
      city: regCity,
      username: regUsername,
      password: regPassword,
    });
    if (!res.success) {
      setAuthError(res.error || 'خطا در ثبت‌نام همکار');
    }
  };

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSubmitting(true);
    const res = submitPartnerSubscriptionPayment(
      selectedPlanId,
      paymentMethod,
      paymentReceiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      paymentRefId || 'TR-REF-' + Math.floor(100000 + Math.random() * 900000),
      paymentPayerName || currentPartner?.fullName
    );
    setPaymentSubmitting(false);
    if (res.success) {
      setActivePartnerTab('subscription');
    }
  };

  // Handle Add Seeker Submit
  const handleAddSeeker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seekerFullName.trim() || !seekerNationalId.trim() || !seekerPhoneNumber.trim()) {
      showToast('لطفاً نام، کد ملی و شماره تماس کارجو را وارد کنید.', 'error');
      return;
    }

    const cleanNatId = seekerNationalId.replace(/\D/g, '');
    if (cleanNatId.length !== 10) {
      showToast('کد ملی باید ۱۰ رقم کامل باشد.', 'error');
      return;
    }

    const jobTitle = seekerCustomJob.trim() || seekerJob;
    const res = registerSeekerByPartner({
      fullName: seekerFullName.trim(),
      fatherName: seekerFatherName.trim(),
      nationalId: cleanNatId,
      gender: seekerGender,
      phoneCountryCode: seekerCountryCode,
      phoneNumber: seekerPhoneNumber.trim(),
      phone: `${seekerCountryCode} ${seekerPhoneNumber.trim()}`,
      iranProvince: seekerProvince,
      iranCity: seekerCity,
      targetCountry: seekerTargetCountry,
      targetCity: seekerTargetCity,
      skills: [jobTitle],
      selectedJobs: [jobTitle],
      customProfession: jobTitle,
      turkishLevel: seekerTurkishLevel,
      residenceStatus: seekerResidence,
      isTemporaryRegistration: isTemporary,
      partnerInternalNote: partnerNote.trim(),
    });

    if (res.success) {
      setRegisteredSuccessInfo({
        fullName: seekerFullName.trim(),
        nationalId: cleanNatId,
        isTemporary,
      });
      // reset form
      setSeekerFullName('');
      setSeekerFatherName('');
      setSeekerNationalId('');
      setSeekerPhoneNumber('');
      setSeekerCustomJob('');
      setPartnerNote('');
    }
  };

  // Seekers registered by this partner
  const myRegisteredSeekers = currentPartner
    ? jobSeekers.filter(
        (s) =>
          s.registeredByPartnerId === currentPartner.id ||
          s.registeredByPartnerCode === currentPartner.partnerCode
      )
    : [];

  const filteredMySeekers = myRegisteredSeekers.filter((s) => {
    if (!seekerFilterQuery.trim()) return true;
    const q = seekerFilterQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.nationalId.includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.targetCity && s.targetCity.toLowerCase().includes(q))
    );
  });

  const selectedPlan = partnerPlans.find((p) => p.id === selectedPlanId) || partnerPlans[0];

  // ==========================================
  // VIEW 1: NOT LOGGED IN AS PARTNER
  // ==========================================
  if (!isPartnerLoggedIn || !currentPartner) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                شبکه نمایندگان و همکاران کارباما
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                پنل اختصاصی همکاران و آژانس‌های مهاجرتی
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                آژانس‌ها، دفاتر اعزام نیروی کار و همکاران می‌توانند با خرید اشتراک همکار، کارجویان خود را به صورت موقت یا قطعی در کارباما ثبت کرده و فرآیند معرفی به کارفرمایان ترکیه را مدیریت نمایند.
              </p>
            </div>

            {/* Quick Demo Login Button */}
            <div className="shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={switchToDemoPartner}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                ورود سریع با اکانت دمو همکار (استانبول پارس)
              </button>
            </div>
          </div>
        </div>

        {/* Auth Box: Login / Register */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError(null);
              }}
              className={`pb-3 px-4 font-bold text-sm transition relative ${
                authTab === 'login'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              ورود به حساب همکار
            </button>
            <button
              onClick={() => {
                setAuthTab('register');
                setAuthError(null);
              }}
              className={`pb-3 px-4 font-bold text-sm transition relative ${
                authTab === 'register'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              ثبت‌نام همکار جدید (دریافت کد همکاری)
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام کاربری همکار
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="مثلاً partner1"
                    dir="ltr"
                    required
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  رمز عبور
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    required
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition duration-150"
              >
                ورود به پنل مدیریت همکاران
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                حساب کاربری ندارید؟{' '}
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className="text-indigo-400 hover:underline font-bold"
                >
                  ثبت‌نام همکار جدید
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام موسسه / شرکت / آژانس
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      placeholder="مثلاً آژانس مهاجرتی امید"
                      required
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام و نام خانوادگی نماینده
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="مثلاً رضا علوی"
                      required
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    شماره تماس و واتساپ
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+90 534 000 0000"
                      dir="ltr"
                      required
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    شهر محل فعالیت
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="استانبول، تهران، آنکارا..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام کاربری ورود دلخواه
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="omid_agency"
                    dir="ltr"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    رمز عبور
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition duration-150 mt-2"
              >
                ثبت‌نام و ایجاد حساب همکار کارباما
              </button>
            </form>
          )}
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              ۱
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">ثبت‌نام مستقیم کارجویان</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              قابلیت پیش‌ثبت‌نام موقت یا رسمی کارجویان با درج نام و کد اختصاصی شما به عنوان معرف در پرونده و پنل مدیریت.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              ۲
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">پلن‌های منعطف اشتراک</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              امکان انتخاب اشتراک ماهیانه، ۳ ماهه، ۶ ماهه و یک‌ساله با تعرفه‌های رسمی تعیین‌شده توسط مدیریت سامانه.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ۳
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">پیگیری زنده وضعیت کارجویان</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              مشاهده وضعیت پذیرش، تایید مدارک و معرفی به کارفرمایان ترکیه به صورت زنده و یکپارچه در داشبورد همکار.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOGGED IN, BUT SUBSCRIPTION NOT ACTIVE
  // ==========================================
  const isSubscriptionActive = currentPartner.subscriptionStatus === 'active';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Partner Header Bar */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-right">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h2 className="text-lg font-black">{currentPartner.companyName}</h2>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-[11px] font-mono font-bold text-indigo-300">
                {currentPartner.partnerCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              نماینده: {currentPartner.fullName} | شهر: {currentPartner.city || 'استانبول'} | تماس: {currentPartner.phone}
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-3">
          {isSubscriptionActive ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>اشتراک فعال ({currentPartner.daysRemaining || 30} روز باقیمانده)</span>
            </div>
          ) : currentPartner.subscriptionStatus === 'pending_approval' ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>در انتظار تایید فیش توسط مدیریت</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
              <Lock className="w-4 h-4 text-red-400" />
              <span>اشتراک غیرفعال (نیاز به پرداخت)</span>
            </div>
          )}

          {/* Instant Test Activation Shortcut (Visible only to Admin) */}
          {isAdminLoggedIn && !isSubscriptionActive && (
            <button
              onClick={() => activatePartnerInstantly(currentPartner.id)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition flex items-center gap-1"
              title="جهت تست سریع قابلیت‌های پنل (ویژه مدیر)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              فعال‌سازی فوری تستی (مدیر)
            </button>
          )}

          <button
            onClick={logoutPartner}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="خروج از حساب همکار"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* If Subscription NOT active, Show Plans & Payment directly */}
      {!isSubscriptionActive ? (
        <div className="space-y-6">
          {currentPartner.subscriptionStatus === 'pending_approval' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold">فیش پرداخت شما برای «{currentPartner.planTitle}» ثبت گردید.</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    مدیر سامانه در حال بررسی فیش واریزی شما می‌باشد. پس از تایید مدیر، بخش ثبت کارجو برای شما باز خواهد شد.
                  </p>
                </div>
              </div>
              {isAdminLoggedIn && (
                <button
                  onClick={() => activatePartnerInstantly(currentPartner.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition"
                  title="تایید فوری توسط مدیر"
                >
                  تایید فوری (مدیر)
                </button>
              )}
            </div>
          )}

          {/* Pricing Plans Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                تعرفه‌های مصوب مدیریت کارباما
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                انتخاب پلن اشتراک و فعال‌سازی پنل همکاری
              </h3>
              <p className="text-xs text-slate-400">
                جهت باز شدن بخش افزودن کارجو و استفاده از امکانات پنل، لطفاً یکی از پلن‌های زیر را انتخاب و وجه آن را واریز نمایید.
              </p>
            </div>

            {/* 4 Subscription Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {partnerPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] shadow-sm">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{plan.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">مدت: {plan.durationMonths} ماه کامل</p>
                      </div>

                      <div className="py-2 border-y border-slate-200 dark:border-slate-800">
                        <div className="flex items-baseline gap-1 text-indigo-600 dark:text-indigo-400">
                          <span className="text-2xl font-black">{plan.priceTL.toLocaleString('fa-IR')}</span>
                          <span className="text-xs font-bold">لیر ترکیه</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          معادل: {plan.priceToman.toLocaleString('fa-IR')} تومان
                        </p>
                        {plan.discountPercentage && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-500">
                            {plan.discountPercentage}٪ تخفیف ویژه
                          </span>
                        )}
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'پلن انتخاب شده' : 'انتخاب'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Payment Module */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                انتخاب شیوه پرداخت مبلغ «{selectedPlan.title}» ({selectedPlan.priceTL.toLocaleString('fa-IR')} لیر / {selectedPlan.priceToman.toLocaleString('fa-IR')} تومان)
              </h4>

              {/* 3 Payment Methods (User Request 2: درگاه پرداخت، حساب ترکیه، کارت به کارت ایران) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('turkey_bank')}
                  className={`p-3 rounded-xl border-2 text-right transition flex items-center gap-3 ${
                    paymentMethod === 'turkey_bank'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold shrink-0">
                    🇹🇷
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">واریز به حساب ترکیه (لیر)</p>
                    <p className="text-[10px] text-slate-400">زراعت بانک ترکیه (Ziraat)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('iran_card')}
                  className={`p-3 rounded-xl border-2 text-right transition flex items-center gap-3 ${
                    paymentMethod === 'iran_card'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                    💳
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">کارت به کارت ایران (تومان)</p>
                    <p className="text-[10px] text-slate-400">بانک ملت / ارسال تصویر فیش</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('zarinpal')}
                  className={`p-3 rounded-xl border-2 text-right transition flex items-center gap-3 ${
                    paymentMethod === 'zarinpal'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                    ⚡
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">درگاه پرداخت زرین‌پال</p>
                    <p className="text-[10px] text-slate-400">پرداخت آنلاین با کارت شتاب</p>
                  </div>
                </button>
              </div>

              {/* Bank Details Display */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                {paymentMethod === 'turkey_bank' && (
                  <div className="space-y-1">
                    <p className="font-bold text-indigo-400">مشخصات حساب بانکی ترکیه جهت حواله لیر:</p>
                    <p className="text-slate-300">بانک: <span className="font-bold">{paymentSettings.turkeyBankName}</span></p>
                    <p className="text-slate-300 font-mono" dir="ltr">IBAN: {paymentSettings.turkeyIban}</p>
                    <p className="text-slate-300">صاحب حساب: <span className="font-bold">{paymentSettings.turkeyAccountHolder}</span></p>
                  </div>
                )}
                {paymentMethod === 'iran_card' && (
                  <div className="space-y-1">
                    <p className="font-bold text-emerald-400">مشخصات حساب و کارت جهت واریز تومانی از ایران:</p>
                    <p className="text-slate-300">بانک: <span className="font-bold">{paymentSettings.iranBankName}</span></p>
                    <p className="text-slate-300 font-mono" dir="ltr">شماره کارت: {paymentSettings.iranCardNumber}</p>
                    <p className="text-slate-300">به نام: <span className="font-bold">{paymentSettings.iranCardHolder}</span></p>
                  </div>
                )}
                {paymentMethod === 'zarinpal' && (
                  <div className="space-y-1">
                    <p className="font-bold text-amber-400">اتصال مستقیم به درگاه پرداخت آنلاین شاپرک / زرین‌پال:</p>
                    <p className="text-slate-300">
                      مبلغ قابل پرداخت: <span className="font-bold">{selectedPlan.priceToman.toLocaleString('fa-IR')} تومان</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      با تمامی کارت‌های عضو شبکه شتاب ایران می‌توانید پرداخت را انجام دهید.
                    </p>
                  </div>
                )}
              </div>

              {/* Receipt Submission Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      نام و مشخصات واریزکننده
                    </label>
                    <input
                      type="text"
                      value={paymentPayerName}
                      onChange={(e) => setPaymentPayerName(e.target.value)}
                      placeholder={currentPartner.fullName}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      شماره پیگیری / شماره ارجاع تراکنش
                    </label>
                    <input
                      type="text"
                      value={paymentRefId}
                      onChange={(e) => setPaymentRefId(e.target.value)}
                      placeholder="مثلاً 991203841"
                      dir="ltr"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تصویر فیش واریزی (عکس یا رسید)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={paymentReceiptUrl}
                      onChange={(e) => setPaymentReceiptUrl(e.target.value)}
                      placeholder="آدرس لینک فیش یا روی دکمه بارگذاری نمونه کلیک کنید"
                      dir="ltr"
                      className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentReceiptUrl(
                          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
                        )
                      }
                      className="px-3 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition shrink-0"
                    >
                      <Camera className="w-4 h-4 inline-block ml-1" />
                      انتخاب فیش نمونه
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={paymentSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {paymentMethod === 'zarinpal'
                      ? 'انتقال به درگاه و تکمیل پرداخت'
                      : 'ارسال فیش و ثبت درخواست فعال‌سازی اشتراک'}
                  </button>

                  <button
                    type="button"
                    onClick={() => activatePartnerInstantly(currentPartner.id)}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    فعال‌سازی آنی تستی
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ==========================================
           VIEW 3: LOGGED IN & ACTIVE SUBSCRIPTION
           FULL PARTNER PORTAL UNLOCKED!
           ========================================== */
        <div className="space-y-6">
          {/* Dashboard Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => {
                setActivePartnerTab('add_seeker');
                setRegisteredSuccessInfo(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                activePartnerTab === 'add_seeker'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              ثبت‌نام کارجو جدید (موقت یا رسمی)
            </button>

            <button
              onClick={() => setActivePartnerTab('my_seekers')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 relative ${
                activePartnerTab === 'my_seekers'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              کارجویان ثبت‌شده توسط من
              <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-mono font-bold">
                {myRegisteredSeekers.length}
              </span>
            </button>

            <button
              onClick={() => setActivePartnerTab('subscription')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                activePartnerTab === 'subscription'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Award className="w-4 h-4" />
              اطلاعات اشتراک و تمدید
            </button>
          </div>

          {/* TAB 1: ADD SEEKER (User Request: قابلیت افزودن کارجو، ثبت نام موقت، نمایش نام همکار) */}
          {activePartnerTab === 'add_seeker' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-500" />
                    فرم ثبت‌نام کارجو توسط همکار ({currentPartner.companyName})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    کارجوی ثبت‌شده با کد همکاری <span className="font-mono font-bold text-indigo-400">{currentPartner.partnerCode}</span> در کارتابل شما و پنل مدیریت کارباما ثبت می‌شود.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                  همکار ثبت‌کننده: {currentPartner.companyName}
                </div>
              </div>

              {/* Success Notification after adding */}
              {registeredSuccessInfo && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>
                      {registeredSuccessInfo.isTemporary
                        ? `پیش‌ثبت‌نام موقت کارجو «${registeredSuccessInfo.fullName}» با موفقیت انجام شد.`
                        : `ثبت‌نام رسمی کارجو «${registeredSuccessInfo.fullName}» با موفقیت انجام شد.`}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    این کارجو با برچسب رسمی «ثبت‌شده توسط {currentPartner.companyName} (کد: {currentPartner.partnerCode})» در پنل مدیریت و سیستم ذخیره شد.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePartnerTab('my_seekers')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white underline hover:text-emerald-100 pt-1"
                  >
                    مشاهده در لیست کارجویان من
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleAddSeeker} className="space-y-5">
                {/* Mode Selector: Temporary vs Official (User Request: بتونه کارجو ثبت‌نام موقت کنه) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    نوع پرونده کارجو:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setIsTemporary(false)}
                      className={`cursor-pointer p-3.5 rounded-xl border-2 transition flex items-start gap-3 ${
                        !isTemporary
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="regType"
                        checked={!isTemporary}
                        onChange={() => setIsTemporary(false)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          ثبت‌نام قطعی و رسمی کارجو
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          مدارک کارجو آماده است و پرونده مستقیماً جهت مصاحبه کاری و اعزام ارسال می‌شود.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setIsTemporary(true)}
                      className={`cursor-pointer p-3.5 rounded-xl border-2 transition flex items-start gap-3 ${
                        isTemporary
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="regType"
                        checked={isTemporary}
                        onChange={() => setIsTemporary(true)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          پیش‌ثبت‌نام موقت کارجو
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          ثبت اولیه جهت استعلام کارفرما و بررسی شرایط قبل از تکمیل نهایی مدارک و تسویه حساب.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Seeker Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      نام و نام خانوادگی کارجو *
                    </label>
                    <input
                      type="text"
                      value={seekerFullName}
                      onChange={(e) => setSeekerFullName(e.target.value)}
                      placeholder="مثلاً علی مرادی"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      نام پدر
                    </label>
                    <input
                      type="text"
                      value={seekerFatherName}
                      onChange={(e) => setSeekerFatherName(e.target.value)}
                      placeholder="نام پدر"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      کد ملی ۱۰ رقمی *
                    </label>
                    <input
                      type="text"
                      value={seekerNationalId}
                      onChange={(e) => setSeekerNationalId(e.target.value)}
                      placeholder="۰۰۱۲۳۴۵۶۷۸"
                      maxLength={10}
                      dir="ltr"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      جنسیت
                    </label>
                    <select
                      value={seekerGender}
                      onChange={(e) => setSeekerGender(e.target.value as Gender)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="male">مرد</option>
                      <option value="female">زن</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      پیش‌شماره
                    </label>
                    <select
                      value={seekerCountryCode}
                      onChange={(e) => setSeekerCountryCode(e.target.value)}
                      dir="ltr"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="+90">+90 (ترکیه)</option>
                      <option value="+98">+98 (ایران)</option>
                      <option value="+49">+49 (آلمان)</option>
                      <option value="+964">+964 (عراق)</option>
                      <option value="+374">+374 (ارمنستان)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      شماره تماس / واتساپ *
                    </label>
                    <input
                      type="text"
                      value={seekerPhoneNumber}
                      onChange={(e) => setSeekerPhoneNumber(e.target.value)}
                      placeholder="534 000 0000"
                      dir="ltr"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Target Country & City */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      کشور مقصد
                    </label>
                    <select
                      value={seekerTargetCountry}
                      onChange={(e) => setSeekerTargetCountry(e.target.value as TargetCountry)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="ترکیه">ترکیه</option>
                      <option value="ارمنستان">ارمنستان</option>
                      <option value="عراق">عراق</option>
                      <option value="آلمان">آلمان</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      شهر مد نظر
                    </label>
                    <input
                      type="text"
                      value={seekerTargetCity}
                      onChange={(e) => setSeekerTargetCity(e.target.value)}
                      placeholder="استانبول، آنتالیا..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      سطح زبان
                    </label>
                    <select
                      value={seekerTurkishLevel}
                      onChange={(e) => setSeekerTurkishLevel(e.target.value as TurkishLevel)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="none">بدون آشنایی</option>
                      <option value="basic">مقدماتی</option>
                      <option value="intermediate">متوسط (مکالمه کاری)</option>
                      <option value="fluent">پیشرفته و روان</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      وضعیت اقامت / مدارک
                    </label>
                    <select
                      value={seekerResidence}
                      onChange={(e) => setSeekerResidence(e.target.value as ResidenceStatus)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="none">فقط پاسپورت ایران</option>
                      <option value="tourist">اقامت توریستی (کیملیک)</option>
                      <option value="work_permit">اجازه کار (چالیشما)</option>
                      <option value="student">اقامت دانشجویی</option>
                    </select>
                  </div>
                </div>

                {/* Job Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      حرفه و تخصص مد نظر (انتخاب از لیست)
                    </label>
                    <select
                      value={seekerJob}
                      onChange={(e) => setSeekerJob(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      {COMMON_PARTNER_JOBS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      یا حرفه اختصاصی دیگر
                    </label>
                    <input
                      type="text"
                      value={seekerCustomJob}
                      onChange={(e) => setSeekerCustomJob(e.target.value)}
                      placeholder="اگر در لیست نیست، اینجا بنویسید"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Partner Note for Admin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    یادداشت خصوصی همکار برای مدیریت کارباما (اختیاری)
                  </label>
                  <textarea
                    rows={2}
                    value={partnerNote}
                    onChange={(e) => setPartnerNote(e.target.value)}
                    placeholder="مثلاً: کارجو دارای تست آشپزی تایید شده است؛ نیاز فوری به اسکان دارد..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black rounded-2xl text-xs shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  {isTemporary
                    ? 'ثبت پیش‌ثبت‌نام موقت کارجو با شناسه این همکار'
                    : 'ثبت‌نام قطعی کارجو با شناسه این همکار'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY SEEKERS LIST (User Request: در قسمت کارجو و مدیریت نشان بده که توسط چه کسی ثبت‌نام شده) */}
          {activePartnerTab === 'my_seekers' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    کارجویان ثبت‌شده توسط «{currentPartner.companyName}»
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مجموعاً {myRegisteredSeekers.length} پرونده ثبت شده با کد همکاری {currentPartner.partnerCode}
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={seekerFilterQuery}
                    onChange={(e) => setSeekerFilterQuery(e.target.value)}
                    placeholder="جستجو در کارجویان من..."
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {filteredMySeekers.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400">هیچ کارجویی یافت نشد.</p>
                  <button
                    onClick={() => setActivePartnerTab('add_seeker')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    ثبت اولین کارجو
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMySeekers.map((seeker) => (
                    <div
                      key={seeker.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3 hover:border-indigo-500/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {seeker.fullName}
                            </h4>
                            {seeker.isTemporaryRegistration ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                                پیش‌ثبت‌نام موقت
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                ثبت‌نام قطعی
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            کد ملی: {seeker.nationalId} | {seeker.targetCountry} ({seeker.targetCity})
                          </p>
                        </div>

                        {seeker.verificationStatus === 'approved' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            تایید شده
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            در انتظار بررسی
                          </span>
                        )}
                      </div>

                      {/* Partner Tag Badge (as requested: در قسمت کارجو و مدیریت نشان بده که توسط چه کسی ثبت شده) */}
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-center justify-between">
                        <span className="font-semibold">
                          ثبت‌شده توسط همکار: {seeker.registeredByPartnerName || currentPartner.companyName}
                        </span>
                        <span className="font-mono font-bold text-indigo-200">
                          {seeker.registeredByPartnerCode || currentPartner.partnerCode}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p>تخصص: <span className="font-bold">{seeker.customProfession || seeker.skills?.[0] || 'عمومی'}</span></p>
                        {seeker.partnerInternalNote && (
                          <p className="text-[11px] text-slate-400 italic">
                            یادداشت همکار: {seeker.partnerInternalNote}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          تماس: <span className="font-mono text-slate-300" dir="ltr">{seeker.phone}</span>
                        </span>
                        {seeker.phone && (
                          <a
                            href={`https://wa.me/${seeker.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            واتساپ
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION DETAILS & RENEWAL */}
          {activePartnerTab === 'subscription' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                مشخصات اشتراک همکار و وضعیت پنل
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                  <p className="text-xs text-indigo-400 font-bold">پلن فعال فعلی</p>
                  <p className="text-base font-black text-white">{currentPartner.planTitle || 'اشتراک همکار'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <p className="text-xs text-emerald-400 font-bold">اعتبار باقیمانده</p>
                  <p className="text-base font-black text-white">{currentPartner.daysRemaining || 30} روز کاری</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <p className="text-xs text-amber-400 font-bold">کد یکتای همکاری</p>
                  <p className="text-base font-mono font-black text-white">{currentPartner.partnerCode}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">قوانین و دسترسی‌های پنل همکاران:</p>
                <ul className="space-y-1 text-slate-400 list-disc pr-4">
                  <li>امکان ثبت نامحدود کارجویان موقت و رسمی تا پایان دوره اشتراک.</li>
                  <li>کلیه کارجویان ثبت‌شده با نام و برند موسسه شما به کارفرمایان ترکیه معرفی می‌شوند.</li>
                  <li>تغییر تعرفه‌های اشتراک توسط مدیریت در هر زمان در داشبورد همکاران منعکس می‌گردد.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
