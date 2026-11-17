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
  } = useApp();

  if (!isOpen) return null;

  const activeNotifications = jobNotifications.filter((n) => !n.read);

  const handleCloseDrawer = () => {
    if (activeNotifications.length > 0) {
      markAllNotificationsAsRead();
    }
    onClose();
  };

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
        onClick={handleCloseDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">اعلان‌های جدید کارباما</h3>
                <p className="text-[11px] text-slate-400">
                  {unreadNotificationCount > 0
                    ? `${unreadNotificationCount} اعلان جدید خوانده‌نشده`
                    : 'هیچ اعلان خوانده‌نشده‌ای وجود ندارد'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseDrawer}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions Bar (Only shown when there are active notifications) */}
          {activeNotifications.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                با مشاهده هر اعلان، به صورت خودکار از لیست حذف می‌شود
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="خواندن همه"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  همه خوانده شد
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-slate-400 hover:text-red-400 text-[11px] px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-1 transition cursor-pointer"
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
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <BellRing className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-sm">اعلان جدیدی وجود ندارد</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  هرگاه موقعیت شغلی جدیدی در سامانه منتشر شود، اعلان فوری در این بخش نمایش داده خواهد شد و پس از خوانده شدن دیگر تکرار نمی‌شود.
                </p>
              </div>
            ) : (
              activeNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleOpenJob(notif.jobId, notif.id)}
                  className="p-3.5 rounded-2xl border bg-slate-800/90 border-red-500/40 text-white shadow-md hover:border-red-500/80 transition cursor-pointer relative group flex gap-3 text-xs"
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
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-xs truncate">
                        {notif.jobTitle}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {notif.company} • {notif.city}
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 gap-2">
                      <span className="text-emerald-400 font-mono font-bold">
                        {notif.salaryText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold transition cursor-pointer"
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
                          className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition cursor-pointer"
                          title="حذف این اعلان"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
