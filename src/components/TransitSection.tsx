import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Train,
  Clock,
  CreditCard,
  MapPin,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ArrowRightLeft,
  Search,
  Compass,
} from 'lucide-react';

export const TransitSection: React.FC = () => {
  const { transitLines } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'metrobus' | 'tram' | 'metro' | 'marmaray'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLines = transitLines.filter((line) => {
    if (selectedFilter !== 'all' && line.type !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = line.name.toLowerCase().includes(q) || line.nameTr.toLowerCase().includes(q);
      const matchesStations = line.keyStations.some((s) => s.toLowerCase().includes(q));
      const matchesDesc = line.description.toLowerCase().includes(q);
      if (!matchesName && !matchesStations && !matchesDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-3">
            <Train className="w-3.5 h-3.5" />
            راهنمای جامع رفت‌وآمد، متروبوس، تراموا و مترو در ترکیه
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            راهنمای نقشه و حمل‌ونقل شهری استانبول
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            آشنایی کامل با ایستگاه‌های حیاتی، خط ۲۴ ساعته متروبوس بین قاره‌ای، تراموای T1 عبوری از سرکنسولگری ایران و صرافی‌ها، و نحوه استفاده و شارژ استانبول‌کارت.
          </p>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              placeholder="جستجوی نام ایستگاه یا خط (مثال: متروبوس، گلخانه، آکسارای، تقسیم، زیتین‌بورنو)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 focus:border-amber-500 text-white placeholder-slate-400 pr-12 pl-4 py-3 rounded-2xl text-sm focus:outline-hidden shadow-lg transition"
            />
          </div>
        </div>
      </div>

      {/* Istanbulkart Special Advisory Box */}
      <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">راهنمای کارت استانبول (İstanbulkart)</h3>
            <p className="text-xs text-slate-400">کلید تمام رفت‌وآمدهای متروبوس، تراموا، مترو، اتوبوس و کشتی</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">نحوه خرید کارت:</strong>
            <p className="text-slate-300 leading-relaxed">
              از دستگاه‌های زرد رنگ <strong>Biletmatik</strong> داخل تمام ایستگاه‌های مترو و متروبوس و دکه‌های روزنامه‌فروشی به قیمت تقریبی ۱۰۰ تا ۱۳۰ لیر قابل خرید است.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">شارژ اعتبار با اسکناس:</strong>
            <p className="text-slate-300 leading-relaxed">
              کارت را روی قسمت شیشه‌ای دستگاه بگذارید و اسکناس‌های ۱۰، ۲۰، ۵۰، ۱۰۰ یا ۲۰۰ لیر را وارد کنید تا اعتبار شارژ شود.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">استرداد وجه متروبوس (İade):</strong>
            <p className="text-slate-300 leading-relaxed">
              در متروبوس و مارمارای، هنگام پیاده‌شدن کارت را به دستگاه‌های کوچک زرد رنگ خروجی بزنید تا مابه‌التفاوت کرایه به کارت شما بازگردد!
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'all', label: 'همه خطوط شهری' },
          { key: 'metrobus', label: 'متروبوس ۲۴ ساعته (Metrobüs)' },
          { key: 'tram', label: 'تراموای شهری (T1)' },
          { key: 'metro', label: 'خطوط مترو (Metro)' },
          { key: 'marmaray', label: 'قطار زیردریایی مارمارای' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition ${
              selectedFilter === tab.key
                ? 'bg-amber-600 text-white font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transit Lines List */}
      <div className="space-y-4">
        {filteredLines.map((line) => (
          <div
            key={line.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition space-y-4"
          >
            {/* Line Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1.5 rounded-xl text-white font-black text-xs shadow-md tracking-wider font-mono"
                  style={{ backgroundColor: line.color }}
                >
                  {line.badge}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{line.name}</h3>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">{line.nameTr}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {line.schedule}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/80">
              {line.description}
            </p>

            {/* Key Stations */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-red-500" />
                ایستگاه‌های کلیدی و پرتردد در این خط:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {line.keyStations.map((station, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700/60 font-medium"
                  >
                    {station}
                  </span>
                ))}
              </div>
            </div>

            {/* Connections & Fare */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ArrowRightLeft className="w-4 h-4 text-blue-400 shrink-0" />
                <span><strong>تقاطع با سایر خطوط:</strong> {line.connections}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>کرایه:</strong> {line.fareInfo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
