import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { KARBAMA_LOGO_DATA_URI, getJobCategorySvgDataUri } from '../utils/brandAssets';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAlertModal?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    jobNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
    setActiveTab,
    setOpenedJobIdFromAlert,
    theme,
  } = useApp();

  if (!isOpen) return null;

  const activeNotifications = jobNotifications.filter((n) => !n.read);

  const handleCloseDrawer = () => {
    onClose();
  };

  const handleOpenNotification = (notif: (typeof jobNotifications)[number]) => {
    markNotificationAsRead(notif.id);
    if (notif.notificationType === 'payment_approved' || notif.notificationType === 'payment_rejected') {
      if (notif.targetRole === 'partner') {
        setActiveTab('partner');
      } else {
        setActiveTab('settings');
      }
      onClose();
      return;
    }
    if (notif.notificationType === 'application_status') {
      setActiveTab('my-applications');
      onClose();
      return;
    }
    setOpenedJobIdFromAlert(notif.jobId);
    setActiveTab('jobs');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleCloseDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div
          className={`w-screen max-w-md border-r shadow-2xl flex flex-col justify-between ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b flex items-center justify-between ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/95 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`relative w-10 h-10 rounded-xl border flex items-center justify-center ${
                  theme === 'light'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-red-600/20 border-red-500/40 text-red-400'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  اعلان‌های جدید کارباما
                </h3>
                <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {unreadNotificationCount > 0
                    ? `${unreadNotificationCount} اعلان جدید خوانده‌نشده`
                    : 'هیچ اعلان خوانده‌نشده‌ای وجود ندارد'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseDrawer}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-200/70 text-slate-700 hover:bg-slate-300 hover:text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions Bar (Only shown when there are active notifications) */}
          {activeNotifications.length > 0 && (
            <div
              className={`px-5 py-2.5 border-b flex items-center justify-between text-xs ${
                theme === 'light'
                  ? 'bg-slate-100/80 border-slate-200'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <span className={`text-[11px] font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                وضعیت خوانده شدن یا حذف به صورت دائمی ذخیره می‌شود
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={markAllNotificationsAsRead}
                  className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    theme === 'light'
                      ? 'text-emerald-700 hover:text-emerald-900'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                  title="خواندن همه"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  همه خوانده شد
                </button>
                <button
                  onClick={clearNotifications}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-red-500/10 text-slate-300 hover:text-red-400 border-red-500/20'
                  }`}
                  title="حذف کامل همه اعلان‌ها"
                >
                  <Trash2 className="w-3 h-3" />
                  پاک کردن همه
                </button>
              </div>
            </div>
          )}

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    theme === 'light'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <BellRing className="w-7 h-7" />
                </div>
                <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  اعلان جدیدی وجود ندارد
                </h4>
                <p className={`text-xs max-w-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  هرگاه وضعیت پرداخت یا حساب شما تغییر کند یا موقعیت شغلی جدیدی در سامانه منتشر شود، اعلان فوری در این بخش نمایش داده خواهد شد.
                </p>
              </div>
            ) : (
              activeNotifications.map((notif) => {
                const isRejectedNotif = notif.notificationType === 'payment_rejected';
                const isApprovedNotif = notif.notificationType === 'payment_approved';
                return (
                <div
                  key={notif.id}
                  onClick={() => handleOpenNotification(notif)}
                  className={`p-3.5 rounded-2xl border shadow-md transition cursor-pointer relative group flex gap-3 text-xs ${
                    isRejectedNotif
                      ? theme === 'light'
                        ? 'bg-red-50 border-red-300 hover:border-red-500 text-slate-900'
                        : 'bg-red-950/70 border-red-500/60 hover:border-red-400 text-white'
                      : isApprovedNotif
                        ? theme === 'light'
                          ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-500 text-slate-900'
                          : 'bg-emerald-950/60 border-emerald-500/60 hover:border-emerald-400 text-white'
                        : theme === 'light'
                          ? 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-900'
                          : 'bg-slate-800/90 border-red-500/40 hover:border-red-500/80 text-white'
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />

                  {/* Thumbnail with Karbama SVG Fallback */}
                  <img
                    src={notif.imageUrl || getJobCategorySvgDataUri(notif.jobTitle, notif.city) || KARBAMA_LOGO_DATA_URI}
                    alt={notif.jobTitle}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getJobCategorySvgDataUri(notif.jobTitle, notif.city) || KARBAMA_LOGO_DATA_URI;
                    }}
                    className={`w-14 h-14 rounded-xl object-cover shrink-0 border ${
                      theme === 'light' ? 'border-slate-300' : 'border-slate-700'
                    }`}
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {notif.jobTitle}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {notif.company} • {notif.city}
                    </p>

                    {notif.message && (
                      <p className={`text-[11px] leading-relaxed pt-0.5 ${
                        isRejectedNotif
                          ? theme === 'light' ? 'text-red-800 font-semibold' : 'text-red-200 font-semibold'
                          : theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {notif.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] pt-1.5 gap-2">
                      <span className={`font-mono font-bold ${
                        isRejectedNotif
                          ? theme === 'light' ? 'text-red-700' : 'text-red-300'
                          : theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {notif.salaryText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-bold transition cursor-pointer ${
                            theme === 'light'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          خوانده شد
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className={`p-1 rounded-lg border transition cursor-pointer ${
                            theme === 'light'
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                              : 'bg-red-500/10 hover:bg-red-500/25 text-red-400 border-red-500/20'
                          }`}
                          title="حذف دائمی این اعلان"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
