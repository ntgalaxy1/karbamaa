import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLanguage } from '../types';
import {
  Globe,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Building2,
  FileCheck2,
  Sparkles,
  Phone,
  User,
  KeyRound,
  FileText,
  MapPin,
  Briefcase,
  DollarSign,
  HeartHandshake,
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const {
    appLanguage,
    setAppLanguage,
    setHasCompletedOnboarding,
    registerSeeker,
    showToast,
  } = useApp();

  // Screen state: 1 = Welcome & Language, 2 = Registration Form
  const [step, setStep] = useState<1 | 2>(1);

  // Form registration state
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [targetCity, setTargetCity] = useState('استانبول');
  const [skills, setSkills] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const languages: { code: AppLanguage; label: string; nativeName: string; flag: string; welcome: string; desc: string }[] = [
    {
      code: 'fa',
      label: 'فارسی',
      nativeName: 'فارسی',
      flag: '🇮🇷',
      welcome: 'به اپلیکیشن رسمی کارباما خوش آمدید',
      desc: 'جامع‌ترین سامانه کاریابی، اقامت و استقرار ایرانیان در ترکیه',
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !fatherName.trim() || !nationalId.trim() || !username.trim() || !password.trim()) {
      showToast('لطفاً تمام اطلاعات ضروری فرم ثبت‌نام را وارد فرمایید.', 'error');
      return;
    }

    const skillsArr = skills
      .split('،')
      .join(',')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'کارجو';
    const lastName = nameParts.slice(1).join(' ') || 'جدید';

    const res = registerSeeker({
      firstName,
      lastName,
      fullName: fullName.trim(),
      fatherName: fatherName.trim(),
      nationalId: nationalId.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      phoneCountryCode: '+90',
      phoneNumber: phone.trim() || '5300000000',
      phone: phone.trim() || '+90 530 000 0000',
      iranProvince: 'تهران',
      iranCity: 'تهران',
      iranAddress: 'اقامت اولیه',
      targetCountry: 'ترکیه',
      targetCity,
      gender,
      turkishLevel: 'basic',
      residenceStatus: 'none',
      skills: skillsArr.length > 0 ? skillsArr : ['کارگر ساده'],
      bio: 'کارجو ثبت‌نام شده از طریق onboarding اولیه',
    });

    if (res.success) {
      setHasCompletedOnboarding(true);
      showToast('ثبت‌نام اولیه با موفقیت انجام شد. اطلاعات جهت بررسی و فعال‌سازی ثبت گردید.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-300">
        {/* Accent top gradient bar */}
        <div style={{ background: 'var(--primary-topbar)' }} className="h-2 w-full" />

        {/* Step Indicator */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between text-xs border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${step === 1 ? 'bg-red-600 text-white' : 'bg-emerald-500 text-slate-950'}`}>
              {step === 1 ? '1' : '✓'}
            </span>
            <span className={step === 1 ? 'text-white font-bold' : 'text-slate-400'}>
              صفحه ۱: انتخاب زبان
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${step === 2 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              2
            </span>
            <span className={step === 2 ? 'text-white font-bold' : 'text-slate-400'}>
              صفحه ۲: تکمیل ثبت‌نام
            </span>
          </div>
        </div>

        {/* SCREEN 1: WELCOME & LANGUAGE SELECTION */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="relative inline-block mx-auto">
              <img
                src="/logo.png"
                alt="کارباما"
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-2xl shadow-red-950/80 ring-4 ring-amber-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
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
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-400 text-right flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" />
                لطفاً زبان مورد نظر خود را انتخاب کنید (Choose Language):
              </p>

              <div className="grid grid-cols-2 gap-3">
                {languages.map((l) => {
                  const isSelected = appLanguage === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => setAppLanguage(l.code)}
                      className={`p-4 rounded-2xl border text-right transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-lg shadow-amber-950/50 scale-[1.02]'
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
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-700/30 transition flex items-center justify-center gap-2 group"
              >
                <span>ورود به مرحله ثبت‌نام کارجو</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setHasCompletedOnboarding(true)}
                className="w-full sm:w-auto py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition shrink-0"
              >
                ورود مستقیم به برنامه
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: MULTI-STEP REGISTRATION FORM */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  صفحه ثبت‌نام کارجو در کارباما
                </h2>
                <p className="text-xs text-slate-400">
                  تکمیل تمامی مراحل جهت بررسی و فعال‌سازی توسط مدیر
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                تغییر زبان
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علی رضایی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                <label className="text-slate-300 font-medium">کد ملی / شماره شناسه *</label>
                <input
                  type="text"
                  required
                  placeholder="کد ۱۰ رقمی ملی"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">شماره موبایل / واتساپ</label>
                <input
                  type="text"
                  placeholder="+90 53X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">نام کاربری برای ورود *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: alireza99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">رمز عبور دلخواه *</label>
                <input
                  type="password"
                  required
                  placeholder="حداقل ۴ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">شهر مقصد در ترکیه</label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-red-500"
                >
                  <option value="استانبول">استانبول (İstanbul)</option>
                  <option value="آنتالیا">آنتالیا (Antalya)</option>
                  <option value="آنکارا">آنکارا (Ankara)</option>
                  <option value="ازمیر">ازمیر (İzmir)</option>
                  <option value="بورسا">بورسا (Bursa)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">مهارت‌ها و شغل درخواستی</label>
                <input
                  type="text"
                  placeholder="مثال: آشپزی، چرخکاری، باریستا"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span>قوانین و شرایط کاریابی کارباما در ترکیه را می‌پذیرم.</span>
              </label>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setHasCompletedOnboarding(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                انصراف و مشاهده برنامه
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-700/30 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                تکمیل ثبت‌نام و ورود
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
