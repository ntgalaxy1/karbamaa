export type UserRole = 'jobseeker' | 'admin' | 'partner';

export type AppLanguage = 'fa' | 'tr' | 'en' | 'ar';

export type TurkishLevel = 'none' | 'basic' | 'intermediate' | 'fluent';

export type ResidenceStatus = 'none' | 'tourist' | 'work_permit' | 'student' | 'passport_only';

export interface EducationEntry {
  id: string;
  degree: string;            // مقطع (دیپلم، کارشناسی، کارشناسی ارشد، فنی‌حرفه‌ای ...)
  field: string;             // رشته تحصیلی
  institution: string;       // نام دانشگاه / مدرسه / موسسه
  city: string;              // شهر و کشور
  graduationYear: string;    // سال فارغ‌التحصیلی
}

export interface ExperienceEntry {
  id: string;
  title: string;             // سمت و عنوان شغلی
  company: string;           // نام شرکت / رستوران / کارگاه
  city: string;              // شهر / کشور
  startDate: string;         // تاریخ شروع (مثلاً ۱۴۰۰ یا ۲۰۲۲)
  endDate: string;           // تاریخ پایان یا «همچنان مشغول»
  isCurrent: boolean;        // آیا در حال حاضر شاغل است
  description: string;       // شرح مسئولیت‌ها و دستاوردها
}

export interface PortfolioItem {
  id: string;
  title: string;             // عنوان نمونه‌کار یا مدرک
  type: 'link' | 'image' | 'certificate' | 'github' | 'sample';
  url: string;               // لینک آنلاین یا آدرس تصویر/فایل
  description?: string;      // توضیحات نمونه‌کار
}

export interface LanguageSkill {
  id: string;
  language: string;          // نام زبان (ترکی، فارسی، انگلیسی، عربی...)
  level: string;             // سطح (مادری، پیشرفته، متوسط، مقدماتی)
}

export interface SeekerResume {
  headline?: string;         // عنوان شغلی هدف (مثلاً سرآشپز ارشد، تکنسین CNC)
  summary?: string;          // خلاصه حرفه‌ای / درباره من
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skillsList: string[];      // مهارت‌های تخصصی
  languages: LanguageSkill[];
  portfolio: PortfolioItem[];
  updatedAt?: string;
}

export type TargetCountry = 'ترکیه' | 'ارمنستان' | 'عراق' | 'آلمان';

export type Gender = 'male' | 'female';

export interface JobSeeker {
  id: string;
  firstName?: string;        // نام
  lastName?: string;         // نام خانوادگی
  fullName: string;          // نام و نام خانوادگی
  fatherName: string;        // نام پدر
  nationalId: string;        // کد ملی ۱۰ رقمی
  gender?: Gender;           // جنسیت: مرد / زن
  phoneCountryCode?: string; // پیش‌شماره کشور (مثلاً +98, +90, +49, +964, +374)
  phoneNumber?: string;      // شماره تلفن بدون پیش‌شماره
  phone: string;             // شماره تماس کامل / واتساپ با پیش‌شماره
  username: string;          // نام کاربری جهت ورود
  password: string;          // رمز عبور ورود
  iranProvince?: string;     // استان محل سکونت در ایران
  iranCity?: string;         // شهرستان / شهر محل سکونت در ایران
  iranAddress?: string;      // آدرس کامل محل سکونت در ایران
  targetCountry?: TargetCountry; // کشور مقصد انتخابی (ترکیه، ارمنستان، عراق، آلمان)
  targetCity: string;        // شهر مد نظر در کشور مقصد
  turkishLevel: TurkishLevel;// سطح زبان (ترکی یا کشور مقصد)
  residenceStatus: ResidenceStatus; // وضعیت کیملیک / اقامت / پاسپورت
  skills: string[];          // مهارت‌ها و تجارب
  bio?: string;              // بیوگرافی و توضیحات سوابق کاری
  resume?: SeekerResume;     // رزومه آنلاین ساختاریافته کارباما
  
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  isPaymentVerified?: boolean;
  adminVerificationNote?: string;

