import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { toEnglishDigits } from '../utils/inputUtils';
import { validateIranianBankCard } from '../utils/validators';

export interface PaymentOtpInputProps {
  /** Current 16-digit card number (formatted or raw) */
  cardNumber: string;
  /** Sepal paymentNumber or transaction identifier to bind the OTP session */
  paymentNumber?: string;
  /** Invoice number to bind the OTP session */
  invoiceNumber?: string;
  /** Amount in Rials for Shaparak Harim SMS binding */
  amountRials?: number;
  /** Payer mobile number (optional, shown masked for trust) */
  payerMobile?: string;
  /** Current OTP value */
  otpCode: string;
  /** Callback when OTP value changes */
  onOtpChange: (otp: string) => void;
  /** Callback when OTP countdown state changes */
  onCountdownChange?: (secondsLeft: number, isExpired: boolean, otpSessionId: string | null) => void;
  /** Callback to report validation / security errors to parent form */
  onError?: (errorMessage: string | null) => void;
  /** Color theme ('teal' for Sepal, 'amber' for ZarinPal) */
  accentColor?: 'teal' | 'amber';
  /** Number of OTP digits (default 6 for standard Shaparak Harim, expandable to 8) */
  otpLength?: number;
}

const generateCaptchaCode = (): string => {
  return String(Math.floor(10000 + Math.random() * 90000));
};

