import { AppLanguage } from '../types';
import { safeStorage } from './safeStorage';

const PERSIAN_CHAR_REGEX = /[\u0600-\u06FF]/;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function convertDigitsByLang(text: string, lang: AppLanguage): string {
  if (lang === 'fa') return text;
  if (lang === 'en' || lang === 'tr') {
    let out = text;
    for (let i = 0; i < 10; i++) {
      out = out.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i));
    }
    return out;
  }
  return text;
}

// Comprehensive Phrase Dictionary (Persian -> { tr, en, ar })
const PHRASE_DICT: Array<[string, { tr: string; en: string; ar: string }]> = [
  [
    'کارجویان گرامی: برای ارسال خودکار مشخصات (نام، نام پدر، کد ملی و سوابق) به کارفرما، ابتدا ثبت‌نام کنید.',
    {
      tr: 'Değerli iş arayanlar: Bilgilerinizi (ad, baba adı, kimlik no ve geçmiş) işverene otomatik göndermek için önce kayıt olun.',
      en: 'Dear job seekers: To automatically send your profile (name, ID, and resume) to employers, please register first.',
      ar: 'أعزائي الباحثين عن عمل: لإرسال بياناتكم تلقائياً إلى صاحب العمل، يرجى التسجيل أولاً.',
    },
  ],
  [
    'امکان ثبت آگهی شغلی جدید با مشخصات کامل (بیمه، غذا، جای خواب و...) و ویرایش/حذف تمام آگهی‌ها در اختیار شماست.',
    {
      tr: 'Tüm detaylarıyla (sigorta, yemek, konaklama vb.) yeni iş ilanı ekleme ve tüm ilanları düzenleme/silme yetkisi sizdedir.',
      en: 'You have full access to post new job listings with complete details (insurance, meals, accommodation) and edit/delete all ads.',
      ar: 'يمكنك إضافة إعلانات وظائف جديدة بكافة التفاصيل (التأمين، الطعام، السكن) وتعديل أو حذف جميع الإعلانات.',
    },
  ],
  [
    'دسته‌بندی‌های شغلی مورد علاقه خود را انتخاب کنید تا به محض ثبت آگهی جدید در آن دسته، نوتیفیکیشن فوری دریافت نمایید:',
    {
      tr: 'Favori iş kategorilerinizi seçin; bu kategorilerde yeni ilan eklendiğinde anında bildirim alın:',
      en: 'Select your favorite job categories to receive instant notifications whenever a new job is posted in that category:',
      ar: 'اختر فئات الوظائف المفضلة لديك لتلقي إشعار فوري بمجرد نشر وظيفة جديدة في تلك الفئة:',
    },
  ],
  [
    'پنل مدیریت فرصت‌های شغلی فعال است',
    {
      tr: 'İş Fırsatları Yönetim Paneli Aktif',
      en: 'Job Opportunities Admin Panel is Active',
      ar: 'لوحة إدارة فرص العمل نشطة',
    },
  ],
  [
    '+ ثبت آگهی استخدام / موقعیت شغلی جدید',
    {
      tr: '+ Yeni İş İlanı / Pozisyon Ekle',
      en: '+ Post New Job Ad / Vacancy',
      ar: '+ تسجيل إعلان توظيف / وظيفة جديدة',
    },
  ],
  [
    '+ ثبت آگهی استخدام / موقعیت شغلی',
    {
      tr: '+ İş İlanı / Pozisyon Ekle',
      en: '+ Post Job Ad / Vacancy',
      ar: '+ نشر إعلان توظيف / شاغر وظيفي',
    },
  ],
  [
    'ثبت‌نام کارجو',
    {
      tr: 'İş Arayan Kaydı',
      en: 'Job Seeker Sign Up',
      ar: 'تسجيل باحث عن عمل',
    },
  ],
  [
    'همه فرصت‌های شغلی ترکیه',
    {
      tr: 'Türkiye Tüm İş Fırsatları',
      en: 'All Turkey Job Opportunities',
      ar: 'جميع فرص العمل في تركيا',
    },
  ],
  [
    'کارهای نشان‌شده من (Saved Jobs)',
    {
      tr: 'Kaydedilen İşlerim (Saved Jobs)',
      en: 'My Saved Jobs',
      ar: 'الوظائف المحفوظة (Saved Jobs)',
    },
  ],
  [
    'سیستم اعلانات دسته‌بندی‌های شغلی مورد علاقه',
    {
      tr: 'Favori İş Kategorileri Bildirim Sistemi',
      en: 'Favorite Job Categories Alert System',
      ar: 'نظام إشعارات فئات الوظائف المفضلة',
    },
  ],
  [
    'تنظیمات پیشرفته هشدار',
    {
      tr: 'Gelişmiş Bildirim Ayarları',
      en: 'Advanced Alert Settings',
      ar: 'إعدادات التنبيه المتقدمة',
    },
  ],
  [
    'وضعیت حساب کارجو: در انتظار پرداخت هزینه خدمات و تایید مدیریت',
    {
      tr: 'Hesap Durumu: Hizmet Ücreti Ödemesi ve Yönetici Onayı Bekleniyor',
      en: 'Account Status: Awaiting Service Fee Payment & Admin Approval',
      ar: 'حالة الحساب: بانتظار دفع رسوم الخدمة وموافقة الإدارة',
    },
  ],
  [
    'حساب فعال و تاییدشده ✓',
    {
      tr: 'Aktif ve Onaylı Hesap ✓',
      en: 'Active & Verified Account ✓',
      ar: 'حساب نشط ومعتمد ✓',
    },
  ],
  [
    'داشبورد مدیر',
    {
      tr: 'Yönetici Paneli',
      en: 'Admin Dashboard',
      ar: 'لوحة المدير',
    },
  ],
  [
    'رزومه‌ساز آنلاین',
    {
      tr: 'Online CV Oluşturucu',
      en: 'Online CV Builder',
      ar: 'منشئ السيرة الذاتية',
    },
  ],
  [
    'به زودی اضافه خواهد شد',
    {
      tr: 'Yakında Eklenecek',
      en: 'Coming Soon',
      ar: 'سيتم إضافته قريباً',
    },
  ],
  [
    'مشاهده و ویرایش پروفایل',
    {
      tr: 'Profili Görüntüle ve Düzenle',
      en: 'View & Edit Profile',
      ar: 'عرض وتعديل الملف الشخصي',
    },
  ],
  [
    'خروج از حساب کاربری',
    {
      tr: 'Hesaptan Çıkış Yap',
      en: 'Log Out',
      ar: 'تسجيل الخروج',
    },
  ],
  [
    'جدول زنده قیمت ارزهای آزاد (به‌روزرسانی لحظه‌ای)',
    {
      tr: 'Canlı Döviz Kurları Tablosu (Anlık Güncelleme)',
      en: 'Live Exchange Rates Table (Real-Time Update)',
      ar: 'جدول أسعار الصرف المباشر (تحديث فوري)',
    },
  ],
  [
    'قیمت زنده ارز آزاد (دلار، یورو، درهم، پوند و لیر ترکیه)',
    {
      tr: 'Canlı Serbest Piyasa Döviz Kurları (USD, EUR, AED, GBP ve TRY)',
      en: 'Live Market Currency Rates (USD, EUR, AED, GBP & TRY)',
      ar: 'أسعار العملات الحية (الدولار، اليورو، الدرهم، الجنيه والليرة التركية)',
    },
  ],
  [
    'به‌روزرسانی قیمت‌ها',
    {
      tr: 'Fiyatları Güncelle',
      en: 'Refresh Live Rates',
      ar: 'تحديث الأسعار',
    },
  ],
  [
    'ماشین‌حساب تبدیل آنی ارز به ریال و تومان',
    {
      tr: 'Anlık Döviz - Riyal ve Tümen Çevirici',
      en: 'Instant Currency to Rial & Toman Calculator',
      ar: 'حاسبة تحويل العملات الفورية إلى الريال والتومان',
    },
  ],
  [
    'فیلترهای پیشرفته جستجو',
    {
      tr: 'Gelişmiş Arama Filtreleri',
      en: 'Advanced Search Filters',
      ar: 'فلاتر البحث المتقدمة',
    },
  ],
  [
    'پاک کردن فیلترها',
    {
      tr: 'Filtreleri Temizle',
      en: 'Reset Filters',
      ar: 'مسح الفلاتر',
    },
  ],
  [
    'مشاهده جزئیات و ارسال درخواست',
    {
      tr: 'Detayları Gör ve Başvur',
      en: 'View Details & Apply',
      ar: 'عرض التفاصيل والتقديم',
    },
  ],
  [
    'ارسال درخواست استخدام',
    {
      tr: 'İş Başvurusu Gönder',
      en: 'Submit Job Application',
      ar: 'إرسال طلب التوظيف',
    },
  ],
  [
    'جای خواب رایگان',
    {
      tr: 'Ücretsiz Konaklama',
      en: 'Free Accommodation',
      ar: 'سكن مجاني',
    },
  ],
  [
    '۳ وعده غذا',
    {
      tr: '3 Öğün Yemek',
      en: '3 Meals Included',
      ar: '3 وجبات طعام',
    },
  ],
  [
    'بیمه و مجوز کار',
    {
      tr: 'Sigorta ve Çalışma İzni',
      en: 'Insurance & Work Permit',
      ar: 'التأمين وتصريح العمل',
    },
  ],
  [
    'تمام وقت (Full-Time)',
    {
      tr: 'Tam Zamanlı (Full-Time)',
      en: 'Full-Time',
      ar: 'دوام كامل (Full-Time)',
    },
  ],
  [
    'پاره وقت (Part-Time)',
    {
      tr: 'Yarı Zamanlı (Part-Time)',
      en: 'Part-Time',
      ar: 'دوام جزئي (Part-Time)',
    },
  ],
  [
    'فصلی / پروژه‌ای (Seasonal)',
    {
      tr: 'Mevsimlik / Proje (Seasonal)',
      en: 'Seasonal / Project',
      ar: 'موسمي / مشروع (Seasonal)',
    },
  ],
  [
    'بدون نیاز به زبان ترکی',
    {
      tr: 'Türkçe Bilmek Gerekmiyor',
      en: 'No Turkish Required',
      ar: 'لا يتطلب اللغة التركية',
    },
  ],
  [
    'ترکی مقدماتی / پایه',
    {
      tr: 'Temel Seviye Türkçe',
      en: 'Basic Turkish',
      ar: 'تركية مبتدئة / أساسية',
    },
  ],
  [
    'ترکی متوسط',
    {
      tr: 'Orta Seviye Türkçe',
      en: 'Intermediate Turkish',
      ar: 'تركية متوسطة',
    },
  ],
  [
    'ترکی پیشرفته و مسلط',
    {
      tr: 'İleri Seviye / Akıcı Türkçe',
      en: 'Fluent Turkish',
      ar: 'تركية متقدمة وبطلاقة',
    },
  ],
  [
    'همه شهرها',
    {
      tr: 'Tüm Şehirler',
      en: 'All Cities',
      ar: 'جميع المدن',
    },
  ],
  [
    'همه عناوین',
    {
      tr: 'Tüm Başlıklar',
      en: 'All Titles',
      ar: 'جميع العناوين',
    },
  ],
  [
    'همه منطقه‌ها',
    {
      tr: 'Tüm Bölgeler',
      en: 'All Districts',
      ar: 'جميع المناطق',
    },
  ],
  [
    'ورود به پنل کاربری و پرونده من',
    {
      tr: 'Kullanıcı Paneline ve Dosyama Git',
      en: 'Go to My User Panel & Dossier',
      ar: 'الدخول إلى لوحة المستخدم وملفي',
    },
  ],
  [
    'مشاهده آگهی‌های شغلی',
    {
      tr: 'İş İlanlarını Görüntüle',
      en: 'Browse Job Listings',
      ar: 'عرض إعلانات الوظائف',
    },
  ],
];

