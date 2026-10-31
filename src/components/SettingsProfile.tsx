import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TurkishLevel, ResidenceStatus } from '../types';
import { AuthModal } from './AuthModal';
import { ResumeBuilder } from './ResumeBuilder';
import { CVBuilder } from './CVBuilder';
import { PWAInstallBanner } from './PWAInstallBanner';
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
} from 'lucide-react';

export const SettingsProfile: React.FC = () => {
  const {
    currentSeeker,
    changePassword,
    updateProfile,
    applications,
    logoutSeeker,
    showToast,
    switchToDemoUser,
    activeTab,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Tab inside Profile
  const [profileTab, setProfileTab] = useState<'turkish-cv' | 'resume' | 'profile' | 'applications'>(
    activeTab === 'my-applications' ? 'applications' : 'turkish-cv'
  );

  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentSeeker?.phone || '');
  const [targetCity, setTargetCity] = useState(currentSeeker?.targetCity || 'استانبول');
  const [turkishLevel, setTurkishLevel] = useState<TurkishLevel>(currentSeeker?.turkishLevel || 'basic');
  const [residenceStatus, setResidenceStatus] = useState<ResidenceStatus>(currentSeeker?.residenceStatus || 'none');
  const [skills, setSkills] = useState(currentSeeker?.skills.join('، ') || '');
  const [bio, setBio] = useState(currentSeeker?.bio || '');

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
      phone,
      targetCity,
      turkishLevel,
      residenceStatus,
      skills: skillsArray,
      bio,
    });

    if (res.success) {
      setIsEditing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            در انتظار بررسی کارفرما
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
            مشاهده شده توسط کارفرما
          </span>
        );
      case 'interview':
        return (
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            دعوت به مصاحبه حضوری
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            تایید نهایی و استخدام
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl print:hidden">
          <div className="space-y-1 text-center sm:text-right">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>پروفایل و بخش‌های اختصاصی کارجو (قفل امنیتی)</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              تمامی امکانات اختصاصی کارجو، ذخیره پرونده هویتی، ساخت و چاپ رسمی رزومه (CV) و ارسال رزومه به کارفرمایان ترکیه تا زمان ثبت‌نام، واریز وجه ۵۰۰ لیر و تایید رسمی مدیریت سامانه قفل باقی می‌ماند.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md shadow-red-700/30 transition flex items-center gap-1.5"
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Mobile Version / PWA Install Banner transferred to Settings */}
      <PWAInstallBanner />

      {/* Pending Verification Warning Banner if Unapproved */}
      {currentSeeker.verificationStatus !== 'approved' && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 font-bold text-lg">
              🔒
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">
                وضعیت حساب کاربری: در انتظار تایید مدارک و واریز وجه (۵۰۰ لیر)
              </p>
              <p className="text-slate-300 leading-relaxed">
                مشخصات اولیه شما ثبت گردیده است. جهت فعال‌سازی نهایی حساب جهت ارسال رزومه به کارفرمایان و تایید پرونده، ۵۰۰ لیر را پرداخت کرده و فیش را تحویل مدیریت دهید.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl font-bold whitespace-nowrap self-start sm:self-center">
            در انتظار فعال‌سازی ⏳
          </span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 dark:from-red-950 dark:via-slate-900 dark:to-slate-900 light:from-red-900 light:via-slate-800 light:to-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-xl print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-600/40">
              {currentSeeker.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentSeeker.fullName}</h1>
                {currentSeeker.verificationStatus === 'approved' ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    حساب فعال و تاییدشده ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    در انتظار تایید مدیریت ⏳
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                نام کاربری: <span className="font-mono text-red-300 font-bold" dir="ltr">@{currentSeeker.username}</span> | کد ملی: <span className="font-mono">{currentSeeker.nationalId}</span>
              </p>
              {currentSeeker.registeredByPartnerName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    ثبت‌شده توسط همکار رسمی: <strong>{currentSeeker.registeredByPartnerName}</strong>
                    {currentSeeker.registeredByPartnerCode && ` (کد: ${currentSeeker.registeredByPartnerCode})`}
                  </span>
                  {currentSeeker.isTemporaryRegistration && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      پیش‌ثبت‌نام موقت
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logoutSeeker}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold rounded-xl border border-red-500/30 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              خروج از حساب
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setProfileTab('turkish-cv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              profileTab === 'turkish-cv'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            رزومه‌ساز استاندارد ترکیه‌ای (CV)
            <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-black">
              Türk CV
            </span>
          </button>

          <button
            onClick={() => setProfileTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              profileTab === 'resume'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Award className="w-4 h-4" />
            رزومه فارسی کارباما
          </button>

          <button
            onClick={() => setProfileTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              profileTab === 'profile'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <User className="w-4 h-4" />
            مشخصات و تغییر رمز
          </button>

          <button
            onClick={() => setProfileTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              profileTab === 'applications'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            پیگیری درخواست‌ها ({myApplications.length})
          </button>
        </div>
      </div>

      {/* Tab 0: Standard Turkish CV Builder */}
      {profileTab === 'turkish-cv' && <CVBuilder />}

      {/* Tab 1: Online Karbama Resume Builder */}
      {profileTab === 'resume' && <ResumeBuilder />}

      {/* Tab 2: Profile & Password Settings */}
      {profileTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Section 1: Seeker Profile Info */}
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                <IdCard className="w-4 h-4 text-red-500" />
                مشخصات ثبت‌نامی و هویتی شما
              </h2>
              <span className="text-[11px] text-slate-400">اطلاعات پرونده کارجو</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  نام و نام خانوادگی:
                </span>
                <span className="font-bold text-white dark:text-white light:text-slate-900">{currentSeeker.fullName}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="text-sm">👤</span>
                  جنسیت:
                </span>
                <span className="font-bold text-white dark:text-white light:text-slate-900">
                  {currentSeeker.gender === 'female' ? 'زن (خانم)' : 'مرد (آقا)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  نام پدر:
                </span>
                <span className="font-bold text-white dark:text-white light:text-slate-900">{currentSeeker.fatherName}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-slate-500" />
                  کد ملی:
                </span>
                <span className="font-mono text-white dark:text-white light:text-slate-900">{currentSeeker.nationalId}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  شماره تماس / واتساپ:
                </span>
                <span className="font-mono text-white dark:text-white light:text-slate-900" dir="ltr">{currentSeeker.phone}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  کشور مقصد انتخابی:
                </span>
                <span className="font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                  {currentSeeker.targetCountry || 'ترکیه'} ({currentSeeker.targetCity || 'استانبول'})
                </span>
              </div>

              {currentSeeker.iranProvince && (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    سکونت در ایران:
                  </span>
                  <span className="text-white dark:text-white light:text-slate-900">
                    استان {currentSeeker.iranProvince}، {currentSeeker.iranCity}
                  </span>
                </div>
              )}

              {currentSeeker.iranAddress && (
                <div className="p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block text-[11px]">آدرس کامل در ایران:</span>
                  <p className="text-slate-200 dark:text-slate-200 light:text-slate-700 leading-relaxed text-[11px]">
                    {currentSeeker.iranAddress}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  سطح تسلط به زبان:
                </span>
                <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-medium">{getTurkishLevelLabel(currentSeeker.turkishLevel)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  وضعیت اقامت و گذرنامه:
                </span>
                <span className="text-emerald-400 font-medium">{getResidenceLabel(currentSeeker.residenceStatus)}</span>
              </div>
            </div>

            {/* Documents & Signed Contract Summary */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-500" />
                <span>مدارک پرسنلی و تعهدنامه ثبت‌شده</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">عکس پاسپورت:</span>
                  <span className="font-bold text-emerald-400">
                    {currentSeeker.passportPhotoUrl ? 'بارگذاری شد ✓' : 'ثبت نشده'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">عکس تمام قد:</span>
                  <span className="font-bold text-emerald-400">
                    {currentSeeker.fullBodyPhotoUrl ? 'بارگذاری شد ✓' : 'ثبت نشده'}
                  </span>
                </div>
              </div>

              {currentSeeker.signatureDataUrl && (
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">تعهدنامه تسویه حساب کارگزار:</span>
                    <span className="text-[10px] text-emerald-400 font-bold">امضا شده ✓</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    تاریخ عقد: {currentSeeker.contractDateShamsi || '۱۴۰۵/۰۸/۰۴'} شمسی | {currentSeeker.contractDateMiladi || '2026/10/26'} میلادی
                  </div>
                  {currentSeeker.payerCardNumber && (
                    <div className="text-[10px] text-slate-300 font-mono" dir="ltr">
                      کارت واریز کننده: {currentSeeker.payerCardNumber}
                    </div>
                  )}
                  <div className="bg-white/10 p-1.5 rounded-lg border border-red-500/20 flex items-center justify-center">
                    <img
                      src={currentSeeker.signatureDataUrl}
                      alt="امضای ثبت شده"
                      className="h-10 max-w-full object-contain filter invert"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Change Password & Edit Quick Info */}
          <div className="space-y-6">
            {/* Change Password Form */}
            <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  تغییر رمز عبور حساب کارجو
                </h2>
                <span className="text-[11px] text-slate-400">امنیت حساب</span>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
                {passError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs">
                    {passError}
                  </div>
                )}

                {passSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {passSuccess}
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">رمز عبور فعلی</label>
                  <div className="relative">
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      required
                      dir="ltr"
                      placeholder="رمز کنونی"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl px-3 py-2 text-xs text-white dark:text-white light:text-slate-900 font-mono text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">رمز عبور جدید</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      dir="ltr"
                      placeholder="حداقل ۵ کاراکتر"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl px-3 py-2 text-xs text-white dark:text-white light:text-slate-900 font-mono text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">تکرار رمز عبور جدید</label>
                  <input
                    type="password"
                    required
                    dir="ltr"
                    placeholder="تکرار رمز عبور جدید"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl px-3 py-2 text-xs text-white dark:text-white light:text-slate-900 font-mono text-left"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  ثبت و تغییر رمز عبور
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: My Applications */}
      {profileTab === 'applications' && (
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-lg space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                پیگیری درخواست‌های استخدامی من
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              تعداد: <strong>{myApplications.length}</strong> درخواست
            </span>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-50 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <p className="text-xs text-slate-400 mb-2">هنوز برای هیچ فرصت شغلی در ترکیه درخواستی ارسال نکرده‌اید.</p>
              <p className="text-[11px] text-slate-500">از تب «فرصت‌های شغلی» آگهی‌های مورد نظر خود را بررسی و با یک کلیک درخواست دهید.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-800/70 dark:bg-slate-800/70 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white dark:text-white light:text-slate-900 text-sm">{app.jobTitle}</span>
                      <span className="px-2 py-0.5 bg-slate-700 dark:bg-slate-700 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 rounded text-[10px]">
                        {app.city}
                      </span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">کارفرما: {app.companyName}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      تاریخ ارسال: {new Date(app.appliedAt).toLocaleDateString('fa-IR')}
                    </p>
                    {app.adminNote && (
                      <div className="mt-2 p-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-lg border border-slate-700 dark:border-slate-700 light:border-slate-200 text-[11px] text-amber-300 dark:text-amber-300 light:text-amber-700">
                        <strong>پیام کارفرما/مدیر:</strong> {app.adminNote}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">{getStatusBadge(app.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
