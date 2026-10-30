import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, JobApplication } from '../types';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  MessageCircle,
  Building,
  MapPin,
  Search,
  Filter,
  User,
  Calendar,
  AlertCircle,
  ChevronLeft,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { AuthModal } from './AuthModal';

export const ApplicationsSection: React.FC = () => {
  const {
    applications,
    currentSeeker,
    setActiveTab,
    jobs,
    showToast,
    isAdminLoggedIn,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestTrackingInput, setGuestTrackingInput] = useState('');
  const [activeGuestQuery, setActiveGuestQuery] = useState('');

  // Determine user's applications
  const userApplications = useMemo(() => {
    if (isAdminLoggedIn) {
      return applications;
    }
    if (currentSeeker) {
      return applications.filter((a) => a.seekerId === currentSeeker.id);
    }
    // If not logged in but searched by national ID or username
    if (activeGuestQuery.trim()) {
      const q = activeGuestQuery.trim().toLowerCase();
      return applications.filter(
        (a) =>
          a.seekerNationalId.includes(q) ||
          a.seekerUsername.toLowerCase().includes(q) ||
          a.seekerPhone.includes(q) ||
          a.seekerName.toLowerCase().includes(q)
      );
    }
    return [];
  }, [applications, currentSeeker, activeGuestQuery, isAdminLoggedIn]);

  // Filtered by status and search
  const filteredList = useMemo(() => {
    return userApplications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = app.jobTitle.toLowerCase().includes(q);
        const matchesCompany = app.companyName.toLowerCase().includes(q);
        const matchesCity = app.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesCity) return false;
      }
      return true;
    });
  }, [userApplications, statusFilter, searchQuery]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'در انتظار بررسی کارفرما',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: Clock,
        };
      case 'reviewed':
        return {
          label: 'مشاهده شده توسط کارفرما',
          color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          icon: Eye,
        };
      case 'interview':
        return {
          label: 'دعوت به مصاحبه کاری',
          color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          icon: Phone,
        };
      case 'accepted':
        return {
          label: 'پذیرفته شده و استخدام قطعی',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle,
        };
      case 'rejected':
        return {
          label: 'رد شده توسط کارفرما',
          color: 'bg-red-500/15 text-red-300 border-red-500/30',
          icon: XCircle,
        };
    }
  };

  const handleGuestTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestTrackingInput.trim()) {
      showToast('لطفاً کد ملی یا شماره همراه خود را وارد نمایید', 'error');
      return;
    }
    setActiveGuestQuery(guestTrackingInput.trim());
    showToast('درخواست‌های استخدامی جستجو شدند', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Adapts dynamically to primary theme color) */}
      <div
        style={{ background: 'var(--primary-banner)' }}
        className="relative rounded-3xl overflow-hidden border border-red-500/30 p-6 sm:p-8 shadow-2xl transition-all duration-300"
      >
        <div
          style={{ backgroundColor: 'var(--primary-color)' }}
          className="absolute top-0 left-0 w-96 h-96 opacity-15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-semibold mb-3">
              <FileCheck2 className="w-3.5 h-3.5" />
              سامانه پیگیری و استعلام وضعیت درخواست‌های استخدام کارباما
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              بخش اختصاصی درخواست‌ها و رزومه‌های ارسالی
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              مشاهده وضعیت لحظه‌ای پرونده‌های استخدام شما نزد کارفرمایان ترکیه، تاریخ ارسال، پیام‌های کارفرما و امکان تماس مستقیم.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              مشاهده و ارسال درخواست کار جدید
            </button>
          </div>
        </div>
      </div>

      {/* Non-logged in / Guest Locked Gate */}
      {!currentSeeker && !isAdminLoggedIn ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-black text-white">بخش پیگیری پرونده استخدامی قفل است</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              تمامی اطلاعات پرونده‌ها و پیگیری درخواست‌های ارسالی به کارفرمایان ترکیه، نیازمند عضویت، تسویه ۵۰۰ لیر و تایید حساب توسط مدیریت می‌باشد.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-700/30 transition flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              ورود به حساب کارجو یا ثبت‌نام
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition"
            >
              مشاهده آگهی‌های کار
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Approval Notice if seeker is not approved */}
          {currentSeeker && currentSeeker.verificationStatus !== 'approved' && !isAdminLoggedIn && (
            <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-5 shadow-xl flex items-start gap-3.5 text-xs text-amber-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  وضعیت پرونده شما: در انتظار تایید پرداخت ۵۰۰ لیر توسط مدیر ⏳
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  حساب کاربری شما پس از بررسی فیش واریزی ۵۰۰ لیر فعال خواهد شد. به محض تایید مدیریت، درخواست‌های شما به کارفرمایان ارسال و وضعیت آن در این جدول نمایش داده می‌شود.
                </p>
              </div>
            </div>
          )}

      {/* Filter and Status Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-xs shrink-0 ml-1">وضعیت:</span>
            {[
              { key: 'all', label: `همه (${userApplications.length})` },
              { key: 'pending', label: 'در انتظار' },
              { key: 'reviewed', label: 'مشاهده شده' },
              { key: 'interview', label: 'مصاحبه' },
              { key: 'accepted', label: 'استخدام شده ✓' },
              { key: 'rejected', label: 'رد شده' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  statusFilter === st.key
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search box inside applications */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="جستجو در عنوان یا کارفرما..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Application Cards List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-base">درخواستی در این وضعیت یافت نشد</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            شما هنوز برای این دسته‌بندی درخواستی ارسال نکرده‌اید. با مراجعه به بخش فرصت‌های شغلی می‌توانید رزومه خود را برای صدها کارفرما در استانبول، آنکارا و آنتالیا بفرستید.
          </p>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            مشاهده فرصت‌های استخدام
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((app) => {
            const statusInfo = getStatusBadge(app.status);
            const StatusIcon = statusInfo.icon;
            const matchedJob = jobs.find((j) => j.id === app.jobId);

            return (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                      {new Date(app.appliedAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>

                  {/* Job Title and Company */}
                  <div>
                    <h3 className="font-extrabold text-white text-base hover:text-red-400 transition">
                      {app.jobTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {app.companyName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {app.city}
                      </span>
                    </div>
                  </div>

                  {/* Applicant Details Recap */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">نام کارجو:</span>
                      <strong className="text-white">{app.seekerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">کد ملی ثبت شده:</span>
                      <strong className="text-amber-300 font-mono" dir="ltr">{app.seekerNationalId}</strong>
                    </div>
                  </div>

                  {/* Employer Feedback Note if any */}
                  {app.adminNote && (
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                      <span className="font-bold block mb-0.5">پیام کارفرما / کارگزار:</span>
                      <p>{app.adminNote}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {matchedJob?.contactWhatsapp && (
                      <a
                        href={`https://wa.me/${matchedJob.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        واتساپ کارفرما
                      </a>
                    )}

                    {matchedJob?.contactPhone && (
                      <a
                        href={`tel:${matchedJob.contactPhone.replace(/\s/g, '')}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        تماس
                      </a>
                    )}
                  </div>

                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    پرونده فعال
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Auth Modal for Unlocked Feature Registration/Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};