// Word/Token Dictionary for Compositional Translation of Dynamic & Newly Added Content
const TOKEN_DICT: Array<[string, { tr: string; en: string; ar: string }]> = [
  ['رستوران و کافه', { tr: 'Restoran & Kafe', en: 'Restaurant & Cafe', ar: 'مطعم ومقهى' }],
  ['ساختمان و فنی', { tr: 'İnşaat & Teknik', en: 'Construction & Technical', ar: 'البناء والفني' }],
  ['پوشاک و خیاطی', { tr: 'Tekstil & Terzilik', en: 'Apparel & Tailoring', ar: 'الملابس والخياطة' }],
  ['صنعتی و کارخانه', { tr: 'Sanayi & Fabrika', en: 'Industrial & Factory', ar: 'صناعي ومصنع' }],
  ['هتل و گردشگری', { tr: 'Otel & Turizm', en: 'Hotel & Tourism', ar: 'فندق وسياحة' }],
  ['زیبایی و آرایشگری', { tr: 'Güzellik & Kuaför', en: 'Beauty & Salon', ar: 'التجميل والحلاقة' }],
  ['فروش و بازاریابی', { tr: 'Satış & Pazarlama', en: 'Sales & Marketing', ar: 'المبيعات والتسويق' }],
  ['حمل و نقل و راننده', { tr: 'Ulaşım & Şoför', en: 'Transport & Driver', ar: 'النقل والسائق' }],
  ['خدمات و نظافت', { tr: 'Hizmet & Temizlik', en: 'Services & Cleaning', ar: 'الخدمات والتنظيف' }],
  ['پزشکی و پرستاری', { tr: 'Sağlık & Hemşirelik', en: 'Medical & Nursing', ar: 'الطب والتمريض' }],
  ['فناوری اطلاعات و اداری', { tr: 'Bilişim & Ofis', en: 'IT & Office', ar: 'تكنولوجيا المعلومات والمكاتب' }],
  ['دلار آمریکا', { tr: 'ABD Doları', en: 'US Dollar', ar: 'الدولار الأمريكي' }],
  ['یورو اروپا', { tr: 'Avrupa Eurosu', en: 'Euro', ar: 'اليورو الأوروبي' }],
  ['درهم امارات', { tr: 'BAE Dirhemi', en: 'UAE Dirham', ar: 'الدرهم الإماراتي' }],
  ['پوند انگلیس', { tr: 'İngiliz Sterlini', en: 'British Pound', ar: 'الجنيه الإسترليني' }],
  ['لیر ترکیه', { tr: 'Türk Lirası', en: 'Turkish Lira', ar: 'الليرة التركية' }],
  ['دسته فعال', { tr: 'Aktif Kategori', en: 'Active Categories', ar: 'فئة نشطة' }],
  ['استانبول', { tr: 'İstanbul', en: 'Istanbul', ar: 'إسطنبول' }],
  ['آنکارا', { tr: 'Ankara', en: 'Ankara', ar: 'أنقرة' }],
  ['ازمیر', { tr: 'İzmir', en: 'Izmir', ar: 'إزمير' }],
  ['آنتالیا', { tr: 'Antalya', en: 'Antalya', ar: 'أنطاليا' }],
  ['بورسا', { tr: 'Bursa', en: 'Bursa', ar: 'بورصة' }],
  ['آلانیا', { tr: 'Alanya', en: 'Alanya', ar: 'ألانيا' }],
  ['قونیه', { tr: 'Konya', en: 'Konya', ar: 'قونيا' }],
  ['ترابزون', { tr: 'Trabzon', en: 'Trabzon', ar: 'طرابزون' }],
  ['وان', { tr: 'Van', en: 'Van', ar: 'وان' }],
  ['فاتیح', { tr: 'Fatih', en: 'Fatih', ar: 'الفاتح' }],
  ['اسنیورت', { tr: 'Esenyurt', en: 'Esenyurt', ar: 'إسنيورت' }],
  ['شیشلی', { tr: 'Şişli', en: 'Sisli', ar: 'شيشلي' }],
  ['کادیکوی', { tr: 'Kadıköy', en: 'Kadikoy', ar: 'كاديكوي' }],
  ['بشیکتاش', { tr: 'Beşiktaş', en: 'Besiktas', ar: 'بشكتاش' }],
  ['تکسیم', { tr: 'Taksim', en: 'Taksim', ar: 'تقسيم' }],
  ['بی‌اوغلو', { tr: 'Beyoğlu', en: 'Beyoglu', ar: 'بي أوغلو' }],
  ['باغجیلار', { tr: 'Bağcılar', en: 'Bagcilar', ar: 'باغجلار' }],
  ['زیتون‌بورنو', { tr: 'Zeytinburnu', en: 'Zeytinburnu', ar: 'زيتون بورنو' }],
  ['ترکیه', { tr: 'Türkiye', en: 'Turkey', ar: 'تركيا' }],
  ['ارمنستان', { tr: 'Ermenistan', en: 'Armenia', ar: 'أرمينيا' }],
  ['عراق', { tr: 'Irak', en: 'Iraq', ar: 'العراق' }],
  ['آلمان', { tr: 'Almanya', en: 'Germany', ar: 'ألمانيا' }],
  ['ایران', { tr: 'İran', en: 'Iran', ar: 'إيران' }],
  ['تهران', { tr: 'Tahran', en: 'Tehran', ar: 'طهران' }],
  ['تمام وقت', { tr: 'Tam Zamanlı', en: 'Full-Time', ar: 'دوام كامل' }],
  ['پاره وقت', { tr: 'Yarı Zamanlı', en: 'Part-Time', ar: 'دوام جزئي' }],
  ['فصلی', { tr: 'Mevsimlik', en: 'Seasonal', ar: 'موسمي' }],
  ['ماهیانه', { tr: 'Aylık', en: 'Monthly', ar: 'شهرياً' }],
  ['هفتگی', { tr: 'Haftalık', en: 'Weekly', ar: 'أسبوعياً' }],
  ['روزانه', { tr: 'Günlük', en: 'Daily', ar: 'يومياً' }],
  ['جای خواب', { tr: 'Konaklama', en: 'Accommodation', ar: 'سكن' }],
  ['خوابگاه', { tr: 'Yurt / Konaklama', en: 'Dormitory', ar: 'سكن مشترك' }],
  ['غذا', { tr: 'Yemek', en: 'Meals', ar: 'طعام' }],
  ['بیمه', { tr: 'Sigorta', en: 'Insurance', ar: 'تأمين' }],
  ['مجوز کار', { tr: 'Çalışma İzni', en: 'Work Permit', ar: 'تصريح عمل' }],
  ['مرخصی', { tr: 'İzin', en: 'Leave', ar: 'إجازة' }],
  ['حقوق', { tr: 'Maaş', en: 'Salary', ar: 'الراتب' }],
  ['لیر', { tr: 'TL', en: 'TRY', ar: 'ليرة' }],
  ['تومان', { tr: 'Tümen', en: 'Toman', ar: 'تومان' }],
  ['ریال', { tr: 'Riyal', en: 'Rial', ar: 'ريال' }],
  ['کارجو', { tr: 'İş Arayan', en: 'Job Seeker', ar: 'باحث عن عمل' }],
  ['کارفرما', { tr: 'İşveren', en: 'Employer', ar: 'صاحب العمل' }],
  ['مدیریت', { tr: 'Yönetim', en: 'Admin', ar: 'الإدارة' }],
  ['همکار', { tr: 'Partner', en: 'Partner', ar: 'شريك' }],
  ['آگهی', { tr: 'İlan', en: 'Ad', ar: 'إعلان' }],
  ['استخدام', { tr: 'İstihdam', en: 'Hiring', ar: 'توظيف' }],
  ['فوری', { tr: 'Acil', en: 'Urgent', ar: 'عاجل' }],
  ['جدید', { tr: 'Yeni', en: 'New', ar: 'جديد' }],
  ['فعال', { tr: 'Aktif', en: 'Active', ar: 'نشط' }],
  ['تایید شده', { tr: 'Onaylandı', en: 'Verified', ar: 'معتمد' }],
  ['در انتظار', { tr: 'Beklemede', en: 'Pending', ar: 'قيد الانتظار' }],
  ['هتل', { tr: 'Otel', en: 'Hotel', ar: 'فندق' }],
  ['پانسیون', { tr: 'Pansiyon', en: 'Hostel', ar: 'نزل' }],
  ['خیاط', { tr: 'Terzi', en: 'Tailor', ar: 'خياط' }],
  ['جوشکار', { tr: 'Kaynakçı', en: 'Welder', ar: 'لحام' }],
  ['آشپز', { tr: 'Aşçı', en: 'Chef', ar: 'طباخ' }],
  ['گارسون', { tr: 'Garson', en: 'Waiter', ar: 'نادل' }],
  ['باریستا', { tr: 'Barista', en: 'Barista', ar: 'باريستا' }],
  ['راننده', { tr: 'Şoför', en: 'Driver', ar: 'سائق' }],
  ['نگهبان', { tr: 'Güvenlik', en: 'Security Guard', ar: 'حارس أمن' }],
  ['کارگر', { tr: 'İşçi', en: 'Worker', ar: 'عامل' }],
  ['برقکار', { tr: 'Elektrikçi', en: 'Electrician', ar: 'كهربائي' }],
  ['نجار', { tr: 'Marangoz', en: 'Carpenter', ar: 'نجار' }],
  ['املاک', { tr: 'Emlak', en: 'Real Estate', ar: 'عقارات' }],
  ['تومان', { tr: 'Tümen', en: 'Toman', ar: 'تومان' }],
  ['کارباما', { tr: 'Karbama', en: 'Karbama', ar: 'كارباما' }],
];

