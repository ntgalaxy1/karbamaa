import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { safeStorage } from '../utils/safeStorage';
import {
  Coins,
  RefreshCw,
  Calculator,
  ShieldCheck,
  Edit3,
  Save,
  Globe,
  ExternalLink,
  ArrowLeftRight,
  Sparkles,
  Check,
  TrendingUp,
} from 'lucide-react';

interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  rial: number;
  toman: number;
  changeText: string;
  changePct: number;
  isPositive: boolean;
  flag: string;
  badge: string;
}

export const CurrencyExchangeSection: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, showToast } = useApp();

  const loadStoredRates = () => {
    try {
      const raw = safeStorage.getItem('karbama_live_fx_rates_v35');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.usdRial > 100000) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const cached = loadStoredRates();

  const [usdRial, setUsdRial] = useState<number>(cached?.usdRial || 1522000);
  const [eurRial, setEurRial] = useState<number>(cached?.eurRial || 1788500);
  const [aedRial, setAedRial] = useState<number>(cached?.aedRial || 414400);
  const [gbpRial, setGbpRial] = useState<number>(cached?.gbpRial || 2051200);
  const [tryRial, setTryRial] = useState<number>(cached?.tryRial || 34110);
  const [changePct, setChangePct] = useState<number>(cached?.changePct ?? 0.45);

  const [providerName, setProviderName] = useState<string>(
    cached?.providerName || 'وب‌سرویس زنده بازار آزاد ایران (Wallex/Nobitex) + نرخ جهانی (OpenFX)'
  );
  const [lastUpdated, setLastUpdated] = useState<string>(
    cached?.lastUpdated ||
      new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Rate Editing State
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [editUsdRial, setEditUsdRial] = useState(usdRial.toString());
  const [editEurRial, setEditEurRial] = useState(eurRial.toString());
  const [editAedRial, setEditAedRial] = useState(aedRial.toString());
  const [editGbpRial, setEditGbpRial] = useState(gbpRial.toString());
  const [editTryRial, setEditTryRial] = useState(tryRial.toString());

  // Interactive Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(500);
  const [calcCurrency, setCalcCurrency] = useState<'TRY' | 'USD' | 'EUR' | 'AED' | 'GBP'>('TRY');

  const persistRates = (
    u: number,
    e: number,
    a: number,
    g: number,
    t: number,
    ch: number,
    prov: string,
    timeStr: string
  ) => {
    try {
      safeStorage.setItem(
        'karbama_live_fx_rates_v35',
        JSON.stringify({
          usdRial: u,
          eurRial: e,
          aedRial: a,
          gbpRial: g,
          tryRial: t,
          changePct: ch,
          providerName: prov,
          lastUpdated: timeStr,
        })
      );
    } catch {
      // ignore
    }
  };

  // Keep paymentSettings in sync when TRY rate changes
  useEffect(() => {
    const currentToman = Math.round(tryRial / 10);
    if (currentToman > 500 && paymentSettings.exchangeRateToman !== currentToman) {
      updatePaymentSettings({ exchangeRateToman: currentToman });
    }
  }, [tryRial]);

  const applyRateData = (d: any, label: string, silent: boolean) => {
    const u = Number(d.USD?.rial || usdRial);
    const e = Number(d.EUR?.rial || eurRial);
    const a = Number(d.AED?.rial || aedRial);
    const g = Number(d.GBP?.rial || gbpRial);
    const t = Number(d.TRY?.rial || tryRial);
    const ch = Number(d.USD?.change ?? 0.45);
    const nowStr = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setUsdRial(u);
    setEurRial(e);
    setAedRial(a);
    setGbpRial(g);
    setTryRial(t);
    setChangePct(ch);
    setEditUsdRial(String(u));
    setEditEurRial(String(e));
    setEditAedRial(String(a));
    setEditGbpRial(String(g));
    setEditTryRial(String(t));
    setProviderName(label);
    setLastUpdated(nowStr);
    persistRates(u, e, a, g, t, ch, label, nowStr);
    updatePaymentSettings({ exchangeRateToman: Math.round(t / 10) });
    if (!silent) {
      showToast('قیمت‌های لحظه‌ای ارز از بازار زنده با موفقیت به‌روزرسانی شدند.', 'success');
    }
  };

  // Multi-Layer Live Rate Fetcher (1. Server API -> 2. PHP API -> 3. Direct Browser API)
  const fetchLiveRates = async (silent = false) => {
    setIsRefreshing(true);

    // Layer 1: Node / Express /api/fx-rates
    try {
      const res = await fetch('/api/fx-rates');
      if (res.ok) {
        const result = await res.json();
        if (result?.success && result?.data?.USD?.rial) {
          applyRateData(
            result.data,
            result.providerLabel || 'بازار زنده ارز ایران (Wallex/Nobitex + Global Forex)',
            silent
          );
          setIsRefreshing(false);
          return;
        }
      }
    } catch {
      // try next layer
    }

    // Layer 2: PHP endpoint (/api/fx-rates.php for karbama34.ir)
    try {
      const phpRes = await fetch('/api/fx-rates.php');
      if (phpRes.ok) {
        const result = await phpRes.json();
        if (result?.success && result?.data?.USD?.rial) {
          applyRateData(
            result.data,
            result.providerLabel || 'وب‌سرویس زنده ارز سرور (PHP Live FX)',
            silent
          );
          setIsRefreshing(false);
          return;
        }
      }
    } catch {
      // try next layer
    }

    // Layer 3: Direct Client-Side Browser Fetch (Open Exchange Rates + Wallex)
    try {
      let liveUsdToman = 0;
      let liveCh = 0.45;
      try {
        const wRes = await fetch('https://api.wallex.ir/v1/markets');
        if (wRes.ok) {
          const wJson = await wRes.json();
          const p = Number(wJson?.result?.symbols?.USDTTMN?.stats?.lastPrice || 0);
          if (p > 20000) {
            liveUsdToman = Math.round(p);
            liveCh = Number(wJson?.result?.symbols?.USDTTMN?.stats?.['24h_ch'] || 0);
          }
        }
      } catch {
        // fallback
      }

      const erRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (erRes.ok) {
        const erJson = await erRes.json();
        const rates = erJson?.rates || {};
        const baseUsdRial = (liveUsdToman > 20000 ? liveUsdToman : Math.round(usdRial / 10)) * 10;
        const tryRate = Number(rates.TRY || 44.62);
        const eurRate = Number(rates.EUR || 0.851);
        const aedRate = Number(rates.AED || 3.6725);
        const gbpRate = Number(rates.GBP || 0.742);

        applyRateData(
          {
            USD: { rial: baseUsdRial, change: liveCh },
            TRY: { rial: Math.round((baseUsdRial / tryRate) / 10) * 10 },
            EUR: { rial: Math.round((baseUsdRial / eurRate) / 100) * 100 },
            AED: { rial: Math.round((baseUsdRial / aedRate) / 100) * 100 },
            GBP: { rial: Math.round((baseUsdRial / gbpRate) / 100) * 100 },
          },
          'اتصال مستقیم مرورگر به بازار جهانی ارز (Live Direct FX)',
          silent
        );
        setIsRefreshing(false);
        return;
      }
    } catch (err) {
      console.warn('Direct FX fetch warning:', err);
    }

    setIsRefreshing(false);
    if (!silent) {
      showToast('نرخ‌های ذخیره‌شده نمایش داده شد.', 'info');
    }
  };

  // Fetch on mount & auto-refresh every 60 seconds
  useEffect(() => {
    fetchLiveRates(true);
    const timer = setInterval(() => {
      fetchLiveRates(true);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const newUsd = parseFloat(editUsdRial) || usdRial;
    const newEur = parseFloat(editEurRial) || eurRial;
    const newAed = parseFloat(editAedRial) || aedRial;
    const newGbp = parseFloat(editGbpRial) || gbpRial;
    const newTry = parseFloat(editTryRial) || tryRial;
    const nowStr = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setUsdRial(newUsd);
    setEurRial(newEur);
    setAedRial(newAed);
    setGbpRial(newGbp);
    setTryRial(newTry);
    setLastUpdated(nowStr);
    persistRates(newUsd, newEur, newAed, newGbp, newTry, changePct, 'نرخ تنظیم‌شده توسط مدیریت', nowStr);
    updatePaymentSettings({ exchangeRateToman: Math.round(newTry / 10) });
    setIsEditingRates(false);
    showToast('نرخ‌های جدید ارز با موفقیت ذخیره و در تمام سامانه اعمال شدند.', 'success');
  };

  // Convert given input
  const getConvertedRial = () => {
    if (calcCurrency === 'TRY') return calcAmount * tryRial;
    if (calcCurrency === 'USD') return calcAmount * usdRial;
    if (calcCurrency === 'EUR') return calcAmount * eurRial;
    if (calcCurrency === 'AED') return calcAmount * aedRial;
    if (calcCurrency === 'GBP') return calcAmount * gbpRial;
    return 0;
  };

  const currentConvertedRial = getConvertedRial();
  const currentConvertedToman = Math.round(currentConvertedRial / 10);

  // Practical 500 Lira to Rial calculation
  const lira500ToRial = 500 * tryRial;
  const lira500ToToman = Math.round(lira500ToRial / 10);

  const isPositiveChange = changePct >= 0;
  const formattedPct = `${isPositiveChange ? '+' : ''}${changePct.toFixed(2)}%`;

  // Currency list structure
  const currencies: CurrencyItem[] = [
    {
      code: 'USD',
      symbol: '$',
      name: 'دلار آمریکا',
      rial: usdRial,
      toman: Math.round(usdRial / 10),
      changeText: `نوسان ۲۴ساعته: ${formattedPct}`,
      changePct: Math.abs(changePct),
      isPositive: isPositiveChange,
      flag: '🇺🇸',
      badge: 'ارز پایه بین‌المللی',
    },
    {
      code: 'EUR',
      symbol: '€',
      name: 'یورو اروپا',
      rial: eurRial,
      toman: Math.round(eurRial / 10),
      changeText: `نوسان ۲۴ساعته: ${formattedPct}`,
      changePct: Math.abs(changePct),
      isPositive: isPositiveChange,
      flag: '🇪🇺',
      badge: 'اتحادیه اروپا',
    },
    {
      code: 'AED',
      symbol: 'د.إ',
      name: 'درهم امارات',
      rial: aedRial,
      toman: Math.round(aedRial / 10),
      changeText: `نوسان ۲۴ساعته: ${formattedPct}`,
      changePct: Math.abs(changePct),
      isPositive: isPositiveChange,
      flag: '🇦🇪',
      badge: 'منطقه‌ای خلیج فارس',
    },
    {
      code: 'GBP',
      symbol: '£',
      name: 'پوند انگلیس',
      rial: gbpRial,
      toman: Math.round(gbpRial / 10),
      changeText: `نوسان ۲۴ساعته: ${formattedPct}`,
      changePct: Math.abs(changePct),
      isPositive: isPositiveChange,
      flag: '🇬🇧',
      badge: 'بریتانیا',
    },
    {
      code: 'TRY',
      symbol: '₺',
      name: 'لیر ترکیه',
      rial: tryRial,
      toman: Math.round(tryRial / 10),
      changeText: `${tryRial.toLocaleString('fa-IR')} ریال (${Math.round(tryRial / 10).toLocaleString('fa-IR')} تومان)`,
      changePct: Math.abs(changePct),
      isPositive: isPositiveChange,
      flag: '🇹🇷',
      badge: 'واحد کارباما',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>جدول زنده قیمت ارزهای آزاد (به‌روزرسانی لحظه‌ای)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              قیمت زنده ارز آزاد (دلار، یورو، درهم، پوند و لیر ترکیه)
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              نرخ‌های لحظه‌ای بازار بر پایه ریال ایران و معادل تومان، به همراه برابری هر ارز با لیر ترکیه و مثال عملی تبدیل ریالی.
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

            <button
              onClick={() => {
                setEditUsdRial(usdRial.toString());
                setEditEurRial(eurRial.toString());
                setEditAedRial(aedRial.toString());
                setEditGbpRial(gbpRial.toString());
                setEditTryRial(tryRial.toString());
                setIsEditingRates(!isEditingRates);
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditingRates ? 'بستن تنظیم' : 'تنظیم و تغییر نرخ‌ها'}</span>
            </button>
          </div>
        </div>

        {/* Source info */}
        <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>مرجع قیمت‌ها: <strong>{providerName}</strong></span>
          </div>
          <span className="text-amber-300/90 text-[11px]">
            محاسبه دوگانه بر پایه ریال بانکی و تومان
          </span>
        </div>
      </div>

      {/* Manual Rate Modifier Form */}
      {isEditingRates && (
        <form
          onSubmit={handleSaveRates}
          className="bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>تنظیم مستقیم قیمت‌های زنده (بر پایه ریال)</span>
            </h3>
            <span className="text-[11px] text-amber-300/80">اعمال فوری در تمام محاسبات سایت</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ دلار آمریکا (به ریال):</label>
              <input
                type="number"
                value={editUsdRial}
                onChange={(e) => setEditUsdRial(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="2725000"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                = {Math.round((parseFloat(editUsdRial) || 0) / 10).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ یورو اروپا (به ریال):</label>
              <input
                type="number"
                value={editEurRial}
                onChange={(e) => setEditEurRial(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="3051800"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                = {Math.round((parseFloat(editEurRial) || 0) / 10).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ لیر ترکیه (به ریال):</label>
              <input
                type="number"
                value={editTryRial}
                onChange={(e) => setEditTryRial(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="54600"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                = {Math.round((parseFloat(editTryRial) || 0) / 10).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ درهم امارات (به ریال):</label>
              <input
                type="number"
                value={editAedRial}
                onChange={(e) => setEditAedRial(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="746610"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                = {Math.round((parseFloat(editAedRial) || 0) / 10).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">نرخ پوند انگلیس (به ریال):</label>
              <input
                type="number"
                value={editGbpRial}
                onChange={(e) => setEditGbpRial(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono text-left font-bold"
                placeholder="3655500"
              />
              <p className="text-[10px] text-amber-400/80 mt-1">
                = {Math.round((parseFloat(editGbpRial) || 0) / 10).toLocaleString('fa-IR')} تومان
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
              ذخیره و اعمال نرخ‌ها
            </button>
          </div>
        </form>
      )}

      {/* 2. Vertical List of Currency Rates (لیست عمودی زیر هم دقیقا مطابق قیمت‌های روز اعلامی) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white">
              جدول قیمت‌های زنده ارز آزاد (لیست عمودی)
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            نرخ‌های رسمی و لحظه‌ای
          </span>
        </div>

        {/* Vertical List Items */}
        <div className="space-y-3.5">
          {currencies.map((c) => {
            const tryCrossRatio = (c.rial / (tryRial || 54600)).toFixed(2);
            return (
              <div
                key={c.code}
                className="p-4 sm:p-5 bg-slate-850/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl transition space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
                      {c.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base">
                          {c.name} ({c.code} {c.symbol})
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {c.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        <strong>یک {c.name}</strong> معادل{' '}
                        <span className="text-amber-400 font-black font-mono text-sm sm:text-base">
                          {c.toman.toLocaleString('fa-IR')}
                        </span>{' '}
                        تومان ایران (
                        <span className="text-emerald-400 font-mono font-bold">
                          {c.rial.toLocaleString('fa-IR')}
                        </span>{' '}
                        ریال)
                        {c.code !== 'TRY' && (
                          <>
                            {' '}و{' '}
                            <span className="text-amber-300 font-black font-mono text-sm sm:text-base">
                              {tryCrossRatio}
                            </span>{' '}
                            لیر ترکیه
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-left bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-700 self-end sm:self-center shrink-0 min-w-[170px]">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400">قیمت زنده:</span>
                      {c.changePct > 0 && (
                        <span className="text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-0.5" dir="ltr">
                          <TrendingUp className="w-3 h-3" />
                          {c.changeText}
                        </span>
                      )}
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                      {c.rial.toLocaleString('fa-IR')}{' '}
                      <span className="text-xs text-slate-300 font-bold">ریال</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      = {c.toman.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. PRACTICAL EXAMPLE AT THE END OF THE LIST (در انتهای لیست یک مثال عملی: تبدیل 500 لیر به ریال) */}
        <div className="mt-5 p-5 bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <div className="flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>مثال عملی در انتهای لیست: تبدیل ۵۰۰ لیر ترکیه به ریال و تومان</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              ۵۰۰ TRY ➔ Rials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            {/* Calculation formula */}
            <div className="space-y-2 bg-slate-900/90 p-4 rounded-xl border border-amber-500/30">
              <div className="text-slate-300">
                <span className="font-bold text-white">مبلغ پایه آگهی:</span>{' '}
                <span className="font-mono text-amber-300 font-bold">۵۰۰ لیر ترکیه (₺ 500 TRY)</span>
              </div>
              <div className="text-slate-300">
                <span className="font-bold text-white">نرخ محاسبه هر لیر:</span>{' '}
                <span className="font-mono text-emerald-400 font-bold">{tryRial.toLocaleString('fa-IR')} ریال</span>{' '}
                ({Math.round(tryRial / 10).toLocaleString('fa-IR')} تومان)
              </div>
              <div className="text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-800" dir="ltr">
                Formula: 500 TRY × {tryRial.toLocaleString()} Rials = {lira500ToRial.toLocaleString()} Rials
              </div>
            </div>

            {/* Final Results */}
            <div className="flex flex-col justify-center space-y-2 bg-slate-900/90 p-4 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">معادل به ریال ایران:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {lira500ToRial.toLocaleString('fa-IR')} ریال
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-bold">معادل به تومان:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {lira500ToToman.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-slate-300 space-y-1">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>نتیجه نهایی تبدیل ۵۰۰ لیر ترکیه:</span>
            </p>
            <p className="leading-relaxed text-[11.5px]">
              هزینه ثبت آگهی ۵۰۰ لیر ترکیه در درگاه شتاب بانکی ایران دقیقاً برابر با{' '}
              <strong className="text-emerald-400 font-mono">{lira500ToRial.toLocaleString('fa-IR')} ریال</strong> (معادل{' '}
              <strong className="text-amber-300 font-mono">{lira500ToToman.toLocaleString('fa-IR')} تومان</strong>) محاسبه و تسویه می‌گردد.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Quick Converter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">محاسبه‌گر آنلاین هر مبلغ دلخواه</h2>
          </div>
          <span className="text-xs text-slate-400">تبدیل آنی بر پایه ریال و تومان</span>
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
              <option value="GBP">£ پوند انگلیس (GBP)</option>
            </select>
          </div>
        </div>

        {/* Converted Output Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-850 to-slate-850 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              معادل {calcAmount.toLocaleString('fa-IR')}{' '}
              {calcCurrency === 'TRY'
                ? 'لیر ترکیه'
                : calcCurrency === 'USD'
                ? 'دلار آمریکا'
                : calcCurrency === 'EUR'
                ? 'یورو'
                : calcCurrency === 'AED'
                ? 'درهم امارات'
                : 'پوند انگلیس'}
              :
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {Math.round(currentConvertedRial).toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-200 font-bold">ریال</span>
            <span className="text-xs text-amber-400 font-mono mr-2">
              (معادل {Math.round(currentConvertedToman).toLocaleString('fa-IR')} تومان)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
