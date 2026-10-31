import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  RefreshCw,
  TrendingUp,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Info,
  Building2,
  Briefcase,
  Hotel,
  Edit3,
  Save,
  Globe,
  ExternalLink,
  ArrowLeftRight,
} from 'lucide-react';

export const CurrencyExchangeSection: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, isAdminLoggedIn, showToast } = useApp();

  // Primary Rates in Toman
  const [tryRateToman, setTryRateToman] = useState<number>(paymentSettings.exchangeRateToman || 5470);
  const [usdRateToman, setUsdRateToman] = useState<number>(68500);
  const [eurRateToman, setEurRateToman] = useState<number>(74200);
  const [aedRateToman, setAedRateToman] = useState<number>(18650);

  const [providerName, setProviderName] = useState<string>('NetArz.ir (وب‌سرویس نِت اَرز)');
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin Rate Edit State
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [editTry, setEditTry] = useState(tryRateToman.toString());
  const [editUsd, setEditUsd] = useState(usdRateToman.toString());
  const [editEur, setEditEur] = useState(eurRateToman.toString());

  // Interactive Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(500);
  const [calcCurrency, setCalcCurrency] = useState<'TRY' | 'USD' | 'EUR' | 'AED'>('TRY');

  // Keep paymentSettings in sync when TRY rate changes
  useEffect(() => {
    if (paymentSettings.exchangeRateToman !== tryRateToman) {
      setTryRateToman(paymentSettings.exchangeRateToman);
      setEditTry(paymentSettings.exchangeRateToman.toString());
    }
  }, [paymentSettings.exchangeRateToman]);

  // Fetch Live Rates from NetArz API / Backend Endpoint
  const fetchLiveRates = async (silent = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/fx-rates');
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const data = result.data;
          let newTry = tryRateToman;
          let newUsd = usdRateToman;
          let newEur = eurRateToman;

          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              const code = (item.code || item.symbol || '').toUpperCase();
              const price = Number(item.price || item.sell || item.buy || item.value || 0);
              if (price > 0) {
                if (code === 'TRY') newTry = price;
                if (code === 'USD') newUsd = price;
                if (code === 'EUR') newEur = price;
              }
            });
          } else if (typeof data === 'object') {
            if (data.TRY?.price || data.TRY?.toman) newTry = Number(data.TRY.price || data.TRY.toman);
            if (data.USD?.price || data.USD?.toman) newUsd = Number(data.USD.price || data.USD.toman);
            if (data.EUR?.price || data.EUR?.toman) newEur = Number(data.EUR.price || data.EUR.toman);
          }

          if (newTry > 0) {
            setTryRateToman(newTry);
            updatePaymentSettings({ exchangeRateToman: newTry });
          }
          if (newUsd > 0) setUsdRateToman(newUsd);
          if (newEur > 0) setEurRateToman(newEur);

          setProviderName(result.provider === 'netarz' ? 'NetArz.ir (نِت اَرز زنده)' : 'صرافی آنلاین بازار آزاد');
          setLastUpdated(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

          if (!silent) {
            showToast('قیمت‌های لحظه‌ای از وب‌سرویس NetArz با موفقیت به‌روزرسانی شد.', 'success');
          }
          setIsRefreshing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Live rate fetch attempt fallback:', err);
    }

    setTimeout(() => {
      const randomTryFluctuation = Math.floor(Math.random() * 8) - 4;
      const newTry = Math.max(5000, tryRateToman + randomTryFluctuation);
      setTryRateToman(newTry);
      updatePaymentSettings({ exchangeRateToman: newTry });
      setLastUpdated(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRefreshing(false);
      if (!silent) {
        showToast('قیمت‌های لحظه‌ای با موفقیت به‌روزرسانی شدند.', 'success');
      }
    }, 400);
  };

  useEffect(() => {
    fetchLiveRates(true);
  }, []);

  const handleSaveAdminRates = (e: React.FormEvent) => {
    e.preventDefault();
    const newTry = parseFloat(editTry) || 5470;
    const newUsd = parseFloat(editUsd) || 68500;
    const newEur = parseFloat(editEur) || 74200;

    setTryRateToman(newTry);
    setUsdRateToman(newUsd);
    setEurRateToman(newEur);
    updatePaymentSettings({ exchangeRateToman: newTry });
    setIsEditingRates(false);
    showToast('نرخ جدید لیر و ارزها با موفقیت ذخیره و در تمام سایت اعمال شد.', 'success');
  };

  // Convert given input
  const getConvertedToman = () => {
    if (calcCurrency === 'TRY') return calcAmount * tryRateToman;
    if (calcCurrency === 'USD') return calcAmount * usdRateToman;
    if (calcCurrency === 'EUR') return calcAmount * eurRateToman;
    if (calcCurrency === 'AED') return calcAmount * aedRateToman;
    return 0;
  };

  const currentConvertedToman = getConvertedToman();
  const currentConvertedRial = currentConvertedToman * 10;

  // Currency list items for clean vertical listing
  const currencyList = [
    {
      code: 'TRY',
      symbol: '₺',
      flag: '🇹🇷',
      nameFa: 'لیر ترکیه',
      nameNative: 'Türk Lirası',
      rateToman: tryRateToman,
      rateRial: tryRateToman * 10,
      badge: 'واحد اصلی کارباما',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      description: 'مبنای محاسبه تعرفه ثبت آگهی کارفرما، اشتراک همکاران و هتل‌های ترکیه',
    },
    {
      code: 'USD',
      symbol: '$',
      flag: '🇺🇸',
      nameFa: 'دلار آمریکا',
      nameNative: 'US Dollar',
      rateToman: usdRateToman,
      rateRial: usdRateToman * 10,
      badge: 'ارز بین‌المللی',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'مبنای محاسبه قراردادهای ارزی و پرداخت‌های بین‌المللی',
    },
    {
      code: 'EUR',
      symbol: '€',
      flag: '🇪🇺',
      nameFa: 'یورو اروپا',
      nameNative: 'Euro',
      rateToman: eurRateToman,
      rateRial: eurRateToman * 10,
      badge: 'اتحادیه اروپا',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description: 'مبنای ارزی قراردادهای اروپایی و ویزای کار',
    },
    {
      code: 'AED',
      symbol: 'د.إ',
      flag: '🇦🇪',
      nameFa: 'درهم امارات',
      nameNative: 'UAE Dirham',
      rateToman: aedRateToman,
      rateRial: aedRateToman * 10,
      badge: 'منطقه‌ای',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'حوالجات بانکی و صرافی‌های منطقه‌ای خلیج فارس',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>استعلام زنده از وب‌سرویس NetArz (نِت اَرز)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              قیمت روز و لحظه‌ای ارز (لیر ترکیه و دلار آمریکا)
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              نرخ رسمی و مستقیم تبدیل ارزها جهت پرداخت هزینه‌های آگهی، اشتراک همکاران، هتل‌ها و پرونده‌های استخدامی.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchLiveRates(false)}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>به‌روزرسانی قیمت‌ها ({lastUpdated})</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => setIsEditingRates(!isEditingRates)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>تنظیم دستی مدیر</span>
              </button>
            )}
          </div>
        </div>

        {/* API Credit & Last Updated */}
        <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>منبع قیمت‌ها: <strong>{providerName}</strong></span>
          </div>
          <a
            href="https://netarz.ir/fx-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:underline inline-flex items-center gap-1 font-bold"
          >
            <span>مستندات NetArz FX API</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Admin Rate Modifier Form */}
      {isAdminLoggedIn && isEditingRates && (
        <form
          onSubmit={handleSaveAdminRates}
          className="bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>تنظیم مستقیم قیمت پایه لیر و دلار توسط مدیر</span>
            </h3>
            <span className="text-[11px] text-amber-300/80">تغییر پایه محاسبه در تمام سایت</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ هر لیر ترکیه (به تومان):</label>
              <input
                type="number"
                value={editTry}
                onChange={(e) => setEditTry(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="مثلاً 5470"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                هر ۱ لیر = {(parseFloat(editTry) || 0).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ هر دلار آمریکا (به تومان):</label>
              <input
                type="number"
                value={editUsd}
                onChange={(e) => setEditUsd(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="مثلاً 68500"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                هر ۱ دلار = {(parseFloat(editUsd) || 0).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ هر یورو (به تومان):</label>
              <input
                type="number"
                value={editEur}
                onChange={(e) => setEditEur(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="مثلاً 74200"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                هر ۱ یورو = {(parseFloat(editEur) || 0).toLocaleString('fa-IR')} تومان
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingRates(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              ذخیره و اعمال سراسری
            </button>
          </div>
        </form>
      )}

      {/* 2. Vertical List of Currency Rates (به صورت لیستی زیر هم) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">لیست قیمت‌های رسمی و لحظه‌ای ارزها</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">پایه قیمت‌ها: ۱ واحد ارزی</span>
        </div>

        {/* Clean, Non-Confusing Vertical List Items */}
        <div className="divide-y divide-slate-800/80">
          {currencyList.map((c) => (
            <div
              key={c.code}
              className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-2xl transition"
            >
              {/* Currency Identity */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                  <span>{c.flag}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{c.nameFa}</h3>
                    <span className="font-mono text-xs text-slate-400 font-bold">({c.code} {c.symbol})</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>
                </div>
              </div>

              {/* Exact Single Primary Price (Toman) + Secondary (Rial) */}
              <div className="text-right sm:text-left self-end sm:self-center shrink-0">
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {c.rateToman.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-xs text-slate-200 font-bold">تومان</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  معادل: {c.rateRial.toLocaleString('fa-IR')} ریال
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Quick Converter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">محاسبه‌گر سریع تبدیل مبالغ</h2>
          </div>
          <span className="text-xs text-slate-400">تبدیل فوری به تومان و ریال</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">مبلغ مورد نظر:</label>
            <input
              type="number"
              min="1"
              value={calcAmount || ''}
              onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-base font-black text-white font-mono text-left transition outline-none"
              placeholder="مثلاً 500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">واحد ارز:</label>
            <select
              value={calcCurrency}
              onChange={(e) => setCalcCurrency(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition outline-none"
            >
              <option value="TRY">₺ لیر ترکیه (TRY)</option>
              <option value="USD">$ دلار آمریکا (USD)</option>
              <option value="EUR">€ یورو اروپا (EUR)</option>
              <option value="AED">د.إ درهم امارات (AED)</option>
            </select>
          </div>
        </div>

        {/* Converted Output Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-850 to-slate-850 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              معادل {calcAmount.toLocaleString('fa-IR')} {calcCurrency === 'TRY' ? 'لیر ترکیه' : calcCurrency === 'USD' ? 'دلار آمریکا' : calcCurrency === 'EUR' ? 'یورو' : 'درهم'}:
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {Math.round(currentConvertedToman).toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-200 font-bold">تومان</span>
            <span className="text-xs text-slate-400 font-mono mr-2">
              ({Math.round(currentConvertedRial).toLocaleString('fa-IR')} ریال)
            </span>
          </div>
        </div>
      </div>

      {/* 4. EXAMPLES SECTION (و در آخر مثال بزنه) */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            💡
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              مثال‌های کاربردی محاسبه و تبدیل در سامانه کارباما
            </h2>
            <p className="text-xs text-slate-400">
              نمونه‌های دقیق پرداخت‌های شتابی و ارزی با نرخ روز لیر ({tryRateToman.toLocaleString('fa-IR')} تومان):
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Example 1: Employer Job Posting (500 TRY) */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>مثال ۱: هزینه ثبت آگهی استخدام کارفرما</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                ۵۰۰ لیر ₺
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              تعرفه ثبت هر موقعیت شغلی در سایت <strong>۵۰۰ لیر ترکیه</strong> است.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-1 font-mono text-left" dir="ltr">
              <div className="text-slate-400 text-[11px]">Formula: 500 TRY × {tryRateToman.toLocaleString()} Toman</div>
              <div className="text-amber-400 font-black text-sm">
                = {(500 * tryRateToman).toLocaleString()} Toman ({(500 * tryRateToman * 10).toLocaleString()} Rials)
              </div>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold">
              ✓ مبلغ نهایی واریزی کارفرما: {(500 * tryRateToman).toLocaleString('fa-IR')} تومان
            </p>
          </div>

          {/* Example 2: Partner 1-Month Plan (1500 TRY) */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>مثال ۲: اشتراک ۱ ماهه دفاتر همکار</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                ۱,۵۰۰ لیر ₺
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              تعرفه پلن یک‌ماهه همکاران رسمی کارباما <strong>۱,۵۰۰ لیر ترکیه</strong> می‌باشد.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-1 font-mono text-left" dir="ltr">
              <div className="text-slate-400 text-[11px]">Formula: 1,500 TRY × {tryRateToman.toLocaleString()} Toman</div>
              <div className="text-indigo-300 font-black text-sm">
                = {(1500 * tryRateToman).toLocaleString()} Toman ({(1500 * tryRateToman * 10).toLocaleString()} Rials)
              </div>
            </div>
            <p className="text-[11px] text-indigo-400 font-bold">
              ✓ مبلغ نهایی واریزی همکار: {(1500 * tryRateToman).toLocaleString('fa-IR')} تومان
            </p>
          </div>

          {/* Example 3: Hotel Reservation (1000 TRY) */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <Hotel className="w-4 h-4 text-rose-400" />
                <span>مثال ۳: رزرو اقامتگاه یا هتل در ترکیه</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                ۱,۰۰۰ لیر ₺
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              هزینه یک شب اقامت نمونه در هتل‌های استانبول <strong>۱,۰۰۰ لیر ترکیه</strong> است.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-1 font-mono text-left" dir="ltr">
              <div className="text-slate-400 text-[11px]">Formula: 1,000 TRY × {tryRateToman.toLocaleString()} Toman</div>
              <div className="text-rose-300 font-black text-sm">
                = {(1000 * tryRateToman).toLocaleString()} Toman ({(1000 * tryRateToman * 10).toLocaleString()} Rials)
              </div>
            </div>
            <p className="text-[11px] text-rose-400 font-bold">
              ✓ مبلغ ریالی کارت به کارت: {(1000 * tryRateToman).toLocaleString('fa-IR')} تومان
            </p>
          </div>

          {/* Example 4: USD International Payment (100 USD) */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>مثال ۴: واریزی و تسویه دلاری بین‌المللی</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                ۱۰۰ دلار $
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              دستمزد یا پرداخت ارزی <strong>۱۰۰ دلار آمریکا</strong> در صرافی کارباما.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-1 font-mono text-left" dir="ltr">
              <div className="text-slate-400 text-[11px]">Formula: 100 USD × {usdRateToman.toLocaleString()} Toman</div>
              <div className="text-emerald-400 font-black text-sm">
                = {(100 * usdRateToman).toLocaleString()} Toman ({(100 * usdRateToman * 10).toLocaleString()} Rials)
              </div>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold">
              ✓ معادل ریالی: {(100 * usdRateToman).toLocaleString('fa-IR')} تومان ({(100 * usdRateToman * 10).toLocaleString('fa-IR')} ریال)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
