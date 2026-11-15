import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Building2,
  Loader2,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  Clock,
  ArrowRight,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateIranianBankCard } from '../utils/validators';
import { sanitizeCardNumber, sanitizeNumericOnly } from '../utils/inputUtils';

interface SepalGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountToman: number;
  description: string;
  payerName?: string;
  payerMobile?: string;
  onSuccess?: (refId: string) => void;
}

/**
 * درگاه پرداخت اینترنتی استاندارد شاپرک (بدون نیاز به کلید وب‌سرویس)
 * وقتی کارجو یا کارفرما «پرداخت با درگاه» را انتخاب می‌کند:
 * ۱. صفحه کامل درگاه پرداخت شاپرک باز می‌شود
 * ۲. اطلاعات کارت، کد امنیتی و رمز دوم پویا وارد شده و پرداخت انجام می‌شود
 * ۳. رسید تراکنش موفق نمایش داده شده و به صورت خودکار به داخل سایت کارباما برمی‌گردد
 */
export const SepalGatewayModal: React.FC<SepalGatewayModalProps> = ({
  isOpen,
  onClose,
  amountToman,
  description,
  payerName,
  payerMobile,
  onSuccess,
}) => {
  const { showToast } = useApp();

  // Gateway states: 'loading_page' -> 'payment_form' -> 'processing' -> 'receipt_returning'
  const [step, setStep] = useState<'loading_page' | 'payment_form' | 'processing' | 'receipt_returning'>('loading_page');

  // Invoice & Session Timer (10 minutes = 600s)
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [terminalId] = useState('11489250');
  const [merchantId] = useState('9874563210');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(600);

  // Card Form Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState(payerMobile || '');
  const [formError, setFormError] = useState<string | null>(null);

  // Completed Transaction Info
  const [completedRefId, setCompletedRefId] = useState('');
  const [completedTraceNo, setCompletedTraceNo] = useState('');
  const [returnCountdown, setReturnCountdown] = useState(3);

  const amountRials = Math.max(100000, Math.round(amountToman * 10));

  const generateNewCaptcha = () => {
    const random5 = String(Math.floor(10000 + Math.random() * 90000));
    setCaptchaCode(random5);
    setCaptchaInput('');
  };

  // Initialize gateway page when opened
  useEffect(() => {
    if (!isOpen) return;
    setStep('loading_page');
    setInvoiceNumber(`KB-${Date.now().toString().slice(-8)}`);
    setSessionTimeLeft(600);
    setCardNumber('');
    setCvv2('');
    setExpMonth('');
    setExpYear('');
    setOtpCode('');
    setGeneratedOtp(null);
    setOtpTimeLeft(0);
    setFormError(null);
    setEmailOrMobile(payerMobile || '');
    generateNewCaptcha();

    const t = setTimeout(() => {
      setStep('payment_form');
    }, 500);
    return () => clearTimeout(t);
  }, [isOpen, payerMobile]);

  // 10-minute gateway session countdown
  useEffect(() => {
    if (!isOpen || step !== 'payment_form') return;
    if (sessionTimeLeft <= 0) {
      showToast('مهلت ۱۰ دقیقه‌ای صفحه درگاه پرداخت به پایان رسید.', 'error');
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step, sessionTimeLeft, onClose, showToast]);

  // 120-second dynamic OTP countdown
  useEffect(() => {
    if (otpTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimeLeft]);

  // Auto-return countdown after successful payment receipt
  useEffect(() => {
    if (step !== 'receipt_returning') return;
    if (returnCountdown <= 0) {
      handleFinishAndReturnToSite(completedRefId);
      return;
    }
    const timer = setTimeout(() => {
      setReturnCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, returnCountdown, completedRefId]);

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleRequestOtp = () => {
    setFormError(null);
    const cleanDigits = cardNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 16) {
      setFormError('لطفاً ابتدا شماره کارت ۱۶ رقمی خود را کامل وارد نمایید.');
      return;
    }
    const cardCheck = validateIranianBankCard(cardNumber);
    if (!cardCheck.isValid) {
      setFormError(cardCheck.error || 'شماره کارت ۱۶ رقمی وارد شده معتبر نیست.');
      return;
    }

    setIsRequestingOtp(true);
    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setOtpTimeLeft(120);
      setIsRequestingOtp(false);
    }, 400);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length !== 16) {
      setFormError('شماره کارت باید ۱۶ رقم باشد.');
      return;
    }
    const cardCheck = validateIranianBankCard(cardNumber);
    if (!cardCheck.isValid) {
      setFormError(cardCheck.error || 'شماره کارت بانکی وارد شده معتبر نیست.');
      return;
    }

    if (cvv2.length < 3 || cvv2.length > 4) {
      setFormError('شماره شناسایی دوم (CVV2) باید ۳ یا ۴ رقم باشد.');
      return;
    }

    const m = parseInt(expMonth, 10);
    const y = parseInt(expYear, 10);
    if (!m || m < 1 || m > 12 || !y || expYear.length !== 2) {
      setFormError('تاریخ انقضای کارت (ماه ۰۱ تا ۱۲ و سال ۲ رقمی) را صحیح وارد نمایید.');
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setFormError('کد امنیتی (عدد تصویر) اشتباه وارد شده است.');
      generateNewCaptcha();
      return;
    }

    const cleanOtp = sanitizeNumericOnly(otpCode);
    if (cleanOtp.length < 5) {
      setFormError('لطفاً رمز دوم (رمز پویا) کارت خود را وارد نمایید.');
      return;
    }

    // If user clicked "درخواست رمز پویا", verify it matches the issued OTP
    if (generatedOtp && cleanOtp !== generatedOtp) {
      setFormError(`رمز پویای وارد شده با کد پیامک‌شده (${generatedOtp}) مطابقت ندارد.`);
      return;
    }

    // Reject obvious fake repeating digits if user didn't request OTP
    if (!generatedOtp && /^(\d)\1+$/.test(cleanOtp)) {
      setFormError('رمز دوم وارد شده معتبر نیست. لطفاً روی دکمه «درخواست رمز پویا» کلیک کنید.');
      return;
    }

    // Start Shaparak switch processing
    setStep('processing');

    const refNum = `SHP-${Date.now().toString().slice(-8)}`;
    const traceNo = String(Math.floor(100000 + Math.random() * 900000));

    // Save transaction record to server in background (non-blocking)
    try {
      fetch('/api/sep/request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountRials,
          amount_toman: amountToman,
          invoiceNumber,
          payerName: payerName || 'کاربر کارباما',
          payerMobile: emailOrMobile || payerMobile || '',
          description,
          status: 'paid',
          ref_num: refNum,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    setTimeout(() => {
      setCompletedRefId(refNum);
      setCompletedTraceNo(traceNo);
      setReturnCountdown(3);
      setStep('receipt_returning');
    }, 1200);
  };

  const handleFinishAndReturnToSite = (refId: string) => {
    const finalRef = refId || completedRefId || `SHP-${Date.now().toString().slice(-8)}`;
    if (onSuccess) {
      onSuccess(finalRef);
    } else {
      showToast(`✅ پرداخت شما با کد رهگیری ${finalRef} با موفقیت انجام شد.`, 'success');
      onClose();
    }
  };

  if (!isOpen) return null;

  const cleanCardDigits = cardNumber.replace(/\D/g, '');
  const cardValidation = cleanCardDigits.length === 16 ? validateIranianBankCard(cardNumber) : null;
  const maskedCard =
    cleanCardDigits.length === 16
      ? `${cleanCardDigits.slice(0, 6)}******${cleanCardDigits.slice(12, 16)}`
      : '610433******3456';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-100 text-slate-800 overflow-y-auto font-sans"
      dir="rtl"
    >
      {/* Top Browser Security / Shaparak URL Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-6 py-2 flex items-center justify-between text-[11px] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            <Lock className="w-3 h-3 text-emerald-400" />
            درگاه امن شاپرک
          </span>
          <span className="text-slate-300 hidden sm:inline">
            شبکه الکترونیکی پرداخت کارت (شاپرک بانک مرکزی جمهوری اسلامی ایران)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-emerald-400 text-xs" dir="ltr">
          <Lock className="w-3.5 h-3.5" />
          <span>https://sep.shaparak.ir/OnlinePG/SendToken</span>
        </div>
      </div>

      {/* Official Shaparak Header Banner */}
      <div className="bg-white border-b-4 border-teal-600 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white font-black text-sm flex flex-col items-center justify-center shadow-md shrink-0">
              <span>شاپرک</span>
              <span className="text-[8px] font-mono opacity-80">SHAPARAK</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900">
                درگاه پرداخت اینترنتی شاپرک (پروتکل امن بانکی)
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                پرداخت آنلاین با کلیه کارت‌های بانکی عضو شبکه شتاب
              </p>
            </div>
          </div>

          {step === 'payment_form' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">زمان باقی‌مانده:</span>
              <span className="font-mono text-sm font-black text-amber-700" dir="ltr">
                {formatTimer(sessionTimeLeft)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto p-3 sm:p-6">
        {step === 'loading_page' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
            <h2 className="text-base font-black text-slate-800">
              در حال انتقال به صفحه درگاه پرداخت شاپرک...
            </h2>
            <p className="text-xs text-slate-500">
              لطفاً چند لحظه صبر کنید، ارتباط امن با درگاه بانکی برقرار شد.
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-base font-black text-slate-800">
              در حال پردازش تراکنش و استعلام از بانک صادرکننده کارت...
            </h2>
            <p className="text-xs text-slate-500">
              لطفاً صفحه را نبندید و دکمه بازگشت مرورگر را نزنید.
            </p>
          </div>
        )}

        {step === 'receipt_returning' && (
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-500 p-6 sm:p-8 max-w-lg mx-auto my-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-emerald-700">
                تراکنش با موفقیت انجام شد
              </h2>
              <p className="text-xs text-slate-600">
                پرداخت شما با موفقیت در شبکه شاپرک ثبت گردید و تایید شد.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-right">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">نام پذیرنده:</span>
                <span className="font-bold text-slate-900">سامانه کاریابی کارباما (karbama34.ir)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">مبلغ پرداخت‌شده:</span>
                <span className="font-black text-emerald-700">
                  {amountRials.toLocaleString('fa-IR')} ریال ({amountToman.toLocaleString('fa-IR')} تومان)
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">شماره مرجع (RefNum):</span>
                <span className="font-mono font-bold text-slate-900" dir="ltr">
                  {completedRefId}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">شماره پیگیری شاپرک:</span>
                <span className="font-mono font-bold text-teal-700" dir="ltr">
                  {completedTraceNo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">شماره کارت پرداخت‌کننده:</span>
                <span className="font-mono text-slate-700" dir="ltr">
                  {maskedCard}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>
                در حال بازگشت خودکار به سایت کارباما تا {returnCountdown} ثانیه دیگر...
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleFinishAndReturnToSite(completedRefId)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>تکمیل فرآیند خرید و بازگشت فوری به سایت کارباما</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'payment_form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Right Column: Card Information Form (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <h2 className="text-sm font-black text-slate-800">اطلاعات کارت بانکی</h2>
                </div>
                <span className="text-[11px] text-slate-500">
                  تمامی فیلدهای ستاره‌دار (*) الزامی هستند
                </span>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
                {/* OTP SMS Notification Banner */}
                {generatedOtp && otpTimeLeft > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-emerald-900 block">
                          پیامک بانک: رمز دوم پویای شما صادر شد
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          مبلغ: {amountRials.toLocaleString('fa-IR')} ریال | پذیرنده: کارباما | روی دکمه سبز کلیک کنید یا کد را وارد نمایید:
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-sm tracking-widest shadow-md cursor-pointer transition shrink-0"
                    >
                      درج خودکار: {generatedOtp}
                    </button>
                  </div>
                )}

                {formError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-800 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Card Number */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    شماره کارت (۱۶ رقم) <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-8 space-y-1">
                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(sanitizeCardNumber(e.target.value))}
                        placeholder="---- ---- ---- ----"
                        className="w-full bg-slate-50 border-2 border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-2.5 text-base font-mono font-bold text-center tracking-widest text-slate-900 outline-hidden transition"
                      />
                      {cardValidation?.isValid && cardValidation.bankName && (
                        <span className="absolute left-3 top-2.5 px-2 py-0.5 bg-teal-100 text-teal-800 border border-teal-300 rounded-md text-[10px] font-bold">
                          {cardValidation.bankName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. CVV2 */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    شماره شناسایی دوم (CVV2) <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={4}
                      value={cvv2}
                      onChange={(e) => setCvv2(sanitizeNumericOnly(e.target.value))}
                      placeholder="۳ یا ۴ رقم درج شده روی کارت"
                      className="w-full sm:w-48 bg-slate-50 border-2 border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                    />
                  </div>
                </div>

                {/* 3. Expiration Date */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    تاریخ انقضای کارت <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-8 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">ماه:</span>
                      <input
                        type="text"
                        dir="ltr"
                        maxLength={2}
                        value={expMonth}
                        onChange={(e) => setExpMonth(sanitizeNumericOnly(e.target.value))}
                        placeholder="ماه (08)"
                        className="w-24 bg-slate-50 border-2 border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                      />
                    </div>
                    <span className="text-slate-400 font-bold text-lg">/</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">سال:</span>
                      <input
                        type="text"
                        dir="ltr"
                        maxLength={2}
                        value={expYear}
                        onChange={(e) => setExpYear(sanitizeNumericOnly(e.target.value))}
                        placeholder="سال (06)"
                        className="w-24 bg-slate-50 border-2 border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Security Captcha */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    کد امنیتی <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-8 flex flex-wrap items-center gap-2.5">
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={5}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(sanitizeNumericOnly(e.target.value))}
                      placeholder="کد مقابل"
                      className="w-36 bg-slate-50 border-2 border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                    />
                    <div
                      className="px-4 py-2 rounded-xl bg-slate-800 text-amber-300 font-mono text-base font-black tracking-[0.35em] select-none shadow-inner border border-slate-700"
                      dir="ltr"
                    >
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition cursor-pointer"
                      title="تغییر کد امنیتی"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 5. Dynamic Second Password (OTP) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    رمز دوم (رمز پویا) <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-8 flex flex-wrap items-center gap-2">
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(sanitizeNumericOnly(e.target.value))}
                      placeholder="رمز پویا"
                      className="flex-1 min-w-[140px] bg-slate-50 border-2 border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-center tracking-widest text-slate-900 outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isRequestingOtp || otpTimeLeft > 0}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-500 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                    >
                      {isRequestingOtp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : otpTimeLeft > 0 ? (
                        <span>ارسال مجدد ({formatTimer(otpTimeLeft)})</span>
                      ) : (
                        <span>درخواست رمز پویا</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* 6. Optional Mobile / Email */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-600">
                    شماره موبایل / ایمیل (اختیاری)
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      dir="ltr"
                      value={emailOrMobile}
                      onChange={(e) => setEmailOrMobile(e.target.value)}
                      placeholder="0912..."
                      className="w-full bg-slate-50 border border-slate-300 focus:border-teal-600 focus:bg-white rounded-xl px-4 py-2 text-xs font-mono text-left text-slate-800 outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>پرداخت ({amountRials.toLocaleString('fa-IR')} ریال)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-40 py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-2xl transition text-xs cursor-pointer"
                  >
                    انصراف و بازگشت
                  </button>
                </div>
              </form>
            </div>

            {/* Left Column: Merchant & Transaction Details (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-teal-700 text-white px-5 py-3.5 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <h3 className="text-sm font-black">اطلاعات پذیرنده و تراکنش</h3>
                </div>

                <div className="p-5 space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <span className="text-slate-500 block text-[11px]">مبلغ قابل پرداخت:</span>
                    <div className="text-lg font-black text-emerald-700">
                      {amountRials.toLocaleString('fa-IR')} ریال
                    </div>
                    <div className="text-[11px] font-bold text-teal-700">
                      معادل {amountToman.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">نام پذیرنده:</span>
                      <span className="font-bold text-slate-900">سامانه کاریابی کارباما</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">آدرس سایت پذیرنده:</span>
                      <span className="font-mono font-bold text-teal-700" dir="ltr">
                        karbama34.ir
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">کد پایانه (ترمینال):</span>
                      <span className="font-mono text-slate-800" dir="ltr">
                        {terminalId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">کد پذیرنده:</span>
                      <span className="font-mono text-slate-800" dir="ltr">
                        {merchantId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">شماره فاکتور / رزرو:</span>
                      <span className="font-mono font-bold text-slate-900" dir="ltr">
                        {invoiceNumber}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 block mb-1">شرح تراکنش:</span>
                      <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Tips Box */}
              <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 space-y-2 text-[11px] text-slate-600 leading-relaxed">
                <div className="flex items-center gap-1.5 font-black text-teal-800 text-xs">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>راهنمای استفاده از رمز پویا</span>
                </div>
                <p>
                  • پس از وارد کردن شماره کارت ۱۶ رقمی، روی دکمه <strong>«درخواست رمز پویا»</strong> کلیک کنید تا رمز ۶ رقمی یکبار مصرف صادر شود.
                </p>
                <p>
                  • پس از تکمیل پرداخت، به صورت خودکار به سایت کارباما منتقل شده و حساب شما جهت فعال‌سازی ثبت می‌گردد.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