  // اطلاعات ثبت توسط همکار یا خود کارجو
  registeredByRole?: 'seeker' | 'partner' | 'admin';
  registeredByPartnerId?: string;     // شناسه همکار ثبت‌کننده
  registeredByPartnerName?: string;   // نام همکار / آژانس ثبت‌کننده
  registeredByPartnerCode?: string;   // کد همکاری همکار (مثلاً PART-8801)
  isTemporaryRegistration?: boolean;  // آیا ثبت‌نام اولیه و موقت است؟
  partnerInternalNote?: string;       // یادداشت خصوصی همکار برای این کارجو

  // بخش ۳: شغل‌ها، تخصص‌ها و زبان‌ها
  selectedJobs?: string[];      // شغل‌ها و تخصص‌های انتخابی کارجو از لیست
  customProfession?: string;    // حرفه یا تخصص کارجو به دست خود
  targetLanguageLevel?: string; // میزان تسلط به زبان کشور انتخابی
  knownLanguages?: string[];    // زبان‌هایی که بلد هستم

  // بخش ۴: مدارک و تعهدنامه تسویه حساب
  passportPhotoUrl?: string;    // عکس صفحه اصلی پاسپورت کامل و خوانا
  fullBodyPhotoUrl?: string;    // عکس تمام قد ایستاده پس زمینه ساده
  nationalCardPhotoUrl?: string;// محل الصاق و یا اسکن کارت شناسایی
  contractDateShamsi?: string;  // تاریخ عقد قرارداد شمسی
  contractDateMiladi?: string;  // تاریخ عقد قرارداد میلادی
  contractAmount?: string;      // مبلغ هزینه خدمات کارگزار
  payerCardNumber?: string;     // شماره کارت واریز کننده (مشتری)
  brokerCardNumber?: string;    // شماره کارت کارگزار
  signatureDataUrl?: string;    // امضای الکترونیکی دیجیتال متقاضی
  contractAccepted?: boolean;   // تایید رضایت‌نامه و تعهدنامه فوق
  createdAt: string;
}

export interface RegisterSeekerInput {
  firstName?: string;
  lastName?: string;
  fullName: string;
  fatherName: string;
  nationalId: string;
  gender?: Gender;
  phoneCountryCode?: string;
  phoneNumber?: string;
  phone?: string;
  username: string;
  password: string;
  iranProvince?: string;
  iranCity?: string;
  iranAddress?: string;
  targetCountry?: TargetCountry;
  targetCity?: string;
  turkishLevel?: TurkishLevel;
  residenceStatus?: ResidenceStatus;
  skills?: string[];
  bio?: string;
}

export interface BrokerSettings {
  brokerCardNumber: string;
  brokerCardHolder: string;
  brokerBankName: string;
  brokerServiceFee: string;
  brokerIban?: string;
  brokerNotice?: string;
}

export type PaymentMethod = 'zarinpal' | 'turkey_bank' | 'iran_card';
export type JobPaymentStatus = 'pending_payment' | 'pending_approval' | 'paid' | 'rejected';

export interface PaymentGatewaySettings {
  feeTL: number;                // تعرفه ثابت به لیر (۵۰۰ لیر)
  exchangeRateToman: number;    // نرخ روز هر لیر به تومان (مثلاً ۲,۳۰۰ تومان)
  turkeyBankName: string;       // نام بانک ترکیه (Ziraat Bankası)
  turkeyIban: string;           // شماره شبا / ایبان ترکیه
  turkeyAccountHolder: string;  // نام صاحب حساب ترکیه
  iranBankName: string;         // نام بانک ایران
  iranCardNumber: string;       // شماره کارت ایران
  iranCardHolder: string;       // نام صاحب کارت ایران
  zarinpalMerchantId?: string;  // مرچنت آی‌دی زرین‌پال
}

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: string;
}

