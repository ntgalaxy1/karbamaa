/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { JobSearch } from './components/JobSearch';
import { EssentialAddresses } from './components/EssentialAddresses';
import { MapSection } from './components/MapSection';
import { ApplicationsSection } from './components/ApplicationsSection';
import { SettingsProfile } from './components/SettingsProfile';
import { CVBuilder } from './components/CVBuilder';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Briefcase,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { AdminQuickToolbar } from './components/AdminQuickToolbar';
import { AboutUsModal } from './components/AboutUsModal';
import { PostJobSection } from './components/PostJobSection';
import { AboutUsSection } from './components/AboutUsSection';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PartnerSection } from './components/PartnerSection';
import { CurrencyExchangeSection } from './components/CurrencyExchangeSection';

// Centered App Startup Splash Screen with Smooth Fade-out
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Keep visible for 1000ms then start 700ms smooth fade-out transition
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);

    const timer2 = setTimeout(() => {
      onFinish();
    }, 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center space-y-4 text-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-red-600 to-amber-500 opacity-60 blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="لوگوی رسمی کارباما"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-amber-400 shadow-2xl relative z-10 animate-in zoom-in-75 duration-500 ring-4 ring-amber-500/20"
          />
        </div>
        <div className="space-y-1 z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            کارباما <span className="text-amber-400 font-mono text-lg sm:text-xl">KARBAMA</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            سامانه جامع کاریابی، ساخت رزومه و اقامت ترکیه
          </p>
        </div>
        <div className="w-20 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500 rounded-full animate-pulse mt-2" />
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAdminLoggedIn,
    toasts,
    currentSeeker,
    currentPartner,
  } = useApp();
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [aboutUsModalOpen, setAboutUsModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Strict check: No guest direct entry into the app without registration/login
  const isUserAuthenticated = Boolean(currentSeeker || isAdminLoggedIn || currentPartner);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {!isUserAuthenticated ? (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
          <OnboardingFlow />

          {/* Floating Toast Notification Container for Onboarding */}
          <div className="fixed bottom-6 left-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-300 ${
                  toast.type === 'success'
                    ? 'bg-slate-900 border-emerald-500/50 text-emerald-200'
                    : toast.type === 'error'
                    ? 'bg-slate-900 border-red-500/50 text-red-200'
                    : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
                <span>{toast.message}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          {/* Dynamic Top Theme Color Bar (Changes with selected theme color) */}
          <div style={{ background: 'var(--primary-topbar)' }} className="h-1 w-full shrink-0 shadow-xs transition-all duration-300" />

          {/* Floating Omnipresent Admin Quick Toolbar (When Admin Logged In) */}
          <AdminQuickToolbar />

          {/* Main App Navigation Header */}
          <Header />

          {/* Main Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
            {activeTab === 'jobs' && <JobSearch />}
            {activeTab === 'post-job' && <PostJobSection />}
            {activeTab === 'partner' && <PartnerSection />}
            {activeTab === 'currency' && <CurrencyExchangeSection />}
            {activeTab === 'about-us' && <AboutUsSection />}
        {activeTab === 'map' && <MapSection />}
        {activeTab === 'addresses' && <EssentialAddresses />}
        {activeTab === 'my-applications' && <ApplicationsSection />}
        {activeTab === 'settings' && <SettingsProfile />}
        {activeTab === 'cv-builder' && <CVBuilder />}
        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <AdminPanel />
          ) : (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">بخش اختصاصی مدیران کارباما</h2>
              <p className="text-xs text-slate-400">
                این بخش فقط با ورود نام کاربری و رمز عبور مدیر سامانه قابل دسترسی است.
              </p>
              <button
                onClick={() => setAdminLoginModalOpen(true)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                ورود به بخش مدیریت (نام کاربری و رمز)
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer (Desktop & Universal) */}
      <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="لوگوی کارباما"
                className="w-7 h-7 rounded-full object-cover border border-amber-400/50 shadow-sm"
              />
              <span className="font-bold text-slate-800 dark:text-white">
                کارباما (KARBAMA) | سامانه کاریابی و اقامت ایرانیان در ترکیه
              </span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-slate-500">پشتیبانی آفلاین PWA و اندروید</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="hidden md:inline">شماره‌های ضروری: ۱۵۷ (اقامت) - ۱۷۰ (وزارت کار) - ۱۱۲ (اورژانس)</span>
              
              {/* About Us Link */}
              <button
                onClick={() => setAboutUsModalOpen(true)}
                className="text-amber-500 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 transition"
              >
                <Info className="w-3.5 h-3.5" />
                درباره ما
              </button>

              {/* Discreet Admin Login Trigger when not logged in */}
              {!isAdminLoggedIn ? (
                <button
                  onClick={() => setAdminLoginModalOpen(true)}
                  className="text-slate-400 dark:text-slate-500 hover:text-amber-400 flex items-center gap-1 transition"
                  title="ورود با دسترسی مدیریت (یوزرنیم و پسوورد)"
                >
                  <Lock className="w-3 h-3" />
                  ورود مدیر
                </button>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  مدیریت فعال
                </span>
              )}
            </div>
          </div>

          {/* User Requested Universal Faint Footer Attribution */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center">
            <p className="text-[11px] font-mono tracking-wide text-slate-400/70 dark:text-slate-500/70 select-none text-center">
              powered by Naser Tavakkoli . @Ntgalaxy
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-300 ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-slate-900 border-red-500/50 text-red-200'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Admin Login Modal */}
      <AuthModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        defaultMode="admin"
      />

      {/* About Us Modal */}
      <AboutUsModal
        isOpen={aboutUsModalOpen}
        onClose={() => setAboutUsModalOpen(false)}
      />
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
