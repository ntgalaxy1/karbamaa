import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { checkPasswordStrength, isValidEmail } from '../utils/validators';
import { getDistrictsForCity } from '../data/turkeyData';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import { Gender, JobSeeker, TargetCountry } from '../types';
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
} from 'lucide-react';

export const PartnerSection: React.FC = () => {
  const {
    currentPartner,
    partners,
    isPartnerLoggedIn,
    loginPartner,
    registerPartner,
    logoutPartner,
    registerSeekerByPartner,
    updateSeekerRecord,
    deleteSeekerRecord,
    jobSeekers,
    jobs,
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
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('استانبول');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const partnerPassCheck = checkPasswordStrength(regPassword);

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

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regEmail && !isValidEmail(regEmail)) {
      setAuthError('لطفاً یک آدرس ایمیل معتبر وارد کنید.');
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
      phone: regPhone,
      email: regEmail,
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

    const cleanNatId = seekerNationalId.replace(/\D/g, '');
    if (cleanNatId.length !== 10) {
      showToast('کد ملی کارجو باید ۱۰ رقم باشد.', 'error');
      return;
    }

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

  const paymentStatusBadge = (status?: 'paid' | 'partial' | 'unpaid') => {
    if (status === 'partial') {
      return (
        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
          پیش‌پرداخت / بیعانه
        </span>
      );
    }
    if (status === 'unpaid') {
      return (
        <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
          در انتظار پرداخت
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
        تسویه کامل ✓
      </span>
    );
  };

  // Disable Partner Section for regular Job Seekers
  const { currentSeeker: activeSeeker } = useApp();
  const isJobSeekerView = Boolean(activeSeeker && !isAdminLoggedIn && !currentPartner);

  if (isJobSeekerView) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">بخش ویژه همکاران</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          این بخش مخصوص ثبت و مدیریت کارجویان توسط همکاران است.
        </p>
        <button
          onClick={() => setActiveTab('jobs')}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          <span>بازگشت به آگهی‌های شغلی</span>
        </button>
      </div>
    );
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">رمز عبور</label>
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
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                ورود به پنل همکار
              </button>
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
                    شماره تماس / واتساپ *
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+90 532 000 0000"
                    dir="ltr"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ایمیل (جهت بازیابی رمز) *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    dir="ltr"
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
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
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                ثبت‌نام و ورود مستقیم به پنل همکار
              </button>
            </form>
          )}
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Simple Partner Top Bar */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
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
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مدیریت کارجویان ثبت‌شده توسط همکار (مشخصات کارجو، کار انتخاب‌شده و مبلغ پرداختی)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>کارجویان ثبت‌شده من:</span>
            <span className="text-amber-400 font-mono text-sm">{myRegisteredSeekers.length} نفر</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'بستن فرم ثبت' : 'ثبت کارجو جدید'}</span>
          </button>

          {currentPartner && (
            <button
              onClick={logoutPartner}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 transition"
              title="خروج از حساب همکار"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: SIMPLE FORM TO REGISTER A SEEKER BY PARTNER */}
      {showAddForm && (
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
                    کد ملی ۱۰ رقمی *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    dir="ltr"
                    value={seekerNationalId}
                    onChange={(e) => setSeekerNationalId(e.target.value.replace(/\D/g, ''))}
                    placeholder="0012345678"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-indigo-500"
                  />
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
                      onChange={(e) => setSeekerPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9123456789"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
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
