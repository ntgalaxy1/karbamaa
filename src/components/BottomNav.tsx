import React from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, PlusCircle, Hotel, Info, UserCheck, ShieldCheck } from 'lucide-react';
import { t } from '../utils/translations';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdminLoggedIn, currentSeeker, paymentSettings, appLanguage } = useApp();

  const isJobSeekerMode = Boolean(currentSeeker && !isAdminLoggedIn);
  const showPostJob = !isJobSeekerMode && !currentSeeker;
  const totalTabs = 4 + (showPostJob ? 1 : 0) + (isAdminLoggedIn ? 1 : 0);
  const colsClass =
    totalTabs === 6
      ? 'grid-cols-6'
      : totalTabs === 5
      ? 'grid-cols-5'
      : 'grid-cols-4';

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
          <span className="text-[9px]">{t('jobOpportunities', appLanguage)}</span>
        </button>

        {/* 2. Post Job Tab (Only when not logged in as seeker) */}
        {showPostJob && (
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
            <span className="text-[9px]">{t('postJob', appLanguage)}</span>
          </button>
        )}

        {/* 3. Hotels & Addresses Tab */}
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
          <span className="text-[9px]">{t('hotels', appLanguage)}</span>
        </button>

        {/* 4. Dedicated About Us Tab */}
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
          <span className="text-[9px]">{t('aboutUs', appLanguage)}</span>
        </button>

        {/* 5. Online Resume Builder Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('cv-builder')}
          style={activeTab === 'cv-builder' || activeTab === 'settings' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            activeTab === 'cv-builder' || activeTab === 'settings'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[9px]">{t('cvBuilder', appLanguage)}</span>
        </button>

        {/* 6. Admin Panel Tab */}
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
            <span className="text-[9px]">{t('adminDashboard', appLanguage)}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

