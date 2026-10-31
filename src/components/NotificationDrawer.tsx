import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Globe,
  Briefcase,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAlertModal: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAlertModal,
}) => {
  const {
    jobNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setActiveTab,
    setOpenedJobIdFromAlert,
    pushPermissionStatus,
    requestPushPermission,
    triggerTestJobAlert,
    jobAlerts,
  } = useApp();

  if (!isOpen) return null;

  const handleOpenJob = (jobId: string, notifId: string) => {
    markNotificationAsRead(notifId);
    setOpenedJobIdFromAlert(jobId);
    setActiveTab('jobs');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">مرکز اعلان‌های شغلی (Job Alerts)</h3>
                <p className="text-[11px] text-slate-400">
                  {unreadNotificationCount > 0
                    ? `${unreadNotificationCount} اعلان جدید خوانده‌نشده`
                    : 'اعلان‌های مشاغل متناظر با هشدارهای شما'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Browser Push Permission Banner */}
          {pushPermissionStatus !== 'granted' && (
            <div className="bg-gradient-to-r from-red-950/60 to-slate-800/80 p-3.5 border-b border-red-500/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">دریافت اعلان‌ها حتی هنگام بسته‌بودن برنامه:</span>
              </div>
              <button
                onClick={requestPushPermission}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shrink-0 transition"
              >
                فعال‌سازی نوتیفیکیشن
              </button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="px-5 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAlertModal}
                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
              >
                <SlidersHorizontal className="w-3 h-3" />
                تنظیم هشدار ({jobAlerts.length})
              </button>

              <button
                onClick={() => triggerTestJobAlert()}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] flex items-center gap-1 transition"
                title="ارسال یک تست زنده اعلان"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                تست اعلان
              </button>
            </div>

            {jobNotifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                  title="خواندن همه"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  همه خوانده شد
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-slate-400 hover:text-red-400 text-[11px] p-1"
                  title="پاک کردن تاریخچه"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {jobNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <BellRing className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-sm">هیچ اعلانی ثبت نشده است</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  با تنظیم یک هشدار شغلی، هرگاه فرصت شغلی جدیدی متناسب با خواسته شما ثبت شود، در این قسمت ظاهر می‌گردد.
                </p>
                <button
                  onClick={onOpenAlertModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-700/30"
                >
                  + تنظیم اولین هشدار شغلی
                </button>
              </div>
            ) : (
              jobNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleOpenJob(notif.jobId, notif.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer relative group flex gap-3 text-xs ${
                    notif.read
                      ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                      : 'bg-slate-800/90 border-red-500/40 text-white shadow-md hover:border-red-500/80'
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {!notif.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}

                  {/* Thumbnail */}
                  {notif.imageUrl && (
                    <img
                      src={notif.imageUrl}
                      alt={notif.jobTitle}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-700"
                    />
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-xs truncate">
                        {notif.jobTitle}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {notif.company} • {notif.city}
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-emerald-400 font-mono font-bold">
                        {notif.salaryText}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1 group-hover:text-red-400 transition">
                        مشاهده آگهی
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/95">
            <button
              onClick={onOpenAlertModal}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-red-700/30"
            >
              <BellRing className="w-4 h-4" />
              مدیریت و افزودن هشدارهای شغلی (Job Alerts)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
