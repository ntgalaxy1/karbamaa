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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden my-6 ${
          theme === 'light'
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-slate-900 border-slate-700/80 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200'
              : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl border ${
                theme === 'light'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-600/20 text-red-400 border-red-500/30'
              }`}
            >
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h3 className={`font-extrabold text-base ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                شخصی‌سازی رنگ تم برنامه
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                تغییر رنگ اصلی دکمه‌ها، آیکون‌ها و نشان‌ها در سراسر کارباما
              </p>
            </div>
          </div>
          <button
            onClick={() => setThemeModalOpen(false)}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Light / Dark Mode Quick Switch */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div>
              <span className={`text-xs font-bold block ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                حالت نمایش کلی (تاریک / روشن)
              </span>
              <span className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                در حال حاضر: {theme === 'dark' ? 'حالت شب (تاریک)' : 'حالت روز (روشن)'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-2xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>تغییر به روشن</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-700" />
                  <span>تغییر به تاریک</span>
                </>
              )}
            </button>
          </div>

          {/* Color Presets Palette */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                <Sparkles className={`w-4 h-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                رنگ‌های پیش‌فرض و محبوب:
              </h4>
              <span className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                انتخاب سریع با یک کلیک
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEME_COLOR_PRESETS.map((preset) => {
                const isSelected = themeColor === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`relative p-3 rounded-2xl border text-right transition flex flex-col items-start gap-2 cursor-pointer ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/30'
                          : 'bg-slate-800/90 border-amber-400 shadow-lg ring-2 ring-amber-400/30'
                        : theme === 'light'
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center border-2 border-white/60"
                        style={{ backgroundColor: preset.primary }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}
                        dir="ltr"
                      >
                        {preset.primary}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold block truncate ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {preset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Wheel / Hex Input */}
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                <Sliders className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
                انتخاب هر رنگ دلخواه و سفارشی (Custom Color):
              </h4>
              {themeColor === 'custom' && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    theme === 'light'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
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
                  className={`w-12 h-11 rounded-xl cursor-pointer border p-1 ${
                    theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                  }`}
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
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-blue-500 ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-900 border-slate-700 text-white placeholder-slate-600'
                  }`}
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition hover:opacity-90 cursor-pointer"
              >
                اعمال رنگ
              </button>
            </form>
          </div>

          {/* Live Preview Card with Dynamic Top Bar Preview */}
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <span className={`text-xs font-bold flex items-center gap-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
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
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            onClick={handleReset}
            className={`text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              theme === 'light'
                ? 'text-slate-700 hover:text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازگشت به رنگ قرمز پیش‌فرض
          </button>

          <button
            onClick={() => setThemeModalOpen(false)}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition hover:opacity-90 cursor-pointer"
          >
            بستن و تایید
          </button>
        </div>
      </div>
    </div>
  );
};
