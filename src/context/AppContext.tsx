import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  JobSeeker,
  JobVacancy,
  JobApplication,
  EssentialAddress,
  ApplicationStatus,
  TurkishLevel,
  ResidenceStatus,
  Hotel,
  HotelBooking,
  TransitLine,
  TransitHub,
  JobAlertSubscription,
  JobNotification,
  SeekerResume,
  TargetCountry,
  Gender,
  BrokerSettings,
  ThemeColorPreset,
  ThemeColorConfig,
  PaymentGatewaySettings,
  AdminCredentials,
  PaymentMethod,
  JobPaymentStatus,
  PartnerAccount,
  PartnerSubscriptionPlan,
  PartnerSubscriptionPlanId,
  PartnerSubscriptionStatus,
  RegisterSeekerByPartnerInput,
  RegisterSeekerInput,
  RegisterPartnerInput,
  AdminCreatePartnerInput,
  LiveChatSession,
  LiveChatMessage,
} from '../types';
import {
  INITIAL_JOB_SEEKERS,
  INITIAL_JOBS,
  INITIAL_HOTELS,
  INITIAL_TRANSIT_LINES,
  INITIAL_TRANSIT_HUBS,
  INITIAL_APPLICATIONS,
  INITIAL_ADDRESSES,
  INITIAL_PARTNERS,
  DEFAULT_PARTNER_PLANS,
} from '../data/initialData';
import { idbCache } from '../utils/idbCache';
import { safeStorage } from '../utils/safeStorage';
import {
  requestSafeNotificationPermission,
  showSafeNotification,
  getSafeNotificationPermission,
  playNotificationDingSound,
  playNewJobHotelDingSound,
} from '../utils/safeNotification';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import {
  checkPasswordStrength,
  isValidEmail,
  validatePhoneNumber,
  validateIranianBankCard,
  validateNationalIdOrPassport,
} from '../utils/validators';
import {
  toEnglishDigits,
  normalizeEmailForComparison,
  normalizePhoneForComparison,
  normalizeNationalIdForComparison,
  normalizeCardForComparison,
} from '../utils/inputUtils';


export type ActiveTab =
  | 'jobs'
  | 'post-job'
  | 'partner'
  | 'map'
  | 'addresses'
  | 'my-applications'
  | 'settings'
  | 'admin'
  | 'cv-builder'
  | 'about-us'
  | 'currency'
  | 'privacy-policy';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const THEME_COLOR_PRESETS: ThemeColorConfig[] = [
  { id: 'red', name: 'قرمز ترکی (پیش‌فرض)', primary: '#dc2626', hover: '#b91c1c', light: 'rgba(220, 38, 38, 0.15)' },
  { id: 'blue', name: 'آبی کاربنی', primary: '#2563eb', hover: '#1d4ed8', light: 'rgba(37, 99, 235, 0.15)' },
  { id: 'emerald', name: 'سبز زمردی', primary: '#059669', hover: '#047857', light: 'rgba(5, 150, 105, 0.15)' },
  { id: 'amber', name: 'طلایی / کهربایی', primary: '#d97706', hover: '#b45309', light: 'rgba(217, 119, 6, 0.15)' },
  { id: 'purple', name: 'بنفش لوکس', primary: '#7c3aed', hover: '#6d28d9', light: 'rgba(124, 58, 237, 0.15)' },
  { id: 'cyan', name: 'فیروزه‌ای مدیترانه‌ای', primary: '#0891b2', hover: '#0e7490', light: 'rgba(8, 145, 178, 0.15)' },
  { id: 'rose', name: 'صورتی ملایم', primary: '#e11d48', hover: '#be123c', light: 'rgba(225, 29, 72, 0.15)' },
  { id: 'indigo', name: 'نیلی مدرن', primary: '#4f46e5', hover: '#4338ca', light: 'rgba(79, 70, 229, 0.15)' },
];



interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentSeeker: JobSeeker | null;
  isAdminLoggedIn: boolean;
  jobSeekers: JobSeeker[];
  jobs: JobVacancy[];
  applications: JobApplication[];
  addresses: EssentialAddress[];
  hotels: Hotel[];
  hotelBookings: HotelBooking[];
  transitLines: TransitLine[];
  transitHubs: TransitHub[];
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Theme Management (Light / Dark and Color customization)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  themeColor: ThemeColorPreset;
  customHexColor: string;
  setThemeColor: (color: ThemeColorPreset, customHex?: string) => void;
  themeModalOpen: boolean;
  setThemeModalOpen: (open: boolean) => void;

  registerSeeker: (input: RegisterSeekerInput) => { success: boolean; error?: string; seeker?: JobSeeker };
  checkDuplicateSeekerField: (
    field: 'email' | 'phoneNumber' | 'nationalId' | 'payerCardNumber',
    value: string
  ) => { isDuplicate: boolean; message?: string };
  loginSeeker: (username: string, password: string) => { success: boolean; error?: string };
  loginAdmin: (username: string, password: string) => { success: boolean; error?: string };
  logoutSeeker: () => void;
  logoutAdmin: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  recoverPassword: (emailOrUsername: string) => { success: boolean; message?: string; error?: string; username?: string; password?: string };
  updateProfile: (updates: Partial<JobSeeker>) => { success: boolean; error?: string };
  updateResume: (resume: SeekerResume) => { success: boolean; error?: string };

  // Job Application methods
  applyForJob: (jobId: string, note?: string) => { success: boolean; error?: string };
  updateApplicationStatus: (appId: string, status: ApplicationStatus, adminNote?: string) => void;

  // Job management (Admin)
  addJob: (job: Omit<JobVacancy, 'id' | 'postedAt'>) => void;
  updateJob: (id: string, updates: Partial<JobVacancy>) => void;
  deleteJob: (id: string) => void;
  toggleJobStatus: (id: string) => void;

  // Hotel management (Admin & User)
  addHotel: (hotel: Omit<Hotel, 'id'>) => void;
  updateHotel: (id: string, updates: Partial<Hotel>) => void;
  deleteHotel: (id: string) => void;
  bookHotel: (booking: Omit<HotelBooking, 'id' | 'status' | 'bookedAt'>) => { success: boolean; error?: string };
  updateBookingStatus: (id: string, status: 'confirmed' | 'pending' | 'cancelled') => void;

  // Transit Lines management
  addTransitLine: (line: Omit<TransitLine, 'id'>) => void;
  deleteTransitLine: (id: string) => void;

  // Addresses management
  addAddress: (addr: Omit<EssentialAddress, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<EssentialAddress>) => void;
  deleteAddress: (id: string) => void;

  // Saved / Favorite Jobs
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;

  // Job Alerts & Favorite Category Notifications (Requested Feature)
  jobAlerts: JobAlertSubscription[];
  favoriteJobCategories: string[];
  toggleFavoriteCategory: (categoryKey: string, categoryLabel?: string) => void;
  isCategoryFavorite: (categoryKey: string) => boolean;
  saveJobAlert: (alert: Omit<JobAlertSubscription, 'id' | 'createdAt'>) => JobAlertSubscription;
  deleteJobAlert: (id: string) => void;
  toggleJobAlert: (id: string) => void;
  jobNotifications: JobNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  pushPermissionStatus: 'granted' | 'denied' | 'default' | 'unsupported';
  requestPushPermission: () => Promise<'granted' | 'denied' | 'default'>;
  triggerTestJobAlert: (alert?: JobAlertSubscription) => void;
  openedJobIdFromAlert: string | null;
  setOpenedJobIdFromAlert: (id: string | null) => void;

  // Quick switch for demo testing
  switchToDemoUser: () => void;
  switchToDemoAdmin: () => void;

  // App Language & Onboarding
  appLanguage: 'fa' | 'tr' | 'en' | 'ar';
  setAppLanguage: (lang: 'fa' | 'tr' | 'en' | 'ar') => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;

  // Admin Notifications & Seeker Verification
  adminNotifications: any[];
  addAdminNotification: (notif: any) => void;
  markAdminNotificationAsRead: (id: string) => void;
  clearAdminNotifications: () => void;
  unreadAdminNotifCount: number;
  approveSeekerAccount: (seekerId: string, note?: string) => void;
  rejectSeekerAccount: (seekerId: string, reason: string) => void;

  // Broker Account & Contract Settings
  brokerSettings: BrokerSettings;
  updateBrokerSettings: (settings: Partial<BrokerSettings>) => void;

  // Admin Credentials Management (Requested Feature)
  adminCredentials: AdminCredentials;
  updateAdminCredentials: (newUsername: string, newPassword: string) => { success: boolean; error?: string };

  // Employer Job Posting Payment Settings & Approvals (Requested Feature)
  paymentSettings: PaymentGatewaySettings;
  updatePaymentSettings: (settings: Partial<PaymentGatewaySettings>) => void;
  approveJobPayment: (jobId: string, adminNote?: string) => void;
  rejectJobPayment: (jobId: string, reason: string) => void;
  submitJobWithPayment: (job: Omit<JobVacancy, 'id' | 'postedAt' | 'isActive'>) => { success: boolean; jobId: string };

  // Partner System (Requested Feature: بخش همکار، ثبت‌نام کارجو، اشتراک‌ها و پرداخت)
  currentPartner: PartnerAccount | null;
  partners: PartnerAccount[];
  partnerPlans: PartnerSubscriptionPlan[];
  isPartnerLoggedIn: boolean;
  loginPartner: (username: string, password: string) => { success: boolean; error?: string };
  registerPartner: (input: RegisterPartnerInput) => { success: boolean; error?: string };
  adminCreatePartner: (input: AdminCreatePartnerInput) => { success: boolean; error?: string; partner?: PartnerAccount };
  logoutPartner: () => void;
  submitPartnerSubscriptionPayment: (
    planId: PartnerSubscriptionPlanId,
    paymentMethod: PaymentMethod,
    paymentReceiptUrl?: string,
    paymentReferenceId?: string,
    paymentPayerName?: string
  ) => { success: boolean; error?: string };
  approvePartnerSubscription: (partnerId: string, note?: string) => void;
  rejectPartnerSubscription: (partnerId: string, reason: string) => void;
  updatePartnerPlanPricing: (planId: PartnerSubscriptionPlanId, priceTL: number, priceToman: number) => void;
  updatePartnerPlans: (plans: PartnerSubscriptionPlan[]) => void;
  registerSeekerByPartner: (input: RegisterSeekerByPartnerInput) => { success: boolean; error?: string; seekerId?: string };
  updateSeekerRecord: (seekerId: string, updates: Partial<JobSeeker>) => void;
  deleteSeekerRecord: (seekerId: string) => void;
  clearAllSeekers: () => void;
  switchToDemoPartner: () => void;
  activatePartnerInstantly: (partnerId: string) => void;
  // Quick Admin Modals State (Triggered from Header & Admin Tools)
  adminJobModalOpen: boolean;
  setAdminJobModalOpen: (open: boolean) => void;
  adminHotelModalOpen: boolean;
  setAdminHotelModalOpen: (open: boolean) => void;
  adminAddressModalOpen: boolean;
  setAdminAddressModalOpen: (open: boolean) => void;

  // Live Chat with Admin (چت آنلاین با مدیر)
  chatSessions: LiveChatSession[];
  activeSeekerChat: LiveChatSession | null;
  requestLiveChat: (input: {
    firstName: string;
    lastName: string;
    phone: string;
    nationalId: string;
  }) => { success: boolean; error?: string; chat?: LiveChatSession };
  approveLiveChat: (chatId: string) => void;
  rejectLiveChat: (chatId: string) => void;
  sendLiveChatMessage: (chatId: string, sender: 'seeker' | 'admin', text: string) => void;
  markChatRead: (chatId: string, viewer: 'seeker' | 'admin') => void;
  resetSeekerChat: () => void;

  // Firebase Database Purge & Sync (پاکسازی دیتابیس و همگام‌سازی ابری)
  purgeFirebaseDatabase: (fullReset?: boolean) => Promise<{ success: boolean; deletedCount: number; message: string }>;
  syncPartnerToFirestore: (partner: PartnerAccount) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  feeTL: 500,
  exchangeRateToman: 5460, // معادل ریالی روز: ۲,۷۳۰,۰۰۰ تومان (۲۷,۳۰۰,۰۰۰ ریال)
  lastRateUpdateDate: new Date().toISOString().split('T')[0],
  autoUpdateDaily: true,
  turkeyBankName: 'Ziraat Bankası (زراعت بانک ترکیه)',
  turkeyIban: 'TR56 0001 0090 1234 5678 9050 01',
  turkeyAccountHolder: 'Karbama Danışmanlık ve İnsan Kaynakları',
  iranBankName: 'بانک ملت ایران',
  iranCardNumber: '۶۱۰۴-۳۳۷۸-۹۰۱۲-۳۴۵۶',
  iranCardHolder: 'مدیریت امور مالی کارباما',
  zarinpalMerchantId: 'zp-karbama-official',
  sepalApiKey: 'KhAv64ZBs0TRkItY76JdXTqbWLWpNWP62WbI82_uF7WRhBZkrknQhWJ_8XPCT6GH9mYJ4RN2IPw3GPAPM8BbczDX_D_WM_D21iCdheiRYcKGRfUzUApcgKiDvVX3_gFFcf97acb85862596f273e16f1ad8db6be38bd1c999905e697b4dc0c83b1d37777mqbmWX2P9dGTVatC9_w3c9CpttcFTcM0is-H3hoUpDzGlBDl1-2TTJ3afXexyEHc',
  sepalUniqueCode: '2930311446',
  sepalInquiryToken: 'KhAv64ZBs0TRkItY76JdXTqbWLWpNWP62WbI82_uF7WRhBZkrknQhWJ_8XPCT6GH9mYJ4RN2IPw3GPAPM8BbczDX_D_WM_D21iCdheiRYcKGRfUzUApcgKiDvVX3_gFFcf97acb85862596f273e16f1ad8db6be38bd1c999905e697b4dc0c83b1d37777mqbmWX2P9dGTVatC9_w3c9CpttcFTcM0is-H3hoUpDzGlBDl1-2TTJ3afXexyEHc',
  sepTerminalId: '14589230',
};

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
  updatedAt: '2026-10-25T10:00:00Z',
};

const DEFAULT_BROKER_SETTINGS: BrokerSettings = {
  brokerCardNumber: '۶۰۳۷-۹۹۷۵-۸۸۴۲-۱۰۲۴',
  brokerCardHolder: 'مدیریت کاریابی کارباما (حساب رسمی کارگزار)',
  brokerBankName: 'بانک ملی ایران',
  brokerServiceFee: '۲۵,۰۰۰,۰۰۰ تومان',
  brokerIban: 'IR720170000000109876543210',
  brokerNotice: 'تسویه حساب هزینه خدمات، مشاوره پشتیبانی و معرفی به کارفرما یا پیمانکار',
};

