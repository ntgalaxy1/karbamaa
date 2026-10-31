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
import { safeStorage } from '../utils/safeStorage';
import {
  requestSafeNotificationPermission,
  showSafeNotification,
  getSafeNotificationPermission,
} from '../utils/safeNotification';

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
  | 'currency';

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

export interface RegisterSeekerInput {
  firstName: string;
  lastName: string;
  fullName: string;
  fatherName: string;
  nationalId: string;
  gender: Gender;
  phoneCountryCode: string;
  phoneNumber: string;
  phone: string;
  username: string;
  password: string;
  iranProvince: string;
  iranCity: string;
  iranAddress: string;
  targetCountry: TargetCountry;
  targetCity: string;
  turkishLevel: TurkishLevel;
  residenceStatus: ResidenceStatus;
  skills: string[];
  bio?: string;

  // بخش ۳: شغل‌ها، تخصص‌ها و زبان‌ها
  selectedJobs?: string[];
  customProfession?: string;
  targetLanguageLevel?: string;
  knownLanguages?: string[];

  // بخش ۴: مدارک، تعهدنامه و امضا
  passportPhotoUrl?: string;
  fullBodyPhotoUrl?: string;
  nationalCardPhotoUrl?: string;
  contractDateShamsi?: string;
  contractDateMiladi?: string;
  contractAmount?: string;
  payerCardNumber?: string;
  brokerCardNumber?: string;
  signatureDataUrl?: string;
  contractAccepted?: boolean;
}

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

  // Auth methods
  registerSeeker: (input: RegisterSeekerInput) => { success: boolean; error?: string };
  loginSeeker: (username: string, password: string) => { success: boolean; error?: string };
  loginAdmin: (username: string, password: string) => { success: boolean; error?: string };
  logoutSeeker: () => void;
  logoutAdmin: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
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

  // Job Alerts & Notifications (Requested Feature)
  jobAlerts: JobAlertSubscription[];
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
  registerPartner: (input: {
    companyName: string;
    fullName: string;
    phone: string;
    username: string;
    password: string;
    city?: string;
  }) => { success: boolean; error?: string };
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
  switchToDemoPartner: () => void;
  activatePartnerInstantly: (partnerId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  feeTL: 500,
  exchangeRateToman: 5470, // نرخ روز: هر ۱ لیر ترکیه = ۵,۴۷۰ تومان => ۵۰۰ لیر = ۲,۷۳۵,۰۰۰ تومان (۲۷,۳۵۰,۰۰۰ ریال)
  turkeyBankName: 'Ziraat Bankası (زراعت بانک ترکیه)',
  turkeyIban: 'TR56 0001 0090 1234 5678 9050 01',
  turkeyAccountHolder: 'Karbama Danışmanlık ve İnsan Kaynakları',
  iranBankName: 'بانک ملت ایران',
  iranCardNumber: '۶۱۰۴-۳۳۷۸-۹۰۱۲-۳۴۵۶',
  iranCardHolder: 'مدیریت امور مالی کارباما',
  zarinpalMerchantId: 'zp-karbama-official',
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
  SEEKERS: 'karbama_seekers_v3',
  JOBS: 'karbama_jobs_v3',
  APPLICATIONS: 'karbama_applications_v3',
  ADDRESSES: 'karbama_addresses_v3',
  HOTELS: 'karbama_hotels_v3',
  BOOKINGS: 'karbama_bookings_v3',
  TRANSIT: 'karbama_transit_v3',
  TRANSIT_HUBS: 'karbama_transit_hubs_v3',
  CURRENT_USER_ID: 'karbama_current_user_v3',
  IS_ADMIN: 'karbama_is_admin_v3',
  SAVED_JOBS: 'karbama_saved_jobs_v3',
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
  // App Language State (Persian, Turkish, English, Arabic)
  const [appLanguage, setAppLanguage] = useState<'fa' | 'tr' | 'en' | 'ar'>(() => {
    try {
      const stored = safeStorage.getItem('karbama_app_lang');
      return (stored as any) || 'fa';
    } catch {
      return 'fa';
    }
  });

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
      const stored = safeStorage.getItem('karbama_admin_notifications');
      return stored ? JSON.parse(stored) : [
        {
          id: 'an-1',
          type: 'seeker_registered',
          title: 'کارجو جدید ثبت‌نام کرد',
          message: 'کارجو علی رضایی با کد ملی ۰۰۱۲۳۴۵۶۷۸ در سامانه کارباما ثبت‌نام نمود.',
          read: false,
          createdAt: new Date().toISOString(),
        }
      ];
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
        safeStorage.setItem('karbama_admin_notifications', JSON.stringify(next));
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
        safeStorage.setItem('karbama_admin_notifications', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const clearAdminNotifications = () => {
    setAdminNotifications([]);
    try {
      safeStorage.removeItem('karbama_admin_notifications');
    } catch (e) {
      console.error(e);
    }
  };

  const unreadAdminNotifCount = adminNotifications.filter((n) => !n.read).length;

  const approveSeekerAccount = (seekerId: string, note?: string) => {
    setJobSeekers((prev) => {
      const next = prev.map((s) =>
        s.id === seekerId
          ? { ...s, verificationStatus: 'approved' as const, isPaymentVerified: true, adminVerificationNote: note }
          : s
      );
      try {
        safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast('حساب کاربری و تسویه وجه کارجو با موفقیت تایید و فعال شد.', 'success');
  };

  const rejectSeekerAccount = (seekerId: string, reason: string) => {
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
  };

  // Safe load data with fallback to initial data
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.SEEKERS);
      return stored ? JSON.parse(stored) : INITIAL_JOB_SEEKERS;
    } catch {
      return INITIAL_JOB_SEEKERS;
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
      return stored ? JSON.parse(stored) : ['job-1', 'job-3'];
    } catch {
      return ['job-1', 'job-3'];
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
      return safeStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'seeker-1';
    } catch {
      return 'seeker-1';
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Partner System State
  const [partners, setPartners] = useState<PartnerAccount[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PARTNERS);
      return stored ? JSON.parse(stored) : INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(() => {
    try {
      return safeStorage.getItem(STORAGE_KEYS.CURRENT_PARTNER_ID) || null;
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
  const DEFAULT_INITIAL_ALERTS: JobAlertSubscription[] = [
    {
      id: 'alert-default-1',
      title: 'همه کارهای با جای خواب در استانبول',
      city: 'استانبول',
      category: 'all',
      contractType: 'all',
      minSalary: 30000,
      keywords: ['جای خواب'],
      accommodationOnly: true,
      workPermitOnly: false,
      enableBrowserPush: true,
      enableInAppToast: true,
      isActive: true,
      createdAt: '2026-10-25T10:00:00Z',
    },
  ];

  const [jobAlerts, setJobAlerts] = useState<JobAlertSubscription[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.JOB_ALERTS);
      return stored ? JSON.parse(stored) : DEFAULT_INITIAL_ALERTS;
    } catch {
      return DEFAULT_INITIAL_ALERTS;
    }
  });

  const [jobNotifications, setJobNotifications] = useState<JobNotification[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: 'notif-welcome',
              alertId: 'alert-default-1',
              jobId: 'job-1',
              jobTitle: 'کمک‌آشپز و سالن‌کار رستوران سنتی',
              company: 'رستوران و کباب‌سرای آناتولی',
              city: 'استانبول',
              salaryText: '۳۲,۰۰۰ تا ۳۸,۰۰۰ لیر',
              imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
              message: 'فرصت شغلی جدید مطابق هشدار شما: کمک‌آشپز در استانبول (فاتیح)',
              read: false,
              createdAt: '2026-10-25T11:00:00Z',
            },
          ];
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

  // Persist state updates securely
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SEEKERS, JSON.stringify(jobSeekers));
  }, [jobSeekers]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
  }, [hotels]);

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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const registerSeeker = (input: RegisterSeekerInput): { success: boolean; error?: string } => {
    // 1. Personal & Account Credentials Validation
    if (!input.firstName?.trim() || !input.lastName?.trim() || !input.fatherName?.trim() || !input.nationalId?.trim()) {
      return { success: false, error: 'لطفاً مشخصات فردی (نام، نام خانوادگی، نام پدر و کد ملی) را به طور کامل وارد کنید.' };
    }

    if (!input.phoneNumber?.trim() || !input.phoneCountryCode?.trim()) {
      return { success: false, error: 'لطفاً پیش‌شماره کشور و شماره تماس خود را وارد نمایید.' };
    }

    if (!input.gender) {
      return { success: false, error: 'تعیین جنسیت الزامی می‌باشد.' };
    }

    if (!input.username?.trim() || !input.password?.trim()) {
      return { success: false, error: 'لطفاً نام کاربری و رمز عبور ورود به سامانه را تعیین کنید.' };
    }

    if (input.nationalId.replace(/\s/g, '').length < 10) {
      return { success: false, error: 'کد ملی وارد شده باید ۱۰ رقم کامل باشد.' };
    }

    // 2. Iran Residence & Target Country Validation
    if (!input.iranProvince?.trim() || !input.iranCity?.trim() || !input.iranAddress?.trim()) {
      return { success: false, error: 'لطفاً آدرس دقیق محل سکونت در ایران (شامل استان، شهرستان و آدرس کامل) را وارد کنید.' };
    }

    if (!input.targetCountry) {
      return { success: false, error: 'تعیین کشور مقصد (ترکیه، ارمنستان، عراق یا آلمان) الزامی است.' };
    }

    const cleanUsername = input.username.trim().toLowerCase();
    const existingUser = jobSeekers.find((s) => s.username.toLowerCase() === cleanUsername);
    if (existingUser) {
      return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.' };
    }

    const cleanNatId = input.nationalId.trim();
    const existingNatId = jobSeekers.find((s) => s.nationalId === cleanNatId);
    if (existingNatId) {
      return { success: false, error: 'با این کد ملی قبلاً حسابی در سیستم ثبت شده است.' };
    }

    const cleanRawPhone = (input.phoneNumber || input.phone || '').replace(/\D/g, '');
    if (cleanRawPhone.length >= 7) {
      const existingPhone = jobSeekers.find((s) => {
        const sPhone = (s.phoneNumber || s.phone || '').replace(/\D/g, '');
        return sPhone && sPhone.endsWith(cleanRawPhone.slice(-8));
      });
      if (existingPhone) {
        return { success: false, error: 'با این شماره تلفن/واتساپ قبلاً حسابی در سیستم ثبت شده است.' };
      }
    }

    const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
    const formattedPhone = input.phone || `${input.phoneCountryCode} ${input.phoneNumber.trim()}`;

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
      username: cleanUsername,
      password: input.password,
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

    setJobSeekers((prev) => [newSeeker, ...prev]);
    setCurrentSeekerId(newSeeker.id);
    setRole('jobseeker');
    setActiveTab('jobs');
    showToast(`ثبت‌نام با موفقیت انجام شد. خوش آمدید ${newSeeker.fullName}!`, 'success');
    return { success: true };
  };

  const loginSeeker = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const seeker = jobSeekers.find(
      (s) => s.username.toLowerCase() === cleanUsername && s.password === password
    );

    if (!seeker) {
      return { success: false, error: 'نام کاربری یا رمز عبور کارجو اشتباه است.' };
    }

    setCurrentSeekerId(seeker.id);
    setRole('jobseeker');
    showToast(`خوش آمدید، ${seeker.fullName}!`, 'success');
    return { success: true };
  };

  const loginAdmin = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanInputUser = username.trim().toLowerCase();
    const cleanAdminUser = adminCredentials.username.trim().toLowerCase();

    if (cleanInputUser === cleanAdminUser && password === adminCredentials.password) {
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

    if (currentSeeker.password !== oldPassword) {
      return { success: false, error: 'رمز عبور فعلی نادرست است.' };
    }

    if (newPassword.length < 5) {
      return { success: false, error: 'رمز عبور جدید باید حداقل ۵ کاراکتر باشد.' };
    }

    setJobSeekers((prev) =>
      prev.map((s) => (s.id === currentSeeker.id ? { ...s, password: newPassword } : s))
    );

    showToast('رمز عبور شما با موفقیت تغییر یافت.', 'success');
    return { success: true };
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
      seekerPhone: currentSeeker.phone,
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

  // Check if a newly posted job matches any active JobAlertSubscription
  const checkJobAlerts = (newJob: JobVacancy) => {
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

      if (alert.enableInAppToast) {
        showToast(
          `🔔 فرصت شغلی جدید مطابق معیارهای شما: «${newJob.title}» در ${newJob.city} با حقوق ${newJob.salaryMin.toLocaleString('fa-IR')} لیر منتشر شد!`,
          'info'
        );
      }

      if (alert.enableBrowserPush) {
        showSafeNotification(`🔔 فرصت شغلی جدید در کارباما: ${newJob.title}`, {
          body: `${newJob.company} (${newJob.city}) - حقوق: ${newJob.salaryMin.toLocaleString('fa-IR')} تا ${newJob.salaryMax.toLocaleString('fa-IR')} لیر`,
          icon: newJob.imageUrl || '/pwa-192x192.png',
          dir: 'rtl',
          lang: 'fa',
        });
      }
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
    showToast('آگهی کار با موفقیت ایجاد شد.', 'success');
    if (newJob.isActive && (newJob.paymentStatus === 'paid' || !newJob.paymentStatus)) {
      checkJobAlerts(newJob);
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
      showToast('پرداخت آنلاین ۵۰۰ لیر تایید شد و آگهی شما بلافاصله در سایت منتشر گردید.', 'success');
      checkJobAlerts(newJob);
    } else {
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
            paymentAdminNote: adminNote || 'پرداخت ۵۰۰ لیر تایید شد و آگهی فعال گردید.',
          };
          checkJobAlerts(updated);
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
    const demo = jobSeekers[0] || INITIAL_JOB_SEEKERS[0];
    setCurrentSeekerId(demo.id);
    setRole('jobseeker');
    setActiveTab('jobs');
    showToast(`ورود سریع به حساب کارجو (${demo.fullName}) انجام شد.`, 'info');
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
    const cleanUser = username.trim().toLowerCase();
    const found = partners.find(
      (p) => p.username.toLowerCase() === cleanUser && p.password === password
    );

    if (!found) {
      return { success: false, error: 'نام کاربری یا رمز عبور همکار اشتباه است.' };
    }

    setCurrentPartnerId(found.id);
    setRole('partner');
    setActiveTab('partner');
    showToast(`خوش آمدید، همکار گرامی ${found.fullName} (${found.companyName})`, 'success');
    return { success: true };
  };

  const registerPartner = (input: {
    companyName: string;
    fullName: string;
    phone: string;
    username: string;
    password: string;
    city?: string;
  }): { success: boolean; error?: string } => {
    if (!input.companyName.trim() || !input.fullName.trim() || !input.phone.trim()) {
      return { success: false, error: 'لطفاً نام شرکت/آژانس، نام نماینده و شماره تماس را وارد فرمایید.' };
    }
    if (!input.username.trim() || !input.password.trim()) {
      return { success: false, error: 'تعیین نام کاربری و رمز عبور الزامی است.' };
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
      username: cleanUser,
      password: input.password,
      city: input.city?.trim() || 'استانبول',
      subscriptionStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    };

    setPartners((prev) => [newPartner, ...prev]);
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

    const updatedPartners = partners.map((p) => {
      if (p.id === currentPartner.id) {
        return {
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
      }
      return p;
    });

    setPartners(updatedPartners);

    addAdminNotification({
      type: 'partner_payment',
      title: 'فیش پرداخت حق اشتراک همکار ثبت شد',
      message: `همکار «${currentPartner.companyName}» فیش واریزی برای ${plan.title} (${plan.priceTL.toLocaleString('fa-IR')} لیر) را ارسال نمود. جهت فعال‌سازی بررسی شود.`,
    });

    showToast('رسید پرداخت حق اشتراک ثبت شد و پس از بررسی مدیر فعال می‌گردد.', 'success');
    return { success: true };
  };

  const approvePartnerSubscription = (partnerId: string, note?: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          const plan = partnerPlans.find((pl) => pl.id === p.planId) || DEFAULT_PARTNER_PLANS[0];
          const durationDays = plan.durationMonths * 30;
          const startDate = new Date();
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + durationDays);

          return {
            ...p,
            subscriptionStatus: 'active' as PartnerSubscriptionStatus,
            subscriptionStartDate: startDate.toISOString(),
            subscriptionExpiresAt: expireDate.toISOString(),
            daysRemaining: durationDays,
            adminApprovalNote: note || 'اشتراک توسط مدیریت تایید و فعال شد.',
          };
        }
        return p;
      })
    );

    showToast('اشتراک همکار با موفقیت فعال شد و دسترسی ثبت کارجو باز گردید.', 'success');
  };

  const rejectPartnerSubscription = (partnerId: string, reason: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            subscriptionStatus: 'unpaid' as PartnerSubscriptionStatus,
            adminApprovalNote: reason || 'فیش پرداخت توسط مدیریت رد شد.',
          };
        }
        return p;
      })
    );

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
    if (!currentPartner) {
      return { success: false, error: 'برای ثبت کارجو ابتدا وارد پنل همکار شوید.' };
    }
    if (currentPartner.subscriptionStatus !== 'active') {
      return {
        success: false,
        error: 'اشتراک شما فعال نیست. لطفاً ابتدا یکی از پلن‌های اشتراک را فعال نمایید.',
      };
    }
    if (!input.fullName.trim() || !input.nationalId.trim() || !input.phoneNumber.trim()) {
      return { success: false, error: 'نام و نام خانوادگی، کد ملی و شماره تماس کارجو الزامی است.' };
    }

    const cleanNatId = input.nationalId.replace(/\s/g, '');
    const cleanPhone = input.phone || `${input.phoneCountryCode} ${input.phoneNumber.trim()}`;
    const autoUsername = `seeker_${cleanNatId.slice(-4)}_${Math.floor(100 + Math.random() * 900)}`;
    const autoPassword = `kb${Math.floor(1000 + Math.random() * 9000)}`;

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
      iranAddress: input.iranProvince ? `${input.iranProvince}، ${input.iranCity || ''}` : 'ثبت‌شده در آژانس همکار',
      targetCountry: input.targetCountry,
      targetCity: input.targetCity || 'استانبول',
      turkishLevel: input.turkishLevel,
      residenceStatus: input.residenceStatus,
      skills: input.skills.length > 0 ? input.skills : ['کار عمومی'],
      selectedJobs: input.selectedJobs || [],
      customProfession: input.customProfession || '',
      verificationStatus: 'pending',
      isPaymentVerified: false,
      registeredByRole: 'partner',
      registeredByPartnerId: currentPartner.id,
      registeredByPartnerName: currentPartner.companyName || currentPartner.fullName,
      registeredByPartnerCode: currentPartner.partnerCode,
      isTemporaryRegistration: input.isTemporaryRegistration,
      partnerInternalNote: input.partnerInternalNote,
      createdAt: new Date().toISOString(),
    };

    setJobSeekers((prev) => [newSeeker, ...prev]);

    addAdminNotification({
      type: 'seeker_registered',
      title: input.isTemporaryRegistration
        ? 'پیش‌ثبت‌نام موقت کارجو توسط همکار'
        : 'ثبت‌نام رسمی کارجو توسط همکار',
      message: `کارجو «${newSeeker.fullName}» با کد ملی ${newSeeker.nationalId} توسط همکار ${currentPartner.companyName} (${currentPartner.partnerCode}) ثبت شد.`,
    });

    showToast(
      input.isTemporaryRegistration
        ? `پیش‌ثبت‌نام موقت کارجو «${newSeeker.fullName}» با موفقیت ثبت شد.`
        : `کارجو «${newSeeker.fullName}» با موفقیت ثبت گردید.`,
      'success'
    );

    return { success: true, seekerId: newSeeker.id };
  };

  const switchToDemoPartner = () => {
    setCurrentPartnerId('partner-1');
    setRole('partner');
    setActiveTab('partner');
    showToast('ورود سریع به پنل همکار (آژانس کاریابی و مهاجرتی استانبول پارس) انجام شد.', 'info');
  };

  const activatePartnerInstantly = (partnerId: string) => {
    approvePartnerSubscription(partnerId, 'فعال‌سازی سریع تستی توسط سامانه');
    showToast('اشتراک همکار به صورت تستی و فوری فعال شد!', 'success');
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
        loginSeeker,
        loginAdmin,
        logoutSeeker,
        logoutAdmin,
        changePassword,
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
        logoutPartner,
        submitPartnerSubscriptionPayment,
        approvePartnerSubscription,
        rejectPartnerSubscription,
        updatePartnerPlanPricing,
        updatePartnerPlans,
        registerSeekerByPartner,
        switchToDemoPartner,
        activatePartnerInstantly,
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
