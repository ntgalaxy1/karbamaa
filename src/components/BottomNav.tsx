import React from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Compass, FileCheck2, Hotel, Info, ShieldCheck } from 'lucide-react';
import { t } from '../utils/translations';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdminLoggedIn, currentSeeker, applications, appLanguage } = useApp();

  const myApplicationsCount = currentSeeker
    ? applications.filter((a) => a.seekerId === currentSeeker.id).length
    : 0;

  const totalTabs = 5 + (isAdminLoggedIn ? 1 : 0);
  const colsClass = totalTabs === 6 ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <nav
      aria-label="منوی ناوبری پایین صفحه"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 dark:bg-slate-900/98 backdrop-blur-lg border-t border-slate-800 pb-safe transition-colors shadow-2xl"
    >
      {/* Top subtle theme accent line */}
      <div style={{ background: 'var(--primary-topbar)' }} className="h-0.5 w-full opacity-70" />

      <div className={`max-w-5xl mx-auto grid ${colsClass} h-16 items-center px-1`}>
        {/* 1. فرصت‌های شغلی */}
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
          <span className="text-[10px] truncate max-w-full">{t('jobOpportunities', appLanguage)}</span>
        </button>

        {/* 2. نقشه تعاملی */}
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          style={activeTab === 'map' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            activeTab === 'map'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] truncate max-w-full">{t('interactiveMap', appLanguage)}</span>
        </button>

        {/* 3. پیگیری درخواست */}
        <button
          type="button"
          onClick={() => setActiveTab('my-applications')}
          style={activeTab === 'my-applications' ? { color: 'var(--primary-color)' } : undefined}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition relative ${
            activeTab === 'my-applications'
              ? 'font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileCheck2 className="w-5 h-5" />
            {myApplicationsCount > 0 && (
              <span
                style={{ backgroundColor: 'var(--primary-hover)' }}
                className="absolute -top-1.5 -right-2 px-1 py-0.2 text-white rounded-full text-[9px] font-bold"
              >
                {myApplicationsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] truncate max-w-full">{t('myApplications', appLanguage)}</span>
        </button>

        {/* 4. هتل‌ها */}
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
          <span className="text-[10px] truncate max-w-full">{t('hotels', appLanguage)}</span>
        </button>

        {/* 5. درباره ما */}
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
          <span className="text-[10px] truncate max-w-full">{t('aboutUs', appLanguage)}</span>
        </button>

        {/* 6. داشبورد مدیریت (هنگام ورود مدیر) */}
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
            <span className="text-[10px] truncate max-w-full">{t('adminDashboard', appLanguage)}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

