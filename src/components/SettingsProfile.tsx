import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TurkishLevel, ResidenceStatus } from '../types';
import { AuthModal } from './AuthModal';
import { ResumeBuilder } from './ResumeBuilder';
import { CVBuilder } from './CVBuilder';
import { KARBAMA_USER_AVATAR_DATA_URI } from '../utils/brandAssets';
import {
  User,
  Users,
  IdCard,
  Lock,
  KeyRound,
  Award,
  FileCheck2,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle,
  CheckCircle2,
  Save,
  LogOut,
  Clock,
  Sparkles,
  FileText,
  MapPin,
  Phone,
  Globe,
  Camera,
  CreditCard,
  Briefcase,
  Building2,
  Send,
  Upload,
  AlertTriangle,
  XCircle,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-react';

export const SettingsProfile: React.FC = () => {
  const {
    currentSeeker,
    changePassword,
    updateProfile,
    applications,
    logoutSeeker,
    showToast,
    activeTab,
    setActiveTab,
    paymentSettings,
    addAdminNotification,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [trackingNote, setTrackingNote] = useState('');
  const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false);

  const computedFeeToman =
    paymentSettings?.seekerFeeToman && paymentSettings.seekerFeeToman > 0
      ? paymentSettings.seekerFeeToman
      : (paymentSettings?.feeTL || 500) * (paymentSettings?.exchangeRateToman || 5460);
  const adminAmountUnit = paymentSettings?.paymentAmountUnit || 'toman';
  const adminConfiguredAmount =
    paymentSettings?.directPaymentAmount && paymentSettings.directPaymentAmount > 0
      ? paymentSettings.directPaymentAmount
      : adminAmountUnit === 'rial'
        ? computedFeeToman * 10
        : computedFeeToman;
  const seekerFeeToman =
    adminAmountUnit === 'rial' ? Math.round(adminConfiguredAmount / 10) : adminConfiguredAmount;
  const seekerFeeRial =
    adminAmountUnit === 'rial' ? adminConfiguredAmount : adminConfiguredAmount * 10;

  const isSeekerApproved =
    currentSeeker?.verificationStatus === 'approved' ||
    currentSeeker?.paymentStatus === 'approved' ||
    Boolean(currentSeeker?.isPaymentVerified);

  const isSeekerRejected =
    !isSeekerApproved &&
    (currentSeeker?.verificationStatus === 'rejected' ||
      currentSeeker?.paymentStatus === 'rejected' ||
      currentSeeker?.seekerPaymentStatus === 'rejected');

  const handleOnlinePaymentRedirect = () => {
    try {
      localStorage.setItem('karbama_pending_seeker_payment', 'true');
    } catch {
      // ignore
    }
    if (adminAmountUnit === 'toman') {
      window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}&unit=toman`;
    } else {
      window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}`;
    }
  };

  const handleReceiptPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setReceiptPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeeker) return;
    if (!trackingNote.trim() && !receiptPhoto) {
      showToast('لطفاً شماره پیگیری تراکنش را وارد کنید یا تصویر فیش واریزی را بارگذاری نمایید.', 'error');
      return;
    }
    const cleanRef = trackingNote.trim() || `REF-${Date.now().toString().slice(-6)}`;
    updateProfile({
      seekerPaymentStatus: 'paid',
      paymentStatus: 'pending',
      accountStatus: 'pending',
      verificationStatus: 'pending',
      isPaymentVerified: false,
      seekerPaymentRefId: cleanRef,
      seekerPaidAmount: `${seekerFeeToman.toLocaleString('fa-IR')} تومان`,
      paymentReceiptPhotoUrl: receiptPhoto || currentSeeker.paymentReceiptPhotoUrl,
      adminVerificationNote: `ثبت مجدد اطلاعات پرداخت توسط کارجو | کد پیگیری: ${cleanRef} | تاریخ: ${new Date().toLocaleDateString('fa-IR')}`,
    });
    addAdminNotification({
      type: 'seeker_payment_referred',
      title: '💳 ثبت فیش / کد پیگیری پرداخت توسط کارجو',
      message: `کارجو «${currentSeeker.fullName}» (کد ملی: ${currentSeeker.nationalId}) مشخصات پرداخت هزینه خدمات (${seekerFeeToman.toLocaleString('fa-IR')} تومان - کد پیگیری: ${cleanRef}) را جهت بررسی و تایید ارسال نمود.`,
      data: {
        seekerId: currentSeeker.id,
        paymentRefId: cleanRef,
        receiptPhotoUrl: receiptPhoto || undefined,
      },
    });
    setIsPaymentSubmitted(true);
    setTrackingNote('');
    showToast('✅ مشخصات پرداخت شما ثبت و برای تایید فوری به پنل مدیریت ارسال شد.', 'success');
  };

  // Tab inside Profile
  const [profileTab, setProfileTab] = useState<'turkish-cv' | 'resume' | 'profile' | 'applications'>(
    activeTab === 'my-applications' ? 'applications' : 'profile'
  );

  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(null as string | null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [fatherName, setFatherName] = useState(currentSeeker?.fatherName || '');
  const [phone, setPhone] = useState(currentSeeker?.phone || '');
  const [targetCity, setTargetCity] = useState(currentSeeker?.targetCity || 'استانبول');
  const [turkishLevel, setTurkishLevel] = useState<TurkishLevel>(currentSeeker?.turkishLevel || 'basic');
  const [residenceStatus, setResidenceStatus] = useState<ResidenceStatus>(currentSeeker?.residenceStatus || 'none');
  const [skills, setSkills] = useState(currentSeeker?.skills.join('، ') || '');
  const [bio, setBio] = useState(currentSeeker?.bio || '');
  const [passportPhotoUrl, setPassportPhotoUrl] = useState(currentSeeker?.passportPhotoUrl || '');
  const [fullBodyPhotoUrl, setFullBodyPhotoUrl] = useState(currentSeeker?.fullBodyPhotoUrl || '');

  useEffect(() => {
    if (currentSeeker) {
      setFatherName(currentSeeker.fatherName || '');
      setPhone(currentSeeker.phone || '');
      setTargetCity(currentSeeker.targetCity || 'استانبول');
      setTurkishLevel(currentSeeker.turkishLevel || 'basic');
      setResidenceStatus(currentSeeker.residenceStatus || 'none');
      setSkills(currentSeeker.skills.join('، ') || '');
      setBio(currentSeeker.bio || '');
      setPassportPhotoUrl(currentSeeker.passportPhotoUrl || '');
      setFullBodyPhotoUrl(currentSeeker.fullBodyPhotoUrl || '');
    }
  }, [currentSeeker]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'fullBody') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (type === 'passport') {
          setPassportPhotoUrl(reader.result);
        } else {
          setFullBodyPhotoUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter seeker's applications
  const myApplications = currentSeeker
    ? applications.filter((app) => app.seekerId === currentSeeker.id)
    : [];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('رمز عبور جدید با تکرار آن مطابقت ندارد.');
      return;
    }

    if (newPassword.length < 5) {
      setPassError('رمز عبور جدید باید حداقل ۵ کاراکتر باشد.');
      return;
    }

    const res = changePassword(oldPassword, newPassword);
    if (res.success) {
      setPassSuccess('رمز عبور شما با موفقیت تغییر کرد.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(res.error || 'خطا در تغییر رمز عبور');
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skills
      .split('،')
      .join(',')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = updateProfile({
      fatherName: fatherName.trim() || currentSeeker?.fatherName,
      phone,
      targetCity,
      turkishLevel,
      residenceStatus,
      skills: skillsArray,
      bio,
      passportPhotoUrl: passportPhotoUrl || currentSeeker?.passportPhotoUrl,
      fullBodyPhotoUrl: fullBodyPhotoUrl || currentSeeker?.fullBodyPhotoUrl,
    });

    if (res.success) {
      setIsEditing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 rounded-lg text-xs font-black flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
            در انتظار بررسی کارفرما
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 rounded-lg text-xs font-black flex items-center gap-1.5">
            مشاهده شده توسط کارفرما
          </span>
        );
      case 'interview':
        return (
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 rounded-lg text-xs font-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
            دعوت به مصاحبه حضوری
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-[#D1FAE5] dark:bg-emerald-500/20 text-[#065F46] dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40 rounded-lg text-xs font-black flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-300" />
            تایید نهایی و استخدام
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-500/40 rounded-lg text-xs font-black flex items-center gap-1.5">
            رد درخواست
          </span>
        );
      default:
        return null;
    }
  };

  const getResidenceLabel = (status: ResidenceStatus) => {
    switch (status) {
      case 'none':
        return 'هنوز وارد ترکیه نشدم';
      case 'passport_only':
        return 'در ترکیه با پاسپورت (بدون کیملیک)';
      case 'tourist':
        return 'دارای کیملیک توریستی (İkamet)';
      case 'work_permit':
        return 'دارای مجوز کار فعال (Çalışma İzni)';
      case 'student':
        return 'اقامت دانشجویی';
    }
  };

  const getTurkishLevelLabel = (level: TurkishLevel) => {
    switch (level) {
      case 'none':
        return 'بدون زبان ترکی';
      case 'basic':
        return 'مقدماتی / اصطلاحات پایه';
      case 'intermediate':
        return 'متوسط / مکالمه روزمره کاری';
      case 'fluent':
        return 'پیشرفته و مسلط';
    }
  };

  if (!currentSeeker) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-[#0F172A] dark:text-slate-100">
        <div className="bg-white dark:bg-slate-900 border-2 border-[#CBD5E1] dark:border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg print:hidden">
          <div className="space-y-1.5 text-center sm:text-right">
            <h2 className="text-lg font-black text-[#0F172A] dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <Lock className="w-5 h-5 text-[#2563EB] dark:text-amber-400" />
              <span>پرونده رسمی کارجو و بخش‌های اختصاصی</span>
            </h2>
            <p className="text-xs font-medium text-[#334155] dark:text-slate-300 max-w-2xl leading-relaxed">
              تمامی امکانات اختصاصی کارجو، مشاهده پرونده رسمی هویتی، ساخت و چاپ رسمی رزومه (CV) و ارسال رزومه به کارفرمایان تا زمان ثبت‌نام، پرداخت هزینه خدمات ({seekerFeeToman.toLocaleString('fa-IR')} تومان) و تایید رسمی مدیریت سامانه قفل می‌باشد.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>ورود یا ثبت‌نام رسمی کارجو</span>
            </button>
          </div>
        </div>

        <CVBuilder />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#0F172A] dark:text-slate-100">
      {/* Main Official Job Seeker Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-[#CBD5E1] dark:border-slate-700 rounded-3xl p-6 shadow-lg print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800 border-2 border-[#2563EB] dark:border-blue-500 flex items-center justify-center overflow-hidden shadow-md shrink-0">
              <img
                src={currentSeeker.fullBodyPhotoUrl || currentSeeker.passportPhotoUrl || KARBAMA_USER_AVATAR_DATA_URI}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = KARBAMA_USER_AVATAR_DATA_URI;
                }}
                alt={currentSeeker.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-[#0F172A] dark:text-white">{currentSeeker.fullName}</h1>
                {isSeekerApproved ? (
                  <span className="px-3 py-1 rounded-lg bg-[#D1FAE5] dark:bg-emerald-500/20 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    پرونده فعال و تاییدشده ✓
                  </span>
                ) : isSeekerRejected ? (
                  <span className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-500/25 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-500/50 text-xs font-black flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                    رد پرداخت توسط مدیریت ❌
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-black flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                    در انتظار تایید مدیریت ⏳
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-[#334155] dark:text-slate-300 mt-1.5">
                نام کاربری: <span className="font-mono text-[#1E3A8A] dark:text-blue-300 font-black" dir="ltr">@{currentSeeker.username}</span> | کد ملی: <span className="font-mono text-[#0F172A] dark:text-white font-black">{currentSeeker.nationalId}</span>
              </p>
              {currentSeeker.registeredByPartnerName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#EFF6FF] dark:bg-indigo-500/20 border border-blue-300 dark:border-indigo-500/40 text-[#1E3A8A] dark:text-indigo-200 text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-indigo-400" />
                  <span>
                    ثبت‌شده توسط همکار رسمی: <strong className="font-black text-[#0F172A] dark:text-white">{currentSeeker.registeredByPartnerName}</strong>
                    {currentSeeker.registeredByPartnerCode && ` (کد: ${currentSeeker.registeredByPartnerCode})`}
                  </span>
                  {currentSeeker.isTemporaryRegistration && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 text-[10px] font-black">
                      پیش‌ثبت‌نام موقت
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              مشاهده آگهی‌های استخدام
            </button>
            <button
              onClick={logoutSeeker}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              خروج از حساب
            </button>
          </div>
        </div>

        {/* Live Payment Rejection or Pending Payment Banner inside Seeker Dashboard */}
        {!isSeekerApproved && (
          <div className={`mt-5 p-5 rounded-2xl border-2 space-y-4 ${
            isSeekerRejected
              ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-500/70 text-[#0F172A] dark:text-red-100'
              : 'bg-[#F8FAFC] dark:bg-slate-950/80 border-[#CBD5E1] dark:border-amber-500/40 text-[#0F172A] dark:text-slate-200'
          }`}>
            {isSeekerRejected ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 flex items-center justify-center shrink-0 text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-black text-red-900 dark:text-white flex items-center gap-2">
                    <span>❌ پرداخت شما توسط مدیریت تایید نشد (دسترسی ویژه محدود است)</span>
                  </h3>
                  <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed font-black">
                    علت اعلام‌شده توسط مدیریت: {currentSeeker.adminVerificationNote || 'مغایرت در اطلاعات واریزی یا عدم دریافت تراکنش شاپرک. لطفاً مجدداً اقدام نمایید.'}
                  </p>
                  <p className="text-xs font-medium text-[#334155] dark:text-red-200/90 leading-relaxed">
                    شما می‌توانید همین حالا از طریق دکمه «پرداخت آنلاین شاپرک» مجدداً پرداخت را انجام دهید یا شماره پیگیری / تصویر فیش معتبر خود را در فرم زیر ثبت نمایید.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center shrink-0 text-amber-800 dark:text-amber-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-black text-[#0F172A] dark:text-white">
                    {currentSeeker.seekerPaymentStatus === 'paid' || isPaymentSubmitted
                      ? '⏳ پرداخت شما ثبت شده و در صف بررسی و تایید مدیریت است'
                      : '🔒 تکمیل پرداخت هزینه خدمات و فعال‌سازی کامل پرونده رسمی کارجو'}
                  </h3>
                  <p className="text-xs font-medium text-[#334155] dark:text-slate-300 leading-relaxed">
                    مبلغ مصوب خدمات کارجو: <strong className="text-[#065F46] dark:text-amber-300 font-mono font-black">{seekerFeeToman.toLocaleString('fa-IR')} تومان</strong> ({seekerFeeRial.toLocaleString('fa-IR')} ریال). پس از تایید مدیریت، قفل مشاهده اطلاعات تماس کارفرمایان، ارسال مستقیم رزومه و گفتگوی آنلاین به صورت آنی باز می‌شود.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
              {/* Option 1: Direct Online Payment */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-teal-500/40 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[#065F46] dark:text-teal-300 block">روش اول: پرداخت آنلاین آنی (شاپرک)</span>
                  <p className="text-xs font-medium text-[#334155] dark:text-slate-300 leading-relaxed">
                    انتقال مستقیم به درگاه بانکی با مبلغ مصوب {seekerFeeToman.toLocaleString('fa-IR')} تومان:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOnlinePaymentRedirect}
                  className="w-full py-3 px-4 bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isSeekerRejected ? 'تلاش مجدد پرداخت آنلاین' : 'پرداخت آنلاین از طریق درگاه بانکی'}</span>
                </button>
              </div>

              {/* Option 2: Submit Reference Code / Receipt Photo (Temporarily Disabled) */}
              <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-slate-900/60 border border-amber-400/70 dark:border-amber-500/40 space-y-2.5 relative select-none">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 line-through">
                    روش دوم: ثبت کد پیگیری یا تصویر فیش واریزی
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 text-[10px] font-black">
                    موقتاً غیرفعال
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-500/40 text-[11px] font-black text-amber-900 dark:text-amber-200 leading-relaxed flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>این حالت موقتاً غیرفعال می‌باشد. لطفاً فقط از طریق درگاه پرداخت آنلاین اقدام فرمایید.</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 opacity-50 pointer-events-none">
                  <input
                    type="text"
                    disabled
                    value=""
                    placeholder="این حالت موقتاً غیرفعال می‌باشد..."
                    className="flex-1 bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                  <span className="px-3.5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-not-allowed shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>تصویر فیش (غیرفعال)</span>
                  </span>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-70"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>این روش پرداخت موقتاً غیرفعال می‌باشد</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 border-t border-[#E2E8F0] dark:border-slate-800 pt-4 pb-1">
          <button
            onClick={() => setProfileTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer border ${
              profileTab === 'profile'
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border-[#CBD5E1] dark:border-slate-700'
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            پرونده رسمی کارجو و مشخصات
          </button>

          <button
            onClick={() => setProfileTab('turkish-cv')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer border ${
              profileTab === 'turkish-cv'
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border-[#CBD5E1] dark:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            رزومه‌ساز آنلاین (دوزبانه | PDF)
          </button>

          <button
            onClick={() => setProfileTab('resume')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer border ${
              profileTab === 'resume'
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border-[#CBD5E1] dark:border-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            رزومه ساختاریافته کارباما
          </button>

          <button
            onClick={() => setProfileTab('applications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer border ${
              profileTab === 'applications'
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border-[#CBD5E1] dark:border-slate-700'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            پیگیری درخواست‌های شغلی ({myApplications.length.toLocaleString('fa-IR')})
          </button>
        </div>
      </div>

      {/* Tab 0: Standard Turkish CV Builder */}
      {profileTab === 'turkish-cv' && <CVBuilder />}

      {/* Tab 1: Online Karbama Resume Builder */}
      {profileTab === 'resume' && <ResumeBuilder />}

      {/* Tab 2: Official Job Seeker Profile & Password Settings (پرونده رسمی کارجو) */}
      {profileTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Section 1: Official Seeker Dossier Info */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#CBD5E1] dark:border-slate-700 rounded-3xl p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
              <h2 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                پرونده رسمی کارجو (مشخصات هویتی و شغلی)
              </h2>
              <span className="px-2.5 py-1 rounded-lg bg-[#D1FAE5] dark:bg-emerald-500/20 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-[11px] font-black">
                سند رسمی کارجو
              </span>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                    نام و نام خانوادگی:
                  </span>
                  <span className="font-black text-[#0F172A] dark:text-white text-sm">{currentSeeker.fullName}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                    نام پدر:
                  </span>
                  <span className="font-black text-[#0F172A] dark:text-white text-sm">{currentSeeker.fatherName || 'ثبت نشده'}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <IdCard className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                    کد ملی (۱۰ رقمی):
                  </span>
                  <span className="font-mono font-black text-[#0F172A] dark:text-white text-sm" dir="ltr">{currentSeeker.nationalId}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
                    شماره تماس و واتساپ:
                  </span>
                  <span className="font-mono font-black text-[#065F46] dark:text-emerald-300 text-sm" dir="ltr">{currentSeeker.phone}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#1E3A8A] dark:text-amber-400" />
                    کشور و شهر مقصد:
                  </span>
                  <span className="font-black text-[#1E3A8A] dark:text-amber-300 text-sm">
                    {currentSeeker.targetCountry || 'ترکیه'} ({currentSeeker.targetCity || 'استانبول'})
                  </span>
                </div>

                {currentSeeker.iranProvince && (
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl space-y-1">
                    <span className="text-[#334155] dark:text-slate-300 font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                      آدرس محل سکونت در ایران:
                    </span>
                    <p className="text-[#0F172A] dark:text-white font-black pr-5 leading-relaxed">
                      استان {currentSeeker.iranProvince}، شهرستان {currentSeeker.iranCity}، {currentSeeker.iranAddress}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold">سطح زبان کشور مقصد:</span>
                  <span className="font-black text-[#0F172A] dark:text-white">
                    {currentSeeker.targetLanguageLevel || getTurkishLevelLabel(currentSeeker.turkishLevel)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl">
                  <span className="text-[#334155] dark:text-slate-300 font-bold">وضعیت مدارک و اقامت:</span>
                  <span className="font-black text-[#0F172A] dark:text-white">{getResidenceLabel(currentSeeker.residenceStatus)}</span>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl space-y-2">
                  <span className="text-[#334155] dark:text-slate-300 font-bold block">تخصص‌ها و مهارت‌های فنی شغلی:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentSeeker.selectedJobs && currentSeeker.selectedJobs.length > 0
                      ? currentSeeker.selectedJobs
                      : currentSeeker.skills
                    ).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#EFF6FF] dark:bg-blue-500/20 text-[#1E3A8A] dark:text-blue-200 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-black"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {currentSeeker.bio && (
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-xl space-y-1">
                    <span className="text-[#334155] dark:text-slate-300 font-bold block">توضیحات و سوابق کاری:</span>
                    <p className="text-[#0F172A] dark:text-white font-medium leading-relaxed">{currentSeeker.bio}</p>
                  </div>
                )}

                {/* Uploaded Identity Photos & Electronic Signature */}
                <div className="p-4 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                    مدارک هویتی و امضای دیجیتال ثبت‌شده در پرونده
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-[#CBD5E1] dark:border-slate-700">
                      <span className="text-[11px] font-black text-[#0F172A] dark:text-slate-200 block mb-1.5">عکس پاسپورت</span>
                      {currentSeeker.passportPhotoUrl ? (
                        <img
                          src={currentSeeker.passportPhotoUrl}
                          alt="پاسپورت"
                          className="w-full h-24 object-cover rounded-lg border border-[#CBD5E1] dark:border-slate-700"
                        />
                      ) : (
                        <div className="h-24 flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-800 rounded-lg text-[11px] font-bold text-[#475569] dark:text-slate-400">
                          ثبت نشده
                        </div>
                      )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-[#CBD5E1] dark:border-slate-700">
                      <span className="text-[11px] font-black text-[#0F172A] dark:text-slate-200 block mb-1.5">عکس تمام قد</span>
                      {currentSeeker.fullBodyPhotoUrl ? (
                        <img
                          src={currentSeeker.fullBodyPhotoUrl}
                          alt="تمام قد"
                          className="w-full h-24 object-cover rounded-lg border border-[#CBD5E1] dark:border-slate-700"
                        />
                      ) : (
                        <div className="h-24 flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-800 rounded-lg text-[11px] font-bold text-[#475569] dark:text-slate-400">
                          ثبت نشده
                        </div>
                      )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-[#CBD5E1] dark:border-slate-700 col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-black text-[#0F172A] dark:text-slate-200 block mb-1.5">امضای الکترونیکی</span>
                      {currentSeeker.signatureDataUrl ? (
                        <div className="h-24 flex items-center justify-center bg-white rounded-lg p-1.5 border border-[#CBD5E1]">
                          <img
                            src={currentSeeker.signatureDataUrl}
                            alt="امضا"
                            className="max-h-20 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-24 flex flex-col items-center justify-center bg-[#F1F5F9] dark:bg-slate-800 rounded-lg text-[11px] font-bold text-[#065F46] dark:text-emerald-400 p-2">
                          <ShieldCheck className="w-5 h-5 mb-1" />
                          <span>تعهدنامه تایید شده</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-xl text-xs transition mt-2 shadow-sm cursor-pointer"
                >
                  ویرایش اطلاعات و تصاویر پرونده رسمی
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">نام پدر</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white font-bold focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">شماره تماس و واتساپ</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white font-mono font-bold focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">شهر مقصد</label>
                    <input
                      type="text"
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white font-bold focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">سطح زبان ترکی</label>
                    <select
                      value={turkishLevel}
                      onChange={(e) => setTurkishLevel(e.target.value as TurkishLevel)}
                      className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white font-bold focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="none">بدون زبان ترکی</option>
                      <option value="basic">مقدماتی</option>
                      <option value="intermediate">متوسط</option>
                      <option value="fluent">پیشرفته</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">وضعیت اقامت / مدارک</label>
                  <select
                    value={residenceStatus}
                    onChange={(e) => setResidenceStatus(e.target.value as ResidenceStatus)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3 py-2.5 text-[#0F172A] dark:text-white font-bold focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="none">هنوز وارد ترکیه نشدم</option>
                    <option value="passport_only">در ترکیه با پاسپورت</option>
                    <option value="tourist">کیملیک توریستی</option>
                    <option value="work_permit">مجوز کار (چالیشما)</option>
                    <option value="student">اقامت دانشجویی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">مهارت‌ها و تخصص‌های شغلی (با ویرگول جدا کنید)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white font-bold focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">توضیحات و سوابق کاری</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-white font-bold focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-slate-800 font-black text-[#0F172A] dark:text-white">
                    <Upload className="w-4 h-4 text-[#2563EB]" />
                    <span>{passportPhotoUrl ? 'تغییر عکس پاسپورت ✓' : 'بارگذاری عکس پاسپورت'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'passport')} className="hidden" />
                  </label>

                  <label className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-slate-800 font-black text-[#0F172A] dark:text-white">
                    <Upload className="w-4 h-4 text-[#10B981]" />
                    <span>{fullBodyPhotoUrl ? 'تغییر عکس تمام‌قد ✓' : 'بارگذاری عکس تمام‌قد'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'fullBody')} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    ذخیره تغییرات پرونده
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#CBD5E1] dark:border-slate-700 font-black rounded-xl transition cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Change Password */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#CBD5E1] dark:border-slate-700 rounded-3xl p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
              <h2 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#2563EB] dark:text-amber-400" />
                تغییر رمز عبور حساب کاربری
              </h2>
              <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] dark:bg-blue-500/20 text-[#1E3A8A] dark:text-blue-200 border border-blue-200 dark:border-blue-500/30 text-[11px] font-black">
                امنیت حساب
              </span>
            </div>

            {passError && (
              <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500/30 text-red-900 dark:text-red-200 text-xs font-black">
                {passError}
              </div>
            )}

            {passSuccess && (
              <div className="p-3.5 rounded-xl bg-[#D1FAE5] dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-[#065F46] dark:text-emerald-200 text-xs font-black flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {passSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">رمز عبور فعلی *</label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-3 text-[#0F172A] dark:text-white font-bold placeholder:text-[#475569] dark:placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-3 text-[#475569] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">رمز عبور جدید * (حداقل ۵ کاراکتر)</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-3 text-[#0F172A] dark:text-white font-bold placeholder:text-[#475569] dark:placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-[#475569] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#0F172A] dark:text-slate-200 font-black mb-1.5">تکرار رمز عبور جدید *</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-xl px-3.5 py-3 text-[#0F172A] dark:text-white font-bold placeholder:text-[#475569] dark:placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                ثبت و تغییر رمز عبور
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Applications Tracking */}
      {profileTab === 'applications' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-[#CBD5E1] dark:border-slate-700 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
            <h2 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
              لیست درخواست‌های شغلی ارسال شده توسط شما
            </h2>
            <span className="px-3 py-1 rounded-lg bg-[#F1F5F9] dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 border border-[#CBD5E1] dark:border-slate-700 text-xs font-black">
              {myApplications.length.toLocaleString('fa-IR')} درخواست
            </span>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-[#0F172A] dark:text-white text-sm font-black">هنوز برای هیچ موقعیت شغلی درخواست ثبت نکرده‌اید.</p>
              <p className="text-[#334155] dark:text-slate-300 text-xs font-medium">از بخش «جستجوی کار» موقعیت مناسب خود را پیدا کرده و دکمه «ثبت درخواست استخدام» را بزنید.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-[#0F172A] dark:text-white text-sm">{app.jobTitle}</h3>
                      <span className="text-xs font-bold text-[#334155] dark:text-slate-300">({app.companyName})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#334155] dark:text-slate-300">
                      <span>شهر: <strong className="text-[#0F172A] dark:text-white">{app.city}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                        تاریخ ثبت: {app.appliedAt}
                      </span>
                    </div>
                    {app.adminNote && (
                      <p className="text-xs font-bold text-[#1E3A8A] dark:text-amber-200 bg-[#EFF6FF] dark:bg-amber-500/10 border border-blue-200 dark:border-amber-500/20 rounded-xl px-3 py-2 mt-2">
                        یادداشت کارشناس کاریابی: {app.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="self-start sm:self-center shrink-0">
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
