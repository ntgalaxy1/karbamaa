import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JobCategory, ContractType, JobAlertSubscription } from '../types';
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCircle,
  AlertCircle,
  MapPin,
  Filter,
  Clock,
  DollarSign,
  Hash,
  Home,
  FileCheck,
  Globe,
  Trash2,
  Sparkles,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

interface JobAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: {
    city?: string;
    category?: string;
    contractType?: string;
    minSalary?: number;
    keywords?: string[];
    accommodationOnly?: boolean;
    workPermitOnly?: boolean;
  };
}

import { CITIES_WITH_ALL } from '../data/turkeyCities';

const CITIES = CITIES_WITH_ALL;

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'همه دسته‌ها' },
  { key: 'restaurant', label: 'رستوران و کافه' },
  { key: 'textile', label: 'خیاطی و پوشاک' },
  { key: 'hotel', label: 'هتل و گردشگری' },
  { key: 'warehouse', label: 'انبار و بسته‌بندی' },
  { key: 'technical', label: 'فنی و ساختمانی' },
  { key: 'translator', label: 'مترجمی و درمانی' },
  { key: 'sales', label: 'فروش و بازاریابی' },
];

export const JobAlertModal: React.FC<JobAlertModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
}) => {
  const {
    jobAlerts,
    saveJobAlert,
    deleteJobAlert,
    toggleJobAlert,
    pushPermissionStatus,
    requestPushPermission,
    triggerTestJobAlert,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Form state
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('همه شهرها');
  const [category, setCategory] = useState('all');
  const [contractType, setContractType] = useState<'all' | ContractType>('all');
  const [minSalary, setMinSalary] = useState<number>(30000);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [accommodationOnly, setAccommodationOnly] = useState(false);
  const [workPermitOnly, setWorkPermitOnly] = useState(false);
  const [enableBrowserPush, setEnableBrowserPush] = useState(true);
  const [enableInAppToast, setEnableInAppToast] = useState(true);

  // Sync initial filters when opened
  useEffect(() => {
    if (isOpen) {
      if (initialFilters) {
        if (initialFilters.city) setCity(initialFilters.city);
        if (initialFilters.category) setCategory(initialFilters.category);
        if (initialFilters.contractType) setContractType(initialFilters.contractType as any);
        if (initialFilters.minSalary) setMinSalary(initialFilters.minSalary);
        if (initialFilters.keywords && initialFilters.keywords.length > 0) {
          setKeywords(initialFilters.keywords);
        }
        if (initialFilters.accommodationOnly !== undefined) {
          setAccommodationOnly(initialFilters.accommodationOnly);
        }
        if (initialFilters.workPermitOnly !== undefined) {
          setWorkPermitOnly(initialFilters.workPermitOnly);
        }

        // Auto generate sensible default title
        const parts = [];
        if (initialFilters.city && initialFilters.city !== 'همه شهرها') parts.push(initialFilters.city);
        if (initialFilters.category && initialFilters.category !== 'all') {
          const catObj = CATEGORIES.find((c) => c.key === initialFilters.category);
          if (catObj) parts.push(catObj.label);
        }
        if (initialFilters.contractType && initialFilters.contractType !== 'all') {
          parts.push(initialFilters.contractType === 'part_time' ? 'پاره وقت' : 'تمام وقت');
        }
        setTitle(parts.length > 0 ? `مشاغل جدید ${parts.join(' - ')}` : 'هشدار شغلی سفارشی');
      } else if (!title) {
        setTitle('کارهای جدید ترکیه با جای خواب');
      }
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keywordInput.replace(/^#/, '').trim();
    if (clean && !keywords.includes(clean)) {
      setKeywords([...keywords, clean]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const alertTitle = title.trim() || `هشدار مشاغل ${city !== 'همه شهرها' ? city : 'ترکیه'}`;

    saveJobAlert({
      title: alertTitle,
      city,
      category,
      contractType,
      minSalary: Number(minSalary) || 0,
      keywords,
      accommodationOnly,
      workPermitOnly,
      enableBrowserPush,
      enableInAppToast,
      isActive: true,
    });

    setActiveTab('manage');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                تنظیم سیستم هشدار استخدام (Job Alert)
              </h3>
              <p className="text-xs text-slate-400">
                دریافت اعلان فوری در مرورگر یا داخل برنامه هنگام انتشار شغل جدید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: New Alert vs My Subscriptions */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/60 p-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            تعریف هشدار جدید
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'manage'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            هشدارهای فعال من
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
              {jobAlerts.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alert Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  عنوان هشدار شغلی *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کارهای آشپزی و رستوران استانبول با جای خواب"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              {/* City & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    شهر مورد نظر در ترکیه
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-amber-500" />
                    دسته‌بندی شغلی
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contract Type & Minimum Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    نوع قرارداد کاری
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="all">همه قراردادها (تمام وقت، پاره وقت، فصلی)</option>
                    <option value="full_time">فقط تمام وقت (Full-Time)</option>
                    <option value="part_time">فقط پاره وقت (Part-Time)</option>
                    <option value="seasonal">فقط فصلی / پروژه‌ای (Seasonal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    حداقل حقوق ماهانه مورد انتظار (لیر ₺)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              {/* Keywords Tagging */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  کلمات کلیدی و تخصص‌های مد نظر شما
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="تایپ کلیدواژه (مثال: آشپز، خیاط، باریستا، لارا)..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword(e);
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition"
                  >
                    + افزودن
                  </button>
                </div>

                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-950/80 text-sky-300 border border-sky-500/30 rounded-lg text-xs"
                      >
                        #{kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Perks Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={accommodationOnly}
                    onChange={(e) => setAccommodationOnly(e.target.checked)}
                    className="rounded accent-red-600"
                  />
                  <Home className="w-4 h-4 text-blue-400" />
                  <span>فقط آگهی‌های دارای جای خواب رایگان</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={workPermitOnly}
                    onChange={(e) => setWorkPermitOnly(e.target.checked)}
                    className="rounded accent-red-600"
                  />
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>فقط با دریافت چالیشما (اقامت کاری)</span>
                </label>
              </div>

              {/* Notification Channels */}
              <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <span className="block font-bold text-white text-xs mb-1">
                  کانال‌های اطلاع‌رسانی هشدار:
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={enableInAppToast}
                      onChange={(e) => setEnableInAppToast(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>اعلان پاپ‌آپ داخل برنامه (In-App Toast)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={enableBrowserPush}
                      onChange={(e) => setEnableBrowserPush(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>نوتیفیکیشن مرورگر (Web Push)</span>
                  </label>
                </div>

                {/* Push Notification Permission Box */}
                {enableBrowserPush && (
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      وضعیت دسترسی اعلان مرورگر:{' '}
                      <strong
                        className={
                          pushPermissionStatus === 'granted'
                            ? 'text-emerald-400'
                            : pushPermissionStatus === 'denied'
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }
                      >
                        {pushPermissionStatus === 'granted'
                          ? 'فعال است ✓'
                          : pushPermissionStatus === 'denied'
                          ? 'مسدود در تنظیمات'
                          : 'نیازمند تایید'}
                      </strong>
                    </span>

                    {pushPermissionStatus !== 'granted' && (
                      <button
                        type="button"
                        onClick={requestPushPermission}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition"
                      >
                        درخواست دسترسی مرورگر
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                >
                  <BellRing className="w-4 h-4" />
                  ثبت و فعال‌سازی هشدار هوشمند
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : (
            /* Subscriptions List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">
                  لیست هشدارهای شغلی فعال شما:
                </span>
                <button
                  type="button"
                  onClick={() => triggerTestJobAlert()}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  ارسال تست زنده اعلان (Test)
                </button>
              </div>

              {jobAlerts.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <Bell className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-slate-300 font-bold">شما هنوز هیچ هشدار شغلی تنظیم نکرده‌اید.</p>
                  <p className="text-slate-500 text-[11px]">
                    با تنظیم هشدار، به محض ثبت کار جدید توسط مدیر، بلافاصله مطلع می‌شوید.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition"
                  >
                    + ایجاد اولین هشدار شغل
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border transition ${
                        alert.isActive
                          ? 'bg-slate-800/80 border-slate-700'
                          : 'bg-slate-900 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{alert.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                alert.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {alert.isActive ? 'فعال ✓' : 'غیرفعال'}
                            </span>
                          </div>

                          {/* Criteria summary */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                            <span className="bg-slate-900 px-2 py-0.5 rounded-md text-slate-400">
                              شهر: <strong>{alert.city}</strong>
                            </span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded-md text-slate-400">
                              قرارداد:{' '}
                              <strong>
                                {alert.contractType === 'all'
                                  ? 'همه'
                                  : alert.contractType === 'part_time'
                                  ? 'پاره وقت'
                                  : 'تمام وقت'}
                              </strong>
                            </span>
                            {alert.minSalary > 0 && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded-md text-emerald-400 font-mono">
                                حداقل {alert.minSalary.toLocaleString('fa-IR')} ₺
                              </span>
                            )}
                            {alert.accommodationOnly && (
                              <span className="bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded-md">
                                با جای خواب
                              </span>
                            )}
                          </div>

                          {/* Keywords */}
                          {alert.keywords && alert.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {alert.keywords.map((k) => (
                                <span
                                  key={k}
                                  className="text-[10px] bg-sky-950/60 text-sky-300 px-1.5 py-0.5 rounded"
                                >
                                  #{k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleJobAlert(alert.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              alert.isActive
                                ? 'bg-amber-600/20 text-amber-300 border-amber-500/30 hover:bg-amber-600/30'
                                : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30'
                            }`}
                          >
                            {alert.isActive ? 'خاموش' : 'روشن'}
                          </button>

                          <button
                            type="button"
                            onClick={() => triggerTestJobAlert(alert)}
                            className="p-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                            title="تست اعلان این هشدار"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteJobAlert(alert.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition"
                            title="حذف این هشدار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