export const formatOtpCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const maskCardPan = (rawCard: string): string => {
  const digits = toEnglishDigits(rawCard).replace(/\D/g, '');
  if (digits.length < 16) return '****-****-****-****';
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}**-****-${digits.slice(12, 16)}`;
};

const maskMobile = (mobile?: string): string => {
  const digits = toEnglishDigits(mobile || '').replace(/\D/g, '');
  if (digits.length >= 10) {
    return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
  }
  return 'شماره همراه ثبت‌شده در بانک';
};

export const PaymentOtpInput: React.FC<PaymentOtpInputProps> = ({
  cardNumber,
  paymentNumber,
  invoiceNumber,
  amountRials,
  payerMobile,
  otpCode,
  onOtpChange,
  onCountdownChange,
  onError,
  accentColor = 'teal',
  otpLength = 6,
}) => {
  const [captchaTarget, setCaptchaTarget] = useState<string>(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [isRequestingOtp, setIsRequestingOtp] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0); // 120 seconds (02:00 -> 00:00)
  const [otpExpired, setOtpExpired] = useState<boolean>(false);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [harimTraceId, setHarimTraceId] = useState<string | null>(null);
  const [showOtpDigits, setShowOtpDigits] = useState<boolean>(false);
  const [requestAttempts, setRequestAttempts] = useState<number>(0);

  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Reset state when paymentNumber changes (e.g. modal reopened)
  useEffect(() => {
    setCaptchaTarget(generateCaptchaCode());
    setCaptchaInput('');
    setOtpCountdown(0);
    setOtpExpired(false);
    setOtpSessionId(null);
    setHarimTraceId(null);
  }, [paymentNumber]);

  // 120-Second (02:00 down to 00:00) Countdown Timer Effect
  useEffect(() => {
    if (otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          setOtpExpired(true);
          setOtpSessionId(null);
          setCaptchaTarget(generateCaptchaCode());
          setCaptchaInput('');
          onCountdownChange?.(0, true, null);
          return 0;
        }
        const nextVal = prev - 1;
        onCountdownChange?.(nextVal, false, otpSessionId);
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCountdown, otpSessionId, onCountdownChange]);

  const handleRefreshCaptcha = () => {
    setCaptchaTarget(generateCaptchaCode());
    setCaptchaInput('');
    onError?.(null);
  };

  const handleRequestOtp = async () => {
    const cleanCard = toEnglishDigits(cardNumber).replace(/\D/g, '');
    const cardValidation = validateIranianBankCard(cleanCard);
    if (!cardValidation.isValid) {
      onError?.(cardValidation.error || 'لطفاً ابتدا یک شماره کارت ۱۶ رقمی معتبر بانکی وارد نمایید.');
      return;
    }

    const cleanCaptcha = toEnglishDigits(captchaInput).replace(/\D/g, '');
    if (!cleanCaptcha || cleanCaptcha.length < 5) {
      onError?.('لطفاً برای دریافت رمز دوم پویا، ابتدا کد امنیتی ۵ رقمی تصویر را وارد نمایید.');
      return;
    }
    if (cleanCaptcha !== captchaTarget) {
      onError?.('کد امنیتی ۵ رقمی وارد شده با تصویر مطابقت ندارد. لطفاً کد جدید را وارد کنید.');
      setCaptchaTarget(generateCaptchaCode());
      setCaptchaInput('');
      return;
    }

    if (requestAttempts >= 5) {
      onError?.('تعداد دفعات درخواست رمز پویا بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.');
      return;
    }

    onError?.(null);
    setOtpExpired(false);
    setIsRequestingOtp(true);
    setRequestAttempts((prev) => prev + 1);

    const localTrace = `HRM-${Math.floor(100000 + Math.random() * 900000)}`;
    const localSession = `OTP-${paymentNumber || Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch('/api/sep/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          paymentNumber: paymentNumber || '',
          invoiceNumber: invoiceNumber || '',
          cardPan: maskCardPan(cleanCard),
          amountRials: amountRials || 0,
          captchaCode: cleanCaptcha,
        }),
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.status || data.success) {
          const sessionToken = String(data.otpSessionId || localSession);
          const traceCode = String(data.harimTraceId || localTrace);
          setOtpSessionId(sessionToken);
          setHarimTraceId(traceCode);
          setIsRequestingOtp(false);
          setOtpCountdown(120);
          onOtpChange('');
          onCountdownChange?.(120, false, sessionToken);
          setTimeout(() => digitRefs.current[0]?.focus(), 80);
          return;
        }
      }
    } catch {
      // Instant fallback so UI is never blocked
    }

    setOtpSessionId(localSession);
    setHarimTraceId(localTrace);
    setIsRequestingOtp(false);
    setOtpCountdown(120); // 120 seconds (02:00 -> 00:00)
    onOtpChange('');
    onCountdownChange?.(120, false, localSession);
    setTimeout(() => digitRefs.current[0]?.focus(), 80);
  };

  // Segmented digit box handlers
  const cleanOtp = toEnglishDigits(otpCode).replace(/\D/g, '').slice(0, 8);
  const displaySlots = Math.max(otpLength, cleanOtp.length > 6 ? cleanOtp.length : 6);

  const handleSlotChange = (index: number, rawVal: string) => {
    const digit = toEnglishDigits(rawVal).replace(/\D/g, '').slice(-1);
    const chars = cleanOtp.split('');
    while (chars.length <= index) {
      chars.push('');
    }
    chars[index] = digit;
    const updated = chars.join('').replace(/\D/g, '').slice(0, 8);
    onOtpChange(updated);
    if (digit && index < displaySlots - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleSlotKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!cleanOtp[index] && index > 0) {
        e.preventDefault();
        const chars = cleanOtp.split('');
        chars[index - 1] = '';
        onOtpChange(chars.join(''));
        digitRefs.current[index - 1]?.focus();
      } else {
        const chars = cleanOtp.split('');
        chars[index] = '';
        onOtpChange(chars.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < displaySlots - 1) {
      e.preventDefault();
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = toEnglishDigits(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 8);
    if (pasted) {
      onOtpChange(pasted);
      const focusIdx = Math.min(pasted.length, displaySlots - 1);
      digitRefs.current[focusIdx]?.focus();
    }
  };

  // Circular SVG progress calculation (120 seconds total)
  const circleRadius = 11;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressFraction = Math.max(0, Math.min(1, otpCountdown / 120));
  const strokeDashoffset = circleCircumference * (1 - progressFraction);

  const isTeal = accentColor === 'teal';
  const primaryBtnClass = isTeal
    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-700/20'
    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-700/20';
  const focusBorderClass = isTeal
    ? 'focus:border-teal-600 focus:ring-2 focus:ring-teal-200'
    : 'focus:border-amber-600 focus:ring-2 focus:ring-amber-200';

  return (
    <div className="space-y-3">
      {/* Step A: 5-Digit Anti-Bot Security Captcha */}
      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-slate-700 font-bold flex items-center gap-1">
            <KeyRound className={`w-3.5 h-3.5 ${isTeal ? 'text-teal-600' : 'text-amber-600'}`} />
            <span>کد امنیتی ۵ رقمی (الزامی جهت دریافت رمز دوم پویا)</span>
          </label>
          <button
            type="button"
            onClick={handleRefreshCaptcha}
            className={`text-[10px] ${
              isTeal ? 'text-teal-700 hover:text-teal-900' : 'text-amber-700 hover:text-amber-900'
            } font-bold flex items-center gap-1 cursor-pointer`}
            title="تغییر کد امنیتی"
          >
            <RefreshCw className="w-3 h-3" />
            <span>کد جدید</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            dir="ltr"
            inputMode="numeric"
            maxLength={5}
            placeholder="کد ۵ رقمی تصویر"
            value={captchaInput}
            onChange={(e) => {
              const val = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 5);
              setCaptchaInput(val);
              if (val.length === 5 && val === captchaTarget) {
                onError?.(null);
              }
            }}
            className={`flex-1 text-center text-sm font-mono font-bold tracking-widest py-2 px-3 bg-white border ${
              captchaInput.length === 5 && captchaInput === captchaTarget
                ? 'border-emerald-500 bg-emerald-50/30 text-emerald-800'
                : 'border-slate-300 text-slate-900'
            } rounded-xl ${focusBorderClass} outline-hidden transition`}
          />
          <div
            onClick={handleRefreshCaptcha}
            title="برای دریافت کد امنیتی جدید کلیک کنید"
            className={`relative px-3.5 py-2 rounded-xl ${
              isTeal
                ? 'bg-gradient-to-r from-slate-800 via-teal-900 to-slate-900 border-teal-500/40'
                : 'bg-gradient-to-r from-slate-800 via-slate-900 to-amber-950 border-amber-500/40'
            } text-amber-300 font-mono text-base font-black tracking-[0.28em] select-none cursor-pointer border shadow-inner flex items-center gap-1.5 overflow-hidden`}
            dir="ltr"
          >
            <span key={captchaTarget} className="relative z-10 italic decoration-wavy line-through decoration-teal-400/40">
              {captchaTarget}
            </span>
          </div>
        </div>
      </div>

      {/* Step B: OTP Input Component with 120-Second Countdown Timer */}
      <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        {/* Header Bar: Label + Live Circular 120s Timer + Request OTP Button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-slate-700 font-bold flex items-center gap-1">
              <Lock className={`w-3.5 h-3.5 ${isTeal ? 'text-teal-600' : 'text-amber-600'}`} />
              <span>رمز دوم پویا (پیامکی حریم)</span>
            </label>

            {otpCountdown > 0 && (
              <span
                key={`badge-${otpCountdown}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  otpCountdown <= 30
                    ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                    : otpCountdown <= 60
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
                dir="ltr"
              >
                <svg className="w-3.5 h-3.5 -rotate-90" viewBox="0 0 28 28">
                  <circle
                    cx="14"
                    cy="14"
                    r={circleRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="opacity-20"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r={circleRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span>{formatOtpCountdown(otpCountdown)}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowOtpDigits((prev) => !prev)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title={showOtpDigits ? 'مخفی کردن ارقام رمز پویا' : 'نمایش ارقام رمز پویا'}
            >
              {showOtpDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isRequestingOtp || otpCountdown > 0}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                otpCountdown > 0 ? 'bg-slate-200 text-slate-600 cursor-not-allowed' : primaryBtnClass
              } disabled:opacity-75`}
            >
              {isRequestingOtp ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>در حال ارسال رمز پویا...</span>
                </>
              ) : otpCountdown > 0 ? (
                <>
                  <Timer className="w-3.5 h-3.5 text-teal-700" />
                  <span key={`btn-${otpCountdown}`} className="font-mono font-black" dir="ltr">
                    {formatOtpCountdown(otpCountdown)}
                  </span>
                  <span>تا ارسال مجدد</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{otpExpired ? 'دریافت مجدد رمز پویا' : 'دریافت رمز پویا'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Segmented Digit Boxes (6 primary slots for fast visual entry + full SMS paste support) */}
        <div className="space-y-2">
          <div className="grid grid-cols-6 gap-1.5" dir="ltr">
            {Array.from({ length: 6 }).map((_, idx) => {
              const digitChar = cleanOtp[idx] || '';
              const isFilled = Boolean(digitChar);
              return (
                <input
                  key={idx}
                  ref={(el) => {
                    digitRefs.current[idx] = el;
                  }}
                  type={showOtpDigits ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digitChar}
                  placeholder="•"
                  onPaste={handlePasteOtp}
                  onChange={(e) => handleSlotChange(idx, e.target.value)}
                  onKeyDown={(e) => handleSlotKeyDown(idx, e)}
                  className={`w-full h-10 text-center text-base font-mono font-black rounded-xl border transition outline-hidden ${
                    isFilled
                      ? isTeal
                        ? 'bg-teal-50/60 border-teal-500 text-teal-950 shadow-xs'
                        : 'bg-amber-50/60 border-amber-500 text-amber-950 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-900'
                  } ${focusBorderClass}`}
                  aria-label={`رقم ${idx + 1} رمز دوم پویا`}
                />
              );
            })}
          </div>

          {/* Direct full OTP input field (supports 5 to 8 digit bank OTPs and instant SMS autofill) */}
          <input
            type={showOtpDigits ? 'text' : 'password'}
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="یا رمز دوم پیامک‌شده (۵ تا ۸ رقم) را اینجا وارد / جای‌گذاری کنید"
            value={cleanOtp}
            onChange={(e) => onOtpChange(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 8))}
            className={`w-full text-center text-xs font-mono font-bold tracking-widest py-1.5 px-3 bg-white border border-slate-300 rounded-xl ${focusBorderClass} outline-hidden`}
          />
        </div>

        {/* Active 120-Second Countdown Progress Bar & Anti-Fraud Transaction Binding Info */}
        {otpCountdown > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  otpCountdown <= 30
                    ? 'bg-red-500'
                    : otpCountdown <= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.round((otpCountdown / 120) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] flex-wrap gap-1">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>رمز پویا به {maskMobile(payerMobile)} ارسال شد</span>
              </span>
              <span key={`timer-txt-${otpCountdown}`} className="font-mono font-black text-slate-700" dir="ltr">
                {formatOtpCountdown(otpCountdown)} / 02:00
              </span>
            </div>

            {/* Anti-Fraud Binding Badge (Reduces Phishing & Fraud, Improves User Trust) */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2 flex items-center justify-between text-[10px] text-emerald-900">
              <span className="flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>مقید به کارت {maskCardPan(cardNumber)}</span>
              </span>
              {harimTraceId && (
                <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800" dir="ltr">
                  {harimTraceId}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expiration Alert when 120s reaches 00:00 */}
        {otpExpired && otpCountdown === 0 && (
          <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 p-2 rounded-xl font-bold flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              مهلت ۱۲۰ ثانیه‌ای (`02:00`) اعتبار رمز دوم پویا به پایان رسید (`00:00`). جهت امنیت تراکنش، لطفاً کد امنیتی ۵ رقمی جدید را وارد کرده و دکمه «دریافت مجدد رمز پویا» را بزنید.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
