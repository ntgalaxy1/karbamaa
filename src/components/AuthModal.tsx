import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TurkishLevel, ResidenceStatus, TargetCountry, Gender } from '../types';
import { CommitmentModal } from './CommitmentModal';
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
  Calendar,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Briefcase,
  Languages,
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
    loginSeeker,
    loginAdmin,
    switchToDemoUser,
    switchToDemoAdmin,
    brokerSettings,
    setActiveTab,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(defaultMode);

  // 4-step wizard step
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. مشخصات فردی و حساب ورود (ضروری)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+98');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2. آدرس دقیق سکونت ایران و تعیین کشور مقصد (۴ کشور)
  const [iranProvince, setIranProvince] = useState('تهران');
  const [iranCity, setIranCity] = useState('');
  const [iranAddress, setIranAddress] = useState('');
  const [targetCountry, setTargetCountry] = useState<TargetCountry>('ترکیه');
  const [targetCity, setTargetCity] = useState('استانبول');

  // 3. شغل‌ها، تخصص‌ها، جستجو، حرفه کارجو، تسلط به زبان کشور انتخابی و زبان‌های بلدم
  const [selectedJobs, setSelectedJobs] = useState<string[]>(['سرآشپز غذاهای ایرانی و فرنگی']);
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
  const [contractTermsAgreed, setContractTermsAgreed] = useState<boolean>(true);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState<boolean>(false);

  // Canvas Signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Date constants
  const contractDateShamsi = getShamsiDateString();
  const contractDateMiladi = getMiladiDateString();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Error message
  const [error, setError] = useState<string | null>(null);

  // Initialize canvas when entering Step 4
  useEffect(() => {
    if (step === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [step]);

  if (!isOpen) return null;

  // Signature pad methods
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
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
    if (!cleanNatId || cleanNatId.length !== 10 || !/^\d+$/.test(cleanNatId)) {
      setError('کد ملی باید دقیقاً ۱۰ رقم عددی باشد.');
      return false;
    }
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 7 || !/^\d+$/.test(cleanPhone)) {
      setError('لطفاً شماره تلفن همراه معتبر را وارد کنید.');
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
    if (!password.trim() || password.trim().length < 5) {
      setError('رمز عبور باید حداقل ۵ کاراکتر باشد.');
      return false;
    }
    return true;
  };

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
    if (!passportPhotoUrl) {
      setError('بارگذاری عکس صفحه اصلی پاسپورت الزامی است.');
      return false;
    }
    if (!fullBodyPhotoUrl) {
      setError('بارگذاری عکس تمام قد ایستاده (با رعایت نکات آرایش و ریش) الزامی است.');
      return false;
    }
    const cleanPayerCard = payerCardNumber.replace(/\D/g, '');
    if (!cleanPayerCard || cleanPayerCard.length < 16) {
      setError('لطفاً شماره کارت ۱۶ رقمی واریز کننده وجه را به درستی وارد نمایید.');
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
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
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
      onClose();
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
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-700/30 via-slate-850 to-slate-900 border-b border-slate-800">
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
        <div className="grid grid-cols-4 p-1.5 mx-6 mt-4 bg-slate-950/70 border border-slate-800 rounded-2xl gap-1 text-xs font-semibold">
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
              setActiveTab('partner');
              onClose();
            }}
            className="py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/50 border border-indigo-500/20"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">بخش همکار</span>
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
          <div className="mx-6 mt-3 p-3 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0 animate-ping"></span>
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 max-h-[76vh] overflow-y-auto">
          {mode === 'register' ? (
            <div>
              {/* Wizard Steps Progress Indicator */}
              <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { s: 1, title: '۱. مشخصات فردی', desc: 'هویت و رمز ورود', icon: User },
                    { s: 2, title: '۲. سکونت و مقصد', desc: 'ایران و ۴ کشور', icon: MapPin },
                    { s: 3, title: '۳. شغل و زبان‌ها', desc: 'جستجو، تخصص و زبان', icon: Briefcase },
                    { s: 4, title: '۴. مدارک و تعهدنامه', desc: 'عکس، تسویه و امضا', icon: FileCheck },
                  ].map((item) => {
                    const isDone = step > item.s;
                    const isCurrent = step === item.s;
                    const StepIcon = item.icon;
                    return (
                      <button
                        key={item.s}
                        type="button"
                        onClick={() => {
                          if (item.s < step) setStep(item.s as 1 | 2 | 3 | 4);
                        }}
                        className={`text-right p-2.5 rounded-2xl border transition relative ${
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
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        کد ملی (۱۰ رقم) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <IdCard className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="0012345678"
                          dir="ltr"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number with Country Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      شماره تلفن همراه (با تعیین پیش‌شماره کشور) <span className="text-red-400">*</span>
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
                          placeholder="912 345 6789"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>
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
                            dir="ltr"
                            placeholder="ali_reza"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          رمز عبور (پسوورد) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            dir="ltr"
                            placeholder="حداقل ۵ کاراکتر"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                  {/* Target City within chosen country - Excluded for Turkey as requested */}
                  {targetCountry !== 'ترکیه' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        شهر مد نظر در کشور مقصد ({targetCountry})
                      </label>
                      <div className="relative">
                        <Compass className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                        <input
                          type="text"
                          placeholder="مثال: ایروان / اربیل / برلین..."
                          value={targetCity}
                          onChange={(e) => setTargetCity(e.target.value)}
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Document 1: عکس پاسپورت */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">عکس پاسپورت</span>
                            <span className="text-[10px] text-red-400 font-bold">* ضروری</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            «صفحه اصلی پاسپورت کامل و خوانا»
                          </p>
                        </div>

                        {passportPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-4/3 bg-slate-900">
                            <img
                              src={passportPhotoUrl}
                              alt="پیش‌نمایش پاسپورت"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPassportPhotoUrl('')}
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
                          <label className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60 group">
                            <Upload className="w-6 h-6 text-slate-500 group-hover:text-red-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
                              انتخاب تصویر پاسپورت
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">JPG یا PNG حداکثر ۸MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setPassportPhotoUrl)}
                              className="hidden"
                            />
                          </label>
                        )}

                        {!passportPhotoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setPassportPhotoUrl(
                                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
                              )
                            }
                            className="text-[10px] text-slate-400 hover:text-red-400 underline self-center"
                          >
                            استفاده از نمونه پاسپورت
                          </button>
                        )}
                      </div>

                      {/* Document 2: عکس تمام قد با نکات مهم ریش و آرایش */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">عکس تمام قد</span>
                            <span className="text-[10px] text-red-400 font-bold">* ضروری</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            «قدی ایستاده با پس‌زمینه ساده»
                          </p>
                        </div>

                        {/* Critical warning notice requested by user */}
                        <div className="p-2 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[10px] text-amber-200 space-y-0.5">
                          <strong className="block text-amber-300 font-bold">نکات مهم برای عکس تمام قد:</strong>
                          <div>• خانم‌ها بدون آرایش</div>
                          <div>• آقایان بدون ریش بلند (حداکثر ته‌ریش)</div>
                          <div>• ایستاده رو به دوربین و پس‌زمینه ساده</div>
                        </div>

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
                          <label className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60 group">
                            <Camera className="w-6 h-6 text-slate-500 group-hover:text-red-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
                              انتخاب عکس تمام قد
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setFullBodyPhotoUrl)}
                              className="hidden"
                            />
                          </label>
                        )}

                        {!fullBodyPhotoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setFullBodyPhotoUrl(
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
                              )
                            }
                            className="text-[10px] text-slate-400 hover:text-red-400 underline self-center"
                          >
                            استفاده از نمونه عکس پرسنلی
                          </button>
                        )}
                      </div>

                      {/* Document 3: محل الصاق و یا اسکن کارت شناسایی */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">کارت شناسایی</span>
                            <span className="text-[10px] text-slate-400">کارت ملی / شناسنامه</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            «محل الصاق و یا اسکن کارت شناسایی»
                          </p>
                        </div>

                        {nationalCardPhotoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-4/3 bg-slate-900">
                            <img
                              src={nationalCardPhotoUrl}
                              alt="پیش‌نمایش کارت شناسایی"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setNationalCardPhotoUrl('')}
                              className="absolute top-1.5 left-1.5 p-1 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition"
                              title="حذف و تغییر کارت"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/70 text-emerald-300 rounded text-[10px] font-bold">
                              الصاق شد ✓
                            </span>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/60 group">
                            <IdCard className="w-6 h-6 text-slate-500 group-hover:text-red-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
                              الصاق یا اسکن کارت ملی
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">تصویر واضح از روی کارت</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setNationalCardPhotoUrl)}
                              className="hidden"
                            />
                          </label>
                        )}

                        {!nationalCardPhotoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setNationalCardPhotoUrl(
                                'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
                              )
                            }
                            className="text-[10px] text-slate-400 hover:text-red-400 underline self-center"
                          >
                            استفاده از نمونه کارت شناسایی
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
                            dir="ltr"
                            placeholder="6037-9975-XXXX-XXXX"
                            value={payerCardNumber}
                            onChange={(e) => {
                              // format with dashes
                              const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = clean.match(/.{1,4}/g)?.join('-') || clean;
                              setPayerCardNumber(formatted);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 text-left font-mono font-bold"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          شماره کارت ۱۶ رقمی که هزینه کارگزار از آن پرداخت گردیده است.
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

                    {/* محل امضاء متقاضی (ایجاد امضای الکترونیکی) */}
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span>محل امضاء متقاضی (ایجاد امضای الکترونیکی رسمی)</span>
                          <span className="text-red-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-800"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          <span>پاک کردن امضا</span>
                        </button>
                      </div>

                      {/* Canvas Pad */}
                      <div className="relative border-2 border-dashed border-red-500/40 rounded-2xl bg-white/5 p-1 touch-none">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-28 bg-slate-950/80 rounded-xl cursor-crosshair"
                        />
                        {!hasDrawnSignature && !signatureDataUrl && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs gap-1.5">
                            <span>✍️ با لمس صفحه یا کشیدن ماوس در این کادر امضا کنید</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          وضعیت امضا:{' '}
                          {hasDrawnSignature || signatureDataUrl ? (
                            <strong className="text-emerald-400">امضا ثبت گردید ✓</strong>
                          ) : (
                            <strong className="text-amber-400">در انتظار امضا</strong>
                          )}
                        </span>
                        <span className="text-slate-500">امضای دیجیتال دارای اثر قانونی است</span>
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
                        اینجانب با آگاهی کامل و رضایت، صحت کلیه مدارک ارسالی (پاسپورت، عکس تمام قد و کارت شناسایی) و مفاد تعهدنامه تسویه حساب کارگزار را اقرار و تایید می‌نمایم و امضای الکترونیکی فوق متعلق به اینجانب می‌باشد.
                      </span>
                    </label>
                  </div>

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
                      className="flex-1 py-3.5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-xl shadow-xl shadow-red-700/40 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>ثبت نهایی، صدور پرونده کارجو و ورود مستقیم به کارباما</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Login Form (Seeker or Admin) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {mode === 'admin' ? (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200">
                  اطلاعات پیش‌فرض ورود مدیر: <strong>نام کاربری: admin</strong> | <strong>رمز عبور: admin123</strong>
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
                    placeholder={mode === 'admin' ? 'admin' : 'ali_reza'}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 text-left font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رمز عبور (پسوورد)</label>
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
          )}
        </div>
      </div>

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
          handleRegisterSubmit();
        }}
      />
    </div>
  );
};
