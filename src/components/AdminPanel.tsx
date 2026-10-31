import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobVacancy, JobCategory, TurkishLevel, ApplicationStatus, AddressCategory, Hotel, ContractType, JobSeeker } from '../types';
import { MapLocationPicker } from './MapLocationPicker';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { ALL_TURKEY_CITIES_FA } from '../data/turkeyCities';
import {
  ShieldCheck,
  Briefcase,
  Users,
  User,
  FileCheck2,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Search,
  Sparkles,
  IdCard,
  Building,
  DollarSign,
  AlertCircle,
  Check,
  Send,
  Hotel as HotelIcon,
  Train,
  Edit,
  Lock,
  LogOut,
  Calendar,
  Star,
  CreditCard,
  Camera,
  FileText,
  Eye,
  Languages,
  CheckSquare,
  Award,
  Home,
  Utensils,
  Shield,
  FileCheck,
  Landmark,
  Building2,
  X,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    jobs,
    addJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    jobSeekers,
    applications,
    updateApplicationStatus,
    addresses,
    addAddress,
    deleteAddress,
    hotels,
    addHotel,
    updateHotel,
    deleteHotel,
    hotelBookings,
    updateBookingStatus,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    showToast,
    brokerSettings,
    updateBrokerSettings,
    adminCredentials,
    updateAdminCredentials,
    paymentSettings,
    updatePaymentSettings,
    approveJobPayment,
    rejectJobPayment,
    adminNotifications,
    unreadAdminNotifCount,
    markAdminNotificationAsRead,
    clearAdminNotifications,
    approveSeekerAccount,
    rejectSeekerAccount,
    // Partner system
    partners,
    partnerPlans,
    approvePartnerSubscription,
    rejectPartnerSubscription,
    updatePartnerPlanPricing,
    updatePartnerPlans,
  } = useApp();

  // Admin login credentials state (if not logged in)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab inside admin (categorized & organized)
  const [adminTab, setAdminTab] = useState<
    | 'admin-notifications'
    | 'payment-approvals'
    | 'partners'
    | 'jobs'
    | 'seekers'
    | 'exchange-settings'
    | 'security'
    | 'hotels'
    | 'bookings'
    | 'applications'
    | 'addresses'
    | 'broker'
  >('admin-notifications');

  const [seekerSearch, setSeekerSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');

  // Count pending payment jobs
  const pendingPaymentJobs = jobs.filter(
    (j) => j.paymentStatus === 'pending_approval' || j.paymentStatus === 'pending_payment'
  );

  // State for Admin Security & Password Change
  const [currentAdminPassInput, setCurrentAdminPassInput] = useState('');
  const [newAdminUsernameInput, setNewAdminUsernameInput] = useState(adminCredentials.username);
  const [newAdminPassInput, setNewAdminPassInput] = useState('');
  const [newAdminPassConfirmInput, setNewAdminPassConfirmInput] = useState('');

  // State for Payment & Exchange Rate Settings
  const [feeTLInput, setFeeTLInput] = useState(paymentSettings.feeTL);
  const [exchangeRateInput, setExchangeRateInput] = useState(paymentSettings.exchangeRateToman);
  const [turkeyBankInput, setTurkeyBankInput] = useState(paymentSettings.turkeyBankName);
  const [turkeyIbanInput, setTurkeyIbanInput] = useState(paymentSettings.turkeyIban);
  const [turkeyHolderInput, setTurkeyHolderInput] = useState(paymentSettings.turkeyAccountHolder);
  const [iranBankInput, setIranBankInput] = useState(paymentSettings.iranBankName);
  const [iranCardInput, setIranCardInput] = useState(paymentSettings.iranCardNumber);
  const [iranHolderInput, setIranHolderInput] = useState(paymentSettings.iranCardHolder);

  // State for Receipt View Modal & Rejection Reason
  const [viewReceiptModalUrl, setViewReceiptModalUrl] = useState<string | null>(null);
  const [rejectModalJobId, setRejectModalJobId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Selected seeker for viewing full dossier (documents, contract, signature)
  const [selectedSeekerDossier, setSelectedSeekerDossier] = useState<JobSeeker | null>(null);

  // Broker Settings Form State
  const [brokerCardInput, setBrokerCardInput] = useState(brokerSettings.brokerCardNumber);
  const [brokerHolderInput, setBrokerHolderInput] = useState(brokerSettings.brokerCardHolder);
  const [brokerBankInput, setBrokerBankInput] = useState(brokerSettings.brokerBankName);
  const [brokerFeeInput, setBrokerFeeInput] = useState(brokerSettings.brokerServiceFee);
  const [brokerIbanInput, setBrokerIbanInput] = useState(brokerSettings.brokerIban || '');

  // Partner Admin State
  const [partnerPlanPrices, setPartnerPlanPrices] = useState(partnerPlans);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [rejectPartnerModalId, setRejectPartnerModalId] = useState<string | null>(null);
  const [rejectPartnerReason, setRejectPartnerReason] = useState('');

  const pendingPartnerApprovalsCount = partners.filter(
    (p) => p.subscriptionStatus === 'pending_approval'
  ).length;

  // Add Job Form Modal state
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
  const [newAccommodationDetails, setNewAccommodationDetails] = useState('خوابگاه پرسنلی مجهز با تخت، کمد اختصاصی، اینترنت پرسرعت رایگان و سرویس مجزا');
  const [newMealDetails, setNewMealDetails] = useState('۳ وعده غذای گرم کامل (صبحانه، ناهار و شام) رایگان در محل کارگاه');
  const [newLeaveDetails, setNewLeaveDetails] = useState('۱ روز در هفته (یک‌شنبه یا توافقی)');
  const [newWorkPermitSupport, setNewWorkPermitSupport] = useState(true);
  const [newTurkishRequired, setNewTurkishRequired] = useState<TurkishLevel>('basic');
  const [newContractType, setNewContractType] = useState<ContractType>('full_time');
  const [newKeywords, setNewKeywords] = useState('رستوران، آشپزی، جای خواب، اقامت کاری');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('سابقه کار مرتبط، انضباط کاری');
  const [newPhone, setNewPhone] = useState('+90 532 000 0000');
  const [newWhatsapp, setNewWhatsapp] = useState('+90 532 000 0000');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');

  // Edit Job State
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);

  // Add Hotel Form Modal state (requested explicitly)
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelNameTr, setNewHotelNameTr] = useState('');
  const [newHotelCity, setNewHotelCity] = useState('استانبول');
  const [newHotelDistrict, setNewHotelDistrict] = useState('آکسارای');
  const [newHotelType, setNewHotelType] = useState<'hotel' | 'hostel' | 'apart' | 'pension'>('hotel');
  const [newHotelStars, setNewHotelStars] = useState(3);
  const [newHotelPrice, setNewHotelPrice] = useState(900);
  const [newHotelAddress, setNewHotelAddress] = useState('');
  const [newHotelPhone, setNewHotelPhone] = useState('+90 212 588 0000');
  const [newHotelWhatsapp, setNewHotelWhatsapp] = useState('+90 534 000 0000');
  const [newHotelImageUrl, setNewHotelImageUrl] = useState('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
  const [newHotelAmenities, setNewHotelAmenities] = useState('وای‌فای رایگان، صبحانه بوفه، پرسنل فارسی‌زبان، لاندری');
  const [newHotelNearTransit, setNewHotelNearTransit] = useState('۲ دقیقه تا ایستگاه مترو و تراموای آکسارای');
  const [newHotelDesc, setNewHotelDesc] = useState('هتل اقتصادی، تمیز و امن در مرکز استانبول مناسب برای اقامت کارجویان و تازه‌واردین با دسترسی عالی');
  const [newHotelCoordinates, setNewHotelCoordinates] = useState<{ lat: number; lng: number }>({ lat: 41.0082, lng: 28.9484 });
  const [newHotelMaps, setNewHotelMaps] = useState('https://www.google.com/maps?q=41.0082,28.9484');

  // Edit Hotel State
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Add Address Modal state
  const [showAddAddrModal, setShowAddAddrModal] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrTitleTr, setNewAddrTitleTr] = useState('');
  const [newAddrCategory, setNewAddrCategory] = useState<AddressCategory>('immigration');
  const [newAddrCity, setNewAddrCity] = useState('استانبول');
  const [newAddrDistrict, setNewAddrDistrict] = useState('فاتیح');
  const [newAddrAddress, setNewAddrAddress] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('+90 ');
  const [newAddrHours, setNewAddrHours] = useState('۰۸:۳۰ الی ۱۷:۰۰');
  const [newAddrDesc, setNewAddrDesc] = useState('');

  // Handle Admin Login submission
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = loginAdmin(adminUsername, adminPassword);
    if (!res.success) {
      setLoginError(res.error || 'اطلاعات ورود مدیر اشتباه است');
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newDescription.trim()) {
      showToast('لطفاً عنوان، نام کارفرما و توضیحات کار را وارد نمایید', 'error');
      return;
    }

    const reqs = newRequirements
      .split('،')
      .join(',')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const kwList = newKeywords
      .split('،')
      .join(',')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

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
      accommodationDetails: newAccommodation ? newAccommodationDetails.trim() : undefined,
      mealDetails: newMeals ? newMealDetails.trim() : undefined,
      leaveDetails: newHasLeave ? newLeaveDetails.trim() : undefined,
      workPermitSupport: newWorkPermitSupport,
      turkishRequired: newTurkishRequired,
      gender: 'all',
      imageUrl: newImageUrl.trim(),
      description: newDescription.trim(),
      requirements: reqs.length > 0 ? reqs : ['سابقه کار مرتبط'],
      contactPhone: newPhone.trim(),
      contactWhatsapp: newWhatsapp.trim(),
      isActive: true,
    });

    setShowAddJobModal(false);
    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    showToast('آگهی کار با مشخصات کامل بیمه، غذا و جای خواب ثبت گردید', 'success');
  };

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim() || !newHotelPrice) {
      showToast('لطفاً نام هتل و قیمت را وارد نمایید', 'error');
      return;
    }

    const amenitiesList = newHotelAmenities
      .split('،')
      .join(',')
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const mapsLink = newHotelMaps.trim() || `https://www.google.com/maps?q=${newHotelCoordinates.lat},${newHotelCoordinates.lng}`;

    addHotel({
      name: newHotelName.trim(),
      nameTr: newHotelNameTr.trim() || newHotelName.trim(),
      city: newHotelCity,
      district: newHotelDistrict.trim(),
      stars: Number(newHotelStars) || 3,
      type: newHotelType,
      pricePerNight: Number(newHotelPrice) || 850,
      address: newHotelAddress.trim() || `${newHotelDistrict}, ${newHotelCity}`,
      phone: newHotelPhone.trim(),
      whatsapp: newHotelWhatsapp.trim(),
      imageUrl: newHotelImageUrl.trim(),
      amenities: amenitiesList.length > 0 ? amenitiesList : ['وای‌فای رایگان'],
      nearTransit: newHotelNearTransit.trim() || 'نزدیک به ایستگاه مترو',
      description: newHotelDesc.trim(),
      mapsUrl: mapsLink,
      coordinates: newHotelCoordinates,
    });

    setShowAddHotelModal(false);
    setNewHotelName('');
    setNewHotelNameTr('');
    setNewHotelAddress('');
    showToast('هتل جدید با موقعیت مکانی دقیق روی نقشه با موفقیت ثبت شد', 'success');
  };

  const handleSaveEditHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    updateHotel(editingHotel.id, editingHotel);
    setEditingHotel(null);
  };

  const handleSaveEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    updateJob(editingJob.id, editingJob);
    setEditingJob(null);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTitle.trim() || !newAddrAddress.trim()) {
      showToast('لطفاً عنوان و آدرس مرکز را وارد نمایید', 'error');
      return;
    }

    addAddress({
      title: newAddrTitle.trim(),
      titleTr: newAddrTitleTr.trim() || newAddrTitle.trim(),
      category: newAddrCategory,
      city: newAddrCity,
      district: newAddrDistrict.trim(),
      address: newAddrAddress.trim(),
      phones: [newAddrPhone.trim()],
      workingHours: newAddrHours.trim(),
      description: newAddrDesc.trim() || 'ارائه خدمات اداری و کنسولی در ترکیه',
      isEmergency24h: false,
    });

    setShowAddAddrModal(false);
    setNewAddrTitle('');
    setNewAddrAddress('');
  };

  // If user is NOT logged in as admin, show dedicated Admin Security Login screen as requested!
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-slate-900 border border-amber-600/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">ورود اختصاصی مدیر سامانه</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              جهت فعال‌سازی دسترسی مدیریت و ویرایش تمام بخش‌ها (آگهی‌ها، هتل‌ها، کارجویان و درخواست‌ها) نام کاربری و رمز مدیر را وارد کنید.
            </p>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 text-right">
            اطلاعات پیش‌فرض مدیر: <strong>یوزرنیم: admin</strong> | <strong>رمز: admin123</strong>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs text-right flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs text-right">
            <div>
              <label className="block text-slate-300 mb-1">نام کاربری مدیر</label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">رمز عبور مدیر</label>
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-700/30 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              ورود و فعال‌سازی دسترسی مدیریت
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Once Admin IS LOGGED IN:
  const filteredSeekers = jobSeekers.filter((s) => {
    if (!seekerSearch.trim()) return true;
    const q = seekerSearch.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.nationalId.includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.targetCity.toLowerCase().includes(q)
    );
  });

  const filteredJobs = jobs.filter((j) => {
    if (!jobSearch.trim()) return true;
    const q = jobSearch.toLowerCase();
    return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.city.toLowerCase().includes(q);
  });

  const filteredHotels = hotels.filter((h) => {
    if (!hotelSearch.trim()) return true;
    const q = hotelSearch.toLowerCase();
    return h.name.toLowerCase().includes(q) || h.district.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Active Admin Top Bar with Exit */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-600/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            پنل جامع مدیر فعال است (دسترسی کامل ویرایش و افزودن هتل، آگهی و مدیریت کارجویان)
          </div>
          <h1 className="text-2xl font-extrabold text-white">مدیریت تمام بخش‌های کاریابی و اقامت ترکیه</h1>
          <p className="text-xs text-slate-300 mt-1">
            امکان افزودن و ویرایش هتل‌های نزدیک، تغییر مشخصات آگهی‌های شغلی و بررسی پرونده متقاضیان
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddHotelModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            افزودن هتل جدید
          </button>

          <button
            onClick={() => setShowAddJobModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            افزودن آگهی کار
          </button>

          <button
            onClick={logoutAdmin}
            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl transition"
            title="خروج از حالت مدیریت و قفل کردن پنل"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            کارجویان
          </div>
          <div className="text-xl font-bold text-white font-mono">{jobSeekers.length} نفر</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            آگهی‌های کار
          </div>
          <div className="text-xl font-bold text-white font-mono">{jobs.length} شغل</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <HotelIcon className="w-3.5 h-3.5 text-amber-400" />
            هتل‌های نزدیک
          </div>
          <div className="text-xl font-bold text-white font-mono">{hotels.length} هتل</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            رزروهای هتل
          </div>
          <div className="text-xl font-bold text-white font-mono">{hotelBookings.length} رزرو</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <FileCheck2 className="w-3.5 h-3.5 text-red-400" />
            درخواست‌های کار
          </div>
          <div className="text-xl font-bold text-white font-mono">{applications.length} رزومه</div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('admin-notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'admin-notifications'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-300" />
          <span>اعلان‌های زنده مدیریت ({adminNotifications.length})</span>
          {unreadAdminNotifCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400 text-slate-950 animate-pulse">
              {unreadAdminNotifCount} جدید
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('payment-approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'payment-approvals'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-300" />
          <span>تایید آگهی‌ها و فیش‌های واریزی (۵۰۰ لیر)</span>
          {pendingPaymentJobs.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400 text-slate-950 animate-pulse">
              {pendingPaymentJobs.length} منتظر تایید
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('partners')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'partners'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>همکاران و پلن‌های اشتراک ({partners.length})</span>
          {pendingPartnerApprovalsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400 text-slate-950 animate-pulse">
              {pendingPartnerApprovalsCount} واریز همکار
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('jobs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'jobs'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          همه آگهی‌ها ({jobs.length})
        </button>

        <button
          onClick={() => setAdminTab('seekers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'seekers'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          کاربران و کارجویان ثبت‌نامی ({jobSeekers.length})
        </button>

        <button
          onClick={() => setAdminTab('exchange-settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'exchange-settings'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          تنظیمات پرداخت، نرخ روز ارز و حساب‌ها
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'security'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          تغییر رمز عبور مدیر
        </button>

        <button
          onClick={() => setAdminTab('hotels')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'hotels'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <HotelIcon className="w-4 h-4" />
          هتل‌ها ({hotels.length})
        </button>

        <button
          onClick={() => setAdminTab('bookings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'bookings'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          رزروهای هتل ({hotelBookings.length})
        </button>

        <button
          onClick={() => setAdminTab('applications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'applications'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          درخواست‌های کار ({applications.length})
        </button>

        <button
          onClick={() => setAdminTab('addresses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'addresses'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          آدرس‌های مهم ({addresses.length})
        </button>

        <button
          onClick={() => setAdminTab('broker')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            adminTab === 'broker'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          تعهدنامه کارگزار
        </button>
      </div>

      {/* -1. LIVE ADMIN NOTIFICATIONS TAB (Requested Feature) */}
      {adminTab === 'admin-notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>اعلان‌های زنده و گزارشات لحظه‌ای مدیر کارباما</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                گزارش‌های فوری شامل ثبت‌نام کارجویان، واریزی‌های ۵۰۰ لیر، ارسال رزومه‌ها و رزروهای هتل در این نوار ذخیره می‌شوند.
              </p>
            </div>

            {adminNotifications.length > 0 && (
              <button
                type="button"
                onClick={clearAdminNotifications}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی اعلان‌ها</span>
              </button>
            )}
          </div>

          {adminNotifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
              هیچ اعلانی هنوز ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {adminNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAdminNotificationAsRead(notif.id)}
                  className={`p-4 rounded-2xl border text-xs transition cursor-pointer flex items-start gap-3 ${
                    notif.read
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                      : 'bg-slate-950 border-amber-500/50 text-slate-200 font-bold shadow-lg ring-1 ring-amber-500/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 text-sm">{notif.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                        {new Date(notif.createdAt).toLocaleTimeString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 0. PAYMENT APPROVALS & RECEIPT VERIFICATION (Requested Feature) */}
      {adminTab === 'payment-approvals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>بررسی و تایید آگهی‌های استخدامی و فیش‌های واریزی (۵۰۰ لیر)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                آگهی‌های ثبت شده توسط کارفرمایان پس از بررسی فیش واریزی و زدن دکمه «تایید و انتشار»، در سایت فعال خواهند شد.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold font-mono">
                {pendingPaymentJobs.length} آگهی در صف تایید
              </span>
            </div>
          </div>

          {/* List of Pending Jobs */}
          {pendingPaymentJobs.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-sm">هیچ آگهی معلقی در صف تایید پرداخت وجود ندارد.</h4>
              <p className="text-xs text-slate-400">تمام آگهی‌های ثبت‌شده تعیین تکلیف شده‌اند.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPaymentJobs.map((job) => {
                const methodLabel =
                  job.paymentMethod === 'zarinpal'
                    ? 'درگاه آنلاین زرین‌پال'
                    : job.paymentMethod === 'turkey_bank'
                    ? 'حساب بانکی ترکیه (Ziraat Bankası)'
                    : 'کارت به کارت ایران';

                return (
                  <div
                    key={job.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold">
                            {job.city} ({job.district})
                          </span>
                          <span className="text-xs font-mono text-slate-400">کد: {job.id}</span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                            تعرفه: ۵۰۰ لیر
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white mt-1.5">{job.title}</h4>
                        <p className="text-xs text-slate-300 font-bold">{job.company}</p>
                      </div>

                      <div className="text-left">
                        <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold animate-pulse">
                          در انتظار تایید فیش واریزی
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          ثبت: {new Date(job.postedAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>

                    {/* Payment & Payer Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">روش پرداخت:</span>
                        <span className="font-bold text-amber-300">{methodLabel}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">شماره پیگیری / ارجاع:</span>
                        <span className="font-mono font-bold text-white select-all">{job.paymentReferenceId || 'ثبت نشده'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">مشخصات واریزکننده:</span>
                        <span className="font-bold text-white">{job.paymentPayerName || 'کارفرما'}</span>
                      </div>
                    </div>

                    {/* Receipt Image Thumbnail & Job Specs */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Receipt Image */}
                      {job.paymentReceiptUrl ? (
                        <div className="shrink-0 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 block">تصویر فیش واریزی:</span>
                          <div
                            onClick={() => setViewReceiptModalUrl(job.paymentReceiptUrl || null)}
                            className="relative w-36 h-28 rounded-2xl overflow-hidden border-2 border-amber-500/50 cursor-pointer group shadow-lg bg-black"
                          >
                            <img
                              src={job.paymentReceiptUrl}
                              alt="فیش واریزی"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                              <span className="px-2 py-1 bg-black/70 text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                بزرگنمایی فیش
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 shrink-0">
                          فاقد فایل فیش (پرداخت زرین‌پال یا پیگیری با کد)
                        </div>
                      )}

                      {/* Job Description Brief */}
                      <div className="flex-1 space-y-2 text-xs text-slate-300">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 leading-relaxed">
                          <strong className="text-slate-200">شرح کار: </strong>
                          {job.description}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span>تلفن تماس: <strong className="text-white dir-ltr inline-block">{job.contactPhone}</strong></span>
                          <span>|</span>
                          <span>واتس‌اپ: <strong className="text-white dir-ltr inline-block">{job.contactWhatsapp || '-'}</strong></span>
                          <span>|</span>
                          <span>حقوق: <strong className="text-emerald-400">{job.salaryMin.toLocaleString('fa-IR')} تا {job.salaryMax.toLocaleString('fa-IR')} لیر</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Approve / Reject */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setRejectModalJobId(job.id);
                          setRejectReasonInput('');
                        }}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رد فیش / آگهی</span>
                      </button>

                      <button
                        onClick={() => approveJobPayment(job.id)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>تایید پرداخت ۵۰۰ لیر و انتشار فوری در سایت</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EXCHANGE & PAYMENT SETTINGS TAB (Requested Feature) */}
      {adminTab === 'exchange-settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-400" />
              <span>تنظیمات پرداخت، نرخ لحظه‌ای لیر و حساب‌های بانکی کارباما</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              مبالغ و شماره حساب‌های وارد شده در این بخش مستقیماً در فرم ثبت آگهی به کارفرمایان نمایش داده می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Lira Exchange Rate */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300">نرخ روز هر لیر به تومان (لحظه‌ای)</label>
                <span className="text-xs font-mono font-bold text-slate-400">۱ TRY = {Number(exchangeRateInput).toLocaleString('fa-IR')} تومان</span>
              </div>
              <input
                type="number"
                value={exchangeRateInput}
                onChange={(e) => setExchangeRateInput(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />
              <p className="text-[11px] text-slate-400">
                مبلغ ۵۰۰ لیر ثابت با این نرخ معادل <strong>{(500 * Number(exchangeRateInput)).toLocaleString('fa-IR')} تومان</strong> محاسبه خواهد شد.
              </p>
            </div>

            {/* Fixed Fee in TL */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-amber-300 block">تعرفه ثابت ثبت هر آگهی (به لیر ترکیه)</label>
              <input
                type="number"
                value={feeTLInput}
                onChange={(e) => setFeeTLInput(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />
              <p className="text-[11px] text-slate-400">پیش‌فرض طبق درخواست شما: ۵۰۰ لیر ثابت ترکیه</p>
            </div>

          </div>

          {/* Turkey Bank Account Details */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-extrabold text-red-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>مشخصات حساب بانکی ترکیه (Ziraat Bankası)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام بانک ترکیه</label>
                <input
                  type="text"
                  value={turkeyBankInput}
                  onChange={(e) => setTurkeyBankInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام صاحب حساب</label>
                <input
                  type="text"
                  value={turkeyHolderInput}
                  onChange={(e) => setTurkeyHolderInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">شماره ایبان (IBAN ترکیه)</label>
                <input
                  type="text"
                  value={turkeyIbanInput}
                  onChange={(e) => setTurkeyIbanInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr text-right"
                />
              </div>
            </div>
          </div>

          {/* Iran Card to Card Details */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-extrabold text-emerald-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>مشخصات کارت بانکی ایران جهت دریافت تومانی</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام بانک ایران</label>
                <input
                  type="text"
                  value={iranBankInput}
                  onChange={(e) => setIranBankInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">نام صاحب کارت</label>
                <input
                  type="text"
                  value={iranHolderInput}
                  onChange={(e) => setIranHolderInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">شماره کارت ۱۶ رقمی</label>
                <input
                  type="text"
                  value={iranCardInput}
                  onChange={(e) => setIranCardInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr text-right"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                updatePaymentSettings({
                  feeTL: Number(feeTLInput) || 500,
                  exchangeRateToman: Number(exchangeRateInput) || 2300,
                  turkeyBankName: turkeyBankInput.trim(),
                  turkeyIban: turkeyIbanInput.trim(),
                  turkeyAccountHolder: turkeyHolderInput.trim(),
                  iranBankName: iranBankInput.trim(),
                  iranCardNumber: iranCardInput.trim(),
                  iranCardHolder: iranHolderInput.trim(),
                });
              }}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              ذخیره تنظیمات پرداخت و نرخ ارز
            </button>
          </div>
        </div>
      )}

      {/* ADMIN SECURITY & PASSWORD CHANGE TAB (Requested Feature) */}
      {adminTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>تغییر نام کاربری و رمز ورود اختصاصی مدیر</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              مدیر گرامی، می‌توانید اطلاعات ورود خود را در این بخش ویرایش نمایید. این اطلاعات به صورت پایدار در حافظه ذخیره می‌شود.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">نام کاربری فعلی مدیر:</span>
              <span className="font-mono font-bold text-amber-300">{adminCredentials.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">آخرین زمان به‌روزرسانی:</span>
              <span className="font-mono text-slate-400">
                {adminCredentials.updatedAt ? new Date(adminCredentials.updatedAt).toLocaleDateString('fa-IR') : 'پیش‌فرض'}
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentAdminPassInput !== adminCredentials.password) {
                showToast('رمز عبور فعلی مدیر اشتباه است.', 'error');
                return;
              }
              if (newAdminPassInput !== newAdminPassConfirmInput) {
                showToast('رمز عبور جدید با تکرار آن مطابقت ندارد.', 'error');
                return;
              }
              const res = updateAdminCredentials(newAdminUsernameInput, newAdminPassInput);
              if (res.success) {
                setCurrentAdminPassInput('');
                setNewAdminPassInput('');
                setNewAdminPassConfirmInput('');
              }
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-300 font-bold mb-1">نام کاربری جدید مدیر</label>
              <input
                type="text"
                required
                value={newAdminUsernameInput}
                onChange={(e) => setNewAdminUsernameInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">رمز عبور فعلی مدیر *</label>
              <input
                type="password"
                required
                value={currentAdminPassInput}
                onChange={(e) => setCurrentAdminPassInput(e.target.value)}
                placeholder="رمز عبور فعلی را وارد کنید"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">رمز عبور جدید *</label>
              <input
                type="password"
                required
                value={newAdminPassInput}
                onChange={(e) => setNewAdminPassInput(e.target.value)}
                placeholder="حداقل ۵ کاراکتر"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">تکرار رمز عبور جدید *</label>
              <input
                type="password"
                required
                value={newAdminPassConfirmInput}
                onChange={(e) => setNewAdminPassConfirmInput(e.target.value)}
                placeholder="تکرار رمز جدید"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-left"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              ثبت و ذخیره رمز عبور جدید مدیر
            </button>
          </form>
        </div>
      )}

      {/* 1. MANAGE JOBS */}
      {adminTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو در آگهی‌ها..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setShowAddJobModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              ثبت آگهی کار جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition ${
                  job.isActive ? 'border-slate-800' : 'border-red-950/60 opacity-60'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {job.imageUrl && (
                    <img
                      src={job.imageUrl}
                      alt={job.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-800"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                        {job.city} - {job.district}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="p-1 text-slate-400 hover:text-amber-400"
                          title="ویرایش کامل آگهی"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                          title="حذف آگهی"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm truncate">{job.title}</h3>
                    <p className="text-xs text-slate-400">{job.company}</p>
                    <p className="text-xs text-amber-300 font-mono mt-1">
                      {job.salaryMin.toLocaleString('fa-IR')} تا {job.salaryMax.toLocaleString('fa-IR')} لیر
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MANAGE HOTELS (Requested: افزودن هتل هم امکانش باشه) */}
      {adminTab === 'hotels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو در هتل‌ها..."
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setShowAddHotelModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              افزودن هتل جدید در ترکیه
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-4 flex gap-4"
              >
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 bg-slate-800"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                      {hotel.city} - {hotel.district} ({hotel.stars} ستاره)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingHotel(hotel)}
                        className="p-1 text-slate-400 hover:text-amber-400"
                        title="ویرایش هتل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHotel(hotel.id)}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="حذف هتل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-xs truncate">{hotel.name}</h4>
                  <p className="text-[11px] text-amber-400 font-mono font-bold">
                    شبی {hotel.pricePerNight.toLocaleString('fa-IR')} لیر
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                    تلفن: {hotel.phone}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{hotel.nearTransit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. HOTEL BOOKINGS TAB */}
      {adminTab === 'bookings' && (
        <div className="space-y-4">
          {hotelBookings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              هنوز رزروی برای هتل‌ها ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {hotelBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{b.hotelName}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{b.city}</span>
                    </div>
                    <p className="text-slate-300">
                      مهمان: <strong>{b.guestName}</strong> | تلفن: <span className="font-mono" dir="ltr">{b.guestPhone}</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      ورود: {b.checkInDate} | اقامت: {b.nights} شب ({b.guestsCount} نفر) | کل مبلغ: <strong>{b.totalPrice.toLocaleString('fa-IR')} لیر</strong>
                    </p>
                    {b.note && <p className="text-[11px] text-amber-300 italic">«{b.note}»</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden"
                    >
                      <option value="confirmed">تایید شده ✓</option>
                      <option value="pending">در انتظار</option>
                      <option value="cancelled">کنسل شده</option>
                    </select>

                    <a
                      href={`tel:${b.guestPhone.replace(/\s/g, '')}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      تماس
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PARTNERS & SUBSCRIPTIONS MANAGEMENT (Requested by User) */}
      {adminTab === 'partners' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">کل همکاران ثبت‌شده</span>
              <strong className="text-xl font-bold text-white font-mono">{partners.length} همکار</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">اشتراک‌های فعال</span>
              <strong className="text-xl font-bold text-emerald-400 font-mono">
                {partners.filter((p) => p.subscriptionStatus === 'active').length} فعال
              </strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">فیش‌های در انتظار تایید</span>
              <strong className="text-xl font-bold text-amber-400 font-mono">
                {pendingPartnerApprovalsCount} درخواست
              </strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">کارجویان ثبت‌شده با کد همکار</span>
              <strong className="text-xl font-bold text-indigo-400 font-mono">
                {jobSeekers.filter((s) => s.registeredByRole === 'partner').length} کارجو
              </strong>
            </div>
          </div>

          {/* 1. SET PARTNER SUBSCRIPTION PLAN PRICES (User Request: با قیمتهایی متفاوت که توسط مدیر تعیین بشه) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  تنظیم تعرفه و قیمت پلن‌های اشتراک همکاران (توسط مدیر)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  قیمت‌های تعیین‌شده در این قسمت در پنل همکاران به عنوان هزینه اشتراک نمایش داده می‌شود.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  updatePartnerPlans(partnerPlanPrices);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Check className="w-4 h-4" />
                ذخیره تغییرات قیمت پلن‌ها
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {partnerPlanPrices.map((plan, idx) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{plan.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {plan.durationMonths} ماه
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">قیمت به لیر ترکیه (₺):</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={plan.priceTL}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPartnerPlanPrices((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, priceTL: val } : p))
                          );
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 outline-none"
                      />
                      <span className="absolute left-3 top-2 text-[10px] text-slate-400">لیر</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">قیمت معادل به تومان:</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={plan.priceToman}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPartnerPlanPrices((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, priceToman: val } : p))
                          );
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 outline-none"
                      />
                      <span className="absolute left-3 top-2 text-[10px] text-slate-400">تومان</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    ویژگی: {plan.features[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PENDING PARTNER PAYMENT APPROVALS (User Request: بعد از پرداخت توسط همکار بخشها قابل نمایش بشه) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  بررسی و تایید فیش‌های واریزی اشتراک همکاران ({pendingPartnerApprovalsCount})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  پس از تایید فیش توسط شما، اشتراک همکار فعال شده و دکمه‌های ثبت کارجو برای او باز می‌شود.
                </p>
              </div>
            </div>

            {pendingPartnerApprovalsCount === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                در حال حاضر هیچ فیش واریزی در انتظار بررسی همکاران وجود ندارد.
              </div>
            ) : (
              <div className="space-y-3">
                {partners
                  .filter((p) => p.subscriptionStatus === 'pending_approval')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{p.companyName}</span>
                          <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                            کد: {p.partnerCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                            پلن: {p.planTitle || 'اشتراک همکار'}
                          </span>
                          <span className="text-slate-400">
                            نماینده: {p.fullName} | تلفن: <span className="font-mono text-slate-300" dir="ltr">{p.phone}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">مبلغ پرداختی به لیر:</span>
                            <strong className="text-white font-mono">
                              {p.paymentAmountTL ? p.paymentAmountTL.toLocaleString('fa-IR') + ' لیر' : '---'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">مبلغ به تومان:</span>
                            <strong className="text-emerald-400 font-mono">
                              {p.paymentAmountToman ? p.paymentAmountToman.toLocaleString('fa-IR') + ' تومان' : '---'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">شماره ارجاع / پیگیری:</span>
                            <strong className="text-amber-300 font-mono" dir="ltr">
                              {p.paymentReferenceId || '---'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">نام واریزکننده:</span>
                            <strong className="text-white">{p.paymentPayerName || p.fullName}</strong>
                          </div>
                        </div>

                        {p.paymentReceiptUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-400 text-[11px]">تصویر فیش:</span>
                            <button
                              type="button"
                              onClick={() => setViewReceiptModalUrl(p.paymentReceiptUrl || null)}
                              className="text-amber-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              مشاهده تصویر فیش واریزی ارسالی
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => approvePartnerSubscription(p.id)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/30 transition flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          تایید و فعال‌سازی اشتراک
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectPartnerModalId(p.id);
                            setRejectPartnerReason('');
                          }}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          رد فیش
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 3. PARTNERS DIRECTORY */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  فهرست دفاتر و همکاران کارباما ({partners.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  مشاهده وضعیت اشتراک، کارجویان ثبت‌شده و امکان تمدید دستی اشتراک
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={partnerSearchQuery}
                  onChange={(e) => setPartnerSearchQuery(e.target.value)}
                  placeholder="جستجو بر اساس نام همکار، کد یا شهر..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {partners
                .filter((p) => {
                  if (!partnerSearchQuery.trim()) return true;
                  const q = partnerSearchQuery.toLowerCase();
                  return (
                    p.companyName.toLowerCase().includes(q) ||
                    p.fullName.toLowerCase().includes(q) ||
                    p.partnerCode.toLowerCase().includes(q) ||
                    (p.city && p.city.toLowerCase().includes(q))
                  );
                })
                .map((p) => {
                  const partnerSeekersCount = jobSeekers.filter(
                    (s) => s.registeredByPartnerId === p.id || s.registeredByPartnerCode === p.partnerCode
                  ).length;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{p.companyName}</span>
                          <span className="font-mono text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/30">
                            {p.partnerCode}
                          </span>
                          {p.subscriptionStatus === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                              اشتراک فعال ({p.daysRemaining || 30} روز باقیمانده)
                            </span>
                          ) : p.subscriptionStatus === 'pending_approval' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                              در انتظار تایید فیش
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-bold">
                              غیرفعال / منقضی
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 space-x-3 space-x-reverse">
                          <span>مدیر/نماینده: <strong className="text-slate-200">{p.fullName}</strong></span>
                          <span>شهر: <strong className="text-slate-200">{p.city || 'استانبول'}</strong></span>
                          <span>تلفن: <strong className="text-slate-200 font-mono" dir="ltr">{p.phone}</strong></span>
                          <span>کارجویان ثبت‌شده: <strong className="text-indigo-400 font-bold">{partnerSeekersCount} نفر</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {p.subscriptionStatus !== 'active' ? (
                          <button
                            type="button"
                            onClick={() => approvePartnerSubscription(p.id, 'فعال‌سازی دستی توسط مدیر')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            فعال‌سازی اشتراک
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => approvePartnerSubscription(p.id, 'تمدید ۳۰ روزه توسط مدیر')}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs transition"
                          >
                            تمدید +۳۰ روز
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Modal for Rejecting Partner Subscription */}
          {rejectPartnerModalId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
                <h4 className="font-bold text-white text-sm">علت عدم تایید فیش پرداخت همکار:</h4>
                <textarea
                  rows={3}
                  value={rejectPartnerReason}
                  onChange={(e) => setRejectPartnerReason(e.target.value)}
                  placeholder="مثلاً: مبلغ واریزی با پلن انتخابی مغایرت دارد، یا تصویر ناخوانا است..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      rejectPartnerSubscription(rejectPartnerModalId, rejectPartnerReason);
                      setRejectPartnerModalId(null);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
                  >
                    ثبت و رد درخواست
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectPartnerModalId(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. REGISTERED JOB SEEKERS (With Father Name & National ID) */}
      {adminTab === 'seekers' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="جستجو در کارجویان بر اساس نام، نام پدر، کد ملی یا شماره تلفن..."
              value={seekerSearch}
              onChange={(e) => setSeekerSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            {filteredSeekers.map((seeker) => (
              <div
                key={seeker.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white">{seeker.fullName}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono" dir="ltr">
                      @{seeker.username}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">
                      مقصد: {seeker.targetCountry || 'ترکیه'} ({seeker.targetCity})
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">
                      {seeker.gender === 'female' ? '👩 خانم' : '👨 آقا'}
                    </span>
                    {seeker.registeredByPartnerName && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-400" />
                        <span>ثبت‌شده توسط همکار: {seeker.registeredByPartnerName}</span>
                        {seeker.registeredByPartnerCode && (
                          <span className="font-mono text-indigo-200">({seeker.registeredByPartnerCode})</span>
                        )}
                        {seeker.isTemporaryRegistration && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-bold">
                            پیش‌ثبت‌نام موقت
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">نام کاربری (ورود):</span>
                      <strong className="text-amber-300 font-mono" dir="ltr">{seeker.username}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">رمز عبور کاربر:</span>
                      <strong className="text-emerald-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 inline-block" dir="ltr">
                        {seeker.password || '••••••'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">نام پدر:</span>
                      <strong className="text-white">{seeker.fatherName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">کد ملی:</span>
                      <strong className="text-amber-300 font-mono" dir="ltr">{seeker.nationalId}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">شماره تماس / واتساپ:</span>
                      <strong className="text-emerald-300 font-mono" dir="ltr">{seeker.phone}</strong>
                    </div>
                  </div>

                  {seeker.iranAddress && (
                    <div className="bg-slate-800/40 p-2 rounded-lg text-[11px] text-slate-300">
                      <span className="text-slate-400">آدرس ایران: </span>
                      {seeker.iranAddress}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400">شغل‌ها:</span>
                    <span className="text-slate-200 font-medium">
                      {seeker.selectedJobs && seeker.selectedJobs.length > 0
                        ? seeker.selectedJobs.join('، ')
                        : seeker.skills.join('، ')}
                    </span>
                    {seeker.customProfession && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        حرفه اختصاصی: {seeker.customProfession}
                      </span>
                    )}
                  </div>

                  {/* Document & Contract Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                        seeker.passportPhotoUrl
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      {seeker.passportPhotoUrl ? 'پاسپورت: بارگذاری شد ✓' : 'پاسپورت: ندارد'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                        seeker.fullBodyPhotoUrl
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      {seeker.fullBodyPhotoUrl ? 'عکس تمام قد: بارگذاری شد ✓' : 'عکس قدی: ندارد'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                        seeker.signatureDataUrl
                          ? 'bg-red-950/60 text-red-300 border-red-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      {seeker.signatureDataUrl ? 'تعهدنامه تسویه: امضا شده ✓' : 'تعهدنامه: بدون امضا'}
                    </span>

                    {seeker.payerCardNumber && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-amber-300 bg-amber-950/50 border border-amber-500/30" dir="ltr">
                        کارت: {seeker.payerCardNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {seeker.verificationStatus === 'approved' || seeker.isPaymentVerified ? (
                    <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      حساب فعال و تاییدشده ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => approveSeekerAccount(seeker.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-xs shadow-md animate-pulse"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>تایید تسویه و فعال‌سازی دسترسی کارجو</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedSeekerDossier(seeker)}
                    className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده مدارک و تعهدنامه</span>
                  </button>

                  <a
                    href={`tel:${seeker.phone.replace(/\s/g, '')}`}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    تماس
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. JOB APPLICATIONS TAB */}
      {adminTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              هنوز درخواستی از طرف کارجویان ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs text-slate-400">درخواست برای موقعیت شغلی:</span>
                      <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                      <p className="text-xs text-slate-400">شرکت / کارگاه: {app.companyName} ({app.city})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">وضعیت فعلی:</span>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateApplicationStatus(app.id, e.target.value as ApplicationStatus)
                        }
                        className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:border-amber-500"
                      >
                        <option value="pending">در انتظار بررسی</option>
                        <option value="reviewed">مشاهده شده</option>
                        <option value="interview">دعوت به مصاحبه</option>
                        <option value="accepted">تایید و استخدام نهایی ✓</option>
                        <option value="rejected">رد درخواست</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">نام کارجو:</span>
                      <span className="font-bold text-white">{app.seekerName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">نام پدر:</span>
                      <span className="font-bold text-white">{app.seekerFatherName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">کد ملی:</span>
                      <span className="font-bold text-amber-300 font-mono" dir="ltr">{app.seekerNationalId}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">شماره تماس:</span>
                      <span className="font-bold text-white font-mono" dir="ltr">{app.seekerPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <input
                      type="text"
                      placeholder="ثبت یادداشت یا پاسخ مدیر برای کارجو..."
                      defaultValue={app.adminNote || ''}
                      onBlur={(e) => updateApplicationStatus(app.id, app.status, e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                    <a
                      href={`tel:${app.seekerPhone.replace(/\s/g, '')}`}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      تماس
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. ESSENTIAL ADDRESSES TAB */}
      {adminTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">لیست آدرس‌ها و مراکز مهم ثبت شده</h3>
            <button
              onClick={() => setShowAddAddrModal(true)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              افزودن مرکز جدید
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                      {item.city} - {item.district}
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]" dir="ltr">{item.address}</p>
                  <p className="text-slate-400 font-mono mt-1" dir="ltr">تلفن: {item.phones.join(' - ')}</p>
                </div>

                <button
                  onClick={() => deleteAddress(item.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20"
                  title="حذف مرکز"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. BROKER SETTINGS & SETTLEMENT CONTRACT (Requested: شماره کارت خودم که بعداً در بخش مدیریت اضافه میشه) */}
      {adminTab === 'broker' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  <span>تنظیمات حساب بانکی کارگزار و تعهدنامه تسویه حساب</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  شماره کارت و اطلاعات بانکی ثبت شده در این بخش، در بخش ۴ فرم ثبت‌نام کارجویان و در سند رسمی تعهدنامه تسویه حساب به عنوان حساب مقصد درج می‌گردد.
                </p>
              </div>
              <span className="px-3 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold shrink-0">
                حساب رسمی کارگزار
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBrokerSettings({
                  brokerCardNumber: brokerCardInput.trim(),
                  brokerCardHolder: brokerHolderInput.trim(),
                  brokerBankName: brokerBankInput.trim(),
                  brokerServiceFee: brokerFeeInput.trim(),
                  brokerIban: brokerIbanInput.trim(),
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    شماره کارت بانکی کارگزار (واریز وجه تسویه به این کارت) *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="6037-9975-8842-1024"
                    value={brokerCardInput}
                    onChange={(e) => setBrokerCardInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-left focus:outline-hidden focus:border-red-500 font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    این شماره کارت عینا در متن تعهدنامه کارجو به عنوان حساب کارگزار نمایش داده می‌شود.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    نام و نام خانوادگی دارنده حساب (صاحب کارت) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مدیریت کاریابی کارباما"
                    value={brokerHolderInput}
                    onChange={(e) => setBrokerHolderInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-red-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نام بانک *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: بانک ملی ایران / بانک ملت"
                    value={brokerBankInput}
                    onChange={(e) => setBrokerBankInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    مبلغ هزینه خدمات کارگزار (مندرج در تعهدنامه) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ۲۵,۰۰۰,۰۰۰ تومان"
                    value={brokerFeeInput}
                    onChange={(e) => setBrokerFeeInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-emerald-300 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شماره شبا (اختیاری)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="IR720170000000109876543210"
                    value={brokerIbanInput}
                    onChange={(e) => setBrokerIbanInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-left focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-slate-400 text-[11px] block font-bold">
                  پیش‌نمایش کارت کارگزار در فرم ثبت‌نام کارجو:
                </span>
                <div className="bg-gradient-to-r from-red-950/60 via-slate-850 to-slate-900 border border-red-500/30 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[10px]">{brokerBankInput}</div>
                    <div className="text-white text-base font-black font-mono tracking-widest" dir="ltr">
                      {brokerCardInput}
                    </div>
                    <div className="text-slate-300 text-xs mt-1">صاحب حساب: {brokerHolderInput}</div>
                  </div>
                  <div className="text-left" dir="ltr">
                    <span className="text-emerald-400 font-bold text-xs">{brokerFeeInput}</span>
                    <span className="text-[10px] text-slate-500 block">هزینه تسویه کارگزار</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره و اعمال تنظیمات حساب کارگزار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD HOTEL (Requested!) */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">افزودن هتل و اقامتگاه جدید به سامانه</h3>
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="p-6 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نام هتل (فارسی) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: هتل اکسپرس آکسارای"
                    value={newHotelName}
                    onChange={(e) => setNewHotelName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">نام لاتین هتل</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Aksaray Express Hotel"
                    value={newHotelNameTr}
                    onChange={(e) => setNewHotelNameTr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شهر</label>
                  <select
                    value={newHotelCity}
                    onChange={(e) => setNewHotelCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="ازمیر">ازمیر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">منطقه / محله</label>
                  <input
                    type="text"
                    placeholder="مثال: آکسارای / فاتیح"
                    value={newHotelDistrict}
                    onChange={(e) => setNewHotelDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">قیمت هر شب (لیر ₺) *</label>
                  <input
                    type="number"
                    required
                    value={newHotelPrice}
                    onChange={(e) => setNewHotelPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">آدرس عکس هتل (URL تصویر) *</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={newHotelImageUrl}
                  onChange={(e) => setNewHotelImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">فاصله تا مترو یا تراموا</label>
                <input
                  type="text"
                  placeholder="مثال: ۲ دقیقه پیاده تا تراموای T1"
                  value={newHotelNearTransit}
                  onChange={(e) => setNewHotelNearTransit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شماره تماس رزرو هتل</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelPhone}
                    onChange={(e) => setNewHotelPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">شماره واتساپ هتل</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelWhatsapp}
                    onChange={(e) => setNewHotelWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">امکانات هتل (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  value={newHotelAmenities}
                  onChange={(e) => setNewHotelAmenities(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">توضیحات هتل</label>
                <textarea
                  rows={2}
                  value={newHotelDesc}
                  onChange={(e) => setNewHotelDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                ثبت و نمایش هتل در سامانه
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT HOTEL */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">ویرایش مشخصات هتل</h3>
              <button
                onClick={() => setEditingHotel(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditHotel} className="p-6 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 mb-1">نام هتل</label>
                <input
                  type="text"
                  required
                  value={editingHotel.name}
                  onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">قیمت هر شب (لیر)</label>
                  <input
                    type="number"
                    value={editingHotel.pricePerNight}
                    onChange={(e) => setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">تعداد ستاره</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingHotel.stars}
                    onChange={(e) => setEditingHotel({ ...editingHotel, stars: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">آدرس عکس هتل (URL)</label>
                <input
                  type="url"
                  dir="ltr"
                  value={editingHotel.imageUrl}
                  onChange={(e) => setEditingHotel({ ...editingHotel, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">فاصله تا مترو</label>
                <input
                  type="text"
                  value={editingHotel.nearTransit}
                  onChange={(e) => setEditingHotel({ ...editingHotel, nearTransit: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                >
                  ذخیره تغییرات هتل
                </button>
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD JOB */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">ثبت آگهی استخدام جدید در ترکیه</h3>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">عنوان شغل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: کمک‌آشپز رستوران سنتی"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">نام کارفرما یا شرکت *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رستوران استانبول"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">عکس محیط کار (URL تصویر) *</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شهر ترکیه (تمام شهرها)</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {ALL_TURKEY_CITIES_FA.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">منطقه / محله</label>
                  <input
                    type="text"
                    placeholder="مثال: فاتیح / مرتر / اسنیورت"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">دسته‌بندی</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as JobCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    {JOB_CATEGORIES_DATA.map((cat) => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategories checklist */}
              {(() => {
                const catInfo = JOB_CATEGORIES_DATA.find((c) => c.key === newCategory);
                if (!catInfo || catInfo.subcategories.length === 0) return null;
                const currentSubs = newSubcategory.split('،').map((s) => s.trim()).filter(Boolean);

                return (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <span className="font-bold text-amber-300 block text-[11px]">
                      تخصص‌ها و زیرشاخه‌های {catInfo.label} (انتخاب چندتایی با تیک):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نوع قرارداد کاری *</label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value as ContractType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="full_time">تمام وقت (Tam Zamanlı / Full-Time)</option>
                    <option value="part_time">پاره وقت (Yarı Zamanlı / Part-Time)</option>
                    <option value="seasonal">فصلی و پروژه‌ای (Mevsimlik / Proje)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">کلمات کلیدی برای جستجوی دقیق (با کاما)</label>
                  <input
                    type="text"
                    placeholder="مثال: آشپز، رستوران، جای خواب، فاتیح"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">حداقل حقوق (لیر ₺)</label>
                  <input
                    type="number"
                    value={newSalaryMin}
                    onChange={(e) => setNewSalaryMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">حداکثر حقوق (لیر ₺)</label>
                  <input
                    type="number"
                    value={newSalaryMax}
                    onChange={(e) => setNewSalaryMax(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SPECIFIC SECTIONS: ACCOMMODATION, MEALS, INSURANCE, WORK PERMIT */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-300 block">
                  مزایای رفاهی و تسهیلات کارجو (جای خواب، غذا و بیمه):
                </span>

                {/* 1. ACCOMMODATION / جای خواب */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAccommodation}
                        onChange={(e) => setNewAccommodation(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-blue-400" />
                        امکان اسکان و جای خواب رایگان
                      </span>
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${newAccommodation ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'}`}>
                      {newAccommodation ? 'فعال ✓' : 'غیرفعال'}
                    </span>
                  </div>

                  {newAccommodation && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">پیش‌فرض‌های سریع:</span>
                        {[
                          'خوابگاه پرسنلی مجهز با اینترنت',
                          'اتاق مستقل ۲ نفره',
                          'پانسیون در محل کارگاه',
                          'کمک‌هزینه مسکن ماهانه',
                        ].map((preset, pidx) => (
                          <button
                            key={pidx}
                            type="button"
                            onClick={() => setNewAccommodationDetails(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="شرح دقیق امکانات اسکان (مثلاً: خوابگاه اختصاصی پرسنل نزدیک کارگاه با تخت، کمد، اینترنت رایگان و حمام مجزا)..."
                        value={newAccommodationDetails}
                        onChange={(e) => setNewAccommodationDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* 2. MEALS / وعده‌های غذایی */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMeals}
                        onChange={(e) => setNewMeals(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-amber-400" />
                        وعده‌های غذایی رایگان
                      </span>
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${newMeals ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                      {newMeals ? 'فعال ✓' : 'غیرفعال'}
                    </span>
                  </div>

                  {newMeals && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">پیش‌فرض‌های سریع:</span>
                        {[
                          '۳ وعده کامل (صبحانه، ناهار، شام)',
                          'ناهار گرم روزانه رایگان',
                          'صبحانه و ناهار',
                          'بن خرید غذا / Sodexo',
                        ].map((preset, pidx) => (
                          <button
                            key={pidx}
                            type="button"
                            onClick={() => setNewMealDetails(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="شرح وعده‌های غذایی (مثلاً: ناهار گرم روزانه توسط آشپز مجموعه + صبحانه و چای نامحدود)..."
                        value={newMealDetails}
                        onChange={(e) => setNewMealDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* 3. LEAVE / مرخصی کاری */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newHasLeave}
                        onChange={(e) => setNewHasLeave(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        مرخصی کاری (دارد / ندارد)
                      </span>
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${newHasLeave ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                      {newHasLeave ? 'دارای مرخصی ✓' : 'بدون مرخصی'}
                    </span>
                  </div>

                  {newHasLeave && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">پیش‌فرض‌های سریع:</span>
                        {[
                          '۱ روز در هفته (یک‌شنبه یا توافقی)',
                          '۲ روز در ماه مرخصی با حقوق',
                          'مرخصی فصلی و توافقی',
                        ].map((preset, pidx) => (
                          <button
                            key={pidx}
                            type="button"
                            onClick={() => setNewLeaveDetails(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="شرح جزئیات مرخصی (مثلاً: ۱ روز در هفته تعطیل با حقوق کامل)..."
                        value={newLeaveDetails}
                        onChange={(e) => setNewLeaveDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* 4. WORK PERMIT / اقامت کاری */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWorkPermitSupport}
                      onChange={(e) => setNewWorkPermitSupport(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      پشتیبانی از اخذ چالیشما ایزنی (اقامت کاری رسمی ترکیه)
                    </span>
                  </label>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${newWorkPermitSupport ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                    {newWorkPermitSupport ? 'پشتیبانی دارد' : 'بدون چالیشما'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">توضیحات و شرح کار *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="شرح وظایف و شرایط..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شماره تماس کارفرما</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">شماره واتساپ</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                ثبت و انتشار آگهی کار در ترکیه
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT JOB */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">ویرایش آگهی استخدام (مدیر)</h3>
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
                  <label className="block text-slate-300 mb-1">کارفرما / شرکت</label>
                  <input
                    type="text"
                    required
                    value={editingJob.company}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-slate-300 mb-1">کلمات کلیدی (با کاما)</label>
                  <input
                    type="text"
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

              <div>
                <label className="block text-slate-300 mb-1">عکس محیط کار (URL)</label>
                <input
                  type="url"
                  value={editingJob.imageUrl || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-left focus:outline-hidden focus:border-amber-500"
                  dir="ltr"
                />
              </div>

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

              {/* Edit Job: Specific Benefits: Accommodation, Meals, Insurance */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-300 block">مزایای کارجو:</span>

                {/* Accommodation */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingJob.accommodation}
                      onChange={(e) => setEditingJob({ ...editingJob, accommodation: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-blue-400" />
                      جای خواب و اسکان
                    </span>
                  </label>
                  {editingJob.accommodation && (
                    <input
                      type="text"
                      placeholder="جزئیات جای خواب..."
                      value={editingJob.accommodationDetails || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, accommodationDetails: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  )}
                </div>

                {/* Meals */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingJob.meals}
                      onChange={(e) => setEditingJob({ ...editingJob, meals: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      وعده‌های غذایی
                    </span>
                  </label>
                  {editingJob.meals && (
                    <input
                      type="text"
                      placeholder="جزئیات وعده‌های غذایی..."
                      value={editingJob.mealDetails || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, mealDetails: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  )}
                </div>

                {/* Leave / Days Off */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingJob.hasLeave}
                      onChange={(e) => setEditingJob({ ...editingJob, hasLeave: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      مرخصی کاری (دارد / ندارد)
                    </span>
                  </label>
                  {editingJob.hasLeave && (
                    <input
                      type="text"
                      placeholder="جزئیات مرخصی (مثلاً ۱ روز در هفته)..."
                      value={editingJob.leaveDetails || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, leaveDetails: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  )}
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
                  ذخیره تغییرات آگهی
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

      {/* MODAL: ADD HOTEL WITH MAP LOCATION PICKER (Requested by User) */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600/30 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl">
                  <HotelIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-base">افزودن هتل و اقامتگاه جدید (انتخاب از روی نقشه)</h3>
                  <p className="text-xs text-slate-400">ثبت موقعیت دقیق روی نقشه ترکیه، قیمت هر شب و مشخصات هتل</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="p-6 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
              {/* INTERACTIVE MAP PICKER */}
              <div className="space-y-2">
                <label className="block text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" />
                  موقعیت مکانی دقیق هتل روی نقشه (برای ثبت، روی نقشه کلیک کنید یا نشانگر را جابجا نمایید) *
                </label>
                <MapLocationPicker
                  initialCoordinates={newHotelCoordinates}
                  onChange={(coords, mapsUrl) => {
                    setNewHotelCoordinates(coords);
                    setNewHotelMaps(mapsUrl);
                  }}
                  height="260px"
                />
              </div>

              {/* Names and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نام هتل (فارسی) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: هتل پرزیدنت آکسارای"
                    value={newHotelName}
                    onChange={(e) => setNewHotelName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">نام هتل (ترکی / انگلیسی)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="President Hotel Istanbul"
                    value={newHotelNameTr}
                    onChange={(e) => setNewHotelNameTr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* City, District, Type, Stars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شهر *</label>
                  <select
                    value={newHotelCity}
                    onChange={(e) => setNewHotelCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="استانبول">استانبول</option>
                    <option value="آنتالیا">آنتالیا</option>
                    <option value="آنکارا">آنکارا</option>
                    <option value="ازمیر">ازمیر</option>
                    <option value="ترابزون">ترابزون</option>
                    <option value="ارزروم">ارزروم</option>
                    <option value="وان">وان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">منطقه / محله *</label>
                  <input
                    type="text"
                    placeholder="مثلاً: آکسارای، تکسیم، لارا"
                    value={newHotelDistrict}
                    onChange={(e) => setNewHotelDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">نوع اقامتگاه</label>
                  <select
                    value={newHotelType}
                    onChange={(e) => setNewHotelType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="hotel">هتل استاندارد</option>
                    <option value="apart">آپارت‌هتل</option>
                    <option value="hostel">هاستل و خوابگاه</option>
                    <option value="pension">پانسیون مسافری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">تعداد ستاره (۱ تا ۵)</label>
                  <select
                    value={newHotelStars}
                    onChange={(e) => setNewHotelStars(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value={1}>۱ ستاره</option>
                    <option value={2}>۲ ستاره</option>
                    <option value={3}>۳ ستاره</option>
                    <option value={4}>۴ ستاره</option>
                    <option value={5}>۵ ستاره لوکس</option>
                  </select>
                </div>
              </div>

              {/* Price, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">قیمت هر شب (لیر ₺) *</label>
                  <input
                    type="number"
                    required
                    value={newHotelPrice}
                    onChange={(e) => setNewHotelPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">فاصله تا مترو / حمل‌ونقل عمومی</label>
                  <input
                    type="text"
                    placeholder="مثال: ۲ دقیقه تا ایستگاه مترو و تراموا"
                    value={newHotelNearTransit}
                    onChange={(e) => setNewHotelNearTransit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">آدرس کامل هتل در ترکیه *</label>
                <input
                  type="text"
                  required
                  placeholder="آدرس خیابان، کوچه و پلاک..."
                  value={newHotelAddress}
                  onChange={(e) => setNewHotelAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Phone, WhatsApp, Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شماره تلفن مستقیم</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelPhone}
                    onChange={(e) => setNewHotelPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">شماره واتساپ رزرواسیون</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newHotelWhatsapp}
                    onChange={(e) => setNewHotelWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">عکس هتل (URL تصویر)</label>
                  <input
                    type="url"
                    dir="ltr"
                    value={newHotelImageUrl}
                    onChange={(e) => setNewHotelImageUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Amenities, Description */}
              <div>
                <label className="block text-slate-300 mb-1">امکانات هتل (با کاما جدا کنید)</label>
                <input
                  type="text"
                  placeholder="وای‌فای رایگان، صبحانه، پرسنل فارسی‌زبان، لاندری..."
                  value={newHotelAmenities}
                  onChange={(e) => setNewHotelAmenities(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">توضیحات و نکات اقامتی برای مسافران و کارجویان</label>
                <textarea
                  rows={2}
                  value={newHotelDesc}
                  onChange={(e) => setNewHotelDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  ثبت قطعی هتل و نمایش در نقشه کارباما
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHotelModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT HOTEL WITH MAP PICKER */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">ویرایش هتل: {editingHotel.name} (مدیر)</h3>
              <button
                onClick={() => setEditingHotel(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditHotel} className="p-6 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
              {/* Interactive map for editing coordinates */}
              <div className="space-y-2">
                <label className="block text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" />
                  موقعیت مکانی روی نقشه:
                </label>
                <MapLocationPicker
                  initialCoordinates={editingHotel.coordinates || { lat: 41.0082, lng: 28.9484 }}
                  onChange={(coords, mapsUrl) => {
                    setEditingHotel({
                      ...editingHotel,
                      coordinates: coords,
                      mapsUrl,
                    });
                  }}
                  height="220px"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نام هتل (فارسی)</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">نام هتل (ترکی)</label>
                  <input
                    type="text"
                    value={editingHotel.nameTr}
                    onChange={(e) => setEditingHotel({ ...editingHotel, nameTr: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">شهر</label>
                  <input
                    type="text"
                    value={editingHotel.city}
                    onChange={(e) => setEditingHotel({ ...editingHotel, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">محله / منطقه</label>
                  <input
                    type="text"
                    value={editingHotel.district}
                    onChange={(e) => setEditingHotel({ ...editingHotel, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">قیمت هر شب (لیر)</label>
                  <input
                    type="number"
                    value={editingHotel.pricePerNight}
                    onChange={(e) => setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">آدرس کامل</label>
                <input
                  type="text"
                  value={editingHotel.address}
                  onChange={(e) => setEditingHotel({ ...editingHotel, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">تلفن</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingHotel.phone}
                    onChange={(e) => setEditingHotel({ ...editingHotel, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">واتساپ</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingHotel.whatsapp || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, whatsapp: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">توضیحات هتل</label>
                <textarea
                  rows={2}
                  value={editingHotel.description}
                  onChange={(e) => setEditingHotel({ ...editingHotel, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                >
                  ذخیره تغییرات هتل
                </button>
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ESSENTIAL ADDRESS */}
      {showAddAddrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-4">افزودن مرکز یا آدرس ضروری جدید</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">عنوان مرکز (فارسی) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سرکنسولگری ایران در ازمیر"
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">شهر</label>
                  <input
                    type="text"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">دسته‌بندی</label>
                  <select
                    value={newAddrCategory}
                    onChange={(e) => setNewAddrCategory(e.target.value as AddressCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="embassy">کنسولگری و سفارت</option>
                    <option value="immigration">اداره مهاجرت</option>
                    <option value="hospital">بیمارستان</option>
                    <option value="exchange">صرافی</option>
                    <option value="emergency">خط اضطراری</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">آدرس کامل *</label>
                <textarea
                  rows={2}
                  required
                  dir="ltr"
                  placeholder="Street address in Turkey..."
                  value={newAddrAddress}
                  onChange={(e) => setNewAddrAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">شماره تلفن</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                >
                  ثبت مرکز
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddrModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SEEKER FULL DOSSIER, DOCUMENTS & SIGNED CONTRACT */}
      {selectedSeekerDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-700/40 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    پرونده رسمی کارجو: {selectedSeekerDossier.fullName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    مدارک بارگذاری شده، مشخصات کامل و تعهدنامه امضا شده تسویه حساب کارگزار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeekerDossier(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
              {/* 1. Identity & Contact Details */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedSeekerDossier.gender === 'female' ? '👩' : '👨'}</span>
                    <strong className="text-white text-sm">{selectedSeekerDossier.fullName}</strong>
                    <span className="font-mono text-slate-400 text-xs" dir="ltr">@{selectedSeekerDossier.username}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl font-bold">
                    کشور مقصد: {selectedSeekerDossier.targetCountry || 'ترکیه'} ({selectedSeekerDossier.targetCity})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">نام پدر:</span>
                    <strong className="text-white">{selectedSeekerDossier.fatherName}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">کد ملی:</span>
                    <strong className="text-amber-300 font-mono" dir="ltr">{selectedSeekerDossier.nationalId}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">جنسیت:</span>
                    <strong className="text-white">{selectedSeekerDossier.gender === 'female' ? 'زن (خانم)' : 'مرد (آقا)'}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">شماره تماس:</span>
                    <strong className="text-emerald-300 font-mono" dir="ltr">{selectedSeekerDossier.phone}</strong>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block mb-0.5">آدرس محل سکونت در ایران:</span>
                  <p className="text-slate-200">
                    {selectedSeekerDossier.iranProvince ? `استان ${selectedSeekerDossier.iranProvince}، شهرستان ${selectedSeekerDossier.iranCity}، ${selectedSeekerDossier.iranAddress}` : 'ثبت نشده'}
                  </p>
                </div>
              </div>

              {/* 2. Jobs, Profession, Language Skills */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>تخصص‌های شغلی و توانمندی‌های زبانی</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block">شغل‌ها و تخصص‌های انتخابی:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSeekerDossier.selectedJobs && selectedSeekerDossier.selectedJobs.length > 0 ? (
                        selectedSeekerDossier.selectedJobs.map((j, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-red-600/20 text-red-300 rounded-lg text-[10px] font-bold">
                            {j}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-300">{selectedSeekerDossier.skills.join('، ')}</span>
                      )}
                    </div>
                    {selectedSeekerDossier.customProfession && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <span className="text-slate-400 block text-[10px]">حرفه اختصاصی نوشته شده:</span>
                        <strong className="text-amber-300">{selectedSeekerDossier.customProfession}</strong>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block">زبان‌ها و میزان تسلط:</span>
                    <div className="text-slate-300 mt-1">
                      سطح زبان کشور مقصد: <strong className="text-white">{selectedSeekerDossier.targetLanguageLevel || selectedSeekerDossier.turkishLevel}</strong>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <span className="text-slate-400 block text-[10px]">زبان‌هایی که بلد است:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSeekerDossier.knownLanguages && selectedSeekerDossier.knownLanguages.length > 0 ? (
                          selectedSeekerDossier.knownLanguages.map((l, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-600/20 text-emerald-300 rounded-lg text-[10px]">
                              {l}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">فارسی</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Uploaded Documents (Photos) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>مدارک پرسنلی و هویتی بارگذاری شده</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Passport Photo */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
                    <span className="font-bold text-white text-xs block">عکس پاسپورت</span>
                    <span className="text-[10px] text-slate-400 block">صفحه اصلی کامل و خوانا</span>
                    {selectedSeekerDossier.passportPhotoUrl ? (
                      <div className="rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-700">
                        <img
                          src={selectedSeekerDossier.passportPhotoUrl}
                          alt="پاسپورت"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-4/3 flex items-center justify-center bg-slate-800/40 rounded-xl text-slate-500 text-[10px]">
                        فاقد تصویر
                      </div>
                    )}
                  </div>

                  {/* Full Body Photo */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
                    <span className="font-bold text-white text-xs block">عکس تمام قد ایستاده</span>
                    <span className="text-[10px] text-amber-300 block">بدون آرایش / حداکثر ته‌ریش</span>
                    {selectedSeekerDossier.fullBodyPhotoUrl ? (
                      <div className="rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-700">
                        <img
                          src={selectedSeekerDossier.fullBodyPhotoUrl}
                          alt="عکس تمام قد"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-4/3 flex items-center justify-center bg-slate-800/40 rounded-xl text-slate-500 text-[10px]">
                        فاقد تصویر
                      </div>
                    )}
                  </div>

                  {/* National ID Photo */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
                    <span className="font-bold text-white text-xs block">کارت شناسایی / ملی</span>
                    <span className="text-[10px] text-slate-400 block">اسکن رو و پشت کارت</span>
                    {selectedSeekerDossier.nationalCardPhotoUrl ? (
                      <div className="rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-700">
                        <img
                          src={selectedSeekerDossier.nationalCardPhotoUrl}
                          alt="کارت ملی"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-4/3 flex items-center justify-center bg-slate-800/40 rounded-xl text-slate-500 text-[10px]">
                        فاقد تصویر
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Official Signed Settlement Contract */}
              <div className="bg-slate-950 border-2 border-red-500/50 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-black text-white text-sm">
                    تعهدنامه تسویه حساب هزینه کارگزار (نسخه رسمی امضا شده)
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    دارای اعتبار قانونی و امضای رسمی
                  </span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl text-slate-300 leading-relaxed text-justify text-xs space-y-2">
                  <p>
                    اینجانب <strong className="text-white font-bold">{selectedSeekerDossier.fullName}</strong> فرزند <strong className="text-white font-bold">{selectedSeekerDossier.fatherName}</strong> به شماره ملی <strong className="text-amber-300 font-mono font-bold" dir="ltr">{selectedSeekerDossier.nationalId}</strong> اقرار و تایید می‌نمایم که مبلغ <strong className="text-emerald-300 font-bold">{selectedSeekerDossier.contractAmount || brokerSettings.brokerServiceFee}</strong> را بابت هزینه خدمات کارگزار، مشاوره، پشتیبانی و معرفی به کارفرما پرداخت نموده‌ام. اینجانب آگاه هستم که وظیفه کارگزار صرفاً معرفی به فرصت شغلی بوده و کارگزار تعهدی در قبال استخدام قطعی یا حقوق نخواهد داشت. مبلغ فوق غیرقابل استرداد می‌باشد.
                  </p>
                </div>

                {/* Bank Card Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">شماره کارت واریز کننده (مشتری):</span>
                    <strong className="text-amber-300 font-mono text-xs" dir="ltr">
                      {selectedSeekerDossier.payerCardNumber || 'ثبت نشده'}
                    </strong>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">شماره کارت مقصد کارگزار:</span>
                    <strong className="text-white font-mono text-xs" dir="ltr">
                      {selectedSeekerDossier.brokerCardNumber || brokerSettings.brokerCardNumber}
                    </strong>
                  </div>
                </div>

                {/* Signature & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 items-center">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block mb-1">امضای الکترونیکی ثبت شده کارجو:</span>
                    {selectedSeekerDossier.signatureDataUrl ? (
                      <div className="bg-white/10 p-2 rounded-lg border border-red-500/30 flex items-center justify-center">
                        <img
                          src={selectedSeekerDossier.signatureDataUrl}
                          alt="امضای متقاضی"
                          className="h-16 max-w-full object-contain filter invert"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic">امضایی ثبت نگردیده است</span>
                    )}
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 text-right sm:text-left" dir="ltr">
                    <div className="text-xs font-bold text-amber-300">تاریخ عقد قرارداد:</div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      شمسی: <strong className="text-white">{selectedSeekerDossier.contractDateShamsi || '۱۴۰۵/۰۸/۰۴'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      میلادی: <strong className="text-white">{selectedSeekerDossier.contractDateMiladi || '2026/10/26'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSeekerDossier(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                بستن پرونده
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Full Receipt Image Viewer */}
      {viewReceiptModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">مشاهده دقیق فیش واریزی ۵۰۰ لیر</h3>
              </div>
              <button
                onClick={() => setViewReceiptModalUrl(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-black/60">
              <img
                src={viewReceiptModalUrl}
                alt="فیش بانکی واریزی"
                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
              />
            </div>
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">برای بزرگنمایی مرورگر می‌توانید کلیک راست کنید یا ذخیره نمایید.</span>
              <button
                onClick={() => setViewReceiptModalUrl(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Job with Reason */}
      {rejectModalJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-extrabold text-white text-sm">رد فیش و عدم تایید آگهی</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              علت عدم تایید فیش را بنویسید (مانند: شماره ارجاع نامعتبر، عدم تطابق واریزی ۵۰۰ لیر، فیش ناخوانا یا جعلی):
            </p>
            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="توضیحات رد آگهی جهت اطلاع کارفرما..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalJobId(null);
                  setRejectReasonInput('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectJobPayment(rejectModalJobId, rejectReasonInput);
                  setRejectModalJobId(null);
                  setRejectReasonInput('');
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
              >
                تایید رد آگهی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
