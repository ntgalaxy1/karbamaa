import React, { useState, useMemo } from 'react';
import {
  Coins,
  TrendingUp,
  RefreshCw,
  ArrowLeftRight,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Navigation,
  Copy,
  Check,
  Calculator,
  Info,
  Building2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type CalcCurrencyCode = 'TRY' | 'IRT' | 'IRR' | 'USD' | 'EUR';

const CURRENCY_META: Record<
  CalcCurrencyCode,
  { label: string; symbol: string; flag: string; unitText: string }
> = {
  TRY: { label: 'لیر ترکیه (TRY)', symbol: '₺', flag: '🇹🇷', unitText: 'لیر ترکیه' },
  IRT: { label: 'تومان ایران (تومان)', symbol: 'تومان', flag: '🇮🇷', unitText: 'تومان' },
  IRR: { label: 'ریال ایران (IRR)', symbol: 'ریال', flag: '🇮🇷', unitText: 'ریال ایران' },
  USD: { label: 'دلار آمریکا (USD)', symbol: '$', flag: '🇺🇸', unitText: 'دلار آمریکا' },
  EUR: { label: 'یورو اروپا (EUR)', symbol: '€', flag: '🇪🇺', unitText: 'یورو اروپا' },
};

export const CurrencyExchangeSection: React.FC = () => {
  const { addresses, showToast, liveRates, refreshLiveRates } = useApp();

  // Bidirectional Multi-Currency Converter State
  const [fromCurrency, setFromCurrency] = useState<CalcCurrencyCode>('TRY');
  const [toCurrency, setToCurrency] = useState<CalcCurrencyCode>('IRT');
  const [amountInput, setAmountInput] = useState<string>('1000');

  // Filter for Official Exchange Offices
  const [selectedCity, setSelectedCity] = useState<string>('همه');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Convert any currency to Rial (IRR) as base pivot
  const getRateInRial = (code: CalcCurrencyCode): number => {
    switch (code) {
      case 'IRR':
        return 1;
      case 'IRT':
        return 10;
      case 'TRY':
        return liveRates.tryRial || 34100;
      case 'USD':
        return liveRates.usdRial || 1175000;
      case 'EUR':
        return liveRates.eurRial || 1270000;
    }
  };

  const numericAmount = parseFloat(amountInput.replace(/,/g, '')) || 0;

  const conversionSummary = useMemo(() => {
    const baseRial = numericAmount * getRateInRial(fromCurrency);
    const targetRateRial = getRateInRial(toCurrency);
    const convertedVal = targetRateRial > 0 ? baseRial / targetRateRial : 0;

    return {
      convertedVal,
      inTry: baseRial / (liveRates.tryRial || 34100),
      inToman: Math.round(baseRial / 10),
      inRial: Math.round(baseRial),
      inUsd: baseRial / (liveRates.usdRial || 1175000),
      inEur: baseRial / (liveRates.eurRial || 1270000),
    };
  }, [numericAmount, fromCurrency, toCurrency, liveRates]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Exchange offices from addresses
  const exchangeOffices = useMemo(() => {
    return addresses.filter((addr) => {
      if (addr.category !== 'exchange') return false;
      if (selectedCity !== 'همه' && addr.city !== selectedCity && addr.city !== 'سراسری ترکیه') {
        return false;
      }
      return true;
    });
  }, [addresses, selectedCity]);

  const exchangeCities = useMemo(() => {
    const cities = new Set<string>(['همه']);
    addresses.forEach((a) => {
      if (a.category === 'exchange') cities.add(a.city);
    });
    return Array.from(cities);
  }, [addresses]);

  const handleCopyAddress = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('آدرس صرافی کپی شد', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatVal = (val: number, code: CalcCurrencyCode) => {
    if (code === 'IRR' || code === 'IRT') {
      return Math.round(val).toLocaleString('fa-IR');
    }
    if (val >= 100) {
      return Math.round(val).toLocaleString('fa-IR');
    }
    return val.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Hero Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Coins className="w-3.5 h-3.5" />
              <span>تابلو زنده نرخ ارز و ماشین‌حساب تبدیل لیر، تومان، ریال، دلار و یورو</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              صرافی آنلاین و نرخ لحظه‌ای لیر ترکیه (TRY / IRR)
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              نرخ‌های این صفحه به صورت خودکار به تمام حقوق‌های شغلی، تعرفه هتل‌ها و هزینه‌های خدمات در سراسر سایت کارباما متصل است و معادل ریالی و تومانی هر مبلغ لیر را در لحظه محاسبه می‌کند.
            </p>
          </div>

          {/* Live Status & Manual Refresh Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="text-right space-y-0.5">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                آخرین بروزرسانی زنده بازار:
              </div>
              <div className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>ساعت {liveRates.lastUpdated}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refreshLiveRates(false)}
              disabled={liveRates.isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${liveRates.isRefreshing ? 'animate-spin' : ''}`} />
              <span>به‌روزرسانی لحظه‌ای</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Exchange Rate Cards Grid (TRY/IRR, USD/TRY, EUR/TRY, USD/IRR, EUR/IRR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 1 TRY -> Toman & Rial */}
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 dark:border-emerald-500/40 rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇹🇷</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">لیر ترکیه (TRY)</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1 TRY → IRR / IRT</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
              نرخ مرجع سایت
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">معادل تومانی:</span>
              <span className="text-lg font-mono font-black text-emerald-700 dark:text-emerald-400">
                {liveRates.tryToman.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">معادل ریالی:</span>
              <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200">
                {liveRates.tryRial.toLocaleString('fa-IR')} ریال
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: USD / TRY & EUR / TRY International Rates in Turkey */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏦</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">نرخ جهانی در ترکیه</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">USD/TRY &amp; EUR/TRY</span>
              </div>
            </div>
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">هر ۱ دلار آمریکا ($):</span>
              <span className="text-base font-mono font-black text-blue-700 dark:text-blue-400" dir="ltr">
                {liveRates.usdTry.toFixed(2)} ₺
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">هر ۱ یورو اروپا (€):</span>
              <span className="text-sm font-mono font-black text-indigo-700 dark:text-indigo-400" dir="ltr">
                {liveRates.eurTry.toFixed(2)} ₺
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: 1 USD -> Toman & Rial */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">دلار آمریکا (USD)</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1 USD → IRR / IRT</span>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">معادل تومانی:</span>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                {liveRates.usdToman.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">معادل ریالی:</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {liveRates.usdRial.toLocaleString('fa-IR')} ریال
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: 1 EUR -> Toman & Rial */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇪🇺</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">یورو اروپا (EUR)</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">1 EUR → IRR / IRT</span>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">معادل تومانی:</span>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                {liveRates.eurToman.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">معادل ریالی:</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {liveRates.eurRial.toLocaleString('fa-IR')} ریال
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Bidirectional Multi-Currency Converter + Quick Preset Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bidirectional Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/15 dark:bg-amber-500/20 text-blue-700 dark:text-amber-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ماشین‌حساب دوطرفه تبدیل لحظه‌ای ارز
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  تبدیل آنی بین لیر ترکیه (₺)، تومان، ریال ایران، دلار آمریکا ($) و یورو (€)
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input & Currency Selectors */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-300 mb-1.5">
                مبلغ مورد نظر برای تبدیل:
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="مبلغ را وارد کنید..."
                  dir="ltr"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-amber-500 rounded-2xl px-4 py-3.5 text-xl font-mono font-black text-slate-900 dark:text-white text-left focus:outline-none"
                />
                <span className="absolute right-4 top-4 text-xs font-black text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {CURRENCY_META[fromCurrency].flag} {CURRENCY_META[fromCurrency].unitText}
                </span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 ml-1">
                مبالغ پرتکرار:
              </span>
              {(fromCurrency === 'IRT' || fromCurrency === 'IRR'
                ? [1000000, 5000000, 10000000, 25000000, 50000000, 100000000]
                : [100, 500, 1000, 5000, 30000, 45000]
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(String(preset))}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold transition cursor-pointer"
                >
                  {preset.toLocaleString('fa-IR')}
                </button>
              ))}
            </div>

            {/* From / Swap / To Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center pt-1">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تبدیل از ارز:
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as CalcCurrencyCode)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 dark:text-white"
                >
                  {Object.entries(CURRENCY_META).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {meta.flag} {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  title="جابجایی ارز مبدا و مقصد"
                  className="p-2.5 rounded-xl bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 transition shadow-md cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  به ارز مقصد:
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CalcCurrencyCode)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 dark:text-white"
                >
                  {Object.entries(CURRENCY_META).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {meta.flag} {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Result Display Box */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                <span>
                  نتیجه تبدیل {numericAmount.toLocaleString('fa-IR')} {CURRENCY_META[fromCurrency].unitText}:
                </span>
                <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                  بروزرسانی زنده ✓
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-800 dark:text-emerald-300 flex items-baseline gap-2">
                <span>{formatVal(conversionSummary.convertedVal, toCurrency)}</span>
                <span className="text-sm font-sans font-bold">
                  {CURRENCY_META[toCurrency].unitText} ({CURRENCY_META[toCurrency].symbol})
                </span>
              </div>
            </div>

            {/* All-Currencies Simultaneous Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  🇹🇷 معادل لیر ترکیه:
                </span>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                  {formatVal(conversionSummary.inTry, 'TRY')} ₺
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  🇮🇷 معادل تومانی:
                </span>
                <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
                  {conversionSummary.inToman.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  🇺🇸 معادل دلار آمریکا:
                </span>
                <span className="text-xs font-mono font-black text-blue-700 dark:text-blue-400">
                  ${conversionSummary.inUsd.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  🇪🇺 معادل یورو اروپا:
                </span>
                <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400">
                  €{conversionSummary.inEur.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Common Job Salaries & Hotel Rates Live Conversion Table (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>جدول معادل لحظه‌ای حقوق و هزینه‌ها در ترکیه</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              محاسبه خودکار مبالغ رایج حقوق ماهانه کارجویان و اجاره هتل‌ها بر اساس نرخ لحظه‌ای امروز (
              {liveRates.tryToman.toLocaleString('fa-IR')} تومان):
            </p>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {[
                { label: '۱ شب هتل اقتصادی', tryVal: 1000 },
                { label: 'حقوق پایه ماهانه (کارگر ساده)', tryVal: 28000 },
                { label: 'حقوق متوسط ماهانه (فنی / رستوران)', tryVal: 38000 },
                { label: 'حقوق استادکار ماهر (خیاط / جوشکار)', tryVal: 48000 },
                { label: 'حقوق سرپرست و متخصص ارشد', tryVal: 65000 },
              ].map((row, idx) => {
                const toman = row.tryVal * liveRates.tryToman;
                const rial = row.tryVal * liveRates.tryRial;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setFromCurrency('TRY');
                      setToCurrency('IRT');
                      setAmountInput(String(row.tryVal));
                    }}
                    className="p-3 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 transition flex items-center justify-between gap-2 cursor-pointer text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">{row.label}</div>
                      <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                        {row.tryVal.toLocaleString('fa-IR')} لیر ترکیه (₺)
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <div className="font-black text-emerald-700 dark:text-emerald-400">
                        {toman.toLocaleString('fa-IR')} تومان
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {rial.toLocaleString('fa-IR')} ریال
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-[11px] text-slate-800 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              با کلیک روی هر یک از ردیف‌های جدول بالا، مبلغ آن به صورت خودکار در ماشین‌حساب قرار می‌گیرد.
            </span>
          </div>
        </div>
      </div>

      {/* Verified Currency Exchange Offices in Turkey */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/15 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                لیست صرافی‌های مجاز و معتبر ترکیه (Döviz Bürosu)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                مراکز رسمی تبدیل دلار، یورو، لیر و حواله ارزی بدون کمیسیون در استانبول، آنکارا و شهرهای ترکیه
              </p>
            </div>
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {exchangeCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCity === city
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {city === 'همه' ? 'همه شهرها' : city}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchangeOffices.map((office) => (
            <div
              key={office.id}
              className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 text-[11px] font-extrabold border border-purple-300 dark:border-purple-500/30">
                    {office.city} - {office.district}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">{office.title}</h3>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400" dir="ltr">
                  {office.titleTr}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {office.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate" dir="ltr">
                    {office.address}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(office.address, office.id)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
                  >
                    {copiedId === office.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {office.phones?.[0] && (
                    <a
                      href={`tel:${office.phones[0].replace(/\s/g, '')}`}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>تماس</span>
                    </a>
                  )}
                  <a
                    href={
                      office.mapsUrl ||
                      (office.coordinates
                        ? `https://www.google.com/maps/search/?api=1&query=${office.coordinates.lat},${office.coordinates.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            office.titleTr
                          )}`)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>مسیریابی</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
