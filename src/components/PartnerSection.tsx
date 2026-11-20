import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  checkPasswordStrength,
  validateEmail,
  validatePhoneNumber,
  validateIranianBankCard,
  validateIranianNationalId,
} from '../utils/validators';
import { sanitizeNumericOnly, sanitizeCardNumber } from '../utils/inputUtils';
import { getDistrictsForCity } from '../data/turkeyData';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import { Gender, JobSeeker, JobVacancy, JobCategory, TurkishLevel, TargetCountry } from '../types';
import {
  Users,
  CheckCircle,
  PlusCircle,
  Building2,
  Phone,
  User,
  Key,
  AlertCircle,
  Lock,
  LogOut,
  Search,
  Briefcase,
  Mail,
  Edit,
  Trash2,
  DollarSign,
  MapPin,
  Save,
  X,
  IdCard,
  FileText,
  Upload,
  Send,
  MessageSquare,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { SHAPARAK_LOGO_DATA_URI, SEP_LOGO_DATA_URI } from '../utils/brandAssets';

export const PartnerSection: React.FC = () => {
  const {
    currentPartner,
    partners,
    partnerPlans,
    paymentSettings,
    isPartnerLoggedIn,
    loginPartner,
    registerPartner,
    logoutPartner,
    recoverPassword,
    submitPartnerSubscriptionPayment,
    registerSeekerByPartner,
    updateSeekerRecord,
    deleteSeekerRecord,
    jobSeekers,
    jobs,
    addJob,
    updateJob,
    deleteJob,
    applications,
    updateApplicationStatus,
    activeSeekerChat,
    requestLiveChat,
    sendLiveChatMessage,
    showToast,
    setActiveTab,
    isAdminLoggedIn,
    liveRates,
    refreshLiveRates,
    formatTryToIrr,
  } = useApp();

  const liveTryToman = liveRates?.tryToman || paymentSettings?.exchangeRateToman || 3410;
  const liveTryRial = liveRates?.tryRial || liveTryToman * 10;
  const getLivePlanToman = (pl?: { priceTL?: number; priceToman?: number } | null) =>
    pl ? Math.round((pl.priceTL || 1500) * liveTryToman) : 0;
  const getLivePlanRial = (pl?: { priceTL?: number; priceToman?: number } | null) =>
    getLivePlanToman(pl) * 10;

  // Partner Dashboard Active Tab (when unlocked)
  const [partnerDashTab, setPartnerDashTab] = useState<'seekers' | 'jobs' | 'applications' | 'chat'>('seekers');

  // Partner Subscription Manual Receipt / Ref State
  const [partnerPayRefInput, setPartnerPayRefInput] = useState('');
  const [partnerPayReceiptPhoto, setPartnerPayReceiptPhoto] = useState<string | null>(null);

  // Partner Job Management State
  const [partnerJobTitle, setPartnerJobTitle] = useState('');
  const [partnerJobCity, setPartnerJobCity] = useState(currentPartner?.city || 'استانبول');
  const [partnerJobDistrict, setPartnerJobDistrict] = useState('فاتیح (Fatih)');
  const [partnerJobCategory, setPartnerJobCategory] = useState<JobCategory>('textile');
  const [partnerJobSalaryMin, setPartnerJobSalaryMin] = useState(32000);
  const [partnerJobSalaryMax, setPartnerJobSalaryMax] = useState(42000);
  const [partnerJobDesc, setPartnerJobDesc] = useState('');
  const [partnerJobAccommodation, setPartnerJobAccommodation] = useState(true);
  const [partnerJobMeals, setPartnerJobMeals] = useState(true);
  const [editingPartnerJob, setEditingPartnerJob] = useState<JobVacancy | null>(null);
  const [partnerChatInput, setPartnerChatInput] = useState('');

  // Auth form states (if not logged in)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotNewPassInput, setForgotNewPassInput] = useState('');
  const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string } | null>(null);
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCardNumber, setRegCardNumber] = useState('');
  const [regCity, setRegCity] = useState('استانبول');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedActivationPlanId, setSelectedActivationPlanId] = useState<'1_month' | '3_months' | '6_months' | '1_year'>(
    currentPartner?.planId || '1_month'
  );

  const partnerPassCheck = checkPasswordStrength(regPassword);
  const regNatIdLiveCheck = regNationalId.trim().length > 0 ? validateIranianNationalId(regNationalId) : null;
  const regPhoneLiveCheck = regPhone.trim().length > 0 ? validatePhoneNumber(regPhone, '+98') : null;
  const regEmailLiveCheck = regEmail.trim().length > 0 ? validateEmail(regEmail) : null;
  const regCardLiveCheck = regCardNumber.trim().length > 0 ? validateIranianBankCard(regCardNumber) : null;

  // Add Seeker form states (Simple & Focused)
  const [showAddForm, setShowAddForm] = useState(true);
  const [seekerFullName, setSeekerFullName] = useState('');
  const [seekerFatherName, setSeekerFatherName] = useState('');
  const [seekerNationalId, setSeekerNationalId] = useState('');
  const [seekerGender, setSeekerGender] = useState<Gender>('male');
  const [seekerCountryCode, setSeekerCountryCode] = useState('+98');
  const [seekerPhoneNumber, setSeekerPhoneNumber] = useState('');
  const [seekerTargetCountry, setSeekerTargetCountry] = useState<TargetCountry>('ترکیه');
  const [seekerTargetCity, setSeekerTargetCity] = useState('استانبول');
  const [seekerTargetDistrict, setSeekerTargetDistrict] = useState('فاتیح (Fatih)');

  // Selected Job by Seeker
  const activeJobs = jobs.filter((j) => j.isActive);
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobs[0]?.id || 'custom');
  const [customJobTitle, setCustomJobTitle] = useState('');

  // Paid Amount by Seeker
  const [seekerPaidAmount, setSeekerPaidAmount] = useState('');
  const [seekerPaymentCurrency, setSeekerPaymentCurrency] = useState<'IRT' | 'TRY' | 'USD'>('IRT');
  const [seekerPaymentStatus, setSeekerPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [partnerNote, setPartnerNote] = useState('');

  // Editing existing seeker state
  const [editingSeeker, setEditingSeeker] = useState<JobSeeker | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Search in my seekers
  const [seekerFilterQuery, setSeekerFilterQuery] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginPartner(loginUsername, loginPassword);
    if (!res.success) {
      setAuthError(res.error || 'نام کاربری یا رمز عبور همکار اشتباه است.');
    }
  };

  const seekerNatIdLiveCheck = seekerNationalId.trim().length > 0 ? validateIranianNationalId(seekerNationalId) : null;
  const seekerPhoneLiveCheck = seekerPhoneNumber.trim().length > 0 ? validatePhoneNumber(seekerPhoneNumber, seekerCountryCode) : null;

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const natCheck = validateIranianNationalId(regNationalId);
    if (!natCheck.isValid) {
      setAuthError(natCheck.error || 'کد ملی وارد شده معتبر نیست.');
      return;
    }

    const phoneCheck = validatePhoneNumber(regPhone, '+98');
    if (!phoneCheck.isValid) {
      setAuthError(phoneCheck.error || 'شماره موبایل وارد شده معتبر نیست (باید با 09 شروع شود).');
      return;
    }

    const emailCheck = validateEmail(regEmail);
    if (!emailCheck.isValid) {
      setAuthError(emailCheck.error || 'لطفاً یک آدرس ایمیل معتبر وارد کنید.');
      return;
    }

    const cardCheck = validateIranianBankCard(regCardNumber);
    if (!cardCheck.isValid) {
      setAuthError(cardCheck.error || 'شماره کارت بانکی ۱۶ رقمی وارد شده معتبر نیست.');
      return;
    }

    if (!partnerPassCheck.isValid) {
      setAuthError(
        partnerPassCheck.error ||
          'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و اعداد انگلیسی باشد.'
      );
      return;
    }

    const res = registerPartner({
      companyName: regCompanyName,
      fullName: regFullName,
      nationalId: regNationalId,
      phone: regPhone,
      email: regEmail,
      cardNumber: regCardNumber,
      city: regCity,
      username: regUsername,
      password: regPassword,
    });
    if (!res.success) {
      setAuthError(res.error || 'خطا در ثبت‌نام همکار');
    }
  };

  // Resolve selected job title
  const getResolvedJobTitle = (): string => {
    if (selectedJobId === 'custom' || !selectedJobId) {
      return customJobTitle.trim() || 'کار عمومی';
    }
    const foundJob = jobs.find((j) => j.id === selectedJobId);
    if (foundJob) {
      return `${foundJob.title} (${foundJob.city} - ${foundJob.company})`;
    }
    return customJobTitle.trim() || 'کار عمومی';
  };

  // Handle Add Seeker Submit
  const handleAddSeeker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seekerFullName.trim() || !seekerNationalId.trim() || !seekerPhoneNumber.trim()) {
      showToast('لطفاً نام و نام خانوادگی، کد ملی و شماره تماس کارجو را وارد کنید.', 'error');
      return;
    }

    const natCheck = validateIranianNationalId(seekerNationalId);
    if (!natCheck.isValid) {
      showToast(natCheck.error || 'کد ملی کارجو معتبر نیست.', 'error');
      return;
    }

    const phoneCheck = validatePhoneNumber(seekerPhoneNumber, seekerCountryCode);
    if (!phoneCheck.isValid) {
      showToast(phoneCheck.error || 'شماره موبایل کارجو معتبر نیست.', 'error');
      return;
    }

    const cleanNatId = seekerNationalId.replace(/\D/g, '');
    const finalJobTitle = getResolvedJobTitle();

    const res = registerSeekerByPartner({
      fullName: seekerFullName.trim(),
      fatherName: seekerFatherName.trim() || '---',
      nationalId: cleanNatId,
      gender: seekerGender,
      phoneCountryCode: seekerCountryCode,
      phoneNumber: seekerPhoneNumber.trim(),
      phone: `${seekerCountryCode} ${seekerPhoneNumber.trim()}`,
      targetCountry: seekerTargetCountry,
      targetCity: seekerTargetCity,
      targetDistrict: seekerTargetDistrict,
      skills: [finalJobTitle],
      selectedJobs: [finalJobTitle],
      customProfession: finalJobTitle,
      selectedJobId: selectedJobId === 'custom' ? '' : selectedJobId,
      selectedJobTitle: finalJobTitle,
      seekerPaidAmount: seekerPaidAmount.trim() || '۰',
      seekerPaymentCurrency,
      seekerPaymentStatus,
      turkishLevel: 'basic',
      residenceStatus: 'none',
      isTemporaryRegistration: false,
      partnerInternalNote: partnerNote.trim(),
    });

    if (res.success) {
      setSeekerFullName('');
      setSeekerFatherName('');
      setSeekerNationalId('');
      setSeekerPhoneNumber('');
      setCustomJobTitle('');
      setSeekerPaidAmount('');
      setPartnerNote('');
    }
  };

  // Handle Save Edited Seeker
  const handleSaveEditSeeker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeeker) return;

    const jobTitle = editingSeeker.selectedJobTitle || editingSeeker.customProfession || 'کار عمومی';
    updateSeekerRecord(editingSeeker.id, {
      fullName: editingSeeker.fullName.trim(),
      fatherName: editingSeeker.fatherName.trim(),
      nationalId: editingSeeker.nationalId.trim(),
      phone: editingSeeker.phone,
      targetCity: editingSeeker.targetCity,
      targetDistrict: editingSeeker.targetDistrict,
      selectedJobId: editingSeeker.selectedJobId,
      selectedJobTitle: jobTitle,
      customProfession: jobTitle,
      selectedJobs: [jobTitle],
      skills: [jobTitle],
      seekerPaidAmount: editingSeeker.seekerPaidAmount || '۰',
      seekerPaymentCurrency: editingSeeker.seekerPaymentCurrency || 'IRT',
      seekerPaymentStatus: editingSeeker.seekerPaymentStatus || 'paid',
      partnerInternalNote: editingSeeker.partnerInternalNote,
    });
    setEditingSeeker(null);
  };

  const currencyLabel = (c?: 'IRT' | 'TRY' | 'USD') => {
    if (c === 'TRY') return 'لیر ترکیه';
    if (c === 'USD') return 'دلار';
    return 'تومان';
  };

  const paymentStatusBadge = (status?: JobSeeker['seekerPaymentStatus']) => {
    if (status === 'partial') {
      return (
        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
          پیش‌پرداخت / بیعانه
        </span>
      );
    }
    if (status === 'unpaid' || status === 'rejected') {
      return (
        <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
          {status === 'rejected' ? 'رد پرداخت ❌' : 'در انتظار پرداخت'}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
        تسویه کامل ✓
      </span>
    );
  };

  // Completely hide Partner Section for Job Seeker accounts
  const { currentSeeker: activeSeeker } = useApp();
  const isJobSeekerView = Boolean(activeSeeker && !isAdminLoggedIn);

  if (isJobSeekerView) {
    return null;
  }

  // If neither Partner nor Admin is logged in -> Simple Login / Register
  if ((!isPartnerLoggedIn || !currentPartner) && !isAdminLoggedIn) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-4">
        <div className="rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 text-white shadow-xl text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            پنل ساده همکاران کارباما
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            مدیریت کارجویان ثبت‌شده توسط همکار
          </h1>
          <p className="text-xs text-slate-300">
            ثبت مشخصات کارجو، کار انتخاب‌شده توسط کارجو و مبلغ پرداختی کارجو
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex border-b border-slate-800 mb-5 gap-2">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError(null);
              }}
              className={`pb-2.5 px-4 font-bold text-xs transition ${
                authTab === 'login'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ورود همکار
            </button>
            <button
              onClick={() => {
                setAuthTab('register');
                setAuthError(null);
              }}
              className={`pb-2.5 px-4 font-bold text-xs transition ${
                authTab === 'register'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ثبت‌نام همکار جدید
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  نام کاربری همکار
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="username"
                    dir="ltr"
                    required
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">رمز عبور</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotResult(null);
                      setForgotEmailInput('');
                      setForgotNewPassInput('');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
                  >
                    فراموشی رمز عبور همکار؟
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    required
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
              >
                ورود به پنل همکار
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthTab('register');
                }}
                className="w-full py-2.5 bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-500/40 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                حساب ندارید؟ ثبت‌نام همکار
              </button>

              {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                  <div className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-sm font-bold text-indigo-300">
                        بازیابی رمز عبور همکار (با ایمیل)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      آدرس ایمیل ثبت‌شده هنگام ثبت‌نام همکار را وارد نمایید تا رمز عبور شما از طریق سرور ایمیل رسمی (mail.karbama34.ir) بازیابی یا بازنشانی گردد.
                    </p>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">سرور ایمیل احراز هویت همکاران:</span>
                      <span className="font-mono font-bold text-emerald-400" dir="ltr">mail.karbama34.ir</span>
                    </div>
                    {forgotResult && (
                      <div
                        className={`p-3 rounded-xl text-xs font-bold ${
                          forgotResult.success
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/20 border border-red-500/40 text-red-300'
                        }`}
                      >
                        {forgotResult.message}
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          آدرس ایمیل همکار (یا نام کاربری)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={forgotEmailInput}
                          onChange={(e) => setForgotEmailInput(e.target.value)}
                          placeholder="partner@gmail.com"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          رمز عبور جدید (اختیاری - جهت تغییر مستقیم)
                        </label>
                        <input
                          type="password"
                          dir="ltr"
                          value={forgotNewPassInput}
                          onChange={(e) => setForgotNewPassInput(e.target.value)}
                          placeholder="رمز جدید (حداقل ۶ کاراکتر)"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-left"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                      >
                        بستن
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!forgotEmailInput.trim()) return;
                          const res = recoverPassword(
                            forgotEmailInput,
                            'partner',
                            forgotNewPassInput.trim() ? forgotNewPassInput.trim() : undefined
                          );
                          setForgotResult({
                            success: res.success,
                            message: res.message || res.error || '',
                          });
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                      >
                        تایید ایمیل و بازیابی رمز
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نام دفتر / شرکت همکار *
                  </label>
                  <input
                    type="text"
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    placeholder="مثلاً دفتر کاریابی امید"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نام و نام خانوادگی همکار *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="نام کامل"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    کد ملی ۱۰ رقمی همکار *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    value={regNationalId}
                    onChange={(e) => setRegNationalId(sanitizeNumericOnly(e.target.value, 10))}
                    placeholder="0012345678"
                    dir="ltr"
                    required
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-xs text-white font-mono outline-none ${
                      regNatIdLiveCheck && !regNatIdLiveCheck.isValid
                        ? 'border-red-500 ring-1 ring-red-500/50'
                        : regNatIdLiveCheck?.isValid
                        ? 'border-emerald-500'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {regNatIdLiveCheck && !regNatIdLiveCheck.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{regNatIdLiveCheck.error}</span>
                    </p>
                  )}
                  {regNatIdLiveCheck?.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>کد ملی معتبر است.</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    شماره موبایل معتبر ایران (با 09) *
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    inputMode="numeric"
                    value={regPhone}
                    onChange={(e) => setRegPhone(sanitizeNumericOnly(e.target.value, 11))}
                    placeholder="09123456789"
                    dir="ltr"
                    required
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-xs text-white font-mono outline-none ${
                      regPhoneLiveCheck && !regPhoneLiveCheck.isValid
                        ? 'border-red-500 ring-1 ring-red-500/50'
                        : regPhoneLiveCheck?.isValid
                        ? 'border-emerald-500'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {regPhoneLiveCheck && !regPhoneLiveCheck.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{regPhoneLiveCheck.error}</span>
                    </p>
                  )}
                  {regPhoneLiveCheck?.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>شماره موبایل معتبر است {regPhoneLiveCheck.operatorName ? `(${regPhoneLiveCheck.operatorName})` : ''}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ایمیل معتبر (جهت بازیابی رمز) *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value.trim())}
                    placeholder="email@gmail.com"
                    dir="ltr"
                    required
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-xs text-white font-mono outline-none ${
                      regEmailLiveCheck && !regEmailLiveCheck.isValid
                        ? 'border-red-500 ring-1 ring-red-500/50'
                        : regEmailLiveCheck?.isValid
                        ? 'border-emerald-500'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {regEmailLiveCheck && !regEmailLiveCheck.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{regEmailLiveCheck.error}</span>
                    </p>
                  )}
                  {regEmailLiveCheck?.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>ساختار ایمیل معتبر است.</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    شماره کارت بانکی ۱۶ رقمی (شتاب) *
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    inputMode="numeric"
                    value={regCardNumber}
                    onChange={(e) => setRegCardNumber(sanitizeCardNumber(e.target.value))}
                    placeholder="6037991234567890"
                    dir="ltr"
                    required
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-xs text-white font-mono tracking-widest outline-none ${
                      regCardLiveCheck && !regCardLiveCheck.isValid
                        ? 'border-red-500 ring-1 ring-red-500/50'
                        : regCardLiveCheck?.isValid
                        ? 'border-emerald-500'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {regCardLiveCheck && !regCardLiveCheck.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{regCardLiveCheck.error}</span>
                    </p>
                  )}
                  {regCardLiveCheck?.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>کارت معتبر ({regCardLiveCheck.bankName})</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نام کاربری ورود *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="partner_user"
                    dir="ltr"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رمز عبور (۸ کاراکتر شامل حروف بزرگ، کوچک و عدد) *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Abc12345"
                    dir="ltr"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
              >
                ثبت‌نام همکار و ادامه جهت پرداخت آنلاین اشتراک
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Enforce Paid Activation Requirement for Partner Account (unless Admin is logged in)
  if (currentPartner && !isAdminLoggedIn && currentPartner.subscriptionStatus !== 'active') {
    const activePlan =
      partnerPlans.find((pl) => pl.id === selectedActivationPlanId) ||
      partnerPlans.find((pl) => pl.id === currentPartner.planId) ||
      partnerPlans[0];
    const isPendingApproval = currentPartner.subscriptionStatus === 'pending_approval';
    const isRejected =
      currentPartner.subscriptionStatus === 'rejected' ||
      currentPartner.paymentStatus === 'rejected' ||
      (currentPartner.subscriptionStatus === 'unpaid' && Boolean(currentPartner.adminApprovalNote));

    const handlePartnerOnlinePayment = () => {
      const unit = paymentSettings.paymentAmountUnit || 'toman';
      const livePlanToman = activePlan ? getLivePlanToman(activePlan) : Math.round(1500 * liveTryToman);
      const adminConfiguredAmount = unit === 'toman' ? livePlanToman : livePlanToman * 10;

      try {
        localStorage.setItem(
          'karbama_pending_partner_payment',
          JSON.stringify({
            partnerId: currentPartner.id,
            planId: activePlan?.id || '1_month',
          })
        );
      } catch {
        // ignore
      }

      if (unit === 'toman') {
        window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}&unit=toman`;
      } else {
        window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}`;
      }
    };

    const handlePartnerReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPartnerPayReceiptPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    };

    const handleSubmitPartnerPaymentToAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (!partnerPayRefInput.trim() && !partnerPayReceiptPhoto) {
        showToast('لطفاً شماره پیگیری تراکنش را وارد کنید یا تصویر فیش واریزی را انتخاب نمایید.', 'error');
        return;
      }
      const cleanRef = partnerPayRefInput.trim() || `PART-REF-${Date.now().toString().slice(-6)}`;
      submitPartnerSubscriptionPayment(
        activePlan?.id || '1_month',
        'sepal',
        partnerPayReceiptPhoto || undefined,
        cleanRef,
        currentPartner.fullName
      );
      setPartnerPayRefInput('');
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        {/* Partner Header Card */}
        <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  حساب همکار: {currentPartner.companyName}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-[11px] font-mono font-bold text-indigo-300">
                  کد همکاری: {currentPartner.partnerCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نماینده: {currentPartner.fullName} | شهر: {currentPartner.city || 'استانبول'}
              </p>
            </div>
          </div>

          <button
            onClick={logoutPartner}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب همکار</span>
          </button>
        </div>

        {/* Locked Activation Gate */}
        <div className={`bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl space-y-5 ${
          isRejected ? 'border-red-500/70' : 'border-amber-500/40'
        }`}>
          <div className="flex items-start gap-3.5 border-b border-slate-800 pb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isRejected
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            }`}>
              {isRejected ? <XCircle className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isRejected ? 'عدم تایید پرداخت اشتراک همکار' : 'فعال‌سازی پنل و اشتراک همکار'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                    isPendingApproval
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isRejected
                        ? 'bg-red-500/25 text-red-200 border-red-500/50'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {isPendingApproval
                    ? '⏳ در انتظار تایید مدیریت'
                    : isRejected
                      ? '❌ رد پرداخت توسط مدیریت'
                      : '🔒 غیرفعال (نیازمند پرداخت آنلاین)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                همکار گرامی، امکانات پنل همکاری (ثبت کارجو، ثبت آگهی استخدام، مشاهده رزومه‌ها و گفتگوی آنلاین) تا زمان تکمیل پرداخت اشتراک و تایید نهایی توسط مدیریت غیرفعال می‌باشد.
              </p>
            </div>
          </div>

          {isRejected && (
            <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500/70 text-xs text-red-100 space-y-1.5 shadow-lg">
              <div className="flex items-center gap-2 font-black text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>اطلاعیه مدیریت: پرداخت اشتراک شما مورد تایید قرار نگرفت</span>
              </div>
              <p className="font-bold text-white leading-relaxed">
                علت رد پرداخت: {currentPartner.adminApprovalNote || 'عدم تطابق مبلغ واریزی با پلن انتخابی یا نامعتبر بودن شماره پیگیری تراکنش.'}
              </p>
              <p className="text-[11px] text-red-200/90 leading-relaxed">
                شما می‌توانید همین حالا پلن اشتراک مورد نظر را انتخاب کرده و از طریق درگاه آنلاین پرداخت را مجدداً انجام دهید و یا شماره پیگیری / تصویر فیش معتبر را ارسال نمایید.
              </p>
            </div>
          )}

          {isPendingApproval && (
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-black text-amber-300">
                پرداخت اشتراک شما ثبت شد و در انتظار تایید مدیریت است
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                اطلاعات پرداخت حق اشتراک شما برای مدیریت ارسال گردیده است. به محض بررسی و تایید توسط مدیر سامانه، پنل همکاری شما به صورت خودکار و آنی فعال خواهد شد.
              </p>
              {currentPartner.paymentReferenceId && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-xs">
                  <span className="text-slate-400">وضعیت / کد رهگیری:</span>
                  <span className="font-mono font-bold text-amber-300">{currentPartner.paymentReferenceId}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {/* Live Exchange Rate Banner for Partner Payment */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-bold">نرخ لحظه‌ای محاسبه اشتراک همکار:</span>
                <span className="font-mono font-black text-emerald-400">
                  ۱ لیر ترکیه (₺) = {liveTryToman.toLocaleString('fa-IR')} تومان ({liveTryRial.toLocaleString('fa-IR')} ریال)
                </span>
              </div>
              <button
                type="button"
                onClick={() => refreshLiveRates(false)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${liveRates?.isRefreshing ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی نرخ لحظه‌ای</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                انتخاب دوره اشتراک پنل همکاری (محاسبه زنده بر اساس نرخ لحظه‌ای لیر به تومان و ریال):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partnerPlans.map((pl) => {
                  const isSelected = selectedActivationPlanId === pl.id;
                  const liveToman = getLivePlanToman(pl);
                  const liveRial = getLivePlanRial(pl);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => setSelectedActivationPlanId(pl.id)}
                      className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/25 border-2 border-indigo-400 text-white shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs sm:text-sm font-black text-white">{pl.title}</span>
                        {pl.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            {pl.badge}
                          </span>
                        )}
                      </div>
                      <div className="w-full pt-1.5 border-t border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-mono font-black text-emerald-400">
                            {liveToman.toLocaleString('fa-IR')} تومان
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-300">
                            {pl.priceTL.toLocaleString('fa-IR')} لیر (₺)
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 text-right">
                          معادل ریال: {liveRial.toLocaleString('fa-IR')} ریال
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-300 shadow-xs shrink-0">
                    <img
                      src={SHAPARAK_LOGO_DATA_URI}
                      alt="شاپرک"
                      className="w-6 h-6 rounded object-contain shrink-0"
                    />
                    <span className="w-px h-5 bg-slate-300" />
                    <img
                      src={SEP_LOGO_DATA_URI}
                      alt="پرداخت الکترونیک سامان (سپ)"
                      className="w-6 h-6 rounded object-contain shrink-0"
                    />
                  </div>
                  <span className="text-xs font-black text-emerald-300">
                    روش اول: پرداخت آنلاین آنی (شاپرک و پرداخت سپ)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  نرخ لحظه‌ای زنده
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">پلن انتخابی جهت فعال‌سازی:</span>
                <span className="font-bold text-white">
                  {activePlan?.title} ({activePlan?.priceTL.toLocaleString('fa-IR')} لیر)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="text-slate-400">مبلغ قابل پرداخت در درگاه آنلاین (به نرخ لحظه‌ای):</span>
                <div className="text-left">
                  <span className="font-mono font-black text-emerald-400 text-sm block">
                    {getLivePlanToman(activePlan).toLocaleString('fa-IR')} تومان
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 block">
                    ({getLivePlanRial(activePlan).toLocaleString('fa-IR')} ریال)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePartnerOnlinePayment}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-sm shadow-xl shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-5 h-5" />
                <span>{isRejected ? 'تلاش مجدد پرداخت آنلاین اشتراک همکار' : 'پرداخت آنلاین و فعال‌سازی پنل همکار'}</span>
              </button>
            </div>

            {/* Submit Payment Reference / Receipt Photo for Partner (Temporarily Disabled) */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/40 space-y-3 select-none">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold text-slate-400 line-through">
                  روش دوم: ثبت کد پیگیری یا تصویر فیش واریزی اشتراک همکار
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                  موقتاً غیرفعال
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs font-bold text-amber-200 leading-relaxed">
                ⚠️ این حالت موقتاً غیرفعال می‌باشد. لطفاً فقط از طریق دکمه «پرداخت آنلاین» درگاه بانکی بالا اقدام فرمایید.
              </div>

              <div className="flex flex-col sm:flex-row gap-2 opacity-45 pointer-events-none">
                <input
                  type="text"
                  disabled
                  value=""
                  placeholder="این حالت موقتاً غیرفعال می‌باشد..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
                <div className="px-4 py-2.5 bg-slate-900 text-slate-500 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed shrink-0">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>بارگذاری فیش (غیرفعال)</span>
                </div>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-2.5 bg-slate-800 text-slate-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>این حالت موقتاً غیرفعال می‌باشد</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Partner Object (or Admin fallback)
  const activePartner = currentPartner ||
    partners[0] || {
      id: 'partner-admin',
      partnerCode: 'PART-ADMIN',
      companyName: 'مدیریت همکاران',
      fullName: 'مدیر سامانه',
      phone: '',
      city: 'استانبول',
    };

  // Seekers registered by this partner (or all partner seekers if Admin)
  const myRegisteredSeekers = jobSeekers.filter((s) => {
    if (isAdminLoggedIn && !currentPartner) {
      return s.registeredByRole === 'partner' || Boolean(s.registeredByPartnerId);
    }
    return (
      s.registeredByPartnerId === activePartner.id ||
      s.registeredByPartnerCode === activePartner.partnerCode
    );
  });

  const filteredMySeekers = myRegisteredSeekers.filter((s) => {
    if (!seekerFilterQuery.trim()) return true;
    const q = seekerFilterQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.nationalId.includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.selectedJobTitle && s.selectedJobTitle.toLowerCase().includes(q)) ||
      (s.targetCity && s.targetCity.toLowerCase().includes(q))
    );
  });

  const handleCreatePartnerJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerJobTitle.trim() || !partnerJobDesc.trim()) {
      showToast('لطفاً عنوان شغل و شرح وظایف را وارد نمایید.', 'error');
      return;
    }
    addJob({
      title: partnerJobTitle.trim(),
      company: activePartner.companyName,
      city: partnerJobCity,
      district: partnerJobDistrict,
      category: partnerJobCategory,
      subcategory: partnerJobTitle.trim(),
      contractType: 'full_time',
      payFrequency: 'monthly',
      keywords: [partnerJobTitle.trim(), partnerJobCity, activePartner.companyName],
      salaryMin: Number(partnerJobSalaryMin) || 30000,
      salaryMax: Number(partnerJobSalaryMax) || 40000,
      currency: 'TRY',
      accommodation: partnerJobAccommodation,
      meals: partnerJobMeals,
      hasLeave: true,
      leaveDetails: '۱ روز در هفته',
      workPermitSupport: true,
      turkishRequired: 'basic',
      gender: 'all',
      description: partnerJobDesc.trim(),
      requirements: ['مسئولیت‌پذیری و نظم کاری'],
      contactPhone: activePartner.phone || '+90 501 069 3816',
      contactWhatsapp: activePartner.phone || '+90 501 069 3816',
      isActive: true,
    });
    setPartnerJobTitle('');
    setPartnerJobDesc('');
  };

  const handleSaveEditedPartnerJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartnerJob) return;
    updateJob(editingPartnerJob.id, editingPartnerJob);
    setEditingPartnerJob(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Simple Partner Top Bar */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  پنل همکار: {activePartner.companyName}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-[11px] font-mono font-bold text-indigo-300">
                  کد: {activePartner.partnerCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                  اشتراک فعال و تاییدشده ✓
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مدیریت یکپارچه کارجویان، ثبت و ویرایش آگهی‌های استخدام، بررسی رزومه‌ها و گفتگوی آنلاین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>کارجویان ثبت‌شده من:</span>
              <span className="text-amber-400 font-mono text-sm">{myRegisteredSeekers.length} نفر</span>
            </div>

            {currentPartner && (
              <button
                onClick={logoutPartner}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 transition cursor-pointer"
                title="خروج از حساب همکار"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Unified Partner Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setPartnerDashTab('seekers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              partnerDashTab === 'seekers'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>کارجویان ثبت‌شده ({myRegisteredSeekers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPartnerDashTab('jobs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              partnerDashTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>ثبت و مدیریت آگهی‌های شغلی ({jobs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPartnerDashTab('applications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              partnerDashTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>درخواست‌های کاری کارجویان ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPartnerDashTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              partnerDashTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>گفتگوی آنلاین با متقاضیان و مدیریت</span>
          </button>
        </div>
      </div>

      {/* TAB 2: PARTNER JOB POSTING & MANAGEMENT */}
      {partnerDashTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>ثبت آگهی استخدام جدید در سامانه</span>
            </h3>
            <form onSubmit={handleCreatePartnerJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عنوان شغل *</label>
                  <input
                    type="text"
                    required
                    value={partnerJobTitle}
                    onChange={(e) => setPartnerJobTitle(e.target.value)}
                    placeholder="مثلاً چرخکار ماهر، جوشکار، سالن‌کار..."
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر محل کار</label>
                  <select
                    value={partnerJobCity}
                    onChange={(e) => {
                      const c = e.target.value;
                      setPartnerJobCity(c);
                      const dists = getDistrictsForCity(c);
                      if (dists.length > 0) setPartnerJobDistrict(dists[0]);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">دسته‌بندی شغلی</label>
                  <select
                    value={partnerJobCategory}
                    onChange={(e) => setPartnerJobCategory(e.target.value as JobCategory)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="textile">خیاطی، نساجی و پوشاک</option>
                    <option value="warehouse">کارخانه، بسته‌بندی و انبار</option>
                    <option value="restaurant">رستوران و کافه</option>
                    <option value="hotel">هتل و گردشگری</option>
                    <option value="construction">ساختمان و فنی</option>
                    <option value="sales">فروشندگی و خدمات</option>
                    <option value="general">کارگر ساده و عمومی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداقل حقوق (لیر)</label>
                  <input
                    type="number"
                    value={partnerJobSalaryMin}
                    onChange={(e) => setPartnerJobSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono font-bold"
                  />
                  {partnerJobSalaryMin > 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                      ≈ {formatTryToIrr(partnerJobSalaryMin).tomanText}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداکثر حقوق (لیر)</label>
                  <input
                    type="number"
                    value={partnerJobSalaryMax}
                    onChange={(e) => setPartnerJobSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono font-bold"
                  />
                  {partnerJobSalaryMax > 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                      ≈ {formatTryToIrr(partnerJobSalaryMax).tomanText}
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={partnerJobAccommodation}
                    onChange={(e) => setPartnerJobAccommodation(e.target.checked)}
                  />
                  <span>دارای جای خواب رایگان</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={partnerJobMeals}
                    onChange={(e) => setPartnerJobMeals(e.target.checked)}
                  />
                  <span>دارای وعده غذایی</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">شرح کامل موقعیت شغلی و شرایط *</label>
                <textarea
                  rows={3}
                  required
                  value={partnerJobDesc}
                  onChange={(e) => setPartnerJobDesc(e.target.value)}
                  placeholder="ساعت کاری، شرایط اسکان، مزایا و مهارت‌های مورد نیاز را بنویسید..."
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ثبت و انتشار فوری آگهی شغلی</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>لیست آگهی‌های شغلی فعال ({jobs.length} مورد)</span>
            </h3>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{job.title}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                        {job.city} ({job.district})
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                        {job.salaryMin.toLocaleString('fa-IR')} تا {job.salaryMax.toLocaleString('fa-IR')} لیر
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-1">{job.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingPartnerJob({ ...job })}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteJob(job.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editingPartnerJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-black text-white">ویرایش آگهی: {editingPartnerJob.title}</h4>
                  <button type="button" onClick={() => setEditingPartnerJob(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveEditedPartnerJob} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">عنوان آگهی</label>
                    <input
                      type="text"
                      required
                      value={editingPartnerJob.title}
                      onChange={(e) => setEditingPartnerJob({ ...editingPartnerJob, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">حداقل حقوق (لیر)</label>
                      <input
                        type="number"
                        value={editingPartnerJob.salaryMin}
                        onChange={(e) => setEditingPartnerJob({ ...editingPartnerJob, salaryMin: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">حداکثر حقوق (لیر)</label>
                      <input
                        type="number"
                        value={editingPartnerJob.salaryMax}
                        onChange={(e) => setEditingPartnerJob({ ...editingPartnerJob, salaryMax: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">توضیحات شغل</label>
                    <textarea
                      rows={3}
                      value={editingPartnerJob.description}
                      onChange={(e) => setEditingPartnerJob({ ...editingPartnerJob, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
                      ذخیره تغییرات آگهی
                    </button>
                    <button type="button" onClick={() => setEditingPartnerJob(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl">
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JOB SEEKER APPLICATIONS RECEIVED */}
      {partnerDashTab === 'applications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>درخواست‌های استخدام و رزومه‌های ارسالی کارجویان ({applications.length} مورد)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              با تغییر وضعیت هر درخواست، اعلان آن به صورت آنی برای کارجو ارسال می‌شود.
            </p>
          </div>
          {applications.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-slate-950/50 rounded-2xl border border-slate-800">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">هنوز درخواست شغلی جدیدی ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{app.seekerName}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                        آگهی: {app.jobTitle} ({app.companyName})
                      </span>
                      <span className="text-emerald-400 font-mono font-bold" dir="ltr">
                        {app.seekerPhone}
                      </span>
                    </div>
                    {app.adminNote && (
                      <p className="text-slate-300">یادداشت پرونده: {app.adminNote}</p>
                    )}
                    <div className="text-[11px] text-slate-400">
                      مهارت‌ها: {app.seekerSkills?.join('، ') || 'عمومی'} | شهر: {app.city}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={app.status}
                      onChange={(e) => updateApplicationStatus(app.id, e.target.value as any)}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="pending">در انتظار بررسی</option>
                      <option value="reviewed">مشاهده شده</option>
                      <option value="interview">دعوت به مصاحبه ✓</option>
                      <option value="accepted">تایید نهایی و استخدام ✅</option>
                      <option value="rejected">رد درخواست ❌</option>
                    </select>
                    <a
                      href={`tel:${(app.seekerPhone || '').replace(/\s/g, '')}`}
                      className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>تماس</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REAL-TIME CHAT WITH APPLICANTS & ADMIN */}
      {partnerDashTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>گفتگوی آنلاین مستقیم با مدیریت و هماهنگی کارجویان</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                پیام‌های شما به صورت زنده در کارتابل مدیریت نمایش داده شده و پاسخ‌ها بلافاصله دریافت می‌گردند.
              </p>
            </div>
          </div>

          {!activeSeekerChat ? (
            <div className="py-10 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <MessageSquare className="w-10 h-10 text-indigo-400 mx-auto" />
              <p className="text-sm font-bold text-white">آغاز گفتگوی آنلاین همکار با مدیریت کارباما</p>
              <button
                type="button"
                onClick={() =>
                  requestLiveChat({
                    firstName: activePartner.companyName,
                    lastName: activePartner.fullName,
                    phone: activePartner.phone || '09120000000',
                    nationalId: activePartner.nationalId || activePartner.partnerCode,
                  })
                }
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg cursor-pointer"
              >
                شروع گفتگوی زنده همکار
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-72 overflow-y-auto p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                {activeSeekerChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] p-3 rounded-2xl text-xs ${
                      msg.sender === 'seeker'
                        ? 'mr-auto bg-indigo-600 text-white rounded-bl-xs'
                        : 'ml-auto bg-slate-800 text-slate-200 border border-slate-700 rounded-br-xs'
                    }`}
                  >
                    <span className="font-bold text-[10px] opacity-75 mb-1">
                      {msg.sender === 'seeker' ? activePartner.companyName : 'مدیریت کارباما'}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!partnerChatInput.trim()) return;
                  sendLiveChatMessage(activeSeekerChat.id, 'seeker', partnerChatInput);
                  setPartnerChatInput('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={partnerChatInput}
                  onChange={(e) => setPartnerChatInput(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال پیام</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: SIMPLE FORM TO REGISTER A SEEKER BY PARTNER */}
      {partnerDashTab === 'seekers' && showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>ثبت کارجوی جدید توسط همکار</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              تمامی اطلاعات در کارتابل شما و مدیریت ذخیره می‌گردد
            </span>
          </div>

          <form onSubmit={handleAddSeeker} className="space-y-5 text-xs">
            {/* 1. مشخصات کارجو */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-indigo-400" />
                <span>۱. مشخصات هویتی و تماس کارجو</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    نام و نام خانوادگی کارجو *
                  </label>
                  <input
                    type="text"
                    required
                    value={seekerFullName}
                    onChange={(e) => setSeekerFullName(e.target.value)}
                    placeholder="مثلاً بهرام صادقی"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نام پدر</label>
                  <input
                    type="text"
                    value={seekerFatherName}
                    onChange={(e) => setSeekerFatherName(e.target.value)}
                    placeholder="نام پدر"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    کد ملی ۱۰ رقمی (الگوریتم رسمی) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    dir="ltr"
                    value={seekerNationalId}
                    onChange={(e) => setSeekerNationalId(sanitizeNumericOnly(e.target.value, 10))}
                    placeholder="0012345678"
                    className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white font-mono outline-none ${
                      seekerNatIdLiveCheck && !seekerNatIdLiveCheck.isValid
                        ? 'border-red-500 ring-1 ring-red-500/50'
                        : seekerNatIdLiveCheck?.isValid
                        ? 'border-emerald-500'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {seekerNatIdLiveCheck && !seekerNatIdLiveCheck.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-red-400">
                      {seekerNatIdLiveCheck.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    شماره تماس / واتساپ کارجو *
                  </label>
                  <div className="flex gap-1.5" dir="ltr">
                    <select
                      value={seekerCountryCode}
                      onChange={(e) => setSeekerCountryCode(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2.5 text-white font-mono text-xs shrink-0"
                    >
                      <option value="+98">+98</option>
                      <option value="+90">+90</option>
                      <option value="+49">+49</option>
                      <option value="+964">+964</option>
                      <option value="+374">+374</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={seekerPhoneNumber}
                      onChange={(e) => setSeekerPhoneNumber(sanitizeNumericOnly(e.target.value, 11))}
                      placeholder="09123456789"
                      className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white font-mono outline-none ${
                        seekerPhoneLiveCheck && !seekerPhoneLiveCheck.isValid
                          ? 'border-red-500 ring-1 ring-red-500/50'
                          : seekerPhoneLiveCheck?.isValid
                          ? 'border-emerald-500'
                          : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {seekerPhoneLiveCheck && !seekerPhoneLiveCheck.isValid && (
                    <p className="mt-1 text-[11px] font-bold text-red-400">
                      {seekerPhoneLiveCheck.error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">جنسیت</label>
                  <select
                    value={seekerGender}
                    onChange={(e) => setSeekerGender(e.target.value as Gender)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="male">آقا</option>
                    <option value="female">خانم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شهر مقصد</label>
                  <select
                    value={seekerTargetCity}
                    onChange={(e) => {
                      const c = e.target.value;
                      setSeekerTargetCity(c);
                      const dists = getDistrictsForCity(c);
                      if (dists.length > 0) setSeekerTargetDistrict(dists[0]);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">منطقه مقصد</label>
                  <select
                    value={seekerTargetDistrict}
                    onChange={(e) => setSeekerTargetDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    {getDistrictsForCity(seekerTargetCity).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. کار انتخاب‌شده توسط کارجو */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>۲. کار انتخاب‌شده توسط کارجو</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    انتخاب از آگهی‌های شغلی فعال سامانه
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                  >
                    {activeJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.city} ({j.company}) | {j.salaryMin.toLocaleString('fa-IR')} تا{' '}
                        {j.salaryMax.toLocaleString('fa-IR')} لیر
                      </option>
                    ))}
                    <option value="custom">سایر / ثبت دستی عنوان کار انتخابی...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    یا نوشتن عنوان دقیق شغل انتخابی کارجو (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => {
                      setCustomJobTitle(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedJobId('custom');
                      }
                    }}
                    placeholder="مثلاً چرخکار ماهر پوشاک در مرتر استانبول"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. مبلغ پرداختی توسط کارجو */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>۳. مبلغ پرداختی توسط کارجو</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    مبلغ پرداختی کارجو *
                  </label>
                  <input
                    type="text"
                    required
                    value={seekerPaidAmount}
                    onChange={(e) => setSeekerPaidAmount(e.target.value)}
                    placeholder="مثلاً ۲۵,۰۰۰,۰۰۰ یا ۱۵,۰۰۰"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-bold font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">واحد پول</label>
                  <select
                    value={seekerPaymentCurrency}
                    onChange={(e) => setSeekerPaymentCurrency(e.target.value as 'IRT' | 'TRY' | 'USD')}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="IRT">تومان (ایران)</option>
                    <option value="TRY">لیر ترکیه (₺)</option>
                    <option value="USD">دلار ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">وضعیت پرداخت</label>
                  <select
                    value={seekerPaymentStatus}
                    onChange={(e) =>
                      setSeekerPaymentStatus(e.target.value as 'paid' | 'partial' | 'unpaid')
                    }
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="paid">تسویه کامل ✓</option>
                    <option value="partial">پیش‌پرداخت / بیعانه</option>
                    <option value="unpaid">در انتظار پرداخت</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    توضیحات / شماره پیگیری
                  </label>
                  <input
                    type="text"
                    value={partnerNote}
                    onChange={(e) => setPartnerNote(e.target.value)}
                    placeholder="مثلاً واریز به کارت یا نقدی..."
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ثبت کارجو در لیست کارجویان من</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: LIST & MANAGEMENT OF SEEKERS REGISTERED BY THIS PARTNER */}
      {partnerDashTab === 'seekers' && (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>لیست کارجویان ثبت‌شده توسط من ({myRegisteredSeekers.length} نفر)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مشاهده و ویرایش مشخصات کارجو، کار انتخاب‌شده توسط کارجو و مبلغ پرداختی کارجو
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={seekerFilterQuery}
              onChange={(e) => setSeekerFilterQuery(e.target.value)}
              placeholder="جستجوی نام، کد ملی، شغل یا تلفن..."
              className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredMySeekers.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-slate-950/50 rounded-2xl border border-slate-800/80">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">هنوز هیچ کارجویی ثبت نشده است</p>
            <p className="text-xs text-slate-500">
              از فرم بالای صفحه می‌توانید مشخصات کارجو، شغل انتخابی و مبلغ پرداختی او را ثبت نمایید.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMySeekers.map((seeker) => {
              const jobChosen =
                seeker.selectedJobTitle ||
                seeker.customProfession ||
                (seeker.selectedJobs && seeker.selectedJobs[0]) ||
                (seeker.skills && seeker.skills[0]) ||
                'تعیین نشده';

              return (
                <div
                  key={seeker.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition space-y-3 text-xs"
                >
                  {/* Top Row: Seeker Name + Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-black text-white">
                        {seeker.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px]">
                        فرزند: {seeker.fatherName || '---'}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[11px]"
                        dir="ltr"
                      >
                        کد ملی: {seeker.nationalId}
                      </span>
                      {paymentStatusBadge(seeker.seekerPaymentStatus)}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingSeeker({ ...seeker })}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>ویرایش مشخصات / شغل / مبلغ</span>
                      </button>

                      {confirmDeleteId === seeker.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              deleteSeekerRecord(seeker.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px]"
                          >
                            تایید حذف
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[11px]"
                          >
                            لغو
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(seeker.id)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                          title="حذف کارجو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Clear Highlight Boxes: 1. مشخصات کارجو | 2. کار انتخاب‌شده توسط کارجو | 3. مبلغ پرداختی توسط کارجو */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Box 1: مشخصات کارجو */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                        <IdCard className="w-3.5 h-3.5" />
                        مشخصات و تماس کارجو:
                      </span>
                      <p className="text-slate-200">
                        تلفن:{' '}
                        <strong className="text-emerald-300 font-mono" dir="ltr">
                          {seeker.phone || seeker.phoneNumber}
                        </strong>
                      </p>
                      <p className="text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          مقصد: {seeker.targetCity}
                          {seeker.targetDistrict ? ` (${seeker.targetDistrict})` : ''}
                        </span>
                      </p>
                    </div>

                    {/* Box 2: کار انتخاب‌شده توسط کارجو */}
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        کار انتخاب‌شده توسط کارجو:
                      </span>
                      <p className="text-white font-bold text-xs leading-relaxed">{jobChosen}</p>
                    </div>

                    {/* Box 3: مبلغ پرداختی توسط کارجو */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        مبلغ پرداختی توسط کارجو:
                      </span>
                      <p className="text-emerald-300 font-black text-sm font-mono">
                        {seeker.seekerPaidAmount || seeker.contractAmount || '۰'}{' '}
                        <span className="text-xs font-bold">
                          {currencyLabel(seeker.seekerPaymentCurrency)}
                        </span>
                      </p>
                      {seeker.partnerInternalNote && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 shrink-0" />
                          <span>یادداشت: {seeker.partnerInternalNote}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* EDIT SEEKER MODAL FOR PARTNER */}
      {editingSeeker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
                <span>ویرایش پرونده کارجو: {editingSeeker.fullName}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingSeeker(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSeeker} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={editingSeeker.fullName}
                    onChange={(e) =>
                      setEditingSeeker({ ...editingSeeker, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام پدر</label>
                  <input
                    type="text"
                    value={editingSeeker.fatherName}
                    onChange={(e) =>
                      setEditingSeeker({ ...editingSeeker, fatherName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">کد ملی</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingSeeker.nationalId}
                    onChange={(e) =>
                      setEditingSeeker({ ...editingSeeker, nationalId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingSeeker.phone || ''}
                    onChange={(e) => setEditingSeeker({ ...editingSeeker, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-bold mb-1">
                  کار انتخاب‌شده توسط کارجو
                </label>
                <select
                  value={editingSeeker.selectedJobId || 'custom'}
                  onChange={(e) => {
                    const jId = e.target.value;
                    const found = jobs.find((j) => j.id === jId);
                    setEditingSeeker({
                      ...editingSeeker,
                      selectedJobId: jId === 'custom' ? '' : jId,
                      selectedJobTitle: found
                        ? `${found.title} (${found.city} - ${found.company})`
                        : editingSeeker.selectedJobTitle,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white mb-2"
                >
                  {activeJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.city} ({j.company})
                    </option>
                  ))}
                  <option value="custom">ویرایش دستی عنوان کار انتخابی...</option>
                </select>
                <input
                  type="text"
                  value={editingSeeker.selectedJobTitle || editingSeeker.customProfession || ''}
                  onChange={(e) =>
                    setEditingSeeker({
                      ...editingSeeker,
                      selectedJobTitle: e.target.value,
                      customProfession: e.target.value,
                    })
                  }
                  placeholder="عنوان کار انتخابی کارجو"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">
                    مبلغ پرداختی توسط کارجو
                  </label>
                  <input
                    type="text"
                    value={editingSeeker.seekerPaidAmount || ''}
                    onChange={(e) =>
                      setEditingSeeker({ ...editingSeeker, seekerPaidAmount: e.target.value })
                    }
                    placeholder="مثلاً ۲۵,۰۰۰,۰۰۰"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">واحد پول</label>
                  <select
                    value={editingSeeker.seekerPaymentCurrency || 'IRT'}
                    onChange={(e) =>
                      setEditingSeeker({
                        ...editingSeeker,
                        seekerPaymentCurrency: e.target.value as 'IRT' | 'TRY' | 'USD',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="IRT">تومان</option>
                    <option value="TRY">لیر ترکیه</option>
                    <option value="USD">دلار</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">وضعیت پرداخت</label>
                  <select
                    value={editingSeeker.seekerPaymentStatus || 'paid'}
                    onChange={(e) =>
                      setEditingSeeker({
                        ...editingSeeker,
                        seekerPaymentStatus: e.target.value as 'paid' | 'partial' | 'unpaid',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="paid">تسویه کامل ✓</option>
                    <option value="partial">پیش‌پرداخت / بیعانه</option>
                    <option value="unpaid">در انتظار پرداخت</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">یادداشت همکار</label>
                <input
                  type="text"
                  value={editingSeeker.partnerInternalNote || ''}
                  onChange={(e) =>
                    setEditingSeeker({ ...editingSeeker, partnerInternalNote: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره تغییرات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSeeker(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
