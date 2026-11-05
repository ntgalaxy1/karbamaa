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

  // Onboarding & Registration Modal Translations
  appOfficialTag: {
    fa: 'سامانه رسمی کاریابی و اعزام نیروی کار',
    tr: 'Resmi İş Bulma ve İşgücü Sevk Sistemi',
    en: 'Official Job Placement & Recruitment System',
    ar: 'النظام الرسمي للتوظيف وإيفاد العمالة',
  },
  selectLanguagePrompt: {
    fa: 'لطفاً زبان مورد نظر خود را انتخاب کنید (Choose Language):',
    tr: 'Lütfen tercih ettiğiniz dili seçin (Choose Language):',
    en: 'Please select your preferred language (Choose Language):',
    ar: 'يرجى اختيار اللغة المفضلة (Choose Language):',
  },
  startSeekerRegBtn: {
    fa: 'شروع مرحله ثبت‌نام کارجو',
    tr: 'İş Arayan Kaydını Başlat',
    en: 'Start Job Seeker Registration',
    ar: 'بدء مرحله تسجيل الباحث عن عمل',
  },
  existingAccountLoginBtn: {
    fa: 'ورود به حساب کاربری موجود',
    tr: 'Mevcut Hesaba Giriş Yap',
    en: 'Log in to Existing Account',
    ar: 'الدخول إلى حساب موجود',
  },
  regStepIndicator: {
    fa: 'ثبت‌نام کارجو',
    tr: 'İş Arayan Kaydı',
    en: 'Job Seeker Registration',
    ar: 'تسجيل الباحث عن عمل',
  },
  regStepOfFour: {
    fa: 'مرحله',
    tr: 'Adım',
    en: 'Step',
    ar: 'الخطوة',
  },
  regStepOfFourSuffix: {
    fa: 'از ۴ ثبت‌نام کارجو',
    tr: '/ 4 İş Arayan Kaydı',
    en: 'of 4 Job Seeker Registration',
    ar: 'من 4 تسجيل باحث عن عمل',
  },
  regStep1Title: {
    fa: '۱. مشخصات فردی، اکانت و کشور مقصد',
    tr: '1. Kişisel Bilgiler, Hesap ve Hedef Ülke',
    en: '1. Personal Info, Account & Destination Country',
    ar: '1. البيانات الشخصية الحساب ودولة المقصد',
  },
  regStep2Title: {
    fa: '۲. محل سکونت در ایران',
    tr: "2. İran'daki İkamet Adresi",
    en: '2. Residence Address in Iran',
    ar: '2. عنوان السكن في إيران',
  },
  regStep3Title: {
    fa: '۳. بارگذاری مدارک و مهارت‌ها',
    tr: '3. Belgeler ve Beceriler',
    en: '3. Documents Upload & Skills',
    ar: '3. تحميل الوثائق والمهارات',
  },
  regStep4Title: {
    fa: '۴. تعهدنامه تسویه حساب کارگزار و امضا',
    tr: '4. Broker Taahhütnamesi ve İmza',
    en: '4. Broker Commitment & Signature',
    ar: '4. تعهد تسوية حساب الوسيط والتوقيع',
  },
  step1Short: {
    fa: '۱. مشخصات',
    tr: '1. Bilgiler',
    en: '1. Personal',
    ar: '1. البيانات',
  },
  step2Short: {
    fa: '۲. آدرس ایران',
    tr: '2. Adres',
    en: '2. Address',
    ar: '2. العنوان',
  },
  step3Short: {
    fa: '۳. مدارک و شغل',
    tr: '3. Belgeler',
    en: '3. Docs & Jobs',
    ar: '3. الوثائق والوظائف',
  },
  step4Short: {
    fa: '۴. تعهدنامه و امضا',
    tr: '4. Taahhüt',
    en: '4. Commitment',
    ar: '4. التعهد والتوقيع',
  },

  // Country Names and Descriptions
  countryTurkeyName: {
    fa: 'ترکیه (Türkiye)',
    tr: 'Türkiye',
    en: 'Turkey (Türkiye)',
    ar: 'تركيا (Türkiye)',
  },
  countryTurkeyDesc: {
    fa: 'فرصت‌های کاری رستورانی، تولیدی پوشاک، هتل‌ها و چالیشما',
    tr: 'Restoran, tekstil, otel ve çalışma izni fırsatları',
    en: 'Restaurant, apparel manufacturing, hotel & work permit jobs',
    ar: 'فرص عمل في المطاعم، صناعة الملابس، الفنادق وإذن العمل',
  },
  countryArmeniaName: {
    fa: 'ارمنستان (Armenia)',
    tr: 'Ermenistan (Armenia)',
    en: 'Armenia',
    ar: 'أرمينيا (Armenia)',
  },
  countryArmeniaDesc: {
    fa: 'بدون ویزا، هزینه‌های مناسب، مشاغل خدماتی و بازرگانی',
    tr: 'Vizesiz, uygun maliyetler, hizmet ve ticaret sektörleri',
    en: 'Visa-free, affordable costs, service & commercial jobs',
    ar: 'بدون تأشيرة، تكاليف مناسبة، وظائف خدمية وتجارية',
  },
  countryIraqName: {
    fa: 'عراق (Iraq)',
    tr: 'Irak (Iraq)',
    en: 'Iraq',
    ar: 'العراق (Iraq)',
  },
  countryIraqDesc: {
    fa: 'درآمد دلاری در اقلیم کردستان، حوزه‌های فنی و ساختمانی',
    tr: 'Kürdistan bölgesinde dolar kazancı, teknik ve inşaat alanları',
    en: 'USD earnings in Kurdistan region, technical & construction',
    ar: 'دخل بالدولار في إقليم كردستان، المجالات الفنية والبناء',
  },
  countryGermanyName: {
    fa: 'آلمان (Germany)',
    tr: 'Almanya (Germany)',
    en: 'Germany',
    ar: 'ألمانيا (Germany)',
  },
  countryGermanyDesc: {
    fa: 'ویزای فرصت کار (Chancenkarte)، کادر درمان و مهندسی',
    tr: 'Fırsat Kartı vizesi (Chancenkarte), sağlık ve mühendislik',
    en: 'Opportunity Card Visa (Chancenkarte), healthcare & engineering',
    ar: 'تأشيرة فرصة العمل (Chancenkarte)، الكادر الطبي والهندسي',
  },

  // Registration Step 1 Inputs
  step1SectionHeader: {
    fa: 'بخش اول: دریافت مشخصات هویتی، اکانت، شماره کارت واریزکننده و کشور مقصد',
    tr: 'Bölüm 1: Kimlik Bilgileri, Hesap, Kart Numarası ve Hedef Ülke',
    en: 'Part 1: Personal Details, Account, Payer Card & Destination Country',
    ar: 'الجزء الأول: البيانات الشخصية، الحساب، رقم البطاقة ودولة المقصد',
  },
  firstNameInputLabel: {
    fa: 'نام *',
    tr: 'Ad *',
    en: 'First Name *',
    ar: 'الاسم *',
  },
  firstNamePlaceholderText: {
    fa: 'مثال: علی',
    tr: 'Örn: Ali',
    en: 'e.g. Ali',
    ar: 'مثال: علي',
  },
  lastNameInputLabel: {
    fa: 'نام خانوادگی *',
    tr: 'Soyad *',
    en: 'Last Name *',
    ar: 'اسم العائلة *',
  },
  lastNamePlaceholderText: {
    fa: 'مثال: رضایی',
    tr: 'Örn: Yılmaz',
    en: 'e.g. Rezaei',
    ar: 'مثال: رضائي',
  },
  fatherNameInputLabel: {
    fa: 'نام پدر *',
    tr: 'Baba Adı *',
    en: "Father's Name *",
    ar: 'اسم الأب *',
  },
  fatherNamePlaceholderText: {
    fa: 'مثال: حسین',
    tr: 'Örn: Ahmet',
    en: 'e.g. Hossein',
    ar: 'مثال: حسين',
  },
  nationalIdInputLabel: {
    fa: 'کد ملی یا شماره پاسپورت *',
    tr: 'Kimlik veya Pasaport No *',
    en: 'National ID or Passport No *',
    ar: 'الرقم الوطني أو رقم الجواز *',
  },
  nationalIdPlaceholderText: {
    fa: 'کد ملی ۱۰ رقمی یا شماره پاسپورت',
    tr: 'Kimlik veya Pasaport No',
    en: 'National ID or Passport No',
    ar: 'الرقم الوطني أو رقم الجواز',
  },
  mobileWhatsAppInputLabel: {
    fa: 'شماره موبایل / واتساپ *',
    tr: 'Cep Telefonu / WhatsApp *',
    en: 'Mobile / WhatsApp Number *',
    ar: 'رقم الجوال / واتساب *',
  },
  payerCardNumberInputLabel: {
    fa: 'شماره کارت ۱۶ رقمی واریزکننده (مشتری) *',
    tr: '16 Haneli Gönderici Kart Numarası *',
    en: '16-digit Payer Card Number (Customer) *',
    ar: 'رقم بطاقة الدافع (16 رقم) *',
  },
  usernameInputLabel: {
    fa: 'نام کاربری جهت ورود *',
    tr: 'Giriş Kullanıcı Adı *',
    en: 'Account Username for Login *',
    ar: 'اسم المستخدم للدخول *',
  },
  usernamePlaceholderText: {
    fa: 'مثال: ali_karbama',
    tr: 'Örn: ali_karbama',
    en: 'e.g. ali_karbama',
    ar: 'مثال: ali_karbama',
  },
  passwordInputLabel: {
    fa: 'رمز عبور دلخواه *',
    tr: 'Parola *',
    en: 'Password *',
    ar: 'كلمة المرور *',
  },
  passwordPlaceholderText: {
    fa: 'حداقل ۴ کاراکتر',
    tr: 'En az 4 karakter',
    en: 'Min 4 characters',
    ar: '4 أحرف على الأقل',
  },
  genderSelectorLabel: {
    fa: 'تعیین جنسیت *',
    tr: 'Cinsiyet Seçimi *',
    en: 'Select Gender *',
    ar: 'تحديد الجنس *',
  },
  genderMaleText: {
    fa: 'آقا 👨',
    tr: 'Erkek 👨',
    en: 'Male 👨',
    ar: 'رجل 👨',
  },
  genderFemaleText: {
    fa: 'خانم 👩',
    tr: 'Kadın 👩',
    en: 'Female 👩',
    ar: 'امرأة 👩',
  },
  destinationCountryLabel: {
    fa: 'انتخاب کشور مقصد کاریابی *',
    tr: 'Hedef İş Ülkesi Seçimi *',
    en: 'Select Destination Country *',
    ar: 'اختيار دولة المقصد للعمل *',
  },
  nextStepAddressBtn: {
    fa: 'مرحله بعد: محل سکونت در ایران',
    tr: "Sonraki Adım: İran'daki Adres",
    en: 'Next: Residence Address in Iran',
    ar: 'المرحلة التالية: عنوان السكن في إيران',
  },

  // Step 2 Inputs
  step2SectionHeader: {
    fa: 'بخش دوم: دریافت آدرس دقیق محل سکونت مختص ایران',
    tr: "Bölüm 2: İran'daki Açık İkamet Adresi Bilgileri",
    en: 'Part 2: Exact Residence Address in Iran',
    ar: 'الجزء الثاني: عنوان السكن التفصيلي في إيران',
  },
  provinceInputLabel: {
    fa: 'استان محل سکونت در ایران *',
    tr: "İran'daki İkamet Eyaleti *",
    en: 'Province in Iran *',
    ar: 'المحافظة في إيران *',
  },
  cityInputLabel: {
    fa: 'شهرستان / شهر محل سکونت *',
    tr: 'İlçe / Şehir *',
    en: 'City / District *',
    ar: 'المدينة / القضاء *',
  },
  addressInputLabel: {
    fa: 'آدرس دقیق پستی و محل سکونت در ایران *',
    tr: "İran'daki Açık Posta Adresi *",
    en: 'Full Postal Address in Iran *',
    ar: 'العنوان البريدي الكامل في إيران *',
  },
  addressPlaceholderText: {
    fa: 'مثال: خیابان شریعتی، بالاتر از سیدخندان، پلاک ۱۲۴، واحد ۳',
    tr: 'Örn: Şeriati Cad. No: 124 Daire: 3',
    en: 'e.g. Shariati St., No. 124, Apt 3',
    ar: 'مثال: شارع شريعتي، بناء 124، شقة 3',
  },
  prevStepBtnText: {
    fa: 'مرحله قبل',
    tr: 'Önceki Adım',
    en: 'Previous Step',
    ar: 'المرحلة السابقة',
  },
  nextStepDocsBtn: {
    fa: 'مرحله بعد: مدارک و مهارت‌ها',
    tr: 'Sonraki: Belgeler ve Beceriler',
    en: 'Next: Documents & Skills',
    ar: 'المرحلة التالية: الوثائق والمهارات',
  },

  // Step 3 Inputs
  step3SectionHeader: {
    fa: 'بخش سوم: بارگذاری مدارک پرسنلی + مهارت‌ها و شغل درخواستی (دارای دو قسمت مجزا)',
    tr: 'Bölüm 3: Personel Belgeleri ve İstenen Beceriler',
    en: 'Part 3: Document Uploads + Skills & Requested Jobs',
    ar: 'الجزء الثالث: تحميل الوثائق والمهارات المطلوبة',
  },
  part1DocsTitle: {
    fa: 'قسمت اول: بارگذاری مدارک هویتی',
    tr: 'Bölüm 1: Kimlik Belgeleri Yükleme',
    en: 'Part 1: Identity Documents Upload',
    ar: 'الجزء الأول: تحميل الوثائق الشخصية',
  },
  fullBodyPhotoLabel: {
    fa: 'عکس تمام قد ایستاده',
    tr: 'Tam Boy Ayakta Fotoğraf',
    en: 'Standing Full-Body Photo',
    ar: 'صورة كاملة القامة',
  },
  fullBodyGuideTitle: {
    fa: 'راهنمای عکس تمام قد:',
    tr: 'Boy Fotoğrafı Kuralları:',
    en: 'Full-Body Photo Rules:',
    ar: 'إرشادات الصورة الكاملة:',
  },
  fullBodyRule1: {
    fa: '• خانم‌ها بدون آرایش',
    tr: '• Kadınlar makyajsız',
    en: '• Females without heavy makeup',
    ar: '• النساء بدون مكياج',
  },
  fullBodyRule2: {
    fa: '• آقایان بدون ریش بلند (حداکثر ته‌ریش)',
    tr: '• Erkekler sakalsız veya hafif sakallı',
    en: '• Males neat / trimmed stubble',
    ar: '• الرجال بدون لحية طويلة',
  },
  fullBodyRule3: {
    fa: '• تمام قد، واضح، بدون فیلتر با لباس مرتب',
    tr: '• Net, filtresiz, düzgün kıyafetli',
    en: '• Clear, unfiltered, neat outfit',
    ar: '• قامة كاملة، واضحة، بدون فلاتر',
  },
  selectFullBodyPhotoBtn: {
    fa: 'انتخاب عکس تمام قد',
    tr: 'Boy Fotoğrafı Seç',
    en: 'Select Full-Body Photo',
    ar: 'اختيار صورة كاملة القامة',
  },
  passportPhotoLabel: {
    fa: 'عکس صفحه اول پاسپورت (ضروری *)',
    tr: 'Pasaport İlk Sayfası Fotoğrafı (Zorunlu *)',
    en: 'Passport First Page Photo (Required *)',
    ar: 'صورة الصفحة الأولى من جواز السفر (إلزامي *)',
  },
  passportPhotoDescText: {
    fa: 'تصویر واضح از صفحه اول پاسپورت به طوری که هر چهارگوشه پاسپورت کاملاً داخل کادر مشخص باشد',
    tr: 'Pasaportun 4 köşesi de net görünecek şekilde ilk sayfasının net fotoğrafı',
    en: 'Clear image of passport first page with all 4 corners fully visible',
    ar: 'صورة واضحة للصفحة الأولى مع ظهور الزوايا الأربع للجواز بالكامل',
  },
  selectPassportPhotoBtn: {
    fa: 'انتخاب عکس پاسپورت (۴ گوشه مشخص)',
    tr: 'Pasaport Fotoğrafı Seç (4 Köşe Görünür)',
    en: 'Select Passport Photo (4 Corners Visible)',
    ar: 'اختيار صورة الجواز (4 زوايا واضحة)',
  },
  part2SkillsTitle: {
    fa: 'قسمت دوم: مهارت‌ها و شغل درخواستی (دو بخش مجزا)',
    tr: 'Bölüm 2: Beceriler ve İstenen İş (İki Ayrı Kısım)',
    en: 'Part 2: Skills & Requested Job (Two Sections)',
    ar: 'الجزء الثاني: المهارات والوظائف المطلوبة',
  },
  part2SkillsSubtitle: {
    fa: 'بخش اول: انتخاب از منوی تمامی شغل‌های رایج با تیک‌گذاری | بخش دوم: نوشتن دستی توسط شما',
    tr: 'Kısım 1: Yaygın işler menüsünden seçim | Kısım 2: El yazısı açıklama',
    en: 'Section 1: Select from common jobs checklist | Section 2: Write custom experience',
    ar: 'الجزء الأول: الاختيار من القائمة | الجزء الثاني: كتابة الملاحظات',
  },
  commonJobsSectionTitle: {
    fa: 'بخش اول: منوی شغل‌های رایج (قابل تیک‌گذاری از جزء تا کل)',
    tr: 'Kısım 1: Yaygın İşler Menüsü (Seçmeli)',
    en: 'Section 1: Common Jobs Menu (Checklist)',
    ar: 'الجزء الأول: قائمة الوظائف الشائعة',
  },
  openJobsMenuBtn: {
    fa: 'باز کردن منوی شغل‌ها',
    tr: 'İş Menüsünü Aç',
    en: 'Open Jobs Menu',
    ar: 'فتح قائمة الوظائف',
  },
  closeJobsMenuBtn: {
    fa: 'بستن منو',
    tr: 'Menüyü Kapat',
    en: 'Close Menu',
    ar: 'إغلاق القائمة',
  },
  selectedCountText: {
    fa: 'انتخاب شده',
    tr: 'seçildi',
    en: 'selected',
    ar: 'محدد',
  },
  jobSearchInputPlaceholder: {
    fa: 'جستجوی سریع میان شغل‌ها (آشپز، چرخکار، برقکار، باریستا، آرایشگر)...',
    tr: 'Hızlı iş araması (aşçı, terzi, elektrikçi, barista, kuaför)...',
    en: 'Quick search jobs (chef, tailor, electrician, barista, barber)...',
    ar: 'بحث سريع بين الوظائف (طباخ، خياط، كهربائي، بارستا)...',
  },
  manualSkillsSectionTitle: {
    fa: 'بخش دوم: نوشتن توسط ثبت‌نام‌کننده (شغل درخواستی و سوابق)',
    tr: 'Kısım 2: Başvuran Tarafından Yazılan (Açıklama & Deneyim)',
    en: 'Section 2: Written by registrant (Experience & Job details)',
    ar: 'الجزء الثاني: كتابة المتقدم (الخبرات والوظائف)',
  },
  manualSkillsPlaceholderText: {
    fa: 'اگر سوابق یا شغل خاصی مد نظرتان است در اینجا بنویسید (مثلاً: ۵ سال سابقه کباب‌زنی، آشنایی با ترکی)...',
    tr: 'Özel bir deneyiminiz varsa yazınız (örn: 5 yıl aşçılık deneyimi)...',
    en: 'Write any specific experience or job preference (e.g. 5 years chef experience, basic Turkish)...',
    ar: 'اكتب أي خبرة خاصة أو تخصص (مثال: 5 سنوات خبرة طباخ، معرفة بالتركية)...',
  },
  nextStepCommitmentBtn: {
    fa: 'مرحله بعد: تعهدنامه و امضا',
    tr: 'Sonraki: Taahhütname ve İmza',
    en: 'Next: Commitment & Signature',
    ar: 'المرحلة التالية: التعهد والتوقيع',
  },

  // Step 4 Inputs
  step4SectionHeader: {
    fa: 'بخش چهارم: مطالعه، تایید و امضای تعهدنامه حقوقی تسویه حساب کارگزار',
    tr: 'Bölüm 4: Broker Hesap Kapatma Taahhütnamesini İnceleme ve İmzalama',
    en: 'Part 4: Review, confirm & electronically sign broker settlement commitment',
    ar: 'الجزء الرابع: مراجعة وتوقيع تعهد تسوية حساب الوسيط',
  },
  commitmentCardTitle: {
    fa: 'تعهدنامه تسویه حساب هزینه کارگزار',
    tr: 'Broker Ücreti Hesap Kapatma Taahhüdü',
    en: 'Broker Settlement Fee Legal Commitment',
    ar: 'تعهد تسوية رسوم الوسيط',
  },
  legalRequiredBadgeText: {
    fa: 'الزامی حقوقی',
    tr: 'Yasal Zorunluluk',
    en: 'Legal Requirement',
    ar: 'إلزامي قانونياً',
  },
  commitmentCardDescText: {
    fa: 'این سند به منزله تسویه حساب کامل هزینه خدمات کارگزار، مشاوره و معرفی به کارفرما می‌باشد. جهت مشاهده متن کامل با فونت درشت، مشخصات متقاضی و رسم امضا کلیک نمایید.',
    tr: 'Bu belge broker hizmetleri, danışmanlık ve işveren tanıtım ücretlerinin tam tasfiyesi niteliğindedir.',
    en: 'This document constitutes full settlement of broker services, consultation, and employer placement fees.',
    ar: 'تعتبر هذه الوثيقة تسوية كاملة لرسوم خدمات الوسيط والاستشارة وإحالة المتقدم.',
  },
  openCommitmentModalBtn: {
    fa: 'مشاهده و امضای الکترونیکی تعهدنامه تسویه حساب کارگزار',
    tr: 'Taahhütnameyi Görüntüle ve Elektronik Olarak İmzala',
    en: 'View & Electronically Sign Broker Commitment',
    ar: 'عرض والتوقيع الإلكتروني على التعهد',
  },
  signatureSuccessText: {
    fa: 'امضای دیجیتال شما با موفقیت به تعهدنامه پیوست گردید ✓',
    tr: 'Dijital imzanız taahhütnameye başarıyla eklendi ✓',
    en: 'Your digital signature has been successfully attached ✓',
    ar: 'تم إرفاق توقيعك الرقمي بنجاح ✓',
  },
  acceptTermsCheckboxLabel: {
    fa: 'قوانین، ضوابط کاریابی و مفاد تعهدنامه فوق را می‌پذیرم.',
    tr: 'Kuralları, iş bulma şartlarını ve taahhütname hükümlerini kabul ediyorum.',
    en: 'I accept the rules, recruitment terms, and commitment conditions.',
    ar: 'أوافق على القوانين وشروط التوظيف وأحكام التعهد أعلاه.',
  },
  completeRegistrationBtn: {
    fa: 'تکمیل ثبت‌نام و ارجاع پرونده به مدیر',
    tr: 'Kaydı Tamamla ve Gönder',
    en: 'Complete Registration & Submit to Admin',
    ar: 'إكمال التسجيل وإحالة الملف للمدير',
  },

  // Login Modal Translations
  loginModalHeadline: {
    fa: 'ورود به سامانه کارباما',
    tr: 'Karbama Sistemine Giriş',
    en: 'Login to Karbama System',
    ar: 'الدخول إلى نظام كارناما',
  },
  loginModalSubtitle: {
    fa: 'لطفاً نام کاربری و رمز عبور خود را وارد نمایید',
    tr: 'Lütfen kullanıcı adı ve parolanızı giriniz',
    en: 'Please enter your username and password',
    ar: 'يرجى إدخال اسم المستخدم وكلمة المرور',
  },
  loginUsernameInputLabel: {
    fa: 'نام کاربری (Username)',
    tr: 'Kullanıcı Adı (Username)',
    en: 'Username',
    ar: 'اسم المستخدم (Username)',
  },
  loginUsernamePlaceholderText: {
    fa: 'نام کاربری...',
    tr: 'Kullanıcı adı...',
    en: 'Username...',
    ar: 'اسم المستخدم...',
  },
  loginPasswordInputLabel: {
    fa: 'رمز عبور (Password)',
    tr: 'Parola (Password)',
    en: 'Password',
    ar: 'كلمة المرور (Password)',
  },
  loginPasswordPlaceholderText: {
    fa: 'رمز عبور...',
    tr: 'Parola...',
    en: 'Password...',
    ar: 'كلمة المرور...',
  },
  loginSubmitBtnText: {
    fa: 'ورود به حساب کاربری',
    tr: 'Hesaba Giriş Yap',
    en: 'Log In to Account',
    ar: 'الدخول إلى الحساب',
  },
  noAccountRegBtnText: {
    fa: 'حساب ندارید؟ ثبت‌نام کارجو',
    tr: 'Hesabınız yok mu? İş Arayan Kaydı',
    en: 'No account? Register as Job Seeker',
    ar: 'ليس لديك حساب؟ تسجيل باحث عن عمل',
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
