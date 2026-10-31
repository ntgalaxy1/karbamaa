export type AppLanguage = 'fa' | 'tr' | 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: {
    fa: string;
    tr: string;
    en: string;
    ar: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // App Brand & Subtitle
  appName: {
    fa: 'کارباما',
    tr: 'KARBAMA',
    en: 'KARBAMA',
    ar: 'كارناما',
  },
  appSubtitle: {
    fa: 'سامانه کاریابی و اقامت ایرانیان در ترکیه',
    tr: 'Türkiye\'de İranlılar için İş Bulma ve İkamet Platformu',
    en: 'Job Placement & Residency Platform for Iranians in Turkey',
    ar: 'منصة التوظيف والإقامة للإيرانيين في تركيا',
  },

  // Navigation Links
  jobOpportunities: {
    fa: 'فرصت‌های شغلی',
    tr: 'İş Fırsatları',
    en: 'Job Opportunities',
    ar: 'فرص العمل',
  },
  postJob: {
    fa: 'ثبت آگهی استخدام (۵۰۰ لیر)',
    tr: 'İş İlanı Yayınla (500 TL)',
    en: 'Post a Job (500 TL)',
    ar: 'نشر إعلان وظيفة (500 ليرة)',
  },
  partnerSection: {
    fa: 'بخش همکاران',
    tr: 'Ortaklar Bölümü',
    en: 'Partners Section',
    ar: 'قسم الشركاء',
  },
  interactiveMap: {
    fa: 'نقشه تعاملی',
    tr: 'İnteraktif Harita',
    en: 'Interactive Map',
    ar: 'خريطة تفاعلية',
  },
  hotels: {
    fa: 'هتل‌ها و اقامت',
    tr: 'Oteller ve Konaklama',
    en: 'Hotels & Stay',
    ar: 'الفنادق والإقامة',
  },
  myApplications: {
    fa: 'پیگیری درخواست‌ها',
    tr: 'Başvurularımı Takip Et',
    en: 'Track Applications',
    ar: 'متابعة الطلبات',
  },
  adminDashboard: {
    fa: 'مدیریت',
    tr: 'Yönetici Paneli',
    en: 'Admin Dashboard',
    ar: 'لوحة التحكم',
  },
  featuresAndTools: {
    fa: 'امکانات و ابزارها',
    tr: 'Özellikler ve Araçlar',
    en: 'Features & Tools',
    ar: 'الميزات والأدوات',
  },

  // Features Menu Items
  cvBuilder: {
    fa: 'رزومه‌ساز آنلاین (CV)',
    tr: 'Online CV Oluşturucu',
    en: 'Online Resume Builder',
    ar: 'منشئ السيرة الذاتية',
  },
  currencyRates: {
    fa: 'قیمت روز ارز (لیر و دلار)',
    tr: 'Güncel Döviz Kurları (TL & USD)',
    en: 'Live Exchange Rates (TL & USD)',
    ar: 'أسعار العملات المباشرة',
  },
  aboutUs: {
    fa: 'درباره ما و قوانین کارباما',
    tr: 'Hakkımızda ve Kurallar',
    en: 'About Us & Rules',
    ar: 'من نحن والقوانين',
  },
  downloadApk: {
    fa: 'دانلود نسخه اندروید (APK)',
    tr: 'Android Uygulamasını İndir (APK)',
    en: 'Download Android App (APK)',
    ar: 'تنزيل تطبيق أندرويد (APK)',
  },
  themeToggleDark: {
    fa: 'تغییر به تم شب (حالت تاریک 🌙)',
    tr: 'Karanlık Moduna Geç 🌙',
    en: 'Switch to Dark Mode 🌙',
    ar: 'التبديل إلى الوضع الداكن 🌙',
  },
  themeToggleLight: {
    fa: 'تغییر به تم روز (حالت روشن ☀️)',
    tr: 'Aydınlık Moduna Geç ☀️',
    en: 'Switch to Light Mode ☀️',
    ar: 'التبديل إلى الوضع الفاتح ☀️',
  },
  shareApp: {
    fa: 'اشتراک‌گذاری برنامه',
    tr: 'Uygulamayı Paylaş',
    en: 'Share Application',
    ar: 'مشاركة التطبيق',
  },
  themePalette: {
    fa: 'پالت پوسته و سفارشی‌سازی',
    tr: 'Tema ve Renk Özelleştirme',
    en: 'Theme & Color Palette',
    ar: 'تخصيص المظهر والألوان',
  },
  appLanguageLabel: {
    fa: 'زبان برنامه (Language)',
    tr: 'Uygulama Dili (Language)',
    en: 'App Language',
    ar: 'لغة التطبيق',
  },

  // Auth & Roles
  login: {
    fa: 'ورود به حساب',
    tr: 'Giriş Yap',
    en: 'Log In',
    ar: 'تسجيل الدخول',
  },
  register: {
    fa: 'ثبت‌نام کاربر',
    tr: 'Kayıt Ol',
    en: 'Register',
    ar: 'إنشاء حساب',
  },
  logout: {
    fa: 'خروج از حساب',
    tr: 'Çıkış Yap',
    en: 'Log Out',
    ar: 'تسجيل الخروج',
  },
  jobseekerRole: {
    fa: 'کارجو',
    tr: 'İş Arayan',
    en: 'Job Seeker',
    ar: 'باحث عن عمل',
  },
  partnerRole: {
    fa: 'همکار',
    tr: 'Ortak',
    en: 'Partner',
    ar: 'شريك',
  },
  adminRole: {
    fa: 'مدیریت',
    tr: 'Yönetici',
    en: 'Admin',
    ar: 'مدير',
  },

  // Banner & Search Filters
  smartSystemTag: {
    fa: 'سامانه هوشمند کاریابی و اقامت کارباما',
    tr: 'Karbama Akıllı İş ve İkamet Sistemi',
    en: 'Karbama Smart Job Placement System',
    ar: 'منصة التوظيف والإقامة الذكية كارناما',
  },
  postEmployerJobBtn: {
    fa: 'ثبت آگهی استخدام کارفرما (۵۰۰ لیر)',
    tr: 'İşveren İlanı Yayınla (500 TL)',
    en: 'Post Employer Job (500 TL)',
    ar: 'نشر إعلان وظيفي (500 ليرة)',
  },
  jobAlertTitle: {
    fa: 'هشدار استخدام (Job Alert)',
    tr: 'İş Uyarısı (Job Alert)',
    en: 'Job Alert',
    ar: 'تنبيه الوظائف (Job Alert)',
  },
  bannerHeadline: {
    fa: 'کاریابی و استخدام رسمی در ترکیه',
    tr: 'Türkiye\'de Resmi İş Bulma ve İstihdam',
    en: 'Official Job Placement in Turkey',
    ar: 'التوظيف والتنسيق الرسمي في تركيا',
  },
  bannerDescription: {
    fa: 'فرصت‌های شغلی رسمی ترکیه با قابلیت جستجوی دقیق در کلمات کلیدی، نوع قرارداد (پاره وقت و تمام وقت)، شهر، حقوق و نشان‌کردن آگهی‌های دلخواه.',
    tr: 'Anahtar kelimeler, sözleşme türü, şehir, maaş ve kaydetme seçenekleri ile Türkiye\'deki resmi iş fırsatları.',
    en: 'Official job opportunities in Turkey with precise search by keywords, contract type, city, salary, and saving options.',
    ar: 'فرص العمل الرسمية في تركيا مع إمكانية البحث الدقيق في الكلمات المفتاحية، نوع العقد (دوام جزئي وكامل)، المدينة، الراتب وحفظ الوظائف.',
  },
  searchScopeLabel: {
    fa: 'محدوده جستجو:',
    tr: 'Arama Kapsamı:',
    en: 'Search Scope:',
    ar: 'نطاق البحث:',
  },
  searchScopeAll: {
    fa: 'همه بخش‌ها',
    tr: 'Tüm Bölümler',
    en: 'All Fields',
    ar: 'جميع الأقسام',
  },
  searchScopeTitleOnly: {
    fa: 'فقط عنوان شغل',
    tr: 'Sadece İş Unvanı',
    en: 'Job Title Only',
    ar: 'المسمى الوظيفي فقط',
  },
  searchScopeKeywordsOnly: {
    fa: 'فقط کلمات کلیدی',
    tr: 'Sadece Anahtar Kelimeler',
    en: 'Keywords Only',
    ar: 'الكلمات المفتاحية فقط',
  },
  addCustomKeywordPlaceholder: {
    fa: 'افزودن کلیدواژه دلخواه...',
    tr: 'Özel anahtar kelime ekle...',
    en: 'Add custom keyword...',
    ar: 'إضافة كلمة مفتاحية...',
  },
  addBtn: {
    fa: '+ افزودن',
    tr: '+ Ekle',
    en: '+ Add',
    ar: '+ إضافة',
  },
  loggedInAsNotice: {
    fa: 'شما با مشخصات',
    tr: 'Kullanıcı bilgileriyle giriş yaptınız:',
    en: 'Logged in as:',
    ar: 'لقد قمت بتسجيل الدخول باسم',
  },
  fatherNameLabel: {
    fa: 'فرزند',
    tr: 'Baba adı:',
    en: 'Father:',
    ar: 'ابن',
  },
  nationalIdLabel: {
    fa: 'کد ملی:',
    tr: 'Kimlik No:',
    en: 'National ID:',
    ar: 'الرقم الوطني:',
  },
  loggedNoticeEnd: {
    fa: 'وارد شده‌اید.',
    tr: '',
    en: '',
    ar: '.',
  },
  awaitingVerificationBadge: {
    fa: 'در انتظار تایید مدیریت و واریز ۵۰۰ لیر ⏳',
    tr: 'Yönetici onayı ve 500 TL ödeme bekleniyor ⏳',
    en: 'Awaiting admin verification & 500 TL payment ⏳',
    ar: 'في انتظار موافقة الإدارة وإيداع 500 ليرة ⏳',
  },

  // Search & Filter Placeholders
  searchJobsPlaceholder: {
    fa: 'جستجوی عنوان شغل، رده، شهر یا مهارت...',
    tr: 'İş unvanı, kategori, şehir veya beceri ara...',
    en: 'Search job title, category, city, or skills...',
    ar: 'البحث عن المسمى الوظيفي، المدينة، أو المهارات...',
  },
  allCities: {
    fa: 'همه شهرها',
    tr: 'Tüm Şehirler',
    en: 'All Cities',
    ar: 'جميع المدن',
  },
  allCategories: {
    fa: 'همه دسته‌ها',
    tr: 'Tüm Kategoriler',
    en: 'All Categories',
    ar: 'جميع الفئات',
  },
  allContracts: {
    fa: 'همه قراردادها',
    tr: 'Tüm Sözleşmeler',
    en: 'All Contracts',
    ar: 'جميع العقود',
  },
  fullTime: {
    fa: 'تمام وقت',
    tr: 'Tam Zamanlı',
    en: 'Full Time',
    ar: 'دوام كامل',
  },
  partTime: {
    fa: 'پاره وقت',
    tr: 'Yarı Zamanlı',
    en: 'Part Time',
    ar: 'دوام جزئي',
  },
  seasonal: {
    fa: 'فصلی / پروژه‌ای',
    tr: 'Sezonluk / Proje',
    en: 'Seasonal / Project',
    ar: 'موسمي / مشاريع',
  },
  accommodation: {
    fa: 'جای خواب',
    tr: 'Konaklama Dahil',
    en: 'Accommodation Provided',
    ar: 'سكن متوفر',
  },
  foodProvided: {
    fa: 'غذا',
    tr: 'Yemek Dahil',
    en: 'Food Provided',
    ar: 'وجبات متوفرة',
  },
  insuranceSGK: {
    fa: 'بیمه SGK',
    tr: 'SGK Sigorta',
    en: 'SGK Insurance',
    ar: 'تأمين صحي SGK',
  },

  // Common Actions & Badges
  applyNow: {
    fa: 'ارسال درخواست همکاری',
    tr: 'Hemen Başvur',
    en: 'Apply Now',
    ar: 'قدم الآن',
  },
  saveJob: {
    fa: 'نشان کردن',
    tr: 'Kaydet',
    en: 'Save',
    ar: 'حفظ',
  },
  savedJobs: {
    fa: 'آگهی‌های نشان‌شده',
    tr: 'Kaydedilen İlanlar',
    en: 'Saved Jobs',
    ar: 'الوظائف المحفوظة',
  },
  free: {
    fa: 'رایگان',
    tr: 'Ücretsiz',
    en: 'Free',
    ar: 'مجاني',
  },
  liveRates: {
    fa: 'نرخ روز 🟢',
    tr: 'Canlı Kurlar 🟢',
    en: 'Live Rates 🟢',
    ar: 'أسعار مباشرة 🟢',
  },
  close: {
    fa: 'بستن',
    tr: 'Kapat',
    en: 'Close',
    ar: 'إغلاق',
  },
  saveChanges: {
    fa: 'ذخیره تغییرات',
    tr: 'Değişiklikleri Kaydet',
    en: 'Save Changes',
    ar: 'حفظ التغيرات',
  },
  selectLanguage: {
    fa: 'انتخاب زبان سیستم',
    tr: 'Sistem Dilini Seçin',
    en: 'Select App Language',
    ar: 'اختر لغة النظام',
  },
  languageSelectionSubtitle: {
    fa: 'زبان مورد نظر خود را برای استفاده از سامانه کارباما انتخاب کنید',
    tr: 'Karbama platformunu kullanmak için tercih ettiğiniz dili seçin',
    en: 'Select your preferred language to continue using Karbama',
    ar: 'اختر لغتك المفضلة لمتابعة استخدام منصة كارناما',
  },
  continueToApp: {
    fa: 'ادامه و ورود به سامانه',
    tr: 'Devam Et ve Giriş Yap',
    en: 'Continue to Application',
    ar: 'المتابعة والدخول إلى النظام',
  },
};

/**
 * Helper function to translate keys based on selected language
 */
export const t = (key: string, lang: AppLanguage = 'fa'): string => {
  const item = TRANSLATIONS[key];
  if (!item) return key;
  return item[lang] || item['fa'] || key;
};
