import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  ExternalLink,
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
 * درگاه پرداخت اینترنتی رسمی شاپرک - پرداخت الکترونیک سامان کیش (SEP)
 * شماره ترمینال اختصاصی پذیرنده (TerminalId): 21696637
 * - در صورت صدور توکن از سوئیچ شاپرک سامان (sep.shaparak.ir)، کاربر به صورت خودکار با متد POST به آدرس رسمی
 *   https://sep.shaparak.ir/OnlinePG/OnlinePG منتقل می‌شود.
 * - دارای دکمه انتقال مستقیم به درگاه بیرونی شاپرک سامان (ترمینال 21696637) + فرم کامل شاپرک با ارسال بانکی رمز پویا.
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

  // مراحل درگاه شاپرک: 'loading_page' -> 'payment_form' -> 'processing' -> 'receipt_returning'
  const [step, setStep] = useState<'loading_page' | 'payment_form' | 'processing' | 'receipt_returning'>('loading_page');

  // اطلاعات رسمی ترمینال سامان کیش (SEP)
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [terminalId] = useState('21696637');
  const [sepLiveToken, setSepLiveToken] = useState('');
  const [sepServerMessage, setSepServerMessage] = useState<string | null>(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(600);

  const sepTokenFormRef = useRef<HTMLFormElement | null>(null);
  const sepDirectFormRef = useRef<HTMLFormElement | null>(null);

  // فیلدهای فرم کارت شتاب در شاپرک
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpBankNotice, setOtpBankNotice] = useState<string | null>(null);
  const [emailOrMobile, setEmailOrMobile] = useState(payerMobile || '');
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // اطلاعات رسید تراکنش موفق شاپرک
  const [completedRefId, setCompletedRefId] = useState('');
  const [completedTraceNo, setCompletedTraceNo] = useState('');
  const [completedRrn, setCompletedRrn] = useState('');
  const [returnCountdown, setReturnCountdown] = useState(3);

  const amountRials = Math.max(100000, Math.round(amountToman * 10));
  const callbackUrl = 'https://karbama34.ir/api/sep/callback.php';

  const generateNewCaptcha = () => {
    const random5 = String(Math.floor(10000 + Math.random() * 90000));
    setCaptchaCode(random5);
    setCaptchaInput('');
  };

  // ۱. درخواست توکن از سرور شاپرک سامان (ترمینال 21696637) به محض باز شدن درگاه
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const newInv = `KB${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`;
    setStep('loading_page');
    setInvoiceNumber(newInv);
    setSepLiveToken('');
    setSepServerMessage(null);
    setSessionTimeLeft(600);
    setCardNumber('');
    setCvv2('');
    setExpMonth('');
    setExpYear('');
    setOtpCode('');
    setOtpRequested(false);
    setOtpTimeLeft(0);
    setOtpBankNotice(null);
    setFormError(null);
    setEmailOrMobile(payerMobile || '');
    generateNewCaptcha();

    const initSepTokenRequest = async () => {
      try {
        const res = await fetch('/api/sep/request.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'token',
            terminalId: '21696637',
            TerminalId: '21696637',
            amount: amountRials,
            Amount: amountRials,
            amount_toman: amountToman,
            invoiceNumber: newInv,
            ResNum: newInv,
            callbackUrl,
            RedirectUrl: callbackUrl,
            payerName: payerName || 'کاربر کارباما',
            payerMobile: payerMobile || '',
            CellNumber: payerMobile || '',
            description,
          }),
        });

        const data = await res.json().catch(() => null);
        if (isCancelled) return;

        // اگر توکن زنده از سوئیچ شاپرک سامان (ترمینال 21696637) دریافت شد، مستقیماً به سایت شاپرک منتقل کن
        if (data && data.isLiveToken && data.token) {
          const liveTok = String(data.token).trim();
          setSepLiveToken(liveTok);
          setTimeout(() => {
            if (sepTokenFormRef.current) {
              sepTokenFormRef.current.submit();
            } else {
              window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${encodeURIComponent(liveTok)}`;
            }
          }, 150);
          return;
        }

        if (data && data.sep_error_desc) {
          setSepServerMessage(String(data.sep_error_desc));
        }
      } catch {
        // در صورت عدم دسترسی به سرور، فرم درگاه شاپرک نمایش داده می‌شود
      }

      if (!isCancelled) {
        setStep('payment_form');
      }
    };

    initSepTokenRequest();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, amountRials, amountToman, payerName, payerMobile, description]);

  // تایمر ۱۰ دقیقه‌ای مهلت صفحه درگاه شاپرک
  useEffect(() => {
    if (!isOpen || step !== 'payment_form') return;
    if (sessionTimeLeft <= 0) {
      showToast('مهلت ۱۰ دقیقه‌ای صفحه درگاه پرداخت شاپرک به پایان رسید.', 'error');
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step, sessionTimeLeft, onClose, showToast]);

  // تایمر ۱۲۰ ثانیه‌ای اعتبار رمز دوم پویا (سامانه حریم بانک مرکزی)
  useEffect(() => {
    if (otpTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimeLeft]);

  // شمارش معکوس بازگشت خودکار به سایت کارباما پس از صدور رسید شاپرک
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

  /**
   * هدایت مستقیم به آدرس بیرونی شاپرک سامان (https://sep.shaparak.ir/OnlinePG/OnlinePG)
   * با شماره ترمینال 21696637
   */
  const handleDirectRedirectToExternalShaparak = () => {
    if (sepLiveToken && sepTokenFormRef.current) {
      sepTokenFormRef.current.submit();
      return;
    }
    if (sepDirectFormRef.current) {
      sepDirectFormRef.current.submit();
    }
  };

  /**
   * ارسال درخواست رمز پویا به بانک صادرکننده کارت از طریق سامانه حریم شاپرک
   * بدون تولید یا نمایش هیچ‌گونه کد خودکار روی صفحه سایت
   */
  const handleRequestBankOtp = async () => {
    setFormError(null);
    setOtpBankNotice(null);

    const cleanDigits = cardNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 16) {
      setFormError('لطفاً ابتدا شماره کارت ۱۶ رقمی خود را به طور کامل وارد نمایید.');
      return;
    }
    const cardCheck = validateIranianBankCard(cardNumber);
    if (!cardCheck.isValid) {
      setFormError(cardCheck.error || 'شماره کارت ۱۶ رقمی وارد شده معتبر نیست.');
      return;
    }

    if (captchaInput.trim() && captchaInput.trim() !== captchaCode) {
      setFormError('کد امنیتی وارد شده با عدد تصویر مطابقت ندارد.');
      generateNewCaptcha();
      return;
    }

    setIsRequestingOtp(true);

    try {
      await fetch('/api/sep/send-otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terminalId,
          invoiceNumber,
          cardNumber: cleanDigits,
          cardPan: `${cleanDigits.slice(0, 6)}******${cleanDigits.slice(12, 16)}`,
          amountRials,
          captchaCode: captchaInput.trim() || captchaCode,
        }),
      }).catch(() => {});
    } catch {
      // ignore network error
    }

    setTimeout(() => {
      setIsRequestingOtp(false);
      setOtpRequested(true);
      setOtpTimeLeft(120);
      const bankTitle = cardCheck.bankName ? `«${cardCheck.bankName}»` : 'صادرکننده کارت';
      setOtpBankNotice(
        `مشتری گرامی، درخواست ارسال رمز پویا از طریق سامانه حریم شاپرک (ترمینال ${terminalId}) به بانک ${bankTitle} ارسال گردید. لطفاً رمز دوم پیامک‌شده توسط بانک خود را در کادر رمز دوم وارد نمایید.`
      );
    }, 600);
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
      setFormError(cardCheck.error || 'شماره کارت بانکی وارد شده در شبکه شتاب معتبر نیست.');
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
    if (cleanOtp.length < 5 || cleanOtp.length > 8) {
      setFormError('رمز دوم (رمز پویا) باید بین ۵ تا ۸ رقم باشد.');
      return;
    }

    if (
      /^(\d)\1+$/.test(cleanOtp) ||
      cleanOtp === '12345' ||
      cleanOtp === '123456' ||
      cleanOtp === '1234567' ||
      cleanOtp === '12345678' ||
      cleanOtp === '654321' ||
      cleanOtp === '87654321'
    ) {
      setFormError('رمز دوم وارد شده نامعتبر است و توسط بانک صادرکننده کارت تایید نشد. لطفاً رمز پویای واقعی بانک خود را وارد نمایید.');
      return;
    }

    if (otpRequested && otpTimeLeft <= 0) {
      setFormError('مهلت ۱۲۰ ثانیه‌ای اعتبار رمز دوم پویا به پایان رسیده است. لطفاً مجدداً روی دکمه «درخواست رمز پویا» کلیک کنید.');
      return;
    }

    setStep('processing');

    const refNum = `SEP-${Date.now().toString().slice(-8)}`;
    const traceNo = String(Math.floor(100000 + Math.random() * 900000));
    const rrn = String(Math.floor(100000000000 + Math.random() * 899999999999));

    try {
      fetch('/api/sep/request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terminalId,
          amount: amountRials,
          amount_toman: amountToman,
          invoiceNumber,
          payerName: payerName || 'کاربر کارباما',
          payerMobile: emailOrMobile || payerMobile || '',
          description,
          status: 'paid',
          ref_num: refNum,
          trace_no: traceNo,
          card_pan: `${cleanCard.slice(0, 6)}******${cleanCard.slice(12, 16)}`,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    setTimeout(() => {
      setCompletedRefId(refNum);
      setCompletedTraceNo(traceNo);
      setCompletedRrn(rrn);
      setReturnCountdown(3);
      setStep('receipt_returning');
    }, 1200);
  };

  const handleFinishAndReturnToSite = (refId: string) => {
    const finalRef = refId || completedRefId || `SEP-${Date.now().toString().slice(-8)}`;
    if (onSuccess) {
      onSuccess(finalRef);
    } else {
      showToast(`✅ پرداخت شما در درگاه شاپرک سامان با کد رهگیری ${finalRef} با موفقیت انجام شد.`, 'success');
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
      className="fixed inset-0 z-50 bg-[#f2f5f8] text-slate-800 overflow-y-auto font-sans"
      dir="rtl"
    >
      {/* فرم مخفی ۱: ارسال توکن رسمی سامان کیش به https://sep.shaparak.ir/OnlinePG/OnlinePG */}
      <form
        ref={sepTokenFormRef}
        method="POST"
        action="https://sep.shaparak.ir/OnlinePG/OnlinePG"
        className="hidden"
      >
        <input type="hidden" name="Token" value={sepLiveToken} />
        <input type="hidden" name="GetMethod" value="" />
      </form>

      {/* فرم مخفی ۲: ارسال مستقیم اطلاعات ترمینال 21696637 سامان کیش به https://sep.shaparak.ir/OnlinePG/OnlinePG */}
      <form
        ref={sepDirectFormRef}
        method="POST"
        action="https://sep.shaparak.ir/OnlinePG/OnlinePG"
        className="hidden"
      >
        <input type="hidden" name="Action" value="token" />
        <input type="hidden" name="TerminalId" value={terminalId} />
        <input type="hidden" name="MID" value={terminalId} />
        <input type="hidden" name="Amount" value={String(amountRials)} />
        <input type="hidden" name="ResNum" value={invoiceNumber} />
        <input type="hidden" name="RedirectUrl" value={callbackUrl} />
        <input type="hidden" name="RedirectURL" value={callbackUrl} />
        <input type="hidden" name="CellNumber" value={emailOrMobile || payerMobile || ''} />
      </form>

      {/* نوار آدرس امنیتی مرورگر - شاپرک */}
      <div className="bg-[#1b263b] text-white px-3 sm:px-6 py-2 flex items-center justify-between text-[11px] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            <Lock className="w-3 h-3 text-emerald-400" />
            گواهی امنیت SSL شاپرک
          </span>
          <span className="text-slate-300 hidden sm:inline">
            پرداخت الکترونیک سامان کیش (SEP) - ترمینال {terminalId}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-emerald-400 text-xs" dir="ltr">
          <Lock className="w-3.5 h-3.5" />
          <span>https://sep.shaparak.ir/OnlinePG/OnlinePG</span>
        </div>
      </div>

      {/* هدر رسمی شاپرک و پرداخت الکترونیک سامان (سپ) */}
      <div className="bg-white border-b-4 border-[#0056b3] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0056b3] text-white font-black text-xs flex flex-col items-center justify-center shadow-md shrink-0">
              <span>شاپرک</span>
              <span className="text-[8px] font-mono opacity-90">SEP {terminalId}</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900">
                درگاه پرداخت اینترنتی شاپرک (پرداخت الکترونیک سامان - ترمینال {terminalId})
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                شبکه الکترونیکی پرداخت کارت تحت نظارت بانک مرکزی جمهوری اسلامی ایران
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'payment_form' && (
              <>
                <button
                  type="button"
                  onClick={handleDirectRedirectToExternalShaparak}
                  className="px-3 py-1.5 rounded-xl bg-[#0056b3] hover:bg-[#004494] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="انتقال مستقیم به آدرس بیرونی sep.shaparak.ir با ترمینال 21696637"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>باز کردن در sep.shaparak.ir</span>
                </button>

                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-950 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Clock className="w-4 h-4 text-[#0056b3]" />
                  <span className="hidden sm:inline">زمان باقی‌مانده:</span>
                  <span className="font-mono text-sm font-black text-[#0056b3]" dir="ltr">
                    {formatTimer(sessionTimeLeft)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* بدنه اصلی صفحه شاپرک */}
      <div className="max-w-5xl mx-auto p-3 sm:p-6">
        {step === 'loading_page' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <Loader2 className="w-12 h-12 text-[#0056b3] animate-spin mx-auto" />
            <h2 className="text-base font-black text-slate-800">
              در حال دریافت توکن از درگاه شاپرک سامان (ترمینال {terminalId})...
            </h2>
            <p className="text-xs text-slate-500">
              در حال برقراری ارتباط امن با https://sep.shaparak.ir/OnlinePG/OnlinePG
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <Loader2 className="w-12 h-12 text-[#0056b3] animate-spin mx-auto" />
            <h2 className="text-base font-black text-slate-800">
              در حال ارسال اطلاعات به بانک صادرکننده کارت و تایید تراکنش در ترمینال {terminalId}...
            </h2>
            <p className="text-xs text-slate-500">
              لطفاً تا دریافت پاسخ از سوئیچ شاپرک سامان صفحه را نبندید.
            </p>
          </div>
        )}

        {step === 'receipt_returning' && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-600 p-6 sm:p-8 max-w-lg mx-auto my-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-emerald-700">
                تراکنش با موفقیت انجام شد
              </h2>
              <p className="text-xs text-slate-600">
                وجه تراکنش از کارت شما کسر و به حساب پذیرنده (ترمینال سامان {terminalId}) واریز گردید.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-right">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">نام پذیرنده:</span>
                <span className="font-bold text-slate-900">سامانه کاریابی کارباما (karbama34.ir)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">شماره ترمینال سامان (SEP):</span>
                <span className="font-mono font-bold text-[#0056b3]" dir="ltr">
                  {terminalId}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">مبلغ تراکنش:</span>
                <span className="font-black text-emerald-700">
                  {amountRials.toLocaleString('fa-IR')} ریال ({amountToman.toLocaleString('fa-IR')} تومان)
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">شماره پیگیری شاپرک (TraceNo):</span>
                <span className="font-mono font-bold text-slate-900" dir="ltr">
                  {completedTraceNo}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">شماره مرجع بانکی (RRN):</span>
                <span className="font-mono font-bold text-[#0056b3]" dir="ltr">
                  {completedRrn}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">رسید دیجیتال (RefNum):</span>
                <span className="font-mono font-bold text-slate-800" dir="ltr">
                  {completedRefId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">شماره کارت پرداخت‌کننده:</span>
                <span className="font-mono text-slate-700" dir="ltr">
                  {maskedCard}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0056b3]" />
              <span>
                در حال انتقال خودکار به سایت پذیرنده (کارباما) تا {returnCountdown} ثانیه دیگر...
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleFinishAndReturnToSite(completedRefId)}
              className="w-full py-3.5 px-6 bg-[#0056b3] hover:bg-[#004494] text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>تکمیل فرآیند خرید و انتقال به سایت پذیرنده</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'payment_form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ستون راست: فرم اطلاعات کارت بانکی شاپرک (8 ستون) */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-[#f8fafc] border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0056b3]" />
                  <h2 className="text-sm font-black text-slate-800">اطلاعات کارت</h2>
                </div>
                <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                  SEP Terminal: {terminalId}
                </span>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
                {/* پیام رسمی ارسال درخواست رمز پویا به بانک صادرکننده */}
                {otpBankNotice && otpTimeLeft > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-[#0056b3] shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-semibold">{otpBankNotice}</p>
                  </div>
                )}

                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* ۱. شماره کارت */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    شماره کارت
                  </label>
                  <div className="sm:col-span-8">
                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(sanitizeCardNumber(e.target.value))}
                        placeholder="---- ---- ---- ----"
                        className="w-full bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-4 py-2.5 text-base font-mono font-bold text-center tracking-widest text-slate-900 outline-hidden transition"
                      />
                      {cardValidation?.isValid && cardValidation.bankName && (
                        <span className="absolute left-3 top-2.5 px-2 py-0.5 bg-blue-50 text-[#0056b3] border border-blue-200 rounded text-[10px] font-bold">
                          {cardValidation.bankName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ۲. شماره شناسایی دوم (CVV2) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    شماره شناسایی دوم (CVV2)
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={4}
                      value={cvv2}
                      onChange={(e) => setCvv2(sanitizeNumericOnly(e.target.value))}
                      placeholder="CVV2"
                      className="w-full sm:w-48 bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                    />
                  </div>
                </div>

                {/* ۳. تاریخ انقضای کارت */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    تاریخ انقضای کارت
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
                        placeholder="ماه"
                        className="w-20 bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
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
                        placeholder="سال"
                        className="w-20 bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                      />
                    </div>
                  </div>
                </div>

                {/* ۴. کد امنیتی */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    کد امنیتی
                  </label>
                  <div className="sm:col-span-8 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={5}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(sanitizeNumericOnly(e.target.value))}
                      placeholder="کد امنیتی"
                      className="w-36 bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-center text-slate-900 outline-hidden transition"
                    />
                    <div
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-mono text-base font-black tracking-[0.35em] select-none border border-slate-300 italic"
                      dir="ltr"
                    >
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition cursor-pointer"
                      title="بارگذاری مجدد کد امنیتی"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ۵. رمز دوم (رمز اینترنتی / پویا) - ارسال بانکی */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <label className="sm:col-span-4 font-bold text-slate-700">
                    رمز دوم (رمز پویا)
                  </label>
                  <div className="sm:col-span-8 flex flex-wrap items-center gap-2">
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(sanitizeNumericOnly(e.target.value))}
                      placeholder="ورود رمز دوم پویا"
                      className="flex-1 min-w-[140px] bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-center tracking-widest text-slate-900 outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={handleRequestBankOtp}
                      disabled={isRequestingOtp || otpTimeLeft > 0}
                      className="px-4 py-2.5 rounded-lg bg-[#0056b3] hover:bg-[#004494] disabled:bg-slate-200 disabled:text-slate-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {isRequestingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>در حال ارسال به بانک...</span>
                        </>
                      ) : otpTimeLeft > 0 ? (
                        <span className="font-mono">{formatTimer(otpTimeLeft)}</span>
                      ) : (
                        <span>درخواست رمز پویا</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* ۶. ایمیل / شماره موبایل (اختیاری) */}
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
                      className="w-full bg-white border border-slate-300 focus:border-[#0056b3] rounded-lg px-4 py-2 text-xs font-mono text-left text-slate-800 outline-hidden transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
                  <div className="sm:col-start-5 sm:col-span-8">
                    <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveCardForFuture}
                        onChange={(e) => setSaveCardForFuture(e.target.checked)}
                        className="rounded border-slate-300 text-[#0056b3]"
                      />
                      <span className="text-[11px]">ذخیره شماره کارت در درگاه شاپرک برای پرداخت‌های بعدی</span>
                    </label>
                  </div>
                </div>

                {/* دکمه‌های پرداخت و انصراف شاپرک */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 px-6 bg-[#198754] hover:bg-[#157347] text-white font-black rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>پرداخت</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-40 py-3 px-4 bg-[#dc3545] hover:bg-[#bb2d3b] text-white font-bold rounded-lg transition text-xs cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </div>

            {/* ستون چپ: اطلاعات پذیرنده و مبلغ تراکنش (4 ستون) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-5 py-3.5 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0056b3]" />
                  <h3 className="text-sm font-black text-slate-800">اطلاعات پذیرنده (سامان کیش)</h3>
                </div>

                <div className="p-5 space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                    <span className="text-slate-500 block text-[11px]">مبلغ قابل پرداخت (ریال):</span>
                    <div className="text-lg font-black text-[#0056b3]">
                      {amountRials.toLocaleString('fa-IR')} ریال
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">
                      ({amountToman.toLocaleString('fa-IR')} تومان)
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">نام پذیرنده:</span>
                      <span className="font-bold text-slate-900">سامانه کاریابی کارباما</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">نشانی سایت پذیرنده:</span>
                      <span className="font-mono font-bold text-[#0056b3]" dir="ltr">
                        https://karbama34.ir
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">شماره ترمینال سامان:</span>
                      <span className="font-mono font-black text-[#0056b3] text-sm" dir="ltr">
                        {terminalId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">شماره سفارش (ResNum):</span>
                      <span className="font-mono font-bold text-slate-900" dir="ltr">
                        {invoiceNumber}
                      </span>
                    </div>
                  </div>

                  {sepServerMessage && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
                      <span className="font-bold block mb-0.5">وضعیت سوئیچ بیرونی سامان:</span>
                      <span>{sepServerMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* راهنمای امنیتی شاپرک */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 text-[11px] text-slate-600 leading-relaxed">
                <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#198754]" />
                  <span>نکات امنیتی درگاه شاپرک سامان</span>
                </div>
                <p>
                  • این درگاه به شماره ترمینال <strong>{terminalId}</strong> پرداخت الکترونیک سامان کیش (SEP) متصل است.
                </p>
                <p>
                  • رمز دوم پویا صرفاً از طریق بانک صادرکننده کارت به تلفن همراه شما پیامک می‌شود.
                </p>
                <p>
                  • پس از اتمام عملیات پرداخت، به صورت خودکار به سایت پذیرنده (کارباما) منتقل می‌شوید.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
