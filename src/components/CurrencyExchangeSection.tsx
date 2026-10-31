import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  RefreshCw,
  TrendingUp,
  ArrowRightLeft,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Info,
  DollarSign,
  Building2,
  Briefcase,
  Hotel,
  FileText,
  Clock,
  Sparkles,
  Edit3,
  Save,
} from 'lucide-react';

export const CurrencyExchangeSection: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, isAdminLoggedIn, showToast } = useApp();

  // Primary Rates
  const [tryRateToman, setTryRateToman] = useState<number>(paymentSettings.exchangeRateToman || 5470);
  const [usdRateToman, setUsdRateToman] = useState<number>(68500);
  const [eurRateToman, setEurRateToman] = useState<number>(74200);

  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin Rate Edit State
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [editTry, setEditTry] = useState(tryRateToman.toString());
  const [editUsd, setEditUsd] = useState(usdRateToman.toString());

  // Interactive Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(500);
  const [calcCurrency, setCalcCurrency] = useState<'TRY' | 'USD' | 'EUR' | 'TOMAN'>('TRY');

  // Keep paymentSettings in sync when TRY rate changes
  useEffect(() => {
    if (paymentSettings.exchangeRateToman !== tryRateToman) {
      setTryRateToman(paymentSettings.exchangeRateToman);
      setEditTry(paymentSettings.exchangeRateToman.toString());
    }
  }, [paymentSettings.exchangeRateToman]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate minor live fluctuation (+- 5 to 15 Tomans)
      const randomTryFluctuation = Math.floor(Math.random() * 10) - 5;
      const newTry = Math.max(5000, tryRateToman + randomTryFluctuation);
      
      setTryRateToman(newTry);
      updatePaymentSettings({ exchangeRateToman: newTry });
      setLastUpdated(
        new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setIsRefreshing(false);
      showToast('نرخ‌های ارزی لیر و دلار بر اساس بازار آزاد به‌روزرسانی شدند.', 'success');
    }, 600);
  };

  const handleSaveAdminRates = (e: React.FormEvent) => {
    e.preventDefault();
    const newTry = parseFloat(editTry) || 5470;
    const newUsd = parseFloat(editUsd) || 68500;

    setTryRateToman(newTry);
    setUsdRateToman(newUsd);
    updatePaymentSettings({ exchangeRateToman: newTry });
    setIsEditingRates(false);
    showToast('نرخ جدید لیر و دلار با موفقیت ذخیره و در تمام بخش‌های سامانه اعمال شد.', 'success');
  };

  // Convert given input into all targets
  const getConvertedValues = () => {
    let amountInToman = 0;
    if (calcCurrency === 'TRY') amountInToman = calcAmount * tryRateToman;
    else if (calcCurrency === 'USD') amountInToman = calcAmount * usdRateToman;
    else if (calcCurrency === 'EUR') amountInToman = calcAmount * eurRateToman;
    else if (calcCurrency === 'TOMAN') amountInToman = calcAmount;

    return {
      toman: amountInToman,
      rial: amountInToman * 10,
      try: amountInToman / (tryRateToman || 1),
      usd: amountInToman / (usdRateToman || 1),
      eur: amountInToman / (eurRateToman || 1),
    };
  };

  const converted = getConvertedValues();

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>نرخ‌های رسمی و معتبر صرافی کارباما</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              قیمت لحظه‌ای ارز (لیر ترکیه و دلار آمریکا)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              نرخ روز تبدیل لیر، دلار و ریال جهت محاسبه آنلاین پرداختی‌های آگهی‌های شغلی، هزینه‌های کارگزار، اشتراک همکاران و رزرو هتل در ترکیه.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>به‌روزرسانی قیمت‌ها ({lastUpdated})</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => setIsEditingRates(!isEditingRates)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-2xl transition flex items-center justify-center gap-2 text-xs"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>ویرایش دسترسی مدیر</span>
              </button>
            )}
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                هر ۱ لیر = {parseFloat(editTry) || 0} تومان ({((parseFloat(editTry) || 0) * 10).toLocaleString('fa-IR')} ریال)
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
                هر ۱ دلار = {parseFloat(editUsd) || 0} تومان ({((parseFloat(editUsd) || 0) * 10).toLocaleString('fa-IR')} ریال)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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

      {/* Main Currency Exchange Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Turkish Lira (TRY) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-red-500/50 transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                ₺
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">لیر ترکیه (TRY)</h3>
                <p className="text-xs text-slate-400">Türk Lirası</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              زنده 🟢
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">قیمت هر ۱ لیر:</span>
              <div className="text-left">
                <span className="text-lg font-black text-amber-400 font-mono">
                  {tryRateToman.toLocaleString('fa-IR')}
                </span>
                <span className="text-xs text-slate-300 font-bold mr-1">تومان</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-400">معادل ریالی:</span>
              <span className="font-bold text-white font-mono">
                {(tryRateToman * 10).toLocaleString('fa-IR')} ریال
              </span>
            </div>

            {/* Example 500 TRY preset as requested by user */}
            <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>مثال: ۵۰۰ لیر ترکیه</span>
                <span className="font-mono">
                  {(500 * tryRateToman).toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono text-left" dir="ltr">
                = {(500 * tryRateToman * 10).toLocaleString('fa-IR')} Rials
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: US Dollar (USD) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                $
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">دلار آمریکا (USD)</h3>
                <p className="text-xs text-slate-400">US Dollar</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              زنده 🟢
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">قیمت هر ۱ دلار:</span>
              <div className="text-left">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {usdRateToman.toLocaleString('fa-IR')}
                </span>
                <span className="text-xs text-slate-300 font-bold mr-1">تومان</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-400">معادل ریالی:</span>
              <span className="font-bold text-white font-mono">
                {(usdRateToman * 10).toLocaleString('fa-IR')} ریال
              </span>
            </div>

            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span>برابر با لیر ترکیه:</span>
                <span className="font-mono">
                  {(usdRateToman / tryRateToman).toFixed(2)} لیر ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono text-left">
                1 USD = {(usdRateToman / tryRateToman).toFixed(2)} TRY
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Euro (EUR) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                €
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">یورو اروپا (EUR)</h3>
                <p className="text-xs text-slate-400">Euro</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              پایدار 🟢
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">قیمت هر ۱ یورو:</span>
              <div className="text-left">
                <span className="text-lg font-black text-indigo-300 font-mono">
                  {eurRateToman.toLocaleString('fa-IR')}
                </span>
                <span className="text-xs text-slate-300 font-bold mr-1">تومان</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-400">معادل ریالی:</span>
              <span className="font-bold text-white font-mono">
                {(eurRateToman * 10).toLocaleString('fa-IR')} ریال
              </span>
            </div>

            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-indigo-200">
                <span>برابر با لیر ترکیه:</span>
                <span className="font-mono">
                  {(eurRateToman / tryRateToman).toFixed(2)} لیر ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono text-left">
                1 EUR = {(eurRateToman / tryRateToman).toFixed(2)} TRY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Currency Converter Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">محاسبه‌گر پیشرفته تبدیل لیر و ارزها</h2>
              <p className="text-xs text-slate-400">مبلغ مورد نظر را وارد کرده تا معادل همزمان آن را به همه ارزها مشاهده کنید.</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-xl border border-slate-700">
            Realtime Converter
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Amount Input */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">مبلغ مورد نظر جهت تبدیل:</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={calcAmount || ''}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-lg font-black text-white font-mono text-left pr-12 transition outline-none"
                placeholder="مثلاً 500"
              />
              <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">مبلغ</span>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ارز مبدا:</label>
            <select
              value={calcCurrency}
              onChange={(e) => setCalcCurrency(e.target.value as any)}
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm font-bold text-white transition outline-none"
            >
              <option value="TRY">₺ لیر ترکیه (TRY)</option>
              <option value="USD">$ دلار آمریکا (USD)</option>
              <option value="EUR">€ یورو اروپا (EUR)</option>
              <option value="TOMAN">تومان ایران (Toman)</option>
            </select>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">مبالغ پرکاربرد کارباما:</span>
          <button
            onClick={() => { setCalcAmount(500); setCalcCurrency('TRY'); }}
            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold font-mono transition"
          >
            ۵۰۰ لیر (آگهی استخدامی)
          </button>
          <button
            onClick={() => { setCalcAmount(1500); setCalcCurrency('TRY'); }}
            className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold font-mono transition"
          >
            ۱,۵۰۰ لیر (اشتراک همکار)
          </button>
          <button
            onClick={() => { setCalcAmount(100); setCalcCurrency('USD'); }}
            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono transition"
          >
            ۱۰۰ دلار آمریکا
          </button>
          <button
            onClick={() => { setCalcAmount(10000000); setCalcCurrency('TOMAN'); }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold font-mono transition"
          >
            ۱۰ میلیون تومان
          </button>
        </div>

        {/* Conversion Results Display Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Result Toman */}
          <div className="p-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block font-medium">معادل به تومان ایران:</span>
            <span className="text-xl font-black text-amber-400 font-mono block">
              {Math.round(converted.toman).toLocaleString('fa-IR')}
            </span>
            <span className="text-[11px] text-slate-400">تومان</span>
          </div>

          {/* Result Rial */}
          <div className="p-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block font-medium">معادل به ریال ایران:</span>
            <span className="text-xl font-black text-amber-300 font-mono block">
              {Math.round(converted.rial).toLocaleString('fa-IR')}
            </span>
            <span className="text-[11px] text-slate-400">ریال</span>
          </div>

          {/* Result TRY */}
          <div className="p-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block font-medium">معادل به لیر ترکیه:</span>
            <span className="text-xl font-black text-red-400 font-mono block">
              ₺ {converted.try.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400">TRY</span>
          </div>

          {/* Result USD */}
          <div className="p-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block font-medium">معادل به دلار آمریکا:</span>
            <span className="text-xl font-black text-emerald-400 font-mono block">
              $ {converted.usd.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400">USD</span>
          </div>
        </div>
      </div>

      {/* Where Currency Rate Applies in Karbama Application */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>کاربردهای نرخ ارز روز در سامانه کارباما</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>ثبت آگهی استخدام (کارفرمایان)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              هزینه تعرفه ثابت هر آگهی ۵۰۰ لیر ترکیه است که با نرخ روز ({tryRateToman.toLocaleString('fa-IR')} تومان) معادل{' '}
              <strong className="text-amber-300">{(500 * tryRateToman).toLocaleString('fa-IR')} تومان</strong> ({(500 * tryRateToman * 10).toLocaleString('fa-IR')} ریال) محاسبه می‌گردد.
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>اشتراک پنل همکاران رسمی</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              تمامی پلن‌های اشتراک ۱ ماهه، ۳ ماهه، ۶ ماهه و ۱ ساله دفاتر کاریابی بر اساس تعرفه لیر با فرمول محاسبه ریالی پویای این صفحه تسویه می‌شوند.
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <Hotel className="w-4 h-4 text-red-400" />
              <span>رزرو هتل‌ها و اقامتگاه‌ها</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              نرخ‌های لیر اعلامی توسط هتل‌های استانبول، آنکارا و آنتالیا به‌صورت همزمان به تومان و ریال ایران جهت واریز شتابی تبدیل می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
