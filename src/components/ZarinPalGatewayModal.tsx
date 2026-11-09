import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface ZarinPalGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountToman: number;
  description: string;
  onSuccess: (refId: string) => void;
}

export const ZarinPalGatewayModal: React.FC<ZarinPalGatewayModalProps> = ({
  isOpen,
  onClose,
  amountToman,
  description,
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

  if (!isOpen) return null;

  const handleFormatCardNumber = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' - '));
  };

  const handleRequestOtp = () => {
    if (cardNumber.replace(/\D/g, '').length < 16) {
      setErrorMsg('لطفاً ابتدا شماره کارت ۱۶ رقمی را کامل وارد نمایید.');
      return;
    }
    setErrorMsg(null);
    setIsRequestingOtp(true);
    setTimeout(() => {
      setIsRequestingOtp(false);
      setOtpSentMessage(true);
    }, 1200);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 16) {
      setErrorMsg('شماره کارت باید ۱۶ رقم باشد.');
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
    setTimeout(() => {
      setIsProcessing(false);
      const refId = 'ZP-' + Math.floor(100000 + Math.random() * 900000);
      onSuccess(refId);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-amber-300 font-sans text-xs">
        {/* ZarinPal Official Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-4 text-slate-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 font-black text-sm flex items-center justify-center shadow-lg border border-amber-300/40">
              ZP
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-slate-950 flex items-center gap-1.5">
                <span>درگاه پرداخت امن زرین‌پال</span>
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  تایید شده
                </span>
              </h3>
              <p className="text-[10px] text-slate-900 font-medium">
                ZarinPal Payment Gateway | شبکه شتاب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition"
            title="انصراف"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Merchant & Order Info Summary */}
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              پذیرنده:
            </span>
            <span className="font-bold text-slate-900">سامانه کاریابی و مشاوره کارباما (KARBAMA)</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">بابت:</span>
            <span className="font-bold text-amber-900 truncate max-w-[220px]">{description}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-amber-200/70">
            <span className="text-xs font-bold text-slate-700">مبلغ قابل پرداخت:</span>
            <div className="text-right">
              <span className="text-base font-black text-amber-700 font-mono">
                {amountToman.toLocaleString('fa-IR')}
              </span>
              <span className="text-xs font-bold text-amber-900 mr-1">تومان</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitPayment} className="p-4 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Card Number Input */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">شماره کارت ۱۶ رقمی بانک *</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                dir="ltr"
                placeholder="6037 - XXXX - XXXX - XXXX"
                value={cardNumber}
                onChange={(e) => handleFormatCardNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2.5 text-slate-900 placeholder-slate-400 font-mono text-center font-black tracking-widest text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* CVV2 and Expiry Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">کد CVV2 *</label>
              <input
                type="password"
                required
                maxLength={4}
                dir="ltr"
                placeholder="XXX"
                value={cvv2}
                onChange={(e) => setCvv2(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-center font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">تاریخ انقضا (ماه / سال) *</label>
              <div className="flex items-center gap-1.5" dir="ltr">
                <input
                  type="text"
                  required
                  maxLength={2}
                  placeholder="ماه"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 text-slate-900 text-center font-mono text-xs focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="text"
                  required
                  maxLength={2}
                  placeholder="سال"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 text-slate-900 text-center font-mono text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* OTP / Second Password Input with Request Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">رمز دوم پویا *</label>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp}
                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1 disabled:opacity-50"
              >
                {isRequestingOtp ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>در حال ارسال پیامک...</span>
                  </>
                ) : (
                  <span>دریافت رمز پویا</span>
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="password"
                required
                maxLength={8}
                dir="ltr"
                placeholder="رمز پویای پیامک‌شده"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-slate-900 font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {otpSentMessage && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>رمز پویا به شماره همراه ثبت‌شده صاحب کارت در بانک ارسال گردید.</span>
              </p>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>پرداخت امن با پروتکل SSL و تاییدیه رسمی بانک مرکزی</span>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black rounded-xl shadow-lg shadow-emerald-700/30 transition flex items-center justify-center gap-2 text-xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال اتصال به بانک و ثبت تراکنش...</span>
                </>
              ) : (
                <>
                  <span>تکمیل پرداخت ({amountToman.toLocaleString('fa-IR')} تومان)</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