const STORAGE_KEYS = {
  SEEKERS: 'karbama_seekers_v20_clean_final',
  JOBS: 'karbama_jobs_v3',
  APPLICATIONS: 'karbama_applications_v19_clean',
  ADDRESSES: 'karbama_addresses_v3',
  HOTELS: 'karbama_hotels_v3',
  BOOKINGS: 'karbama_bookings_v3',
  TRANSIT: 'karbama_transit_v3',
  TRANSIT_HUBS: 'karbama_transit_hubs_v3',
  CURRENT_USER_ID: 'karbama_current_user_v20_clean_final',
  IS_ADMIN: 'karbama_is_admin_v3',
  SAVED_JOBS: 'karbama_saved_jobs_v4',
  JOB_ALERTS: 'karbama_job_alerts_v3',
  NOTIFICATIONS: 'karbama_notifications_v3',
  THEME: 'karbama_theme_v3',
  THEME_COLOR: 'karbama_theme_color_v3',
  CUSTOM_COLOR: 'karbama_custom_color_v3',
  BROKER_SETTINGS: 'karbama_broker_settings_v3',
  ADMIN_CREDENTIALS: 'karbama_admin_credentials_v3',
  PAYMENT_SETTINGS: 'karbama_payment_settings_v3',
  PARTNERS: 'karbama_partners_v3',
  CURRENT_PARTNER_ID: 'karbama_current_partner_id_v3',
  PARTNER_PLANS: 'karbama_partner_plans_v3',
  CHAT_SESSIONS: 'karbama_chat_sessions_v4',
  ACTIVE_CHAT_ID: 'karbama_active_chat_id_v4',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Broker Settings state (configurable by Admin)
  const [brokerSettings, setBrokerSettings] = useState<BrokerSettings>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.BROKER_SETTINGS);
      return stored ? { ...DEFAULT_BROKER_SETTINGS, ...JSON.parse(stored) } : DEFAULT_BROKER_SETTINGS;
    } catch {
      return DEFAULT_BROKER_SETTINGS;
    }
  });

  const updateBrokerSettings = (newSettings: Partial<BrokerSettings>) => {
    setBrokerSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        safeStorage.setItem(STORAGE_KEYS.BROKER_SETTINGS, JSON.stringify(merged));
      } catch (e) {
        console.error('Failed to save broker settings', e);
      }
      return merged;
    });
    showToast('تنظیمات کارگزار با موفقیت ذخیره شد.', 'success');
  };

  // Admin Credentials State (customizable by Admin)
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
      return stored ? { ...DEFAULT_ADMIN_CREDENTIALS, ...JSON.parse(stored) } : DEFAULT_ADMIN_CREDENTIALS;
    } catch {
      return DEFAULT_ADMIN_CREDENTIALS;
    }
  });

  const updateAdminCredentials = (newUsername: string, newPassword: string): { success: boolean; error?: string } => {
    if (!newUsername || newUsername.trim().length < 3) {
      return { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' };
    }
    if (!newPassword || newPassword.length < 5) {
      return { success: false, error: 'رمز عبور باید حداقل ۵ کاراکتر باشد.' };
    }

    const updated: AdminCredentials = {
      username: newUsername.trim(),
      password: newPassword,
      updatedAt: new Date().toISOString(),
    };

    setAdminCredentials(updated);
    try {
      safeStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save admin credentials', e);
    }
    showToast('نام کاربری و رمز عبور مدیر با موفقیت تغییر یافت.', 'success');
    return { success: true };
  };

  // Employer Job Posting Payment Settings State (customizable by Admin)
  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.exchangeRateToman || parsed.exchangeRateToman === 2300) {
          parsed.exchangeRateToman = 5450;
        }
        return { ...DEFAULT_PAYMENT_SETTINGS, ...parsed };
      }
      return DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  });

  const updatePaymentSettings = (updates: Partial<PaymentGatewaySettings>) => {
    setPaymentSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        safeStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save payment settings', e);
      }
      return next;
    });
    showToast('تنظیمات پرداخت، نرخ روز ارز و حساب‌های بانکی با موفقیت ذخیره شد.', 'success');
  };

  // Automatic Daily Exchange Rate & Rial Fee Updater
  useEffect(() => {
    const checkAndUpdateDailyRate = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        // If already updated today and rate is healthy, skip
        if (paymentSettings.lastRateUpdateDate === todayStr && paymentSettings.exchangeRateToman > 1000) {
          return;
        }

        const res = await fetch('/api/fx-rates');
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data?.TRY) {
            const tryData = json.data.TRY;
            const tomanVal = Number(tryData.toman) || (Number(tryData.rial) ? Math.round(Number(tryData.rial) / 10) : 0);
            if (tomanVal > 1000) {
              setPaymentSettings((prev) => {
                const next: PaymentGatewaySettings = {
                  ...prev,
                  exchangeRateToman: tomanVal,
                  lastRateUpdateDate: todayStr,
                  autoUpdateDaily: true,
                };
                try {
                  safeStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(next));
                } catch (e) {
                  console.error(e);
                }
                return next;
              });
            }
          }
        }
      } catch (err) {
        // silent fallback
      }
    };

    checkAndUpdateDailyRate();
    // Schedule check every 6 hours
    const interval = setInterval(checkAndUpdateDailyRate, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [paymentSettings.lastRateUpdateDate, paymentSettings.exchangeRateToman]);
  // App Language State (Persian, Turkish, English, Arabic)
  const [appLanguage, setAppLanguage] = useState<'fa' | 'tr' | 'en' | 'ar'>(() => {
    try {
      const stored = safeStorage.getItem('karbama_app_lang');
      return (stored as any) || 'fa';
    } catch {
      return 'fa';
    }
  });

  useEffect(() => {
    document.documentElement.lang = appLanguage;
    if (appLanguage === 'fa' || appLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [appLanguage]);

  const handleSetAppLanguage = (lang: 'fa' | 'tr' | 'en' | 'ar') => {
    setAppLanguage(lang);
    try {
      safeStorage.setItem('karbama_app_lang', lang);
    } catch (e) {
      console.error(e);
    }
  };

  // Has completed launch onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(() => {
    try {
      return safeStorage.getItem('karbama_has_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  const setHasCompletedOnboarding = (val: boolean) => {
    setHasCompletedOnboardingState(val);
    try {
      safeStorage.setItem('karbama_has_onboarded', val ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Live Notifications State
  const [adminNotifications, setAdminNotifications] = useState<any[]>(() => {
    try {
      const stored = safeStorage.getItem('karbama_admin_notifications_v4');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addAdminNotification = (notif: { type: string; title: string; message: string; data?: any }) => {
    const item = {
      id: 'an-' + Date.now(),
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setAdminNotifications((prev) => {
      const next = [item, ...prev];
      try {
        safeStorage.setItem('karbama_admin_notifications_v4', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const markAdminNotificationAsRead = (id: string) => {
    setAdminNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        safeStorage.setItem('karbama_admin_notifications_v4', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const clearAdminNotifications = () => {
    setAdminNotifications([]);
    try {
      safeStorage.removeItem('karbama_admin_notifications_v4');
    } catch (e) {
      console.error(e);
    }
  };

  const unreadAdminNotifCount = adminNotifications.filter((n) => !n.read).length;

  const approveSeekerAccount = (seekerId: string, note?: string) => {
    const seeker = jobSeekers.find((s) => s.id === seekerId);
    setJobSeekers((prev) => {
      const next = prev.map((s) =>
        s.id === seekerId
          ? {
              ...s,
              verificationStatus: 'approved' as const,
              isPaymentVerified: true,
              seekerPaymentStatus: 'paid' as const,
              adminVerificationNote: note || s.adminVerificationNote || 'تایید و آزادسازی توسط مدیریت کارباما',
            }
          : s
      );
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast('قفل حساب کارجو با موفقیت باز شد و دسترسی کامل فعال گردید.', 'success');

    if (seeker) {
      showSafeNotification(`✅ قفل حساب کاربری شما باز شد!`, {
        body: `کارجوی گرامی ${seeker.fullName}، پرداخت و مدارک شما توسط مدیریت کارباما تایید گردید و قفل تمامی بخش‌ها باز شد.`,
        icon: '/pwa-192x192.png',
        tag: `seeker-status-${seekerId}`,
      });
    }
  };

  const rejectSeekerAccount = (seekerId: string, reason: string) => {
    const seeker = jobSeekers.find((s) => s.id === seekerId);
    setJobSeekers((prev) => {
      const next = prev.map((s) =>
        s.id === seekerId
          ? { ...s, verificationStatus: 'rejected' as const, isPaymentVerified: false, adminVerificationNote: reason }
          : s
      );
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast('حساب کارجو رد شد.', 'info');

    if (seeker) {
      showSafeNotification(`⚠️ به‌روزرسانی در وضعیت حساب کارجو`, {
        body: `کارجوی گرامی ${seeker.fullName}، پرونده شما به‌روزرسانی شد: ${reason || 'لطفاً مشخصات را بررسی کنید.'}`,
        icon: '/pwa-192x192.png',
        tag: `seeker-status-${seekerId}`,
      });
    }
  };

  // Safe load data with fallback to empty array (strictly filtering out legacy default sample seeds)
  const isSampleOrLegacySeeker = (s?: Partial<JobSeeker> | null): boolean => {
    if (!s || !s.id) return true;
    const idLower = s.id.toLowerCase();
    // Only match exact hardcoded demo/seed IDs (NEVER timestamp IDs like seeker-1762...)
    const exactLegacyIds = [
      'seeker-1',
      'seeker-2',
      'seeker-3',
      'seeker-4',
      'seeker-5',
      'seeker-demo',
      'seeker-test',
      'demo',
      'sample',
      'mock',
    ];
    if (exactLegacyIds.includes(idLower)) {
      return true;
    }
    const username = s.username ? s.username.toLowerCase() : '';
    const exactLegacyUsernames = [
      'seeker1',
      'seeker2',
      'seeker3',
      'seeker4',
      'seeker5',
      'seeker_demo',
      'demo_seeker',
    ];
    if (exactLegacyUsernames.includes(username)) {
      return true;
    }
    return false;
  };

  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>(() => {
    try {
      // Always purge all legacy seeker localStorage keys
      safeStorage.removeItem('karbama_seekers');
      safeStorage.removeItem('karbama_seekers_v2');
      safeStorage.removeItem('karbama_seekers_v3');
      safeStorage.removeItem('karbama_seekers_v4');
      safeStorage.removeItem('karbama_seekers_v19_clean');
      safeStorage.removeItem('karbama_current_user_v19_clean');

      const stored = safeStorage.getItem(STORAGE_KEYS.SEEKERS);
      const parsed: JobSeeker[] = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((s) => !isSampleOrLegacySeeker(s)) : [];
    } catch {
      return [];
    }
  });

  const [jobs, setJobs] = useState<JobVacancy[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.JOBS);
      return stored ? JSON.parse(stored) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [addresses, setAddresses] = useState<EssentialAddress[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.ADDRESSES);
      return stored ? JSON.parse(stored) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  });

  const [hotels, setHotels] = useState<Hotel[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.HOTELS);
      return stored ? JSON.parse(stored) : INITIAL_HOTELS;
    } catch {
      return INITIAL_HOTELS;
    }
  });

  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [transitLines, setTransitLines] = useState<TransitLine[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.TRANSIT);
      return stored ? JSON.parse(stored) : INITIAL_TRANSIT_LINES;
    } catch {
      return INITIAL_TRANSIT_LINES;
    }
  });

  const [transitHubs, setTransitHubs] = useState<TransitHub[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.TRANSIT_HUBS);
      return stored ? JSON.parse(stored) : INITIAL_TRANSIT_HUBS;
    } catch {
      return INITIAL_TRANSIT_HUBS;
    }
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return safeStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  const [currentSeekerId, setCurrentSeekerId] = useState<string | null>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return stored && stored.trim() !== '' ? stored : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // default
    }
    return 'dark';
  });

  const [role, setRole] = useState<UserRole>(() => (isAdminLoggedIn ? 'admin' : 'jobseeker'));
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/privacy-policy') {
      return 'privacy-policy';
    }
    return 'jobs';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/privacy-policy') {
        setActiveTab('privacy-policy');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Partner System State
  const [partners, setPartners] = useState<PartnerAccount[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PARTNERS);
      const parsed: PartnerAccount[] = stored ? JSON.parse(stored) : INITIAL_PARTNERS;
      return Array.isArray(parsed)
        ? parsed.filter((p) => p.id !== 'partner-1' && p.id !== 'partner-2' && p.username !== 'partner1' && p.username !== 'partner2')
        : [];
    } catch {
      return [];
    }
  });

  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.CURRENT_PARTNER_ID);
      if (stored === 'partner-1' || stored === 'partner-2') return null;
      return stored || null;
    } catch {
      return null;
    }
  });

  const [partnerPlans, setPartnerPlans] = useState<PartnerSubscriptionPlan[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PARTNER_PLANS);
      return stored ? JSON.parse(stored) : DEFAULT_PARTNER_PLANS;
    } catch {
      return DEFAULT_PARTNER_PLANS;
    }
  });

  // Job Alert & Notification States
  const DEFAULT_INITIAL_ALERTS: JobAlertSubscription[] = [];

  const [jobAlerts, setJobAlerts] = useState<JobAlertSubscription[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.JOB_ALERTS);
      const parsed: JobAlertSubscription[] = stored ? JSON.parse(stored) : DEFAULT_INITIAL_ALERTS;
      return Array.isArray(parsed) ? parsed.filter((a) => a.id !== 'alert-default-1') : [];
    } catch {
      return [];
    }
  });

  const [jobNotifications, setJobNotifications] = useState<JobNotification[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const parsed: JobNotification[] = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed)
        ? parsed.filter((n) => n.id !== 'notif-welcome' && !String(n.message || '').includes('تست'))
        : [];
    } catch {
      return [];
    }
  });

  const [pushPermissionStatus, setPushPermissionStatus] = useState<
    'granted' | 'denied' | 'default' | 'unsupported'
  >(() => getSafeNotificationPermission());

  const [openedJobIdFromAlert, setOpenedJobIdFromAlert] = useState<string | null>(null);

  const [themeColor, setThemeColorState] = useState<ThemeColorPreset>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.THEME_COLOR);
      if (stored) return stored as ThemeColorPreset;
    } catch {
      // default
    }
    return 'red';
  });

  const [customHexColor, setCustomHexColor] = useState<string>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.CUSTOM_COLOR);
      if (stored) return stored;
    } catch {
      // default
    }
    return '#dc2626';
  });

  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const setThemeColor = (color: ThemeColorPreset, customHex?: string) => {
    setThemeColorState(color);
    safeStorage.setItem(STORAGE_KEYS.THEME_COLOR, color);
    if (customHex) {
      setCustomHexColor(customHex);
      safeStorage.setItem(STORAGE_KEYS.CUSTOM_COLOR, customHex);
    }
  };

  // Sync primary color CSS variables to HTML root
  // Sync primary color CSS variables and gradients to HTML root
  useEffect(() => {
    let primaryHex = '#dc2626';
    let hoverHex = '#b91c1c';

    if (themeColor === 'custom' && customHexColor) {
      primaryHex = customHexColor;
      hoverHex = customHexColor;
    } else {
      const preset = THEME_COLOR_PRESETS.find((p) => p.id === themeColor);
      if (preset) {
        primaryHex = preset.primary;
        hoverHex = preset.hover;
      }
    }

    // Helper to calculate RGBA string from hex
    const hexToRgba = (hex: string, alpha: number): string => {
      const cleanHex = hex.replace('#', '');
      let r = 220, g = 38, b = 38;
      if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16) || 220;
        g = parseInt(cleanHex.substring(2, 4), 16) || 38;
        b = parseInt(cleanHex.substring(4, 6), 16) || 38;
      } else if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16) || 220;
        g = parseInt(cleanHex[1] + cleanHex[1], 16) || 38;
        b = parseInt(cleanHex[2] + cleanHex[2], 16) || 38;
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const lightRgba = hexToRgba(primaryHex, 0.16);
    const borderRgba = hexToRgba(primaryHex, 0.42);
    const glowRgba = hexToRgba(primaryHex, 0.28);
    const bannerGrad = `linear-gradient(135deg, ${hexToRgba(primaryHex, 0.32)} 0%, rgba(15, 23, 42, 0.96) 55%, rgba(2, 6, 23, 1) 100%)`;
    const topBarGrad = `linear-gradient(to right, rgba(15, 23, 42, 0.98), ${hexToRgba(primaryHex, 0.35)}, rgba(15, 23, 42, 0.98))`;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', primaryHex);
      root.style.setProperty('--primary-hover', hoverHex);
      root.style.setProperty('--primary-light', lightRgba);
      root.style.setProperty('--primary-border', borderRgba);
      root.style.setProperty('--primary-glow', glowRgba);
      root.style.setProperty('--primary-banner', bannerGrad);
      root.style.setProperty('--primary-topbar', topBarGrad);
    }
  }, [themeColor, customHexColor]);

  // Sync theme (dark/light) to HTML root
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Find active seeker
  const currentSeeker = jobSeekers.find((s) => s.id === currentSeekerId) || null;

  // Find active partner
  const currentPartner = partners.find((p) => p.id === currentPartnerId) || null;
  const isPartnerLoggedIn = Boolean(currentPartner);

  // Persist state updates securely to safeStorage & IndexedDB (for offline SW access)
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(jobSeekers));
    if (jobSeekers && jobSeekers.length > 0) {
      idbCache.saveSeekers(jobSeekers);
    }
  }, [jobSeekers]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    if (jobs && jobs.length > 0) {
      idbCache.saveJobs(jobs);
    }
  }, [jobs]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
    if (addresses && addresses.length > 0) {
      idbCache.saveAddresses(addresses);
    }
  }, [addresses]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    if (hotels && hotels.length > 0) {
      idbCache.saveHotels(hotels);
    }
  }, [hotels]);

  // Initial IndexedDB & Server API hydration fallback when offline or on first load
  useEffect(() => {
    const hydrateFromIndexedDBAndServer = async () => {
      try {
        const cachedSeekers = await idbCache.getSeekers();
        if (cachedSeekers && cachedSeekers.length > 0) {
          setJobSeekers((prev) => {
            const map = new Map<string, JobSeeker>();
            cachedSeekers.filter((s) => !isSampleOrLegacySeeker(s)).forEach((s) => map.set(s.id, s));
            prev.filter((s) => !isSampleOrLegacySeeker(s)).forEach((s) => {
              const old = map.get(s.id);
              map.set(s.id, old ? { ...old, ...s } : s);
            });
            return Array.from(map.values());
          });
        }

        const cachedJobs = await idbCache.getJobs();
        if (cachedJobs && cachedJobs.length > 0) {
          setJobs((prev) => {
            if (!prev || prev.length === 0) return cachedJobs;
            return prev;
          });
        }

        const cachedAddrs = await idbCache.getAddresses();
        if (cachedAddrs && cachedAddrs.length > 0) {
          setAddresses((prev) => {
            if (!prev || prev.length === 0) return cachedAddrs;
            return prev;
          });
        }

        const cachedHotels = await idbCache.getHotels();
        if (cachedHotels && cachedHotels.length > 0) {
          setHotels((prev) => {
            if (!prev || prev.length === 0) return cachedHotels;
            return prev;
          });
        }
      } catch (err) {
        console.warn('[IDB Hydrate] Failed:', err);
      }

      // Also hydrate & two-way sync registered seekers & partners with server (/api/users.php)
      const syncWithServer = async () => {
        try {
          const res = await fetch(`/api/users.php?t=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const serverSeekers: JobSeeker[] = Array.isArray(data?.seekers) ? data.seekers : [];
            const serverIds = new Set(serverSeekers.map((s) => s.id));

            setJobSeekers((prev) => {
              const map = new Map<string, JobSeeker>();
              serverSeekers.filter((s) => !isSampleOrLegacySeeker(s)).forEach((s) => map.set(s.id, s));
              prev.filter((s) => !isSampleOrLegacySeeker(s)).forEach((s) => {
                const existing = map.get(s.id);
                map.set(s.id, existing ? { ...existing, ...s } : s);
                // If local device has a registered seeker not yet on server, push it now!
                if (!serverIds.has(s.id)) {
                  fetch('/api/users.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'upsert', seeker: s }),
                  }).catch(() => {});
                  syncUserToFirestore(s);
                }
              });
              const merged = Array.from(map.values());
              safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(merged));
              return merged;
            });

            if (data && Array.isArray(data.partners) && data.partners.length > 0) {
              setPartners((prev) => {
                const map = new Map<string, PartnerAccount>();
                data.partners.forEach((p: PartnerAccount) => {
                  if (p && p.id) map.set(p.id, p);
                });
                prev.forEach((p) => {
                  const existing = map.get(p.id);
                  map.set(p.id, existing ? { ...existing, ...p } : p);
                });
                return Array.from(map.values());
              });
            }
          }
        } catch {
          // Ignore network error when offline
        }
      };

      await syncWithServer();
    };

    hydrateFromIndexedDBAndServer();

    const interval = setInterval(() => {
      fetch(`/api/users.php?t=${Date.now()}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.seekers) && data.seekers.length > 0) {
            setJobSeekers((prev) => {
              const map = new Map<string, JobSeeker>();
              data.seekers.filter((s: JobSeeker) => !isSampleOrLegacySeeker(s)).forEach((s: JobSeeker) => map.set(s.id, s));
              prev.filter((s) => !isSampleOrLegacySeeker(s)).forEach((s) => {
                const existing = map.get(s.id);
                map.set(s.id, existing ? { ...existing, ...s } : s);
              });
              return Array.from(map.values());
            });
          }
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(hotelBookings));
  }, [hotelBookings]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.TRANSIT, JSON.stringify(transitLines));
  }, [transitLines]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.TRANSIT_HUBS, JSON.stringify(transitHubs));
  }, [transitHubs]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.JOB_ALERTS, JSON.stringify(jobAlerts));
  }, [jobAlerts]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(jobNotifications));
  }, [jobNotifications]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    if (currentPartnerId) {
      safeStorage.setItem(STORAGE_KEYS.CURRENT_PARTNER_ID, currentPartnerId);
    } else {
      safeStorage.removeItem(STORAGE_KEYS.CURRENT_PARTNER_ID);
    }
  }, [currentPartnerId]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PARTNER_PLANS, JSON.stringify(partnerPlans));
  }, [partnerPlans]);

  useEffect(() => {
    if (currentSeekerId) {
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentSeekerId);
    } else {
      safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentSeekerId]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Real-time Firestore synchronization for 'users', 'notifications', and 'jobs'
  useEffect(() => {
    if (!db) return;

    // Listen to users collection (only remove sample/demo records, never real registered seekers)
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const firestoreUsers: JobSeeker[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as JobSeeker;
          if (isSampleOrLegacySeeker(data)) {
            deleteDoc(doc(db, 'users', docSnap.id)).catch(() => {});
          } else if (data && data.id) {
            firestoreUsers.push(data);
          }
        });
        setJobSeekers((prev) => {
          const map = new Map<string, JobSeeker>();
          prev.filter((s) => !isSampleOrLegacySeeker(s)).forEach((s) => map.set(s.id, s));
          firestoreUsers.forEach((s) => {
            const existing = map.get(s.id);
            map.set(s.id, existing ? { ...s, ...existing } : s);
          });
          const merged = Array.from(map.values());
          safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(merged));
          return merged;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    // Listen to notifications collection
    const unsubNotifs = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreNotifs: JobNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as JobNotification;
            if (data && data.id) {
              firestoreNotifs.push(data);
            }
          });

          if (firestoreNotifs.length > 0) {
            setJobNotifications((prev) => {
              const map = new Map<string, JobNotification>();
              prev.forEach((n) => map.set(n.id, n));
              firestoreNotifs.forEach((n) => map.set(n.id, n));
              return Array.from(map.values());
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'notifications');
      }
    );

    // Listen to jobs collection
    const unsubJobs = onSnapshot(
      collection(db, 'jobs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreJobs: JobVacancy[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as JobVacancy;
            if (data && data.id) {
              firestoreJobs.push(data);
            }
          });

          if (firestoreJobs.length > 0) {
            setJobs((prev) => {
              const map = new Map<string, JobVacancy>();
              prev.forEach((j) => map.set(j.id, j));
              firestoreJobs.forEach((j) => map.set(j.id, j));
              return Array.from(map.values());
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'jobs');
      }
    );

    // Listen to chats collection
    const unsubChats = onSnapshot(
      collection(db, 'chats'),
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreChats: LiveChatSession[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as LiveChatSession;
            if (data && data.id) {
              firestoreChats.push(data);
            }
          });
          if (firestoreChats.length > 0) {
            setChatSessions((prev) => {
              const map = new Map<string, LiveChatSession>();
              prev.forEach((c) => map.set(c.id, c));
              firestoreChats.forEach((c) => map.set(c.id, c));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'chats');
      }
    );

    // Listen to partners collection
    const unsubPartners = onSnapshot(
      collection(db, 'partners'),
      (snapshot) => {
        if (!snapshot.empty) {
          const firestorePartners: PartnerAccount[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as PartnerAccount;
            if (data && data.id) {
              firestorePartners.push(data);
            }
          });
          if (firestorePartners.length > 0) {
            setPartners((prev) => {
              const map = new Map<string, PartnerAccount>();
              prev.forEach((p) => map.set(p.id, p));
              firestorePartners.forEach((p) => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'partners');
      }
    );

    return () => {
      unsubUsers();
      unsubNotifs();
      unsubJobs();
      unsubChats();
      unsubPartners();
    };
  }, []);

  const syncUserToFirestore = async (user: JobSeeker) => {
    // 1. Always sync to backend server (/api/users.php) for PHP/MySQL & cross-device reliability
    try {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', seeker: user }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // 2. Sync to Firestore (ensuring total document size stays strictly under 900KB so setDoc never fails!)
    try {
      if (!db) return;
      const sanitized: Record<string, any> = {};
      let totalEstimatedBytes = 0;
      const imageKeys = ['passportPhotoUrl', 'fullBodyPhotoUrl', 'nationalCardPhotoUrl', 'signatureDataUrl'];

      Object.entries(user).forEach(([k, v]) => {
        if (v !== undefined && !imageKeys.includes(k)) {
          sanitized[k] = v;
          totalEstimatedBytes += typeof v === 'string' ? v.length : 64;
        }
      });

      for (const imgKey of imageKeys) {
        const val = (user as any)[imgKey];
        if (typeof val === 'string' && val.length > 0) {
          // Only include valid image data URLs if total Firestore doc stays under 820KB (never slice base64!)
          if (val.length <= 210000 && totalEstimatedBytes + val.length < 820000) {
            sanitized[imgKey] = val;
            totalEstimatedBytes += val.length;
          } else {
            sanitized[imgKey] = '';
          }
        }
      }

      await setDoc(doc(db, 'users', user.id), {
        ...sanitized,
        pushNotificationEnabled: true,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
    }
  };

  const syncPartnerToFirestore = async (partner: PartnerAccount) => {
    try {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', partner }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      if (!db) return;
      await setDoc(doc(db, 'partners', partner.id), {
        ...partner,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `partners/${partner.id}`);
    }
  };

  const syncNotificationToFirestore = async (notif: JobNotification | any) => {
    try {
      await setDoc(doc(db, 'notifications', notif.id), {
        ...notif,
        createdAt: notif.createdAt || new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
    }
  };

  const syncJobToFirestore = async (job: JobVacancy) => {
    try {
      await setDoc(doc(db, 'jobs', job.id), {
        ...job,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `jobs/${job.id}`);
    }
  };

  const purgeFirebaseDatabase = async (fullReset: boolean = false): Promise<{
    success: boolean;
    deletedCount: number;
    message: string;
  }> => {
    let deletedCount = 0;
    try {
      if (db) {
        // 1. Purge users collection
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const docSnap of usersSnap.docs) {
          const data = docSnap.data() as JobSeeker;
          const shouldDelete = fullReset ? true : isSampleOrLegacySeeker(data);
          if (shouldDelete) {
            await deleteDoc(docSnap.ref);
            deletedCount++;
          }
        }

        // 2. Purge test notifications
        const notifsSnap = await getDocs(collection(db, 'notifications'));
        for (const docSnap of notifsSnap.docs) {
          const data = docSnap.data();
          const msg = String(data.message || data.title || '').toLowerCase();
          const id = String(data.id || '').toLowerCase();
          if (
            fullReset ||
            msg.includes('تست') ||
            msg.includes('نمونه') ||
            msg.includes('demo') ||
            id.includes('test') ||
            id.includes('demo')
          ) {
            await deleteDoc(docSnap.ref);
            deletedCount++;
          }
        }

        // 3. Purge test chats
        const chatsSnap = await getDocs(collection(db, 'chats'));
        for (const docSnap of chatsSnap.docs) {
          const data = docSnap.data();
          const name = String(data.fullName || data.firstName || '').toLowerCase();
          const id = String(data.id || '').toLowerCase();
          if (
            fullReset ||
            name.includes('تست') ||
            name.includes('نمونه') ||
            name.includes('demo') ||
            id.includes('test') ||
            id.includes('demo')
          ) {
            await deleteDoc(docSnap.ref);
            deletedCount++;
          }
        }

        // 4. Test doc
        try {
          await deleteDoc(doc(db, 'test', 'connection'));
        } catch {
          // Ignore
        }
      }

      // Update local state
      if (fullReset) {
        setJobSeekers([]);
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify([]));
        safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        setCurrentSeekerId(null);
      } else {
        setJobSeekers((prev) => prev.filter((s) => !isSampleOrLegacySeeker(s)));
      }

      safeStorage.setItem('karbama_purge_all_default_seekers_v20_final', 'done');
      safeStorage.setItem('karbama_firestore_seekers_purged_v20_final', 'done');

      showToast(`پایگاه داده Firebase پاکسازی شد (${deletedCount} سند تستی حذف گردید).`, 'success');
      return {
        success: true,
        deletedCount,
        message: `عملیات پاکسازی با موفقیت انجام شد و ${deletedCount} سند تستی از پایگاه داده حذف گردید.`,
      };
    } catch (err: any) {
      console.error('Purge error:', err);
      showToast('خطا در پاکسازی پایگاه داده: ' + (err.message || 'نامشخص'), 'error');
      return {
        success: false,
        deletedCount,
        message: err.message || 'خطا در ارتباط با سرور Firebase',
      };
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const checkDuplicateSeekerField = (
    field: 'email' | 'phoneNumber' | 'nationalId' | 'payerCardNumber',
    value: string
  ): { isDuplicate: boolean; message?: string } => {
    if (!value || !value.trim()) return { isDuplicate: false };

    if (field === 'email') {
      const clean = normalizeEmailForComparison(value);
      if (clean.length > 5 && isValidEmail(clean)) {
        const found = jobSeekers.some(
          (s) => (!currentSeekerId || s.id !== currentSeekerId) && normalizeEmailForComparison(s.email || '') === clean
        );
        if (found) {
          return { isDuplicate: true, message: 'این آدرس ایمیل قبلاً در سامانه ثبت گردیده است.' };
        }
      }
    } else if (field === 'phoneNumber') {
      const clean = normalizePhoneForComparison(value);
      if (clean.length >= 10) {
        const found = jobSeekers.some(
          (s) => (!currentSeekerId || s.id !== currentSeekerId) && normalizePhoneForComparison(s.phoneNumber || s.phone || '') === clean
        );
        if (found) {
          return { isDuplicate: true, message: 'این شماره تماس قبلاً در سامانه ثبت گردیده است.' };
        }
      }
    } else if (field === 'nationalId') {
      const clean = normalizeNationalIdForComparison(value);
      if (clean.length >= 6) {
        const found = jobSeekers.some(
          (s) => (!currentSeekerId || s.id !== currentSeekerId) && normalizeNationalIdForComparison(s.nationalId) === clean
        );
        if (found) {
          return { isDuplicate: true, message: 'این کد ملی یا شماره پاسپورت قبلاً در سامانه ثبت گردیده است.' };
        }
      }
    } else if (field === 'payerCardNumber') {
      const clean = normalizeCardForComparison(value);
      if (clean.length === 16) {
        const found = jobSeekers.some(
          (s) => (!currentSeekerId || s.id !== currentSeekerId) && normalizeCardForComparison(s.payerCardNumber || '') === clean
        );
        if (found) {
          return { isDuplicate: true, message: 'این شماره کارت بانکی قبلاً در سامانه ثبت گردیده است.' };
        }
      }
    }

    return { isDuplicate: false };
  };

  const registerSeeker = (input: RegisterSeekerInput): { success: boolean; error?: string; seeker?: JobSeeker } => {
    // 1. Personal & Account Credentials Validation
    if (!input.firstName?.trim() || !input.lastName?.trim() || !input.fatherName?.trim() || !input.nationalId?.trim()) {
      return { success: false, error: 'لطفاً مشخصات فردی (نام، نام خانوادگی، نام پدر و کد ملی) را به طور کامل وارد کنید.' };
    }

    if (!input.phoneNumber?.trim() || !input.phoneCountryCode?.trim()) {
      return { success: false, error: 'لطفاً پیش‌شماره کشور و شماره تماس خود را وارد نمایید.' };
    }

    const phoneValidation = validatePhoneNumber(input.phoneNumber, input.phoneCountryCode);
    if (!phoneValidation.isValid) {
      return { success: false, error: phoneValidation.error || 'شماره تلفن وارد شده معتبر نیست.' };
    }

    if (!input.gender) {
      return { success: false, error: 'تعیین جنسیت الزامی می‌باشد.' };
    }

    if (!input.username?.trim() || !input.password?.trim()) {
      return { success: false, error: 'لطفاً نام کاربری و رمز عبور ورود به سامانه را تعیین کنید.' };
    }

    if (!input.email?.trim() || !isValidEmail(input.email)) {
      return { success: false, error: 'لطفاً آدرس ایمیل معتبر (جهت بازیابی رمز عبور) وارد نمایید.' };
    }

    const pwdCheck = checkPasswordStrength(input.password);
    if (!pwdCheck.isValid) {
      return { success: false, error: pwdCheck.error };
    }

    const cleanNatId = input.nationalId.trim();
    const natIdCheck = validateNationalIdOrPassport(cleanNatId);
    if (!natIdCheck.isValid) {
      return { success: false, error: natIdCheck.error || 'کد ملی یا شماره پاسپورت وارد شده معتبر نیست.' };
    }

    if (input.payerCardNumber && input.payerCardNumber.trim() !== '') {
      const cardCheck = validateIranianBankCard(input.payerCardNumber);
      if (!cardCheck.isValid) {
        return { success: false, error: cardCheck.error || 'شماره کارت بانکی وارد شده واقعی و معتبر نیست.' };
      }
    }

    // 2. Iran Residence & Target Country Validation
    if (!input.iranProvince?.trim() || !input.iranCity?.trim() || !input.iranAddress?.trim()) {
      return { success: false, error: 'لطفاً آدرس دقیق محل سکونت در ایران (شامل استان، شهرستان و آدرس کامل) را وارد کنید.' };
    }

    if (!input.targetCountry) {
      return { success: false, error: 'تعیین کشور مقصد (ترکیه، ارمنستان، عراق یا آلمان) الزامی است.' };
    }

    const cleanUsername = toEnglishDigits(input.username).trim().toLowerCase();
    const cleanPassword = toEnglishDigits(input.password).trim();
    const cleanEmail = toEnglishDigits(input.email).trim().toLowerCase();
    const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
    const formattedPhone = input.phone || `${input.phoneCountryCode} ${input.phoneNumber.trim()}`;

    // Strict Duplicate Checks for new registration (ایمیل، تلفن، کد ملی، شماره کارت، نام کاربری)
    if (!currentSeekerId) {
      const cleanPhoneComp = normalizePhoneForComparison(input.phoneNumber || input.phone || '');
      const cleanCardComp = normalizeCardForComparison(input.payerCardNumber || '');
      const cleanNatIdComp = normalizeNationalIdForComparison(cleanNatId);

      for (const s of jobSeekers) {
        if (cleanEmail && normalizeEmailForComparison(s.email || '') === cleanEmail) {
          return { success: false, error: 'این آدرس ایمیل قبلاً در سامانه ثبت شده است و تکراری می‌باشد.' };
        }
        if (cleanPhoneComp && normalizePhoneForComparison(s.phoneNumber || s.phone || '') === cleanPhoneComp) {
          return { success: false, error: 'این شماره تلفن قبلاً در سامانه ثبت شده است و تکراری می‌باشد.' };
        }
        if (cleanNatIdComp && normalizeNationalIdForComparison(s.nationalId) === cleanNatIdComp) {
          return { success: false, error: 'این کد ملی یا شماره پاسپورت قبلاً در سامانه ثبت شده است و تکراری می‌باشد.' };
        }
        if (cleanCardComp && cleanCardComp.length === 16 && normalizeCardForComparison(s.payerCardNumber || '') === cleanCardComp) {
          return { success: false, error: 'این شماره کارت بانکی قبلاً در سامانه ثبت شده است و تکراری می‌باشد.' };
        }
        if (cleanUsername && s.username.toLowerCase() === cleanUsername) {
          return { success: false, error: 'این نام کاربری قبلاً در سامانه ثبت شده است، لطفاً نام کاربری دیگری انتخاب فرمایید.' };
        }
      }
    }

    // Check if updating own dossier while logged in
    const existingIndex = currentSeekerId ? jobSeekers.findIndex((s) => s.id === currentSeekerId) : -1;

    if (existingIndex >= 0) {
      // Seamlessly update existing seeker dossier!
      const targetSeeker = jobSeekers[existingIndex];
      const updatedSeeker: JobSeeker = {
        ...targetSeeker,
        firstName: input.firstName.trim() || targetSeeker.firstName,
        lastName: input.lastName.trim() || targetSeeker.lastName,
        fullName: fullName || targetSeeker.fullName,
        fatherName: input.fatherName.trim() || targetSeeker.fatherName,
        nationalId: cleanNatId || targetSeeker.nationalId,
        gender: input.gender || targetSeeker.gender,
        phoneCountryCode: input.phoneCountryCode || targetSeeker.phoneCountryCode,
        phoneNumber: input.phoneNumber.trim() || targetSeeker.phoneNumber,
        phone: formattedPhone || targetSeeker.phone,
        email: cleanEmail || targetSeeker.email,
        username: cleanUsername || targetSeeker.username,
        password: cleanPassword || targetSeeker.password,
        iranProvince: input.iranProvince.trim() || targetSeeker.iranProvince,
        iranCity: input.iranCity.trim() || targetSeeker.iranCity,
        iranAddress: input.iranAddress.trim() || targetSeeker.iranAddress,
        targetCountry: input.targetCountry || targetSeeker.targetCountry,
        targetCity: input.targetCity || targetSeeker.targetCity,
        turkishLevel: input.turkishLevel || targetSeeker.turkishLevel,
        skills: input.skills && input.skills.length > 0 ? input.skills : targetSeeker.skills,
        selectedJobs: input.selectedJobs || targetSeeker.selectedJobs,
        customProfession: input.customProfession?.trim() || targetSeeker.customProfession,
        passportPhotoUrl: input.passportPhotoUrl || targetSeeker.passportPhotoUrl,
        fullBodyPhotoUrl: input.fullBodyPhotoUrl || targetSeeker.fullBodyPhotoUrl,
        contractDateShamsi: input.contractDateShamsi || targetSeeker.contractDateShamsi,
        contractDateMiladi: input.contractDateMiladi || targetSeeker.contractDateMiladi,
        contractAmount: input.contractAmount || targetSeeker.contractAmount,
        payerCardNumber: input.payerCardNumber?.trim() || targetSeeker.payerCardNumber,
        brokerCardNumber: input.brokerCardNumber || targetSeeker.brokerCardNumber,
        signatureDataUrl: input.signatureDataUrl || targetSeeker.signatureDataUrl,
        contractAccepted: true,
      };

      setJobSeekers((prev) => {
        const next = [...prev];
        next[existingIndex] = updatedSeeker;
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
        idbCache.saveSeekers(next);
        return next;
      });
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, updatedSeeker.id);
      syncUserToFirestore(updatedSeeker);
      setCurrentSeekerId(updatedSeeker.id);
      setIsAdminLoggedIn(false);
      setRole('jobseeker');
      setActiveTab('settings');

      addAdminNotification({
        type: 'seeker_registered',
        title: '👤 تکمیل و ثبت پرونده کارجو',
        message: `کارجو «${updatedSeeker.fullName}» پرونده استخدامی و امضای رسمی خود را با موفقیت در سامانه ثبت نمود.`,
        data: { seekerId: updatedSeeker.id },
      });

      showToast(`پرونده و تعهدنامه شما با موفقیت ثبت شد و پنل کاربری شما فعال گردید. خوش آمدید ${updatedSeeker.fullName}!`, 'success');
      return { success: true, seeker: updatedSeeker };
    }

    // Duplicate username check for new user
    const existingUser = jobSeekers.find((s) => s.username.toLowerCase() === cleanUsername);
    if (existingUser) {
      return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.' };
    }

    const newSeeker: JobSeeker = {
      id: 'seeker-' + Date.now(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      fullName: fullName || input.fullName,
      fatherName: input.fatherName.trim(),
      nationalId: cleanNatId,
      gender: input.gender,
      phoneCountryCode: input.phoneCountryCode,
      phoneNumber: input.phoneNumber.trim(),
      phone: formattedPhone,
      email: cleanEmail,
      username: cleanUsername,
      password: cleanPassword,
      iranProvince: input.iranProvince.trim(),
      iranCity: input.iranCity.trim(),
      iranAddress: input.iranAddress.trim(),
      targetCountry: input.targetCountry,
      targetCity: input.targetCity || 'استانبول',
      turkishLevel: input.turkishLevel || 'basic',
      residenceStatus: input.residenceStatus || 'none',
      skills: input.skills && input.skills.length > 0 ? input.skills : ['کار عمومی'],
      bio: input.bio || '',
      // بخش ۳: شغل‌ها، تخصص‌ها و زبان‌ها
      selectedJobs: input.selectedJobs || [],
      customProfession: input.customProfession?.trim() || '',
      targetLanguageLevel: input.targetLanguageLevel || 'basic',
      knownLanguages: input.knownLanguages || ['فارسی'],
      // بخش ۴: مدارک، تعهدنامه رسمی تسویه کارگزار و امضای دیجیتال
      passportPhotoUrl: input.passportPhotoUrl || '',
      fullBodyPhotoUrl: input.fullBodyPhotoUrl || '',
      nationalCardPhotoUrl: input.nationalCardPhotoUrl || '',
      contractDateShamsi: input.contractDateShamsi || '',
      contractDateMiladi: input.contractDateMiladi || '',
      contractAmount: input.contractAmount || brokerSettings.brokerServiceFee,
      payerCardNumber: input.payerCardNumber?.trim() || '',
      brokerCardNumber: input.brokerCardNumber || brokerSettings.brokerCardNumber,
      signatureDataUrl: input.signatureDataUrl || '',
      contractAccepted: input.contractAccepted ?? true,
      createdAt: new Date().toISOString(),
    };

    setJobSeekers((prev) => {
      const next = [newSeeker, ...prev];
      safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
      idbCache.saveSeekers(next);
      return next;
    });
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newSeeker.id);
    syncUserToFirestore(newSeeker);
    setCurrentSeekerId(newSeeker.id);
    setIsAdminLoggedIn(false);
    setRole('jobseeker');
    setActiveTab('settings');

    addAdminNotification({
      type: 'seeker_registered',
      title: '👤 ثبت‌نام کارجو جدید',
      message: `کارجو جدید «${newSeeker.fullName}» با کد/شناسه ${newSeeker.nationalId} در سامانه کارباما ثبت‌نام نمود.`,
      data: { seekerId: newSeeker.id },
    });

    showToast(`ثبت‌نام و تشکیل پرونده با موفقیت انجام شد. پنل کاربری شما فعال است، خوش آمدید ${newSeeker.fullName}!`, 'success');
    return { success: true, seeker: newSeeker };
  };

  const loginSeeker = (username: string, password: string): { success: boolean; error?: string } => {
    const rawUser = toEnglishDigits(username || '').trim().toLowerCase();
    const sanitizedUser = rawUser.replace(/[^a-z0-9_.-]/g, '');
    const normPhone = normalizePhoneForComparison(rawUser);
    const normNatId = normalizeNationalIdForComparison(rawUser);
    const cleanPass = toEnglishDigits(password || '').trim();

    if (!rawUser || !cleanPass) {
      return { success: false, error: 'لطفاً نام کاربری و رمز عبور خود را وارد نمایید.' };
    }

    // Match user by username (exact or sanitized), email, phone number, or national ID
    const matchedSeekers = jobSeekers.filter((s) => {
      const sUser = toEnglishDigits(s.username || '').trim().toLowerCase();
      const sUserSanitized = sUser.replace(/[^a-z0-9_.-]/g, '');
      const sEmail = toEnglishDigits(s.email || '').trim().toLowerCase();
      const sPhone = normalizePhoneForComparison(s.phoneNumber || s.phone || '');
      const sNatId = normalizeNationalIdForComparison(s.nationalId || '');

      return (
        (sUser && (sUser === rawUser || (sanitizedUser.length >= 3 && sUserSanitized === sanitizedUser))) ||
        (sEmail && sEmail === rawUser) ||
        (normPhone.length >= 10 && sPhone === normPhone) ||
        (normNatId.length >= 6 && sNatId === normNatId)
      );
    });

    if (matchedSeekers.length === 0) {
      return {
        success: false,
        error: 'حسابی با این نام کاربری / ایمیل / شماره موبایل یافت نشد. در صورت فراموشی، دکمه «فراموشی رمز عبور» را بزنید.',
      };
    }

    // Check password (exact English digits match or case-insensitive fallback for mobile auto-capitalization)
    const seeker = matchedSeekers.find((s) => {
      const sPass = toEnglishDigits(s.password || '').trim();
      return sPass === cleanPass || sPass.toLowerCase() === cleanPass.toLowerCase();
    });

    if (!seeker) {
      return {
        success: false,
        error: 'رمز عبور وارد شده صحیح نیست. می‌توانید از گزینه «فراموشی رمز عبور» برای مشاهده رمز خود استفاده کنید.',
      };
    }

    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, seeker.id);
    setCurrentSeekerId(seeker.id);
    setIsAdminLoggedIn(false);
    setRole('jobseeker');
    setActiveTab('settings');
    showToast(`خوش آمدید، ${seeker.fullName}!`, 'success');
    return { success: true };
  };

  const loginAdmin = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanInputUser = toEnglishDigits(username || '').trim().toLowerCase();
    const cleanAdminUser = toEnglishDigits(adminCredentials.username || '').trim().toLowerCase();
    const cleanInputPass = toEnglishDigits(password || '').trim();
    const cleanAdminPass = toEnglishDigits(adminCredentials.password || '').trim();

    if (cleanInputUser === cleanAdminUser && cleanInputPass === cleanAdminPass) {
      setIsAdminLoggedIn(true);
      setRole('admin');
      setActiveTab('admin');
      showToast('ورود موفقیت‌آمیز به بخش مدیریت کارباما؛ دسترسی کامل ویرایش و تایید آگهی‌ها فعال گردید.', 'success');
      return { success: true };
    }
    return { success: false, error: 'نام کاربری یا رمز عبور مدیر اشتباه است.' };
  };

  const logoutSeeker = () => {
    setCurrentSeekerId(null);
    setRole('jobseeker');
    setActiveTab('jobs');
    showToast('از حساب کارجو خارج شدید.', 'info');
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setRole('jobseeker');
    setActiveTab('jobs');
    showToast('از حالت مدیریت خارج شدید و بخش مدیریت قفل شد.', 'info');
  };

  const changePassword = (oldPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!currentSeeker) {
      return { success: false, error: 'کاربری وارد نشده است.' };
    }

    const cleanOld = toEnglishDigits(oldPassword || '').trim();
    const currentPass = toEnglishDigits(currentSeeker.password || '').trim();
    if (currentPass !== cleanOld && currentPass.toLowerCase() !== cleanOld.toLowerCase()) {
      return { success: false, error: 'رمز عبور فعلی نادرست است.' };
    }

    const cleanNew = toEnglishDigits(newPassword || '').trim();
    const pwdCheck = checkPasswordStrength(cleanNew);
    if (!pwdCheck.isValid) {
      return { success: false, error: pwdCheck.error };
    }

    setJobSeekers((prev) =>
      prev.map((s) => {
        if (s.id === currentSeeker.id) {
          const updated = { ...s, password: cleanNew };
          syncUserToFirestore(updated);
          return updated;
        }
        return s;
      })
    );

    showToast('رمز عبور شما با موفقیت تغییر یافت.', 'success');
    return { success: true };
  };

  const recoverPassword = (
    emailOrUsername: string
  ): { success: boolean; message?: string; error?: string; username?: string; password?: string } => {
    if (!emailOrUsername || !emailOrUsername.trim()) {
      return { success: false, error: 'لطفاً نام کاربری، ایمیل، شماره موبایل یا کد ملی ثبت‌شده خود را وارد کنید.' };
    }

    const cleanInput = toEnglishDigits(emailOrUsername).trim().toLowerCase();
    const sanitizedInput = cleanInput.replace(/[^a-z0-9_.-]/g, '');
    const normPhone = normalizePhoneForComparison(cleanInput);
    const normNatId = normalizeNationalIdForComparison(cleanInput);

    // 1. Search Seekers by username, email, phone, or nationalId
    const seeker = jobSeekers.find((s) => {
      const sUser = toEnglishDigits(s.username || '').trim().toLowerCase();
      const sEmail = toEnglishDigits(s.email || '').trim().toLowerCase();
      const sPhone = normalizePhoneForComparison(s.phoneNumber || s.phone || '');
      const sNatId = normalizeNationalIdForComparison(s.nationalId || '');
      return (
        sUser === cleanInput ||
        (sanitizedInput.length >= 3 && sUser.replace(/[^a-z0-9_.-]/g, '') === sanitizedInput) ||
        (sEmail && sEmail === cleanInput) ||
        (normPhone.length >= 10 && sPhone === normPhone) ||
        (normNatId.length >= 6 && sNatId === normNatId)
      );
    });
    if (seeker) {
      return {
        success: true,
        username: seeker.username,
        password: seeker.password,
        message: `اطلاعات حساب کارجو پیدا شد! نام کاربری: ${seeker.username} | رمز عبور: ${seeker.password}`,
      };
    }

    // 2. Search Partners
    const partner = partners.find((p) => {
      const pUser = toEnglishDigits(p.username || '').trim().toLowerCase();
      const pEmail = toEnglishDigits(p.email || '').trim().toLowerCase();
      const pPhone = normalizePhoneForComparison(p.phone || '');
      return (
        pUser === cleanInput ||
        (pEmail && pEmail === cleanInput) ||
        (normPhone.length >= 10 && pPhone === normPhone)
      );
    });
    if (partner) {
      return {
        success: true,
        username: partner.username,
        password: partner.password,
        message: `اطلاعات حساب همکار پیدا شد! نام کاربری: ${partner.username} | رمز عبور: ${partner.password}`,
      };
    }

    // 3. Search Admin Credentials
    if (toEnglishDigits(adminCredentials.username).trim().toLowerCase() === cleanInput) {
      return {
        success: true,
        username: adminCredentials.username,
        password: adminCredentials.password,
        message: `اطلاعات حساب مدیر ارشد پیدا شد! نام کاربری: ${adminCredentials.username} | رمز عبور: ${adminCredentials.password}`,
      };
    }

    return {
      success: false,
      error: 'هیچ حسابی با این نام کاربری، ایمیل، شماره موبایل یا کد ملی در سامانه یافت نشد.',
    };
  };

  const updateProfile = (updates: Partial<JobSeeker>): { success: boolean; error?: string } => {
    if (!currentSeeker) {
      return { success: false, error: 'ابتدا وارد حساب کاربری خود شوید.' };
    }

    setJobSeekers((prev) =>
      prev.map((s) => (s.id === currentSeeker.id ? { ...s, ...updates } : s))
    );

    showToast('مشخصات پروفایل شما با موفقیت به روز شد.', 'success');
    return { success: true };
  };

  const updateResume = (resume: SeekerResume): { success: boolean; error?: string } => {
    if (!currentSeekerId) {
      showToast('لطفاً ابتدا وارد حساب کارجو شوید.', 'error');
      return { success: false, error: 'کارجو وارد نشده است' };
    }

    setJobSeekers((prev) =>
      prev.map((s) =>
        s.id === currentSeekerId
          ? {
              ...s,
              skills: resume.skillsList && resume.skillsList.length > 0 ? resume.skillsList : s.skills,
              bio: resume.summary || s.bio,
              resume: { ...resume, updatedAt: new Date().toISOString().split('T')[0] },
            }
          : s
      )
    );

    showToast('رزومه آنلاین شما در کارباما با موفقیت ذخیره شد 📄✨', 'success');
    return { success: true };
  };

  const applyForJob = (jobId: string, note?: string): { success: boolean; error?: string } => {
    if (!currentSeeker) {
      return { success: false, error: 'برای ارسال درخواست کار، ابتدا باید ثبت‌نام کرده یا وارد حساب شوید.' };
    }

    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      return { success: false, error: 'آگهی شغلی یافت نشد.' };
    }

    const alreadyApplied = applications.some(
      (a) => a.jobId === jobId && a.seekerId === currentSeeker.id
    );

    if (alreadyApplied) {
      return { success: false, error: 'شما قبلاً برای این فرصت شغلی درخواست ارسال کرده‌اید.' };
    }

    const newApplication: JobApplication = {
      id: 'app-' + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company,
      city: job.city,
      seekerId: currentSeeker.id,
      seekerName: currentSeeker.fullName,
      seekerFatherName: currentSeeker.fatherName,
      seekerNationalId: currentSeeker.nationalId,
      seekerPhone: currentSeeker.phone || currentSeeker.phoneNumber || '',
      seekerUsername: currentSeeker.username,
      seekerSkills: currentSeeker.skills,
      seekerTurkishLevel: currentSeeker.turkishLevel,
      seekerResidence: currentSeeker.residenceStatus,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      adminNote: note ? `پیام کارجو: ${note}` : undefined,
    };

    setApplications((prev) => [newApplication, ...prev]);
    showToast(`درخواست شما برای «${job.title}» با موفقیت ثبت شد!`, 'success');
    return { success: true };
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus, adminNote?: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status,
              adminNote: adminNote !== undefined ? adminNote : app.adminNote,
            }
          : app
      )
    );
    showToast('وضعیت درخواست کارجو بروزرسانی شد.', 'success');
  };

  // Check if a newly posted job matches any active JobAlertSubscription or Favorite Job Categories
  const checkJobAlerts = (newJob: JobVacancy) => {
    let notifiedAlready = false;

    // 1. Check user's Favorite Job Categories first
    const allFavCategories = Array.from(
      new Set([...favoriteJobCategories, ...(currentSeeker?.favoriteCategories || [])])
    );

    if (allFavCategories.includes(newJob.category)) {
      notifiedAlready = true;
      const favNotif: JobNotification = {
        id: 'notif-fav-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        alertId: `fav-cat-${newJob.category}`,
        jobId: newJob.id,
        jobTitle: newJob.title,
        company: newJob.company,
        city: newJob.city,
        salaryText: `${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
        imageUrl: newJob.imageUrl,
        message: `🎯 شغل جدید در دسته‌بندی مورد علاقه شما ثبت شد: «${newJob.title}» در ${newJob.city}`,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setJobNotifications((prev) => [favNotif, ...prev]);
      syncNotificationToFirestore(favNotif);

      showToast(
        `🔔 فرصت شغلی جدید در دسته‌بندی مورد علاقه شما: «${newJob.title}» در ${newJob.city} با حقوق ${newJob.salaryMin.toLocaleString('fa-IR')} لیر ثبت شد!`,
        'success'
      );

      showSafeNotification(
        `🔔 شغل جدید در دسته‌بندی مورد علاقه شما: ${newJob.title}`,
        {
          body: `${newJob.company} (${newJob.city}) - حقوق: ${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
          icon: newJob.imageUrl || '/pwa-192x192.png',
          dir: 'rtl',
          lang: 'fa',
        },
        'none'
      );
    }

    // 2. Check custom JobAlertSubscriptions
    jobAlerts.forEach((alert) => {
      if (!alert.isActive) return;

      if (alert.city !== 'همه شهرها' && newJob.city !== alert.city) return;
      if (alert.category !== 'all' && newJob.category !== alert.category) return;
      if (alert.contractType !== 'all') {
        const cType = newJob.contractType || 'full_time';
        if (cType !== alert.contractType) return;
      }
      if (alert.minSalary && newJob.salaryMax < alert.minSalary) return;
      if (alert.accommodationOnly && !newJob.accommodation) return;
      if (alert.workPermitOnly && !newJob.workPermitSupport) return;

      if (alert.keywords && alert.keywords.length > 0) {
        const searchPool = `${newJob.title} ${newJob.description} ${newJob.company} ${newJob.district} ${(newJob.keywords || []).join(' ')}`.toLowerCase();
        const matchesAny = alert.keywords.some((k) => searchPool.includes(k.toLowerCase().trim()));
        if (!matchesAny) return;
      }

      if (notifiedAlready && alert.id.startsWith('fav-cat-')) return;

      // Create matched Notification
      const newNotif: JobNotification = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        alertId: alert.id,
        jobId: newJob.id,
        jobTitle: newJob.title,
        company: newJob.company,
        city: newJob.city,
        salaryText: `${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
        imageUrl: newJob.imageUrl,
        message: `فرصت شغلی جدید در کارباما منطبق با هشدار شما («${alert.title}»): ${newJob.title} در شهر ${newJob.city}`,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setJobNotifications((prev) => [newNotif, ...prev]);
      syncNotificationToFirestore(newNotif);

      if (alert.enableInAppToast && !notifiedAlready) {
        showToast(
          `🔔 فرصت شغلی جدید مطابق معیارهای شما: «${newJob.title}» در ${newJob.city} با حقوق ${newJob.salaryMin.toLocaleString('fa-IR')} لیر منتشر شد!`,
          'info'
        );
      }

      if (alert.enableBrowserPush && !notifiedAlready) {
        showSafeNotification(
          `🔔 فرصت شغلی جدید در کارباما: ${newJob.title}`,
          {
            body: `${newJob.company} (${newJob.city}) - حقوق: ${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
            icon: newJob.imageUrl || '/pwa-192x192.png',
            dir: 'rtl',
            lang: 'fa',
          },
          'none'
        );
      }
      notifiedAlready = true;
    });
  };

  // Job management
  const addJob = (jobData: Omit<JobVacancy, 'id' | 'postedAt'>) => {
    const newJob: JobVacancy = {
      ...jobData,
      id: 'job-' + Date.now(),
      postedAt: new Date().toISOString(),
      paymentStatus: jobData.paymentStatus || 'paid', // When added directly from admin, mark as paid
      paymentAmountTL: jobData.paymentAmountTL || paymentSettings.feeTL,
      paymentAmountToman: jobData.paymentAmountToman || (paymentSettings.feeTL * paymentSettings.exchangeRateToman),
    };

    setJobs((prev) => [newJob, ...prev]);
    syncJobToFirestore(newJob);
    showToast('آگهی کار با موفقیت ایجاد شد.', 'success');

    if (newJob.isActive && (newJob.paymentStatus === 'paid' || !newJob.paymentStatus)) {
      checkJobAlerts(newJob);

      // Create SINGLE notification entry for general users
      const notifItem: JobNotification = {
        id: 'notif-job-' + Date.now(),
        alertId: 'system-new-job',
        jobId: newJob.id,
        jobTitle: newJob.title,
        company: newJob.company,
        city: newJob.city,
        salaryText: `${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
        imageUrl: newJob.imageUrl,
        message: `آگهی جدید استخدام: ${newJob.title} در ${newJob.city} (${newJob.company})`,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setJobNotifications((prev) => [notifItem, ...prev]);
      syncNotificationToFirestore(notifItem);

      // Play single distinct 4-tone ascending ding sound
      playNewJobHotelDingSound();
    }
  };

  // Employer Job Posting with 500 TL Fee Payment
  const submitJobWithPayment = (jobData: Omit<JobVacancy, 'id' | 'postedAt' | 'isActive'>): { success: boolean; jobId: string } => {
    const isOnlinePaid = jobData.paymentMethod === 'zarinpal';
    const status: JobPaymentStatus = isOnlinePaid ? 'paid' : 'pending_approval';
    const id = 'job-' + Date.now();

    const newJob: JobVacancy = {
      ...jobData,
      id,
      postedAt: new Date().toISOString(),
      isActive: isOnlinePaid, // If paid online, directly active; if bank/card, awaiting admin approval
      paymentStatus: status,
      paymentAmountTL: paymentSettings.feeTL,
      paymentAmountToman: paymentSettings.feeTL * paymentSettings.exchangeRateToman,
      paymentDate: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);

    if (isOnlinePaid) {
      showToast('پرداخت آنلاین تعرفه تایید شد و آگهی شما بلافاصله در سایت منتشر گردید.', 'success');
      checkJobAlerts(newJob);

      const notifItem: JobNotification = {
        id: 'notif-job-' + Date.now(),
        alertId: 'system-new-job',
        jobId: newJob.id,
        jobTitle: newJob.title,
        company: newJob.company,
        city: newJob.city,
        salaryText: `${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
        imageUrl: newJob.imageUrl,
        message: `آگهی جدید استخدام: ${newJob.title} در ${newJob.city} (${newJob.company})`,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setJobNotifications((prev) => [notifItem, ...prev]);
      syncNotificationToFirestore(notifItem);

      // Play single distinct 4-tone ascending ding sound
      playNewJobHotelDingSound();
    } else {
      // Notify Admin panel specifically about employer payment submission
      addAdminNotification({
        type: 'employer_payment',
        title: '💳 فیش واریزی آگهی استخدام کارفرما',
        message: `کارفرما فیش واریزی تعرفه آگهی را برای عنوان «${newJob.title}» جهت تایید ثبت نمود.`,
        data: { jobId: newJob.id },
      });
      showToast('آگهی و فیش واریز شما با موفقیت ثبت شد و پس از بررسی و تایید مدیر منتشر خواهد شد.', 'success');
    }

    return { success: true, jobId: id };
  };

  const approveJobPayment = (jobId: string, adminNote?: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const updated: JobVacancy = {
            ...j,
            isActive: true,
            paymentStatus: 'paid',
            paymentAdminNote: adminNote || 'پرداخت تعرفه تایید شد و آگهی فعال گردید.',
          };
          checkJobAlerts(updated);

          const notifItem: JobNotification = {
            id: 'notif-job-app-' + Date.now(),
            alertId: 'system-new-job',
            jobId: updated.id,
            jobTitle: updated.title,
            company: updated.company,
            city: updated.city,
            salaryText: `${updated.salaryMin.toLocaleString('fa-IR')} تا ${updated.salaryMax.toLocaleString('fa-IR')} لیر`,
            imageUrl: updated.imageUrl,
            message: `آگهی جدید استخدام تایید گردید: ${updated.title} در ${updated.city}`,
            read: false,
            createdAt: new Date().toISOString(),
          };

          setJobNotifications((notifs) => [notifItem, ...notifs]);
          syncNotificationToFirestore(notifItem);
          playNewJobHotelDingSound();

          return updated;
        }
        return j;
      })
    );
    showToast('پرداخت آگهی تایید شد و آگهی با موفقیت در سایت فعال و منتشر گردید.', 'success');
  };

  const rejectJobPayment = (jobId: string, reason: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            isActive: false,
            paymentStatus: 'rejected',
            paymentAdminNote: reason || 'فیش واریزی نامعتبر یا مبلغ ناقص است.',
          };
        }
        return j;
      })
    );
    showToast('پرداخت آگهی رد شد و وضعیت به‌روزرسانی گردید.', 'info');
  };

  const updateJob = (id: string, updates: Partial<JobVacancy>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    showToast('آگهی کار با موفقیت ویرایش شد.', 'success');
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    showToast('آگهی کار حذف شد.', 'info');
  };

  const toggleJobStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, isActive: !j.isActive } : j))
    );
    showToast('وضعیت آگهی تغییر کرد.', 'info');
  };

  // Hotel management
  const addHotel = (hotelData: Omit<Hotel, 'id'>) => {
    const newHotel: Hotel = {
      ...hotelData,
      id: 'hotel-' + Date.now(),
    };
    setHotels((prev) => [newHotel, ...prev]);

    // Push notification entry for new Hotel to increment numeric badge counter
    const hotelNotifItem: JobNotification = {
      id: 'notif-hotel-' + Date.now(),
      alertId: 'system-new-hotel',
      jobId: newHotel.id,
      jobTitle: `🏨 هتل جدید: ${newHotel.name}`,
      company: newHotel.name,
      city: newHotel.city,
      salaryText: `${newHotel.pricePerNight.toLocaleString('fa-IR')} لیر (هر شب)`,
      imageUrl: newHotel.imageUrl,
      message: `اقامتگاه و هتل جدید در کارباما: ${newHotel.name} در ${newHotel.city}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setJobNotifications((prev) => [hotelNotifItem, ...prev]);
    syncNotificationToFirestore(hotelNotifItem);

    // Play distinct 4-tone ascending ding sound for new hotel addition
    showSafeNotification(
      `🏨 هتل جدید در کارباما: ${newHotel.name}`,
      {
        body: `اقامتگاه ${newHotel.name} در ${newHotel.city} با امکانات کامل رزرو اضافه گردید.`,
        icon: newHotel.imageUrl || '/pwa-192x192.png',
        tag: `new-hotel-${newHotel.id}`,
      },
      'job_hotel'
    );

    showToast('هتل جدید با موفقیت به کارباما اضافه شد.', 'success');
  };

  const updateHotel = (id: string, updates: Partial<Hotel>) => {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    showToast('مشخصات هتل بروزرسانی شد.', 'success');
  };

  const deleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
    showToast('هتل مورد نظر حذف شد.', 'info');
  };

  const bookHotel = (
    bookingData: Omit<HotelBooking, 'id' | 'status' | 'bookedAt'>
  ): { success: boolean; error?: string } => {
    if (!bookingData.guestName.trim() || !bookingData.guestPhone.trim() || !bookingData.checkInDate) {
      return { success: false, error: 'لطفاً نام، شماره تماس و تاریخ ورود را تکمیل فرمایید.' };
    }

    const newBooking: HotelBooking = {
      ...bookingData,
      id: 'book-' + Date.now(),
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    setHotelBookings((prev) => [newBooking, ...prev]);
    showToast(`رزرو موقت در «${bookingData.hotelName}» با موفقیت ثبت شد!`, 'success');
    return { success: true };
  };

  const updateBookingStatus = (id: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    setHotelBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    showToast('وضعیت رزرو هتل تغییر یافت.', 'info');
  };

  // Transit lines management
  const addTransitLine = (lineData: Omit<TransitLine, 'id'>) => {
    const newLine: TransitLine = {
      ...lineData,
      id: 'transit-' + Date.now(),
    };
    setTransitLines((prev) => [newLine, ...prev]);
    showToast('خط جدید حمل و نقل با موفقیت اضافه شد.', 'success');
  };

  const deleteTransitLine = (id: string) => {
    setTransitLines((prev) => prev.filter((t) => t.id !== id));
    showToast('خط حمل و نقل حذف شد.', 'info');
  };

  const addAddress = (addrData: Omit<EssentialAddress, 'id'>) => {
    const newAddr: EssentialAddress = {
      ...addrData,
      id: 'addr-' + Date.now(),
    };
    setAddresses((prev) => [newAddr, ...prev]);
    showToast('آدرس جدید به راهنمای کارباما اضافه شد.', 'success');
  };

  const updateAddress = (id: string, updates: Partial<EssentialAddress>) => {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    showToast('مشخصات مرکز بروزرسانی شد.', 'success');
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('آدرس حذف شد.', 'info');
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const isAlready = prev.includes(jobId);
      if (isAlready) {
        showToast('آگهی از لیست نشان‌شده‌ها حذف شد', 'info');
        return prev.filter((id) => id !== jobId);
      } else {
        showToast('آگهی به لیست کارهای نشان‌شده شما اضافه شد ❤️', 'success');
        return [...prev, jobId];
      }
    });
  };

  const isJobSaved = (jobId: string) => savedJobIds.includes(jobId);

  // Favorite Job Categories for Instant Notifications
  const [favoriteJobCategories, setFavoriteJobCategories] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem('karbama_favorite_categories_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const isCategoryFavorite = (categoryKey: string) => favoriteJobCategories.includes(categoryKey);

  const toggleFavoriteCategory = (categoryKey: string, categoryLabel?: string) => {
    const label = categoryLabel || categoryKey;
    const exists = favoriteJobCategories.includes(categoryKey);
    const next = exists
      ? favoriteJobCategories.filter((c) => c !== categoryKey)
      : [...favoriteJobCategories, categoryKey];

    setFavoriteJobCategories(next);
    try {
      safeStorage.setItem('karbama_favorite_categories_v1', JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }

    if (currentSeeker) {
      updateProfile({ favoriteCategories: next });
    }

    if (!exists) {
      // Automatically create or activate a JobAlertSubscription for this category
      setJobAlerts((prev) => {
        const alertId = `fav-cat-${categoryKey}`;
        const existingIdx = prev.findIndex((a) => a.id === alertId || (a.category === categoryKey && a.city === 'همه شهرها'));
        if (existingIdx >= 0) {
          return prev.map((a, idx) => (idx === existingIdx ? { ...a, isActive: true } : a));
        }
        const autoAlert: JobAlertSubscription = {
          id: alertId,
          title: `اعلان خودکار دسته: ${label}`,
          city: 'همه شهرها',
          category: categoryKey,
          contractType: 'all',
          minSalary: 0,
          keywords: [],
          accommodationOnly: false,
          workPermitOnly: false,
          enableBrowserPush: true,
          enableInAppToast: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        return [autoAlert, ...prev];
      });

      if (pushPermissionStatus === 'default') {
        requestPushPermission();
      }
      showToast(`🔔 اعلان خودکار برای دسته‌بندی «${label}» فعال شد! به محض ثبت شغل جدید نوتیفیکیشن دریافت می‌کنید.`, 'success');
    } else {
      setJobAlerts((prev) => prev.filter((a) => a.id !== `fav-cat-${categoryKey}`));
      showToast(`اعلان دسته‌بندی «${label}» از علاقه‌مندی‌ها حذف شد.`, 'info');
    }
  };

  // Job Alert methods
  const saveJobAlert = (alertData: Omit<JobAlertSubscription, 'id' | 'createdAt'>): JobAlertSubscription => {
    const newAlert: JobAlertSubscription = {
      ...alertData,
      id: 'alert-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setJobAlerts((prev) => [newAlert, ...prev]);
    showToast(`هشدار شغلی «${newAlert.title}» با موفقیت فعال شد 🔔`, 'success');

    if (newAlert.enableBrowserPush && pushPermissionStatus === 'default') {
      requestPushPermission();
    }

    return newAlert;
  };

  const deleteJobAlert = (id: string) => {
    setJobAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('هشدار شغلی حذف شد.', 'info');
  };

  const toggleJobAlert = (id: string) => {
    setJobAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newState = !a.isActive;
          showToast(newState ? 'هشدار شغلی فعال شد.' : 'هشدار شغلی غیرفعال شد.', 'info');
          return { ...a, isActive: newState };
        }
        return a;
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setJobNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setJobNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('تمام اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند.', 'info');
  };

  const clearNotifications = () => {
    setJobNotifications([]);
    showToast('تاریخچه اعلان‌ها پاک شد.', 'info');
  };

  const requestPushPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
    const res = await requestSafeNotificationPermission();
    if (res === 'granted' || res === 'denied' || res === 'default') {
      setPushPermissionStatus(res);
      if (res === 'granted') {
        showToast('اعلان‌های مرورگر با موفقیت فعال شدند 🔔', 'success');
      } else if (res === 'denied') {
        showToast('دسترسی نوتیفیکیشن در تنظیمات مرورگر مسدود شده است.', 'error');
      }
      return res;
    }
    setPushPermissionStatus('unsupported');
    showToast('مرورگر شما یا محیط فعلی از اعلان‌های سیستمی پشتیبانی نمی‌کند؛ اعلان‌ها در اپلیکیشن کارباما فعال هستند.', 'info');
    return 'denied';
  };

  const triggerTestJobAlert = (customAlert?: JobAlertSubscription) => {
    const targetAlert = customAlert || jobAlerts[0] || DEFAULT_INITIAL_ALERTS[0];
    const sampleJob = jobs[0] || INITIAL_JOBS[0];

    const testNotif: JobNotification = {
      id: 'notif-' + Date.now(),
      alertId: targetAlert.id,
      jobId: sampleJob.id,
      jobTitle: sampleJob.title,
      company: sampleJob.company,
      city: sampleJob.city,
      salaryText: `${sampleJob.salaryMin.toLocaleString('fa-IR')} تا ${sampleJob.salaryMax.toLocaleString('fa-IR')} لیر`,
      imageUrl: sampleJob.imageUrl,
      message: `تست زنده اعلان کارباما («${targetAlert.title}»): فرصت شغلی جدید منتشر شد.`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setJobNotifications((prev) => [testNotif, ...prev]);

    if (targetAlert.enableInAppToast) {
      showToast(
        `🔔 [تست هشدار کارباما]: «${sampleJob.title}» در ${sampleJob.city} با حقوق ${sampleJob.salaryMin.toLocaleString('fa-IR')} لیر تطبیق داده شد!`,
        'success'
      );
    }

    if (targetAlert.enableBrowserPush) {
      showSafeNotification(`🔔 تست زنده هشدار کارباما: ${sampleJob.title}`, {
        body: `${sampleJob.company} (${sampleJob.city}) - سیستم هشدار فعال و متصل است`,
        icon: sampleJob.imageUrl || '/pwa-192x192.png',
        dir: 'rtl',
        lang: 'fa',
      });
    }
  };

  const unreadNotificationCount = jobNotifications.filter((n) => !n.read).length;

  const switchToDemoUser = () => {
    const demo = jobSeekers[0];
    if (demo) {
      setCurrentSeekerId(demo.id);
      setRole('jobseeker');
      setActiveTab('jobs');
      showToast(`ورود سریع به حساب کارجو (${demo.fullName}) انجام شد.`, 'info');
    } else {
      setRole('jobseeker');
      setActiveTab('jobs');
      showToast('هیچ کارجویی در سامانه ثبت نشده است. سامانه آماده ثبت‌نام اولین کارجو می‌باشد.', 'info');
    }
  };

  const switchToDemoAdmin = () => {
    setIsAdminLoggedIn(true);
    setRole('admin');
    setActiveTab('admin');
    showToast('ورود با دسترسی مدیر ارشد کارباما؛ تمامی بخش‌ها قابل ویرایش هستند.', 'success');
  };

  // ==========================================
  // Partner System Methods (بخش همکاران و اشتراک)
  // ==========================================
  const loginPartner = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = toEnglishDigits(username || '').trim().toLowerCase();
    const cleanPass = toEnglishDigits(password || '').trim();
    const normPhone = normalizePhoneForComparison(cleanUser);

    const found = partners.find((p) => {
      const pUser = toEnglishDigits(p.username || '').trim().toLowerCase();
      const pEmail = toEnglishDigits(p.email || '').trim().toLowerCase();
      const pPhone = normalizePhoneForComparison(p.phone || '');
      const pPass = toEnglishDigits(p.password || '').trim();
      const userMatches =
        pUser === cleanUser ||
        (pEmail && pEmail === cleanUser) ||
        (normPhone.length >= 10 && pPhone === normPhone);
      const passMatches = pPass === cleanPass || pPass.toLowerCase() === cleanPass.toLowerCase();
      return userMatches && passMatches;
    });

    if (!found) {
      return { success: false, error: 'نام کاربری یا رمز عبور همکار اشتباه است.' };
    }

    setCurrentPartnerId(found.id);
    setRole('partner');
    setActiveTab('partner');
    showToast(`خوش آمدید، همکار گرامی ${found.fullName} (${found.companyName})`, 'success');
    return { success: true };
  };

  const registerPartner = (input: RegisterPartnerInput): { success: boolean; error?: string } => {
    if (!input.companyName.trim() || !input.fullName.trim() || !input.phone.trim()) {
      return { success: false, error: 'لطفاً نام شرکت/آژانس، نام نماینده و شماره تماس را وارد فرمایید.' };
    }
    if (!input.username.trim() || !input.password.trim()) {
      return { success: false, error: 'تعیین نام کاربری و رمز عبور الزامی است.' };
    }

    if (input.email && !isValidEmail(input.email)) {
      return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر (جهت بازیابی رمز عبور) وارد کنید.' };
    }

    const pwdCheck = checkPasswordStrength(input.password);
    if (!pwdCheck.isValid) {
      return { success: false, error: pwdCheck.error };
    }

    const cleanUser = input.username.trim().toLowerCase();
    if (partners.some((p) => p.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً نام دیگری انتخاب نمایید.' };
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPartner: PartnerAccount = {
      id: 'partner-' + Date.now(),
      partnerCode: `PART-${randomNum}`,
      companyName: input.companyName.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim().toLowerCase() || '',
      username: cleanUser,
      password: input.password,
      city: input.city?.trim() || 'استانبول',
      subscriptionStatus: 'active',
      daysRemaining: 365,
      createdAt: new Date().toISOString(),
    };

    setPartners((prev) => [newPartner, ...prev]);
    syncPartnerToFirestore(newPartner);
    setCurrentPartnerId(newPartner.id);
    setRole('partner');
    setActiveTab('partner');

    addAdminNotification({
      type: 'partner_registered',
      title: 'همکار جدید در سامانه ثبت‌نام کرد',
      message: `همکار جدید «${newPartner.companyName}» با مدیریت ${newPartner.fullName} و کد همکاری ${newPartner.partnerCode} در کارباما ثبت شد.`,
    });

    showToast(`حساب همکاری با موفقیت ایجاد شد! کد همکاری شما: ${newPartner.partnerCode}`, 'success');
    return { success: true };
  };

  const adminCreatePartner = (input: AdminCreatePartnerInput): { success: boolean; error?: string; partner?: PartnerAccount } => {
    if (!input.companyName.trim() || !input.fullName.trim() || !input.phone.trim()) {
      return { success: false, error: 'لطفاً نام شرکت/دفتر همکار، نام نماینده و شماره تماس را وارد فرمایید.' };
    }
    if (!input.username.trim() || !input.password.trim()) {
      return { success: false, error: 'تعیین نام کاربری و کلمه عبور الزامی است.' };
    }

    if (input.email && !isValidEmail(input.email)) {
      return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر وارد کنید.' };
    }

    const cleanUser = input.username.trim().toLowerCase();
    if (partners.some((p) => p.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'این نام کاربری قبلاً در سامانه همکاران ثبت شده است. نام دیگری انتخاب نمایید.' };
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = input.partnerCode?.trim() || `PART-${randomNum}`;
    const plan = input.planId ? partnerPlans.find(p => p.id === input.planId) : undefined;
    const initialStatus = input.subscriptionStatus || 'active';
    const initialDays = input.daysRemaining !== undefined ? input.daysRemaining : (initialStatus === 'active' ? 365 : 0);

    const newPartner: PartnerAccount = {
      id: 'partner-' + Date.now(),
      partnerCode: code,
      companyName: input.companyName.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim().toLowerCase() || '',
      username: cleanUser,
      password: input.password,
      city: input.city?.trim() || 'استانبول',
      subscriptionStatus: initialStatus,
      planId: input.planId || '1_year',
      planTitle: plan?.title || 'اشتراک ۱ ساله همکاران کارباما',
      daysRemaining: initialDays,
      adminApprovalNote: input.adminNote?.trim() || 'ثبت و تایید مستقیم توسط مدیریت سامانه',
      createdAt: new Date().toISOString(),
    };

    setPartners((prev) => [newPartner, ...prev]);
    syncPartnerToFirestore(newPartner);

    addAdminNotification({
      type: 'partner_registered',
      title: 'همکار جدید توسط مدیر ثبت شد',
      message: `حساب کاربری همکار «${newPartner.companyName}» با مدیریت ${newPartner.fullName} و کد اختصاصی ${newPartner.partnerCode} در سامانه فعال گردید.`,
    });

    showToast(`همکار جدید «${newPartner.companyName}» با کد همکاری ${newPartner.partnerCode} با موفقیت ثبت شد.`, 'success');
    return { success: true, partner: newPartner };
  };

  const logoutPartner = () => {
    setCurrentPartnerId(null);
    setRole('jobseeker');
    showToast('از پنل همکاران خارج شدید.', 'info');
  };

  const submitPartnerSubscriptionPayment = (
    planId: PartnerSubscriptionPlanId,
    paymentMethod: PaymentMethod,
    paymentReceiptUrl?: string,
    paymentReferenceId?: string,
    paymentPayerName?: string
  ): { success: boolean; error?: string } => {
    if (!currentPartner) {
      return { success: false, error: 'ابتدا باید وارد حساب همکار شوید.' };
    }

    const plan = partnerPlans.find((p) => p.id === planId) || DEFAULT_PARTNER_PLANS[0];

    let targetUpdatedPartner: PartnerAccount | undefined;
    const updatedPartners = partners.map((p) => {
      if (p.id === currentPartner.id) {
        const updated = {
          ...p,
          subscriptionStatus: 'pending_approval' as PartnerSubscriptionStatus,
          planId: plan.id,
          planTitle: plan.title,
          paymentAmountTL: plan.priceTL,
          paymentAmountToman: plan.priceToman,
          paymentMethod,
          paymentReceiptUrl: paymentReceiptUrl || p.paymentReceiptUrl,
          paymentReferenceId: paymentReferenceId || 'REF-' + Math.floor(100000 + Math.random() * 900000),
          paymentPayerName: paymentPayerName || currentPartner.fullName,
          paymentDate: new Date().toISOString().split('T')[0],
        };
        targetUpdatedPartner = updated;
        return updated;
      }
      return p;
    });

    setPartners(updatedPartners);
    if (targetUpdatedPartner) {
      syncPartnerToFirestore(targetUpdatedPartner);
    }

    addAdminNotification({
      type: 'partner_payment',
      title: 'فیش پرداخت حق اشتراک همکار ثبت شد',
      message: `همکار «${currentPartner.companyName}» فیش واریزی برای ${plan.title} (${plan.priceTL.toLocaleString('fa-IR')} لیر) را ارسال نمود. جهت فعال‌سازی بررسی شود.`,
    });

    showToast('رسید پرداخت حق اشتراک ثبت شد و پس از بررسی مدیر فعال می‌گردد.', 'success');
    return { success: true };
  };

  const approvePartnerSubscription = (partnerId: string, note?: string) => {
    let approvedPartner: PartnerAccount | undefined;
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          const plan = partnerPlans.find((pl) => pl.id === p.planId) || DEFAULT_PARTNER_PLANS[0];
          const durationDays = plan.durationMonths * 30;
          const startDate = new Date();
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + durationDays);

          const updated = {
            ...p,
            subscriptionStatus: 'active' as PartnerSubscriptionStatus,
            subscriptionStartDate: startDate.toISOString(),
            subscriptionExpiresAt: expireDate.toISOString(),
            daysRemaining: durationDays,
            adminApprovalNote: note || 'اشتراک توسط مدیریت تایید و فعال شد.',
          };
          approvedPartner = updated;
          return updated;
        }
        return p;
      })
    );

    if (approvedPartner) {
      syncPartnerToFirestore(approvedPartner);
    }

    showToast('اشتراک همکار با موفقیت فعال شد و دسترسی ثبت کارجو باز گردید.', 'success');
  };

  const rejectPartnerSubscription = (partnerId: string, reason: string) => {
    let rejectedPartner: PartnerAccount | undefined;
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          const updated = {
            ...p,
            subscriptionStatus: 'unpaid' as PartnerSubscriptionStatus,
            adminApprovalNote: reason || 'فیش پرداخت توسط مدیریت رد شد.',
          };
          rejectedPartner = updated;
          return updated;
        }
        return p;
      })
    );

    if (rejectedPartner) {
      syncPartnerToFirestore(rejectedPartner);
    }

    showToast('درخواست اشتراک همکار رد شد.', 'info');
  };

  const updatePartnerPlanPricing = (planId: PartnerSubscriptionPlanId, priceTL: number, priceToman: number) => {
    setPartnerPlans((prev) =>
      prev.map((pl) => (pl.id === planId ? { ...pl, priceTL, priceToman } : pl))
    );
    showToast('تعرفه اشتراک همکاران با موفقیت بروزرسانی شد.', 'success');
  };

  const updatePartnerPlans = (plans: PartnerSubscriptionPlan[]) => {
    setPartnerPlans(plans);
    showToast('پلن‌های اشتراک همکاران ذخیره شد.', 'success');
  };

  const registerSeekerByPartner = (
    input: RegisterSeekerByPartnerInput
  ): { success: boolean; error?: string; seekerId?: string } => {
    const activePartnerObj = currentPartner || (isAdminLoggedIn ? partners[0] || {
      id: 'partner-admin',
      partnerCode: 'PART-ADMIN',
      companyName: 'پنل همکار (مدیریت)',
      fullName: 'مدیر سیستم',
    } : null);

    if (!activePartnerObj) {
      return { success: false, error: 'برای ثبت کارجو ابتدا وارد پنل همکار شوید.' };
    }
    if (!input.fullName.trim() || !input.nationalId.trim() || !input.phoneNumber.trim()) {
      return { success: false, error: 'نام و نام خانوادگی، کد ملی و شماره تماس کارجو الزامی است.' };
    }

    const cleanNatId = input.nationalId.replace(/\s/g, '');
    const cleanPhone = input.phone || `${input.phoneCountryCode} ${input.phoneNumber.trim()}`;
    const autoUsername = `seeker_${cleanNatId.slice(-4)}_${Math.floor(100 + Math.random() * 900)}`;
    const autoPassword = `Kb${Math.floor(100000 + Math.random() * 900000)}`;
    const jobTitle = input.selectedJobTitle || input.customProfession || (input.selectedJobs && input.selectedJobs[0]) || 'کار عمومی';

    const newSeeker: JobSeeker = {
      id: 'seeker-p-' + Date.now(),
      fullName: input.fullName.trim(),
      fatherName: input.fatherName?.trim() || 'ثبت توسط همکار',
      nationalId: cleanNatId,
      gender: input.gender,
      phoneCountryCode: input.phoneCountryCode,
      phoneNumber: input.phoneNumber.trim(),
      phone: cleanPhone,
      username: autoUsername,
      password: autoPassword,
      iranProvince: input.iranProvince || 'تهران',
      iranCity: input.iranCity || 'تهران',
      iranAddress: input.iranProvince ? `${input.iranProvince}، ${input.iranCity || ''}` : 'ثبت‌شده توسط همکار',
      targetCountry: input.targetCountry,
      targetCity: input.targetCity || 'استانبول',
      targetDistrict: input.targetDistrict || '',
      turkishLevel: input.turkishLevel,
      residenceStatus: input.residenceStatus,
      skills: input.skills.length > 0 ? input.skills : [jobTitle],
      selectedJobs: input.selectedJobs && input.selectedJobs.length > 0 ? input.selectedJobs : [jobTitle],
      customProfession: input.customProfession || jobTitle,
      selectedJobId: input.selectedJobId || '',
      selectedJobTitle: jobTitle,
      seekerPaidAmount: input.seekerPaidAmount || '۰',
      seekerPaymentCurrency: input.seekerPaymentCurrency || 'IRT',
      seekerPaymentStatus: input.seekerPaymentStatus || 'paid',
      verificationStatus: 'pending',
      isPaymentVerified: input.seekerPaymentStatus === 'paid',
      registeredByRole: 'partner',
      registeredByPartnerId: activePartnerObj.id,
      registeredByPartnerName: activePartnerObj.companyName || activePartnerObj.fullName,
      registeredByPartnerCode: activePartnerObj.partnerCode,
      isTemporaryRegistration: input.isTemporaryRegistration,
      partnerInternalNote: input.partnerInternalNote,
      createdAt: new Date().toISOString(),
    };

    setJobSeekers((prev) => [newSeeker, ...prev]);
    syncUserToFirestore(newSeeker);

    addAdminNotification({
      type: 'seeker_registered',
      title: '👤 ثبت کارجو توسط همکار',
      message: `کارجو «${newSeeker.fullName}» | شغل انتخابی: «${jobTitle}» | مبلغ پرداختی: ${newSeeker.seekerPaidAmount || 'ثبت نشده'} توسط همکار ${activePartnerObj.companyName} ثبت شد.`,
      data: { seekerId: newSeeker.id },
    });

    showToast(`کارجو «${newSeeker.fullName}» با موفقیت ثبت گردید.`, 'success');

    return { success: true, seekerId: newSeeker.id };
  };

  const updateSeekerRecord = (seekerId: string, updates: Partial<JobSeeker>) => {
    setJobSeekers((prev) => {
      const next = prev.map((s) => {
        if (s.id === seekerId) {
          const updated = { ...s, ...updates };
          syncUserToFirestore(updated);
          return updated;
        }
        return s;
      });
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast('مشخصات کارجو با موفقیت ویرایش و ذخیره شد.', 'success');
  };

  const deleteSeekerRecord = (seekerId: string) => {
    setJobSeekers((prev) => {
      const next = prev.filter((s) => s.id !== seekerId);
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
        idbCache.saveSeekers(next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_seeker', id: seekerId }),
    }).catch(() => {});
    if (db) {
      deleteDoc(doc(db, 'users', seekerId)).catch(() => {});
    }
    if (currentSeekerId === seekerId) {
      setCurrentSeekerId(null);
    }
    showToast('پرونده کارجو حذف گردید.', 'info');
  };

  const clearAllSeekers = () => {
    const ids = jobSeekers.map((s) => s.id);
    setJobSeekers([]);
    try {
      safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify([]));
      idbCache.saveSeekers([]);
    } catch (e) {
      console.error(e);
    }
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_seekers' }),
    }).catch(() => {});
    if (db) {
      ids.forEach((id) => {
        deleteDoc(doc(db, 'users', id)).catch(() => {});
      });
    }
    showToast('لیست کارجویان به طور کامل پاکسازی شد.', 'info');
  };

  const switchToDemoPartner = () => {
    setCurrentPartnerId('partner-1');
    setRole('partner');
    setActiveTab('partner');
    showToast('ورود به پنل همکار انجام شد.', 'info');
  };

  const activatePartnerInstantly = (partnerId: string) => {
    approvePartnerSubscription(partnerId, 'فعال‌سازی توسط سامانه');
    showToast('حساب همکار فعال شد!', 'success');
  };

  // Quick Admin Modals State (Triggered from Header > امکانات)
  const [adminJobModalOpen, setAdminJobModalOpen] = useState(false);
  const [adminHotelModalOpen, setAdminHotelModalOpen] = useState(false);
  const [adminAddressModalOpen, setAdminAddressModalOpen] = useState(false);

  // Live Chat with Admin State
  const [chatSessions, setChatSessions] = useState<LiveChatSession[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      return safeStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (activeChatId) {
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, activeChatId);
    } else {
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    }
  }, [activeChatId]);

  const syncChatToFirestore = async (chat: LiveChatSession) => {
    try {
      await setDoc(doc(db, 'chats', chat.id), chat);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chat.id}`);
    }
  };

  const activeSeekerChat =
    chatSessions.find((c) => c.id === activeChatId) ||
    (currentSeeker
      ? chatSessions.find(
          (c) =>
            (c.seekerId === currentSeeker.id || c.nationalId === currentSeeker.nationalId) &&
            c.status !== 'closed' &&
            c.status !== 'rejected'
        ) || null
      : null);

  const requestLiveChat = (input: {
    firstName: string;
    lastName: string;
    phone: string;
    nationalId: string;
  }): { success: boolean; error?: string; chat?: LiveChatSession } => {
    const cleanFirst = input.firstName.trim() || currentSeeker?.fullName?.split(' ')[0] || 'کارجو';
    const cleanLast = input.lastName.trim() || currentSeeker?.fullName?.split(' ').slice(1).join(' ') || 'عزیز';
    const cleanPhone = input.phone.trim() || currentSeeker?.phone || '۰۹۱۲۰۰۰۰۰۰۰';
    const cleanNatId = input.nationalId.replace(/\D/g, '') || currentSeeker?.nationalId || '۰۰۰۰۰۰۰۰۰۰';

    const fullName = currentSeeker?.fullName || `${cleanFirst} ${cleanLast}`.trim();
    const now = new Date().toISOString();

    const newSession: LiveChatSession = {
      id: 'chat-' + Date.now(),
      seekerId: currentSeeker?.id,
      firstName: cleanFirst,
      lastName: cleanLast,
      fullName,
      phone: cleanPhone,
      nationalId: cleanNatId,
      status: 'pending',
      isConsultationPaid: true,
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'seeker',
          senderName: fullName,
          text: `حق مشاوره (۷۵۰,۰۰۰ تومان) واریز شد. درخواست گفتگوی آنلاین توسط «${fullName}» ثبت گردید.`,
          createdAt: now,
        },
      ],
      unreadByAdmin: 1,
      unreadBySeeker: 0,
      createdAt: now,
      updatedAt: now,
    };

    setChatSessions((prev) => [newSession, ...prev]);
    setActiveChatId(newSession.id);
    syncChatToFirestore(newSession);

    // Play ding sound & trigger system notification
    playNotificationDingSound();
    showSafeNotification(`💬 درخواست چت آنلاین جدید: ${fullName}`, {
      body: `کارجو «${fullName}» (تلفن: ${cleanPhone}) درخواست گفتگو ثبت کرد.`,
      tag: `new-chat-${newSession.id}`,
    });

    addAdminNotification({
      type: 'seeker_registered',
      title: '💬 درخواست جدید چت آنلاین با مدیر',
      message: `کارجو «${fullName}» با کد ملی ${cleanNatId} و شماره تلفن ${cleanPhone} درخواست چت آنلاین با مدیر را ثبت کرده و منتظر تایید شماست.`,
      data: { chatId: newSession.id },
    });

    showToast('درخواست چت آنلاین شما ثبت شد. لطفاً منتظر تایید مدیر بمانید.', 'success');
    return { success: true, chat: newSession };
  };

  const approveLiveChat = (chatId: string) => {
    const now = new Date().toISOString();
    playNotificationDingSound();
    setChatSessions((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const welcomeMsg: LiveChatMessage = {
            id: 'msg-admin-' + Date.now(),
            sender: 'admin',
            senderName: 'مدیریت کارباما',
            text: `سلام ${c.fullName} عزیز، درخواست گفتگوی آنلاین شما تایید شد. پیام یا سوال خود را بفرمایید.`,
            createdAt: now,
          };
          const updated: LiveChatSession = {
            ...c,
            status: 'approved',
            messages: [...c.messages, welcomeMsg],
            unreadByAdmin: 0,
            unreadBySeeker: c.unreadBySeeker + 1,
            updatedAt: now,
          };
          syncChatToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('درخواست چت کارجو تایید شد و گفتگو فعال گردید.', 'success');
  };

  const rejectLiveChat = (chatId: string) => {
    const now = new Date().toISOString();
    setChatSessions((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updated: LiveChatSession = {
            ...c,
            status: 'rejected',
            unreadByAdmin: 0,
            updatedAt: now,
          };
          syncChatToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('درخواست چت بسته شد.', 'info');
  };

  const sendLiveChatMessage = (chatId: string, sender: 'seeker' | 'admin', text: string) => {
    if (!text.trim()) return;
    const now = new Date().toISOString();

    // Play chime sound effect for incoming message or outgoing message
    playNotificationDingSound();

    setChatSessions((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const newMsg: LiveChatMessage = {
            id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
            sender,
            senderName: sender === 'admin' ? 'مدیریت کارباما' : c.fullName,
            text: text.trim(),
            createdAt: now,
          };
          const updated: LiveChatSession = {
            ...c,
            messages: [...c.messages, newMsg],
            unreadByAdmin: sender === 'seeker' ? c.unreadByAdmin + 1 : 0,
            unreadBySeeker: sender === 'admin' ? c.unreadBySeeker + 1 : 0,
            updatedAt: now,
          };

          // Trigger browser notification for admin if sent by seeker
          if (sender === 'seeker') {
            showSafeNotification(`💬 پیام جدید از ${c.fullName}`, {
              body: text.trim(),
              tag: `chat-msg-${c.id}`,
            });
          }

          syncChatToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const markChatRead = (chatId: string, viewer: 'seeker' | 'admin') => {
    setChatSessions((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          if (viewer === 'admin' && c.unreadByAdmin === 0) return c;
          if (viewer === 'seeker' && c.unreadBySeeker === 0) return c;
          const updated: LiveChatSession = {
            ...c,
            unreadByAdmin: viewer === 'admin' ? 0 : c.unreadByAdmin,
            unreadBySeeker: viewer === 'seeker' ? 0 : c.unreadBySeeker,
          };
          return updated;
        }
        return c;
      })
    );
  };

  const resetSeekerChat = () => {
    setActiveChatId(null);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        currentSeeker,
        isAdminLoggedIn,
        jobSeekers,
        jobs,
        applications,
        addresses,
        hotels,
        hotelBookings,
        transitLines,
        transitHubs,
        savedJobIds,
        toggleSaveJob,
        isJobSaved,
        toasts,
        showToast,
        theme,
        toggleTheme,
        themeColor,
        customHexColor,
        setThemeColor,
        themeModalOpen,
        setThemeModalOpen,
        registerSeeker,
        checkDuplicateSeekerField,
        loginSeeker,
        loginAdmin,
        logoutSeeker,
        logoutAdmin,
        changePassword,
        recoverPassword,
        updateProfile,
        updateResume,
        applyForJob,
        updateApplicationStatus,
        addJob,
        updateJob,
        deleteJob,
        toggleJobStatus,
        addHotel,
        updateHotel,
        deleteHotel,
        bookHotel,
        updateBookingStatus,
        addTransitLine,
        deleteTransitLine,
        addAddress,
        updateAddress,
        deleteAddress,
        jobAlerts,
        favoriteJobCategories,
        toggleFavoriteCategory,
        isCategoryFavorite,
        saveJobAlert,
        deleteJobAlert,
        toggleJobAlert,
        jobNotifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        pushPermissionStatus,
        requestPushPermission,
        triggerTestJobAlert,
        openedJobIdFromAlert,
        setOpenedJobIdFromAlert,
        switchToDemoUser,
        switchToDemoAdmin,
        brokerSettings,
        updateBrokerSettings,
        adminCredentials,
        updateAdminCredentials,
        paymentSettings,
        updatePaymentSettings,
        submitJobWithPayment,
        approveJobPayment,
        rejectJobPayment,
        appLanguage,
        setAppLanguage: handleSetAppLanguage,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        adminNotifications,
        addAdminNotification,
        markAdminNotificationAsRead,
        clearAdminNotifications,
        unreadAdminNotifCount,
        approveSeekerAccount,
        rejectSeekerAccount,
        // Partner system exports
        currentPartner,
        partners,
        partnerPlans,
        isPartnerLoggedIn,
        loginPartner,
        registerPartner,
        adminCreatePartner,
        logoutPartner,
        submitPartnerSubscriptionPayment,
        approvePartnerSubscription,
        rejectPartnerSubscription,
        updatePartnerPlanPricing,
        updatePartnerPlans,
        registerSeekerByPartner,
        updateSeekerRecord,
        deleteSeekerRecord,
        clearAllSeekers,
        switchToDemoPartner,
        activatePartnerInstantly,
        adminJobModalOpen,
        setAdminJobModalOpen,
        adminHotelModalOpen,
        setAdminHotelModalOpen,
        adminAddressModalOpen,
        setAdminAddressModalOpen,
        chatSessions,
        activeSeekerChat,
        requestLiveChat,
        approveLiveChat,
        rejectLiveChat,
        sendLiveChatMessage,
        markChatRead,
        resetSeekerChat,
        purgeFirebaseDatabase,
        syncPartnerToFirestore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
