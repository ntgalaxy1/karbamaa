import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TurkishLevel, ResidenceStatus, TargetCountry, Gender, JobSeeker } from '../types';
import { CommitmentModal } from './CommitmentModal';
import { checkPasswordStrength, isValidEmail } from '../utils/validators';
import {
  toEnglishDigits,
  sanitizeNumericOnly,
  sanitizeCardNumber,
  sanitizeNationalIdOrPassport,
} from '../utils/inputUtils';
import { getDistrictsForCity } from '../data/turkeyData';
import {
  X,
  User,
  Users,
  Lock,
  Phone,
  IdCard,
  MapPin,
  Globe,
  Award,
  ShieldCheck,
  LogIn,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CheckCircle,
  Building2,
  Eye,
  EyeOff,
  Compass,
  FileCheck,
  Check,
  Search,
  Upload,
  Camera,
  FileText,
  Eraser,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Briefcase,
  Languages,
  Mail,
  KeyRound,
  PenTool,
  Palette,
  Loader2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'admin';
}

import { IRAN_PROVINCES, IRAN_CITIES_BY_PROVINCE } from '../data/iranCities';

const COUNTRY_CODES = [
  { code: '+98', country: 'ایران', flag: '🇮🇷' },
  { code: '+90', country: 'ترکیه', flag: '🇹🇷' },
  { code: '+49', country: 'آلمان', flag: '🇩🇪' },
  { code: '+964', country: 'عراق', flag: '🇮🇶' },
  { code: '+374', country: 'ارمنستان', flag: '🇦🇲' },
  { code: '+971', country: 'امارات', flag: '🇦🇪' },
  { code: '+44', country: 'انگلستان', flag: '🇬🇧' },
];

const DESTINATION_COUNTRIES: {
  id: TargetCountry;
  name: string;
  flag: string;
  popularCities: string[];
  desc: string;
}[] = [
  {
    id: 'ترکیه',
    name: 'ترکیه (Türkiye)',
    flag: '🇹🇷',
    popularCities: ['استانبول', 'آنتالیا', 'آنکارا', 'ازمیر', 'بورسا'],
    desc: 'فرصت‌های کاری رستورانی، تولیدی پوشاک، هتل‌ها و اقامت کاری چالیشما',
  },
  {
    id: 'ارمنستان',
    name: 'ارمنستان (Armenia)',
    flag: '🇦🇲',
    popularCities: ['ایروان', 'گیومری', 'وانادزور'],
    desc: 'سفر بدون ویزا، هزینه‌های مناسب زندگی، مشاغل خدماتی و بازرگانی',
  },
  {
    id: 'عراق',
    name: 'عراق (Iraq)',
    flag: '🇮🇶',
    popularCities: ['اربیل', 'سلیمانیه', 'بغداد', 'بصره'],
    desc: 'اقلیم کردستان با پرداخت درآمد دلاری، حوزه‌های فنی، ساختمانی و فروش',
  },
  {
    id: 'آلمان',
    name: 'آلمان (Germany)',
    flag: '🇩🇪',
    popularCities: ['برلین', 'مونیخ', 'فرانکفورت', 'هامبورگ', 'کلن', 'دوسلدورف'],
    desc: 'ویزای فرصت کار (Chancenkarte)، کادر درمان، مهندسی و دوره‌های آوسبیلدونگ',
  },
];

interface CommonJob {
  id: string;
  title: string;
  category: string;
  icon: string;
}

const COMMON_MIGRATION_JOBS: CommonJob[] = [
  // رستوران و هتلداری
  { id: 'chef', title: 'سرآشپز غذاهای ایرانی و فرنگی', category: 'رستوران و هتلداری', icon: '🍳' },
  { id: 'assistant-cook', title: 'کمک‌آشپز و تخته‌کار', category: 'رستوران و هتلداری', icon: '🔪' },
  { id: 'pizza-maker', title: 'پیتزاپز و فست‌فودکار', category: 'رستوران و هتلداری', icon: '🍕' },
  { id: 'barista', title: 'باریستا و بارتندر کافی‌شاپ', category: 'رستوران و هتلداری', icon: '☕' },
  { id: 'waiter', title: 'گارسون و سالن‌کار', category: 'رستوران و هتلداری', icon: '🍽️' },
  { id: 'hookah', title: 'قلیان‌زن و کافه‌چی', category: 'رستوران و هتلداری', icon: '💨' },
  { id: 'dishwasher', title: 'ظرفشور و خدمات رستوران', category: 'رستوران و هتلداری', icon: '🧼' },
  { id: 'housekeeping', title: 'خانه‌داری و نظافت هتل', category: 'رستوران و هتلداری', icon: '🧹' },
  { id: 'hotel-reception', title: 'پذیرش هتل (فرانت آفیس)', category: 'رستوران و هتلداری', icon: '🛎️' },
  { id: 'bellboy', title: 'بل‌بوی و باربر چمدان هتل', category: 'رستوران و هتلداری', icon: '🧳' },

  // خیاطی، پوشاک و نساجی
  { id: 'straight-stitch', title: 'چرخکار راسته دوز ماهر', category: 'پوشاک و نساجی', icon: '🧵' },
  { id: 'overlock', title: 'چرخکار زیگزالدوز و اورلوک', category: 'پوشاک و نساجی', icon: '🪡' },
  { id: 'flatlock', title: 'میاندوز کار پوشاک', category: 'پوشاک و نساجی', icon: '👕' },
  { id: 'cutter', title: 'برشکار پارچه و الگوساز', category: 'پوشاک و نساجی', icon: '✂️' },
  { id: 'ironer', title: 'اتوکار وسط‌کاری کارگاه', category: 'پوشاک و نساجی', icon: '👔' },
  { id: 'garment-pack', title: 'بسته‌بندی پوشاک و تریکو', category: 'پوشاک و نساجی', icon: '📦' },

  // فنی، ساختمانی و تاسیسات
  { id: 'electrician', title: 'برقکار ساختمان و صنعتی', category: 'فنی و ساختمانی', icon: '⚡' },
  { id: 'plumber', title: 'لوله‌کشی و تاسیسات آب و پکیج', category: 'فنی و ساختمانی', icon: '🔧' },
  { id: 'welder', title: 'جوشکار برق، آرگون و CO2', category: 'فنی و ساختمانی', icon: '🔥' },
  { id: 'plasterer', title: 'گچ‌کار و سفیدکار ساختمان', category: 'فنی و ساختمانی', icon: '🧱' },
  { id: 'tiler', title: 'کاشی‌کار و سرامیک‌کار ماهر', category: 'فنی و ساختمانی', icon: '🏗️' },
  { id: 'painter', title: 'نقاش ساختمان و کناف‌کار', category: 'فنی و ساختمانی', icon: '🎨' },
  { id: 'cnc-operator', title: 'اپراتور دستگاه تراش و CNC', category: 'فنی و ساختمانی', icon: '⚙️' },
  { id: 'carpenter', title: 'نجاری و کابینت‌سازی MDF', category: 'فنی و ساختمانی', icon: '🪚' },
  { id: 'elevator-tech', title: 'تکنسین و نصاب آسانسور', category: 'فنی و ساختمانی', icon: '🛗' },

  // آرایشگری و زیبایی
  { id: 'barber', title: 'آرایشگر مردانه و هیرکات', category: 'آرایشی و زیبایی', icon: '💈' },
  { id: 'groom-stylist', title: 'پیرایش و گریم داماد', category: 'آرایشی و زیبایی', icon: '✂️' },
  { id: 'hairdresser', title: 'آرایشگر زنانه و میکاپ', category: 'آرایشی و زیبایی', icon: '💄' },
  { id: 'hair-color', title: 'شینیون‌کار، رنگ و مش', category: 'آرایشی و زیبایی', icon: '💇‍♀️' },
  { id: 'nail-artist', title: 'ناخن‌کار (کاشت و ژلیش)', category: 'آرایشی و زیبایی', icon: '💅' },
  { id: 'eyelash-artist', title: 'مژه‌کار و فیبروز ابرو', category: 'آرایشی و زیبایی', icon: '👁️' },

  // فروش و اداری
  { id: 'cashier', title: 'صندوقدار و فروشنده فروشگاه', category: 'فروش و اداری', icon: '🛒' },
  { id: 'marketer', title: 'ویزیتور و بازاریاب حضوری/تلفنی', category: 'فروش و اداری', icon: '📢' },
  { id: 'translator', title: 'مترجم همزمان و امور بازرگانی', category: 'فروش و اداری', icon: '🗣️' },
  { id: 'office-admin', title: 'کارمند اداری و حسابداری مقدماتی', category: 'فروش و اداری', icon: '📊' },

  // حمل‌ونقل و انبار
  { id: 'driver', title: 'راننده سواری و ترانزیت', category: 'حمل‌ونقل و لجستیک', icon: '🚗' },
  { id: 'delivery', title: 'پیک موتوری و دلیوری غذا', category: 'حمل‌ونقل و لجستیک', icon: '🛵' },
  { id: 'warehouse', title: 'کارگر انبار و چیدمان کالا', category: 'حمل‌ونقل و لجستیک', icon: '📦' },

  // فناوری اطلاعات و دیجیتال
  { id: 'web-dev', title: 'برنامه‌نویس وب و نرم‌افزار', category: 'فناوری و دیجیتال', icon: '💻' },
  { id: 'wordpress', title: 'طراح سایت وردپرس', category: 'فناوری و دیجیتال', icon: '🌐' },
  { id: 'social-admin', title: 'ادمین اینستاگرام و سوشال مدیا', category: 'فناوری و دیجیتال', icon: '📱' },
  { id: 'video-editor', title: 'تولید محتوا و ادیتور ویدیو', category: 'فناوری و دیجیتال', icon: '🎬' },

  // مراقبت و خدمات
  { id: 'elderly-care', title: 'پرستار سالمند و بیمار در منزل', category: 'مراقبت و خدمات', icon: '🩺' },
  { id: 'nanny', title: 'مراقب کودک (نانی)', category: 'مراقبت و خدمات', icon: '👶' },
  { id: 'massage-therapist', title: 'ماساژور حرفه‌ای و اسپا', category: 'مراقبت و خدمات', icon: '💆' },
];

