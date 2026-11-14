import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { JobVacancy, JobCategory, TurkishLevel, ContractType } from '../types';
import { AuthModal } from './AuthModal';
import { JobAlertModal } from './JobAlertModal';
import {
  Search,
  MapPin,
  Building,
  DollarSign,
  Home,
  Shield,
  Utensils,
  FileCheck,
  Phone,
  MessageCircle,
  Clock,
  Filter,
  CheckCircle,
  ExternalLink,
  Info,
  X,
  Send,
  AlertCircle,
  Sparkles,
  Edit,
  Eye,
  Lock,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  Scissors,
  Hotel as HotelIcon,
  Package,
  Wrench,
  Languages,
  ShoppingBag,
  RotateCcw,
  Tag,
  Heart,
  Bookmark,
  Briefcase,
  Hash,
  Check,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Hammer,
  Truck,
  Car,
  Calendar,
  CheckSquare,
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { JobImagePicker } from './JobImagePicker';
import { SepalGatewayModal } from './SepalGatewayModal';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { ALL_TURKEY_CITIES_FA, CITIES_WITH_ALL } from '../data/turkeyCities';
import { getDistrictsForCity } from '../data/turkeyData';

const CITIES = ['همه شهرها', 'استانبول', 'آنتالیا', 'آنکارا', 'ازمیر', 'بورسا'];

const CATEGORIES: { key: string; label: string; icon: any }[] = [
  { key: 'all', label: 'همه دسته‌ها', icon: Filter },
  { key: 'restaurant', label: 'رستوران و کافه', icon: Utensils },
  { key: 'textile', label: 'خیاطی و پوشاک', icon: Scissors },
  { key: 'construction', label: 'ساختمانی و فنی', icon: Wrench },
  { key: 'hotel', label: 'هتل و گردشگری', icon: HotelIcon },
  { key: 'realestate', label: 'املاک و مستغلات', icon: Home },
  { key: 'beauty', label: 'آرایشگری و زیبایی', icon: Sparkles },
  { key: 'warehouse', label: 'انبار و بسته‌بندی', icon: Package },
  { key: 'sales', label: 'فروش و بازاریابی', icon: ShoppingBag },
  { key: 'transport', label: 'رانندگی و دلیوری', icon: Truck },
  { key: 'furniture', label: 'نجاری و مبلمان', icon: Hammer },
  { key: 'automotive', label: 'تعمیرات خودرو', icon: Car },
  { key: 'translator', label: 'مترجمی و سلامت', icon: Languages },
  { key: 'technical', label: 'فنی و مهندسی', icon: Wrench },
];

const CONTRACT_TYPES: { key: 'all' | ContractType; label: string; badge: string; color: string }[] = [
  { key: 'all', label: 'همه قراردادها', badge: 'همه', color: 'slate' },
  { key: 'full_time', label: 'تمام وقت (Full-Time)', badge: 'تمام وقت', color: 'emerald' },
  { key: 'part_time', label: 'پاره وقت (Part-Time)', badge: 'پاره وقت', color: 'sky' },
  { key: 'seasonal', label: 'فصلی / پروژه‌ای (Seasonal)', badge: 'فصلی', color: 'amber' },
];

const POPULAR_KEYWORDS = [
  'پاره وقت',
  'تمام وقت',
  'جای خواب',
  'چالیشما',
  'بدون نیاز به زبان',
  'بیمه SGK',
  'رستوران',
  'آشپز',
  'خیاطی',
  'مرتر',
  'هتل',
  'آنتالیا',
  'انبارداری',
  'مترجم',
  'فروشنده',
  'باریستا',
  'تکنسین',
];

const QUICK_TITLES = [
  'همه عناوین',
  'کمک‌آشپز و سالن‌کار',
  'چرخکار صنعتی و خیاط',
  'پذیرش هتل',
  'کارگر انبار',
  'مترجم توریسم درمانی',
  'فروشنده مرکز خرید',
  'تکنسین برق',
  'باریستا کافه',
];

const SALARY_PRESETS = [
  { label: 'همه حقوق‌ها', min: 25000, max: 80000 },
  { label: 'بالای ۳۲,۰۰۰ ₺', min: 32000, max: 80000 },
  { label: 'بالای ۳۵,۰۰۰ ₺', min: 35000, max: 80000 },
  { label: 'بالای ۴۰,۰۰۰ ₺', min: 40000, max: 80000 },
  { label: 'بالای ۴۵,۰۰۰ ₺ (تخصصی)', min: 45000, max: 80000 },
];

export const JobSearch: React.FC = () => {
  const {
    jobs,
    currentSeeker,
    applyForJob,
    applications,
    isAdminLoggedIn,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    showToast,
    savedJobIds,
    toggleSaveJob,
    isJobSaved,
    jobAlerts,
    favoriteJobCategories,
    toggleFavoriteCategory,
    openedJobIdFromAlert,
    setOpenedJobIdFromAlert,
    setActiveTab,
    paymentSettings,
    addAdminNotification,
    appLanguage,
    setAdminJobModalOpen,
    approveSeekerAccount,
    updateProfile,
    submitJobWithPayment,
  } = useApp();

  const seekerFeeToman = (paymentSettings.feeTL || 500) * (paymentSettings.exchangeRateToman || 5460);
  const seekerFeeRial = seekerFeeToman * 10;

  // Handle Official Sepal Gateway Callback URL parameters (?payment=success&provider=sepal&refId=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const refId = params.get('refId') || params.get('RefNum') || params.get('paymentNumber');
      if (paymentStatus === 'success' && refId) {
        const pendingJobRaw = localStorage.getItem('karbama_pending_sepal_job');
        if (pendingJobRaw) {
          try {
            const pendingJob = JSON.parse(pendingJobRaw);
            localStorage.removeItem('karbama_pending_sepal_job');
            submitJobWithPayment({
              ...pendingJob,
              paymentMethod: 'sepal',
              paymentStatus: 'pending_approval',
              paymentReferenceId: refId,
            });
            showToast(
              `✅ پرداخت آگهی شما در درگاه سپال با کد رهگیری ${refId} تایید و جهت انتشار به مدیریت ارجاع شد.`,
              'success'
            );
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          } catch {
            // fallback to seeker flow
          }
        }

        if (currentSeeker) {
          updateProfile({
            seekerPaymentStatus: 'paid',
            seekerPaymentMethod: 'sepal',
            seekerPaymentRefId: refId,
            seekerPaidAmount: `${seekerFeeToman.toLocaleString('fa-IR')} تومان`,
            seekerPaymentCurrency: 'IRT',
            verificationStatus: 'pending',
            isPaymentVerified: false,
            adminVerificationNote: `پرداخت موفق درگاه رسمی سپال | کد رهگیری: ${refId} | تاریخ: ${new Date().toLocaleDateString('fa-IR')}`,
          });
          addAdminNotification({
            type: 'seeker_payment_referred',
            title: '💳 پرداخت آنلاین هزینه خدمات توسط کارجو (درگاه رسمی سپال)',
            message: `کارجو «${currentSeeker.fullName}» با کد ملی ${currentSeeker.nationalId} مبلغ هزینه خدمات مصوب (${seekerFeeToman.toLocaleString('fa-IR')} تومان) را از طریق درگاه پرداخت سپال پرداخت نمود (کد رهگیری: ${refId}). لطفاً پس از بررسی، قفل دسترسی ایشان را در پنل مدیریت فعال فرمایید.`,
            data: {
              seekerId: currentSeeker.id,
              paymentRefId: refId,
              method: 'sepal',
            },
          });
        }
        setIsReferredToAdmin(true);
        showToast(
          `✅ پرداخت شما از درگاه رسمی سپال با کد رهگیری ${refId} ثبت و جهت فعال‌سازی قفل به مدیریت ارسال شد.`,
          'success'
        );
        // Clean URL query params
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'failed') {
        showToast('⚠️ تراکنش پرداخت در درگاه سپال لغو شد یا ناموفق بود.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, [currentSeeker?.id]);

  // Payment referral state for locked jobseeker with Receipt Photo Upload & AI Verification
  const receiptFileInputRef = useRef<HTMLInputElement>(null);
  const [paymentReceiptPhoto, setPaymentReceiptPhoto] = useState<string | null>(null);
  const [paymentRefNote, setPaymentRefNote] = useState('');
  const [isReferredToAdmin, setIsReferredToAdmin] = useState(false);
  const [isSepalModalOpen, setIsSepalModalOpen] = useState(false);
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [receiptAiResult, setReceiptAiResult] = useState<{
    tested: boolean;
    isBankReceipt: boolean;
    confidence?: string;
    detectedType?: string;
    reason: string;
    extractedInfo?: {
      amount?: string;
      trackingCode?: string;
      bankName?: string;
      dateTime?: string;
      senderOrReceiver?: string;
    };
  } | null>(null);

  // Client-side visual metrics extractor for intelligent bank receipt detection
  const extractVisualMetrics = async (base64: string): Promise<{
    width: number;
    height: number;
    aspectRatio: number;
    skinRatio: number;
    docPatternScore: number;
    edgeEnergy: number;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || 100;
          const h = img.naturalHeight || 100;
          const sampleSize = 100;
          const canvas = document.createElement('canvas');
          canvas.width = sampleSize;
          canvas.height = sampleSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({ width: w, height: h, aspectRatio: w / h, skinRatio: 0, docPatternScore: 50, edgeEnergy: 20 });
          }
          ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
          let skinPixels = 0;
          let edgeSum = 0;
          const total = sampleSize * sampleSize;
          let brightPixels = 0;
          let darkPixels = 0;

          for (let y = 0; y < sampleSize; y++) {
            for (let x = 0; x < sampleSize; x++) {
              const idx = (y * sampleSize + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum > 200) brightPixels++;
              if (lum < 50) darkPixels++;

              // Skin tone detector
              if (r > 95 && g > 40 && b > 20 && r > g && g > b && (r - g) > 15 && (r - b) > 15) {
                skinPixels++;
              }

              // Horizontal edge variation (text lines)
              if (x < sampleSize - 1) {
                const nextIdx = (y * sampleSize + (x + 1)) * 4;
                const nextLum = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
                edgeSum += Math.abs(lum - nextLum);
              }
            }
          }

          const skinRatio = skinPixels / total;
          const edgeEnergy = edgeSum / total;
          const docPatternScore = ((brightPixels + darkPixels) / total) * 100;

          resolve({
            width: w,
            height: h,
            aspectRatio: w / h,
            skinRatio,
            docPatternScore,
            edgeEnergy,
          });
        } catch {
          resolve({ width: 100, height: 100, aspectRatio: 1, skinRatio: 0, docPatternScore: 50, edgeEnergy: 20 });
        }
      };
      img.onerror = () => {
        resolve({ width: 100, height: 100, aspectRatio: 1, skinRatio: 0, docPatternScore: 50, edgeEnergy: 20 });
      };
      img.src = base64;
    });
  };

  const verifyReceiptWithAI = async (base64Data: string) => {
    setIsVerifyingReceipt(true);
    setReceiptAiResult(null);
    try {
      const visualFeatures = await extractVisualMetrics(base64Data);
      const res = await fetch('/api/ai/verify-bank-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, visualFeatures }),
      });
      const data = await res.json();
      const isBank = Boolean(data.isBankReceipt);
      setReceiptAiResult({
        tested: true,
        isBankReceipt: isBank,
        confidence: data.confidence || 'high',
        detectedType: data.detectedType,
        reason: data.reason || (isBank ? 'فیش بانکی معتبر تایید شد.' : 'تصویر ارسال‌شده شبیه فیش بانکی نمی‌باشد.'),
        extractedInfo: data.extractedInfo,
      });

      if (isBank) {
        showToast('✅ اصالت فیش بانکی توسط هوش مصنوعی کارباما تایید شد.', 'success');
      } else {
        showToast('⚠️ تصویر ارسالی شبیه فیش بانکی نیست! لطفاً فیش صحیح را مجدداً ارسال فرمایید.', 'error');
      }
    } catch (err) {
      console.error('Receipt verification failed:', err);
      setReceiptAiResult({
        tested: true,
        isBankReceipt: false,
        reason: 'خطا در ارتباط با سامانه هوش مصنوعی. لطفاً تصویر واضح از فیش بانکی را مجدداً ارسال فرمایید.',
      });
      showToast('خطا در ارزیابی هوش مصنوعی؛ لطفاً مجدداً تصویر فیش را ارسال فرمایید.', 'error');
    } finally {
      setIsVerifyingReceipt(false);
    }
  };

  const handlePaymentReceiptPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم تصویر فیش نباید بیشتر از ۱۰ مگابایت باشد.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        setPaymentReceiptPhoto(base64);
        verifyReceiptWithAI(base64);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can pick the exact same file name if re-trying
    e.target.value = '';
  };

  // Top View Mode: All Jobs vs Saved Jobs
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'saved'>('all');

  // Collapsible Advanced Filters State
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Job Alert Modal State
  const [jobAlertModalOpen, setJobAlertModalOpen] = useState(false);

  // Automatically open job details when clicked from Notification Drawer
  useEffect(() => {
    if (openedJobIdFromAlert) {
      const match = jobs.find((j) => j.id === openedJobIdFromAlert);
      if (match) {
        setSelectedJob(match);
        setOpenedJobIdFromAlert(null);
      }
    }
  }, [openedJobIdFromAlert, jobs, setOpenedJobIdFromAlert]);

  // Search input and target scope
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'title' | 'keywords'>('all');

  // Dedicated Title filter
  const [selectedQuickTitle, setSelectedQuickTitle] = useState('همه عناوین');

  // Dedicated Contract Type filter (پاره وقت، تمام وقت، فصلی)
  const [selectedContractType, setSelectedContractType] = useState<'all' | ContractType>('all');

  // Dedicated Active Keywords tags
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeywordInput, setCustomKeywordInput] = useState('');

  // Location & Category
  const [selectedCity, setSelectedCity] = useState('همه شهرها');
  const [selectedDistrict, setSelectedDistrict] = useState('همه منطقه‌ها');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  // Salary Frequency Filter (روززد، هفتگی، ماهیانه)
  const [payFrequencyFilter, setPayFrequencyFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  // Refined Salary Range State
  const [minSalary, setMinSalary] = useState<number>(25000);
  const [maxSalary, setMaxSalary] = useState<number>(75000);

  // Perks/Features Filters
  const [accommodationOnly, setAccommodationOnly] = useState(false);
  const [workPermitOnly, setWorkPermitOnly] = useState(false);
  const [leaveOnly, setLeaveOnly] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'newest' | 'salaryHigh' | 'salaryLow' | 'benefits'>('newest');

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [applyNote, setApplyNote] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [applySuccessModal, setApplySuccessModal] = useState(false);

  // Admin Quick Edit state
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);

  // Admin Add Job Modal State
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('استانبول');
  const [newDistrict, setNewDistrict] = useState('فاتیح');
  const [newCategory, setNewCategory] = useState<JobCategory>('restaurant');
  const [newSubcategory, setNewSubcategory] = useState('کمک‌آشپز و سالن‌کار');
  const [newPayFrequency, setNewPayFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [newSalaryMin, setNewSalaryMin] = useState(32000);
  const [newSalaryMax, setNewSalaryMax] = useState(40000);
  const [newAccommodation, setNewAccommodation] = useState(true);
  const [newMeals, setNewMeals] = useState(true);
  const [newHasLeave, setNewHasLeave] = useState(true);
  const [newLeaveDetails, setNewLeaveDetails] = useState('۱ روز در هفته');
  const [newWorkPermitSupport, setNewWorkPermitSupport] = useState(true);
  const [newContractType, setNewContractType] = useState<ContractType>('full_time');
  const [newTurkishRequired, setNewTurkishRequired] = useState<TurkishLevel>('basic');
  const [newKeywords, setNewKeywords] = useState('رستوران، آشپزی، جای خواب');
  const [newDescription, setNewDescription] = useState('');
  const [newPhone, setNewPhone] = useState('+90 532 000 0000');
  const [newWhatsapp, setNewWhatsapp] = useState('+90 532 000 0000');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newDescription.trim()) {
      showToast('لطفاً عنوان، نام کارفرما و توضیحات کار را وارد نمایید', 'error');
      return;
    }
    const kwList = newKeywords.split('،').join(',').split(',').map((k) => k.trim()).filter(Boolean);

    addJob({
      title: newTitle.trim(),
      company: newCompany.trim(),
      city: newCity,
      district: newDistrict.trim(),
      category: newCategory,
      subcategory: newSubcategory.trim(),
      contractType: newContractType,
      payFrequency: newPayFrequency,
      keywords: kwList.length > 0 ? kwList : [newCategory, newCity],
      salaryMin: Number(newSalaryMin) || 30000,
      salaryMax: Number(newSalaryMax) || 38000,
      currency: 'TRY',
      accommodation: newAccommodation,
      meals: newMeals,
      hasLeave: newHasLeave,
      leaveDetails: newHasLeave ? newLeaveDetails.trim() : undefined,
      workPermitSupport: newWorkPermitSupport,
      turkishRequired: newTurkishRequired,
      gender: 'all',
      imageUrl: newImageUrl.trim(),
      description: newDescription.trim(),
      requirements: ['انضباط کاری و مسئولیت‌پذیری'],
      contactPhone: newPhone.trim(),
      contactWhatsapp: newWhatsapp.trim(),
      isActive: true,
    });

    setShowAddJobModal(false);
    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    showToast('فرصت شغلی جدید با مشخصات کامل ثبت شد', 'success');
  };

  // Base list depending on activeViewTab (All vs Saved)
  const baseJobs = useMemo(() => {
    if (activeViewTab === 'saved') {
      return jobs.filter((j) => savedJobIds.includes(j.id));
    }
    return jobs;
  }, [jobs, activeViewTab, savedJobIds]);

  // Calculate dynamic job count per category, city, and contract type
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseJobs.filter((j) => j.isActive || isAdminLoggedIn).length };
    baseJobs.forEach((j) => {
      if (j.isActive || isAdminLoggedIn) {
        counts[j.category] = (counts[j.category] || 0) + 1;
      }
    });
    return counts;
  }, [baseJobs, isAdminLoggedIn]);

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = { 'همه شهرها': baseJobs.filter((j) => j.isActive || isAdminLoggedIn).length };
    baseJobs.forEach((j) => {
      if (j.isActive || isAdminLoggedIn) {
        counts[j.city] = (counts[j.city] || 0) + 1;
      }
    });
    return counts;
  }, [baseJobs, isAdminLoggedIn]);

  const contractCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseJobs.filter((j) => j.isActive || isAdminLoggedIn).length };
    baseJobs.forEach((j) => {
      if (j.isActive || isAdminLoggedIn) {
        const cType = j.contractType || 'full_time';
        counts[cType] = (counts[cType] || 0) + 1;
      }
    });
    return counts;
  }, [baseJobs, isAdminLoggedIn]);

  // Toggle keyword in active keywords list
  const toggleKeyword = (kw: string) => {
    const cleanKw = kw.trim();
    if (!cleanKw) return;
    if (selectedKeywords.includes(cleanKw)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== cleanKw));
    } else {
      setSelectedKeywords([...selectedKeywords, cleanKw]);
    }
  };

  const handleAddCustomKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeywordInput.trim()) return;
    const clean = customKeywordInput.replace(/^#/, '').trim();
    if (clean && !selectedKeywords.includes(clean)) {
      setSelectedKeywords([...selectedKeywords, clean]);
    }
    setCustomKeywordInput('');
  };

  // Filter jobs based on contractType, keywords, title, category, city, salary, and perks
  const filteredJobs = useMemo(() => {
    const list = baseJobs.filter((job) => {
      if (!job.isActive && !isAdminLoggedIn) return false;

      // Only display approved/paid jobs to public users (or default seed jobs)
      if (!isAdminLoggedIn && job.paymentStatus && job.paymentStatus !== 'paid') {
        return false;
      }

      // 1. Contract Type Filter (تمام وقت، پاره وقت، فصلی)
      if (selectedContractType !== 'all') {
        const jobContract = job.contractType || 'full_time';
        if (jobContract !== selectedContractType) {
          return false;
        }
      }

      // 2. Dedicated Quick Title Filter
      if (selectedQuickTitle !== 'همه عناوین') {
        const matchTitle = job.title.toLowerCase().includes(selectedQuickTitle.toLowerCase());
        if (!matchTitle) return false;
      }

      // 3. Dedicated Active Keywords Filter (job must match all selected keyword tags)
      if (selectedKeywords.length > 0) {
        const jobKeywords = (job.keywords || []).map((k) => k.toLowerCase());
        const jobFullText = `${job.title} ${job.description} ${job.company} ${job.district} ${(job.requirements || []).join(' ')}`.toLowerCase();

        const matchesAllKeywords = selectedKeywords.every((kw) => {
          const kwLow = kw.toLowerCase();
          const inTags = jobKeywords.some((k) => k.includes(kwLow) || kwLow.includes(k));
          const inText = jobFullText.includes(kwLow);
          return inTags || inText;
        });

        if (!matchesAllKeywords) return false;
      }

      // 4. Text Search Query with Target Scope
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();

        if (searchScope === 'title') {
          // Specific Title search
          if (!job.title.toLowerCase().includes(q)) {
            return false;
          }
        } else if (searchScope === 'keywords') {
          // Specific Keyword & tags search
          const inKeywords = (job.keywords || []).some((k) => k.toLowerCase().includes(q));
          const inReqs = (job.requirements || []).some((r) => r.toLowerCase().includes(q));
          if (!inKeywords && !inReqs) {
            return false;
          }
        } else {
          // Broad Search (All Fields: Title, Company, Keywords, Description, Requirements, District)
          const matchesTitle = job.title.toLowerCase().includes(q);
          const matchesCompany = job.company.toLowerCase().includes(q);
          const matchesDistrict = job.district.toLowerCase().includes(q);
          const matchesDesc = job.description.toLowerCase().includes(q);
          const matchesReqs = job.requirements.some((r) => r.toLowerCase().includes(q));
          const matchesKeywords = (job.keywords || []).some((k) => k.toLowerCase().includes(q));

          if (!matchesTitle && !matchesCompany && !matchesDistrict && !matchesDesc && !matchesReqs && !matchesKeywords) {
            return false;
          }
        }
      }

      // 5. City & District filter
      if (selectedCity !== 'همه شهرها' && job.city !== selectedCity) {
        return false;
      }
      if (selectedDistrict !== 'همه منطقه‌ها' && job.district && !job.district.includes(selectedDistrict)) {
        return false;
      }

      // 6. Category filter
      if (selectedCategory !== 'all' && job.category !== selectedCategory) {
        return false;
      }

      // 6.5 Subcategory multi-select filter (تیک‌دار چند انتخابی)
      if (selectedSubcategories.length > 0) {
        const matchesSub = selectedSubcategories.some((sub) => {
          const cleanSub = sub.split('(')[0].trim().toLowerCase();
          const jobSub = (job.subcategory || '').toLowerCase();
          const jobTitle = (job.title || '').toLowerCase();
          const jobKw = (job.keywords || []).join(' ').toLowerCase();
          return (
            (jobSub && (jobSub.includes(cleanSub) || cleanSub.includes(jobSub))) ||
            jobTitle.includes(cleanSub) ||
            jobKw.includes(cleanSub)
          );
        });
        if (!matchesSub) return false;
      }

      // 6.6 Pay Frequency filter (روزدزد، هفتگی، ماهیانه)
      if (payFrequencyFilter !== 'all' && job.payFrequency !== payFrequencyFilter) {
        return false;
      }

      // 7. Refined Salary Range Filter
      if (job.salaryMax < minSalary) {
        return false;
      }
      if (job.salaryMin > maxSalary) {
        return false;
      }

      // 8. Perks Filters
      if (accommodationOnly && !job.accommodation) return false;
      if (workPermitOnly && !job.workPermitSupport) return false;
      if (leaveOnly && !job.hasLeave) return false;

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'salaryHigh') {
        return b.salaryMax - a.salaryMax;
      }
      if (sortBy === 'salaryLow') {
        return a.salaryMin - b.salaryMin;
      }
      if (sortBy === 'benefits') {
        const scoreA = (a.accommodation ? 2 : 0) + (a.workPermitSupport ? 2 : 0) + (a.meals ? 1 : 0) + (a.hasLeave ? 1 : 0);
        const scoreB = (b.accommodation ? 2 : 0) + (b.workPermitSupport ? 2 : 0) + (b.meals ? 1 : 0) + (b.hasLeave ? 1 : 0);
        return scoreB - scoreA;
      }
      // default newest:
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [
    baseJobs,
    selectedContractType,
    selectedQuickTitle,
    selectedKeywords,
    searchQuery,
    searchScope,
    selectedCity,
    selectedCategory,
    selectedSubcategories,
    payFrequencyFilter,
    minSalary,
    maxSalary,
    accommodationOnly,
    workPermitOnly,
    leaveOnly,
    sortBy,
    isAdminLoggedIn,
  ]);

  // Check if current user is admin or verified seeker
  const isAccessUnlocked = Boolean(isAdminLoggedIn || (currentSeeker && currentSeeker.verificationStatus === 'approved'));

  const handleApplyClick = (job: JobVacancy) => {
    if (!currentSeeker) {
      setAuthModalOpen(true);
      return;
    }

    if (currentSeeker.verificationStatus !== 'approved' && !isAdminLoggedIn) {
      showToast('امکان ارسال درخواست قفل است؛ ابتدا باید هزینه خدمات پرداخت شده و توسط مدیریت تایید شود.', 'error');
      return;
    }

    const res = applyForJob(job.id, applyNote);
    if (res.success) {
      setApplySuccessModal(true);
      setApplyNote('');
    }
  };

  const handleSaveEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    updateJob(editingJob.id, editingJob);
    if (selectedJob?.id === editingJob.id) {
      setSelectedJob(editingJob);
    }
    setEditingJob(null);
  };

  const isApplied = (jobId: string) => {
    if (!currentSeeker) return false;
    return applications.some((a) => a.jobId === jobId && a.seekerId === currentSeeker.id);
  };

  const formatLira = (num: number) => {
    return num.toLocaleString('fa-IR') + ' لیر';
  };

  const getContractTypeBadge = (type?: ContractType) => {
    switch (type) {
      case 'part_time':
        return {
          label: 'پاره وقت (Part-Time)',
          shortLabel: 'پاره وقت',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'seasonal':
        return {
          label: 'فصلی / پروژه‌ای (Seasonal)',
          shortLabel: 'فصلی',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'full_time':
      default:
        return {
          label: 'تمام وقت (Full-Time)',
          shortLabel: 'تمام وقت',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const getTurkishLevelLabel = (level: TurkishLevel) => {
    switch (level) {
      case 'none':
        return 'بدون نیاز به زبان ترکی';
      case 'basic':
        return 'ترکی مقدماتی / پایه';
      case 'intermediate':
        return 'ترکی متوسط';
      case 'fluent':
        return 'ترکی پیشرفته و مسلط';
    }
  };

  const resetAllFilters = () => {
    setSelectedCity('همه شهرها');
    setSelectedCategory('all');
    setSelectedContractType('all');
    setSelectedQuickTitle('همه عناوین');
    setSelectedKeywords([]);
    setSearchScope('all');
    setMinSalary(25000);
    setMaxSalary(75000);
    setSearchQuery('');
    setAccommodationOnly(false);
    setWorkPermitOnly(false);
    setLeaveOnly(false);
    setSortBy('newest');
  };

  const handleReferPaymentToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReceiptPhoto) {
      showToast('لطفاً ابتدا تصویر فیش واریزی هزینه خدمات را بارگذاری نمایید.', 'error');
      return;
    }
    if (isVerifyingReceipt) {
      showToast('بررسی هوش مصنوعی در حال انجام است، لطفاً چند لحظه شکیبا باشید...', 'info');
      return;
    }
    if (receiptAiResult?.tested && !receiptAiResult.isBankReceipt) {
      showToast('⚠️ این تصویر فیش بانکی نیست! هوش مصنوعی آن را نپذیرفت. لطفاً فیش واریز واقعی بارگذاری کنید.', 'error');
      return;
    }
    addAdminNotification({
      type: 'seeker_payment_referred',
      title: 'ارجاع تصویر فیش واریزی کارجو جهت فعال‌سازی امکانات',
      message: `کارجو «${currentSeeker?.fullName}» با کد ملی ${currentSeeker?.nationalId} تصویر فیش واریزی هزینه مصوب را جهت بررسی و فعال‌سازی حساب ارسال کرد.${receiptAiResult?.isBankReceipt ? ' (تایید شده توسط هوش مصنوعی کارباما)' : ''}`,
      data: {
        receiptPhotoUrl: paymentReceiptPhoto,
        paymentNote: paymentRefNote,
        seekerId: currentSeeker?.id,
        aiVerification: receiptAiResult,
      },
    });
    setIsReferredToAdmin(true);
    showToast('تصویر فیش واریزی با موفقیت به مدیریت ارجاع شد. به محض تایید، حساب شما فعال می‌گردد.', 'success');
  };

  const handleSepalSeekerSuccess = (refId: string) => {
    setIsSepalModalOpen(false);
    if (currentSeeker) {
      updateProfile({
        seekerPaymentStatus: 'paid',
        seekerPaymentMethod: 'sepal',
        seekerPaymentRefId: refId,
        seekerPaidAmount: `${seekerFeeToman.toLocaleString('fa-IR')} تومان`,
        seekerPaymentCurrency: 'IRT',
        verificationStatus: 'pending',
        isPaymentVerified: false,
        adminVerificationNote: `پرداخت موفق درگاه شاپرک سپال | کد رهگیری: ${refId} | مبلغ: ${seekerFeeToman.toLocaleString('fa-IR')} تومان | تاریخ: ${new Date().toLocaleDateString('fa-IR')}`,
      });
      addAdminNotification({
        type: 'seeker_payment_referred',
        title: '💳 پرداخت آنلاین هزینه خدمات توسط کارجو (درگاه شاپرک)',
        message: `کارجو «${currentSeeker?.fullName}» با کد ملی ${currentSeeker?.nationalId} مبلغ هزینه خدمات مصوب (${seekerFeeToman.toLocaleString('fa-IR')} تومان) را از طریق درگاه پرداخت شاپرک پرداخت نمود (کد رهگیری: ${refId}). لطفاً پس از بررسی، قفل دسترسی ایشان را در پنل مدیریت فعال فرمایید.`,
        data: {
          seekerId: currentSeeker?.id,
          paymentRefId: refId,
          method: 'sepal',
        },
      });
      setIsReferredToAdmin(true);
      showToast(`پرداخت شما با شناسه ارجاع سپال ${refId} با موفقیت ثبت شد و به مدیریت ارجاع گردید. پس از بررسی و تایید مدیریت، قفل دسترسی شما فعال خواهد شد.`, 'success');
    }
  };

  const hasActiveFilters =
    selectedCity !== 'همه شهرها' ||
    selectedCategory !== 'all' ||
    selectedContractType !== 'all' ||
    selectedQuickTitle !== 'همه عناوین' ||
    selectedKeywords.length > 0 ||
    searchQuery !== '' ||
    minSalary > 25000 ||
    maxSalary < 75000 ||
    accommodationOnly ||
    workPermitOnly ||
    leaveOnly;

  return (
    <div className="space-y-6">
      {/* Search Header Banner (Dynamically adapts to selected theme color) */}
      <div
        style={{ background: 'var(--primary-banner)' }}
        className="relative rounded-3xl overflow-hidden border border-red-500/40 p-6 sm:p-8 shadow-2xl transition-all duration-300"
      >
        <div
          style={{ backgroundColor: 'var(--primary-color)' }}
          className="absolute top-0 left-0 w-96 h-96 opacity-15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {t('smartSystemTag', appLanguage)}
              </div>

              {/* Unified Job Posting & Position Registration Button for Admin */}
              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={() => setAdminJobModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 text-xs font-bold transition shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ثبت آگهی استخدام / موقعیت شغلی</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setJobAlertModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-xs"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                {t('jobAlertTitle', appLanguage)}
                {jobAlerts.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-mono font-bold">
                    {jobAlerts.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logo.png"
                alt="کارباما"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400/90 shadow-xl shadow-red-950/60 md:hidden shrink-0 ring-2 ring-amber-500/30"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t('bannerHeadline', appLanguage)}
              </h1>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {t('bannerDescription', appLanguage)}
            </p>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center shrink-0">
            <div className="relative group">
              <img
                src="/logo.png"
                alt="لوگوی رسمی کارباما"
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-3 border-amber-400/90 shadow-2xl shadow-red-950/80 ring-4 ring-amber-500/30 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-xs px-3.5 py-0.5 rounded-full shadow-lg tracking-wider border border-amber-300/40 whitespace-nowrap">
                KARBAMA
              </span>
            </div>
          </div>
        </div>

          {/* Search Box with Search Scope Selector */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
              <input
                type="text"
                placeholder={t('searchJobsPlaceholder', appLanguage)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:border-red-500/50 focus:border-red-500 text-white placeholder-slate-400 pr-12 pl-24 py-3.5 rounded-2xl text-sm focus:outline-hidden shadow-lg transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-3.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 transition"
                >
                  {t('close', appLanguage)}
                </button>
              )}
            </div>

            {/* Search Target Mode Selector (Scope) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 px-2">{t('searchScopeLabel', appLanguage)}</span>
                <button
                  type="button"
                  onClick={() => setSearchScope('all')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    searchScope === 'all'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('searchScopeAll', appLanguage)}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope('title')}
                  className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                    searchScope === 'title'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  {t('searchScopeTitleOnly', appLanguage)}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope('keywords')}
                  className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                    searchScope === 'keywords'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  {t('searchScopeKeywordsOnly', appLanguage)}
                </button>
              </div>

              {/* Quick Add Custom Keyword Form */}
              <form onSubmit={handleAddCustomKeyword} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder={t('addCustomKeywordPlaceholder', appLanguage)}
                  value={customKeywordInput}
                  onChange={(e) => setCustomKeywordInput(e.target.value)}
                  className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 w-44"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
                >
                  {t('addBtn', appLanguage)}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Seeker Welcome & Verification Status Box */}
        {currentSeeker ? (
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentSeeker.verificationStatus === 'approved' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                <span>
                  {t('loggedInAsNotice', appLanguage)} <strong>{currentSeeker.fullName}</strong> ({t('fatherNameLabel', appLanguage)} {currentSeeker.fatherName} - {t('nationalIdLabel', appLanguage)} {currentSeeker.nationalId}) {t('loggedNoticeEnd', appLanguage)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentSeeker.verificationStatus === 'approved' ? (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold">
                    حساب فعال و تاییدشده ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold">
                    {t('awaitingVerificationBadge', appLanguage)}
                  </span>
                )}
              </div>
            </div>

            {/* Verification Warning Notice if unapproved */}
            {currentSeeker.verificationStatus !== 'approved' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">
                    وضعیت حساب کارجو: در انتظار پرداخت هزینه خدمات و تایید مدیریت
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    کارجوی گرامی، اطلاعات شما ثبت شده است. جهت فعال‌سازی کامل امکان ارسال درخواست شغل، مشاهده تماس کارفرمایان و رزومه‌ساز آنلاین، لطفاً هزینه خدمات به مبلغ {seekerFeeToman.toLocaleString('fa-IR')} تومان ({seekerFeeRial.toLocaleString('fa-IR')} ریال) را پرداخت نمایید یا منتظر تایید پنل بمانید.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div>
              کارجویان گرامی: برای ارسال خودکار مشخصات (نام، نام پدر، کد ملی و سوابق) به کارفرما، ابتدا ثبت‌نام کنید.
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition"
            >
              ثبت‌نام کارجو
            </button>
          </div>
        )}
      </div>

      {/* Admin Quick Action Banner (Visible when admin logs in) */}
      {isAdminLoggedIn && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">پنل مدیریت فرصت‌های شغلی فعال است</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">ADMIN</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                امکان ثبت آگهی شغلی جدید با مشخصات کامل (بیمه، غذا، جای خواب و...) و ویرایش/حذف تمام آگهی‌ها در اختیار شماست.
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminJobModalOpen(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-700/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ ثبت آگهی استخدام / موقعیت شغلی جدید</span>
          </button>
        </div>
      )}

      {/* DEDICATED TABS: 'ALL JOBS' VS 'SAVED JOBS' */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <button
          onClick={() => setActiveViewTab('all')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeViewTab === 'all'
              ? 'bg-red-600 text-white shadow-lg shadow-red-700/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          همه فرصت‌های شغلی ترکیه
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeViewTab === 'all' ? 'bg-red-800/90 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveViewTab('saved')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeViewTab === 'saved'
              ? 'bg-red-600 text-white shadow-lg shadow-red-700/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${savedJobIds.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          کارهای نشان‌شده من (Saved Jobs)
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeViewTab === 'saved' ? 'bg-red-800/90 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {savedJobIds.length}
          </span>
        </button>
      </div>

      {/* FAVORITE JOB CATEGORIES NOTIFICATION BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>سیستم اعلانات دسته‌بندی‌های شغلی مورد علاقه</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  {favoriteJobCategories.length} دسته فعال
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                دسته‌بندی‌های شغلی مورد علاقه خود را انتخاب کنید تا به محض ثبت آگهی جدید در آن دسته، نوتیفیکیشن فوری دریافت نمایید:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setJobAlertModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>تنظیمات پیشرفته هشدار</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {JOB_CATEGORIES_DATA.map((cat) => {
            const isFav = favoriteJobCategories.includes(cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => toggleFavoriteCategory(cat.key, cat.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border cursor-pointer ${
                  isFav
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${isFav ? 'text-slate-950 fill-slate-950' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                {isFav && <CheckCircle className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPREHENSIVE FILTER PANEL (Collapsible / Compact) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className="flex items-center gap-2 text-white font-bold text-sm hover:text-amber-300 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-red-500" />
            <span>فیلترهای پیشرفته و دسته‌بندی مشاغل</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              {isAdvancedFiltersOpen ? 'بستن فیلترها ▲' : 'باز کردن فیلترها ▼'}
            </span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تنظیم مجدد
            </button>
          )}
        </div>

        {/* Collapsible Filter Content */}
        {isAdvancedFiltersOpen && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* 1. FILTER BY CONTRACT TYPE */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              نوع قرارداد کاری (تمام وقت / پاره وقت):
            </span>
            <span className="text-[11px] text-slate-400">
              قرارداد انتخابی:{' '}
              <strong className="text-emerald-400">
                {CONTRACT_TYPES.find((c) => c.key === selectedContractType)?.badge}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONTRACT_TYPES.map((c) => {
              const count = contractCounts[c.key] || 0;
              const isSelected = selectedContractType === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedContractType(c.key)}
                  className={`p-3 rounded-2xl text-xs font-medium transition flex items-center justify-between gap-2 border text-right ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-900/30'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Clock
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{c.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. FILTER BY POPULAR KEYWORDS (کلمات کلیدی) - REQUESTED */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-sky-400" />
              کلمات کلیدی و تگ‌های پرکاربرد (کلیک جهت فیلتر فوری):
            </span>
            {selectedKeywords.length > 0 && (
              <button
                onClick={() => setSelectedKeywords([])}
                className="text-[11px] text-sky-400 hover:text-sky-300"
              >
                پاک کردن کلیدواژه‌ها ({selectedKeywords.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {POPULAR_KEYWORDS.map((kw) => {
              const isSelected = selectedKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-md shadow-sky-900/30'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Hash className="w-3 h-3 text-sky-400" />
                  <span>{kw}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. FILTER BY JOB TITLE (عناوین شغلی پرتقاضا) - REQUESTED */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-400" />
              عنوان شغل (انتخاب سریع عنوان):
            </span>
            <span className="text-[11px] text-slate-400">
              عنوان فعال: <strong className="text-amber-400">{selectedQuickTitle}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_TITLES.map((title) => {
              const isSelected = selectedQuickTitle === title;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => setSelectedQuickTitle(title)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition ${
                    isSelected
                      ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-900/30'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. FILTER BY CITY & DISTRICTS */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              انتخاب شهر و منطقه ترکیه:
            </span>

            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('همه منطقه‌ها');
                }}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:border-red-500"
              >
                {CITIES_WITH_ALL.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {selectedCity !== 'همه شهرها' && (
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:border-amber-500"
                >
                  <option value="همه منطقه‌ها">همه منطقه‌های {selectedCity}</option>
                  {getDistrictsForCity(selectedCity).map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['همه شهرها', 'استانبول', 'آنتالیا', 'آنکارا', 'ازمیر', 'بورسا', 'ترابزون', 'ارزروم', 'آدانا', 'غازیان‌تپ', 'قونیه', 'مرسین', 'اسکی‌شهر', 'سامسون', 'دنیزلی', 'قیصری'].map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setSelectedDistrict('همه منطقه‌ها');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition ${
                    isSelected
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-700/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. FILTER BY JOB CATEGORY & SUBCATEGORIES */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-500" />
              دسته‌بندی حوزه کاری و زیرشاخه‌ها:
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedCategory === 'all'
                ? 'همه حوزه‌های کاری'
                : CATEGORIES.find((c) => c.key === selectedCategory)?.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.key] || 0;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between gap-2 border text-right ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500/60 text-amber-200 font-bold shadow-sm'
                      : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subcategories checklist for selected category (multi-select with checkboxes) */}
          {(() => {
            const catDetail = JOB_CATEGORIES_DATA.find((c) => c.key === selectedCategory);
            if (!catDetail || catDetail.subcategories.length === 0) return null;

            return (
              <div className="p-3.5 bg-slate-950/90 border border-amber-500/40 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    زیرشاخه‌های {catDetail.label} (انتخاب چندتایی با تیک):
                  </span>
                  {selectedSubcategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategories([])}
                      className="text-[11px] text-slate-400 hover:text-amber-300 underline"
                    >
                      پاک کردن همه تیک‌ها ({selectedSubcategories.length})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {catDetail.subcategories.map((sub, sidx) => {
                    const isChecked = selectedSubcategories.includes(sub);
                    return (
                      <label
                        key={sidx}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubcategory(sub)}
                          className="rounded accent-amber-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <span className="truncate">{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* 6. REFINED SALARY RANGE FILTER */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              محدوده حقوق ماهانه (لیر ترکیه ₺):
            </span>

            {/* Display current active range */}
            <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">بازه انتخابی:</span>
              <span className="font-mono font-bold text-emerald-400" dir="ltr">
                {minSalary.toLocaleString('fa-IR')} ₺
              </span>
              <span className="text-slate-500">تا</span>
              <span className="font-mono font-bold text-emerald-400" dir="ltr">
                {maxSalary >= 75000 ? '۷۵,۰۰۰+ ₺' : `${maxSalary.toLocaleString('fa-IR')} ₺`}
              </span>
            </div>
          </div>

          {/* Quick Salary Range Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
            {SALARY_PRESETS.map((preset, idx) => {
              const isMatch = minSalary === preset.min && (maxSalary === preset.max || preset.max >= 75000);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMinSalary(preset.min);
                    setMaxSalary(preset.max);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition ${
                    isMatch
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-700/30'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Dual Sliders for Minimum and Maximum Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-800 text-xs">
            {/* Min Salary Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>حداقل حقوق دریافتی:</span>
                <span className="font-mono font-bold text-emerald-400">{minSalary.toLocaleString('fa-IR')} لیر</span>
              </div>
              <input
                type="range"
                min={25000}
                max={60000}
                step={1000}
                value={minSalary}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinSalary(val);
                  if (val > maxSalary) {
                    setMaxSalary(val + 5000);
                  }
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>۲۵,۰۰۰ ₺</span>
                <span>۶۰,۰۰۰ ₺</span>
              </div>
            </div>

            {/* Max Salary Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>سقف حقوق مورد نظر:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {maxSalary >= 75000 ? '۷۵,۰۰۰+ لیر' : `${maxSalary.toLocaleString('fa-IR')} لیر`}
                </span>
              </div>
              <input
                type="range"
                min={30000}
                max={75000}
                step={2000}
                value={maxSalary}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxSalary(val);
                  if (val < minSalary) {
                    setMinSalary(val - 2000);
                  }
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>۳۰,۰۰۰ ₺</span>
                <span>۷۵,۰۰۰+ ₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. PERKS & SORTING BAR */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Perks check boxes */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition">
              <input
                type="checkbox"
                checked={accommodationOnly}
                onChange={(e) => setAccommodationOnly(e.target.checked)}
                className="rounded accent-red-600"
              />
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-200">دارای جای خواب</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition">
              <input
                type="checkbox"
                checked={workPermitOnly}
                onChange={(e) => setWorkPermitOnly(e.target.checked)}
                className="rounded accent-red-600"
              />
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200">اقامت کاری (چالیشما)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition">
              <input
                type="checkbox"
                checked={leaveOnly}
                onChange={(e) => setLeaveOnly(e.target.checked)}
                className="rounded accent-red-600"
              />
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-200">دارای مرخصی</span>
            </label>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">مرتب‌سازی:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:border-red-500"
            >
              <option value="newest">جدیدترین آگهی‌ها</option>
              <option value="salaryHigh">بالاترین حقوق ماهانه</option>
              <option value="salaryLow">کمترین حقوق ماهانه</option>
              <option value="benefits">بیشترین مزایا (اسکان و بیمه)</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER TAGS PILLS */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-[11px] text-slate-400 ml-1">فیلترهای فعال:</span>

            {/* Contract type pill */}
            {selectedContractType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                نوع قرارداد: {CONTRACT_TYPES.find((c) => c.key === selectedContractType)?.badge}
                <button onClick={() => setSelectedContractType('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Quick title pill */}
            {selectedQuickTitle !== 'همه عناوین' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[11px]">
                عنوان: {selectedQuickTitle}
                <button onClick={() => setSelectedQuickTitle('همه عناوین')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Keywords pills */}
            {selectedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 text-[11px]"
              >
                #{kw}
                <button onClick={() => toggleKeyword(kw)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Search query pill */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 text-white text-[11px]">
                جستجو: «{searchQuery}» ({searchScope === 'title' ? 'در عنوان' : searchScope === 'keywords' ? 'در کلیدواژه‌ها' : 'کل آگهی'})
                <button onClick={() => setSearchQuery('')} className="hover:text-red-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCity !== 'همه شهرها' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 text-[11px]">
                شهر: {selectedCity}
                <button onClick={() => setSelectedCity('همه شهرها')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[11px]">
                دسته: {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minSalary > 25000 || maxSalary < 75000) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                حقوق: {minSalary.toLocaleString('fa-IR')} تا {maxSalary >= 75000 ? '۷۵,۰۰۰+' : maxSalary.toLocaleString('fa-IR')} ₺
                <button
                  onClick={() => {
                    setMinSalary(25000);
                    setMaxSalary(75000);
                  }}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {accommodationOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[11px]">
                با جای خواب
                <button onClick={() => setAccommodationOnly(false)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {workPermitOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                اقامت کاری (چالیشما)
                <button onClick={() => setWorkPermitOnly(false)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {leaveOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[11px]">
                دارای مرخصی
                <button onClick={() => setLeaveOnly(false)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => setJobAlertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition mr-auto"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              تنظیم هشدار برای این فیلترها
            </button>
          </div>
        )}
      </div>
      )}
    </div>

      {/* ACCESS GATE: After registration, NO advertisements are displayed until payment is made and referred to admin */}
      {!isAccessUnlocked ? (
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {currentSeeker ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        پرونده کارجو ثبت گردید | قفل نمایش آگهی‌های کارفرما
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        {isReferredToAdmin ? 'در انتظار تایید مدیریت ⏳' : 'در انتظار واریز و ارجاع 🔒'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      طبق دستورالعمل رسمی کارباما، مشاهده اطلاعات تماس کارفرمایان ترکیه تا زمان پرداخت هزینه مصوب خدمات ({seekerFeeToman.toLocaleString('fa-IR')} تومان / {seekerFeeRial.toLocaleString('fa-IR')} ریال به نرخ روز) و تایید مدیر سامانه، قفل می‌باشد.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                    کد پرونده: {currentSeeker.nationalId}
                  </span>
                </div>
              </div>

              {/* Seeker Profile Summary Card */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">نام کارجو:</span>
                  <span className="font-bold text-white text-sm">{currentSeeker.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">نام پدر:</span>
                  <span className="font-bold text-white text-sm">{currentSeeker.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">نام کاربری ورود:</span>
                  <span className="font-mono text-red-300 font-bold" dir="ltr">@{currentSeeker.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">شغل و مهارت‌های ثبت‌شده:</span>
                  <span className="font-bold text-amber-300 truncate block">
                    {currentSeeker.skills?.join('، ') || 'کار عمومی'}
                  </span>
                </div>
              </div>

              {/* Instant Sepal Online Payment Option */}
              <div className="p-5 bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/70 border-2 border-teal-500/50 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-right w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      سپال
                    </span>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>پرداخت آنلاین شاپرک سپال (ارسال فوری به مدیر جهت تایید و بازگشایی)</span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                        شاپرک شتاب
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    با پرداخت آنلاین از طریق درگاه رسمی شاپرک سپال، شناسه ارجاع بانکی ثبت شده و به پنل مدیریت ارجاع می‌گردد تا پس از بررسی مدیر، قفل حساب شما فعال و باز شود.
                  </p>
                  <div className="text-xs text-teal-300 font-bold font-mono">
                    مبلغ مصوب (به‌روزرسانی روزانه): {seekerFeeToman.toLocaleString('fa-IR')} تومان ({seekerFeeRial.toLocaleString('fa-IR')} ریال)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSepalModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer transition"
                >
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>ورود به درگاه پرداخت شاپرک و ارسال به مدیر</span>
                </button>
              </div>

              {/* Payment Details Card */}
              <div className="p-5 bg-gradient-to-br from-red-950/40 to-slate-850/80 border border-red-500/30 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    یا واریز دستی به حساب و بارگذاری فیش
                  </h4>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black font-mono self-start sm:self-auto">
                    مبلغ مصوب: {seekerFeeToman.toLocaleString('fa-IR')} تومان ({seekerFeeRial.toLocaleString('fa-IR')} ریال)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-slate-400 block text-[11px] font-semibold">حساب رسمی ترکیه (Ziraat Bankası):</span>
                    <p className="font-mono text-emerald-300 font-bold tracking-wider text-xs select-all" dir="ltr">
                      TR56 0001 0090 1234 5678 9050 01
                    </p>
                    <p className="text-[11px] text-slate-300">به نام: Karbama Danışmanlık ve İnsan Kaynakları</p>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-slate-400 block text-[11px] font-semibold">شماره کارت ایران (بانک ملت):</span>
                    <p className="font-mono text-amber-300 font-bold tracking-wider text-sm select-all" dir="ltr">
                      ۶۱۰۴-۳۳۷۸-۹۰۱۲-۳۴۵۶
                    </p>
                    <p className="text-[11px] text-slate-300">به نام: مدیریت امور مالی کارباما</p>
                  </div>
                </div>
              </div>

              {/* Interactive Photo Upload Referral Form */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  بارگذاری عکس فیش واریزی و ارجاع به مدیر جهت فعال‌سازی قفل
                </h4>

                {isReferredToAdmin || currentSeeker.seekerPaymentStatus === 'paid' || Boolean(currentSeeker.seekerPaymentRefId) ? (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>اطلاعات واریز هزینه خدمات ثبت و به مدیریت ارجاع گردید!</span>
                    </div>
                    {currentSeeker.seekerPaymentRefId && (
                      <div className="p-2.5 bg-slate-900/80 rounded-xl border border-teal-500/30 flex items-center justify-between">
                        <span className="text-[11px] text-slate-300">کد رهگیری تراکنش شاپرک:</span>
                        <span className="font-mono text-xs font-bold text-teal-300 select-all">
                          {currentSeeker.seekerPaymentRefId}
                        </span>
                      </div>
                    )}
                    {paymentReceiptPhoto && (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-emerald-500/50 shadow-md">
                        <img
                          src={paymentReceiptPhoto}
                          alt="عکس فیش واریزی ارسالی"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      پرونده و تراکنش شما در نوبت بررسی مدیریت کارباما قرار دارد. پس از بررسی و تایید مدیر، قفل حساب شما به صورت خودکار باز شده و دسترسی کامل به شماره تماس کارفرمایان و ارسال رزومه آزاد خواهد شد.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReferPaymentToAdmin} className="space-y-3.5">
                    {/* Photo Upload Area */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        تصویر فیش واریزی هزینه مصوب (عکس با دوربین یا گالری) *
                      </label>

                      {paymentReceiptPhoto ? (
                        <div className="space-y-3">
                          <div className={`relative w-full max-w-xs h-44 rounded-2xl overflow-hidden border-2 ${
                            receiptAiResult?.tested
                              ? receiptAiResult.isBankReceipt
                                ? 'border-emerald-500/80 shadow-emerald-500/10'
                                : 'border-red-500/80 shadow-red-500/10'
                              : 'border-amber-500/60'
                          } shadow-xl bg-slate-900 group`}>
                            <img
                              src={paymentReceiptPhoto}
                              alt="پیش‌نمایش فیش واریزی"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentReceiptPhoto(null);
                                  setReceiptAiResult(null);
                                }}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                حذف و انتخاب عکس جدید
                              </button>
                            </div>

                            {/* Status Pill on Photo */}
                            <div className="absolute bottom-2 right-2">
                              {isVerifyingReceipt ? (
                                <span className="bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  بررسی هوش مصنوعی...
                                </span>
                              ) : receiptAiResult?.tested ? (
                                receiptAiResult.isBankReceipt ? (
                                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3" />
                                    فیش بانکی تایید شد
                                  </span>
                                ) : (
                                  <span className="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    فیش بانکی نیست
                                  </span>
                                )
                              ) : (
                                <span className="bg-slate-800 text-slate-200 font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md">
                                  تصویر بارگذاری شده
                                </span>
                              )}
                            </div>
                          </div>

                          {/* AI Scanning State Card */}
                          {isVerifyingReceipt && (
                            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 animate-pulse">
                              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                                <Loader2 className="w-5 h-5 animate-spin" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  در حال بررسی هوشمند فیش توسط هوش مصنوعی کارباما...
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  هوش مصنوعی در حال اعتبارسنجی ارکان رسید بانکی، کد پیگیری و صحت سند است.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* AI Rejection Card (NOT A BANK RECEIPT) */}
                          {!isVerifyingReceipt && receiptAiResult?.tested && !receiptAiResult.isBankReceipt && (
                            <div className="p-4 bg-red-950/60 border-2 border-red-500 rounded-2xl space-y-3 animate-fadeIn shadow-lg shadow-red-950/50">
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0 border border-red-500/30">
                                  <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h5 className="text-xs font-black text-red-300 flex items-center gap-1.5">
                                      <span>⚠️ خطا: تصویر بارگذاری‌شده اشتباه است و شبیه فیش بانکی نمی‌باشد!</span>
                                    </h5>
                                    <span className="px-2 py-0.5 bg-red-900/60 text-red-300 border border-red-500/40 rounded-md text-[10px] font-bold">
                                      رد شده توسط هوش مصنوعی
                                    </span>
                                  </div>
                                  <p className="text-xs text-red-100 font-medium leading-relaxed bg-red-900/30 p-2.5 rounded-xl border border-red-500/20">
                                    {receiptAiResult.reason}
                                  </p>
                                  <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                                    کارجوی گرامی، لطفاً تصویر صحیح فیش واریز هزینه مصوب را مجدداً ارسال فرمایید. عکس چهره، سلفی، اسکرین‌شات‌های نامربوط یا مدارک هویتی به عنوان فیش بانکی مورد قبول نمی‌باشند.
                                  </p>
                                </div>
                              </div>
                              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentReceiptPhoto(null);
                                    setReceiptAiResult(null);
                                    setTimeout(() => receiptFileInputRef.current?.click(), 50);
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>📸 ارسال مجدد فیش بانکی (انتخاب عکس جدید)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentReceiptPhoto(null);
                                    setReceiptAiResult(null);
                                  }}
                                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700 flex items-center gap-1.5"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  حذف تصویر
                                </button>
                              </div>
                            </div>
                          )}

                          {/* AI Approval Card (GENUINE BANK RECEIPT) */}
                          {!isVerifyingReceipt && receiptAiResult?.tested && receiptAiResult.isBankReceipt && (
                            <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl space-y-2 animate-fadeIn">
                              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>✅ اصالت فیش بانکی توسط هوش مصنوعی تایید گردید</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {receiptAiResult.reason}
                              </p>
                              {receiptAiResult.extractedInfo && (
                                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                  {receiptAiResult.extractedInfo.bankName && (
                                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-emerald-300 rounded-lg">
                                      🏛️ بانک: {receiptAiResult.extractedInfo.bankName}
                                    </span>
                                  )}
                                  {receiptAiResult.extractedInfo.amount && (
                                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-amber-300 rounded-lg">
                                      💰 مبلغ: {receiptAiResult.extractedInfo.amount}
                                    </span>
                                  )}
                                  {receiptAiResult.extractedInfo.trackingCode && (
                                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-cyan-300 rounded-lg font-mono">
                                      🔢 پیگیری: {receiptAiResult.extractedInfo.trackingCode}
                                    </span>
                                  )}
                                  {receiptAiResult.extractedInfo.dateTime && (
                                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg">
                                      📅 تاریخ: {receiptAiResult.extractedInfo.dateTime}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-2xl cursor-pointer bg-slate-900/80 hover:bg-slate-900 transition p-4 text-center group">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                            <Camera className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-200">
                            کلیک کنید یا عکس فیش واریزی را انتخاب/گرفتن عکس فرمایید
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            تصویر فیش ارسالی به صورت هوشمند بررسی و اعتبارسنجی می‌شود (حداکثر ۱۰ مگابایت)
                          </p>
                        </label>
                      )}

                      {/* Always available hidden file input */}
                      <input
                        ref={receiptFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePaymentReceiptPhotoUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Optional Payment Note */}
                    <div>
                      <input
                        type="text"
                        placeholder="توضیحات اختیاری (مثلاً ۴ رقم آخر کارت، نام صاحب حساب یا بانک واریزی)..."
                        value={paymentRefNote}
                        onChange={(e) => setPaymentRefNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !paymentReceiptPhoto ||
                        isVerifyingReceipt ||
                        (receiptAiResult?.tested === true && !receiptAiResult.isBankReceipt)
                      }
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                        receiptAiResult?.tested && !receiptAiResult.isBankReceipt
                          ? 'bg-slate-800 text-red-400 border border-red-500/40 cursor-not-allowed opacity-80'
                          : isVerifyingReceipt
                          ? 'bg-slate-800 text-amber-400 border border-amber-500/40 cursor-wait'
                          : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white shadow-red-700/30'
                      }`}
                    >
                      {isVerifyingReceipt ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>در حال بررسی هوش مصنوعی...</span>
                        </>
                      ) : receiptAiResult?.tested && !receiptAiResult.isBankReceipt ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>⚠️ تصویر فیش بانکی نیست (ارسال غیرفعال است)</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>ثبت تصویر فیش و ارجاع به مدیر جهت فعال‌سازی</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">جهت مشاهده آگهی‌ها ابتدا ثبت‌نام فرمایید</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ورود به سامانه کارباما فقط با تشکیل پرونده کارجو یا ورود با حساب کاربری معتبر امکان‌پذیر است.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-700/30"
                >
                  ثبت‌نام رسمی کارجو
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  ورود به حساب کاربری
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Results Count Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          نمایش <strong>{filteredJobs.length}</strong> فرصت شغلی
          {activeViewTab === 'saved' ? ' در لیست نشان‌شده‌های شما' : ' در ترکیه'}
        </span>
        {hasActiveFilters && (
          <button onClick={resetAllFilters} className="text-red-400 hover:text-red-300 font-medium">
            پاک کردن تمام فیلترها
          </button>
        )}
      </div>

      {/* Empty State: Specifically for Saved Jobs Tab or Filter */}
      {activeViewTab === 'saved' && savedJobIds.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">هنوز آگهی شغلی ذخیره نکرده‌اید</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            برای نشان کردن هر شغل، روی علامت قلب ❤️ بالای کارت آگهی بزنید تا در این بخش ذخیره شده و هر زمان مایل بودید به آن دسترسی داشته باشید.
          </p>
          <button
            onClick={() => setActiveViewTab('all')}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-700/30"
          >
            مشاهده تمام آگهی‌های کار ترکیه
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">فرصت شغلی با این مشخصات یافت نشد</h3>
          <p className="text-xs text-slate-400 mb-4">
            می‌توانید کلمات کلیدی، نوع قرارداد (تمام وقت/پاره وقت) یا عنوان جستجو شده را بازنشانی فرمایید.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
          >
            مشاهده تمام آگهی‌های کار
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const applied = isApplied(job.id);
            const isSaved = isJobSaved(job.id);
            const contractBadge = getContractTypeBadge(job.contractType);

            return (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition"
              >
                <div>
                  {/* Job Image Header with Contract Badge & Favorite Button */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={
                        job.imageUrl ||
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={job.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                    {/* Top Right Badges: City & District */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-red-600/90 backdrop-blur-md text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                        <MapPin className="w-3 h-3" />
                        {job.city}
                      </span>
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-slate-200 rounded-md text-[11px]">
                        {job.district}
                      </span>
                    </div>

                    {/* Top Left: Favorite Toggle Button & Admin Edit */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {/* FAVORITE TOGGLE BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.id);
                        }}
                        className={`p-2 rounded-xl backdrop-blur-md transition shadow-md flex items-center justify-center ${
                          isSaved
                            ? 'bg-red-600 text-white shadow-red-600/40'
                            : 'bg-black/60 hover:bg-black/80 text-white hover:text-red-400'
                        }`}
                        title={isSaved ? 'حذف از کارهای نشان‌شده' : 'افزودن به کارهای نشان‌شده (Save)'}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                      </button>

                      {/* Admin Edit Shortcut Button */}
                      {isAdminLoggedIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingJob(job);
                          }}
                          className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                          title="ویرایش این آگهی (مدیر)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom overlay: Contract Type badge + Salary */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between gap-2">
                      {/* Contract Type badge */}
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md border flex items-center gap-1 shadow-md ${contractBadge.color}`}
                      >
                        <Clock className="w-3 h-3" />
                        {contractBadge.label}
                      </span>

                      {/* Salary badge on image */}
                      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md flex items-center gap-1">
                        <span>{formatLira(job.salaryMin)} تا {formatLira(job.salaryMax)}</span>
                        <span className="text-[10px] font-sans text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-md">
                          {job.payFrequency === 'daily' ? 'روز مزد' : job.payFrequency === 'weekly' ? 'هفتگی' : 'ماهیانه'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3
                        onClick={() => setSelectedJob(job)}
                        className="text-base font-bold text-white group-hover:text-red-400 transition cursor-pointer line-clamp-1"
                      >
                        {job.title}
                      </h3>
                      {job.subcategory && (
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md inline-block">
                            تخصص / زیر شاخه: {job.subcategory}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {job.company}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Clickable Keywords on the Job Card */}
                    {job.keywords && job.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.keywords.map((kw, kidx) => {
                          const isKwActive = selectedKeywords.includes(kw);
                          return (
                            <button
                              key={kidx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleKeyword(kw);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-md transition flex items-center gap-0.5 ${
                                isKwActive
                                  ? 'bg-sky-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-400 hover:text-sky-300 hover:bg-slate-750'
                              }`}
                              title={`فیلتر بر اساس کلیدواژه #${kw}`}
                            >
                              <span>#{kw}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Feature Badges with Specific Details */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.accommodation && (
                        <div className="group/perk relative">
                          <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-help">
                            <Home className="w-3 h-3 text-blue-400" />
                            جای خواب
                            {job.accommodationDetails && <span className="text-[10px] text-blue-200">✓</span>}
                          </span>
                          {job.accommodationDetails && (
                            <div className="absolute bottom-full right-0 mb-1 hidden group-hover/perk:block z-30 bg-slate-900 border border-blue-500/40 text-slate-200 text-[10px] p-2 rounded-xl shadow-xl w-48 text-right">
                              {job.accommodationDetails}
                            </div>
                          )}
                        </div>
                      )}

                      {job.meals && (
                        <div className="group/perk relative">
                          <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-help">
                            <Utensils className="w-3 h-3 text-amber-400" />
                            غذا
                            {job.mealDetails && <span className="text-[10px] text-amber-200">✓</span>}
                          </span>
                          {job.mealDetails && (
                            <div className="absolute bottom-full right-0 mb-1 hidden group-hover/perk:block z-30 bg-slate-900 border border-amber-500/40 text-slate-200 text-[10px] p-2 rounded-xl shadow-xl w-48 text-right">
                              {job.mealDetails}
                            </div>
                          )}
                        </div>
                      )}

                      {job.hasLeave && (
                        <div className="group/perk relative">
                          <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-help">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            مرخصی دارد
                            {job.leaveDetails && <span className="text-[10px] text-amber-200">✓</span>}
                          </span>
                          {job.leaveDetails && (
                            <div className="absolute bottom-full right-0 mb-1 hidden group-hover/perk:block z-30 bg-slate-900 border border-amber-500/40 text-slate-200 text-[10px] p-2 rounded-xl shadow-xl w-48 text-right">
                              {job.leaveDetails}
                            </div>
                          )}
                        </div>
                      )}

                      {job.workPermitSupport && (
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-medium flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-emerald-400" />
                          چالیشما ایزنی
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer: Salary + Action Buttons */}
                <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isAccessUnlocked ? (
                      <>
                        <a
                          href={`tel:${job.contactPhone.replace(/\s/g, '')}`}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                          title="تماس تلفنی"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                        </a>
                        {job.contactWhatsapp && (
                          <a
                            href={`https://wa.me/${job.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl border border-emerald-500/30 transition"
                            title="پیام در واتساپ"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300/90 rounded-xl border border-amber-500/30 text-[11px] font-bold transition"
                        title="اطلاعات تماس مستقیم کارفرما قفل است (نیاز به پرداخت هزینه خدمات و تایید مدیریت)"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>تماس: قفل</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition"
                    >
                      مشاهده جزئیات
                    </button>

                    {applied ? (
                      <span className="px-3 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs rounded-xl font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ارسال شده
                      </span>
                    ) : isAccessUnlocked ? (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        ارسال درخواست
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-xl transition flex items-center gap-1"
                        title="ارسال درخواست قفل است؛ نیاز به پرداخت هزینه خدمات و تایید مدیریت"
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>ارسال (قفل)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin Quick Action Controls */}
                {isAdminLoggedIn && (
                  <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-amber-400 font-bold">کنترل مدیر:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingJob(job);
                        }}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="ویرایش آگهی کار"
                      >
                        <Edit className="w-3 h-3" />
                        <span>ویرایش</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleJobStatus(job.id);
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition border ${
                          job.isActive
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title="تغییر وضعیت فعال / بایگانی"
                      >
                        {job.isActive ? 'فعال ✓' : 'بایگانی'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`آیا از حذف فرصت شغلی «${job.title}» اطمینان دارید؟`)) {
                            deleteJob(job.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="حذف آگهی"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  )}

      {/* Job Details Modal with Photo Banner & Favorite Button */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            {/* Modal Image Header */}
            <div className="relative h-56 w-full bg-slate-800 overflow-hidden">
              <img
                src={
                  selectedJob.imageUrl ||
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
                }
                alt={selectedJob.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

              {/* Action Buttons on top of image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {/* Modal Favorite Toggle */}
                <button
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`p-2 rounded-full backdrop-blur-md transition ${
                    isJobSaved(selectedJob.id)
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                      : 'bg-black/50 hover:bg-black/70 text-white hover:text-red-400'
                  }`}
                  title={isJobSaved(selectedJob.id) ? 'نشان‌شده (کلیک برای حذف)' : 'نشان کردن این شغل'}
                >
                  <Heart className={`w-5 h-5 ${isJobSaved(selectedJob.id) ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 right-4 left-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-bold text-xs">
                    {selectedJob.city}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">{selectedJob.district}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border backdrop-blur-md ${
                      getContractTypeBadge(selectedJob.contractType).color
                    }`}
                  >
                    {getContractTypeBadge(selectedJob.contractType).label}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{selectedJob.title}</h2>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {selectedJob.company}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Highlight Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">حقوق ماهانه</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatLira(selectedJob.salaryMin)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">تا {formatLira(selectedJob.salaryMax)}</span>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">نوع قرارداد</span>
                  <span className="text-xs font-bold text-sky-400">
                    {getContractTypeBadge(selectedJob.contractType).label}
                  </span>
                  <span className="text-[10px] text-slate-400 block">ترکیه</span>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">اسکان و خوابگاه</span>
                  <span className={`text-xs font-bold ${selectedJob.accommodation ? 'text-blue-400' : 'text-slate-400'}`}>
                    {selectedJob.accommodation ? 'دارای جای خواب ✓' : 'بدون جای خواب'}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {selectedJob.accommodationDetails || (selectedJob.accommodation ? 'خوابگاه مجهز' : 'مسکن به عهده کارجو')}
                  </span>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">وعده‌های غذایی</span>
                  <span className={`text-xs font-bold ${selectedJob.meals ? 'text-amber-400' : 'text-slate-400'}`}>
                    {selectedJob.meals ? 'دارای وعده غذا ✓' : 'بدون وعده غذا'}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {selectedJob.mealDetails || (selectedJob.meals ? 'غذای گرم رایگان' : 'غذا به عهده کارجو')}
                  </span>
                </div>
              </div>

              {/* DEDICATED BENEFITS BREAKDOWN SECTION */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  جزئیات تسهیلات رفاهی و بیمه این فرصت شغلی:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Accommodation Detail Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                      <Home className="w-4 h-4" />
                      وضعیت اسکان و جای خواب:
                    </div>
                    <p className="text-[11px] font-bold text-white">
                      {selectedJob.accommodation ? 'جای خواب و اسکان رایگان مهیا است' : 'فاقد اسکان'}
                    </p>
                    {selectedJob.accommodationDetails && (
                      <p className="text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        {selectedJob.accommodationDetails}
                      </p>
                    )}
                  </div>

                  {/* Meals Detail Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Utensils className="w-4 h-4" />
                      وضعیت وعده‌های غذایی:
                    </div>
                    <p className="text-[11px] font-bold text-white">
                      {selectedJob.meals ? 'وعده غذایی روزانه رایگان' : 'بدون غذا'}
                    </p>
                    {selectedJob.mealDetails && (
                      <p className="text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        {selectedJob.mealDetails}
                      </p>
                    )}
                  </div>

                  {/* Leave Detail Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Calendar className="w-4 h-4" />
                      وضعیت مرخصی:
                    </div>
                    <p className="text-[11px] font-bold text-white">
                      {selectedJob.hasLeave ? 'دارای مرخصی کاری' : 'بدون مرخصی'}
                    </p>
                    {selectedJob.leaveDetails && (
                      <p className="text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        {selectedJob.leaveDetails}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Keywords / Tags section */}
              {selectedJob.keywords && selectedJob.keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-sky-400" />
                    کلمات کلیدی و برچسب‌های این شغل:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.keywords.map((kw, kidx) => (
                      <span
                        key={kidx}
                        className="px-2.5 py-1 bg-sky-950/70 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-mono"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  شرح وظایف و شرایط شغلی:
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  شرایط و نیازمندی‌های این کار:
                </h4>
                <div className="space-y-1.5">
                  {selectedJob.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employer Direct Contact & Application Submission: Unlocked vs Locked Gate */}
              {isAccessUnlocked ? (
                <>
                  {/* Employer Direct Contact Box */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-white mb-2">تماس مستقیم با کارفرما در ترکیه:</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`tel:${selectedJob.contactPhone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-medium transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        تماس: {selectedJob.contactPhone}
                      </a>

                      {selectedJob.contactWhatsapp && (
                        <a
                          href={`https://wa.me/${selectedJob.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          پیام در واتساپ
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Seeker Application Submission Section */}
                  <div className="pt-2">
                    <div className="bg-gradient-to-br from-red-950/40 to-slate-800/60 border border-red-500/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Send className="w-4 h-4 text-red-500" />
                          ارسال فرم استخدامی با مشخصات ثبت‌نامی شما:
                        </h4>
                        <span className="text-[11px] text-emerald-400 font-bold">پروفایل کارجو تاییدشده ✓</span>
                      </div>

                      {currentSeeker && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-slate-400 text-[10px] block">نام و نام خانوادگی:</span>
                            <span className="font-bold text-white">{currentSeeker.fullName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">نام پدر:</span>
                            <span className="font-bold text-white">{currentSeeker.fatherName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">کد ملی:</span>
                            <span className="font-bold text-white font-mono">{currentSeeker.nationalId}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">شماره تماس:</span>
                            <span className="font-bold text-white font-mono" dir="ltr">{currentSeeker.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">سطح زبان ترکی:</span>
                            <span className="font-bold text-white">{getTurkishLevelLabel(currentSeeker.turkishLevel)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">مهارت‌ها:</span>
                            <span className="font-bold text-white truncate block">{currentSeeker.skills.join('، ')}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          پیام یا یادداشت شما برای این کارفرما (اختیاری):
                        </label>
                        <input
                          type="text"
                          placeholder="مثلاً: سلام، آماده همکاری فوری و دارای کیملیک هستم..."
                          value={applyNote}
                          onChange={(e) => setApplyNote(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        {isApplied(selectedJob.id) ? (
                          <div className="flex-1 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            شما قبلاً برای این فرصت شغلی رزومه ارسال کرده‌اید و در انتظار بررسی کارفرماست.
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyClick(selectedJob)}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            ثبت و ارسال رسمی درخواست استخدام
                          </button>
                        )}

                        <button
                          onClick={() => toggleSaveJob(selectedJob.id)}
                          className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition shrink-0 ${
                            isJobSaved(selectedJob.id)
                              ? 'bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/30'
                              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-red-400'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isJobSaved(selectedJob.id) ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          {isJobSaved(selectedJob.id) ? 'نشان‌شده ✓' : 'نشان کردن'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* LOCKED STATE: Registration and Payment Pending Gate */
                <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          اطلاعات تماس کارفرما و ارسال درخواست استخدام قفل است
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          نیازمند عضویت و تایید
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {!currentSeeker
                          ? 'مشخصات، دسته‌بندی و حقوق این شغل قابل مشاهده است، اما جهت ارتباط، شماره تلفن و واتساپ مستقیم کارفرما و ارسال درخواست نیازمند ثبت‌نام کارجو است.'
                          : `حساب شما ثبت شده اما در انتظار واریز هزینه خدمات (${seekerFeeToman.toLocaleString('fa-IR')} تومان) و تایید مدیریت است. به محض تایید پرداخت، شماره تماس مستقیم کارفرما و دکمه ارسال رزومه فعال خواهد شد.`}
                      </p>
                    </div>
                  </div>

                  {!currentSeeker ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                      <button
                        onClick={() => setAuthModalOpen(true)}
                        className="w-full sm:flex-1 py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        ورود یا ثبت‌نام اولیه کارجو
                      </button>

                      <button
                        onClick={() => toggleSaveJob(selectedJob.id)}
                        className={`w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                          isJobSaved(selectedJob.id)
                            ? 'bg-red-600/20 border-red-500/40 text-red-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isJobSaved(selectedJob.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        {isJobSaved(selectedJob.id) ? 'نشان‌شده ✓' : 'نشان کردن شغل'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">
                          وضعیت پرونده شما: <strong className="text-amber-400">در انتظار تایید پرداخت هزینه خدمات ⏳</strong>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          نام کاربری: @{currentSeeker.username}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedJob(null);
                            setActiveTab('settings');
                          }}
                          className="w-full sm:flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
                        >
                          مشاهده پروفایل و اطلاعات تسویه حساب
                        </button>

                        <button
                          onClick={() => toggleSaveJob(selectedJob.id)}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                            isJobSaved(selectedJob.id)
                              ? 'bg-red-600/20 border-red-500/40 text-red-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isJobSaved(selectedJob.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          {isJobSaved(selectedJob.id) ? 'نشان‌شده ✓' : 'نشان کردن شغل'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Edit Job Modal with Contract Type & Keywords */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">ویرایش آگهی کار (مدیر)</h3>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditJob} className="p-6 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">عنوان شغل</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">نوع قرارداد</label>
                  <select
                    value={editingJob.contractType || 'full_time'}
                    onChange={(e) => setEditingJob({ ...editingJob, contractType: e.target.value as ContractType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="full_time">تمام وقت (Full-Time)</option>
                    <option value="part_time">پاره وقت (Part-Time)</option>
                    <option value="seasonal">فصلی / پروژه‌ای (Seasonal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">دسته‌بندی شغل</label>
                  <select
                    value={editingJob.category}
                    onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value as JobCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="restaurant">رستوران و کافه</option>
                    <option value="textile">خیاطی و پوشاک</option>
                    <option value="construction">ساختمانی و فنی</option>
                    <option value="hotel">هتل و گردشگری</option>
                    <option value="realestate">املاک و مستغلات</option>
                    <option value="beauty">آرایشگری و زیبایی</option>
                    <option value="warehouse">انبار و بسته‌بندی</option>
                    <option value="sales">فروش و بازاریابی</option>
                    <option value="transport">رانندگی و دلیوری</option>
                    <option value="furniture">نجاری و مبلمان</option>
                    <option value="automotive">تعمیرات خودرو</option>
                    <option value="translator">مترجمی و سلامت</option>
                    <option value="technical">فنی و مهندسی</option>
                    <option value="it">فناوری اطلاعات</option>
                    <option value="general">کارهای عمومی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">کلمات کلیدی برای جستجو (با کاما)</label>
                  <input
                    type="text"
                    placeholder="مثلاً: آشپز، رستوران، جای خواب"
                    value={editingJob.keywords ? editingJob.keywords.join('، ') : ''}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        keywords: e.target.value.split(/[,،]+/).map((k) => k.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Photo Picker from Gallery or Presets */}
              <JobImagePicker
                value={editingJob.imageUrl || ''}
                onChange={(url) => setEditingJob({ ...editingJob, imageUrl: url })}
                category={editingJob.category}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">حداقل حقوق (لیر)</label>
                  <input
                    type="number"
                    value={editingJob.salaryMin}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryMin: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">حداکثر حقوق (لیر)</label>
                  <input
                    type="number"
                    value={editingJob.salaryMax}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryMax: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">توضیحات کار</label>
                <textarea
                  rows={3}
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                >
                  ذخیره تغییرات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN ADD JOB MODAL */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-600/20 text-red-400 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-white text-base">افزودن فرصت شغلی جدید در ترکیه</h3>
              </div>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عنوان شغل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: کمک‌آشپز و سالن‌کار"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام کارفرما یا شرکت *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: هتل و رستوران آناتولی"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">دسته‌بندی شغل *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as JobCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="restaurant">رستوران و کافه (آشپز، کمک‌آشپز، سالن‌کار، باریستا)</option>
                  <option value="textile">خیاطی و پوشاک (چرخکار، راسته‌دوز، اتوکار، بسته‌بندی)</option>
                  <option value="construction">ساختمانی و فنی (نقاش، کاشی‌کار، کناف، برق‌کار)</option>
                  <option value="hotel">هتل و گردشگری (پذیرش، خانه‌داری، تورلیدر)</option>
                  <option value="realestate">املاک و مستغلات (مشاور فروش، اجاره ملک)</option>
                  <option value="beauty">آرایشگری و زیبایی (آرایشگر مردانه، ناخن‌کار، میکاپ)</option>
                  <option value="warehouse">انبار و کارگو (بسته‌بندی، لجستیک کالا)</option>
                  <option value="sales">فروش و بازاریابی (بوتیک، مارکت، صندوق‌دار)</option>
                  <option value="transport">رانندگی و دلیوری (پیک موتوری، ترنسفر فرودگاهی)</option>
                  <option value="furniture">نجاری و مبلمان (کابینت‌کار MDF، نجار)</option>
                  <option value="automotive">تعمیرات خودرو (مکانیک، جلوبندی، صافکاری)</option>
                  <option value="translator">مترجمی و سلامت (کلینیک درمانی، دارالترجمه)</option>
                  <option value="technical">فنی و مهندسی (جوشکار CO2، تکنسین CNC)</option>
                  <option value="it">فناوری اطلاعات و دیجیتال مارکتینگ</option>
                  <option value="general">کارهای عمومی و ساده</option>
                </select>

                {/* Subcategories Multi-Select Checklist */}
                {(() => {
                  const catInfo = JOB_CATEGORIES_DATA.find((c) => c.key === newCategory);
                  if (!catInfo || catInfo.subcategories.length === 0) return null;
                  const currentSubs = newSubcategory.split('،').map((s) => s.trim()).filter(Boolean);

                  return (
                    <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <span className="font-bold text-amber-300 block text-[11px]">
                        تخصص‌ها و زیرشاخه‌های این شغل (انتخاب چندتایی با تیک):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {catInfo.subcategories.map((sub, sidx) => {
                          const isChecked = currentSubs.includes(sub);
                          return (
                            <label key={sidx} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const updated = [...currentSubs, sub];
                                    setNewSubcategory(updated.join('، '));
                                  } else {
                                    const updated = currentSubs.filter((s) => s !== sub);
                                    setNewSubcategory(updated.join('، '));
                                  }
                                }}
                                className="rounded accent-amber-500"
                              />
                              <span>{sub}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شهر (تمام شهرهای ترکیه)</label>
                  <select
                    value={newCity}
                    onChange={(e) => {
                      const newC = e.target.value;
                      setNewCity(newC);
                      const dists = getDistrictsForCity(newC);
                      if (dists.length > 0) setNewDistrict(dists[0]);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    {getDistrictsForCity(newCity).map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداقل حقوق (لیر)</label>
                  <input
                    type="number"
                    value={newSalaryMin}
                    onChange={(e) => setNewSalaryMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حداکثر حقوق (لیر)</label>
                  <input
                    type="number"
                    value={newSalaryMax}
                    onChange={(e) => setNewSalaryMax(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Perks: بیمه، غذا، جای خواب */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="font-bold text-amber-300 block">مزایای رفاهی و اقامتی شغل (بیمه، غذا، جای خواب):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={newAccommodation}
                      onChange={(e) => setNewAccommodation(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>جای خواب / اسکان</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={newMeals}
                      onChange={(e) => setNewMeals(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>وعده غذایی رایگان</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={newHasLeave}
                      onChange={(e) => setNewHasLeave(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>دارای مرخصی کاری</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={newWorkPermitSupport}
                      onChange={(e) => setNewWorkPermitSupport(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>چالیشما ایزنی (اقامت کار)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع قرارداد</label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value as ContractType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="full_time">تمام وقت (Full-Time)</option>
                    <option value="part_time">پاره وقت (Part-Time)</option>
                    <option value="seasonal">فصلی / پروژه‌ای (Seasonal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تسلط به زبان ترکی</label>
                  <select
                    value={newTurkishRequired}
                    onChange={(e) => setNewTurkishRequired(e.target.value as TurkishLevel)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="none">بدون نیاز به زبان ترکی</option>
                    <option value="basic">ترکی مقدماتی / پایه</option>
                    <option value="intermediate">ترکی متوسط</option>
                    <option value="fluent">ترکی مسلط</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره تماس کارفرما</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شماره واتساپ کارفرما</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">کلمات کلیدی برای جستجو (با کاما)</label>
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Photo Picker: Native Gallery Upload or Curated Presets */}
              <JobImagePicker
                value={newImageUrl}
                onChange={setNewImageUrl}
                category={newCategory}
              />

              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات و شرایط کار *</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="شرح وظایف، ساعات کاری، شرایط اسکان و..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ثبت و انتشار آگهی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Success Modal */}
      {applySuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">درخواست شما ارسال شد!</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              مشخصات ثبت‌نامی شما شامل نام، نام پدر، کد ملی و شماره تماس برای کارفرما ارسال گردید. نتیجه بررسی در بخش «درخواست‌های من» قابل مشاهده است.
            </p>

            <button
              onClick={() => {
                setApplySuccessModal(false);
                setSelectedJob(null);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="register"
      />

      <JobAlertModal
        isOpen={jobAlertModalOpen}
        onClose={() => setJobAlertModalOpen(false)}
        initialFilters={{
          city: selectedCity,
          category: selectedCategory,
          contractType: selectedContractType,
          minSalary,
          keywords: selectedKeywords,
          accommodationOnly,
          workPermitOnly,
        }}
      />

      {/* Sepal IPG Modal for Instant Seeker Membership Activation */}
      <SepalGatewayModal
        isOpen={isSepalModalOpen}
        onClose={() => setIsSepalModalOpen(false)}
        amountToman={seekerFeeToman}
        description="تسویه حق عضویت و فعال‌سازی فوری حساب کاربری در سامانه کارباما"
        payerName={currentSeeker?.fullName || ''}
        payerMobile={currentSeeker?.phone || currentSeeker?.phoneNumber || ''}
        onSuccess={handleSepalSeekerSuccess}
      />
    </div>
  );
};
