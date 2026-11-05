import React, { useState } from 'react';
import { useApp, THEME_COLOR_PRESETS } from '../context/AppContext';
import { ThemeColorPreset } from '../types';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Eye,
  Sliders,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ThemeCustomizerModal: React.FC = () => {
  const {
    themeModalOpen,
    setThemeModalOpen,
    themeColor,
    customHexColor,
    setThemeColor,
    theme,
    toggleTheme,
    showToast,
  } = useApp();

  const [localCustomHex, setLocalCustomHex] = useState(customHexColor || '#dc2626');

  if (!themeModalOpen) return null;

  const handleSelectPreset = (presetId: ThemeColorPreset) => {
    setThemeColor(presetId);
    showToast('رنگ تم با موفقیت تغییر کرد', 'success');
  };

  const handleApplyCustomHex = (e: React.FormEvent) => {
    e.preventDefault();
    let hex = localCustomHex.trim();
    if (!hex.startsWith('#')) {
      hex = `#${hex}`;
    }
    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    if (!isValidHex) {
      showToast('لطفاً یک کد رنگ معتبر هگز وارد کنید (مانند #059669)', 'error');
      return;
    }
    setThemeColor('custom', hex);
    showToast('رنگ اختصاصی با موفقیت اعمال شد', 'success');
  };

  const handleReset = () => {
    setThemeColor('red');
    setLocalCustomHex('#dc2626');
    showToast('رنگ تم به حالت قرمز پیش‌فرض بازگشت', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-white text-base">شخصی‌سازی رنگ تم برنامه</h3>
              <p className="text-xs text-slate-400">تغییر رنگ اصلی دکمه‌ها، آیکون‌ها و نشان‌ها در سراسر کارباما</p>
            </div>
          </div>
          <button
            onClick={() => setThemeModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Light / Dark Mode Quick Switch */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">حالت نمایش کلی (تاریک / روشن)</span>
              <span className="text-[11px] text-slate-400">
                در حال حاضر: {theme === 'dark' ? 'حالت شب (تاریک)' : 'حالت روز (روشن)'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>تغییر به روشن</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>تغییر به تاریک</span>
                </>
              )}
            </button>
          </div>

          {/* Color Presets Palette */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                رنگ‌های پیش‌فرض و محبوب:
              </h4>
              <span className="text-[11px] text-slate-500">انتخاب سریع با یک کلیک</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEME_COLOR_PRESETS.map((preset) => {
                const isSelected = themeColor === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`relative p-3 rounded-2xl border text-right transition flex flex-col items-start gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-white/60 shadow-lg ring-2 ring-white/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center border-2 border-white/40"
                        style={{ backgroundColor: preset.primary }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                        {preset.primary}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Wheel / Hex Input */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                انتخاب هر رنگ دلخواه و سفارشی (Custom Color):
              </h4>
              {themeColor === 'custom' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  رنگ سفارشی فعال است
                </span>
              )}
            </div>

            <form onSubmit={handleApplyCustomHex} className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={localCustomHex}
                  onChange={(e) => {
                    setLocalCustomHex(e.target.value);
                    setThemeColor('custom', e.target.value);
                  }}
                  className="w-12 h-11 rounded-xl cursor-pointer bg-slate-800 border border-slate-700 p-1"
                  title="انتخاب از پالت رنگ"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="#dc2626"
                  value={localCustomHex}
                  onChange={(e) => setLocalCustomHex(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition hover:opacity-90"
              >
                اعمال رنگ
              </button>
            </form>
          </div>

          {/* Live Preview Card with Dynamic Top Bar Preview */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/50 space-y-3">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              پیش‌نمایش زنده المان‌ها و نوار رنگی بالایی با تم انتخابی:
            </span>

            {/* Dynamic Top Bar Preview */}
            <div
              style={{ background: 'var(--primary-topbar)' }}
              className="h-3 w-full rounded-md shadow-xs transition-all duration-300"
            />

            <div
              style={{ background: 'var(--primary-banner)', borderColor: 'var(--primary-border)' }}
              className="p-4 border rounded-xl flex items-center justify-between gap-3 flex-wrap transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="px-2.5 py-1 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  دکمه اصلی
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-color)',
                    borderColor: 'var(--primary-border)',
                  }}
                  className="px-2.5 py-1 border rounded-lg text-xs font-bold"
                >
                  نشان فعال
                </span>
              </div>
              <span style={{ color: 'var(--primary-color)' }} className="text-xs font-bold">
                هماهنگ با رنگ انتخابی شما
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازگشت به رنگ قرمز پیش‌فرض
          </button>

          <button
            onClick={() => setThemeModalOpen(false)}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition hover:opacity-90"
          >
            بستن و تایید
          </button>
        </div>
      </div>
    </div>
  );
};