const AVAILABLE_LANGUAGES = [
  'فارسی (زبان مادری)',
  'ترکی استانبولی',
  'انگلیسی',
  'آلمانی',
  'عربی',
  'کردی',
  'ارمنی',
  'روسی',
  'فرانسوی',
  'آذری',
];

const getTargetCountryLanguageName = (country: TargetCountry): string => {
  switch (country) {
    case 'ترکیه':
      return 'زبان ترکی استانبولی (Türkçe)';
    case 'ارمنستان':
      return 'زبان ارمنی یا روسی (Armenian / Russian)';
    case 'عراق':
      return 'زبان عربی یا کردی (Arabic / Kurdish)';
    case 'آلمان':
      return 'زبان آلمانی (Deutsch)';
    default:
      return 'زبان کشور مقصد';
  }
};

const getShamsiDateString = (): string => {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return '۱۴۰۵/۰۸/۰۴';
  }
};

const getMiladiDateString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const {
    registerSeeker,
    checkDuplicateSeekerField,
    loginSeeker,
    loginAdmin,
    recoverPassword,
    brokerSettings,
    appLanguage,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(defaultMode);

  // Duplicate validation state
  const [duplicateErrors, setDuplicateErrors] = useState<{
    email?: string;
    phoneNumber?: string;
    nationalId?: string;
    payerCardNumber?: string;
  }>({});

  const checkFieldDuplicate = (
    field: 'email' | 'phoneNumber' | 'nationalId' | 'payerCardNumber',
    val: string
  ) => {
    const res = checkDuplicateSeekerField(field, val);
    setDuplicateErrors((prev) => ({
      ...prev,
      [field]: res.isDuplicate ? res.message : undefined,
    }));
    return res;
  };

  // 5-step wizard step (1: Info, 2: Destination, 3: Jobs & Langs, 4: Documents & Signature, 5: Official Dossier Issued)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [registeredSeeker, setRegisteredSeeker] = useState<JobSeeker | null>(null);

  // 1. مشخصات فردی و حساب ورود (ضروری)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+98');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Recovery state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [recoverInput, setRecoverInput] = useState('');
  const [recoverResult, setRecoverResult] = useState<{ success: boolean; message: string } | null>(null);

  // 2. آدرس دقیق سکونت ایران و تعیین کشور مقصد (۴ کشور)
  const [iranProvince, setIranProvince] = useState('تهران');
  const [iranCity, setIranCity] = useState('');
  const [iranAddress, setIranAddress] = useState('');
  const [targetCountry, setTargetCountry] = useState<TargetCountry>('ترکیه');
  const [targetCity, setTargetCity] = useState('استانبول');
  const [targetDistrict, setTargetDistrict] = useState('فاتیح');

  // 3. شغل‌ها، تخصص‌ها، جستجو، حرفه کارجو، تسلط به زبان کشور انتخابی و زبان‌های بلدم
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [targetLanguageLevel, setTargetLanguageLevel] = useState<string>('basic');
  const [knownLanguages, setKnownLanguages] = useState<string[]>(['فارسی (زبان مادری)']);
  const [residenceStatus, setResidenceStatus] = useState<ResidenceStatus>('none');
  const [bio, setBio] = useState('');

  // 4. بارگزاری مدارک (عکس پاسپورت، عکس تمام قد با تذکر ریش/آرایش، کارت شناسایی) و تعهدنامه
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string>('');
  const [fullBodyPhotoUrl, setFullBodyPhotoUrl] = useState<string>('');
  const [nationalCardPhotoUrl, setNationalCardPhotoUrl] = useState<string>('');
  const [payerCardNumber, setPayerCardNumber] = useState<string>('');
  const [inquiredPayerBank, setInquiredPayerBank] = useState<string | null>(null);
  const [isInquiringPayerBank, setIsInquiringPayerBank] = useState(false);
  const [contractTermsAgreed, setContractTermsAgreed] = useState<boolean>(true);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState<boolean>(false);

  const inquireSepalBank = async (rawCard: string) => {
    if (rawCard.length !== 16) {
      setInquiredPayerBank(null);
      return;
    }
    setIsInquiringPayerBank(true);
    try {
      const res = await fetch('/api/sepal/card-to-iban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: rawCard }),
      });
      const data = await res.json();
      if (data.success && data.data?.bankName) {
        setInquiredPayerBank(data.data.bankName);
      }
    } catch {
      // ignore
    } finally {
      setIsInquiringPayerBank(false);
    }
  };

  // File input refs for reliable WebView / mobile taps
  const passportInputRef = useRef<HTMLInputElement | null>(null);
  const fullBodyInputRef = useRef<HTMLInputElement | null>(null);
  const nationalCardInputRef = useRef<HTMLInputElement | null>(null);

  // Canvas Signature state & styles
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [signatureColor, setSignatureColor] = useState<string>('#1d4ed8'); // Default Navy blue ink
  const [signatureWidth, setSignatureWidth] = useState<number>(3.8); // Default 3.8px

  // Date constants
  const contractDateShamsi = getShamsiDateString();
  const contractDateMiladi = getMiladiDateString();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Error message
  const [error, setError] = useState<string | null>(null);

  // Password checks for visual feedback
  const passCheck = checkPasswordStrength(password);

  // Validation per step
  const validateStep1 = (): boolean => {
    if (!firstName.trim()) {
      setError('لطفاً نام خود را وارد کنید.');
      return false;
    }
    if (!lastName.trim()) {
      setError('لطفاً نام خانوادگی خود را وارد کنید.');
      return false;
    }
    if (!fatherName.trim()) {
      setError('لطفاً نام پدر را وارد نمایید.');
      return false;
    }
    const cleanNatId = nationalId.replace(/\s/g, '');
    if (!cleanNatId || cleanNatId.length < 6) {
      setError('لطفاً کد ملی یا شماره پاسپورت معتبر را وارد نمایید.');
      return false;
    }
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 7 || !/^\d+$/.test(cleanPhone)) {
      setError('لطفاً شماره تلفن همراه معتبر را وارد کنید.');
      return false;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setError('لطفاً آدرس ایمیل معتبر وارد نمایید (جهت بازیابی رمز عبور).');
      return false;
    }
    if (!gender) {
      setError('لطفاً جنسیت خود را مشخص کنید.');
      return false;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('نام کاربری ورود باید حداقل ۳ کاراکتر باشد.');
      return false;
    }
    if (!passCheck.isValid) {
      setError(passCheck.error || 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و اعداد باشد.');
      return false;
    }

    // Instant Duplicate validation
    const dupNatId = checkFieldDuplicate('nationalId', nationalId);
    if (dupNatId.isDuplicate) {
      setError(dupNatId.message || 'این کد ملی یا شماره پاسپورت قبلاً در سامانه ثبت گردیده است.');
      return false;
    }
    const dupPhone = checkFieldDuplicate('phoneNumber', phoneNumber);
    if (dupPhone.isDuplicate) {
      setError(dupPhone.message || 'این شماره تلفن قبلاً در سامانه ثبت گردیده است.');
      return false;
    }
    const dupEmail = checkFieldDuplicate('email', email);
    if (dupEmail.isDuplicate) {
      setError(dupEmail.message || 'این آدرس ایمیل قبلاً در سامانه ثبت گردیده است.');
      return false;
    }

    return true;
  };

  // Initialize canvas when entering Step 4 or changing signature styling
  useEffect(() => {
    if (step === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = signatureColor;
        ctx.lineWidth = signatureWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [step, signatureColor, signatureWidth]);

  if (!isOpen) return null;

  // Signature pad methods with 1:1 responsive touch scaling
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawnSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = signatureWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setSignatureDataUrl('');
    setHasDrawnSignature(false);
  };

  // One-click authentic calligraphic signature generator
  const generateOfficialCalligraphicSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const applicantName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'امضای رسمی متقاضی';

    ctx.save();
    ctx.strokeStyle = signatureColor || '#1d4ed8';
    ctx.fillStyle = signatureColor || '#1d4ed8';
    ctx.lineWidth = signatureWidth || 3.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Calligraphic top flourish loop
    ctx.beginPath();
    ctx.moveTo(110, 160);
    ctx.bezierCurveTo(160, 70, 240, 50, 330, 105);
    ctx.bezierCurveTo(420, 160, 500, 125, 580, 80);
    ctx.bezierCurveTo(640, 45, 680, 110, 710, 170);
    ctx.stroke();

    // Calligraphic bottom loop
    ctx.beginPath();
    ctx.moveTo(250, 155);
    ctx.bezierCurveTo(320, 210, 480, 200, 610, 150);
    ctx.bezierCurveTo(660, 130, 685, 95, 650, 75);
    ctx.bezierCurveTo(610, 55, 520, 95, 470, 140);
    ctx.stroke();

    // Persian calligraphic name text
    ctx.font = 'bold 36px "Vazirmatn", "Shabnam", Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(applicantName, 400, 115);

    // Official digital stamp text
    ctx.font = '14px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillText(`امضای تایید شده الکترونیکی • ${contractDateShamsi}`, 400, 185);

    // Swoosh flourish under name
    ctx.beginPath();
    ctx.moveTo(190, 142);
    ctx.quadraticCurveTo(400, 168, 610, 142);
    ctx.stroke();

    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    setHasDrawnSignature(true);
  };

  // Image Upload Handlers
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('حجم تصویر نباید بیشتر از ۸ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Job selection toggle
  const toggleJob = (jobTitle: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobTitle) ? prev.filter((j) => j !== jobTitle) : [...prev, jobTitle]
    );
  };

  // Known language toggle
  const toggleLanguage = (lang: string) => {
    setKnownLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // Filtered jobs
  const filteredJobs = COMMON_MIGRATION_JOBS.filter((j) =>
    j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    j.category.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );



  const validateStep2 = (): boolean => {
    if (!iranProvince.trim()) {
      setError('لطفاً استان محل سکونت خود در ایران را انتخاب کنید.');
      return false;
    }
    if (!iranCity.trim()) {
      setError('لطفاً شهرستان / شهر محل سکونت در ایران را بنویسید.');
      return false;
    }
    if (!iranAddress.trim() || iranAddress.trim().length < 6) {
      setError('لطفاً آدرس دقیق و کامل محل سکونت در ایران را وارد فرمایید.');
      return false;
    }
    if (!targetCountry) {
      setError('لطفاً کشور مقصد خود را از میان ۴ گزینه انتخاب کنید.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (selectedJobs.length === 0 && !customProfession.trim()) {
      setError('لطفاً حداقل یک شغل از لیست انتخاب کنید یا حرفه اختصاصی خود را بنویسید.');
      return false;
    }
    if (knownLanguages.length === 0) {
      setError('لطفاً حداقل یک زبان از فهرست «زبان‌هایی که بلد هستم» را انتخاب کنید.');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!fullBodyPhotoUrl) {
      setError('بارگذاری عکس تمام قد پرسنلی الزامی است. لطفاً تصویر تمام قد خود را بارگذاری فرمایید.');
      return false;
    }
    if (!passportPhotoUrl) {
      setError('بارگذاری عکس صفحه اول پاسپورت الزامی است. لطفاً عکس واضح از پاسپورت خود به‌طوری که هر چهار گوشه پاسپورت کاملاً داخل کادر مشخص باشد بارگذاری فرمایید.');
      return false;
    }
    const cleanPayerCard = payerCardNumber.replace(/\D/g, '');
    if (!cleanPayerCard || cleanPayerCard.length < 16) {
      setError('لطفاً شماره کارت ۱۶ رقمی واریز کننده وجه را به درستی وارد نمایید.');
      return false;
    }
    const dupCard = checkFieldDuplicate('payerCardNumber', payerCardNumber);
    if (dupCard.isDuplicate) {
      setError(dupCard.message || 'این شماره کارت بانکی قبلاً در سامانه ثبت گردیده است.');
      return false;
    }
    if (!hasDrawnSignature && !signatureDataUrl) {
      setError('لطفاً تعهدنامه را در کادر مشخص شده به صورت الکترونیکی امضا فرمایید.');
      return false;
    }
    if (!contractTermsAgreed) {
      setError('تایید تعهدنامه تسویه حساب کارگزار و رضایت‌نامه جهت تکمیل ثبت‌نام الزامی است.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    } else if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleRegisterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!validateStep4()) {
      return;
    }

    const fullPhone = `${phoneCountryCode} ${phoneNumber.trim()}`;

    // Combine selected jobs with custom profession for general skills
    const combinedSkills = [...selectedJobs];
    if (customProfession.trim() && !combinedSkills.includes(customProfession.trim())) {
      combinedSkills.push(customProfession.trim());
    }

    // Map TurkishLevel equivalent
    const mappedLevel: TurkishLevel =
      targetLanguageLevel === 'fluent'
        ? 'fluent'
        : targetLanguageLevel === 'intermediate'
        ? 'intermediate'
        : targetLanguageLevel === 'basic'
        ? 'basic'
        : 'none';

    const res = registerSeeker({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      fatherName: fatherName.trim(),
      nationalId: nationalId.trim(),
      email: email.trim(),
      gender,
      phoneCountryCode,
      phoneNumber: phoneNumber.trim(),
      phone: fullPhone,
      username: username.trim(),
      password,
      iranProvince: iranProvince.trim(),
      iranCity: iranCity.trim(),
      iranAddress: iranAddress.trim(),
      targetCountry,
      targetCity: targetCity.trim() || 'استانبول',
      targetDistrict: targetDistrict.trim() || undefined,
      turkishLevel: mappedLevel,
      residenceStatus,
      skills: combinedSkills,
      bio,
      // Step 3
      selectedJobs,
      customProfession: customProfession.trim(),
      targetLanguageLevel,
      knownLanguages,
      // Step 4
      passportPhotoUrl,
      fullBodyPhotoUrl,
      nationalCardPhotoUrl,
      contractDateShamsi,
      contractDateMiladi,
      contractAmount: brokerSettings.brokerServiceFee,
      payerCardNumber: payerCardNumber.trim(),
      brokerCardNumber: brokerSettings.brokerCardNumber,
      signatureDataUrl: signatureDataUrl || (canvasRef.current ? canvasRef.current.toDataURL() : ''),
      contractAccepted: contractTermsAgreed,
    });

    if (res.success) {
      setRegisteredSeeker(res.seeker || null);
      setStep(5);
    } else {
      setError(res.error || 'خطایی در ثبت‌نام رخ داد');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'admin') {
      const res = loginAdmin(loginUsername, loginPassword);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'ورود به عنوان مدیر ناموفق بود');
      }
    } else {
      const res = loginSeeker(loginUsername, loginPassword);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'ورود کارجو ناموفق بود');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto h-[88vh] min-h-[560px] max-h-[720px] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-700/30 via-slate-850 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="لوگوی کارباما"
              className="h-11 w-11 rounded-full object-cover border-2 border-amber-400/70 shadow-lg shadow-red-700/40 shrink-0"
            />
            <div>
              <h2 className="text-lg font-black text-white">
                {mode === 'register' && 'ثبت‌نام رسمی کارجو در کارباما (۴ بخش تخصصی)'}
                {mode === 'login' && 'ورود کارجو به سامانه کارباما'}
                {mode === 'admin' && 'ورود مدیر به سامانه کارباما'}
              </h2>
              <p className="text-xs text-slate-400">سامانه جامع کاریابی، اعزام و اقامت ایرانیان در ترکیه، ارمنستان، عراق و آلمان</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 p-1.5 mx-6 mt-4 bg-slate-950/70 border border-slate-800 rounded-2xl gap-1 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              mode === 'login'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="truncate">ورود کارجو</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              mode === 'register'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="truncate">ثبت‌نام جدید</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setError(null);
            }}
            className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              mode === 'admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">بخش مدیر</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-3 p-3 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0 animate-ping"></span>
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {mode === 'register' ? (
            <div>
              {/* Wizard Steps Progress Indicator */}
              <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { s: 1, title: '۱. مشخصات فردی', desc: 'هویت و رمز ورود', icon: User },
                    { s: 2, title: '۲. سکونت و مقصد', desc: 'ایران و ۴ کشور', icon: MapPin },
                    { s: 3, title: '۳. شغل و زبان‌ها', desc: 'تخصص و زبان‌ها', icon: Briefcase },
                    { s: 4, title: '۴. مدارک و امضا', desc: 'پاسپورت و امضا', icon: FileCheck },
                    { s: 5, title: '۵. پرونده رسمی', desc: 'صدور و تایید نهایی', icon: Award },
                  ].map((item) => {
                    const isDone = step > item.s;
                    const isCurrent = step === item.s;
                    const StepIcon = item.icon;
                    return (
                      <button
                        key={item.s}
                        type="button"
                        onClick={() => {
                          if (item.s < step && step !== 5) setStep(item.s as 1 | 2 | 3 | 4 | 5);
                        }}
                        className={`text-right p-2 rounded-2xl border transition relative ${
                          isCurrent
                            ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500/50'
                            : isDone
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 cursor-pointer'
                            : 'bg-slate-850/80 border-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              isCurrent
                                ? 'bg-red-600 text-white'
                                : isDone
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3" /> : item.s}
                          </span>
                          <StepIcon className="w-3.5 h-3.5 inline text-slate-400" />
                        </div>
                        <div className="text-xs font-bold truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 truncate hidden sm:block">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: مشخصات فردی، کد ملی، شماره با پیش‌شماره کشور، جنسیت و حساب کاربری */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">بخش ۱ از ۴: مشخصات هویتی و اطلاعات حساب ورود</strong>
                    تمامی فیلدهای این بخش (نام، نام خانوادگی، نام پدر، کد ملی، شماره تلفن با پیش‌شماره کشور، جنسیت و حساب کاربری) ضروری می‌باشند.
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نام متقاضی <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: علی"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نام خانوادگی <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: رضایی"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Father Name & National ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نام پدر <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="مثال: محمدرضا"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>کد ملی یا شماره پاسپورت <span className="text-red-400">*</span></span>
                        <span className="text-[10px] text-slate-400 font-mono">0-9 انگلیسی</span>
                      </label>
                      <div className="relative">
                        <IdCard className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                        <input
                          type="text"
                          required
                          maxLength={15}
                          lang="en"
                          dir="ltr"
                          inputMode="text"
                          placeholder="کد ملی یا شماره پاسپورت..."
                          value={nationalId}
                          onChange={(e) => {
                            const sanitized = sanitizeNationalIdOrPassport(e.target.value);
                            setNationalId(sanitized);
                            checkFieldDuplicate('nationalId', sanitized);
                          }}
                          onBlur={() => checkFieldDuplicate('nationalId', nationalId)}
                          className={`w-full bg-slate-800/90 border rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden text-left font-mono ${
                            duplicateErrors.nationalId ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-700 focus:border-red-500'
                          }`}
                        />
                      </div>
                      {duplicateErrors.nationalId && (
                        <div className="mt-1 p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{duplicateErrors.nationalId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone Number with Country Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>شماره تلفن همراه (با تعیین پیش‌شماره کشور) <span className="text-red-400">*</span></span>
                      <span className="text-[10px] text-slate-400 font-mono">0-9 انگلیسی</span>
                    </label>
                    <div className="flex gap-2" dir="ltr">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="w-36 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-hidden focus:border-red-500"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country})
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input
                          type="tel"
                          required
                          lang="en"
                          dir="ltr"
                          inputMode="numeric"
                          placeholder="912 345 6789"
                          value={phoneNumber}
                          onChange={(e) => {
                            const sanitized = sanitizeNumericOnly(e.target.value, 11);
                            setPhoneNumber(sanitized);
                            checkFieldDuplicate('phoneNumber', sanitized);
                          }}
                          onBlur={() => checkFieldDuplicate('phoneNumber', phoneNumber)}
                          className={`w-full bg-slate-800/90 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden font-mono ${
                            duplicateErrors.phoneNumber ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-700 focus:border-red-500'
                          }`}
                        />
                      </div>
                    </div>
                    {duplicateErrors.phoneNumber && (
                      <div className="mt-1 p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{duplicateErrors.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Input Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      آدرس ایمیل معتبر (جهت بازیابی رمز عبور) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                      <input
                        type="email"
                        required
                        lang="en"
                        dir="ltr"
                        inputMode="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setEmail(val);
                          checkFieldDuplicate('email', val);
                        }}
                        onBlur={() => checkFieldDuplicate('email', email)}
                        className={`w-full bg-slate-800/90 border rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden text-left font-mono ${
                          duplicateErrors.email ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-700 focus:border-red-500'
                        }`}
                      />
                    </div>
                    {duplicateErrors.email && (
                      <div className="mt-1 p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{duplicateErrors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      تعیین جنسیت <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                          gender === 'male'
                            ? 'bg-blue-600/20 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-base">👨</span>
                        <span>مرد (آقا)</span>
                        {gender === 'male' && <CheckCircle2 className="w-4 h-4 text-blue-400 mr-auto" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                          gender === 'female'
                            ? 'bg-pink-600/20 border-pink-500 text-pink-200 ring-2 ring-pink-500/30'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-base">👩</span>
                        <span>زن (خانم)</span>
                        {gender === 'female' && <CheckCircle2 className="w-4 h-4 text-pink-400 mr-auto" />}
                      </button>
                    </div>
                  </div>

                  {/* Username & Password */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      اطلاعات ورود به سامانه کارباما (هر سری با این اطلاعات وارد برنامه می‌شوید)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          نام کاربری ورود (یوزرنیم) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                          <input
                            type="text"
                            required
                            lang="en"
                            dir="ltr"
                            placeholder="ali_reza"
                            value={username}
                            onChange={(e) => setUsername(toEnglishDigits(e.target.value).replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase())}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          رمز عبور (حداقل ۸ کاراکتر + حروف + عدد) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            lang="en"
                            dir="ltr"
                            placeholder="Abc12345"
                            value={password}
                            onChange={(e) => setPassword(toEnglishDigits(e.target.value))}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-9 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Visual Checklist */}
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${passCheck.hasMinLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {passCheck.hasMinLength ? '✓' : '○'} حداقل ۸ کاراکتر
                      </div>
                      <div className={`flex items-center gap-1.5 ${passCheck.hasUpper ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {passCheck.hasUpper ? '✓' : '○'} حرف بزرگ (A-Z)
                      </div>
                      <div className={`flex items-center gap-1.5 ${passCheck.hasLower ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {passCheck.hasLower ? '✓' : '○'} حرف کوچک (a-z)
                      </div>
                      <div className={`flex items-center gap-1.5 ${passCheck.hasDigit ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {passCheck.hasDigit ? '✓' : '○'} عدد انگلیسی (0-9)
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                    >
                      <span>مرحله بعد: آدرس ایران و کشور مقصد</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: آدرس دقیق سکونت در ایران و تعیین کشور مقصد (۴ کشور: ترکیه، ارمنستان، عراق، آلمان) */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">بخش ۲ از ۴: آدرس دقیق سکونت در ایران و انتخاب کشور مقصد</strong>
                    آدرس محل سکونت در ایران برای پرونده رسمی کاریابی و کشور مقصد برای نمایش آگهی‌های متناسب اعزام ضروری است.
                  </div>

                  {/* Province & City in Iran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        استان محل سکونت در ایران <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                        <select
                          value={iranProvince}
                          onChange={(e) => {
                            const newProv = e.target.value;
                            setIranProvince(newProv);
                            const cities = IRAN_CITIES_BY_PROVINCE[newProv] || [];
                            if (cities.length > 0) {
                              setIranCity(cities[0]);
                            }
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500 font-bold"
                        >
                          {IRAN_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        شهرستان / شهر محل سکونت <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                        <select
                          value={iranCity}
                          onChange={(e) => setIranCity(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500 font-bold"
                        >
                          {(IRAN_CITIES_BY_PROVINCE[iranProvince] || ['تهران']).map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Full Address in Iran */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      آدرس کامل محل سکونت در ایران <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="خیابان اصلی، کوچه، پلاک، واحد یا طبقه، کد پستی..."
                      value={iranAddress}
                      onChange={(e) => setIranAddress(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  {/* Destination Country Selection (Exact 4 Countries: ترکیه، ارمنستان، عراق، آلمان) */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      تعیین کشور مقصد جهت اعزام و اشتغال (انتخاب از میان ۴ کشور) <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DESTINATION_COUNTRIES.map((c) => {
                        const isSelected = targetCountry === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setTargetCountry(c.id);
                              setTargetCity(c.popularCities[0]);
                            }}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition text-right relative ${
                              isSelected
                                ? 'bg-gradient-to-br from-red-950/60 via-slate-800 to-slate-900 border-red-500 ring-2 ring-red-500/30 shadow-lg'
                                : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{c.flag}</span>
                                <span className="text-sm font-bold text-white">{c.name}</span>
                              </div>
                              {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 text-red-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-600" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{c.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>مرحله قبل</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <span>مرحله بعد: شغل‌ها، تخصص و زبان‌ها</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: شغل‌ها و تخصص‌های مورد نظر، جستجو، نوشتن حرفه کارجو، تسلط به زبان کشور انتخابی و زبان‌هایی که بلدم */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">بخش ۳ از ۴: شغل‌ها و تخصص‌های مورد نظر، زبان‌ها و مهارت‌ها</strong>
                    شغل‌های رایج را با امکان جستجو انتخاب کنید، حرفه خاص خود را بنویسید و میزان تسلط به زبان‌ها را تعیین نمایید.
                  </div>

                  {/* 1. Common Jobs with Search and Multi-Select */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-red-400" />
                        <span>شغل‌ها و تخصص‌های مورد نظر کارجو (انتخاب از تمام شغل‌های رایج)</span>
                        <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[11px] text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full font-bold">
                        {selectedJobs.length} شغل انتخاب شده
                      </span>
                    </div>

                    {/* Search box for jobs */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        placeholder="جستجوی سریع شغل (مثال: سرآشپز، چرخکار، برقکار، باریستا، آرایشگر، راننده، مترجم)..."
                        value={jobSearchQuery}
                        onChange={(e) => setJobSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    {/* Job Grid / Chips */}
                    <div className="max-h-56 overflow-y-auto p-2 bg-slate-950/60 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                      {filteredJobs.map((job) => {
                        const isSelected = selectedJobs.includes(job.title);
                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => toggleJob(job.title)}
                            className={`p-2 rounded-xl text-right text-xs transition flex items-center justify-between gap-2 border ${
                              isSelected
                                ? 'bg-red-600/25 border-red-500 text-white font-bold ring-1 ring-red-500/40'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-sm shrink-0">{job.icon}</span>
                              <span className="truncate">{job.title}</span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Custom Profession input (یک جای برای نوشتن حرفه خود کارجو) */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                    <label className="block text-xs font-bold text-amber-300">
                      نوشتن حرفه و تخصص خود کارجو (در صورتی که در لیست بالا نبود یا تخصص خاصی دارید بنویسید)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: تراشکار قطعات صنعتی سنگین، متخصص رنگ مو و آمبره، نصاب دوربین مداربسته..."
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {/* 3. Proficiency level in chosen target country's language */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-red-400" />
                      <span>میزان تسلط به زبان کشور انتخابی: {getTargetCountryLanguageName(targetCountry)}</span>
                      <span className="text-red-400">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        {
                          level: 'none',
                          title: 'آشنایی ندارم (نیاز به زبان ندارم)',
                          desc: 'محیط کار فارسی‌زبان یا کارهای غیرکلامی',
                        },
                        {
                          level: 'basic',
                          title: 'مقدماتی (در حد روزمره و سلام)',
                          desc: 'فهم اصطلاحات پایه، ارقام و احوالپرسی',
                        },
                        {
                          level: 'intermediate',
                          title: 'متوسط کاری (مکالمه در محیط کار)',
                          desc: 'پاسخگویی به مشتری و درک دستورات کارفرما',
                        },
                        {
                          level: 'fluent',
                          title: 'پیشرفته و کاملاً مسلط',
                          desc: 'مکالمه روان، خواندن و نوشتن بی نقص',
                        },
                      ].map((item) => {
                        const isSelected = targetLanguageLevel === item.level;
                        return (
                          <div
                            key={item.level}
                            onClick={() => setTargetLanguageLevel(item.level)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition ${
                              isSelected
                                ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500/40'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-xs">{item.title}</span>
                              {isSelected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{item.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. زبان‌هایی که بلد هستم (گزینه انتخابی چندگانه) */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Languages className="w-4 h-4 text-emerald-400" />
                        <span>زبان‌هایی که بلد هستم (انتخاب چندتایی)</span>
                        <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        {knownLanguages.length} زبان انتخاب شده
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_LANGUAGES.map((lang) => {
                        const isSelected = knownLanguages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-600/25 border-emerald-500 text-emerald-200 shadow-xs'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{lang}</span>
                            {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Residence / Passport Status */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      وضعیت گذرنامه و اقامت در کشور مقصد ({targetCountry})
                    </label>
                    <select
                      value={residenceStatus}
                      onChange={(e) => setResidenceStatus(e.target.value as ResidenceStatus)}
                      className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-red-500"
                    >
                      <option value="none">در ایران هستم (دارای پاسپورت یا در دست اقدام)</option>
                      <option value="passport_only">هم‌اکنون در کشور مقصد هستم (با پاسپورت قانونی)</option>
                      <option value="tourist">دارای اقامت توریستی / موقت معتبر</option>
                      <option value="work_permit">دارای اقامت کاری فعال (چالیشما ایزنی / ورک پرمیت)</option>
                      <option value="student">اقامت دانشجویی</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>مرحله قبل</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <span>مرحله بعد: مدارک، تعهدنامه و امضا</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: بارگزاری مدارک (پاسپورت، عکس تمام قد با نکات، کارت شناسایی) و تعهدنامه تسویه حساب کارگزار و امضای الکترونیک */}
              {step === 4 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-fadeIn">
                  <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">بخش ۴ از ۴: بارگزاری مدارک، تعهدنامه رسمی تسویه حساب کارگزار و امضای الکترونیکی</strong>
                    برای تکمیل ثبت‌نام و تشکیل پرونده اعزام، بارگزاری مدارک، مطالعه و امضای تعهدنامه الزامی است.
                  </div>

                  {/* 1. DOCUMENT UPLOADS */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-red-500" />
                      <span>بارگزاری مدارک هویتی و پرسنلی متقاضی</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Document 1: عکس تمام قد پرسنلی (الزامی) */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">عکس تمام قد پرسنلی</span>
                            <span className="text-[10px] text-red-400 font-bold">* ضروری و الزامی</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            «قدی ایستاده رو به دوربین با پس‌زمینه ساده»
                          </p>
                        </div>

                        {/* Critical warning notice */}
                        <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[10px] text-amber-200 space-y-0.5">
                          <strong className="block text-amber-300 font-bold">نکات مهم برای عکس تمام قد:</strong>
                          <div>• خانم‌ها بدون آرایش</div>
                          <div>• آقایان بدون ریش بلند (حداکثر ته‌ریش)</div>
                          <div>• ایستاده رو به دوربین و پس‌زمینه ساده</div>
                        </div>

                        <input
                          ref={fullBodyInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setFullBodyPhotoUrl)}
                          className="hidden"
                        />

                        {fullBodyPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-4/3 bg-slate-900">
                            <img
                              src={fullBodyPhotoUrl}
                              alt="پیش‌نمایش عکس تمام قد"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFullBodyPhotoUrl('')}
                              className="absolute top-1.5 left-1.5 p-1 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition"
                              title="حذف و تغییر عکس"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/70 text-emerald-300 rounded text-[10px] font-bold">
                              بارگذاری شد ✓
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fullBodyInputRef.current?.click()}
                            className="border-2 border-dashed border-red-500/50 hover:border-red-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60 group w-full"
                          >
                            <Camera className="w-6 h-6 text-red-400 group-hover:scale-110 mb-1 transition-transform" />
                            <span className="text-[11px] font-bold text-white">
                              بارگذاری عکس تمام قد (لمس کنید)
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">انتخاب از گالری یا دوربین</span>
                          </button>
                        )}
                      </div>

                      {/* Document 2: عکس صفحه اول پاسپورت (ضروری - با چهارگوش مشخص) */}
                      <div className="bg-slate-950/70 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3 flex flex-col justify-between relative">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white flex items-center gap-1.5">
                              <span>عکس صفحه اول پاسپورت</span>
                            </span>
                            <span className="text-[10px] bg-red-600/30 border border-red-500/60 text-red-300 px-2 py-0.5 rounded-full font-bold">
                              * الزامی (چهارگوش مشخص)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            «صفحه مشخصات پاسپورت با کادربندی کامل ۴ گوشه»
                          </p>
                        </div>

                        {/* Four-Corner Requirement Banner */}
                        <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[10px] text-amber-200 space-y-1">
                          <div className="flex items-center gap-1 font-bold text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>قانون ثبت تصویر پاسپورت:</span>
                          </div>
                          <div>• هر چهار گوشه پاسپورت باید کاملاً داخل کادر تصویر مشخص باشد</div>
                          <div>• لبه‌ها، عکس پرسنلی و خطوط کدخوان پاسپورت نباید برش بخورند</div>
                          <div>• بدون انعکاس نور فلاش، روی سطحی صاف و کاملاً خوانا</div>
                        </div>

                        <input
                          ref={passportInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setPassportPhotoUrl)}
                          className="hidden"
                        />

                        {passportPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/80 aspect-4/3 bg-slate-900 group">
                            <img
                              src={passportPhotoUrl}
                              alt="پیش‌نمایش پاسپورت با چهارگوش مشخص"
                              className="w-full h-full object-cover"
                            />
                            {/* Four Corner Viewfinder Markers on Preview */}
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr pointer-events-none" />
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl pointer-events-none" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br pointer-events-none" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl pointer-events-none" />

                            <button
                              type="button"
                              onClick={() => setPassportPhotoUrl('')}
                              className="absolute top-2 left-2 p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition shadow-md"
                              title="حذف و تغییر عکس پاسپورت"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              چهارگوشه پاسپورت تایید شد ✓
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => passportInputRef.current?.click()}
                            className="relative border-2 border-dashed border-amber-500/60 hover:border-amber-400 hover:bg-amber-950/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60 group w-full"
                          >
                            {/* Viewfinder Corners Guide */}
                            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/80 rounded-tr pointer-events-none" />
                            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none" />
                            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none" />
                            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/80 rounded-bl pointer-events-none" />

                            <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 mb-1 transition-transform" />
                            <span className="text-[11px] font-bold text-white">
                              الصاق عکس پاسپورت (۴ گوشه مشخص)
                            </span>
                            <span className="text-[9.5px] text-amber-300/80 mt-0.5">
                              کلیک برای عکس با دوربین یا انتخاب از گالری
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. THE CONTRACT (تعهدنامه تسویه حساب هزینه کارگزار) */}
                  <div className="bg-slate-950 border-2 border-red-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
                    {/* Contract Header */}
                    <div className="text-center border-b border-slate-800 pb-3">
                      <span className="px-3 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded-full text-[11px] font-bold inline-block mb-1.5">
                        سند رسمی تعهدنامه حقوقی و مالی
                      </span>
                      {/* Prominent title with large font as requested */}
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                        تعهدنامه تسویه حساب هزینه کارگزار
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        سامانه رسمی کاریابی و اعزام نیروی کار کارباما
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCommitmentModalOpen(true)}
                        className="mt-2.5 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 mx-auto"
                      >
                        <FileText className="w-4 h-4" />
                        <span>باز کردن تعهدنامه رسمی و امضای دیجیتال در نمای کامل</span>
                      </button>
                    </div>

                    {/* Verbatim Contract Clauses with large bold variables */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-300 leading-loose space-y-3.5 text-justify">
                      <p>
                        اینجانب{' '}
                        <strong className="text-white text-sm sm:text-base font-black px-1.5 py-0.5 bg-red-950/60 border border-red-500/40 rounded-lg">
                          {firstName} {lastName}
                        </strong>{' '}
                        فرزند{' '}
                        <strong className="text-white text-sm sm:text-base font-black px-1.5 py-0.5 bg-red-950/60 border border-red-500/40 rounded-lg">
                          {fatherName}
                        </strong>{' '}
                        به شماره ملی{' '}
                        <strong
                          className="text-amber-300 text-sm sm:text-base font-black font-mono px-1.5 py-0.5 bg-amber-950/50 border border-amber-500/40 rounded-lg inline-block"
                          dir="ltr"
                        >
                          {nationalId}
                        </strong>{' '}
                        با آگاهی کامل از شرایط و ضوابط اقرار و تأیید نمایم که مبلغ{' '}
                        <strong className="text-emerald-300 text-sm sm:text-base font-black px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg">
                          {brokerSettings.brokerServiceFee}
                        </strong>{' '}
                        را بابت هزینه خدمات کارگزار ،مشاوره پشتیبانی و معرفی به کارفرما یا پیمانکار پرداخت نموده ام.
                      </p>

                      <p>
                        اینجانب آگاه هستم که وظیفه کارگزار صرفاً معرفی اینجانب به کارفرما پیمانکار یا فرصت شغلی مورد در خواست بوده و کارگزار هیچ گونه تعهد یا مسئولیتی در قبال استخدام قطعی میزان حقوق و مزایا شرایط کار مدت، همکاری اسکان، بیمه، اقامت مجوز کار یا سایر توافقات احتمالی میان اینجانب و کارفرما یا پیمانکار نخواهد داشت.
                      </p>

                      <p>
                        همچنین تأیید مینمایم که پس از انجام معرفی توسط کارگزار خدمات موضوع این تعهد نامه انجام شده تلقی گردیده و مبلغ پرداختی به عنوان تسویه حساب کامل هزینه خدمات کارگزار محسوب میشود.
                      </p>

                      <p>
                        اینجانب اقرار مینمایم که مبلغ پرداختی فوق تحت هیچ شرایطی قابل استرداد مطالبه عودت یا بازگشت نبوده و حق هرگونه ادعا اعتراض در تمامی مراجع قضایی و یا مطالبه وجه پرداختی را از خود سلب و ساقط مینمایم.
                      </p>

                      <p className="font-semibold text-slate-200">
                        این تعهدنامه با رضایت کامل آگاهی از مفاد آن و بدون هیچ گونه اجبار یا اکراه تنظیم و امضا گردیده و برای اینجانب لازم الاجرا میباشد.
                      </p>
                    </div>

                    {/* Applicant details under contract (with slightly larger font as requested) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 text-xs block mb-1">
                          نام و نام خانوادگی و مشخصات آدرس متقاضی (از بخش قبلی):
                        </span>
                        <div className="text-sm font-bold text-white leading-relaxed">
                          {firstName} {lastName}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          استان {iranProvince}، شهرستان {iranCity}، {iranAddress}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-xs block mb-1">
                          شماره تماس متقاضی (از بخش قبلی):
                        </span>
                        <div className="text-sm font-bold text-emerald-300 font-mono" dir="ltr">
                          {phoneCountryCode} {phoneNumber}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          کشور مقصد: <strong className="text-white">{targetCountry} ({targetCity})</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bank Cards Section: Payer card (collected here) + Broker Destination Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* شماره کارت واریز کننده (که در همینجا از مشتری گرفته میشود) */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                        <label className="block text-xs font-bold text-amber-300">
                          شماره کارت واریز کننده وجه (مشتری) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                          <input
                            type="text"
                            required
                            maxLength={19}
                            lang="en"
                            dir="ltr"
                            inputMode="numeric"
                            placeholder="6037-9975-XXXX-XXXX"
                            value={payerCardNumber}
                            onChange={(e) => {
                              const sanitized = sanitizeCardNumber(e.target.value);
                              setPayerCardNumber(sanitized);
                              checkFieldDuplicate('payerCardNumber', sanitized);
                              const cleanDigits = sanitized.replace(/\D/g, '');
                              if (cleanDigits.length === 16) {
                                inquireSepalBank(cleanDigits);
                              } else {
                                setInquiredPayerBank(null);
                              }
                            }}
                            onBlur={() => checkFieldDuplicate('payerCardNumber', payerCardNumber)}
                            className={`w-full bg-slate-800 border rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden text-left font-mono font-bold ${
                              duplicateErrors.payerCardNumber ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-700 focus:border-amber-500'
                            }`}
                          />
                        </div>

                        {/* Sepal Card Inquiry Feedback */}
                        {isInquiringPayerBank && (
                          <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-bold bg-teal-950/40 border border-teal-500/30 p-2 rounded-xl animate-in fade-in">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>در حال استعلام نام بانک از وب‌سرویس سپال‌یار...</span>
                          </div>
                        )}

                        {!isInquiringPayerBank && inquiredPayerBank && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/40 p-2 rounded-xl animate-in fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>بانک صادرکننده: {inquiredPayerBank} (استعلام رسمی سپال)</span>
                          </div>
                        )}

                        {duplicateErrors.payerCardNumber && (
                          <div className="mt-1 p-2 bg-red-950/90 border border-red-500/80 rounded-xl text-red-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{duplicateErrors.payerCardNumber}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400">
                          شماره کارت ۱۶ رقمی که هزینه کارگزار از آن پرداخت گردیده است (استعلام آنی با سپال).
                        </p>
                      </div>

                      {/* شماره کارت بانکی که مبلغ از آن واریز شده است (شماره کارت خودم / کارگزار) */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          شماره کارت بانکی کارگزار (حساب واریزی مقصد کارباما):
                        </label>
                        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">{brokerSettings.brokerBankName}</span>
                            <span className="text-xs font-bold text-white font-mono" dir="ltr">
                              {brokerSettings.brokerCardNumber}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            تایید شده
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          به نام: {brokerSettings.brokerCardHolder}
                        </p>
                      </div>
                    </div>

                    {/* محل امضاء متقاضی (ایجاد امضای الکترونیکی پیشرفته) */}
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-amber-400" />
                          <span>محل امضاء متقاضی (ایجاد امضای الکترونیکی رسمی)</span>
                          <span className="text-red-400">*</span>
                        </label>

                        {/* Signature Tools Toolbar */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Color palette */}
                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {[
                              { label: 'سرمه‌ای رسمی', color: '#1d4ed8' },
                              { label: 'مشکی اداری', color: '#0f172a' },
                              { label: 'زرشکی سازمانی', color: '#dc2626' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                title={c.label}
                                onClick={() => setSignatureColor(c.color)}
                                className={`w-5 h-5 rounded-full border transition ${
                                  signatureColor === c.color
                                    ? 'ring-2 ring-amber-400 scale-110 border-white'
                                    : 'border-slate-700 opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>

                          {/* Pen thickness */}
                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] text-slate-300">
                            {[
                              { label: 'نازک', w: 2.5 },
                              { label: 'متوسط', w: 3.8 },
                              { label: 'پررنگ', w: 5.5 },
                            ].map((item) => (
                              <button
                                key={item.w}
                                type="button"
                                onClick={() => setSignatureWidth(item.w)}
                                className={`px-2 py-0.5 rounded-lg transition font-medium ${
                                  signatureWidth === item.w
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>

                          {/* Quick Auto-Signature Button */}
                          <button
                            type="button"
                            onClick={generateOfficialCalligraphicSignature}
                            className="px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-500/50 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition shadow-sm"
                            title="ایجاد خودکار امضای رسمی با نام شما و تاریخ قرارداد"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>✍️ ساخت خودکار امضای شکیل با نام</span>
                          </button>

                          {/* Clear Button */}
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition px-2 py-1 rounded-xl hover:bg-slate-800 border border-slate-800"
                          >
                            <Eraser className="w-3.5 h-3.5" />
                            <span>پاک کردن</span>
                          </button>
                        </div>
                      </div>

                      {/* Canvas Pad (Large Responsive Touch Area with 1:1 Scaling) */}
                      <div className="relative border-2 border-dashed border-red-500/50 rounded-2xl bg-white/5 p-1 touch-none">
                        <canvas
                          ref={canvasRef}
                          width={800}
                          height={240}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-48 sm:h-56 bg-slate-950 rounded-xl cursor-crosshair shadow-inner"
                        />

                        {/* Visual Signing Baseline */}
                        <div className="absolute bottom-8 left-6 right-6 border-b border-dashed border-slate-700/60 pointer-events-none flex items-center justify-between text-[10px] text-slate-500">
                          <span>خط تراز امضای متقاضی</span>
                          <span className="font-mono">X ..............................................</span>
                        </div>

                        {!hasDrawnSignature && !signatureDataUrl && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 text-xs gap-1.5 bg-black/10">
                            <span className="text-xl">✍️</span>
                            <span className="font-bold text-slate-200">با انگشت یا قلم در این کادر بزرگ امضا نمایید</span>
                            <span className="text-[10px] text-slate-400">یا دکمه «ساخت خودکار امضای شکیل با نام» در بالا را لمس نمایید</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <span>وضعیت امضا:</span>
                          {hasDrawnSignature || signatureDataUrl ? (
                            <strong className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              امضای رسمی ثبت گردید ✓
                            </strong>
                          ) : (
                            <strong className="text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                              در انتظار امضا (الزامی)
                            </strong>
                          )}
                        </span>
                        <span className="text-slate-500 text-[10px]">امضای الکترونیکی دارای اثر قانونی رسمی است</span>
                      </div>
                    </div>

                    {/* BOTTOM-LEFT: Execution Dates (میلادی و شمسی دقیق) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800 gap-3">
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px] block">طرفین قرارداد:</span>
                        <span className="text-xs font-bold text-white">کارجو: {firstName} {lastName} | کارگزار: سامانه کارباما</span>
                      </div>

                      {/* Accurate Solar and Gregorian Date at bottom-left */}
                      <div className="text-left bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shrink-0" dir="ltr">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>تاریخ عقد قرارداد:</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                          شمسی: <strong className="text-white">{contractDateShamsi}</strong> | میلادی: <strong className="text-white">{contractDateMiladi}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Agreement Checkbox */}
                    <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer bg-slate-900/90 p-3.5 rounded-2xl border border-red-500/30">
                      <input
                        type="checkbox"
                        checked={contractTermsAgreed}
                        onChange={(e) => setContractTermsAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-red-500 h-4 w-4"
                      />
                      <span className="leading-relaxed">
                        اینجانب با آگاهی کامل و رضایت، صحت کلیه مدارک ارسالی (پاسپورت با ۴ گوشه مشخص، عکس تمام قد و کارت شناسایی) و مفاد تعهدنامه تسویه حساب کارگزار را اقرار و تایید می‌نمایم و امضای الکترونیکی فوق متعلق به اینجانب می‌باشد.
                      </span>
                    </label>
                  </div>

                  {/* Inline Error Banner (visible directly above submit button) */}
                  {error && (
                    <div className="p-3.5 bg-red-950/95 border-2 border-red-500 rounded-2xl text-red-100 text-xs flex items-center gap-2.5 shadow-xl animate-shake">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="font-bold leading-relaxed">{error}</span>
                    </div>
                  )}

                  {/* Submission Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>مرحله قبل</span>
                    </button>

                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-xl shadow-xl shadow-red-700/40 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>ثبت نهایی، صدور پرونده رسمی و ورود به مرحله تایید</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5: پرونده رسمی کارجو صادر شد (مرحله نهایی با مدارک تایید شده و امضا) */}
              {step === 5 && (
                <div className="space-y-6 animate-fadeIn py-2">
                  {/* Top Success Celebration Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/80 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/40 animate-bounce">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      🎉 پرونده رسمی کارجو با موفقیت صادر گردید!
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-300 font-semibold mt-1.5 max-w-xl mx-auto leading-relaxed">
                      حساب کاربری شما فعال شد و تمامی مدارک (پاسپورت با ۴ گوشه مشخص، عکس پرسنلی و امضای دیجیتال رسمی) در پرونده مرکزی کارباما ثبت و ذخیره گردید.
                    </p>

                    <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-full text-xs text-emerald-200 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>کد رهگیری پرونده: <strong className="font-mono text-white text-sm" dir="ltr">{registeredSeeker?.id || `KB-${Date.now().toString().slice(-6)}`}</strong></span>
                    </div>
                  </div>

                  {/* کارت پرونده جامع الکترونیک کارجو */}
                  <div className="bg-slate-950 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
                    {/* Header of Dossier */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="/logo.png"
                          alt="کارباما"
                          className="w-12 h-12 rounded-full border-2 border-amber-400 shadow-md object-cover"
                        />
                        <div>
                          <h3 className="text-base font-black text-white flex items-center gap-1.5">
                            <span>کارت پرونده رسمی کارجو</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                              معتبر و تایید شده
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400">سامانه کاریابی و اعزام نیروی کار کارباما</p>
                        </div>
                      </div>

                      <div className="text-left bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono" dir="ltr">
                        <div className="text-amber-300 font-bold">تاریخ صدور پرونده:</div>
                        <div className="text-slate-300 text-[11px] mt-0.5">{contractDateShamsi} / {contractDateMiladi}</div>
                      </div>
                    </div>

                    {/* Document Photos Grid (Passport & Full-Body) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full-Body Photo */}
                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-emerald-400" />
                            <span>عکس پرسنلی تمام قد</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            تایید شده ✓
                          </span>
                        </div>
                        <div className="h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                          {fullBodyPhotoUrl ? (
                            <img
                              src={fullBodyPhotoUrl}
                              alt="عکس تمام قد کارجو"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-slate-500">تصویر ثبت شده</div>
                          )}
                        </div>
                      </div>

                      {/* Passport Photo (4 corners verified) */}
                      <div className="bg-slate-900 p-3 rounded-2xl border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-400" />
                            <span>عکس پاسپورت (۴ گوشه مشخص)</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            چهارگوشه احراز شد ✓
                          </span>
                        </div>
                        <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-emerald-500/30 flex items-center justify-center">
                          {/* Corner Markers */}
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr pointer-events-none z-10" />
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl pointer-events-none z-10" />
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br pointer-events-none z-10" />
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl pointer-events-none z-10" />

                          {passportPhotoUrl ? (
                            <img
                              src={passportPhotoUrl}
                              alt="عکس پاسپورت با چهارگوش مشخص"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-slate-500">تصویر پاسپورت</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Identity and Destination Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">نام و نام خانوادگی:</span>
                        <strong className="text-white text-sm font-black">{firstName} {lastName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">نام پدر:</span>
                        <strong className="text-white">{fatherName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">کد ملی / شماره پاسپورت:</span>
                        <strong className="text-amber-300 font-mono" dir="ltr">{nationalId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">شماره تماس:</span>
                        <strong className="text-emerald-300 font-mono" dir="ltr">{phoneCountryCode} {phoneNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">کشور مقصد:</span>
                        <strong className="text-white">{targetCountry} ({targetCity})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">شغل‌های درخواستی:</span>
                        <strong className="text-white truncate block">{selectedJobs.join('، ') || customProfession || 'عمومی'}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                        <span className="text-slate-400">
                          آدرس سکونت: <strong className="text-slate-200">استان {iranProvince}، شهرستان {iranCity}، {iranAddress}</strong>
                        </span>
                        <span className="text-emerald-400 font-bold">
                          تسویه حساب کارگزار: {brokerSettings.brokerServiceFee} (کارت: {payerCardNumber || 'ثبت شده'}) ✓
                        </span>
                      </div>
                    </div>

                    {/* Official Electronic Signature Card */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>امضای الکترونیکی ثبت شده متقاضی</span>
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                          امضای دیجیتال رسمی دارای اثر قانونی لازم‌الاجرا
                        </span>
                      </div>

                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
                        {signatureDataUrl ? (
                          <img
                            src={signatureDataUrl}
                            alt="امضای رسمی متقاضی"
                            className="max-h-24 w-auto object-contain filter drop-shadow-md"
                          />
                        ) : (
                          <div className="text-xs text-slate-500 py-4">امضای الکترونیکی ثبت شده در پرونده</div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          تایید شده توسط {firstName} {lastName} • {contractDateShamsi}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions to enter Karbama or view contract */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCommitmentModalOpen(true)}
                      className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>مشاهده و چاپ تعهدنامه حقوقی با امضا</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>ورود به سامانه کارباما و مشاهده آگهی‌های شغلی</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login Form (Seeker or Admin) */
            <div className="min-h-full flex flex-col justify-center max-w-md w-full mx-auto py-2">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {mode === 'admin' ? (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200">
                    بخش ورود امن مدیریت سامانه کارباما. لطفاً نام کاربری و رمز عبور مدیریت را وارد نمایید.
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs text-slate-300">
                    جهت ورود به پنل کارجو، <strong>نام کاربری (یوزرنیم)</strong> و <strong>رمز عبور (پسوورد)</strong> خود را وارد نمایید.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">نام کاربری (یوزرنیم)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder={mode === 'admin' ? 'admin' : 'username'}
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">رمز عبور (پسوورد)</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPasswordModal(true);
                          setRecoverResult(null);
                          setRecoverInput('');
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        فراموشی رمز عبور؟
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
                    mode === 'admin'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-700/30'
                      : 'bg-red-600 hover:bg-red-500 shadow-red-700/30'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  {mode === 'admin' ? 'ورود به پنل مدیریت' : 'ورود به حساب کارجو'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <KeyRound className="w-5 h-5" />
                <span>بازیابی رمز عبور کارباما</span>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              جهت بازیابی رمز عبور، آدرس ایمیل ثبت‌شده هنگام ثبت‌نام یا نام کاربری خود را وارد نمایید.
            </p>

            {recoverResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  recoverResult.success
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
                }`}
              >
                {recoverResult.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ایمیل یا نام کاربری (یوزرنیم)
              </label>
              <input
                type="text"
                dir="ltr"
                value={recoverInput}
                onChange={(e) => setRecoverInput(e.target.value)}
                placeholder="example@gmail.com یا ali_reza"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono text-left"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!recoverInput.trim()) return;
                  const res = recoverPassword(recoverInput);
                  setRecoverResult({
                    success: res.success,
                    message: res.message || res.error || '',
                  });
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-700/30"
              >
                ارسال لینک / بازیابی رمز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMITMENT MODAL POPUP */}
      <CommitmentModal
        isOpen={isCommitmentModalOpen}
        onClose={() => setIsCommitmentModalOpen(false)}
        fullName={`${firstName} ${lastName}`.trim()}
        fatherName={fatherName}
        nationalId={nationalId}
        phone={`${phoneCountryCode} ${phoneNumber}`}
        iranProvince={iranProvince}
        iranCity={iranCity}
        iranAddress={iranAddress}
        targetCountry={targetCountry}
        payerCardNumber={payerCardNumber}
        passportPhotoUrl={passportPhotoUrl}
        fullBodyPhotoUrl={fullBodyPhotoUrl}
        nationalCardPhotoUrl={nationalCardPhotoUrl}
        signatureDataUrl={signatureDataUrl}
        onSaveSignature={(sigUrl) => {
          setSignatureDataUrl(sigUrl);
          setHasDrawnSignature(true);
        }}
        onAcceptAndSubmit={() => {
          setIsCommitmentModalOpen(false);
          setStep(4);
        }}
      />
    </div>
  );
};
