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
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [referenceId, setReferenceId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  // Calculate equivalent Toman amount dynamically from Admin's vertical fee list
  const feeTL =
    paymentSettings.jobPostingFeeTL && paymentSettings.jobPostingFeeTL > 0
      ? paymentSettings.jobPostingFeeTL
      : paymentSettings.feeTL || 500;
  const exchangeRate = paymentSettings.exchangeRateToman || 5460;
  const feeToman =
    paymentSettings.jobPostingFeeToman && paymentSettings.jobPostingFeeToman > 0
      ? paymentSettings.jobPostingFeeToman
      : feeTL * exchangeRate;

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

      {/* STEP 2: ONLINE PAYMENT GATEWAY ONLY (Manual payments disabled) */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base">گام دوم: پرداخت آنلاین تعرفه انتشار آگهی</h3>
              <p className="text-xs text-slate-400 mt-1">پرداخت امن از طریق درگاه بانکی شاپرک (شتاب)</p>
            </div>
            <div className="text-left bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-amber-300 block">مبلغ قابل پرداخت:</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{feeToman.toLocaleString('fa-IR')} تومان</span>
              <span className="text-[10px] text-slate-400 block font-mono">({(feeToman * 10).toLocaleString('fa-IR')} ریال)</span>
            </div>
          </div>

          <div className="p-6 bg-slate-950 border border-teal-500/40 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                شاپرک
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>پرداخت آنلاین از طریق درگاه بانکی</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                    پروتکل رسمی شاپرک
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  مبلغ تعرفه: <strong className="text-teal-300 font-mono">{feeToman.toLocaleString('fa-IR')} تومان</strong> ({(feeToman * 10).toLocaleString('fa-IR')} ریال)
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>• پس از کلیک روی دکمه «پرداخت آنلاین»، مرورگر شما مستقیماً به صفحه درگاه پرداخت بانکی هدایت می‌شود.</p>
              <p>• پس از تکمیل پرداخت و بازگشت به سایت کارباما، آگهی شما ثبت و منتشر شده و به صورت خودکار به کارجویان اطلاع‌رسانی می‌گردد.</p>
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

            {/* Optional Direct Payment Reference / Receipt Submission */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 pt-3">
              <span className="text-xs font-bold text-amber-300 block">
                ثبت کد رهگیری تراکنش یا تصویر فیش (در صورت پرداخت قبلی):
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="شماره پیگیری تراکنش بانکی یا کد ارجاع شاپرک..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                  <span>{receiptImage ? 'تصویر فیش ضمیمه شد ✓' : 'بارگذاری تصویر فیش'}</span>
                  <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shrink-0"
                >
                  ثبت فیش و ارسال آگهی
                </button>
              </div>
            </div>
          </div>

          {/* Buttons: Back and Online Payment Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به ویرایش مشخصات</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  const subcatString = selectedSubcategories.join('، ');
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
                  // ignore
                }
                const adminAmountUnit = paymentSettings.paymentAmountUnit || 'toman';
                const adminConfiguredAmount =
                  paymentSettings.directPaymentAmount && paymentSettings.directPaymentAmount > 0
                    ? paymentSettings.directPaymentAmount
                    : adminAmountUnit === 'rial'
                      ? feeToman * 10
                      : feeToman;
                if (adminAmountUnit === 'toman') {
                  window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}&unit=toman`;
                } else {
                  window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}`;
                }
              }}
              className="px-7 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>پرداخت آنلاین</span>
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
                  ? 'درگاه آنلاین شاپرک (Sepal)'
                  : paymentMethod === 'zarinpal'
                  ? 'درگاه آنلاین زرین‌پال'
                  : 'درگاه آنلاین بانکی شاپرک'}
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
    </div>
  );
};
