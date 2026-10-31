import React, { useRef, useState, useEffect } from 'react';
import { X, CheckCircle, Eraser, FileText, Printer, CreditCard, Camera, ShieldCheck, MapPin, Phone, User, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  fatherName: string;
  nationalId: string;
  phone: string;
  iranProvince: string;
  iranCity: string;
  iranAddress: string;
  targetCountry: string;
  payerCardNumber: string;
  passportPhotoUrl?: string;
  fullBodyPhotoUrl?: string;
  nationalCardPhotoUrl?: string;
  signatureDataUrl?: string;
  onSaveSignature?: (dataUrl: string) => void;
  onAcceptAndSubmit?: () => void;
  isReadOnly?: boolean;
}

const getShamsiDateString = (): string => {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return '۱۴۰۵/۰۸/۰۸';
  }
};

const getMiladiDateString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  isOpen,
  onClose,
  fullName,
  fatherName,
  nationalId,
  phone,
  iranProvince,
  iranCity,
  iranAddress,
  targetCountry,
  payerCardNumber,
  passportPhotoUrl,
  fullBodyPhotoUrl,
  nationalCardPhotoUrl,
  signatureDataUrl,
  onSaveSignature,
  onAcceptAndSubmit,
  isReadOnly = false,
}) => {
  const { brokerSettings, paymentSettings } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>(signatureDataUrl || '');
  const [hasDrawn, setHasDrawn] = useState(Boolean(signatureDataUrl));

  useEffect(() => {
    if (signatureDataUrl) {
      setCurrentSignature(signatureDataUrl);
      setHasDrawn(true);
    }
  }, [signatureDataUrl]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#ef4444'; // Red signature ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCurrentSignature(dataUrl);
      if (onSaveSignature) {
        onSaveSignature(dataUrl);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setCurrentSignature('');
    setHasDrawn(false);
    if (onSaveSignature) {
      onSaveSignature('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const serviceFeeText = brokerSettings.brokerServiceFee || `${paymentSettings.feeTL} لیر ترکیه (معادل تومان روز)`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="max-w-3xl w-full bg-slate-900 print:bg-white text-slate-100 print:text-black border border-slate-800 print:border-none rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 bg-slate-950 print:hidden border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">
                تعهدنامه حقوقی و تسویه حساب رسمی کارگزار
              </h3>
              <p className="text-[11px] text-slate-400">سامانه کاریابی و اعزام رسمی نیروی کار کارباما</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="چاپ تعهدنامه"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">چاپ سند</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6 text-right">
          {/* Top Dates Bar (Left aligned as requested) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:border-black/20 pb-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="کارباما" className="w-10 h-10 rounded-full border border-amber-400/80" />
              <div>
                <span className="font-black text-sm text-white print:text-black">کارباما | KARBAMA</span>
                <span className="text-[10px] text-slate-400 print:text-black block">سامانه کاریابی و اقامت ترکیه</span>
              </div>
            </div>

            <div className="text-left text-xs space-y-0.5 font-mono dir-ltr bg-slate-950/80 print:bg-slate-100 p-2.5 rounded-xl border border-slate-800 print:border-slate-300">
              <div className="flex items-center gap-2 justify-end text-slate-300 print:text-black">
                <span className="text-[10px] text-slate-400">تاریخ شمسی:</span>
                <strong className="font-bold">{getShamsiDateString()}</strong>
              </div>
              <div className="flex items-center gap-2 justify-end text-slate-300 print:text-black">
                <span className="text-[10px] text-slate-400">تاریخ میلادی:</span>
                <strong className="font-bold">{getMiladiDateString()}</strong>
              </div>
            </div>
          </div>

          {/* Title in large font as requested */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-wide">
              تعهدنامه تسویه حساب هزینه کارگزار
            </h1>
            <p className="text-xs text-amber-400 print:text-amber-700 font-bold">
              (سند رسمی لازمالاجرا جهت تسویه کامل خدمات مشاوره، پشتیبانی و معرفی به کارفرما)
            </p>
          </div>

          {/* Legal Verbatim Contract Clauses */}
          <div className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-5 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-200 print:text-slate-900 leading-loose text-justify">
            <p>
              اینجانب{' '}
              <strong className="text-white print:text-black text-sm sm:text-base font-black px-2 py-0.5 bg-red-950/70 print:bg-red-100 border border-red-500/40 rounded-lg">
                {fullName || '...................................'}
              </strong>{' '}
              فرزند{' '}
              <strong className="text-white print:text-black text-sm sm:text-base font-black px-2 py-0.5 bg-red-950/70 print:bg-red-100 border border-red-500/40 rounded-lg">
                {fatherName || '....................'}
              </strong>{' '}
              به شماره ملی{' '}
              <strong
                className="text-amber-300 print:text-amber-900 text-sm sm:text-base font-black font-mono px-2 py-0.5 bg-amber-950/60 print:bg-amber-100 border border-amber-500/40 rounded-lg inline-block"
                dir="ltr"
              >
                {nationalId || '...............................'}
              </strong>{' '}
              با آگاهی کامل از شرایط و ضوابط اقرار و تأیید نمایم که مبلغ{' '}
              <strong className="text-emerald-300 print:text-emerald-900 text-sm sm:text-base font-black px-2 py-0.5 bg-emerald-950/70 print:bg-emerald-100 border border-emerald-500/40 rounded-lg">
                {serviceFeeText}
              </strong>{' '}
              را بابت هزینه خدمات کارگزار ،مشاوره پشتیبانی و معرفی به کارفرما یا پیمانکار پرداخت نموده ام.
            </p>

            <p>
              اینجانب آگاه هستم که وظیفه کارگزار صرفاً معرفی اینجانب به کارفرما پیمانکار یا فرصت شغلی مورد در خواست بوده و کارگزار هیچ گونه تعهد یا مسئولیتی در قبال استخدام قطعی میزان حقوق و مزایا شرایط کار مدت، همکاری اسکان، بیمه، اقامت مجوز کار یا سایر توافقات احتمالی میان اینجانب و کارفرما یا پیمانکار نخواهد داشت.
            </p>

            <p>
              همچنین تأیید مینمایم که پس از انجام معرفی توسط کارگزار خدمات موضوع این تعهد نامه انجام شده تلقی گردیده و مبلغ پرداختی به عنوان تسویه حساب کامل هزینه خدمات کارگزار محسوب میشود.
            </p>

            <p>
              اینجانب اقرار مینمایم که مبلغ پرداختی فوق تحت هیچ شرایطی قابل استرداد مطالبه عودت یا بازگشت نبوده و حق هرگونه ادعا اعتراض در تمامی مراجع قضایی و یا مطالبه وجه پرداختی را از خود سلب و ساقط مینمایم.
            </p>

            <p className="font-bold text-white print:text-black">
              این تعهدنامه با رضایت کامل آگاهی از مفاد آن و بدون هیچ گونه اجبار یا اکراه تنظیم و امضا گردیده و برای اینجانب لازم الاجرا میباشد.
            </p>
          </div>

          {/* Applicant Info Section (Slightly larger font as requested) */}
          <div className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-4 sm:p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-amber-300 print:text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              مشخصات کامل متقاضی و آدرس سکونت (از بخش‌های قبلی ثبت‌نام):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 print:text-slate-600 block text-[11px]">نام و نام خانوادگی و مشخصات:</span>
                <strong className="text-white print:text-black text-sm font-extrabold block">
                  {fullName} (فرزند {fatherName} - کد ملی: {nationalId})
                </strong>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 print:text-slate-600 block text-[11px]">آدرس کامل متقاضی:</span>
                <strong className="text-white print:text-black text-xs sm:text-sm font-bold block leading-relaxed">
                  استان {iranProvince}، شهرستان {iranCity}، {iranAddress}
                </strong>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 print:text-slate-600 block text-[11px]">شماره تماس متقاضی:</span>
                <strong className="text-emerald-300 print:text-emerald-900 text-sm font-black font-mono block" dir="ltr">
                  {phone || 'ثبت‌نشده'}
                </strong>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 print:text-slate-600 block text-[11px]">کشور مقصد انتخابی:</span>
                <strong className="text-white print:text-black text-sm font-bold block">
                  {targetCountry}
                </strong>
              </div>
            </div>
          </div>

          {/* Attached Document Photos Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white print:text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-400" />
              محل الصاق و یا اسکن کارت شناسایی / پاسپورت و مدارک هویتی متقاضی:
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 bg-slate-950 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-slate-700 block mb-1">عکس تمام قد</span>
                {fullBodyPhotoUrl ? (
                  <img src={fullBodyPhotoUrl} alt="عکس تمام قد" className="h-20 w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-20 bg-slate-900 print:bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                    الصاق نشده
                  </div>
                )}
              </div>

              <div className="p-2 bg-slate-950 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-slate-700 block mb-1">صفحه اول پاسپورت</span>
                {passportPhotoUrl ? (
                  <img src={passportPhotoUrl} alt="پاسپورت" className="h-20 w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-20 bg-slate-900 print:bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                    الصاق نشده
                  </div>
                )}
              </div>

              <div className="p-2 bg-slate-950 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-slate-700 block mb-1">کارت شناسایی / ملی</span>
                {nationalCardPhotoUrl ? (
                  <img src={nationalCardPhotoUrl} alt="کارت ملی" className="h-20 w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-20 bg-slate-900 print:bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                    الصاق نشده
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-2xl space-y-1">
              <span className="text-slate-400 print:text-slate-600 block text-[11px]">
                شماره کارت واریز کننده (که در بخش اول ثبت‌نام از مشتری گرفته شد):
              </span>
              <strong className="text-amber-300 print:text-amber-900 text-sm font-black font-mono block tracking-wider" dir="ltr">
                {payerCardNumber || 'ثبت‌نشده'}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-2xl space-y-1">
              <span className="text-slate-400 print:text-slate-600 block text-[11px]">
                شماره کارت بانکی مقصد کارگزار (کارباما):
              </span>
              <strong className="text-emerald-300 print:text-emerald-900 text-sm font-black font-mono block tracking-wider" dir="ltr">
                {brokerSettings.brokerCardNumber}
              </strong>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                به نام: {brokerSettings.brokerCardHolder} ({brokerSettings.brokerBankName})
              </span>
            </div>
          </div>

          {/* Digital Signature Pad */}
          <div className="p-4 bg-slate-950 print:bg-slate-50 border-2 border-red-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white print:text-black flex items-center gap-1.5">
                <span>محل امضاء متقاضی (ایجاد امضای الکترونیکی رسمی)</span>
                <span className="text-red-500">*</span>
              </label>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-800 print:hidden"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>پاک کردن امضا</span>
                </button>
              )}
            </div>

            {isReadOnly || signatureDataUrl ? (
              <div className="border border-slate-800 print:border-slate-300 rounded-xl p-3 bg-slate-900 print:bg-white text-center">
                {currentSignature ? (
                  <img src={currentSignature} alt="امضای دیجیتال متقاضی" className="h-24 max-w-xs mx-auto object-contain" />
                ) : (
                  <span className="text-xs text-slate-500">امضا ثبت گردید</span>
                )}
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-red-500/50 rounded-2xl bg-white/5 p-1 touch-none">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-28 bg-slate-950 rounded-xl cursor-crosshair"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs gap-1.5">
                    <span>✍️ با لمس صفحه یا کشیدن ماوس در این کادر امضا کنید</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 print:text-slate-700">
                وضعیت امضا:{' '}
                {hasDrawn || currentSignature ? (
                  <strong className="text-emerald-400 font-bold">امضای دیجیتال ثبت گردید ✓</strong>
                ) : (
                  <span className="text-amber-400">در انتظار امضا...</span>
                )}
              </span>
              <span className="text-[10px] text-slate-500">کد امضا: SIG-{nationalId || '000'}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 print:hidden border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            تایید این تعهدنامه به منزله پذیرش حقوقی و کامل تمام مفاد مالی و اداری کارباما می‌باشد.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              بستن
            </button>

            {onAcceptAndSubmit && (
              <button
                onClick={() => {
                  if (!hasDrawn && !currentSignature) {
                    alert('لطفاً ابتدا کادر امضا را لمس نموده و امضای دیجیتال خود را رسم فرمایید.');
                    return;
                  }
                  onAcceptAndSubmit();
                }}
                className="w-full sm:w-auto px-7 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تایید و امضای نهایی تعهدنامه</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