// Sort phrases & tokens longest-first so multi-word phrases replace before single words
const SORTED_PHRASES = [...PHRASE_DICT].sort((a, b) => b[0].length - a[0].length);
const SORTED_TOKENS = [...TOKEN_DICT].sort((a, b) => b[0].length - a[0].length);

// Persistent cache for browser-side neural translations of novel user-added sentences
const CACHE_KEY = 'karbama_i18n_neural_cache_v35';
let neuralCache: Record<string, string> = {};
try {
  const raw = safeStorage.getItem(CACHE_KEY);
  if (raw) neuralCache = JSON.parse(raw) || {};
} catch {
  neuralCache = {};
}

const inflightRequests = new Set<string>();

async function fetchBrowserNeuralTranslation(
  faText: string,
  lang: 'tr' | 'en' | 'ar',
  onResolved: (translated: string) => void
) {
  const trimmed = faText.trim();
  if (!trimmed || trimmed.length < 3 || trimmed.length > 500) return;
  const cacheKey = `${lang}:${trimmed}`;
  if (neuralCache[cacheKey]) {
    onResolved(neuralCache[cacheKey]);
    return;
  }
  if (inflightRequests.has(cacheKey)) return;
  inflightRequests.add(cacheKey);

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl=${lang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.[0])) {
        const joined = json[0].map((part: any) => part?.[0] || '').join('');
        if (joined && joined.trim()) {
          neuralCache[cacheKey] = joined.trim();
          try {
            safeStorage.setItem(CACHE_KEY, JSON.stringify(neuralCache));
          } catch {
            // ignore quota
          }
          onResolved(joined.trim());
        }
      }
    }
  } catch {
    // Offline or blocked; compositional dictionary translation already applied
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

export function translatePersianStringSync(raw: string, lang: AppLanguage): string {
  if (lang === 'fa' || !raw) return raw;
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  // Check neural cache first
  const cacheKey = `${lang}:${trimmed}`;
  if (neuralCache[cacheKey]) {
    return raw.replace(trimmed, neuralCache[cacheKey]);
  }

  let result = raw;

  // 1. Replace exact or substring phrases
  for (const [faPhrase, trans] of SORTED_PHRASES) {
    if (result.includes(faPhrase)) {
      result = result.split(faPhrase).join(trans[lang]);
    }
  }

  // 2. Replace compositional words/tokens if Persian characters still remain
  if (PERSIAN_CHAR_REGEX.test(result)) {
    for (const [faWord, trans] of SORTED_TOKENS) {
      if (result.includes(faWord)) {
        result = result.split(faWord).join(trans[lang]);
      }
    }
  }

  // 3. Convert digits for EN / TR
  result = convertDigitsByLang(result, lang);

  return result;
}

interface TrackedTextNode extends Text {
  __origFaText?: string;
  __lastAppliedLang?: AppLanguage;
}

interface TrackedElement extends HTMLElement {
  __origFaPlaceholder?: string;
  __origFaTitle?: string;
}

function processTextNode(node: TrackedTextNode, lang: AppLanguage) {
  const parent = node.parentElement;
  if (!parent) return;
  const tag = parent.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE') return;

  const currentVal = node.nodeValue || '';
  if (!currentVal.trim()) return;

  // Capture original Persian text when first seen
  if (node.__origFaText === undefined) {
    if (PERSIAN_CHAR_REGEX.test(currentVal)) {
      node.__origFaText = currentVal;
    } else {
      return;
    }
  }

  const origFa = node.__origFaText;
  if (!origFa) return;

  if (lang === 'fa') {
    if (node.nodeValue !== origFa) {
      node.nodeValue = origFa;
    }
    node.__lastAppliedLang = 'fa';
    return;
  }

  const syncTranslated = translatePersianStringSync(origFa, lang);
  if (node.nodeValue !== syncTranslated) {
    node.nodeValue = syncTranslated;
  }
  node.__lastAppliedLang = lang;

  // If any Persian letters still remain (e.g. a newly added custom job description), fetch neural translation in browser
  if (PERSIAN_CHAR_REGEX.test(syncTranslated)) {
    fetchBrowserNeuralTranslation(origFa, lang, (neuralResult) => {
      if (node.__lastAppliedLang === lang && node.nodeValue !== neuralResult) {
        node.nodeValue = convertDigitsByLang(neuralResult, lang);
      }
    });
  }
}

function processElementAttributes(el: TrackedElement, lang: AppLanguage) {
  const tracked = el as TrackedElement;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const ph = el.getAttribute('placeholder');
    if (ph) {
      if (tracked.__origFaPlaceholder === undefined && PERSIAN_CHAR_REGEX.test(ph)) {
        tracked.__origFaPlaceholder = ph;
      }
      if (tracked.__origFaPlaceholder) {
        el.setAttribute(
          'placeholder',
          lang === 'fa' ? tracked.__origFaPlaceholder : translatePersianStringSync(tracked.__origFaPlaceholder, lang)
        );
      }
    }
  }
  const title = el.getAttribute('title');
  if (title) {
    if (tracked.__origFaTitle === undefined && PERSIAN_CHAR_REGEX.test(title)) {
      tracked.__origFaTitle = title;
    }
    if (tracked.__origFaTitle) {
      el.setAttribute(
        'title',
        lang === 'fa' ? tracked.__origFaTitle : translatePersianStringSync(tracked.__origFaTitle, lang)
      );
    }
  }
}

export function scanAndTranslateDOM(root: Node, lang: AppLanguage) {
  if (typeof document === 'undefined' || !root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let current: Node | null = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      processTextNode(current as TrackedTextNode, lang);
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      processElementAttributes(current as TrackedElement, lang);
    }
    current = walker.nextNode();
  }
}
