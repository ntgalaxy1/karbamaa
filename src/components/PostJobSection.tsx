import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  CreditCard,
  DollarSign,
  Utensils,
  Home,
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  Phone,
  HelpCircle,
  Image as ImageIcon,
  Landmark,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobCategory, ContractType, PayFrequency, TurkishLevel, PaymentMethod } from '../types';
import { TURKEY_PROVINCES_AND_DISTRICTS } from '../data/turkeyCities';
import { JOB_CATEGORIES_DATA } from '../data/jobCategories';
import { getDistrictsForCity } from '../data/turkeyData';
import { SepalGatewayModal } from './SepalGatewayModal';
import { validatePhoneNumber } from '../utils/validators';

export const PostJobSection: React.FC = () => {
  const { paymentSettings, submitJobWithPayment, setActiveTab, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('استانبول');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState<JobCategory>('restaurant');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [contractType, setContractType] = useState<ContractType>('full_time');
  const [payFrequency, setPayFrequency] = useState<PayFrequency>('monthly');
  const [salaryMin, setSalaryMin] = useState<number>(30000);
  const [salaryMax, setSalaryMax] = useState<number>(35000);
  const [accommodation, setAccommodation] = useState(true);
  const [accommodationDetails, setAccommodationDetails] = useState('خوابگاه پرسنلی تمیز و مجهز رایگان');
  const [meals, setMeals] = useState(true);
  const [mealDetails, setMealDetails] = useState('۳ وعده غذای گرم کامل');
  const [hasLeave, setHasLeave] = useState(true);
  const [leaveDetails, setLeaveDetails] = useState('۱ روز در هفته تعطیل');
  const [workPermitSupport, setWorkPermitSupport] = useState(false);
  const [turkishRequired, setTurkishRequired] = useState<TurkishLevel>('basic');
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sepal');
  const [isSepalModalOpen, setIsSepalModalOpen] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [referenceId, setReferenceId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  // Calculate equivalent Toman amount
  const feeTL = paymentSettings.feeTL || 500;
  const exchangeRate = paymentSettings.exchangeRateToman || 2300;
  const feeToman = feeTL * exchangeRate;

  // Available subcategories for current category
  const currentCatData = JOB_CATEGORIES_DATA.find((c) => c.key === category);
  const availableSubcategories = currentCatData?.subcategories || [];

  const handleSubcategoryToggle = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم فایل تصویر باید کمتر از ۵ مگابایت باشد.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        showToast('تصویر فیش واریزی با موفقیت بارگذاری شد.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      showToast('لطفاً عنوان شغل را وارد کنید.', 'error');
      return false;
    }
    if (!company.trim()) {
      showToast('لطفاً نام کارفرما یا شرکت را وارد کنید.', 'error');
      return false;
    }
    if (!contactPhone.trim() && !contactWhatsapp.trim()) {
      showToast('حداقل یکی از شماره‌های تماس یا واتس‌اپ را وارد کنید.', 'error');
      return false;
    }
    if (contactPhone.trim()) {
      const check = validatePhoneNumber(contactPhone.trim());
      if (!check.isValid) {
        showToast(check.error || 'شماره تماس کارفرما واقعی و معتبر نیست.', 'error');
        return false;
      }
    }
    if (contactWhatsapp.trim()) {
      const check = validatePhoneNumber(contactWhatsapp.trim());
      if (!check.isValid) {
        showToast(check.error || 'شماره واتس‌اپ کارفرما واقعی و معتبر نیست.', 'error');
        return false;
      }
    }
    if (!description.trim()) {
      showToast('لطفاً شرح وظایف یا شرایط کاری را وارد کنید.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (payerPhone.trim()) {
      const check = validatePhoneNumber(payerPhone.trim());
      if (!check.isValid) {
        showToast(check.error || 'شماره موبایل پرداخت‌کننده واقعی و معتبر نیست.', 'error');
        return;
      }
    }
    const subcatString = selectedSubcategories.join('، ');

    if (paymentMethod === 'sepal' || paymentMethod === 'zarinpal') {
      try {
        localStorage.setItem(
          'karbama_pending_sepal_job',
          JSON.stringify({
            title: title.trim(),
            company: company.trim(),
            city,
            district: district.trim() || 'مرکز شهر',
            category,
            subcategory: subcatString || undefined,
            contractType,
            payFrequency,
            keywords: [
              title,
              company,
              city,
              district,
              currentCatData?.label || '',
              ...selectedSubcategories,
              accommodation ? 'جای خواب' : '',
              meals ? 'غذا' : '',
            ].filter(Boolean),
            salaryMin: Number(salaryMin) || 0,
            salaryMax: Number(salaryMax) || 0,
            currency: 'TRY' as const,
            accommodation,
            accommodationDetails: accommodation ? accommodationDetails : undefined,
            meals,
            mealDetails: meals ? mealDetails : undefined,
            hasLeave,
            leaveDetails: hasLeave ? leaveDetails : undefined,
            workPermitSupport,
            turkishRequired,
            gender,
            description: description.trim(),
            requirements: requirements
              .split('\n')
              .map((r) => r.trim())
              .filter(Boolean),
            contactPhone: contactPhone.trim(),
            contactWhatsapp: contactWhatsapp.trim(),
            imageUrl: imageUrl.trim() || undefined,
            paymentAmountTL: feeTL,
            paymentAmountToman: feeToman,
            paymentPayerName: payerName.trim() || undefined,
            paymentPayerPhone: payerPhone.trim() || undefined,
          })
        );
      } catch {
        // ignore storage error
      }
      setIsSepalModalOpen(true);
      return;
    }

    if (!receiptImage && !referenceId) {
      showToast('لطفاً تصویر فیش واریزی یا شماره پیگیری را وارد نمایید.', 'error');
      return;
    }

    const jobData = {
      title: title.trim(),
      company: company.trim(),
      city,
      district: district.trim() || 'مرکز شهر',
      category,
      subcategory: subcatString || undefined,
      contractType,
      payFrequency,
      keywords: [
        title,
        company,
        city,
        district,
        currentCatData?.label || '',
        ...selectedSubcategories,
        accommodation ? 'جای خواب' : '',
        meals ? 'غذا' : '',
      ].filter(Boolean),
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      currency: 'TRY' as const,
      accommodation,
      accommodationDetails: accommodation ? accommodationDetails : undefined,
      meals,
      mealDetails: meals ? mealDetails : undefined,
      hasLeave,
      leaveDetails: hasLeave ? leaveDetails : undefined,
      workPermitSupport,
      turkishRequired,
      gender,
      description: description.trim(),
      requirements: requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      contactPhone: contactPhone.trim(),
      contactWhatsapp: contactWhatsapp.trim(),
      imageUrl: imageUrl.trim() || undefined,
      paymentMethod,
      paymentStatus: 'pending_approval' as const,
      paymentAmountTL: feeTL,
      paymentAmountToman: feeToman,
      paymentReceiptUrl: receiptImage || undefined,
      paymentReferenceId: referenceId.trim() || undefined,
      paymentPayerName: payerName.trim() || undefined,
      paymentPayerPhone: payerPhone.trim() || undefined,
    };

    const res = submitJobWithPayment(jobData);
    if (res.success) {
      setCreatedJobId(res.jobId);
      setStep(3);
    }
  };

  const handleSepalSuccess = (refId: string) => {
    setIsSepalModalOpen(false);
    const subcatString = selectedSubcategories.join('، ');

    const jobData = {
      title: title.trim(),
      company: company.trim(),
      city,
      district: district.trim() || 'مرکز شهر',
      category,
      subcategory: subcatString || undefined,
      contractType,
      payFrequency,
      keywords: [
        title,
        company,
        city,
        district,
        currentCatData?.label || '',
        ...selectedSubcategories,
        accommodation ? 'جای خواب' : '',
        meals ? 'غذا' : '',
      ].filter(Boolean),
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      currency: 'TRY' as const,
      accommodation,
      accommodationDetails: accommodation ? accommodationDetails : undefined,
      meals,
      mealDetails: meals ? mealDetails : undefined,
      hasLeave,
      leaveDetails: hasLeave ? leaveDetails : undefined,
      workPermitSupport,
      turkishRequired,
      gender,
      description: description.trim(),
      requirements: requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      contactPhone: contactPhone.trim(),
      contactWhatsapp: contactWhatsapp.trim(),
      imageUrl: imageUrl.trim() || undefined,
      paymentMethod: 'sepal' as const,
      paymentStatus: 'pending_approval' as const,
      paymentAmountTL: feeTL,
      paymentAmountToman: feeToman,
      paymentReceiptUrl: undefined,
      paymentReferenceId: refId,
      paymentPayerName: payerName.trim() || undefined,
      paymentPayerPhone: payerPhone.trim() || undefined,
    };

    const res = submitJobWithPayment(jobData);
    if (res.success) {
      setCreatedJobId(res.jobId);
      setReferenceId(refId);
      setStep(3);
      showToast('پرداخت از طریق درگاه شاپرک سپال با موفقیت ثبت شد و آگهی جهت بررسی و انتشار به مدیریت ارجاع گردید.', 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300 text-right">
      
      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/80 border border-slate-800 p-6 sm:p-8 text-right shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold">
              <Briefcase className="w-4 h-4" />
              <span>ویژه کارفرمایان و صاحبان مشاغل در ترکیه</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              ثبت آگهی استخدام در کارباما
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              تعرفه ثبت هر آگهی: <strong className="text-amber-400 font-bold">{feeTL} لیر ترکیه</strong> (معادل لحظه‌ای: {feeToman.toLocaleString('fa-IR')} تومان)
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${step === 1 ? 'bg-red-600 text-white' : 'text-slate-400'}`}>
              <span>۱</span>
              <span className="hidden sm:inline">مشخصات آگهی</span>
            </div>
            <div className="w-4 h-0.5 bg-slate-800" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${step === 2 ? 'bg-red-600 text-white' : 'text-slate-400'}`}>
              <span>۲</span>
              <span className="hidden sm:inline">پرداخت وجه</span>
            </div>
            <div className="w-4 h-0.5 bg-slate-800" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${step === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
              <span>۳</span>
              <span className="hidden sm:inline">تایید نهایی</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
        <HelpCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <p className="leading-relaxed">
          کلیه آگهی‌های ثبت شده پس از پرداخت هزینه تعرفه و تایید توسط تیم مدیریت کارباما، به مدت ۳۰ روز در صدر آگهی‌ها قرار گرفته و به تمامی کارجویان واجد شرایط نوتیفیکیشن ارسال می‌شود.
        </p>
      </div>

      {/* STEP 1: JOB DETAILS FORM */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-base">گام اول: مشخصات و شرایط شغل</h3>
            <p className="text-xs text-slate-400 mt-1">اطلاعات دقیق کار را برای کارجویان وارد نمایید.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان شغل *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: سرآشپز رستوران ایرانی، چرخکار ماهر تریکو"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نام کارفرما / کارگاه / رستوران *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="مثال: رستوران شب‌های استانبول، تولیدی برادران ترک"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">شهر محل کار (ترکیه) *</label>
              <select
                value={city}
                onChange={(e) => {
                  const newC = e.target.value;
                  setCity(newC);
                  const dists = getDistrictsForCity(newC);
                  if (dists.length > 0) setDistrict(dists[0]);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                {TURKEY_PROVINCES_AND_DISTRICTS.map((c) => (
                  <option key={c.province} value={c.province}>
                    {c.province} ({c.provinceTr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">منطقه / محله</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:border-red-500 focus:outline-none"
              >
                {getDistrictsForCity(city).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">دسته‌بندی اصلی شغل *</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as JobCategory);
                  setSelectedSubcategories([]);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                {JOB_CATEGORIES_DATA.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع پرداخت حقوق *</label>
              <select
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="monthly">ماهیانه (مرسوم‌ترین)</option>
                <option value="weekly">هفتگی (پایان هر هفته)</option>
                <option value="daily">روز مزد (تسویه روزانه)</option>
              </select>
            </div>
          </div>

          {/* Subcategories Multi-Select Checkboxes */}
          {availableSubcategories.length > 0 && (
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Layers className="w-4 h-4" />
                <span>زیرشاخه‌ها و تخصص‌های مرتبط را تیک بزنید:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {availableSubcategories.map((sub) => {
                  const isChecked = selectedSubcategories.includes(sub);
                  return (
                    <label
                      key={sub}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-red-600/20 border-red-500/60 text-white font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubcategoryToggle(sub)}
                        className="rounded border-slate-700 text-red-600 focus:ring-0"
                      />
                      <span>{sub}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Salary & Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">حداقل حقوق (لیر ترکیه) *</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">حداکثر حقوق (لیر ترکیه) *</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Accommodation, Meals, Leave Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
            {/* Accommodation */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accommodation}
                  onChange={(e) => setAccommodation(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0"
                />
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-emerald-400" />
                  اسکان / جای خواب
                </span>
              </label>
              {accommodation && (
                <input
                  type="text"
                  value={accommodationDetails}
                  onChange={(e) => setAccommodationDetails(e.target.value)}
                  placeholder="جزئیات جای خواب"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              )}
            </div>

            {/* Meals */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meals}
                  onChange={(e) => setMeals(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0"
                />
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  وعده غذایی
                </span>
              </label>
              {meals && (
                <input
                  type="text"
                  value={mealDetails}
                  onChange={(e) => setMealDetails(e.target.value)}
                  placeholder="جزئیات وعده غذایی"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              )}
            </div>

            {/* Leave */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLeave}
                  onChange={(e) => setHasLeave(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0"
                />
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  مرخصی هفتگی / ماهانه
                </span>
              </label>
              {hasLeave && (
                <input
                  type="text"
                  value={leaveDetails}
                  onChange={(e) => setLeaveDetails(e.target.value)}
                  placeholder="مثال: ۱ روز در هفته"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              )}
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره تماس مستقیم *</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+90 534 123 4567"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none dir-ltr text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره واتس‌اپ</label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+90 534 123 4567"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none dir-ltr text-right"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">شرح وظایف و شرایط کاری *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات دقیق کار، ساعات کاری، مهارت‌های مورد نیاز، محیط کارگاه یا رستوران..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Requirements (One per line) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">شرایط الزامی کارجو (هر سطر یک مورد)</label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="سابقه کار مرتبط حداقل ۲ سال&#10;سن بین ۲۰ تا ۳۵ سال&#10;نظم و وقت‌شناسی"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (validateStep1()) {
                  setStep(2);
                }
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
            >
              <span>مرحله بعد: پرداخت تعرفه آگهی</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT (3 METHODS) */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base">گام دوم: انتخاب روش پرداخت تعرفه آگهی</h3>
              <p className="text-xs text-slate-400 mt-1">یکی از روش‌های زیر را جهت پرداخت انتخاب فرمایید:</p>
            </div>
            <div className="text-left bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-amber-300 block">مبلغ قابل پرداخت (به‌روزرسانی روزانه):</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{feeToman.toLocaleString('fa-IR')} تومان</span>
              <span className="text-[10px] text-slate-400 block font-mono">({(feeToman * 10).toLocaleString('fa-IR')} ریال)</span>
            </div>
          </div>

          {/* 3 Payment Methods Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Method 1: Sepal Official Shaparak Gateway */}
            <button
              onClick={() => setPaymentMethod('sepal')}
              className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between space-y-3 ${
                paymentMethod === 'sepal'
                  ? 'bg-teal-600/20 border-teal-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-extrabold">۱. درگاه رسمی شاپرک سپال</span>
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اتصال مستقیم به درگاه رسمی سپال (payment.sepal.ir) و پرداخت با کلیه کارت‌های شتاب
              </p>
              <span className="text-[10px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20 self-start">
                اتصال مستقیم به سپال
              </span>
            </button>

            {/* Method 2: Turkey Bank Account (Ziraat Bank) */}
            <button
              onClick={() => setPaymentMethod('turkey_bank')}
              className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between space-y-3 ${
                paymentMethod === 'turkey_bank'
                  ? 'bg-red-600/20 border-red-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-extrabold">۲. حساب بانکی ترکیه (İBAN)</span>
                <Landmark className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                واریز مستقیم معادل ارزی تعرفه به حساب زراعت بانک یا ایش‌بانک کارباما با حواله یا FAST
              </p>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 self-start">
                حساب بانکی ترکیه
              </span>
            </button>

            {/* Method 3: Card to Card from Iran */}
            <button
              onClick={() => setPaymentMethod('iran_card')}
              className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between space-y-3 ${
                paymentMethod === 'iran_card'
                  ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-extrabold">۳. کارت به کارت از ایران</span>
                <Send className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                انتقال معادل تومانی ({feeToman.toLocaleString('fa-IR')} تومان) با همراه بانک و ارسال فیش واریزی
              </p>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 self-start">
                کارت به کارت ایران
              </span>
            </button>

          </div>

          {/* METHOD 1 CONTENT: SEPAL */}
          {paymentMethod === 'sepal' && (
            <div className="p-6 bg-slate-950 border border-teal-500/40 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                  سپال
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>اتصال مستقیم به درگاه پرداخت شاپرک سپال (payment.sepal.ir)</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                      پروتکل رسمی شاپرک
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    مبلغ ریالی تعرفه با نرخ روز لحظه‌ای: <strong className="text-teal-300 font-mono">{feeToman.toLocaleString('fa-IR')} تومان</strong> ({ (feeToman * 10).toLocaleString('fa-IR') } ریال)
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <p>• پس از کلیک روی دکمه زیر، مرورگر شما مستقیماً به صفحه رسمی درگاه پرداخت سپال (<code>payment.sepal.ir</code>) هدایت می‌شود.</p>
                <p>• پس از تکمیل پرداخت در درگاه سپال و بازگشت به <code>karbama34.ir/api/sep/callback.php</code>، تراکنش تایید شده و آگهی شما ثبت می‌گردد.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">نام کارفرما / پرداخت‌کننده</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="مثال: علی اکبری"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">شماره همراه پرداخت‌کننده (09xxxxxxxxx)</label>
                  <input
                    type="text"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white dir-ltr text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2 CONTENT: TURKEY BANK ACCOUNT */}
          {paymentMethod === 'turkey_bank' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">مشخصات حساب بانکی ترکیه جهت واریز تعرفه آگهی</h4>
                    <p className="text-xs text-slate-400">بانک: {paymentSettings.turkeyBankName}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg text-xs font-bold font-mono">
                  500.00 TL
                </span>
              </div>

              {/* Account Details Box */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">نام صاحب حساب:</span>
                  <span className="text-xs font-bold text-white font-mono">{paymentSettings.turkeyAccountHolder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">نام بانک ترکیه:</span>
                  <span className="text-xs font-bold text-white font-mono">{paymentSettings.turkeyBankName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400">شماره ایبان (IBAN):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-300 dir-ltr select-all">
                      {paymentSettings.turkeyIban}
                    </span>
                    <button
                      onClick={() => handleCopy(paymentSettings.turkeyIban, 'iban')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="کپی شماره ایبان"
                    >
                      {copiedKey === 'iban' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Receipt & Tracking No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره پیگیری / دکونت بانک (Dekont No) *</label>
                  <input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="مثال: 948271034"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نام واریزکننده (صاحب حساب ترکیه)</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Receipt File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">آپلود عکس فیش واریزی (Dekont Görseli) *</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-red-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/50">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-300">انتخاب تصویر فیش واریزی از گالری</span>
                    <span className="text-[10px] text-slate-500">فرمت‌های JPG یا PNG تا سقف ۵ مگابایت</span>
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                  {receiptImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={receiptImage} alt="پیش‌نمایش فیش" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-[9px] text-white text-center py-0.5">آماده</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* METHOD 3 CONTENT: IRAN CARD TO CARD */}
          {paymentMethod === 'iran_card' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">مشخصات کارت بانکی ایران جهت واریز تومانی</h4>
                    <p className="text-xs text-slate-400">بانک: {paymentSettings.iranBankName}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold font-mono">
                  {feeToman.toLocaleString('fa-IR')} تومان
                </span>
              </div>

              {/* Card Details Box */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">نام دارنده حساب:</span>
                  <span className="text-xs font-bold text-white font-mono">{paymentSettings.iranCardHolder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">نام بانک مقصد:</span>
                  <span className="text-xs font-bold text-white font-mono">{paymentSettings.iranBankName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400">شماره کارت ۱۶ رقمی:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-extrabold text-emerald-300 dir-ltr select-all tracking-wider">
                      {paymentSettings.iranCardNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(paymentSettings.iranCardNumber, 'card')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="کپی شماره کارت"
                    >
                      {copiedKey === 'card' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reference ID & Payer Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره پیگیری تراکنش / شماره ارجاع *</label>
                  <input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="مثال: 589410294"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نام و ۴ رقم آخر کارت واریزکننده</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="مثال: رضا احمدی - کارت ۴۵۸۲"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Receipt File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">آپلود عکس فیش واریزی کارت به کارت *</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/50">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-300">انتخاب تصویر فیش واریزی از گالری</span>
                    <span className="text-[10px] text-slate-500">تصویر اسکرین‌شات رسید همراه بانک یا عابربانک</span>
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                  {receiptImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={receiptImage} alt="پیش‌نمایش فیش" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-[9px] text-white text-center py-0.5">آماده</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Buttons: Back and Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به ویرایش مشخصات</span>
            </button>

            <button
              onClick={handleSubmit}
              className={`px-7 py-3 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl transition cursor-pointer ${
                paymentMethod === 'sepal'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {paymentMethod === 'sepal'
                  ? `پرداخت آنلاین با سپال (${feeToman.toLocaleString('fa-IR')} تومان) و انتشار آنی`
                  : paymentMethod === 'zarinpal'
                  ? `پرداخت آنلاین با زرین‌پال (${feeToman.toLocaleString('fa-IR')} تومان) و انتشار`
                  : 'ثبت نهایی آگهی و ارسال فیش برای تایید مدیر'}
              </span>
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              آگهی و اطلاعات پرداخت شما با موفقیت ثبت شد!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              پرداخت تعرفه آگهی {paymentMethod === 'sepal' ? `از طریق درگاه شاپرک سپال (کد رهگیری: ${referenceId || 'ثبت شده'})` : ''} در سیستم ثبت شد و در صف بررسی مدیریت کارباما قرار گرفت. پس از بررسی و تایید توسط مدیر، آگهی بلافاصله در سایت فعال و منتشر خواهد شد.
            </p>
          </div>

          {/* Receipt Info Card */}
          <div className="max-w-md mx-auto p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">کد رهگیری آگهی:</span>
              <span className="text-xs font-mono font-bold text-amber-300">{createdJobId}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">روش پرداخت:</span>
              <span className="text-xs font-bold text-teal-300">
                {paymentMethod === 'sepal'
                  ? 'درگاه شاپرک سپال (Sepal)'
                  : paymentMethod === 'zarinpal'
                  ? 'درگاه زرین‌پال'
                  : paymentMethod === 'turkey_bank'
                  ? 'حساب بانکی ترکیه'
                  : 'کارت به کارت ایران'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">شماره ارجاع / پیگیری بانکی:</span>
              <span className="text-xs font-mono font-bold text-white select-all">{referenceId || 'سیستمی'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">عنوان شغل:</span>
              <span className="text-xs font-bold text-white">{title}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">شهر محل کار:</span>
              <span className="text-xs font-bold text-white">{city}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">تعرفه پرداخت شده:</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{feeToman.toLocaleString('fa-IR')} تومان ({ (feeToman * 10).toLocaleString('fa-IR') } ریال)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">وضعیت نمایش آگهی:</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                در صف بررسی و تایید مدیریت ⏳
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('jobs')}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              مشاهده در فرصت‌های شغلی
            </button>
            <button
              onClick={() => {
                setTitle('');
                setCompany('');
                setDescription('');
                setReceiptImage('');
                setReferenceId('');
                setStep(1);
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
            >
              ثبت یک آگهی جدید دیگر
            </button>
          </div>

        </div>
      )}

      {/* Sepal IPG Modal */}
      <SepalGatewayModal
        isOpen={isSepalModalOpen}
        onClose={() => setIsSepalModalOpen(false)}
        amountToman={feeToman}
        description={`تعرفه ثبت آگهی استخدام «${title || 'فرصت شغلی'}» در کارباما`}
        payerName={payerName || company}
        payerMobile={payerPhone || contactPhone}
        onSuccess={handleSepalSuccess}
      />

    </div>
  );
};
