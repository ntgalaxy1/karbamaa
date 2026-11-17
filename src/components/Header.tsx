import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';
import { NotificationDrawer } from './NotificationDrawer';
import { JobAlertModal } from './JobAlertModal';
import { ShareModal } from './ShareModal';
import { ApkDownloadModal } from './ApkDownloadModal';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';
import { AboutUsModal } from './AboutUsModal';
import { AppLanguage } from '../types';
import { t } from '../utils/translations';
import { APP_VERSION } from '../version';
import {
  KARBAMA_LOGO_DATA_URI,
  KARBAMA_USER_AVATAR_DATA_URI,
  KARBAMA_PARTNER_AVATAR_DATA_URI,
} from '../utils/brandAssets';
import {
  Briefcase,
  MapPin,
  FileCheck2,
  FileText,
  Settings,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  Sparkles,
  Share2,
  Smartphone,
  Palette,
  Compass,
  Hotel,
  Info,
  PlusCircle,
  Globe,
  Sliders,
  MoreVertical,
  Building2,
  Users,
  Coins,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentSeeker,
    currentPartner,
    isAdminLoggedIn,
    applications,
    logoutSeeker,
    logoutPartner,
    logoutAdmin,
    unreadNotificationCount,
    theme,
    toggleTheme,
    setThemeModalOpen,
    appLanguage,
    setAppLanguage,
    setAdminJobModalOpen,
    setAdminHotelModalOpen,
    setAdminAddressModalOpen,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  const [userDropdown, setUserDropdown] = useState(false);
  const [toolsDropdown, setToolsDropdown] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [jobAlertModalOpen, setJobAlertModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [apkModalOpen, setApkModalOpen] = useState(false);
  const [aboutUsModalOpen, setAboutUsModalOpen] = useState(false);

  // Filter seeker's applications count
  const myApplicationsCount = currentSeeker
    ? applications.filter((a) => a.seekerId === currentSeeker.id).length
    : 0;

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setUserDropdown(false);
  };

  const isOnAdminRoute =
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'))) ||
    activeTab === 'admin';

  const languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors w-full overflow-x-clip ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
            : 'bg-slate-900/95 border-slate-800 text-white'
        }`}
      >
        {/* Dynamic theme accent line on the very top of Header */}
        <div style={{ background: 'var(--primary-topbar)' }} className="h-1 w-full transition-all duration-300 shadow-xs" />
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-3 w-full min-w-0">
            {/* Logo & App Brand - کارباما */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
              <div
                onClick={() => {
                  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                    window.history.pushState({}, '', '/');
                  }
                  setActiveTab('jobs');
                }}
                className="cursor-pointer flex items-center gap-1.5 sm:gap-2.5 group shrink min-w-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={KARBAMA_LOGO_DATA_URI}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = KARBAMA_LOGO_DATA_URI;
                    }}
                    alt="لوگوی رسمی کارباما"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-lg shadow-blue-900/20 border-2 border-amber-400/90 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300 ring-2 ring-slate-800"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" title="سامانه فعال است" />
                </div>
                <div className="shrink min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <span
                      className={`font-black text-sm sm:text-xl tracking-tight transition truncate ${
                        theme === 'light'
                          ? 'text-slate-900 group-hover:text-blue-700'
                          : 'text-white group-hover:text-amber-400'
                      }`}
                    >
                      {t('appName', appLanguage)}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[11px] px-1 sm:px-2 py-0.5 rounded-lg font-black tracking-wider shrink-0 border ${
                        theme === 'light'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      KARBAMA
                    </span>
                  </div>
                  <p
                    className={`text-[11px] font-medium hidden md:block truncate ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {t('appSubtitle', appLanguage)}
                  </p>
                </div>
              </div>

              {/* Status Indicator (Only if admin is logged in AND on /admin route) */}
              {isAdminLoggedIn && isOnAdminRoute && (
                <div
                  className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shrink-0 border ${
                    theme === 'light'
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-black">{t('adminRole', appLanguage)}</span>
                </div>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Compact Icon-Only Day / Night Theme Toggle Button (no text labels) */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
                title={theme === 'dark' ? 'حالت روز (روشن)' : 'حالت شب (تاریک)'}
                className={`p-2 rounded-xl border transition flex items-center justify-center shrink-0 cursor-pointer shadow-xs ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80'
                }`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-700" />
                )}
              </button>

              {/* Sleek Compact Dropdown Menu for Features & Tools (بخش امکانات) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setToolsDropdown(!toolsDropdown);
                    setUserDropdown(false);
                  }}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition shadow-xs shrink-0 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                  }`}
                  title="منوی امکانات، دانلود و تنظیمات"
                >
                  <Sliders className={`w-4.5 h-4.5 ${theme === 'light' ? 'text-blue-700' : 'text-amber-400'}`} />
                  <span className="hidden sm:inline">{t('featuresAndTools', appLanguage)}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    } ${toolsDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {toolsDropdown && (
                  <>
                    {/* Fixed click-outside backdrop overlay to prevent clicks and dismiss cleanly */}
                    <div
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity"
                      onClick={() => setToolsDropdown(false)}
                    />

                    {/* Contained, screen-safe Dropdown Menu with High Contrast in both Light & Dark Mode */}
                    <div
                      className={`fixed sm:absolute top-16 left-3 right-3 sm:left-0 sm:right-auto sm:top-full mt-2 sm:w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 border-2 ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20'
                          : 'bg-slate-900 border-amber-500/40 text-slate-100 shadow-black/60'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 text-xs font-black flex items-center justify-between border-b mb-2 ${
                          theme === 'light'
                            ? 'text-slate-900 border-slate-200'
                            : 'text-white border-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Sliders className={`w-4 h-4 ${theme === 'light' ? 'text-blue-700' : 'text-amber-400'}`} />
                          <span>{t('featuresAndTools', appLanguage)}</span>
                        </span>
                        <button
                          onClick={() => setToolsDropdown(false)}
                          className={`p-1 rounded-lg transition cursor-pointer ${
                            theme === 'light'
                              ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="بستن منو"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Admin Access Section (Strictly only on /admin route) */}
                      {isAdminLoggedIn && isOnAdminRoute && (
                        <div
                          className={`rounded-2xl p-3 mb-2.5 space-y-2 text-right border-2 ${
                            theme === 'light'
                              ? 'bg-amber-50 border-amber-300 text-slate-900'
                              : 'bg-amber-500/10 border-amber-500/50 text-white'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-between border-b pb-1.5 ${
                              theme === 'light' ? 'border-amber-200' : 'border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                              </span>
                              <span
                                className={`font-black text-xs ${
                                  theme === 'light' ? 'text-amber-900' : 'text-amber-300'
                                }`}
                              >
                                دسترسی مدیر فعال است
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                theme === 'light'
                                  ? 'bg-amber-200 text-amber-950 border-amber-400'
                                  : 'bg-amber-500/30 text-amber-200 border-amber-400/30'
                              }`}
                            >
                              مدیر سیستم
                            </span>
                          </div>

                          <p
                            className={`text-[11px] font-semibold leading-tight ${
                              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                            }`}
                          >
                            دسترسی سریع افزودن آگهی، هتل، آدرس و پنل مدیریت:
                          </p>

                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              onClick={() => {
                                setAdminJobModalOpen(true);
                                setToolsDropdown(false);
                              }}
                              className="px-2 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                              title="افزودن سریع آگهی جدید"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-white" />
                              <span>ثبت آگهی استخدام</span>
                            </button>

                            <button
                              onClick={() => {
                                setAdminHotelModalOpen(true);
                                setToolsDropdown(false);
                              }}
                              className="px-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                              title="افزودن هتل رو نقشه"
                            >
                              <Hotel className="w-3.5 h-3.5 text-white" />
                              <span>افزودن هتل</span>
                            </button>

                            <button
                              onClick={() => {
                                setAdminAddressModalOpen(true);
                                setToolsDropdown(false);
                              }}
                              className="px-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                              title="افزودن سفارت یا مرکز"
                            >
                              <Building2 className="w-3.5 h-3.5 text-white" />
                              <span>افزودن آدرس</span>
                            </button>

                            <button
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  window.history.pushState({}, '', '/admin');
                                }
                                setActiveTab('admin');
                                setToolsDropdown(false);
                              }}
                              className="px-2 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                              title="ورود به پنل مدیریت جامع (/admin)"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-white" />
                              <span>پنل مدیریت</span>
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              logoutAdmin();
                              setToolsDropdown(false);
                            }}
                            className={`w-full mt-1 px-2.5 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                              theme === 'light'
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                            }`}
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>خروج از مدیریت سیستم</span>
                          </button>
                        </div>
                      )}

                      <div className="space-y-1">
                        {/* Partner Panel (پنل ساده همکاران) */}
                        {(isAdminLoggedIn || currentPartner) && (
                          <button
                            onClick={() => {
                              setActiveTab('partner');
                              setToolsDropdown(false);
                            }}
                            className={`w-full text-right px-3 py-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                              theme === 'light'
                                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-200'
                                : 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-100 border-indigo-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Users className={`w-4 h-4 ${theme === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`} />
                              <span className="font-bold">پنل همکار (ثبت و مدیریت کارجویان)</span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                                theme === 'light'
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                  : 'bg-indigo-500/30 text-indigo-200 border-indigo-400/30'
                              }`}
                            >
                              همکار
                            </span>
                          </button>
                        )}

                        {/* Jobseeker Profile & Settings (مشخصات و تنظیمات حساب) */}
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setToolsDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100'
                              : 'text-slate-100 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Settings className={`w-4 h-4 ${theme === 'light' ? 'text-blue-700' : 'text-cyan-400'}`} />
                            <span className="font-bold">مشخصات و تنظیمات حساب</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                              theme === 'light'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            پروفایل
                          </span>
                        </button>

                        {/* Resume Builder (رزومه‌ساز) */}
                        <button
                          onClick={() => {
                            setActiveTab('cv-builder');
                            setToolsDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100'
                              : 'text-slate-100 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className={`w-4 h-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                            <span className="font-bold">{t('cvBuilder', appLanguage)}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                              theme === 'light'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            دو زبانه | PDF
                          </span>
                        </button>

                        {/* Currency Rates (قیمت ارز) */}
                        <button
                          onClick={() => {
                            setActiveTab('currency');
                            setToolsDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100'
                              : 'text-slate-100 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Coins className={`w-4 h-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                            <span className="font-bold">{t('currencyRates', appLanguage)}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                              theme === 'light'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {t('liveRates', appLanguage)}
                          </span>
                        </button>

                        {/* About Us (درباره ما) */}
                        <button
                          onClick={() => {
                            setAboutUsModalOpen(true);
                            setActiveTab('about-us');
                            setToolsDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100'
                              : 'text-slate-100 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Info className={`w-4 h-4 ${theme === 'light' ? 'text-sky-600' : 'text-sky-400'}`} />
                            <span className="font-bold">{t('aboutUs', appLanguage)}</span>
                          </div>
                        </button>

                        <div
                          className={`border-t my-1.5 ${
                            theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                          }`}
                        />

                        <button
                          onClick={() => {
                            setShareModalOpen(true);
                            setToolsDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100'
                              : 'text-slate-100 hover:bg-slate-800/90'
                          }`}
                        >
                          <Share2 className={`w-4 h-4 ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`} />
                          <span className="font-bold">اشتراک‌گذاری برنامه</span>
                        </button>

                        <button
                          onClick={() => {
                            setThemeModalOpen(true);
                            setToolsDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100'
                              : 'text-slate-100 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Palette style={{ color: 'var(--primary-color)' }} className="w-4 h-4" />
                            <span className="font-bold">پالت پوسته و سفارشی‌سازی</span>
                          </div>
                          <span
                            style={{ backgroundColor: 'var(--primary-color)' }}
                            className={`w-3 h-3 rounded-full ring-2 ${
                              theme === 'light' ? 'ring-slate-300' : 'ring-white/30'
                            }`}
                          />
                        </button>
                      </div>

                      <div
                        className={`border-t my-2 pt-2 ${
                          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                        }`}
                      >
                        <p
                          className={`px-2 py-1 text-[11px] font-extrabold text-right flex items-center gap-1.5 ${
                            theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        >
                          <Globe className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-700' : 'text-indigo-400'}`} />
                          زبان برنامه (Language)
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 px-1 mt-1">
                          {languages.map((l) => (
                            <button
                              key={l.code}
                              onClick={() => {
                                setAppLanguage(l.code);
                              }}
                              className={`px-2.5 py-2 rounded-xl text-right text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                                appLanguage === l.code
                                  ? theme === 'light'
                                    ? 'bg-blue-50 text-blue-900 border-blue-400 font-black shadow-2xs'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black'
                                  : theme === 'light'
                                  ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-semibold'
                                  : 'bg-slate-800/40 text-slate-200 border-slate-800 hover:bg-slate-800 font-medium'
                              }`}
                            >
                              <span>{l.flag}</span>
                              <span>{l.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dedicated Logout Option inside Features Menu */}
                      {(isAdminLoggedIn || currentPartner || currentSeeker) && (
                        <div
                          className={`border-t mt-2 pt-2 ${
                            theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                          }`}
                        >
                          <button
                            onClick={() => {
                              if (isAdminLoggedIn) logoutAdmin();
                              else if (currentPartner) logoutPartner();
                              else if (currentSeeker) logoutSeeker();
                              setToolsDropdown(false);
                            }}
                            className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between font-bold transition text-xs cursor-pointer border ${
                              theme === 'light'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4" />
                              <span>خروج از حساب ({isAdminLoggedIn ? 'مدیر' : currentPartner ? 'همکار' : 'کارجو'})</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Job Alert & Notifications Bell */}
              <button
                onClick={() => setNotificationDrawerOpen(true)}
                className={`relative p-2 rounded-xl border transition flex items-center justify-center shrink-0 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80'
                }`}
                title="اعلان‌ها و هشدارهای شغلی کارباما"
              >
                <Bell className={`w-4 h-4 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono animate-pulse shadow-md">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Admin or User profile Badge without top bar logout buttons */}
              {isAdminLoggedIn && isOnAdminRoute ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/admin');
                      }
                      setActiveTab('admin');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-700/30 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">داشبورد مدیر</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-200 text-[10px] font-bold">مدیریت</span>
                  </button>
                </div>
              ) : currentPartner ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('partner')}
                    className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-xl transition text-right shadow-sm cursor-pointer ${
                      theme === 'light'
                        ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-950'
                        : 'bg-indigo-950/70 hover:bg-indigo-900/80 border-indigo-500/40 text-white'
                    }`}
                  >
                    <img
                      src={KARBAMA_PARTNER_AVATAR_DATA_URI}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = KARBAMA_PARTNER_AVATAR_DATA_URI;
                      }}
                      alt={currentPartner.companyName}
                      className="w-6 h-6 rounded-full object-cover border border-indigo-400/60 shrink-0"
                    />
                    <div className="hidden sm:flex items-center gap-1 text-right">
                      <p className={`text-xs font-bold leading-tight ${theme === 'light' ? 'text-indigo-950' : 'text-white'}`}>
                        {currentPartner.companyName}
                      </p>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                          theme === 'light'
                            ? 'bg-indigo-200 text-indigo-900 border-indigo-300'
                            : 'bg-indigo-500/30 text-indigo-200 border-indigo-400/30'
                        }`}
                      >
                        همکار
                      </span>
                    </div>
                  </button>
                </div>
              ) : currentSeeker ? (
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className={`flex items-center gap-1.5 border px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition text-right max-w-[120px] xs:max-w-[150px] sm:max-w-none shadow-sm shrink-0 cursor-pointer ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                        : 'bg-slate-800 hover:bg-slate-700/90 border-blue-500/30 text-white'
                    }`}
                  >
                    <img
                      src={currentSeeker.fullBodyPhotoUrl || currentSeeker.passportPhotoUrl || KARBAMA_USER_AVATAR_DATA_URI}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = KARBAMA_USER_AVATAR_DATA_URI;
                      }}
                      alt={currentSeeker.fullName}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 shadow-sm border border-amber-400/70"
                    />
                    <div className="flex items-center gap-1 truncate min-w-0">
                      <p className={`text-xs font-black truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {currentSeeker.fullName.split(' ')[0]}
                      </p>
                      <span
                        className={`hidden md:inline-block px-2 py-0.5 rounded-lg border text-[10px] font-black shrink-0 shadow-xs ${
                          theme === 'light'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-blue-600/20 text-blue-200 border-blue-500/40'
                        }`}
                      >
                        {t('jobseekerRole', appLanguage)} 👤
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity"
                        onClick={() => setUserDropdown(false)}
                      />
                      <div
                        className={`fixed sm:absolute top-16 left-3 right-3 sm:left-0 sm:right-auto sm:top-full mt-2 sm:w-68 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain border-2 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-slate-100'
                        }`}
                      >
                        <div
                          className={`px-4 py-2.5 border-b text-right flex items-center justify-between gap-2 ${
                            theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={currentSeeker.fullBodyPhotoUrl || currentSeeker.passportPhotoUrl || KARBAMA_USER_AVATAR_DATA_URI}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = KARBAMA_USER_AVATAR_DATA_URI;
                              }}
                              alt={currentSeeker.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-amber-400/70 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className={`font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                {currentSeeker.fullName}
                              </p>
                              <p className={`text-[11px] truncate ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                {t('fatherNameLabel', appLanguage)} {currentSeeker.fatherName}
                              </p>
                              <p className={`text-[10px] font-mono truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                @{currentSeeker.username}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setUserDropdown(false)}
                            className={`p-1 rounded-lg transition shrink-0 cursor-pointer ${
                              theme === 'light'
                                ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('cv-builder');
                            setUserDropdown(false);
                          }}
                          className={`w-full text-right px-4 py-2.5 flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100 font-bold'
                              : 'text-slate-200 hover:bg-slate-800/80 font-bold'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <FileText className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                            رزومه‌ساز آنلاین
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                              theme === 'light'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            دو زبانه | PDF
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setUserDropdown(false);
                          }}
                          className={`w-full text-right px-4 py-2.5 flex items-center gap-2 transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100 font-bold'
                              : 'text-slate-200 hover:bg-slate-800/80 font-bold'
                          }`}
                        >
                          <Settings className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-700' : 'text-slate-400'}`} />
                          مشخصات و تنظیمات حساب
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('my-applications');
                            setUserDropdown(false);
                          }}
                          className={`w-full text-right px-4 py-2.5 flex items-center justify-between transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-slate-900 hover:bg-slate-100 font-bold'
                              : 'text-slate-200 hover:bg-slate-800/80 font-bold'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <FileCheck2 className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-emerald-700' : 'text-slate-400'}`} />
                            پیگیری درخواست‌های کار
                          </span>
                          {myApplicationsCount > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                theme === 'light' ? 'bg-blue-100 text-blue-900' : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {myApplicationsCount}
                            </span>
                          )}
                        </button>

                        <div className={`border-t my-1 ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`} />

                        <button
                          onClick={() => {
                            logoutSeeker();
                            setUserDropdown(false);
                          }}
                          className={`w-full text-right px-4 py-2.5 font-bold flex items-center gap-2 transition cursor-pointer ${
                            theme === 'light'
                              ? 'text-red-700 hover:bg-red-50'
                              : 'text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          خروج کامل از حساب کارجو
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>ورود</span>
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>ثبت‌نام</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onOpenAlertModal={() => {
          setNotificationDrawerOpen(false);
          setJobAlertModalOpen(true);
        }}
      />

      <JobAlertModal
        isOpen={jobAlertModalOpen}
        onClose={() => setJobAlertModalOpen(false)}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <ApkDownloadModal
        isOpen={apkModalOpen}
        onClose={() => setApkModalOpen(false)}
      />

      <ThemeCustomizerModal />

      <AboutUsModal
        isOpen={aboutUsModalOpen}
        onClose={() => setAboutUsModalOpen(false)}
      />
    </>
  );
};
