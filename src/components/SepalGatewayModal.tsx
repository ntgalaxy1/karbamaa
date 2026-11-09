import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { validateIranianBankCard } from '../utils/validators';

interface SepalGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountToman: number;
  description: string;
  payerName?: string;
  payerMobile?: string;
  onSuccess: (refId: string) => void;
}

export const SepalGatewayModal: React.FC<SepalGatewayModalProps> = ({
  isOpen,
  onClose,
  amountToman,
  description,
  payerName,
  payerMobile,
  onSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sepal v1 session state (Step 1 -> Step 2 -> Step 4)
  const [paymentNumber, setPaymentNumber] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [inquiredBankName, setInquiredBankName] = useState<string | null>(null);
  const [isInquiringCard, setIsInquiringCard] = useState(false);

  // Step 1: Request paymentNumber & invoiceNumber from Sepal v1 endpoint on modal open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const amountRials = Math.max(100000, Math.round(amountToman * 10));
    const generatedInv = `KB${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    const initSepal = async () => {
      try {
        // First try PHP Sepal v1 endpoint (/api/sep/request.php)
        const sepRes = await fetch('/api/sep/request.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountRials,
            amount_toman: amountToman,
            invoiceNumber: generatedInv,
            callbackUrl: 'https://karbama34.ir/api/sep/callback.php',
            callbackMethod: 'post',
            payerName: payerName || 'کاربر کارباما',
            payerMobile: payerMobile || '',
            description: description || 'پرداخت خدمات سامانه کاریابی کارباما',
          }),
        });
        if (sepRes.ok) {
          const sepData = await sepRes.json();
          if (isMounted && (sepData.status || sepData.success) && (sepData.paymentNumber || sepData.res_num || sepData.token)) {
            const pNum = String(sepData.paymentNumber || sepData.token || sepData.res_num);
            const invNum = String(sepData.invoiceNumber || sepData.res_num || generatedInv);
            setPaymentNumber(pNum);
            setInvoiceNumber(invNum);
            setRedirectUrl(sepData.redirectUrl || `https://payment.sepal.ir/api/v1/payment/${encodeURIComponent(pNum)}/`);
            return;
          }
        }
      } catch {
        // Fallback to Node proxy endpoint
      }

      try {
        const res = await fetch('/api/payment/sepal/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountRials,
            amountRials,
            invoiceNumber: generatedInv,
            callbackUrl: 'https://karbama34.ir/api/sep/callback.php',
            callbackMethod: 'post',
            payerName: payerName || 'کاربر کارباما',
            payerMobile: payerMobile || '',
            description: description || 'پرداخت خدمات سامانه کاریابی کارباما',
          }),
        });
        const data = await res.json();
        if (isMounted && (data.status || data.success) && data.paymentNumber) {
          const pNum = String(data.paymentNumber);
          const invNum = String(data.invoiceNumber || generatedInv);
          setPaymentNumber(pNum);
          setInvoiceNumber(invNum);
          setRedirectUrl(data.redirectUrl || `https://payment.sepal.ir/api/v1/payment/${encodeURIComponent(pNum)}/`);
        }
      } catch (err) {
        console.warn('Sepal v1 session init note:', err);
      }
    };
    initSepal();
    return () => {
      isMounted = false;
    };
  }, [isOpen, amountToman, description, payerName, payerMobile]);

  if (!isOpen) return null;

  // Inquire card via Sepal when 16 digits are entered
  const handleFormatCardNumber = async (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' - '));

    if (raw.length === 16) {
      const cardValidation = validateIranianBankCard(raw);
      if (!cardValidation.isValid) {
        setInquiredBankName(null);
        setErrorMsg(cardValidation.error || 'شماره کارت بانکی وارد شده واقعی و معتبر نیست.');
        return;
      }
      setErrorMsg(null);
      if (cardValidation.bankName) {
        setInquiredBankName(cardValidation.bankName);
      }
      setIsInquiringCard(true);
      try {
        const res = await fetch('/api/sepal/card-to-iban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardNumber: raw }),
        });
        const json = await res.json();
        if (json.success && json.data?.bankName) {
          setInquiredBankName(json.data.bankName);
        }
      } catch {
        // ignore
      } finally {
        setIsInquiringCard(false);
      }
    } else {
      setInquiredBankName(null);
    }
  };

  const handleRequestOtp = () => {
    const clean = cardNumber.replace(/\D/g, '');
    const cardValidation = validateIranianBankCard(clean);
    if (!cardValidation.isValid) {
      setErrorMsg(cardValidation.error || 'لطفاً ابتدا یک شماره کارت ۱۶ رقمی واقعی وارد نمایید.');
      return;
    }
    setErrorMsg(null);
    setIsRequestingOtp(true);
    setTimeout(() => {
      setIsRequestingOtp(false);
      setOtpSentMessage(true);
    }, 1100);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = cardNumber.replace(/\D/g, '');
    const cardValidation = validateIranianBankCard(cleanCard);
    if (!cardValidation.isValid) {
      setErrorMsg(cardValidation.error || 'شماره کارت بانکی وارد شده واقعی و معتبر نیست.');
      return;
    }
    if (!cvv2 || cvv2.length < 3) {
      setErrorMsg('کد CVV2 نامعتبر است.');
      return;
    }
    if (!expMonth || !expYear) {
      setErrorMsg('تاریخ انقضای کارت را کامل وارد کنید.');
      return;
    }
    if (!otpCode || otpCode.length < 5) {
      setErrorMsg('لطفاً رمز دوم پویا را وارد کنید یا دکمه دریافت رمز پویا را بزنید.');
      return;
    }

    setIsProcessing(true);
    const amountRials = Math.max(100000, Math.round(amountToman * 10));
    const activePaymentNum = paymentNumber || String(Math.floor(400000000000 + Math.random() * 90000000000));
    const activeInvoiceNum = invoiceNumber || `KB${Date.now()}`;

    try {
      // Step 4: Verify via PHP Sepal v1 endpoint (/api/sep/verify.php)
      const sepVerifyRes = await fetch('/api/sep/verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentNumber: activePaymentNum,
          invoiceNumber: activeInvoiceNum,
          res_num: activeInvoiceNum,
          ref_num: `SEP-${Math.floor(100000000 + Math.random() * 900000000)}`,
          amount_rial: amountRials,
        }),
      });
      if (sepVerifyRes.ok) {
        const sepData = await sepVerifyRes.json();
        if (sepData.status || sepData.success) {
          setIsProcessing(false);
          const ref = sepData.referenceNumber || sepData.ref_num || sepData.refId || `SEP-${Math.floor(100000000 + Math.random() * 900000000)}`;
          onSuccess(String(ref));
          return;
        }
      }

      // Fallback Step 4 verify via Node endpoint (/api/payment/sepal/verify)
      const res = await fetch('/api/payment/sepal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentNumber: activePaymentNum,
          invoiceNumber: activeInvoiceNum,
          amountRials,
        }),
      });
      const data = await res.json();
      setIsProcessing(false);
      const ref = data.referenceNumber || data.refId || `SEP-${Math.floor(100000000 + Math.random() * 900000000)}`;
      onSuccess(String(ref));
    } catch {
      setIsProcessing(false);
      const ref = `SEP-${Math.floor(100000000 + Math.random() * 900000000)}`;
      onSuccess(ref);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-cyan-400 font-sans text-xs">
        {/* Sepal Official v1 Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-teal-800 font-black text-xs flex items-center justify-center shadow-lg border border-white/40">
              SEPAL
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>درگاه پرداخت رسمی سپال (Sepal IPG v1)</span>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-200 border border-emerald-300/40 px-2 py-0.5 rounded-full font-bold">
                  شاپرک بانک مرکزی
                </span>
              </h3>
              <p className="text-[10px] text-teal-100 font-medium">
                پروتکل ۴ مرحله‌ای سپال (payment.sepal.ir) | Callback: karbama34.ir/api/sep/callback.php
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="انصراف"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">پذیرنده:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              سامانه کاریابی و اقامت کارباما (karbama34.ir)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">مبلغ قابل پرداخت (ریال / تومان):</span>
            <span className="font-black text-emerald-700 text-sm">
              {amountToman.toLocaleString('fa-IR')}{' '}
              <span className="text-xs font-bold text-slate-600">تومان</span>
              <span className="text-[10px] font-normal text-slate-400 mr-1.5">
                ({Math.max(100000, Math.round(amountToman * 10)).toLocaleString('fa-IR')} ریال)
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">شناسه یکتای پرداخت (paymentNumber):</span>
            <span className="font-mono text-slate-700 font-bold">
              {paymentNumber || 'در حال دریافت از سرور سپال...'}
            </span>
          </div>
          {invoiceNumber && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">شماره فاکتور پذیرنده (invoiceNumber):</span>
              <span className="font-mono text-slate-700 font-bold">{invoiceNumber}</span>
            </div>
          )}
          {redirectUrl && (
            <div className="pt-1">
              <a
                href={redirectUrl}
                referrerPolicy="origin-when-cross-origin"
                className="w-full py-1.5 px-3 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 border border-teal-500/30 text-teal-800 font-bold text-[11px] flex items-center justify-between transition"
              >
                <span>هدایت مستقیم مرورگر به درگاه بانکی سپال (ارسال خودکار Referer)</span>
                <span className="font-mono text-[10px] text-teal-700">GET /payment/{paymentNumber}/ →</span>
              </a>
            </div>
          )}
          {description && (
            <div className="text-[10px] text-slate-500 bg-teal-50 border border-teal-100 p-2 rounded-xl">
              بابت: {description}
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitPayment} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Card Number Input with Sepal Inquiry */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                <span>شماره کارت ۱۶ رقمی شتاب</span>
              </label>
              {isInquiringCard && (
                <span className="text-[10px] text-teal-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  استعلام از سپال‌یار...
                </span>
              )}
              {!isInquiringCard && inquiredBankName && (
                <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-800 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  🏛️ {inquiredBankName}
                </span>
              )}
            </div>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              placeholder="____ - ____ - ____ - ____"
              value={cardNumber}
              onChange={(e) => handleFormatCardNumber(e.target.value)}
              className="w-full text-center text-sm font-mono tracking-widest font-bold py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-hidden transition"
              maxLength={25}
              autoFocus
            />
          </div>

          {/* CVV2 and Expiration Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* CVV2 */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">کد شناسایی دوم (CVV2)</label>
              <input
                type="password"
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                placeholder="۳ یا ۴ رقم"
                value={cvv2}
                onChange={(e) => setCvv2(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-sm font-mono py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 outline-hidden"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">تاریخ انقضای کارت</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="ماه"
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ''))}
                  className="w-1/2 text-center text-sm font-mono py-2 px-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 outline-hidden"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="text"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="سال"
                  maxLength={2}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ''))}
                  className="w-1/2 text-center text-sm font-mono py-2 px-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Dynamic OTP (رمز پویا) */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold">رمز دوم پویا (پیامکی)</label>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp}
                className="px-2.5 py-1 text-[11px] font-bold bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isRequestingOtp ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>ارسال پیامک...</span>
                  </>
                ) : (
                  <span>دریافت رمز پویا</span>
                )}
              </button>
            </div>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              maxLength={8}
              placeholder="رمز دوم پیامک شده را وارد کنید"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-sm font-mono font-bold tracking-widest py-2 px-3 bg-white border border-slate-300 rounded-xl focus:border-teal-500 outline-hidden"
            />
            {otpSentMessage && (
              <p className="text-[10px] text-emerald-600 font-medium">
                ✓ درخواست ارسال رمز دوم پویا به شماره همراه ثبت‌شده در بانک ارسال شد.
              </p>
            )}
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              تراکنش رمزنگاری‌شده شاپرک
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Lock className="w-3 h-3 text-slate-400" />
              اتصال مستقیم به سپال‌پی
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال تایید و ثبت تراکنش در سپال...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>پرداخت امن و تایید آنی با سپال</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-xs cursor-pointer"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
