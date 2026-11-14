import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  Loader2,
  ExternalLink,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  requestSepalGatewayRedirectAsync,
  navigateToSepalGateway,
  saveSepalGatewayApiKeyOnServer,
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
 * Calls /api/sep/request.php -> POST https://payment.sepal.ir/api/v1/payment/request/
 * When Sepal issues a real paymentNumber (status: true), immediately redirects the browser
 * to https://payment.sepal.ir/api/v1/payment/{paymentNumber}/ with Referer.
 * If Sepal returns status: false (e.g. invalid apiKey), prevents redirecting to a broken URL
 * ("پرداخت یافت نشد") and allows entering/saving the valid Sepal apiKey directly.
 */
export const SepalGatewayModal: React.FC<SepalGatewayModalProps> = ({
  isOpen,
  onClose,
  amountToman,
  description,
  payerName,
  payerMobile,
}) => {
  const { paymentSettings, updatePaymentSettings } = useApp();

  const [isConnecting, setIsConnecting] = useState(true);
  const [paymentNumber, setPaymentNumber] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [sepalErrorCode, setSepalErrorCode] = useState<string>('');
  const [sepalNotice, setSepalNotice] = useState<string | null>(null);
  const [serverIp, setServerIp] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string>(paymentSettings?.sepalApiKey || '');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const amountRials = Math.max(100000, Math.round(amountToman * 10));

  const connectToSepal = useCallback(
    async (overrideKey?: string, signal?: AbortSignal) => {
      setIsConnecting(true);
      setSepalNotice(null);
      setSepalErrorCode('');

      const keyToUse = overrideKey !== undefined ? overrideKey.trim() : paymentSettings?.sepalApiKey;

      const session = await requestSepalGatewayRedirectAsync(
        {
          amountToman,
          description,
          payerName,
          payerMobile,
          apiKey: keyToUse || undefined,
        },
        signal
      );

      if (signal?.aborted) return;

      setPaymentNumber(session.paymentNumber);
      setInvoiceNumber(session.invoiceNumber);
      setRedirectUrl(session.redirectUrl);
      setServerIp(session.serverIp || '');
      setIsConnecting(false);

      if (session.isLiveToken && session.paymentNumber && session.redirectUrl) {
        // Real paymentNumber issued by Sepal — immediately redirect browser to payment.sepal.ir
        navigateToSepalGateway(session.redirectUrl);
      } else {
        setSepalErrorCode(session.sepalMessage || 'invalid_gateway');
        setSepalNotice(
          session.sepalTranslatedError ||
            'کلید وب‌سرویس درگاه (apiKey) در پنل سپال تایید نشد.'
        );
      }
    },
    [amountToman, description, payerName, payerMobile, paymentSettings?.sepalApiKey]
  );

  useEffect(() => {
    if (!isOpen) return;
    setCustomApiKey(paymentSettings?.sepalApiKey || '');
    const abortController = new AbortController();
    connectToSepal(undefined, abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [isOpen, connectToSepal, paymentSettings?.sepalApiKey]);

  const handleSaveAndRetryKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customApiKey.trim();
    if (!trimmed) return;

    setIsSavingKey(true);
    try {
      await saveSepalGatewayApiKeyOnServer(trimmed, paymentSettings?.sepalUniqueCode);
      updatePaymentSettings({ sepalApiKey: trimmed });
      await connectToSepal(trimmed);
    } finally {
      setIsSavingKey(false);
    }
  };

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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Status Box */}
          {isConnecting ? (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-500/30 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-400/40 flex items-center justify-center shadow-lg shadow-teal-500/10">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-white">
                  در حال ایجاد تراکنش و دریافت paymentNumber از سرور سپال...
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ارسال درخواست به <code>POST https://payment.sepal.ir/api/v1/payment/request/</code>
                </p>
              </div>
            </div>
          ) : paymentNumber && redirectUrl ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <h4 className="font-black text-sm text-emerald-300">
                شناسه پرداخت ({paymentNumber}) دریافت شد — در حال انتقال به درگاه سپال...
              </h4>
              <p className="text-[11px] text-slate-300">
                مرورگر شما به صورت خودکار به صفحه درگاه شاپرک سپال هدایت می‌شود.
              </p>
            </div>
          ) : null}

          {/* Order Summary */}
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
              <span className="font-mono text-[10px] text-teal-300" dir="ltr">
                https://karbama34.ir/api/sep/callback.php
              </span>
            </div>

            {serverIp && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">IP سرور هاست (جهت ثبت در پنل سپال):</span>
                <span className="font-mono text-[11px] text-amber-300 font-bold" dir="ltr">
                  {serverIp}
                </span>
              </div>
            )}
          </div>

          {/* Diagnostic & Direct API Key Updater if Sepal returned status: false */}
          {!isConnecting && sepalNotice && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
              <div className="flex items-start gap-2.5 text-rose-200 leading-relaxed">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black block text-rose-300 text-xs">
                    پاسخ مستقیم سرور سپال ({sepalErrorCode}):
                  </span>
                  <p className="text-[11px] text-rose-100">{sepalNotice}</p>
                </div>
              </div>

              <form onSubmit={handleSaveAndRetryKey} className="space-y-2.5 pt-2 border-t border-rose-500/20">
                <label className="block text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  <span>کلید وب‌سرویس درگاه پرداخت سپال (apiKey) را وارد و ذخیره کنید:</span>
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="کلید apiKey دریافتی از پنل درگاه پرداخت سپال (sepal.ir)"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-teal-400 rounded-xl px-3 py-2.5 text-[11px] text-white font-mono text-left outline-hidden"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  نکته: کلید وب‌سرویس <strong>درگاه پرداخت (`payment.sepal.ir`)</strong> با توکن استعلام (`inquiry.sepal.ir`) متفاوت است. در پنل سپال بخش «درگاه‌های پرداخت»، کلید وب‌سرویس درگاه دامنه <code>karbama34.ir</code> را کپی و در کادر بالا ثبت کنید تا برای تمام کاربران روی سرور ذخیره شود.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSavingKey || !customApiKey.trim()}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 text-white font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    {isSavingKey ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>ذخیره کلید در سرور و اتصال مجدد به درگاه سپال</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Direct GET Form Redirect to payment.sepal.ir (only shown when real paymentNumber is issued) */}
          {paymentNumber && redirectUrl && (
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
              اتصال مستقیم بدون درگاه واسط داخلی
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
