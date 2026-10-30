import React from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, PlusCircle, Hotel, Info, UserCheck, ShieldCheck, Building2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdminLoggedIn, isPartnerLoggedIn, paymentSettings } = useApp();

  const colsClass = isAdminLoggedIn ? 'grid-cols-7' : 'grid-cols-6';

  return (
    <nav
      aria-label="منوی ناوبری پایین صفحه"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 dark:bg-slate-900/98 backdrop-blur-lg border-t border-slate-800 pb-safe transition-colors shadow-2xl"
    >
      {/* Top subtle theme accent line */}
      <div style={{ background: 'var(--primary-topbar)' }} className="h-0.5 w-full opacity-70" />

      <div className={`grid ${colsClass} h-16 items-center px-1`}>
        {/* 1. Jobs Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          style={activeTab === 'jobs' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            activeTab === 'jobs'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[9px]">فرصت‌ها</span>
        </button>

        {/* 2. Post Job (500 TL) Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('post-job')}
          style={activeTab === 'post-job' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition relative ${
            activeTab === 'post-job'
              ? 'font-bold scale-105'
              : 'text-amber-400/90 hover:text-amber-300'
          }`}
        >
          <div className="relative">
            <PlusCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[8px] font-bold font-mono">
              {paymentSettings?.feeTL || 500}
            </span>
          </div>
          <span className="text-[9px]">ثبت آگهی</span>
        </button>

        {/* 3. Partner Section Tab (Requested Feature) */}
        <button
          type="button"
          onClick={() => setActiveTab('partner')}
          style={activeTab === 'partner' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition relative ${
            activeTab === 'partner'
              ? 'font-bold scale-105'
              : 'text-indigo-400 hover:text-indigo-300'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[9px]">{isPartnerLoggedIn ? 'پنل همکار' : 'همکاران'}</span>
        </button>

        {/* 4. Hotels & Addresses Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          style={activeTab === 'addresses' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            activeTab === 'addresses'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hotel className="w-5 h-5" />
          <span className="text-[9px]">هتل و آدرس</span>
        </button>

        {/* 5. Dedicated About Us Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('about-us')}
          style={activeTab === 'about-us' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            activeTab === 'about-us'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[9px]">درباره ما</span>
        </button>

        {/* 6. Profile & CV Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={activeTab === 'settings' || activeTab === 'cv-builder' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            activeTab === 'settings' || activeTab === 'cv-builder'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[9px]">پروفایل/CV</span>
        </button>

        {/* 7. Admin Panel Tab (Visible when Admin logged in) */}
        {isAdminLoggedIn && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
              activeTab === 'admin'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-amber-500/70 hover:text-amber-400'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[9px]">پنل مدیر</span>
          </button>
        )}
      </div>
    </nav>
  );
};
