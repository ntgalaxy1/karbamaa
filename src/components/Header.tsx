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

  const languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-md border-b border-slate-800 dark:border-slate-800 light:border-slate-200 transition-colors">
        {/* Dynamic theme accent line on the very top of Header */}
        <div style={{ background: 'var(--primary-topbar)' }} className="h-1 w-full transition-all duration-300 shadow-xs" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & App Brand - کارباما */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setActiveTab('jobs')}
                className="cursor-pointer flex items-center gap-3 group"
              >
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="لوگوی رسمی کارباما"
                    className="w-11 h-11 rounded-full object-cover shadow-lg shadow-red-600/20 border-2 border-amber-400/60 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300 ring-2 ring-slate-800"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="سامانه فعال است" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-white dark:text-white light:text-slate-900 group-hover:text-amber-400 transition">
                      کارباما
                    </span>
                    <span className="text-[10px] bg-amber-500/15 text-amber-300 dark:text-amber-300 light:text-amber-700 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-bold tracking-wider">
                      KARBAMA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 hidden sm:block">
                    سامانه کاریابی و اقامت ایرانیان در ترکیه
                  </p>
                </div>
              </div>

              {/* Status Indicator (Only if admin is logged in) */}
              {isAdminLoggedIn && (
                <div className="hidden md:flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-300 font-bold">مدیریت فعال است</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('jobs')}
                style={activeTab === 'jobs' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'jobs'
                    ? 'text-white shadow-sm font-bold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                فرصت‌های شغلی
              </button>

              {/* Dedicated Post Job (500 TL) - Hidden in Jobseeker mode (ثبت آگهی در پنل کارجو حذف) */}
              {(!currentSeeker || isAdminLoggedIn || Boolean(currentPartner)) && (
                <button
                  onClick={() => setActiveTab('post-job')}
                  style={activeTab === 'post-job' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'post-job'
                      ? 'text-white shadow-sm'
                      : 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  ثبت آگهی استخدام (۵۰۰ لیر)
                </button>
              )}

              {/* Dedicated Partner Section (بخش همکاران) */}
              <button
                onClick={() => setActiveTab('partner')}
                style={activeTab === 'partner' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'partner'
                    ? 'text-white shadow-sm'
                    : 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                بخش همکاران
              </button>

              {/* Dedicated Map Tab */}
              <button
                onClick={() => setActiveTab('map')}
                style={activeTab === 'map' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 relative ${
                  activeTab === 'map'
                    ? 'text-white shadow-sm font-bold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                نقشه تعاملی
              </button>

              {/* Dedicated Hotels */}
              <button
                onClick={() => setActiveTab('addresses')}
                style={activeTab === 'addresses' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'addresses'
                    ? 'text-white shadow-sm font-bold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100'
                }`}
              >
                <Hotel className="w-4 h-4" />
                هتل‌ها
              </button>

              {/* Applications Tracking */}
              <button
                onClick={() => setActiveTab('my-applications')}
                style={activeTab === 'my-applications' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'my-applications'
                    ? 'text-white shadow-sm font-bold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                پیگیری درخواست‌ها
                {myApplicationsCount > 0 && (
                  <span
                    style={{ backgroundColor: 'var(--primary-hover)' }}
                    className="px-1.5 py-0.2 text-white rounded-full text-[10px] font-bold"
                  >
                    {myApplicationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('cv-builder')}
                style={activeTab === 'cv-builder' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'cv-builder'
                    ? 'text-white shadow-sm font-bold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                رزومه‌ساز (CV)
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                style={activeTab === 'settings' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'text-white shadow-sm font-bold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/80 light:hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                پروفایل
              </button>

              <button
                onClick={() => setActiveTab('currency')}
                style={activeTab === 'currency' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'currency'
                    ? 'text-white shadow-sm'
                    : 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                قیمت ارز
              </button>

              <button
                onClick={() => setActiveTab('about-us')}
                style={activeTab === 'about-us' ? { backgroundColor: 'var(--primary-color)' } : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'about-us'
                    ? 'text-white shadow-sm'
                    : 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Info className="w-4 h-4 text-amber-400" />
                درباره ما
              </button>

              {/* Admin Panel Tab */}
              {isAdminLoggedIn && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  مدیریت
                </button>
              )}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sleek Compact Dropdown Menu for Android APK, Share, Palette, Theme & Language */}
              <div className="relative">
                <button
                  onClick={() => {
                    setToolsDropdown(!toolsDropdown);
                    setUserDropdown(false);
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300 flex items-center gap-1.5 text-xs font-bold transition shadow-xs shrink-0"
                  title="منوی امکانات، دانلود و تنظیمات"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">دانلود و امکانات</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${toolsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {toolsDropdown && (
                  <>
                    {/* Fixed click-outside backdrop overlay to prevent clicks and dismiss cleanly */}
                    <div
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity"
                      onClick={() => setToolsDropdown(false)}
                    />

                    {/* Contained, screen-safe Dropdown Menu */}
                    <div className="fixed sm:absolute top-16 left-3 right-3 sm:left-0 sm:right-auto sm:top-full mt-2 sm:w-72 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain bg-slate-900/98 dark:bg-slate-900/98 light:bg-white border-2 border-amber-500/40 rounded-2xl shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-800 flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>امکانات و تنظیمات</span>
                        </span>
                        <button
                          onClick={() => setToolsDropdown(false)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="بستن منو"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Day / Night Theme Toggle Option (Transferred inside tools menu) */}
                      <button
                        onClick={() => {
                          toggleTheme();
                          setToolsDropdown(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-indigo-600" />
                          )}
                          <span className="font-bold">
                            {theme === 'dark' ? 'تغییر به تم روز (حالت روشن ☀️)' : 'تغییر به تم شب (حالت تاریک 🌙)'}
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold">
                          {theme === 'dark' ? 'شب 🌙' : 'روز ☀️'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setApkModalOpen(true);
                          setToolsDropdown(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold">دانلود نسخه اندروید (APK)</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-mono">
                          v10.0.0.12
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShareModalOpen(true);
                          setToolsDropdown(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center gap-2 transition"
                      >
                        <Share2 className="w-4 h-4 text-rose-400" />
                        <span className="font-bold">اشتراک‌گذاری برنامه</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('currency');
                          setToolsDropdown(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="font-bold">قیمت ارز (لیر و دلار)</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-mono font-bold">
                          نرخ روز 🟢
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setThemeModalOpen(true);
                          setToolsDropdown(false);
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-slate-200 dark:text-slate-200 light:text-slate-800 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <Palette style={{ color: 'var(--primary-color)' }} className="w-4 h-4" />
                          <span className="font-bold">پالت پوسته و سفارشی‌سازی</span>
                        </div>
                        <span style={{ backgroundColor: 'var(--primary-color)' }} className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20" />
                      </button>

                      <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 my-1 pt-1">
                        <p className="px-3 py-1 text-[10px] font-bold text-slate-400 text-right flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-indigo-400" />
                          زبان برنامه (Language)
                        </p>
                        <div className="grid grid-cols-2 gap-1 px-1 mt-1">
                          {languages.map((l) => (
                            <button
                              key={l.code}
                              onClick={() => {
                                setAppLanguage(l.code);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-right text-xs font-medium flex items-center gap-1.5 transition ${
                                appLanguage === l.code
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 light:hover:bg-slate-100'
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
                        <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 my-1 pt-1">
                          <button
                            onClick={() => {
                              if (isAdminLoggedIn) logoutAdmin();
                              else if (currentPartner) logoutPartner();
                              else if (currentSeeker) logoutSeeker();
                              setToolsDropdown(false);
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center justify-between font-bold transition text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4 text-red-400" />
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
                className="relative p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition flex items-center justify-center border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 shrink-0"
                title="اعلان‌ها و هشدارهای شغلی کارباما"
              >
                <Bell className="w-4 h-4 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono animate-pulse shadow-md">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Admin or User profile Badge without top bar logout buttons */}
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-700/30"
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
                    className="flex items-center gap-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 px-2.5 py-1.5 rounded-xl transition text-right shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-bold text-xs shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-right">
                      <p className="text-xs font-bold text-white leading-tight">
                        {currentPartner.companyName}
                      </p>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">همکار</span>
                    </div>
                  </button>
                </div>
              ) : currentSeeker ? (
                <div className="flex items-center gap-1.5 shrink-0 relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700/80 border border-slate-700 dark:border-slate-700 light:border-slate-300 px-2.5 py-1.5 rounded-xl transition text-right max-w-[150px] sm:max-w-none"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                      {currentSeeker.fullName.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <p className="text-xs font-bold text-white dark:text-white light:text-slate-900 truncate">
                        {currentSeeker.fullName}
                      </p>
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-extrabold shrink-0">
                        کارجو
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity"
                        onClick={() => setUserDropdown(false)}
                      />
                      <div className="fixed sm:absolute top-16 left-3 right-3 sm:left-0 sm:right-auto sm:top-full mt-2 sm:w-64 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain bg-slate-900/98 dark:bg-slate-900/98 light:bg-white border-2 border-slate-700 dark:border-slate-700 light:border-slate-200 rounded-2xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-right flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white dark:text-white light:text-slate-900">{currentSeeker.fullName}</p>
                            <p className="text-[11px] text-slate-400">نام پدر: {currentSeeker.fatherName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">نام کاربری: @{currentSeeker.username}</p>
                          </div>
                          <button
                            onClick={() => setUserDropdown(false)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setUserDropdown(false);
                          }}
                          className="w-full text-right px-4 py-2 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          مشخصات و رزومه‌ساز آنلاین
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('my-applications');
                            setUserDropdown(false);
                          }}
                          className="w-full text-right px-4 py-2 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:bg-slate-800/80 dark:hover:bg-slate-800/80 light:hover:bg-slate-100 flex items-center gap-2"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                          پیگیری درخواست‌های کار
                        </button>

                        <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 my-1"></div>

                        <button
                          onClick={() => {
                            logoutSeeker();
                            setUserDropdown(false);
                          }}
                          className="w-full text-right px-4 py-2 text-red-400 hover:bg-red-500/10 font-bold flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-400" />
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
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-700 text-xs font-medium rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>ورود</span>
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 transition"
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
