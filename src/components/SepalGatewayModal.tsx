import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  Loader2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  requestSepalGatewayRedirectAsync,
  navigateToSepalGateway,
} from '../services/sepalPaymentService';

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
 * Direct Sepal Official Gateway Connector (https://payment.sepal.ir)
 * No in-site card form — immediately creates a Sepal paymentNumber via /api/sep/request.php
 * and redirects the user's browser directly to https://payment.sepal.ir/api/v1/payment/{paymentNumber}/
 */
export const SepalGatewayModal: React.FC<SepalGatewayModalProps> = ({
  isOpen,
  onClose,
  amountToman,
  description,
  payerName,
  payerMobile,
}) => {
  const { paymentSettings } = useApp();

  const [isConnecting, setIsConnecting] = useState(true);
  const [paymentNumber, setPaymentNumber] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [sepalNotice, setSepalNotice] = useState<string | null>(null);

  const amountRials = Math.max(100000, Math.round(amountToman * 10));

  useEffect(() => {
    if (!isOpen) return;
    const abortController = new AbortController();

    const initAndRedirect = async () => {
      setIsConnecting(true);
      setSepalNotice(null);

      const session = await requestSepalGatewayRedirectAsync(
        {
          amountToman,
          description,
          payerName,
          payerMobile,
          apiKey: paymentSettings?.sepalApiKey || undefined,
        },
        abortController.signal
      );

      if (abortController.signal.aborted) return;

      setPaymentNumber(session.paymentNumber);
      setInvoiceNumber(session.invoiceNumber);
      setRedirectUrl(session.redirectUrl);
      setIsConnecting(false);

      if (session.sepalTranslatedError) {
        setSepalNotice(session.sepalTranslatedError);
      }

      // Automatically redirect browser directly to official Sepal gateway (payment.sepal.ir)
      if (session.redirectUrl && session.isLiveToken) {
        navigateToSepalGateway(session.redirectUrl);
      } else if (session.redirectUrl) {
        // Even if server returned a gateway note, still initiate direct navigation to Sepal
        navigateToSepalGateway(session.redirectUrl);
      }
    };

    initAndRedirect();

    return () => {
      abortController.abort();
    };
  }, [isOpen, amountToman, description, payerName, payerMobile, paymentSettings?.sepalApiKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-teal-500/50 font-sans text-xs my-auto">
        {/* Official Sepal Redirect Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-teal-800 font-black text-xs flex items-center justify-center shadow-lg border border-white/40 shrink-0">
              SEPAL
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                <span>اتصال مستقیم به درگاه پرداخت سپال</span>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-200 border border-emerald-300/40 px-2 py-0.5 rounded-full font-bold">
                  payment.sepal.ir
                </span>
              </h3>
              <p className="text-[10px] text-teal-100 font-medium mt-0.5">
                هدایت مستقیم مرورگر به صفحه رسمی شاپرک بانک مرکزی
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

        {/* Body: Loading Skeleton & Direct Redirect Controls */}
        <div className="p-5 space-y-4">
          {/* Status Animation Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-500/30 flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-400/40 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm text-white">
                {isConnecting
                  ? 'در حال دریافت توکن از وب‌سرویس رسمی سپال...'
                  : 'در حال انتقال خودکار به درگاه بانکی سپال (payment.sepal.ir)...'}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                کلیه مراحل ورود شماره کارت، CVV2 و رمز دوم پویا مستقیماً در صفحه امن شاپرک سپال انجام می‌شود.
              </p>
            </div>
          </div>

          {/* Order Summary with Skeletons while waiting for API */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">پذیرنده:</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                سامانه کاریابی کارباما (karbama34.ir)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">مبلغ قابل پرداخت:</span>
              <span className="font-black text-emerald-400 text-sm">
                {amountToman.toLocaleString('fa-IR')} تومان{' '}
                <span className="text-[10px] font-normal text-slate-400">
                  ({amountRials.toLocaleString('fa-IR')} ریال)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">شناسه یکتای پرداخت (paymentNumber):</span>
              {isConnecting ? (
                <div className="h-5 w-32 rounded-lg bg-slate-800 animate-pulse" />
              ) : (
                <span
                  key={paymentNumber}
                  className="font-mono text-teal-300 font-black bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-lg"
                  dir="ltr"
                >
                  {paymentNumber}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">شماره فاکتور (invoiceNumber):</span>
              {isConnecting ? (
                <div className="h-5 w-28 rounded-lg bg-slate-800 animate-pulse" />
              ) : (
                <span key={invoiceNumber} className="font-mono text-slate-200 font-bold" dir="ltr">
                  {invoiceNumber}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">آدرس بازگشت (callbackUrl):</span>
              <span className="font-mono text-[10px] text-slate-400" dir="ltr">
                karbama34.ir/api/sep/callback.php
              </span>
            </div>
          </div>

          {sepalNotice && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300">پیام وب‌سرویس سپال:</span>
                <span>{sepalNotice}</span>
              </div>
            </div>
          )}

          {/* Direct GET Form Redirect to payment.sepal.ir (with Referer header & target="_top") */}
          {redirectUrl && (
            <form method="GET" action={redirectUrl} target="_top" className="space-y-2">
              <button
                type="submit"
                onClick={() => navigateToSepalGateway(redirectUrl)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-teal-600/25 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>ورود مستقیم به صفحه درگاه بانکی سپال (payment.sepal.ir)</span>
                <ArrowLeft className="w-4 h-4 shrink-0" />
              </button>
            </form>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              هدایت مستقیم با ارسال خودکار Referer
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
            >
              انصراف و بازگشت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
