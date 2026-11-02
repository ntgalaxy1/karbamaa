import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ZarinPalGatewayModal } from './ZarinPalGatewayModal';
import {
  MessageCircle,
  X,
  Send,
  User,
  Phone,
  IdCard,
  Clock,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  RotateCcw,
  ChevronRight,
  CreditCard,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const {
    currentSeeker,
    isAdminLoggedIn,
    chatSessions,
    activeSeekerChat,
    requestLiveChat,
    approveLiveChat,
    rejectLiveChat,
    sendLiveChatMessage,
    markChatRead,
    resetSeekerChat,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  // ZarinPal Payment Flow States
  const [zarinpalModalOpen, setZarinpalModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [zarinpalRefId, setZarinpalRefId] = useState<string | null>(null);

  // Seeker form fields
  const [firstName, setFirstName] = useState(
    currentSeeker?.firstName || currentSeeker?.fullName?.split(' ')[0] || ''
  );
  const [lastName, setLastName] = useState(
    currentSeeker?.lastName || currentSeeker?.fullName?.split(' ').slice(1).join(' ') || ''
  );
  const [phone, setPhone] = useState(currentSeeker?.phone || '');
  const [nationalId, setNationalId] = useState(currentSeeker?.nationalId || '');
  const [formError, setFormError] = useState<string | null>(null);

  // Message input
  const [messageText, setMessageText] = useState('');

  // Admin mode inside widget
  const [widgetMode, setWidgetMode] = useState<'seeker' | 'admin'>(
    isAdminLoggedIn ? 'admin' : 'seeker'
  );
  const [selectedAdminChatId, setSelectedAdminChatId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdminLoggedIn) {
      setWidgetMode('admin');
    } else {
      setWidgetMode('seeker');
    }
  }, [isAdminLoggedIn]);

  // Pre-fill form when seeker logs in
  useEffect(() => {
    if (currentSeeker) {
      if (!firstName) {
        setFirstName(currentSeeker.firstName || currentSeeker.fullName?.split(' ')[0] || '');
      }
      if (!lastName) {
        setLastName(
          currentSeeker.lastName || currentSeeker.fullName?.split(' ').slice(1).join(' ') || ''
        );
      }
      if (!phone) setPhone(currentSeeker.phone || '');
      if (!nationalId) setNationalId(currentSeeker.nationalId || '');
    }
  }, [currentSeeker]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeSeekerChat?.messages.length, selectedAdminChatId, chatSessions]);

  // Mark messages as read when opened
  useEffect(() => {
    if (!isOpen) return;
    if (widgetMode === 'seeker' && activeSeekerChat && activeSeekerChat.unreadBySeeker > 0) {
      markChatRead(activeSeekerChat.id, 'seeker');
    }
    if (widgetMode === 'admin' && selectedAdminChatId) {
      markChatRead(selectedAdminChatId, 'admin');
    }
  }, [isOpen, widgetMode, activeSeekerChat, selectedAdminChatId]);

  const handleStartChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = requestLiveChat({
      firstName,
      lastName,
      phone,
      nationalId,
    });
    if (!res.success) {
      setFormError(res.error || 'لطفاً تمام فیلدها را به درستی تکمیل کنید.');
    }
  };

  const handleSendSeekerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeekerChat || !messageText.trim()) return;
    sendLiveChatMessage(activeSeekerChat.id, 'seeker', messageText);
    setMessageText('');
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminChatId || !messageText.trim()) return;
    sendLiveChatMessage(selectedAdminChatId, 'admin', messageText);
    setMessageText('');
  };

  const pendingChatsCount = chatSessions.filter((c) => c.status === 'pending').length;
  const totalAdminUnread = chatSessions.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0);
  const seekerUnread = activeSeekerChat?.unreadBySeeker || 0;

  const badgeCount = isAdminLoggedIn ? pendingChatsCount + totalAdminUnread : seekerUnread;
  const selectedAdminChat = chatSessions.find((c) => c.id === selectedAdminChatId) || null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
      {/* Chat Popup Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] bg-slate-900 border-2 border-red-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-4 py-3 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-red-700" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black">چت آنلاین با مدیر کارباما</h3>
                <p className="text-[10px] text-red-100">پشتیبانی مستقیم و پاسخگویی آنلاین</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition"
              title="بستن پنجره چت"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Mode Switcher (Only visible if Admin is logged in) */}
          {isAdminLoggedIn && (
            <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 text-[11px] shrink-0">
              <button
                type="button"
                onClick={() => setWidgetMode('admin')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                  widgetMode === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>پنل چت مدیر ({chatSessions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setWidgetMode('seeker')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                  widgetMode === 'seeker'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>فرم کارجو</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* SEEKER VIEW */}
          {/* ========================================================= */}
          {widgetMode === 'seeker' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {!activeSeekerChat ||
              activeSeekerChat.status === 'rejected' ||
              activeSeekerChat.status === 'closed' ? (
                /* STEP 1: Terms Acceptance & ZarinPal Payment OR Registration Form */
                <div className="p-4 space-y-3.5 overflow-y-auto text-xs">
                  {!hasPaid ? (
                    <div className="space-y-3">
                      {/* Banner Notice */}
                      <div className="bg-gradient-to-br from-red-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 rounded-2xl p-3.5 space-y-2.5 text-center shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center mx-auto">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-300 leading-snug">
                          از مبدا تا مقصد و محل کار با شما هستیم
                        </h4>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-bold">
                          حق مشاوره تخصصی و رزرو آنلاین: <span className="text-amber-400 font-black text-xs font-mono">۷۵۰,۰۰۰ تومان</span>
                        </p>

                        <ul className="text-right text-[10px] text-slate-300 space-y-1.5 pt-1 border-t border-slate-800">
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>مشاوره اختصاصی مستقیم با مدیریت کارباما در ترکیه</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>معرفی به فرصت‌های شغلی رسمی همراه با جای خواب و بیمه</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>پشتیبانی کامل و همراهی از لحظه حرکت تا استقرار کامل</span>
                          </li>
                        </ul>
                      </div>

                      {/* Payment Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setZarinpalModalOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-600/30 transition flex items-center justify-center gap-2 text-xs"
                      >
                        <CreditCard className="w-4 h-4 text-slate-950" />
                        <span>قبول شرایط و پرداخت حق مشاوره (۷۵۰,۰۰۰ تومان)</span>
                      </button>
                    </div>
                  ) : (
                    /* Paid State: Form to submit details to Admin */
                    <form onSubmit={handleStartChatSubmit} className="space-y-3">
                      <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-3 text-emerald-200 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>پرداخت حق مشاوره با موفقیت انجام شد!</span>
                        </div>
                        <p className="text-[10px] text-emerald-300/90 font-mono">
                          کد پیگیری زرین‌پال: <strong className="text-white">{zarinpalRefId}</strong> (مبلغ: ۷۵۰,۰۰۰ تومان)
                        </p>
                      </div>

                      {formError && (
                        <div className="p-2.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-[11px]">
                          {formError}
                        </div>
                      )}

                      <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/80 text-[11px] text-slate-300">
                        لطفاً مشخصات خود را تکمیل کنید تا پس از تایید مدیر، چت آنلاین فعال شود:
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">نام (اسم) *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثلاً: علی"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">نام خانوادگی *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثلاً: رضایی"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">شماره تلفن همراه *</label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          placeholder="0912XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">شماره کد ملی (۱۰ رقمی) *</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          dir="ltr"
                          placeholder="0012345678"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-left focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl shadow-lg shadow-red-700/30 transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>ثبت مشخصات و درخواست چت با مدیر</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : activeSeekerChat.status === 'pending' ? (
                /* STEP 2: Waiting for Admin Approval */
                <div className="p-5 text-center space-y-4 overflow-y-auto">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                    <Clock className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black">
                      منتظر تایید مدیر بمانید تا با کارجو چت آنلاین کند ⏳
                    </span>
                    <h4 className="text-sm font-black text-white pt-1">
                      اطلاعات و رسید پرداخت شما ثبت شد
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      از مبدا تا مقصد و محل کار با شما هستیم. لطفاً چند لحظه منتظر بمانید تا مدیر درخواست شما را تایید کند تا صفحه چت دوطرفه فعال گردد.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-right text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">نام و نام خانوادگی:</span>
                      <span className="font-bold text-white">{activeSeekerChat.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">شماره تلفن:</span>
                      <span className="font-mono font-bold text-amber-300" dir="ltr">
                        {activeSeekerChat.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">شماره کد ملی:</span>
                      <span className="font-mono font-bold text-slate-200" dir="ltr">
                        {activeSeekerChat.nationalId}
                      </span>
                    </div>
                    {zarinpalRefId && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                        <span className="text-slate-400">رسید زرین‌پال:</span>
                        <span className="font-mono font-black text-emerald-400" dir="ltr">
                          {zarinpalRefId}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={resetSeekerChat}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ویرایش مشخصات</span>
                  </button>
                </div>
              ) : (
                /* STEP 3: Approved — Active Live Chat with Admin */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-3.5 py-2 flex items-center justify-between text-[11px] text-emerald-300 shrink-0">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      تایید شده توسط مدیر — گفتگو فعال است
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400/80">
                      {activeSeekerChat.fullName}
                    </span>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 max-h-72 bg-slate-950/50">
                    {activeSeekerChat.messages.map((msg) => {
                      const isMe = msg.sender === 'seeker';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                              isMe
                                ? 'bg-red-600 text-white rounded-tr-xs'
                                : 'bg-slate-800 border border-amber-500/40 text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <p className="text-[10px] font-bold opacity-80 mb-0.5">
                              {isMe ? 'شما' : '🛡️ مدیریت کارباما'}
                            </p>
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send Input */}
                  <form
                    onSubmit={handleSendSeekerMessage}
                    className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="پیام خود را برای مدیر بنویسید..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition shrink-0"
                      title="ارسال پیام"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ADMIN VIEW INSIDE WIDGET */}
          {/* ========================================================= */}
          {widgetMode === 'admin' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedAdminChat ? (
                <div className="p-3 overflow-y-auto space-y-2 max-h-80">
                  {chatSessions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      هنوز درخواستی برای چت آنلاین ثبت نشده است.
                    </div>
                  ) : (
                    chatSessions.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{chat.fullName}</span>
                          {chat.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                              منتظر تایید
                            </span>
                          ) : chat.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              در حال گفتگو
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px]">
                              بسته شده
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
                          <div>تلفن: {chat.phone}</div>
                          <div>کد ملی: {chat.nationalId}</div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {chat.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                approveLiveChat(chat.id);
                                setSelectedAdminChatId(chat.id);
                              }}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تایید و شروع چت</span>
                            </button>
                          )}

                          {chat.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => setSelectedAdminChatId(chat.id)}
                              className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[11px] transition flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>ورود به چت ({chat.messages.length})</span>
                            </button>
                          )}

                          {chat.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => rejectLiveChat(chat.id)}
                              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl text-[11px] transition"
                              title="بستن گفتگو"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminChatId(null)}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>بازگشت به لیست</span>
                    </button>
                    <div className="text-left">
                      <span className="font-bold text-white block">{selectedAdminChat.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        کد ملی: {selectedAdminChat.nationalId} | {selectedAdminChat.phone}
                      </span>
                    </div>
                  </div>

                  {selectedAdminChat.status === 'pending' && (
                    <div className="p-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs">
                      <span className="text-amber-200 text-[11px]">این کاربر منتظر تایید شماست:</span>
                      <button
                        type="button"
                        onClick={() => approveLiveChat(selectedAdminChat.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px]"
                      >
                        تایید گفتگو
                      </button>
                    </div>
                  )}

                  <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-64 bg-slate-950/50">
                    {selectedAdminChat.messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                                : 'bg-slate-800 border border-slate-700 text-white rounded-tl-xs'
                            }`}
                          >
                            <p className="text-[10px] font-bold opacity-75 mb-0.5">
                              {isAdmin ? 'شما (مدیر)' : selectedAdminChat.fullName}
                            </p>
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSendAdminMessage}
                    className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="پاسخ مدیر..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Small Round Floating Button at Bottom of Page */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-400/50 text-amber-300 text-[11px] font-black shadow-xl hover:bg-slate-800 transition cursor-pointer"
        >
          چت آنلاین با مدیر
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-14 h-14 flex items-center justify-center bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-full shadow-2xl shadow-red-600/50 border-2 border-amber-300 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          title="چت آنلاین با مدیر"
          aria-label="چت آنلاین با مدیر"
        >
          {/* Online pulsing dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
          </span>

          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* ZarinPal Gateway Modal */}
      <ZarinPalGatewayModal
        isOpen={zarinpalModalOpen}
        onClose={() => setZarinpalModalOpen(false)}
        amountToman={750000}
        description="حق مشاوره تخصصی کاریابی، اسکان و اقامت کارباما"
        onSuccess={(refId) => {
          setHasPaid(true);
          setZarinpalRefId(refId);
          setZarinpalModalOpen(false);

          // If seeker is logged in, auto-submit the chat request immediately
          if (currentSeeker) {
            const fName = currentSeeker.firstName || currentSeeker.fullName?.split(' ')[0] || 'کارجو';
            const lName = currentSeeker.lastName || currentSeeker.fullName?.split(' ').slice(1).join(' ') || '';
            requestLiveChat({
              firstName: fName,
              lastName: lName,
              phone: currentSeeker.phone || '09120000000',
              nationalId: currentSeeker.nationalId || '0012345678',
            });
          }
        }}
      />
    </div>
  );
};
