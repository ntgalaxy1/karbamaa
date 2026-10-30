import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';
import { JobImagePicker } from './JobImagePicker';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { ALL_TURKEY_CITIES_FA, CITIES_WITH_ALL } from '../data/turkeyCities';

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
    openedJobIdFromAlert,
    setOpenedJobIdFromAlert,
    setActiveTab,
    paymentSettings,
  } = useApp();

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

      // 5. City filter
      if (selectedCity !== 'همه شهرها' && job.city !== selectedCity) {
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
      showToast('امکان ارسال درخواست قفل است؛ ابتدا باید واریز ۵۰۰ لیر انجام شده و توسط مدیر تایید شود.', 'error');
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
                سامانه هوشمند کاریابی و اقامت کارباما
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('post-job')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 text-xs font-bold transition shadow-md animate-pulse"
              >
                <Plus className="w-3.5 h-3.5" />
                ثبت آگهی استخدام کارفرما ({paymentSettings.feeTL} لیر)
              </button>

              <button
                type="button"
                onClick={() => setJobAlertModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-xs"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                هشدار استخدام (Job Alert)
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
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/80 shadow-md md:hidden shrink-0"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                کاریابی و استخدام رسمی در ترکیه
              </h1>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              فرصت‌های شغلی رسمی ترکیه با قابلیت جستجوی دقیق در کلمات کلیدی، نوع قرارداد (پاره وقت و تمام وقت)، شهر، حقوق و نشان‌کردن آگهی‌های دلخواه.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center shrink-0">
            <div className="relative group">
              <img
                src="/logo.png"
                alt="لوگوی رسمی کارباما"
                className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-3 border-amber-400/80 shadow-2xl shadow-red-950/80 ring-4 ring-amber-500/20 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-[10px] px-3 py-0.5 rounded-full shadow-md tracking-wider border border-amber-300/40 whitespace-nowrap">
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
                placeholder={
                  searchScope === 'title'
                    ? 'جستجو فقط در عنوان شغل (مثلاً: کمک‌آشپز، چرخکار، مترجم، باریستا)...'
                    : searchScope === 'keywords'
                    ? 'جستجو در کلمات کلیدی و تگ‌ها (مثلاً: جای خواب، تریکو، لارا، فاتیح، پورسانت)...'
                    : 'جستجو در عنوان شغل، کارفرما، کلمات کلیدی، مهارت‌ها و منطقه...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:border-red-500/50 focus:border-red-500 text-white placeholder-slate-400 pr-12 pl-24 py-3.5 rounded-2xl text-sm focus:outline-hidden shadow-lg transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-3.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 transition"
                >
                  پاک کردن
                </button>
              )}
            </div>

            {/* Search Target Mode Selector (Scope) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 px-2">محدوده جستجو:</span>
                <button
                  type="button"
                  onClick={() => setSearchScope('all')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    searchScope === 'all'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  همه بخش‌ها
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
                  فقط عنوان شغل
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
                  فقط کلمات کلیدی
                </button>
              </div>

              {/* Quick Add Custom Keyword Form */}
              <form onSubmit={handleAddCustomKeyword} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="افزودن کلیدواژه دلخواه..."
                  value={customKeywordInput}
                  onChange={(e) => setCustomKeywordInput(e.target.value)}
                  className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 w-44"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
                >
                  + افزودن
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
                  شما با مشخصات <strong>{currentSeeker.fullName}</strong> (فرزند {currentSeeker.fatherName} - کد ملی: {currentSeeker.nationalId}) وارد شده‌اید.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentSeeker.verificationStatus === 'approved' ? (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold">
                    حساب فعال و تاییدشده ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold">
                    در انتظار تایید مدیریت و واریز ۵۰۰ لیر ⏳
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
                    وضعیت حساب کارجو: در انتظار تایید مدارک و واریز وجه (۵۰۰ لیر)
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    کارجوی گرامی، اطلاعات شما ثبت شده است. جهت فعال‌سازی کامل امکان ارسال درخواست شغل، مشاهده تماس کارفرمایان و رزومه‌ساز آنلاین، لطفاً ۵۰۰ لیر فیش واریزی را به مدیر ارسال فرمایید یا منتظر تایید پنل بمانید.
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
            onClick={() => setShowAddJobModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-700/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن فرصت شغلی جدید</span>
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
              انتخاب شهر یا شهرستان ترکیه (شامل تمام شهرها):
            </span>

            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:border-red-500"
              >
                {CITIES_WITH_ALL.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['همه شهرها', 'استانبول', 'فاتیح (Fatih)', 'اسنیورت (Esenyurt)', 'بیلیک‌دوزو (Beylikdüzü)', 'مرتر (Merter)', 'شیشلی (Şişli)', 'آنتالیا', 'آلانیا (Alanya)', 'لارا (Lara)', 'آنکارا', 'ازمیر', 'چشمه (Çeşme)', 'بورسا', 'بودروم (Bodrum)', 'کوش‌آداسی (Kuşadası)'].map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
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
                        title="اطلاعات تماس مستقیم کارفرما قفل است (نیاز به عضویت و تایید ۵۰۰ لیر)"
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
                        className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-xl transition flex items-center gap-1"
                        title="ارسال درخواست قفل است؛ نیاز به عضویت و تایید ۵۰۰ لیر"
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
                          : 'حساب شما ثبت شده اما در انتظار واریز وجه (۵۰۰ لیر) و تایید مدیریت است. به محض تایید پرداخت، شماره تماس مستقیم کارفرما و دکمه ارسال رزومه فعال خواهد شد.'}
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
                          وضعیت پرونده شما: <strong className="text-amber-400">در انتظار تایید پرداخت ۵۰۰ لیر ⏳</strong>
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
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">منطقه / محله</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
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
    </div>
  );
};
