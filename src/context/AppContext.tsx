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
  recoverPassword: (
    emailOrUsername: string,
    targetRole?: 'seeker' | 'partner',
    newPassword?: string
  ) => {
    success: boolean;
    message?: string;
    error?: string;
    username?: string;
    password?: string;
    accountType?: 'seeker' | 'partner';
  };
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
  deleteNotification: (id: string) => void;
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
  deleteAdminNotification: (id: string) => void;
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

  // Live Real-Time FX Rates & Automatic TRY -> Rial / Toman Conversion
  liveRates: {
    tryRial: number;
    tryToman: number;
    usdRial: number;
    usdToman: number;
    eurRial: number;
    eurToman: number;
    usdTry: number;
    eurTry: number;
    lastUpdated: string;
    isRefreshing: boolean;
  };
  refreshLiveRates: (silent?: boolean) => Promise<void>;
  formatTryToIrr: (amountTry: number) => {
    tryText: string;
    toman: number;
    rial: number;
    tomanText: string;
    rialText: string;
    combinedText: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  feeTL: 500,
  exchangeRateToman: 5460, // معادل ریالی روز: ۲,۷۳۰,۰۰۰ تومان (۲۷,۳۰۰,۰۰۰ ریال)
  paymentAmountUnit: 'toman',
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
  sepTerminalId: '21696637',
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
  JOBS: 'karbama_jobs_v21_clean_final',
  APPLICATIONS: 'karbama_applications_v19_clean',
  ADDRESSES: 'karbama_addresses_v4',
  HOTELS: 'karbama_hotels_v21_clean_final',
  BOOKINGS: 'karbama_bookings_v3',
  TRANSIT: 'karbama_transit_v3',
  TRANSIT_HUBS: 'karbama_transit_hubs_v3',
  CURRENT_USER_ID: 'karbama_current_user_v20_clean_final',
  IS_ADMIN: 'karbama_is_admin_v3',
  SAVED_JOBS: 'karbama_saved_jobs_v4',
  JOB_ALERTS: 'karbama_job_alerts_v3',
  NOTIFICATIONS: 'karbama_notifications_v3',
  THEME: 'karbama_theme_v5',
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
        fetch('/api/users.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'upsert', type: 'broker_settings', record: merged }),
        }).catch(() => {});
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
        fetch('/api/users.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'upsert', type: 'payment_settings', record: next }),
        }).catch(() => {});
      } catch (e) {
        console.error('Failed to save payment settings', e);
      }
      return next;
    });
    showToast('تنظیمات پرداخت، نرخ روز ارز و حساب‌های بانکی با موفقیت ذخیره شد.', 'success');
  };

  // Live Real-Time Exchange Rate Feed (TRY/IRR, USD/TRY, EUR/TRY, USD/IRR, EUR/IRR)
  const [liveRates, setLiveRates] = useState<{
    tryRial: number;
    tryToman: number;
    usdRial: number;
    usdToman: number;
    eurRial: number;
    eurToman: number;
    usdTry: number;
    eurTry: number;
    lastUpdated: string;
    isRefreshing: boolean;
  }>(() => {
    const initialToman = paymentSettings.exchangeRateToman || 3410;
    const initialRial = initialToman * 10;
    return {
      tryRial: initialRial,
      tryToman: initialToman,
      usdRial: initialRial * 34.45,
      usdToman: initialToman * 34.45,
      eurRial: initialRial * 37.2,
      eurToman: initialToman * 37.2,
      usdTry: 34.45,
      eurTry: 37.2,
      lastUpdated: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRefreshing: false,
    };
  });

  const refreshLiveRates = async (silent = true) => {
    if (!silent) {
      setLiveRates((prev) => ({ ...prev, isRefreshing: true }));
    }

    const applyNewRates = (
      tryRialVal: number,
      usdRialVal: number,
      eurRialVal: number,
      usdTryVal: number,
      eurTryVal: number
    ) => {
      const cleanTryRial = Math.round(tryRialVal);
      const cleanTryToman = Math.round(cleanTryRial / 10);
      const cleanUsdRial = Math.round(usdRialVal);
      const cleanUsdToman = Math.round(cleanUsdRial / 10);
      const cleanEurRial = Math.round(eurRialVal);
      const cleanEurToman = Math.round(cleanEurRial / 10);
      const nowTime = new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const todayStr = new Date().toISOString().split('T')[0];

      setLiveRates({
        tryRial: cleanTryRial,
        tryToman: cleanTryToman,
        usdRial: cleanUsdRial,
        usdToman: cleanUsdToman,
        eurRial: cleanEurRial,
        eurToman: cleanEurToman,
        usdTry: Number(usdTryVal.toFixed(2)),
        eurTry: Number(eurTryVal.toFixed(2)),
        lastUpdated: nowTime,
        isRefreshing: false,
      });

      if (cleanTryToman > 1000) {
        setPaymentSettings((prev) => {
          if (prev.exchangeRateToman === cleanTryToman && prev.lastRateUpdateDate === todayStr) {
            return prev;
          }
          const next: PaymentGatewaySettings = {
            ...prev,
            exchangeRateToman: cleanTryToman,
            lastRateUpdateDate: todayStr,
            autoUpdateDaily: true,
          };
          try {
            safeStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });

        setPartnerPlans((prev) =>
          prev.map((pl) => ({
            ...pl,
            priceToman: Math.round((pl.priceTL || 1500) * cleanTryToman),
          }))
        );
      }
    };

    try {
      // 1. Try Server API (/api/fx-rates or /api/fx-rates.php)
      const endpoints = ['/api/fx-rates', '/api/fx-rates.php'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: 'no-store' });
          if (res.ok) {
            const text = await res.text();
            if (!text.trim().startsWith('<')) {
              const json = JSON.parse(text);
              if (json && json.success && json.data?.TRY) {
                const tryR = Number(json.data.TRY.rial) || (Number(json.data.TRY.toman) || 3410) * 10;
                const usdR = Number(json.data.USD?.rial) || tryR * 34.45;
                const eurR = Number(json.data.EUR?.rial) || tryR * 37.2;
                const uTry = tryR > 0 ? usdR / tryR : 34.45;
                const eTry = tryR > 0 ? eurR / tryR : 37.2;
                applyNewRates(tryR, usdR, eurR, uTry, eTry);
                if (!silent) showToast('نرخ لحظه‌ای لیر، دلار، یورو و ریال با موفقیت بروزرسانی شد', 'success');
                return;
              }
            }
          }
        } catch {
          // continue to next endpoint
        }
      }

      // 2. Direct Client-Side Live Fetch (Wallex USDT/TMN + Open ER-API USD/TRY/EUR)
      const [wallexRes, fxRes] = await Promise.all([
        fetch('https://api.wallex.ir/v1/markets').catch(() => null),
        fetch('https://open.er-api.com/v6/latest/USD').catch(() => null),
      ]);

      let usdTomanLive = 0;
      let tryPerUsd = 34.45;
      let eurPerUsd = 0.92;

      if (wallexRes && wallexRes.ok) {
        const wJson: any = await wallexRes.json();
        const symbols = wJson?.result?.symbols || {};
        const usdtTmn = symbols.USDTTMN || symbols.USDTIRT;
        const lastPrice = parseFloat(usdtTmn?.stats?.lastPrice || '0');
        if (lastPrice > 40000) {
          usdTomanLive = lastPrice;
        }
      }

      if (fxRes && fxRes.ok) {
        const fJson: any = await fxRes.json();
        if (fJson?.rates) {
          if (fJson.rates.TRY) tryPerUsd = Number(fJson.rates.TRY);
          if (fJson.rates.EUR) eurPerUsd = Number(fJson.rates.EUR);
        }
      }

      if (usdTomanLive > 40000) {
        const usdRialVal = Math.round(usdTomanLive * 10);
        const tryRialVal = Math.round(usdRialVal / tryPerUsd);
        const eurRialVal = Math.round(usdRialVal / eurPerUsd);
        const eurTryVal = tryPerUsd / eurPerUsd;
        applyNewRates(tryRialVal, usdRialVal, eurRialVal, tryPerUsd, eurTryVal);
        if (!silent) showToast('نرخ لحظه‌ای بازار ارز مستقیم بروزرسانی شد', 'success');
        return;
      }
    } catch {
      // fallback
    }

    setLiveRates((prev) => ({
      ...prev,
      lastUpdated: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRefreshing: false,
    }));
  };

  useEffect(() => {
    refreshLiveRates(true);
    const interval = setInterval(() => {
      refreshLiveRates(true);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTryToIrr = (amountTry: number) => {
    const cleanTry = Number(amountTry) || 0;
    const rateToman = liveRates.tryToman || paymentSettings.exchangeRateToman || 3410;
    const rateRial = liveRates.tryRial || rateToman * 10;
    const toman = Math.round(cleanTry * rateToman);
    const rial = Math.round(cleanTry * rateRial);
    const tryText = `${cleanTry.toLocaleString('fa-IR')} ₺`;
    const tomanText = `${toman.toLocaleString('fa-IR')} تومان`;
    const rialText = `${rial.toLocaleString('fa-IR')} ریال`;
    const combinedText = `${tomanText} (${rialText})`;
    return {
      tryText,
      toman,
      rial,
      tomanText,
      rialText,
      combinedText,
    };
  };
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

  // Admin Live Notifications State (with persistent read & deleted tracking)
  const [adminNotifications, setAdminNotifications] = useState<any[]>(() => {
    try {
      const deletedRaw = safeStorage.getItem('karbama_deleted_admin_notifs_v1');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      const readRaw = safeStorage.getItem('karbama_read_admin_notifs_v1');
      const readIds = new Set<string>(readRaw ? JSON.parse(readRaw) : []);
      const stored = safeStorage.getItem('karbama_admin_notifications_v4');
      const parsed: any[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((n) => n && n.id && !deletedIds.has(n.id) && !readIds.has(n.id) && !n.read);
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
    try {
      const readRaw = safeStorage.getItem('karbama_read_admin_notifs_v1');
      const readIds = new Set<string>(readRaw ? JSON.parse(readRaw) : []);
      readIds.add(id);
      safeStorage.setItem('karbama_read_admin_notifs_v1', JSON.stringify(Array.from(readIds)));
    } catch {
      // ignore
    }
    setAdminNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try {
        safeStorage.setItem('karbama_admin_notifications_v4', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const deleteAdminNotification = (id: string) => {
    try {
      const deletedRaw = safeStorage.getItem('karbama_deleted_admin_notifs_v1');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      deletedIds.add(id);
      safeStorage.setItem('karbama_deleted_admin_notifs_v1', JSON.stringify(Array.from(deletedIds)));
    } catch {
      // ignore
    }
    setAdminNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try {
        safeStorage.setItem('karbama_admin_notifications_v4', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const clearAdminNotifications = () => {
    try {
      const deletedRaw = safeStorage.getItem('karbama_deleted_admin_notifs_v1');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      adminNotifications.forEach((n) => {
        if (n?.id) deletedIds.add(n.id);
      });
      safeStorage.setItem('karbama_deleted_admin_notifs_v1', JSON.stringify(Array.from(deletedIds)));
    } catch {
      // ignore
    }
    setAdminNotifications([]);
    try {
      safeStorage.setItem('karbama_admin_notifications_v4', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('اعلان‌های مدیریت پاکسازی شدند.', 'info');
  };

  const unreadAdminNotifCount = adminNotifications.filter((n) => !n.read).length;

  const approveSeekerAccount = (seekerId: string, note?: string) => {
    const seeker = jobSeekers.find((s) => s.id === seekerId);
    const nowIso = new Date().toISOString();
    const approvalNote = note || seeker?.adminVerificationNote || 'تایید پرداخت و آزادسازی کامل حساب توسط مدیریت کارباما';
    setJobSeekers((prev) => {
      const next = prev.map((s) => {
        if (s.id === seekerId) {
          const updated: JobSeeker = {
            ...s,
            verificationStatus: 'approved' as const,
            paymentStatus: 'approved' as const,
            accountStatus: 'approved' as const,
            isPaymentVerified: true,
            seekerPaymentStatus: 'paid' as const,
            adminVerificationNote: approvalNote,
            ...({ updatedAt: nowIso } as any),
          };
          syncUserToFirestore(updated);
          return updated;
        }
        return s;
      });
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
        idbCache.saveSeekers(next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast('قفل حساب کارجو با موفقیت باز شد و دسترسی کامل فعال گردید.', 'success');

    const notifId = `notif-seeker-approve-${seekerId}-${Date.now()}`;
    const approvalNotif: JobNotification = {
      id: notifId,
      alertId: 'admin-payment-approval',
      jobId: `status-approve-${seekerId}`,
      jobTitle: '✅ پرداخت و حساب کاربری شما تأیید شد!',
      company: seeker ? `${seeker.fullName} (مدیریت کارباما)` : 'مدیریت کارباما',
      city: seeker?.targetCity || 'ترکیه',
      salaryText: 'دسترسی کامل فعال شد ✓',
      message: approvalNote,
      read: false,
      createdAt: nowIso,
      targetUserId: seekerId,
      targetRole: 'seeker',
      notificationType: 'payment_approved',
    };
    setJobNotifications((prev) => {
      const next = [approvalNotif, ...prev];
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });
    syncNotificationToFirestore(approvalNotif);

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
    const nowIso = new Date().toISOString();
    const cleanReason =
      reason && reason.trim()
        ? reason.trim()
        : 'پرداخت شما توسط مدیریت تایید نشد؛ لطفاً رسید معتبر ارسال کرده یا مجدداً از طریق درگاه آنلاین اقدام فرمایید.';
    setJobSeekers((prev) => {
      const next = prev.map((s) => {
        if (s.id === seekerId) {
          const updated: JobSeeker = {
            ...s,
            verificationStatus: 'rejected' as const,
            paymentStatus: 'rejected' as const,
            accountStatus: 'rejected' as const,
            seekerPaymentStatus: 'rejected' as const,
            isPaymentVerified: false,
            adminVerificationNote: cleanReason,
            ...({ updatedAt: nowIso } as any),
          };
          syncUserToFirestore(updated);
          return updated;
        }
        return s;
      });
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
        idbCache.saveSeekers(next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast('پرداخت کارجو رد شد و اطلاع‌رسانی به پنل کارجو ارسال گردید.', 'info');

    const notifId = `notif-seeker-reject-${seekerId}-${Date.now()}`;
    const rejectNotif: JobNotification = {
      id: notifId,
      alertId: 'admin-payment-rejection',
      jobId: `status-reject-${seekerId}`,
      jobTitle: '❌ رد پرداخت توسط مدیریت کارباما',
      company: seeker ? `${seeker.fullName} (مدیریت کارباما)` : 'مدیریت کارباما',
      city: seeker?.targetCity || 'ترکیه',
      salaryText: 'نیازمند بررسی و پرداخت مجدد',
      message: cleanReason,
      read: false,
      createdAt: nowIso,
      targetUserId: seekerId,
      targetRole: 'seeker',
      notificationType: 'payment_rejected',
    };
    setJobNotifications((prev) => {
      const next = [rejectNotif, ...prev];
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });
    syncNotificationToFirestore(rejectNotif);

    if (seeker) {
      showSafeNotification(`⚠️ عدم تایید پرداخت حساب کارجو`, {
        body: `کارجوی گرامی ${seeker.fullName}، علت عدم تایید: ${cleanReason}`,
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

  const isSampleOrSeedJob = (j?: Partial<JobVacancy> | null): boolean => {
    if (!j || !j.id) return true;
    const idLower = String(j.id).trim().toLowerCase();
    // Filter out hardcoded seed IDs (job-1 through job-25) and demo/test IDs
    if (/^job-([1-9]|1[0-9]|2[0-5])$/.test(idLower) || idLower === 'job-demo' || idLower === 'job-test') {
      return true;
    }
    const title = String(j.title || '').toLowerCase();
    const company = String(j.company || '').toLowerCase();
    if (
      title.includes('تست') ||
      title.includes('آزمایشی') ||
      company.includes('تست') ||
      company.includes('آزمایشی')
    ) {
      return true;
    }
    return false;
  };

  const isSampleOrSeedHotel = (h?: Partial<Hotel> | null): boolean => {
    if (!h || !h.id) return true;
    const idLower = String(h.id).trim().toLowerCase();
    if (/^hotel-[1-4]$/.test(idLower) || idLower === 'hotel-demo' || idLower === 'hotel-test') {
      return true;
    }
    const name = String(h.name || '').toLowerCase();
    if (name.includes('تست') || name.includes('آزمایشی')) {
      return true;
    }
    return false;
  };

  // Persistent Tombstone Helpers (Prevent deleted jobs, seekers, hotels, or notifications from reappearing on F5)
  const getTombstoneSet = (storageKey: string): Set<string> => {
    try {
      const raw = safeStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set<string>(parsed.map(String));
      }
    } catch {
      // ignore
    }
    return new Set<string>();
  };

  const addTombstoneIds = (storageKey: string, ids: string[]) => {
    try {
      const current = getTombstoneSet(storageKey);
      let changed = false;
      ids.forEach((id) => {
        const clean = String(id || '').trim();
        if (clean && !current.has(clean)) {
          current.add(clean);
          changed = true;
        }
      });
      if (changed) {
        safeStorage.setItem(storageKey, JSON.stringify(Array.from(current)));
      }
    } catch {
      // ignore
    }
  };

  const removeTombstoneId = (storageKey: string, id: string) => {
    try {
      const current = getTombstoneSet(storageKey);
      const clean = String(id || '').trim();
      if (clean && current.has(clean)) {
        current.delete(clean);
        safeStorage.setItem(storageKey, JSON.stringify(Array.from(current)));
      }
    } catch {
      // ignore
    }
  };

  const mergeRecordByTimestamp = <T extends Record<string, any>>(localRec: T | undefined, remoteRec: T): T => {
    if (!localRec) return remoteRec;
    const localTime = localRec.updatedAt ? new Date(localRec.updatedAt).getTime() : 0;
    const remoteTime = remoteRec.updatedAt ? new Date(remoteRec.updatedAt).getTime() : 0;
    if (localTime > remoteTime) {
      return { ...remoteRec, ...localRec };
    }
    return { ...localRec, ...remoteRec };
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

      const deletedSeekers = getTombstoneSet('karbama_deleted_seekers_v1');
      const stored = safeStorage.getItem(STORAGE_KEYS.SEEKERS);
      const parsed: JobSeeker[] = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed)
        ? parsed.filter((s) => !isSampleOrLegacySeeker(s) && !deletedSeekers.has(s.id))
        : [];
    } catch {
      return [];
    }
  });

  const [jobs, setJobs] = useState<JobVacancy[]>(() => {
    try {
      safeStorage.removeItem('karbama_jobs');
      safeStorage.removeItem('karbama_jobs_v2');
      safeStorage.removeItem('karbama_jobs_v3');
      safeStorage.removeItem('karbama_jobs_v4');
      const deletedJobs = getTombstoneSet('karbama_deleted_jobs_v1');
      const stored = safeStorage.getItem(STORAGE_KEYS.JOBS);
      const parsed: JobVacancy[] = stored ? JSON.parse(stored) : INITIAL_JOBS;
      return Array.isArray(parsed)
        ? parsed.filter((j) => !isSampleOrSeedJob(j) && !deletedJobs.has(j.id))
        : [];
    } catch {
      return [];
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
      safeStorage.removeItem('karbama_hotels');
      safeStorage.removeItem('karbama_hotels_v2');
      safeStorage.removeItem('karbama_hotels_v3');
      const deletedHotels = getTombstoneSet('karbama_deleted_hotels_v1');
      const stored = safeStorage.getItem(STORAGE_KEYS.HOTELS);
      const parsed: Hotel[] = stored ? JSON.parse(stored) : INITIAL_HOTELS;
      const filtered = Array.isArray(parsed)
        ? parsed.filter((h) => !isSampleOrSeedHotel(h) && !deletedHotels.has(h.id))
        : [];
      if (filtered.length === 0) {
        return INITIAL_HOTELS.filter((h) => !deletedHotels.has(h.id));
      }
      return filtered;
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
    return 'light';
  });

  const [role, setRole] = useState<UserRole>(() => (isAdminLoggedIn ? 'admin' : 'jobseeker'));
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
      if (window.location.pathname === '/privacy-policy') {
        return 'privacy-policy';
      }
    }
    return 'jobs';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setActiveTab('admin');
      } else if (window.location.pathname === '/privacy-policy') {
        setActiveTab('privacy-policy');
      } else {
        setActiveTab((prev) => (prev === 'admin' || prev === 'privacy-policy' ? 'jobs' : prev));
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
    const rate = liveRates?.tryToman || paymentSettings?.exchangeRateToman || 3410;
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PARTNER_PLANS);
      const parsed: PartnerSubscriptionPlan[] = stored ? JSON.parse(stored) : DEFAULT_PARTNER_PLANS;
      return parsed.map((pl) => ({
        ...pl,
        priceToman: Math.round((pl.priceTL || 1500) * rate),
      }));
    } catch {
      return DEFAULT_PARTNER_PLANS.map((pl) => ({
        ...pl,
        priceToman: Math.round((pl.priceTL || 1500) * rate),
      }));
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
      const deletedRaw = safeStorage.getItem('karbama_deleted_notifications_v1');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      const readRaw = safeStorage.getItem('karbama_read_notifications_v1');
      const readIds = new Set<string>(readRaw ? JSON.parse(readRaw) : []);
      const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const parsed: JobNotification[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return [];
      const seenJobIds = new Set<string>();
      return parsed.filter((n) => {
        if (!n || !n.id) return false;
        if (deletedIds.has(n.id) || readIds.has(n.id) || n.read) return false;
        if (n.id === 'notif-welcome' || String(n.message || '').includes('تست')) return false;
        const jKey = n.jobId || n.id;
        if (readIds.has(`job-${jKey}`) || seenJobIds.has(jKey)) return false;
        seenJobIds.add(jKey);
        return true;
      });
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

    const lightRgba = hexToRgba(primaryHex, 0.14);
    const borderRgba = hexToRgba(primaryHex, 0.35);
    const glowRgba = hexToRgba(primaryHex, 0.25);
    const bannerGrad =
      theme === 'light'
        ? `linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 55%, #ECFDF5 100%)`
        : `linear-gradient(135deg, ${hexToRgba(primaryHex, 0.32)} 0%, rgba(15, 23, 42, 0.96) 55%, rgba(2, 6, 23, 1) 100%)`;
    const topBarGrad =
      theme === 'light'
        ? `linear-gradient(to right, #1E3A8A, #2563EB, #10B981)`
        : `linear-gradient(to right, rgba(15, 23, 42, 0.98), ${hexToRgba(primaryHex, 0.35)}, rgba(15, 23, 42, 0.98))`;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', theme === 'light' && themeColor === 'red' ? '#2563EB' : primaryHex);
      root.style.setProperty('--primary-hover', theme === 'light' && themeColor === 'red' ? '#1E3A8A' : hoverHex);
      root.style.setProperty('--primary-light', lightRgba);
      root.style.setProperty('--primary-border', borderRgba);
      root.style.setProperty('--primary-glow', glowRgba);
      root.style.setProperty('--primary-banner', bannerGrad);
      root.style.setProperty('--primary-topbar', topBarGrad);
    }
  }, [themeColor, customHexColor, theme]);

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

  // Find active partner (Strictly hidden/disabled when a Job Seeker account is logged in)
  const currentPartner =
    !currentSeeker || isAdminLoggedIn
      ? partners.find((p) => p.id === currentPartnerId) || null
      : null;
  const isPartnerLoggedIn = Boolean(currentPartner);

  // Enforce role isolation: if a Job Seeker is logged in, never allow activeTab === 'partner' or residual partner session
  useEffect(() => {
    if (currentSeeker && !isAdminLoggedIn) {
      if (currentPartnerId) {
        setCurrentPartnerId(null);
        safeStorage.removeItem(STORAGE_KEYS.CURRENT_PARTNER_ID);
      }
      if (activeTab === 'partner') {
        setActiveTab('jobs');
      }
    }
  }, [currentSeeker, isAdminLoggedIn, currentPartnerId, activeTab]);

  // Persist state updates securely to safeStorage & IndexedDB (for offline SW access)
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(jobSeekers));
    if (jobSeekers && jobSeekers.length > 0) {
      idbCache.saveSeekers(jobSeekers);
    }
  }, [jobSeekers]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    idbCache.saveJobs(jobs);
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
    idbCache.saveHotels(hotels);
  }, [hotels]);

  // Initial IndexedDB & Server API hydration fallback when offline or on first load
  useEffect(() => {
    const hydrateFromIndexedDBAndServer = async () => {
      try {
        const deletedSeekers = getTombstoneSet('karbama_deleted_seekers_v1');
        const cachedSeekers = await idbCache.getSeekers();
        if (cachedSeekers && cachedSeekers.length > 0) {
          setJobSeekers((prev) => {
            const map = new Map<string, JobSeeker>();
            cachedSeekers
              .filter((s) => !isSampleOrLegacySeeker(s) && !deletedSeekers.has(s.id))
              .forEach((s) => map.set(s.id, s));
            prev
              .filter((s) => !isSampleOrLegacySeeker(s) && !deletedSeekers.has(s.id))
              .forEach((s) => {
                const old = map.get(s.id);
                map.set(s.id, mergeRecordByTimestamp(s, old || s));
              });
            return Array.from(map.values());
          });
        }

        const deletedJobs = getTombstoneSet('karbama_deleted_jobs_v1');
        const cachedJobs = await idbCache.getJobs();
        if (cachedJobs && cachedJobs.length > 0) {
          const cleanCachedJobs = cachedJobs.filter((j) => !isSampleOrSeedJob(j) && !deletedJobs.has(j.id));
          if (cleanCachedJobs.length !== cachedJobs.length) {
            idbCache.saveJobs(cleanCachedJobs);
          }
          if (cleanCachedJobs.length > 0) {
            setJobs((prev) => {
              const cleanPrev = (prev || []).filter((j) => !isSampleOrSeedJob(j) && !deletedJobs.has(j.id));
              if (cleanPrev.length === 0) return cleanCachedJobs;
              const map = new Map<string, JobVacancy>();
              cleanCachedJobs.forEach((j) => map.set(j.id, j));
              cleanPrev.forEach((j) => {
                const existing = map.get(j.id);
                map.set(j.id, mergeRecordByTimestamp(j, existing || j));
              });
              return Array.from(map.values());
            });
          }
        }

        const cachedAddrs = await idbCache.getAddresses();
        if (cachedAddrs && cachedAddrs.length > 0) {
          setAddresses((prev) => {
            if (!prev || prev.length === 0) return cachedAddrs;
            return prev;
          });
        }

        const deletedHotels = getTombstoneSet('karbama_deleted_hotels_v1');
        const cachedHotels = await idbCache.getHotels();
        if (cachedHotels && cachedHotels.length > 0) {
          const cleanCachedHotels = cachedHotels.filter((h) => !isSampleOrSeedHotel(h) && !deletedHotels.has(h.id));
          if (cleanCachedHotels.length !== cachedHotels.length) {
            idbCache.saveHotels(cleanCachedHotels);
          }
          if (cleanCachedHotels.length > 0) {
            setHotels((prev) => {
              const cleanPrev = (prev || []).filter((h) => !isSampleOrSeedHotel(h) && !deletedHotels.has(h.id));
              if (cleanPrev.length === 0) return cleanCachedHotels;
              return cleanPrev;
            });
          }
        }
      } catch (err) {
        console.warn('[IDB Hydrate] Failed:', err);
      }

      // Full two-way sync of all entities & tombstones with server (/api/users.php)
      const syncWithServer = async (isInitialSync = false) => {
        try {
          const res = await fetch(`/api/users.php?t=${Date.now()}`, { cache: 'no-store' });
          if (!res.ok) return;
          const data = await res.json();
          if (!data || typeof data !== 'object') return;

          // 1. Reconcile tombstone sets from server
          if (Array.isArray(data.deletedJobIds) && data.deletedJobIds.length > 0) {
            addTombstoneIds('karbama_deleted_jobs_v1', data.deletedJobIds);
          }
          if (Array.isArray(data.deletedSeekerIds) && data.deletedSeekerIds.length > 0) {
            addTombstoneIds('karbama_deleted_seekers_v1', data.deletedSeekerIds);
          }
          if (Array.isArray(data.deletedHotelIds) && data.deletedHotelIds.length > 0) {
            addTombstoneIds('karbama_deleted_hotels_v1', data.deletedHotelIds);
          }
          if (Array.isArray(data.deletedNotificationIds) && data.deletedNotificationIds.length > 0) {
            addTombstoneIds('karbama_deleted_notifications_v1', data.deletedNotificationIds);
          }
          if (Array.isArray(data.readNotificationIds) && data.readNotificationIds.length > 0) {
            addTombstoneIds('karbama_read_notifications_v1', data.readNotificationIds);
          }

          const deletedSeekers = getTombstoneSet('karbama_deleted_seekers_v1');
          const deletedJobs = getTombstoneSet('karbama_deleted_jobs_v1');
          const deletedHotels = getTombstoneSet('karbama_deleted_hotels_v1');
          const deletedNotifs = getTombstoneSet('karbama_deleted_notifications_v1');
          const readNotifs = getTombstoneSet('karbama_read_notifications_v1');

          // 2. Sync Seekers
          const serverSeekers: JobSeeker[] = Array.isArray(data.seekers) ? data.seekers : [];
          const serverSeekerIds = new Set(serverSeekers.map((s) => s.id));
          setJobSeekers((prev) => {
            const map = new Map<string, JobSeeker>();
            serverSeekers
              .filter((s) => !isSampleOrLegacySeeker(s) && !deletedSeekers.has(s.id))
              .forEach((s) => map.set(s.id, s));
            prev
              .filter((s) => !isSampleOrLegacySeeker(s) && !deletedSeekers.has(s.id))
              .forEach((s) => {
                const existing = map.get(s.id);
                const mergedRec = mergeRecordByTimestamp(s, existing || s);
                map.set(s.id, mergedRec);
                if (isInitialSync && !serverSeekerIds.has(s.id)) {
                  syncUserToFirestore(mergedRec);
                }
              });
            const merged = Array.from(map.values());
            safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(merged));
            idbCache.saveSeekers(merged);
            return merged;
          });

          // 3. Sync Partners
          const serverPartners: PartnerAccount[] = Array.isArray(data.partners) ? data.partners : [];
          const serverPartnerIds = new Set(serverPartners.map((p) => p.id));
          if (serverPartners.length > 0 || isInitialSync) {
            setPartners((prev) => {
              const map = new Map<string, PartnerAccount>();
              serverPartners.forEach((p: PartnerAccount) => {
                if (p && p.id) map.set(p.id, p);
              });
              prev.forEach((p) => {
                const existing = map.get(p.id);
                const mergedRec = mergeRecordByTimestamp(p, existing || p);
                map.set(p.id, mergedRec);
                if (isInitialSync && !serverPartnerIds.has(p.id)) {
                  syncPartnerToFirestore(mergedRec);
                }
              });
              const merged = Array.from(map.values());
              safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(merged));
              return merged;
            });
          }

          // 4. Sync Jobs
          const serverJobs: JobVacancy[] = Array.isArray(data.jobs) ? data.jobs : [];
          const serverJobIds = new Set(serverJobs.map((j) => j.id));
          setJobs((prev) => {
            const map = new Map<string, JobVacancy>();
            serverJobs
              .filter((j) => !isSampleOrSeedJob(j) && !deletedJobs.has(j.id))
              .forEach((j) => map.set(j.id, j));
            prev
              .filter((j) => !isSampleOrSeedJob(j) && !deletedJobs.has(j.id))
              .forEach((j) => {
                const existing = map.get(j.id);
                const mergedRec = mergeRecordByTimestamp(j, existing || j);
                map.set(j.id, mergedRec);
                if (isInitialSync && !serverJobIds.has(j.id)) {
                  syncJobToFirestore(mergedRec);
                }
              });
            const merged = Array.from(map.values());
            safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(merged));
            idbCache.saveJobs(merged);
            return merged;
          });

          // 5. Sync Hotels
          const serverHotels: Hotel[] = Array.isArray(data.hotels) ? data.hotels : [];
          if (serverHotels.length > 0 || deletedHotels.size > 0) {
            setHotels((prev) => {
              const map = new Map<string, Hotel>();
              serverHotels
                .filter((h) => !isSampleOrSeedHotel(h) && !deletedHotels.has(h.id))
                .forEach((h) => map.set(h.id, h));
              prev
                .filter((h) => !isSampleOrSeedHotel(h) && !deletedHotels.has(h.id))
                .forEach((h) => {
                  const existing = map.get(h.id);
                  map.set(h.id, mergeRecordByTimestamp(h, existing || h));
                });
              const merged = Array.from(map.values());
              safeStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(merged));
              idbCache.saveHotels(merged);
              return merged;
            });
          }

          // 6. Sync Applications
          if (Array.isArray(data.applications) && data.applications.length > 0) {
            setApplications((prev) => {
              const map = new Map<string, JobApplication>();
              data.applications.forEach((app: JobApplication) => {
                if (app && app.id) map.set(app.id, app);
              });
              prev.forEach((app) => {
                const existing = map.get(app.id);
                map.set(app.id, mergeRecordByTimestamp(app, existing || app));
              });
              const merged = Array.from(map.values());
              safeStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(merged));
              return merged;
            });
          }

          // 7. Sync Notifications (strictly filtering out read & deleted notifications)
          if (Array.isArray(data.notifications) || deletedNotifs.size > 0 || readNotifs.size > 0) {
            const serverNotifs: JobNotification[] = Array.isArray(data.notifications) ? data.notifications : [];
            setJobNotifications((prev) => {
              const map = new Map<string, JobNotification>();
              const seenJobIds = new Set<string>();
              const combined = [...prev, ...serverNotifs];
              combined.forEach((n) => {
                if (!n || !n.id) return;
                const jKey = n.jobId || n.id;
                if (
                  n.read ||
                  deletedNotifs.has(n.id) ||
                  readNotifs.has(n.id) ||
                  deletedNotifs.has(`job-${jKey}`) ||
                  readNotifs.has(`job-${jKey}`) ||
                  deletedJobs.has(jKey) ||
                  seenJobIds.has(jKey)
                ) {
                  return;
                }
                seenJobIds.add(jKey);
                map.set(n.id, n);
              });
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(merged));
              return merged;
            });
          }

          // 7.5. Sync Live Chat Sessions
          if (Array.isArray(data.chats) && data.chats.length > 0) {
            setChatSessions((prev) => {
              const map = new Map<string, LiveChatSession>();
              data.chats.forEach((c: LiveChatSession) => {
                if (c && c.id) map.set(c.id, c);
              });
              prev.forEach((c) => {
                const existing = map.get(c.id);
                if (!existing) {
                  map.set(c.id, c);
                } else {
                  const localMsgs = Array.isArray(c.messages) ? c.messages.length : 0;
                  const serverMsgs = Array.isArray(existing.messages) ? existing.messages.length : 0;
                  if (localMsgs > serverMsgs) {
                    map.set(c.id, c);
                  } else if (serverMsgs > localMsgs) {
                    map.set(c.id, existing);
                  } else {
                    map.set(c.id, mergeRecordByTimestamp(c, existing));
                  }
                }
              });
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );
              safeStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(merged));
              return merged;
            });
          }

          // 8. Sync Payment Settings, Partner Plans & Broker Settings if present on server
          if (data.paymentSettings && typeof data.paymentSettings === 'object') {
            setPaymentSettings((prev) => {
              const merged = { ...prev, ...data.paymentSettings };
              safeStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(merged));
              return merged;
            });
          }
          if (Array.isArray(data.partnerPlans) && data.partnerPlans.length > 0) {
            setPartnerPlans(data.partnerPlans);
            safeStorage.setItem(STORAGE_KEYS.PARTNER_PLANS, JSON.stringify(data.partnerPlans));
          }
          if (data.brokerSettings && typeof data.brokerSettings === 'object') {
            setBrokerSettings((prev) => {
              const merged = { ...prev, ...data.brokerSettings };
              safeStorage.setItem(STORAGE_KEYS.BROKER_SETTINGS, JSON.stringify(merged));
              return merged;
            });
          }
        } catch {
          // Ignore network error when offline
        }
      };

      await syncWithServer(true);

      const interval = setInterval(() => {
        syncWithServer(false);
      }, 4000);

      const handleFocusOrStorage = () => {
        syncWithServer(false);
      };
      window.addEventListener('focus', handleFocusOrStorage);
      window.addEventListener('storage', handleFocusOrStorage);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocusOrStorage);
        window.removeEventListener('storage', handleFocusOrStorage);
      };
    };

    let cleanupInterval: (() => void) | undefined;
    hydrateFromIndexedDBAndServer().then((cleanup) => {
      cleanupInterval = cleanup;
    });

    return () => {
      if (cleanupInterval) cleanupInterval();
    };
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

    // Listen to users collection (respecting deletedSeekers tombstones and updatedAt timestamps)
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const deletedSeekers = getTombstoneSet('karbama_deleted_seekers_v1');
        const firestoreUsers: JobSeeker[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as JobSeeker;
          if (isSampleOrLegacySeeker(data) || (data?.id && deletedSeekers.has(data.id))) {
            deleteDoc(doc(db, 'users', docSnap.id)).catch(() => {});
          } else if (data && data.id) {
            firestoreUsers.push(data);
          }
        });
        setJobSeekers((prev) => {
          const map = new Map<string, JobSeeker>();
          prev
            .filter((s) => !isSampleOrLegacySeeker(s) && !deletedSeekers.has(s.id))
            .forEach((s) => map.set(s.id, s));
          firestoreUsers.forEach((s) => {
            const existing = map.get(s.id);
            map.set(s.id, mergeRecordByTimestamp(existing, s));
          });
          const merged = Array.from(map.values());
          safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(merged));
          idbCache.saveSeekers(merged);
          return merged;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    // Listen to notifications collection (respecting deleted & read persistent sets)
    const unsubNotifs = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const deletedIds = getTombstoneSet('karbama_deleted_notifications_v1');
          const readIds = getTombstoneSet('karbama_read_notifications_v1');
          const deletedJobs = getTombstoneSet('karbama_deleted_jobs_v1');

          const firestoreNotifs: JobNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as JobNotification;
            const jKey = data?.jobId || data?.id || '';
            if (
              data &&
              data.id &&
              !deletedIds.has(data.id) &&
              !readIds.has(data.id) &&
              !deletedIds.has(`job-${jKey}`) &&
              !readIds.has(`job-${jKey}`) &&
              !deletedJobs.has(jKey) &&
              !data.read
            ) {
              firestoreNotifs.push(data);
            }
          });

          setJobNotifications((prev) => {
            const map = new Map<string, JobNotification>();
            const seenJobIds = new Set<string>();
            prev.forEach((n) => {
              const jKey = n.jobId || n.id;
              if (
                !deletedIds.has(n.id) &&
                !readIds.has(n.id) &&
                !deletedIds.has(`job-${jKey}`) &&
                !readIds.has(`job-${jKey}`) &&
                !deletedJobs.has(jKey) &&
                !n.read &&
                !seenJobIds.has(jKey)
              ) {
                seenJobIds.add(jKey);
                map.set(n.id, n);
              }
            });
            firestoreNotifs.forEach((n) => {
              const jKey = n.jobId || n.id;
              if (
                deletedIds.has(n.id) ||
                readIds.has(n.id) ||
                deletedIds.has(`job-${jKey}`) ||
                readIds.has(`job-${jKey}`) ||
                deletedJobs.has(jKey) ||
                n.read ||
                seenJobIds.has(jKey)
              ) {
                return;
              }
              seenJobIds.add(jKey);
              map.set(n.id, { ...n, read: false });
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            try {
              safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'notifications');
      }
    );

    // Listen to jobs collection (automatically purging sample/seed jobs & deleted jobs)
    const unsubJobs = onSnapshot(
      collection(db, 'jobs'),
      (snapshot) => {
        const deletedJobs = getTombstoneSet('karbama_deleted_jobs_v1');
        const firestoreJobs: JobVacancy[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as JobVacancy;
          if (isSampleOrSeedJob(data) || (data?.id && deletedJobs.has(data.id))) {
            deleteDoc(doc(db, 'jobs', docSnap.id)).catch(() => {});
          } else if (data && data.id) {
            firestoreJobs.push(data);
          }
        });

        setJobs((prev) => {
          const map = new Map<string, JobVacancy>();
          prev
            .filter((j) => !isSampleOrSeedJob(j) && !deletedJobs.has(j.id))
            .forEach((j) => map.set(j.id, j));
          firestoreJobs.forEach((j) => {
            const existing = map.get(j.id);
            map.set(j.id, mergeRecordByTimestamp(existing, j));
          });
          const merged = Array.from(map.values());
          safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(merged));
          idbCache.saveJobs(merged);
          return merged;
        });
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
              firestorePartners.forEach((p) => {
                const existing = map.get(p.id);
                map.set(p.id, mergeRecordByTimestamp(existing, p));
              });
              const merged = Array.from(map.values());
              safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(merged));
              return merged;
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
    const nowIso = new Date().toISOString();
    const userWithTimestamp = { ...user, updatedAt: (user as any).updatedAt || nowIso };
    removeTombstoneId('karbama_deleted_seekers_v1', user.id);

    // 1. Always sync to backend server (/api/users.php) for PHP/Node & cross-device reliability
    try {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          type: 'seeker',
          record: userWithTimestamp,
          seeker: userWithTimestamp,
        }),
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

      Object.entries(userWithTimestamp).forEach(([k, v]) => {
        if (v !== undefined && !imageKeys.includes(k)) {
          sanitized[k] = v;
          totalEstimatedBytes += typeof v === 'string' ? v.length : 64;
        }
      });

      for (const imgKey of imageKeys) {
        const val = (userWithTimestamp as any)[imgKey];
        if (typeof val === 'string' && val.length > 0) {
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
        updatedAt: nowIso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
    }
  };

  const syncPartnerToFirestore = async (partner: PartnerAccount) => {
    const nowIso = new Date().toISOString();
    const partnerWithTimestamp = { ...partner, updatedAt: (partner as any).updatedAt || nowIso };
    try {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          type: 'partner',
          record: partnerWithTimestamp,
          partner: partnerWithTimestamp,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      if (!db) return;
      await setDoc(doc(db, 'partners', partner.id), {
        ...partnerWithTimestamp,
        updatedAt: nowIso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `partners/${partner.id}`);
    }
  };

  const syncNotificationToFirestore = async (notif: JobNotification | any) => {
    const notifWithDate = {
      ...notif,
      createdAt: notif.createdAt || new Date().toISOString(),
    };
    try {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          type: 'notification',
          record: notifWithDate,
          notification: notifWithDate,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
    try {
      if (!db) return;
      await setDoc(doc(db, 'notifications', notif.id), notifWithDate);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
    }
  };

  const syncJobToFirestore = async (job: JobVacancy) => {
    const nowIso = new Date().toISOString();
    const jobWithTimestamp = { ...job, updatedAt: (job as any).updatedAt || nowIso };
    removeTombstoneId('karbama_deleted_jobs_v1', job.id);

    try {
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          type: 'job',
          record: jobWithTimestamp,
          job: jobWithTimestamp,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      if (!db) return;
      await setDoc(doc(db, 'jobs', job.id), {
        ...jobWithTimestamp,
        updatedAt: nowIso,
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

        // 3.5. Purge test/seed jobs from Firestore
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        for (const docSnap of jobsSnap.docs) {
          const data = docSnap.data() as JobVacancy;
          if (fullReset || isSampleOrSeedJob(data)) {
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
        setJobs([]);
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify([]));
        safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify([]));
        safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        setCurrentSeekerId(null);
      } else {
        setJobSeekers((prev) => prev.filter((s) => !isSampleOrLegacySeeker(s)));
        setJobs((prev) => prev.filter((j) => !isSampleOrSeedJob(j)));
        setHotels((prev) => prev.filter((h) => !isSampleOrSeedHotel(h)));
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
      safeStorage.removeItem(STORAGE_KEYS.CURRENT_PARTNER_ID);
      syncUserToFirestore(updatedSeeker);
      setCurrentPartnerId(null);
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
    safeStorage.removeItem(STORAGE_KEYS.CURRENT_PARTNER_ID);
    syncUserToFirestore(newSeeker);
    setCurrentPartnerId(null);
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
    safeStorage.removeItem(STORAGE_KEYS.CURRENT_PARTNER_ID);
    setCurrentPartnerId(null);
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
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setActiveTab('admin');
    } else {
      setActiveTab('jobs');
    }
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
    emailOrUsername: string,
    targetRole?: 'seeker' | 'partner',
    newPassword?: string
  ): {
    success: boolean;
    message?: string;
    error?: string;
    username?: string;
    password?: string;
    accountType?: 'seeker' | 'partner';
  } => {
    if (!emailOrUsername || !emailOrUsername.trim()) {
      return {
        success: false,
        error:
          targetRole === 'partner'
            ? 'لطفاً آدرس ایمیل، نام کاربری یا شماره موبایل ثبت‌شده همکار را وارد نمایید.'
            : 'لطفاً آدرس ایمیل، نام کاربری، شماره موبایل یا کد ملی ثبت‌شده کارجو را وارد نمایید.',
      };
    }

    const cleanInput = toEnglishDigits(emailOrUsername).trim().toLowerCase();
    const sanitizedInput = cleanInput.replace(/[^a-z0-9_.-]/g, '');
    const normPhone = normalizePhoneForComparison(cleanInput);
    const normNatId = normalizeNationalIdForComparison(cleanInput);

    // 1. Search Seekers (when targetRole is 'seeker' or unspecified)
    if (!targetRole || targetRole === 'seeker') {
      const seeker = jobSeekers.find((s) => {
        const sUser = toEnglishDigits(s.username || '').trim().toLowerCase();
        const sEmail = toEnglishDigits(s.email || '').trim().toLowerCase();
        const sPhone = normalizePhoneForComparison(s.phoneNumber || s.phone || '');
        const sNatId = normalizeNationalIdForComparison(s.nationalId || '');
        return (
          (sEmail && sEmail === cleanInput) ||
          sUser === cleanInput ||
          (sanitizedInput.length >= 3 && sUser.replace(/[^a-z0-9_.-]/g, '') === sanitizedInput) ||
          (normPhone.length >= 10 && sPhone === normPhone) ||
          (normNatId.length >= 6 && sNatId === normNatId)
        );
      });

      if (seeker) {
        const updatedPass =
          newPassword && newPassword.trim().length >= 6 ? newPassword.trim() : seeker.password;
        if (newPassword && newPassword.trim().length >= 6) {
          const nextSeekers = jobSeekers.map((s) =>
            s.id === seeker.id ? { ...s, password: updatedPass } : s
          );
          setJobSeekers(nextSeekers);
          try {
            safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(nextSeekers));
          } catch {
            // ignore
          }
          syncUserToFirestore({ ...seeker, password: updatedPass });
          showToast('رمز عبور جدید حساب کارجوی شما از طریق سرور ایمیل mail.karbama34.ir ثبت و فعال شد.', 'success');
        } else {
          showToast('اطلاعات ورود حساب کارجو از طریق سرور ایمیل mail.karbama34.ir بازیابی شد.', 'success');
        }
        try {
          fetch('https://mail.karbama34.ir/api/recover-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'seeker',
              email: seeker.email || cleanInput,
              username: seeker.username,
              fullName: seeker.fullName,
              mailServer: 'mail.karbama34.ir',
            }),
          }).catch(() => {});
        } catch {
          // ignore
        }
        return {
          success: true,
          username: seeker.username,
          password: updatedPass,
          accountType: 'seeker',
          message:
            newPassword && newPassword.trim().length >= 6
              ? `رمز عبور حساب کارجو (${seeker.fullName}) از طریق سرور ایمیل mail.karbama34.ir با موفقیت بازنشانی شد! نام کاربری: ${seeker.username} | رمز عبور جدید: ${updatedPass}`
              : `اطلاعات حساب کارجو (${seeker.fullName}) از طریق ایمیل رسمی (mail.karbama34.ir) تایید و بازیابی شد! نام کاربری: ${seeker.username} | رمز عبور: ${updatedPass}`,
        };
      }

      if (targetRole === 'seeker') {
        return {
          success: false,
          error: 'هیچ حساب کارجویی با این آدرس ایمیل، نام کاربری یا شماره موبایل در سامانه یافت نشد.',
        };
      }
    }

    // 2. Search Partners (when targetRole is 'partner' or unspecified)
    if (!targetRole || targetRole === 'partner') {
      const partner = partners.find((p) => {
        const pUser = toEnglishDigits(p.username || '').trim().toLowerCase();
        const pEmail = toEnglishDigits(p.email || '').trim().toLowerCase();
        const pCode = toEnglishDigits(p.partnerCode || '').trim().toLowerCase();
        const pPhone = normalizePhoneForComparison(p.phone || '');
        return (
          (pEmail && pEmail === cleanInput) ||
          pUser === cleanInput ||
          pCode === cleanInput ||
          (normPhone.length >= 10 && pPhone === normPhone)
        );
      });

      if (partner) {
        const updatedPass =
          newPassword && newPassword.trim().length >= 6 ? newPassword.trim() : partner.password;
        if (newPassword && newPassword.trim().length >= 6) {
          const nextPartners = partners.map((p) =>
            p.id === partner.id ? { ...p, password: updatedPass } : p
          );
          setPartners(nextPartners);
          try {
            safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(nextPartners));
          } catch {
            // ignore
          }
          syncPartnerToFirestore({ ...partner, password: updatedPass });
          showToast('رمز عبور جدید حساب همکار از طریق سرور ایمیل mail.karbama34.ir ثبت و فعال شد.', 'success');
        } else {
          showToast('اطلاعات ورود حساب همکار از طریق سرور ایمیل mail.karbama34.ir بازیابی شد.', 'success');
        }
        try {
          fetch('https://mail.karbama34.ir/api/recover-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'partner',
              email: partner.email || cleanInput,
              username: partner.username,
              companyName: partner.companyName,
              mailServer: 'mail.karbama34.ir',
            }),
          }).catch(() => {});
        } catch {
          // ignore
        }
        return {
          success: true,
          username: partner.username,
          password: updatedPass,
          accountType: 'partner',
          message:
            newPassword && newPassword.trim().length >= 6
              ? `رمز عبور حساب همکار (${partner.companyName}) از طریق سرور ایمیل mail.karbama34.ir با موفقیت بازنشانی شد! نام کاربری: ${partner.username} | رمز عبور جدید: ${updatedPass}`
              : `اطلاعات حساب همکار (${partner.companyName}) از طریق ایمیل رسمی (mail.karbama34.ir) تایید و بازیابی شد! نام کاربری: ${partner.username} | رمز عبور: ${updatedPass}`,
        };
      }

      if (targetRole === 'partner') {
        return {
          success: false,
          error: 'هیچ حساب همکاری با این آدرس ایمیل، نام کاربری یا شماره موبایل در سامانه یافت نشد.',
        };
      }
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

    setJobSeekers((prev) => {
      const next = prev.map((s) => {
        if (s.id === currentSeeker.id) {
          const updated: JobSeeker = {
            ...s,
            ...updates,
            ...({ updatedAt: new Date().toISOString() } as any),
          };
          syncUserToFirestore(updated);
          return updated;
        }
        return s;
      });
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
        idbCache.saveSeekers(next);
      } catch {
        // ignore
      }
      return next;
    });

    showToast('مشخصات پروفایل شما با موفقیت به روز شد.', 'success');
    return { success: true };
  };

  const updateResume = (resume: SeekerResume): { success: boolean; error?: string } => {
    if (!currentSeekerId) {
      showToast('لطفاً ابتدا وارد حساب کارجو شوید.', 'error');
      return { success: false, error: 'کارجو وارد نشده است' };
    }

    setJobSeekers((prev) => {
      const next = prev.map((s) => {
        if (s.id === currentSeekerId) {
          const updated: JobSeeker = {
            ...s,
            skills: resume.skillsList && resume.skillsList.length > 0 ? resume.skillsList : s.skills,
            bio: resume.summary || s.bio,
            resume: { ...resume, updatedAt: new Date().toISOString().split('T')[0] },
            ...({ updatedAt: new Date().toISOString() } as any),
          };
          syncUserToFirestore(updated);
          return updated;
        }
        return s;
      });
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
        idbCache.saveSeekers(next);
      } catch {
        // ignore
      }
      return next;
    });

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

    setApplications((prev) => {
      const next = [newApplication, ...prev];
      safeStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(next));
      return next;
    });
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', type: 'application', record: newApplication }),
    }).catch(() => {});
    showToast(`درخواست شما برای «${job.title}» با موفقیت ثبت شد!`, 'success');
    return { success: true };
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus, adminNote?: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    const nowIso = new Date().toISOString();
    setApplications((prev) => {
      const next = prev.map((app) => {
        if (app.id === appId) {
          const updated = {
            ...app,
            status,
            adminNote: adminNote !== undefined ? adminNote : app.adminNote,
            updatedAt: nowIso,
          };
          fetch('/api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upsert', type: 'application', record: updated }),
          }).catch(() => {});
          return updated;
        }
        return app;
      });
      safeStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(next));
      return next;
    });

    if (targetApp && targetApp.seekerId) {
      const statusLabel =
        status === 'accepted'
          ? 'تایید و استخدام نهایی ✓'
          : status === 'interview'
            ? 'دعوت به مصاحبه 📞'
            : status === 'rejected'
              ? 'رد درخواست ❌'
              : status === 'reviewed'
                ? 'بررسی شده 👀'
                : 'در حال بررسی ⏳';
      const notifId = `notif-app-${appId}-${Date.now()}`;
      const appNotif: JobNotification = {
        id: notifId,
        alertId: 'application-status-update',
        jobId: targetApp.jobId,
        jobTitle: `وضعیت درخواست شما برای «${targetApp.jobTitle}»: ${statusLabel}`,
        company: targetApp.companyName,
        city: targetApp.city,
        salaryText: statusLabel,
        message: adminNote || `وضعیت درخواست استخدامی شما برای موقعیت شغلی «${targetApp.jobTitle}» به «${statusLabel}» تغییر یافت.`,
        read: false,
        createdAt: nowIso,
        targetUserId: targetApp.seekerId,
        targetRole: 'seeker',
        notificationType: 'application_status',
      };
      setJobNotifications((prev) => {
        const next = [appNotif, ...prev];
        safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
        return next;
      });
      syncNotificationToFirestore(appNotif);
    }

    showToast('وضعیت درخواست کارجو بروزرسانی شد و اعلان به کارجو ارسال گردید.', 'success');
  };

  // Check if a newly posted job matches any active JobAlertSubscription or Favorite Job Categories
  const checkJobAlerts = (newJob: JobVacancy) => {
    let notifiedAlready = false;

    const allFavCategories = Array.from(
      new Set([...favoriteJobCategories, ...(currentSeeker?.favoriteCategories || [])])
    );

    if (allFavCategories.includes(newJob.category)) {
      notifiedAlready = true;
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

      if (notifiedAlready) return;

      if (alert.enableInAppToast) {
        showToast(
          `🔔 فرصت شغلی جدید مطابق معیارهای شما: «${newJob.title}» در ${newJob.city} با حقوق ${newJob.salaryMin.toLocaleString('fa-IR')} لیر منتشر شد!`,
          'info'
        );
      }

      if (alert.enableBrowserPush) {
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

  const dispatchSingleJobNotification = (job: JobVacancy) => {
    const notifId = `notif-job-${job.id}`;
    const notifItem: JobNotification = {
      id: notifId,
      alertId: 'system-new-job',
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      city: job.city,
      salaryText: `${job.salaryMin.toLocaleString('fa-IR')} تا ${job.salaryMax.toLocaleString('fa-IR')} لیر`,
      imageUrl: job.imageUrl,
      message: `آگهی جدید استخدام: ${job.title} در ${job.city} (${job.company})`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setJobNotifications((prev) => {
      if (prev.some((n) => n.id === notifId || n.jobId === job.id)) return prev;
      return [notifItem, ...prev];
    });
    syncNotificationToFirestore(notifItem);
    playNewJobHotelDingSound();
  };

  // Job management
  const addJob = (jobData: Omit<JobVacancy, 'id' | 'postedAt'>) => {
    const effectiveFeeTL = paymentSettings.jobPostingFeeTL || paymentSettings.feeTL || 500;
    const effectiveFeeToman =
      paymentSettings.jobPostingFeeToman && paymentSettings.jobPostingFeeToman > 0
        ? paymentSettings.jobPostingFeeToman
        : effectiveFeeTL * (paymentSettings.exchangeRateToman || 5460);
    const nowIso = new Date().toISOString();
    const newJob: JobVacancy = {
      ...jobData,
      id: 'job-' + Date.now(),
      postedAt: nowIso,
      paymentStatus: jobData.paymentStatus || 'paid',
      paymentAmountTL: jobData.paymentAmountTL || effectiveFeeTL,
      paymentAmountToman: jobData.paymentAmountToman || effectiveFeeToman,
      ...({ updatedAt: nowIso } as any),
    };

    setJobs((prev) => {
      const next = [newJob, ...prev];
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });
    syncJobToFirestore(newJob);
    showToast('آگهی کار با موفقیت ایجاد و در سامانه منتشر شد.', 'success');

    if (newJob.isActive && (newJob.paymentStatus === 'paid' || !newJob.paymentStatus)) {
      checkJobAlerts(newJob);
      dispatchSingleJobNotification(newJob);
    }
  };

  // Employer Job Posting with Fee Payment
  const submitJobWithPayment = (jobData: Omit<JobVacancy, 'id' | 'postedAt' | 'isActive'>): { success: boolean; jobId: string } => {
    const isOnlinePaid = jobData.paymentMethod === 'zarinpal' || jobData.paymentMethod === 'sepal';
    const status: JobPaymentStatus = jobData.paymentStatus || (isOnlinePaid ? 'paid' : 'pending_approval');
    const id = 'job-' + Date.now();
    const nowIso = new Date().toISOString();
    const effectiveFeeTL = paymentSettings.jobPostingFeeTL || paymentSettings.feeTL || 500;
    const effectiveFeeToman =
      paymentSettings.jobPostingFeeToman && paymentSettings.jobPostingFeeToman > 0
        ? paymentSettings.jobPostingFeeToman
        : effectiveFeeTL * (paymentSettings.exchangeRateToman || 5460);

    const newJob: JobVacancy = {
      ...jobData,
      id,
      postedAt: nowIso,
      isActive: status === 'paid',
      paymentStatus: status,
      paymentAmountTL: jobData.paymentAmountTL || effectiveFeeTL,
      paymentAmountToman: jobData.paymentAmountToman || effectiveFeeToman,
      paymentDate: nowIso,
      ...({ updatedAt: nowIso } as any),
    };

    setJobs((prev) => {
      const next = [newJob, ...prev];
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });
    syncJobToFirestore(newJob);

    if (newJob.isActive) {
      checkJobAlerts(newJob);
      dispatchSingleJobNotification(newJob);
      showToast('پرداخت آنلاین تعرفه تایید شد و آگهی شما بلافاصله در سایت منتشر گردید و به کارجویان اطلاع‌رسانی شد.', 'success');
    } else {
      addAdminNotification({
        type: 'job_posted',
        title: '💳 ثبت آگهی استخدام کارفرما (نیازمند تایید)',
        message: `کارفرما آگهی استخدام «${newJob.title}» (${newJob.company}) را جهت بررسی و تایید ثبت نمود.`,
        data: { jobId: newJob.id },
      });
      showToast('آگهی شما با موفقیت ثبت شد و پس از بررسی مدیر منتشر خواهد شد.', 'success');
    }

    return { success: true, jobId: id };
  };

  const approveJobPayment = (jobId: string, adminNote?: string) => {
    const nowIso = new Date().toISOString();
    setJobs((prev) => {
      const next = prev.map((j) => {
        if (j.id === jobId) {
          const updated: JobVacancy = {
            ...j,
            isActive: true,
            paymentStatus: 'paid',
            paymentAdminNote: adminNote || 'پرداخت تعرفه تایید شد و آگهی فعال گردید.',
            ...({ updatedAt: nowIso } as any),
          };
          syncJobToFirestore(updated);
          checkJobAlerts(updated);
          dispatchSingleJobNotification(updated);
          return updated;
        }
        return j;
      });
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });
    showToast('پرداخت آگهی تایید شد و آگهی با موفقیت در سایت فعال و منتشر گردید.', 'success');
  };

  const rejectJobPayment = (jobId: string, reason: string) => {
    const nowIso = new Date().toISOString();
    setJobs((prev) => {
      const next = prev.map((j) => {
        if (j.id === jobId) {
          const updated: JobVacancy = {
            ...j,
            isActive: false,
            paymentStatus: 'rejected',
            paymentAdminNote: reason || 'فیش واریزی نامعتبر یا مبلغ ناقص است.',
            ...({ updatedAt: nowIso } as any),
          };
          syncJobToFirestore(updated);
          return updated;
        }
        return j;
      });
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });
    showToast('پرداخت آگهی رد شد و وضعیت به‌روزرسانی گردید.', 'info');
  };

  const updateJob = (id: string, updates: Partial<JobVacancy>) => {
    setJobs((prev) => {
      const next = prev.map((j) => {
        if (j.id === id) {
          const updated: JobVacancy = {
            ...j,
            ...updates,
            ...({ updatedAt: new Date().toISOString() } as any),
          };
          syncJobToFirestore(updated);
          return updated;
        }
        return j;
      });
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });
    showToast('آگهی کار با موفقیت ویرایش شد.', 'success');
  };

  const deleteJob = (id: string) => {
    addTombstoneIds('karbama_deleted_jobs_v1', [id]);
    addTombstoneIds('karbama_deleted_notifications_v1', [`notif-job-${id}`, `job-${id}`]);
    addTombstoneIds('karbama_read_notifications_v1', [`notif-job-${id}`, `job-${id}`]);

    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });

    setJobNotifications((prev) => {
      const next = prev.filter((n) => n.jobId !== id && n.id !== `notif-job-${id}`);
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });

    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_job', id }),
    }).catch(() => {});

    if (db) {
      deleteDoc(doc(db, 'jobs', id)).catch(() => {});
      deleteDoc(doc(db, 'notifications', `notif-job-${id}`)).catch(() => {});
    }

    showToast('آگهی کار به طور دائمی حذف شد.', 'info');
  };

  const toggleJobStatus = (id: string) => {
    setJobs((prev) => {
      const next = prev.map((j) => {
        if (j.id === id) {
          const updated: JobVacancy = {
            ...j,
            isActive: !j.isActive,
            ...({ updatedAt: new Date().toISOString() } as any),
          };
          syncJobToFirestore(updated);
          return updated;
        }
        return j;
      });
      safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
      idbCache.saveJobs(next);
      return next;
    });
    showToast('وضعیت آگهی تغییر کرد.', 'info');
  };

  // Hotel management
  const addHotel = (hotelData: Omit<Hotel, 'id'>) => {
    const newHotel: Hotel = {
      ...hotelData,
      id: 'hotel-' + Date.now(),
    };
    setHotels((prev) => {
      const next = [newHotel, ...prev];
      safeStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(next));
      idbCache.saveHotels(next);
      return next;
    });
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', type: 'hotel', record: newHotel, hotel: newHotel }),
    }).catch(() => {});

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
    setHotels((prev) => {
      const next = prev.map((h) => {
        if (h.id === id) {
          const updated = { ...h, ...updates, updatedAt: new Date().toISOString() };
          fetch('/api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upsert', type: 'hotel', record: updated, hotel: updated }),
          }).catch(() => {});
          return updated;
        }
        return h;
      });
      safeStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(next));
      idbCache.saveHotels(next);
      return next;
    });
    showToast('مشخصات هتل بروزرسانی شد.', 'success');
  };

  const deleteHotel = (id: string) => {
    addTombstoneIds('karbama_deleted_hotels_v1', [id]);
    setHotels((prev) => {
      const next = prev.filter((h) => h.id !== id);
      safeStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(next));
      idbCache.saveHotels(next);
      return next;
    });
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_hotel', id }),
    }).catch(() => {});
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
    const target = jobNotifications.find((n) => n.id === id);
    const idsToMark = [id];
    if (target?.jobId) {
      idsToMark.push(`job-${target.jobId}`);
    }
    addTombstoneIds('karbama_read_notifications_v1', idsToMark);
    addTombstoneIds('karbama_deleted_notifications_v1', idsToMark);

    setJobNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id && (!target?.jobId || n.jobId !== target.jobId));
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });

    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_notification_read', id, jobId: target?.jobId || '', ids: idsToMark }),
    }).catch(() => {});

    if (db) {
      setDoc(doc(db, 'notifications', id), { isRead: true, read: true }, { merge: true }).catch(() => {});
    }
  };

  const markAllNotificationsAsRead = () => {
    const allIds: string[] = [];
    jobNotifications.forEach((n) => {
      if (n.id) allIds.push(n.id);
      if (n.jobId) allIds.push(`job-${n.jobId}`);
    });
    addTombstoneIds('karbama_read_notifications_v1', allIds);
    addTombstoneIds('karbama_deleted_notifications_v1', allIds);

    setJobNotifications([]);
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));

    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_notifications', ids: allIds }),
    }).catch(() => {});

    if (db) {
      jobNotifications.forEach((n) => {
        setDoc(doc(db, 'notifications', n.id), { isRead: true, read: true }, { merge: true }).catch(() => {});
      });
    }
    showToast('تمام اعلان‌ها خوانده شدند و از لیست اعلان‌های جدید پاک گردیدند.', 'info');
  };

  const deleteNotification = (id: string) => {
    const target = jobNotifications.find((n) => n.id === id);
    const idsToDelete = [id];
    if (target?.jobId) {
      idsToDelete.push(`job-${target.jobId}`);
    }
    addTombstoneIds('karbama_deleted_notifications_v1', idsToDelete);
    addTombstoneIds('karbama_read_notifications_v1', idsToDelete);

    setJobNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id && (!target?.jobId || n.jobId !== target.jobId));
      safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });

    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_notification', id, jobId: target?.jobId || '' }),
    }).catch(() => {});

    if (db) {
      deleteDoc(doc(db, 'notifications', id)).catch(() => {});
    }
  };

  const clearNotifications = () => {
    const allIds: string[] = [];
    jobNotifications.forEach((n) => {
      if (n.id) allIds.push(n.id);
      if (n.jobId) allIds.push(`job-${n.jobId}`);
    });
    addTombstoneIds('karbama_deleted_notifications_v1', allIds);
    addTombstoneIds('karbama_read_notifications_v1', allIds);
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));

    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_notifications', ids: allIds }),
    }).catch(() => {});

    if (db) {
      jobNotifications.forEach((n) => {
        if (n.id) {
          deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
        }
      });
    }
    setJobNotifications([]);
    showToast('تاریخچه اعلان‌ها به طور کامل پاک شد.', 'info');
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

    setCurrentSeekerId(null);
    safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    setIsAdminLoggedIn(false);
    setCurrentPartnerId(found.id);
    setRole('partner');
    setActiveTab('partner');
    showToast(`خوش آمدید، همکار گرامی ${found.fullName} (${found.companyName})`, 'success');
    return { success: true };
  };

  const registerPartner = (input: RegisterPartnerInput): { success: boolean; error?: string } => {
    if (!input.companyName.trim() || !input.fullName.trim() || !input.phone.trim()) {
      return { success: false, error: 'لطفاً نام شرکت/آژانس، نام نماینده و شماره موبایل را وارد فرمایید.' };
    }
    if (!input.username.trim() || !input.password.trim()) {
      return { success: false, error: 'تعیین نام کاربری و رمز عبور الزامی است.' };
    }

    if (input.nationalId !== undefined && input.nationalId.trim() !== '') {
      const natCheck = validateNationalIdOrPassport(input.nationalId);
      if (!natCheck.isValid) {
        return { success: false, error: natCheck.error || 'کد ملی وارد شده معتبر نیست.' };
      }
    }

    const phoneCheck = validatePhoneNumber(input.phone, '+98');
    if (!phoneCheck.isValid) {
      return { success: false, error: phoneCheck.error || 'شماره موبایل وارد شده معتبر نیست.' };
    }

    if (!input.email?.trim() || !isValidEmail(input.email)) {
      return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر و واقعی وارد کنید.' };
    }

    if (input.cardNumber !== undefined && input.cardNumber.trim() !== '') {
      const cardCheck = validateIranianBankCard(input.cardNumber);
      if (!cardCheck.isValid) {
        return { success: false, error: cardCheck.error || 'شماره کارت بانکی وارد شده معتبر نیست.' };
      }
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
    const selectedPlan =
      (input.planId ? partnerPlans.find((pl) => pl.id === input.planId) : undefined) ||
      partnerPlans[0] ||
      DEFAULT_PARTNER_PLANS[0];

    const nowIso = new Date().toISOString();
    const newPartner: PartnerAccount = {
      id: 'partner-' + Date.now(),
      partnerCode: `PART-${randomNum}`,
      companyName: input.companyName.trim(),
      fullName: input.fullName.trim(),
      nationalId: input.nationalId?.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim().toLowerCase() || '',
      cardNumber: input.cardNumber?.trim(),
      username: cleanUser,
      password: input.password,
      city: input.city?.trim() || 'استانبول',
      paymentStatus: 'pending',
      accountStatus: 'pending',
      subscriptionStatus: 'unpaid',
      planId: selectedPlan.id,
      planTitle: selectedPlan.title,
      paymentAmountTL: selectedPlan.priceTL,
      paymentAmountToman: selectedPlan.priceToman,
      daysRemaining: 0,
      createdAt: nowIso,
      ...({ updatedAt: nowIso } as any),
    };

    setPartners((prev) => {
      const next = [newPartner, ...prev];
      safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(next));
      return next;
    });
    syncPartnerToFirestore(newPartner);
    setCurrentSeekerId(null);
    safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    setIsAdminLoggedIn(false);
    setCurrentPartnerId(newPartner.id);
    setRole('partner');
    setActiveTab('partner');

    addAdminNotification({
      type: 'partner_registered',
      title: 'همکار جدید در سامانه ثبت‌نام کرد (در انتظار پرداخت)',
      message: `همکار جدید «${newPartner.companyName}» با مدیریت ${newPartner.fullName} و کد همکاری ${newPartner.partnerCode} ثبت‌نام کرد و در انتظار پرداخت آنلاین و تایید مدیریت است.`,
    });

    showToast(
      `حساب همکاری شما با کد ${newPartner.partnerCode} ایجاد شد. لطفاً جهت فعال‌سازی پنل، حق اشتراک را به صورت آنلاین پرداخت نمایید.`,
      'success'
    );
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
    const nowIso = new Date().toISOString();

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
      paymentStatus: initialStatus === 'active' ? 'approved' : 'pending',
      accountStatus: initialStatus === 'active' ? 'approved' : 'pending',
      subscriptionStatus: initialStatus,
      planId: input.planId || '1_year',
      planTitle: plan?.title || 'اشتراک ۱ ساله همکاران کارباما',
      daysRemaining: initialDays,
      adminApprovalNote: input.adminNote?.trim() || 'ثبت و تایید مستقیم توسط مدیریت سامانه',
      createdAt: nowIso,
      ...({ updatedAt: nowIso } as any),
    };

    setPartners((prev) => {
      const next = [newPartner, ...prev];
      safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(next));
      return next;
    });
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
    const nowIso = new Date().toISOString();

    let targetUpdatedPartner: PartnerAccount | undefined;
    const updatedPartners = partners.map((p) => {
      if (p.id === currentPartner.id) {
        const updated: PartnerAccount = {
          ...p,
          paymentStatus: 'pending',
          accountStatus: 'pending',
          subscriptionStatus: 'pending_approval' as PartnerSubscriptionStatus,
          planId: plan.id,
          planTitle: plan.title,
          paymentAmountTL: plan.priceTL,
          paymentAmountToman: plan.priceToman,
          paymentMethod,
          paymentReceiptUrl: paymentReceiptUrl || p.paymentReceiptUrl,
          paymentReferenceId: paymentReferenceId || 'REF-' + Math.floor(100000 + Math.random() * 900000),
          paymentPayerName: paymentPayerName || currentPartner.fullName,
          paymentDate: nowIso.split('T')[0],
          adminApprovalNote: 'پرداخت ثبت شد و در انتظار بررسی و تایید مدیریت است.',
          ...({ updatedAt: nowIso } as any),
        };
        targetUpdatedPartner = updated;
        return updated;
      }
      return p;
    });

    setPartners(updatedPartners);
    safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updatedPartners));
    if (targetUpdatedPartner) {
      syncPartnerToFirestore(targetUpdatedPartner);
    }

    addAdminNotification({
      type: 'partner_payment',
      title: '💳 فیش / تراکنش پرداخت حق اشتراک همکار ثبت شد',
      message: `همکار «${currentPartner.companyName}» (${currentPartner.fullName}) پرداخت برای ${plan.title} (${plan.priceToman.toLocaleString('fa-IR')} تومان) را ارسال نمود. جهت فعال‌سازی بررسی شود.`,
    });

    showToast('اطلاعات پرداخت حق اشتراک ثبت شد و پس از بررسی مدیر فعال می‌گردد.', 'success');
    return { success: true };
  };

  const approvePartnerSubscription = (partnerId: string, note?: string) => {
    let approvedPartner: PartnerAccount | undefined;
    const nowIso = new Date().toISOString();
    const approvalNote = note || 'پرداخت و اشتراک پنل همکار توسط مدیریت تایید و فعال گردید.';
    setPartners((prev) => {
      const next = prev.map((p) => {
        if (p.id === partnerId) {
          const plan = partnerPlans.find((pl) => pl.id === p.planId) || DEFAULT_PARTNER_PLANS[0];
          const durationDays = plan.durationMonths * 30;
          const startDate = new Date();
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + durationDays);

          const updated: PartnerAccount = {
            ...p,
            paymentStatus: 'approved',
            accountStatus: 'approved',
            subscriptionStatus: 'active' as PartnerSubscriptionStatus,
            subscriptionStartDate: startDate.toISOString(),
            subscriptionExpiresAt: expireDate.toISOString(),
            daysRemaining: durationDays,
            adminApprovalNote: approvalNote,
            ...({ updatedAt: nowIso } as any),
          };
          approvedPartner = updated;
          return updated;
        }
        return p;
      });
      safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(next));
      return next;
    });

    if (approvedPartner) {
      syncPartnerToFirestore(approvedPartner);
      const notifId = `notif-partner-approve-${partnerId}-${Date.now()}`;
      const partnerNotif: JobNotification = {
        id: notifId,
        alertId: 'partner-payment-approval',
        jobId: `status-partner-approve-${partnerId}`,
        jobTitle: '✅ پرداخت و اشتراک پنل همکار تأیید شد!',
        company: approvedPartner.companyName,
        city: approvedPartner.city || 'استانبول',
        salaryText: 'پنل همکار فعال شد ✓',
        message: approvalNote,
        read: false,
        createdAt: nowIso,
        targetUserId: partnerId,
        targetRole: 'partner',
        notificationType: 'payment_approved',
      };
      setJobNotifications((prev) => {
        const next = [partnerNotif, ...prev];
        safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
        return next;
      });
      syncNotificationToFirestore(partnerNotif);
    }

    showToast('اشتراک همکار با موفقیت فعال شد و دسترسی کامل پنل همکار باز گردید.', 'success');
  };

  const rejectPartnerSubscription = (partnerId: string, reason: string) => {
    let rejectedPartner: PartnerAccount | undefined;
    const nowIso = new Date().toISOString();
    const cleanReason =
      reason && reason.trim()
        ? reason.trim()
        : 'پرداخت اشتراک همکار توسط مدیریت تایید نشد؛ لطفاً مجدداً از طریق درگاه آنلاین یا ثبت فیش معتبر اقدام نمایید.';
    setPartners((prev) => {
      const next = prev.map((p) => {
        if (p.id === partnerId) {
          const updated: PartnerAccount = {
            ...p,
            paymentStatus: 'rejected',
            accountStatus: 'rejected',
            subscriptionStatus: 'rejected' as PartnerSubscriptionStatus,
            adminApprovalNote: cleanReason,
            ...({ updatedAt: nowIso } as any),
          };
          rejectedPartner = updated;
          return updated;
        }
        return p;
      });
      safeStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(next));
      return next;
    });

    if (rejectedPartner) {
      syncPartnerToFirestore(rejectedPartner);
      const notifId = `notif-partner-reject-${partnerId}-${Date.now()}`;
      const partnerNotif: JobNotification = {
        id: notifId,
        alertId: 'partner-payment-rejection',
        jobId: `status-partner-reject-${partnerId}`,
        jobTitle: '❌ رد پرداخت اشتراک همکار توسط مدیریت',
        company: rejectedPartner.companyName,
        city: rejectedPartner.city || 'استانبول',
        salaryText: 'نیازمند بررسی و پرداخت مجدد',
        message: cleanReason,
        read: false,
        createdAt: nowIso,
        targetUserId: partnerId,
        targetRole: 'partner',
        notificationType: 'payment_rejected',
      };
      setJobNotifications((prev) => {
        const next = [partnerNotif, ...prev];
        safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
        return next;
      });
      syncNotificationToFirestore(partnerNotif);
    }

    showToast('پرداخت اشتراک همکار رد شد و اطلاع‌رسانی به پنل همکار ارسال گردید.', 'info');
  };

  const updatePartnerPlanPricing = (planId: PartnerSubscriptionPlanId, priceTL: number, priceToman: number) => {
    setPartnerPlans((prev) => {
      const next = prev.map((pl) => (pl.id === planId ? { ...pl, priceTL, priceToman } : pl));
      safeStorage.setItem(STORAGE_KEYS.PARTNER_PLANS, JSON.stringify(next));
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', type: 'partner_plans', record: next }),
      }).catch(() => {});
      return next;
    });
    showToast('تعرفه اشتراک همکاران با موفقیت بروزرسانی شد.', 'success');
  };

  const updatePartnerPlans = (plans: PartnerSubscriptionPlan[]) => {
    setPartnerPlans(plans);
    safeStorage.setItem(STORAGE_KEYS.PARTNER_PLANS, JSON.stringify(plans));
    fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', type: 'partner_plans', record: plans }),
    }).catch(() => {});
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

    const natIdCheck = validateNationalIdOrPassport(input.nationalId);
    if (!natIdCheck.isValid) {
      return { success: false, error: natIdCheck.error || 'کد ملی وارد شده معتبر نیست.' };
    }

    const phoneCheck = validatePhoneNumber(input.phoneNumber, input.phoneCountryCode || '+98');
    if (!phoneCheck.isValid) {
      return { success: false, error: phoneCheck.error || 'شماره موبایل کارجو معتبر نیست.' };
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
    addTombstoneIds('karbama_deleted_seekers_v1', [seekerId]);
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
    addTombstoneIds('karbama_deleted_seekers_v1', ids);
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
      fetch('/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          type: 'chat',
          record: chat,
          chat,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
    try {
      if (!db) return;
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
      : currentPartner
        ? chatSessions.find(
            (c) =>
              (c.seekerId === currentPartner.id || c.nationalId === currentPartner.partnerCode) &&
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
    const cleanFirst = input.firstName.trim() || currentSeeker?.fullName?.split(' ')[0] || currentPartner?.fullName?.split(' ')[0] || 'کاربر';
    const cleanLast = input.lastName.trim() || currentSeeker?.fullName?.split(' ').slice(1).join(' ') || currentPartner?.companyName || 'عزیز';
    const cleanPhone = input.phone.trim() || currentSeeker?.phone || currentPartner?.phone || '۰۹۱۲۰۰۰۰۰۰۰';
    const cleanNatId = input.nationalId.replace(/\D/g, '') || currentSeeker?.nationalId || currentPartner?.partnerCode || '۰۰۰۰۰۰۰۰۰۰';

    const fullName = currentSeeker?.fullName || (currentPartner ? `${currentPartner.companyName} (${currentPartner.fullName})` : `${cleanFirst} ${cleanLast}`.trim());
    const now = new Date().toISOString();
    const effectiveConsultFee =
      paymentSettings.consultationFeeToman && paymentSettings.consultationFeeToman > 0
        ? paymentSettings.consultationFeeToman
        : (paymentSettings.consultationFeeTL || 150) * (paymentSettings.exchangeRateToman || 5460);

    const newSession: LiveChatSession = {
      id: 'chat-' + Date.now(),
      seekerId: currentSeeker?.id || currentPartner?.id,
      firstName: cleanFirst,
      lastName: cleanLast,
      fullName,
      phone: cleanPhone,
      nationalId: cleanNatId,
      status: currentPartner?.subscriptionStatus === 'active' || currentSeeker?.verificationStatus === 'approved' ? 'approved' : 'pending',
      isConsultationPaid: true,
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'seeker',
          senderName: fullName,
          text:
            currentPartner?.subscriptionStatus === 'active'
              ? `شروع گفتگوی آنلاین همکار رسمی «${fullName}» با مدیریت کارباما.`
              : currentSeeker?.verificationStatus === 'approved'
                ? `شروع گفتگوی آنلاین کارجوی تاییدشده «${fullName}» با مدیریت کارباما.`
                : `حق مشاوره (${effectiveConsultFee.toLocaleString('fa-IR')} تومان) واریز شد. درخواست گفتگوی آنلاین توسط «${fullName}» ثبت گردید.`,
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
      body: `کاربر «${fullName}» (تلفن: ${cleanPhone}) درخواست گفتگو ثبت کرد.`,
      tag: `new-chat-${newSession.id}`,
    });

    addAdminNotification({
      type: 'seeker_registered',
      title: '💬 درخواست جدید چت آنلاین با مدیر',
      message: `کاربر «${fullName}» با شناسه ${cleanNatId} و شماره تلفن ${cleanPhone} درخواست چت آنلاین با مدیر را ثبت نمود.`,
      data: { chatId: newSession.id },
    });

    showToast(
      newSession.status === 'approved'
        ? 'گفتگوی آنلاین شما با مدیریت کارباما فعال شد.'
        : 'درخواست چت آنلاین شما ثبت شد. لطفاً منتظر تایید مدیر بمانید.',
      'success'
    );
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

  const visibleJobNotifications = jobNotifications.filter((n) => {
    if (!n.targetUserId) return true;
    if (isAdminLoggedIn) return true;
    if (currentSeeker && n.targetUserId === currentSeeker.id) return true;
    if (currentPartner && n.targetUserId === currentPartner.id) return true;
    return false;
  });

  const visibleUnreadNotificationCount = visibleJobNotifications.filter((n) => !n.read).length;

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
        jobNotifications: visibleJobNotifications,
        unreadNotificationCount: visibleUnreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
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
        deleteAdminNotification,
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
        liveRates,
        refreshLiveRates,
        formatTryToIrr,
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
