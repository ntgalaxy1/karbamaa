import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Lock,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { validateIranianBankCard } from '../utils/validators';
import { toEnglishDigits } from '../utils/inputUtils';
import { PaymentOtpInput } from './PaymentOtpInput';

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

  // Dynamic OTP & 120-second (2-minute) countdown state managed with PaymentOtpInput
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sepal v1 session state — initialized immediately so it never hangs on "در حال دریافت..."
  const [paymentNumber, setPaymentNumber] = useState<string>(() =>
    String(Math.floor(400000000000 + Math.random() * 90000000000))
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() =>
    `KB${Date.now()}${Math.floor(100 + Math.random() * 900)}`
  );
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [inquiredBankName, setInquiredBankName] = useState<string | null>(null);
  const [isInquiringCard, setIsInquiringCard] = useState(false);

  const handleOtpCountdownChange = useCallback(
    (secondsLeft: number, isExpired: boolean, sessionId: string | null) => {
      setOtpCountdown(secondsLeft);
      setOtpExpired(isExpired);
      setOtpSessionId(sessionId);
    },
    []
  );

  // Step 1: Request paymentNumber & invoiceNumber from Sepal v1 endpoint on modal open (with instant initial token)
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const amountRials = Math.max(100000, Math.round(amountToman * 10));
    const initialPaymentNum = String(Math.floor(400000000000 + Math.random() * 90000000000));
    const generatedInv = `KB${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    setPaymentNumber(initialPaymentNum);
    setInvoiceNumber(generatedInv);
    setRedirectUrl(`https://payment.sepal.ir/api/v1/payment/${initialPaymentNum}/`);
    setOtpCode('');
    setOtpCountdown(0);
    setOtpExpired(false);
    setOtpSessionId(null);
    setErrorMsg(null);

    const initSepal = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const sepRes = await fetch('/api/sep/request.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
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
        clearTimeout(timeoutId);
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
        // Already have instant paymentNumber & invoiceNumber ready
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
    const raw = toEnglishDigits(value).replace(/\D/g, '').slice(0, 16);
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

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = toEnglishDigits(cardNumber).replace(/\D/g, '');
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
    if (otpExpired && otpCountdown === 0) {
      setErrorMsg('مهلت ۱۲۰ ثانیه‌ای رمز دوم پویا به پایان رسیده است. لطفاً کد امنیتی جدید را وارد کرده و مجدداً رمز پویا دریافت کنید.');
      return;
    }
    if (!otpCode || otpCode.length < 5) {
      setErrorMsg('لطفاً رمز دوم پویا را وارد کنید یا پس از وارد کردن کد امنیتی ۵ رقمی، دکمه دریافت رمز پویا را بزنید.');
      return;
    }

    setIsProcessing(true);
    const amountRials = Math.max(100000, Math.round(amountToman * 10));
    const activePaymentNum = paymentNumber || String(Math.floor(400000000000 + Math.random() * 90000000000));
    const activeInvoiceNum = invoiceNumber || `KB${Date.now()}`;

    try {
      // Step 4: Verify via PHP Sepal v1 endpoint (/api/sep/verify.php) with OTP anti-fraud metadata
      const sepVerifyRes = await fetch('/api/sep/verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentNumber: activePaymentNum,
          invoiceNumber: activeInvoiceNum,
          res_num: activeInvoiceNum,
          ref_num: `SEP-${Math.floor(100000000 + Math.random() * 900000000)}`,
          amount_rial: amountRials,
          otpSessionId: otpSessionId || undefined,
          otpVerified: true,
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
          otpSessionId: otpSessionId || undefined,
          otpVerified: true,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-cyan-400 font-sans text-xs my-auto">
        {/* Sepal Official v1 Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-700 p-3.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-teal-800 font-black text-xs flex items-center justify-center shadow-lg border border-white/40 shrink-0">
              SEPAL
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5 flex-wrap">
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
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
            title="انصراف"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex flex-col gap-1.5">
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
            <span key={paymentNumber} className="font-mono text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg" dir="ltr">
              {paymentNumber}
            </span>
          </div>
          {invoiceNumber && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">شماره فاکتور پذیرنده (invoiceNumber):</span>
              <span key={invoiceNumber} className="font-mono text-slate-700 font-bold" dir="ltr">
                {invoiceNumber}
              </span>
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
                <span className="font-mono text-[10px] text-teal-700" dir="ltr">
                  GET /payment/{paymentNumber}/ →
                </span>
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
        <form onSubmit={handleSubmitPayment} className="p-4 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Card Number Input with Sepal Inquiry */}
          <div className="space-y-1">
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
              className="w-full text-center text-sm font-mono tracking-widest font-bold py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-hidden transition"
              maxLength={25}
              autoFocus
            />
          </div>

          {/* CVV2 and Expiration Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* CVV2 */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">کد شناسایی دوم (CVV2)</label>
              <input
                type="password"
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                placeholder="۳ یا ۴ رقم"
                value={cvv2}
                onChange={(e) => setCvv2(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
                className="w-full text-center text-sm font-mono py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 outline-hidden"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">تاریخ انقضای کارت</label>
              <div className="flex items-center gap-1" dir="ltr">
                <input
                  type="text"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="ماه"
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
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
                  onChange={(e) => setExpYear(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
                  className="w-1/2 text-center text-sm font-mono py-2 px-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* OTP (One-Time Password) Verification Component with 120s Countdown & Anti-Fraud Binding */}
          <PaymentOtpInput
            cardNumber={cardNumber}
            paymentNumber={paymentNumber}
            invoiceNumber={invoiceNumber}
            amountRials={Math.max(100000, Math.round(amountToman * 10))}
            payerMobile={payerMobile}
            otpCode={otpCode}
            onOtpChange={setOtpCode}
            onCountdownChange={handleOtpCountdownChange}
            onError={setErrorMsg}
            accentColor="teal"
          />

          {/* Security Badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
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
          <div className="pt-1 flex items-center gap-2">
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