export interface AdminNotification {
  id: string;
  type: 'seeker_registered' | 'job_posted' | 'application_submitted' | 'hotel_booked' | 'partner_registered' | 'partner_payment';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// ========================
// بخش همکاران و اشتراک‌ها (Partner System)
// ========================
export type PartnerSubscriptionPlanId = '1_month' | '3_months' | '6_months' | '1_year';

export interface PartnerSubscriptionPlan {
  id: PartnerSubscriptionPlanId;
  title: string;                 // عنوان پلن (مثلاً اشتراک ۱ ماهه طلایی همکاران)
  durationMonths: number;        // مدت زمان به ماه (۱، ۳، ۶، ۱۲)
  priceTL: number;               // تعرفه به لیر ترکیه (تعیین شده توسط مدیر)
  priceToman: number;            // معادل تومان به روز
  discountPercentage?: number;   // درصد تخفیف (اختیاری)
  badge?: string;                // برچسب ویژه (مثلاً "اقتصادی", "پرفروش‌ترین")
  features: string[];            // امکانات و دسترسی‌های این پلن
}

export type PartnerSubscriptionStatus = 'unpaid' | 'pending_approval' | 'active' | 'expired';

export interface PartnerAccount {
  id: string;
  partnerCode: string;           // کد یکتای همکاری (مثلاً PART-8801)
  companyName: string;           // نام شرکت، آژانس یا دفتر همکار
  fullName: string;              // نام و نام خانوادگی مدیر/نماینده
  phone: string;                 // شماره تماس و واتساپ
  username: string;              // نام کاربری ورود
  password: string;              // رمز عبور
  city?: string;                 // شهر محل فعالیت (استانبول، تهران، آنکارا...)
  subscriptionStatus: PartnerSubscriptionStatus;
  planId?: PartnerSubscriptionPlanId;
  planTitle?: string;
  subscriptionStartDate?: string;
  subscriptionExpiresAt?: string;// تاریخ پایان اعتبار اشتراک
  daysRemaining?: number;        // روزهای باقیمانده از اشتراک
  paymentMethod?: PaymentMethod;
  paymentAmountTL?: number;
  paymentAmountToman?: number;
  paymentReceiptUrl?: string;    // تصویر فیش یا رسید پرداخت همکار
  paymentReferenceId?: string;   // کد رهگیری بانکی
  paymentPayerName?: string;     // نام صاحب کارت یا واریزکننده
  paymentDate?: string;          // تاریخ ثبت پرداخت
  adminApprovalNote?: string;    // یادداشت تایید/رد مدیر
  createdAt: string;
}

export interface RegisterSeekerByPartnerInput {
  fullName: string;
  fatherName?: string;
  nationalId: string;
  gender: Gender;
  phoneCountryCode: string;
  phoneNumber: string;
  phone: string;
  iranProvince?: string;
  iranCity?: string;
  targetCountry: TargetCountry;
  targetCity: string;
  skills: string[];
  selectedJobs?: string[];
  customProfession?: string;
  turkishLevel: TurkishLevel;
  residenceStatus: ResidenceStatus;
  isTemporaryRegistration: boolean; // آیا ثبت‌نام اولیه و موقت است؟
  partnerInternalNote?: string;     // یادداشت همکار برای مدیریت
}

export type JobCategory =
  | 'restaurant'
  | 'hotel'
  | 'textile'
  | 'warehouse'
  | 'technical'
  | 'construction'
  | 'beauty'
  | 'sales'
  | 'realestate'
  | 'transport'
  | 'furniture'
  | 'automotive'
  | 'translator'
  | 'it'
  | 'general';

export type ContractType = 'full_time' | 'part_time' | 'seasonal' | 'project';

export type PayFrequency = 'daily' | 'weekly' | 'monthly';

export interface JobVacancy {
  id: string;
  title: string;             // عنوان شغل
  company: string;           // نام کارفرما / کارگاه / شرکت
  city: string;              // شهر (از لیست ۸۱ شهر ترکیه)
  district: string;          // منطقه / محله (فاتیح، مرتر، شیشلی، لارا ...)
  category: JobCategory;     // دسته‌بندی
  subcategory?: string;      // زیر شاخه / تخصص فرعی (مثلاً آشپز، کمک‌آشپز، چرخکار، پذیرش‌گر)
  contractType: ContractType;// نوع قرارداد: تمام وقت، پاره وقت، فصلی، پروژه‌ای
  payFrequency: PayFrequency;// نوع پرداخت حقوق: روز مزد، هفتگی، ماهیانه
  keywords: string[];        // کلمات کلیدی شغلی برای جستجو و تطبیق دقیق
  salaryMin: number;         // حداقل حقوق (لیر یا دلار)
  salaryMax: number;         // حداکثر حقوق
  currency: 'TRY' | 'USD';
  accommodation: boolean;    // دارای اسکان / جای خواب
  meals: boolean;            // دارای وعده غذایی / غذا
  hasLeave: boolean;         // مرخصی (دارد / ندارد)
  accommodationDetails?: string; // جزئیات اسکان (خوابگاه پرسنلی، اتاق مستقل...)
  mealDetails?: string;          // جزئیات غذا (۳ وعده کامل، ناهار رایگان...)
  leaveDetails?: string;         // جزئیات مرخصی (مثلاً ۱ روز در هفته، ۲ روز در ماه)
  workPermitSupport: boolean;// پشتیبانی از دریافت چالیشما ایزنی (اقامت کاری)
  turkishRequired: TurkishLevel; // سطح زبان ترکی مورد نیاز
  gender: 'all' | 'male' | 'female';
  description: string;       // شرح وظایف و شرایط
  requirements: string[];    // شرایط لازم
  contactPhone: string;      // شماره تماس
  contactWhatsapp: string;   // واتساپ کارفرما
  imageUrl?: string;         // عکس مرتبط با شغل
  isActive: boolean;
  postedAt: string;

  // اطلاعات پرداخت و تایید آگهی (تعرفه ۵۰۰ لیر ترکیه)
  paymentStatus?: JobPaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentAmountTL?: number;       // مبلغ به لیر (پیش‌فرض ۵۰۰ لیر)
  paymentAmountToman?: number;    // معادل ریالی / تومانی به روز
  paymentReceiptUrl?: string;     // تصویر فیش واریزی ارسال شده توسط کارفرما
  paymentReferenceId?: string;    // شماره پیگیری / تراکنش بانکی
  paymentPayerName?: string;      // نام و مشخصات واریزکننده
  paymentPayerPhone?: string;     // تلفن واریزکننده
  paymentDate?: string;           // تاریخ پرداخت
  paymentAdminNote?: string;      // یادداشت مدیر در صورت تایید یا رد
}

export type ThemeColorPreset =
  | 'red'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'purple'
  | 'cyan'
  | 'rose'
  | 'indigo'
  | 'custom';

export interface ThemeColorConfig {
  id: ThemeColorPreset;
  name: string;
  primary: string;
  hover: string;
  light: string;
}

export interface JobAlertSubscription {
  id: string;
  title: string;             // عنوان هشدار (مثلاً: کارهای رستوران استانبول)
  city: string;              // 'همه شهرها' یا نام شهر
  category: string;          // 'all' یا JobCategory
  contractType: string;      // 'all' | ContractType
  minSalary: number;         // حداقل حقوق مورد نظر به لیر
  keywords: string[];        // کلمات کلیدی مورد نظر
  accommodationOnly: boolean;// فقط با جای خواب
  workPermitOnly: boolean;   // فقط با چالیشما
  enableBrowserPush: boolean;// فعال‌سازی نوتیفیکیشن مرورگر
  enableInAppToast: boolean; // فعال‌سازی اعلان پاپ‌آپ داخل برنامه
  isActive: boolean;
  createdAt: string;
}

export interface JobNotification {
  id: string;
  alertId?: string;
  jobId: string;
  jobTitle: string;
  company: string;
  city: string;
  salaryText: string;
  imageUrl?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  city: string;
  seekerId: string;
  seekerName: string;
  seekerFatherName: string;
  seekerNationalId: string;
  seekerPhone: string;
  seekerUsername: string;
  seekerSkills: string[];
  seekerTurkishLevel: TurkishLevel;
  seekerResidence: ResidenceStatus;
  status: ApplicationStatus;
  appliedAt: string;
  adminNote?: string;
}

export type AddressCategory =
  | 'embassy'
  | 'immigration'
  | 'emergency'
  | 'exchange'
  | 'hospital'
  | 'police';

export interface EssentialAddress {
  id: string;
  category: AddressCategory;
  title: string;             // عنوان به فارسی
  titleTr: string;           // عنوان ترکی
  city: string;              // شهر (استانبول، آنکارا، آنتالیا، ازمیر و ...)
  district: string;          // منطقه
  address: string;           // آدرس کامل
  phones: string[];          // شماره‌های تماس مستقیم
  workingHours: string;      // ساعات کاری
  description: string;       // توضیحات ضروری و نکات مهم برای ایرانیان
  isEmergency24h?: boolean;  // ۲۴ ساعته
  mapsUrl?: string;          // لینک لوکیشن یا نقشه
  coordinates?: { lat: number; lng: number }; // مختصات نقشه
}

export interface Hotel {
  id: string;
  name: string;              // نام هتل به فارسی
  nameTr: string;            // نام ترکی هتل
  city: string;              // شهر
  district: string;          // محله (مثلاً آکسارای، تقسیم، کادیکوی، لارا)
  stars: number;             // ستاره‌ها (۱ تا ۵ یا هتل آپارتمان/هاستل)
  type: 'hotel' | 'hostel' | 'apart' | 'pension';
  pricePerNight: number;     // قیمت هر شب به لیر
  address: string;
  phone: string;
  whatsapp?: string;
  imageUrl: string;
  amenities: string[];       // امکانات (وای‌فای، صبحانه، لاندری، نزدیکی به مترو)
  nearTransit: string;       // فاصله تا نزدیک‌ترین ایستگاه مترو/متروبوس
  description: string;
  mapsUrl?: string;
  coordinates?: { lat: number; lng: number }; // مختصات نقشه
}

export interface TransitHub {
  id: string;
  name: string;
  nameTr: string;
  type: 'metrobus' | 'metro' | 'tram' | 'marmaray' | 'ferry';
  city: string;
  district: string;
  lines: string[];
  coordinates: { lat: number; lng: number };
  description: string;
  connections: string;
  schedule: string;
  googleMapsUrl?: string;
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  city: string;
  guestName: string;
  guestPhone: string;
  checkInDate: string;
  nights: number;
  guestsCount: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookedAt: string;
  note?: string;
}

export interface TransitLine {
  id: string;
  type: 'metrobus' | 'metro' | 'tram' | 'marmaray';
  name: string;              // نام خط (مثلاً متروبوس بیلیک‌دوزو - سوغوتلوچشمه)
  nameTr: string;
  badge: string;             // شناسه کد خط مانند Metrobüs, T1, M2, Marmaray
  color: string;             // کد رنگ خط
  schedule: string;          // ساعات کار (مثلاً ۲۴ ساعته شبانه‌روزی)
  fareInfo: string;          // قیمت و نحوه پرداخت با استانبول‌کارت
  keyStations: string[];     // ایستگاه‌های کلیدی و تقاطع‌ها
  description: string;
  connections: string;       // تقاطع با سایر خطوط
}
