import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  X,
  Send,
  Clock,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  ChevronRight,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const {
    currentSeeker,
    isAdminLoggedIn,
    chatSessions,
    activeSeekerChat,
    approveLiveChat,
    rejectLiveChat,
    sendLiveChatMessage,
    markChatRead,
    paymentSettings,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  // Message input
  const [messageText, setMessageText] = useState('');

  // Selected Chat for Admin View
  const [selectedAdminChatId, setSelectedAdminChatId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic consultation fee configured in Admin Panel
  const consultationFeeToman =
    paymentSettings?.consultationFeeToman && paymentSettings.consultationFeeToman > 0
      ? paymentSettings.consultationFeeToman
      : paymentSettings?.consultationFeeTL && paymentSettings.consultationFeeTL > 0
        ? paymentSettings.consultationFeeTL * (paymentSettings?.exchangeRateToman || 5460)
        : 750000;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeSeekerChat?.messages.length, selectedAdminChatId, chatSessions]);

  // Mark messages as read when opened
  useEffect(() => {
    if (!isOpen) return;
    if (!isAdminLoggedIn && activeSeekerChat && activeSeekerChat.unreadBySeeker > 0) {
      markChatRead(activeSeekerChat.id, 'seeker');
    }
    if (isAdminLoggedIn && selectedAdminChatId) {
      markChatRead(selectedAdminChatId, 'admin');
    }
  }, [isOpen, isAdminLoggedIn, activeSeekerChat, selectedAdminChatId, markChatRead]);

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

  const selectedAdminChat = chatSessions.find((c) => c.id === selectedAdminChatId) || null;

  return (
    <div className="fixed bottom-20 right-3 z-50 flex flex-col items-end">
      {/* Chat Popup Window */}
      {isOpen && (
        <div className="mb-2 w-72 sm:w-80 max-h-[58vh] bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-3 py-2.5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <img
                  src="/logo.png"
                  alt="کارباما"
                  className="w-8 h-8 rounded-full object-cover border-2 border-amber-300 shadow-sm bg-slate-950"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-red-700" />
              </div>
              <div>
                <h3 className="text-xs font-black leading-tight text-white">چت آنلاین با مدیر کارباما</h3>
                <p className="text-[9px] text-amber-100 leading-tight">پشتیبانی مستقیم و پاسخگویی آنلاین</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
              title="بستن پنجره چت"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ========================================================= */}
          {/* SEEKER VIEW (When Admin is NOT logged in) */}
          {/* ========================================================= */}
          {!isAdminLoggedIn && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* STATE 1: UNPAID OR NO REQUEST YET */}
              {!activeSeekerChat ||
              activeSeekerChat.status === 'rejected' ||
              activeSeekerChat.status === 'closed' ||
              !activeSeekerChat.isConsultationPaid ? (
                <div className="p-3 space-y-3 overflow-y-auto text-[11px]">
                  <div className="bg-gradient-to-br from-red-950/90 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-xl p-3 space-y-2 text-center shadow-md">
                    <img
                      src="/logo.png"
                      alt="کارباما"
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 mx-auto shadow-md bg-slate-950"
                    />
                    <h4 className="text-xs font-black text-amber-300 leading-snug">
                      از مبدا تا مقصد و محل کار با شما هستیم
                    </h4>
                    <p className="text-[11px] text-white leading-relaxed font-bold">
                      حق مشاوره {consultationFeeToman.toLocaleString('fa-IR')} تومان
                    </p>

                    <ul className="text-right text-[10px] text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>مشاوره تخصصی مستقیم با مدیریت کارباما</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>معرفی به فرصت‌های شغلی رسمی با جای خواب و امکانات رفاهی</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>پشتیبانی کامل از لحظه حرکت تا استقرار</span>
                      </li>
                    </ul>
                  </div>

                  {/* Payment Trigger Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const adminAmountUnit = paymentSettings?.paymentAmountUnit || 'toman';
                      const adminConfiguredAmount =
                        adminAmountUnit === 'rial'
                          ? consultationFeeToman * 10
                          : consultationFeeToman;
                      if (adminAmountUnit === 'toman') {
                        window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}&unit=toman`;
                      } else {
                        window.location.href = `https://karbama34.ir/pay.php?amount=${adminConfiguredAmount}`;
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>پرداخت آنلاین ({consultationFeeToman.toLocaleString('fa-IR')} تومان)</span>
                  </button>
                </div>
              ) : activeSeekerChat.status === 'pending' ? (
                /* STATE 2: PAID, WAITING FOR ADMIN APPROVAL */
                <div className="p-4 text-center space-y-2.5 overflow-y-auto">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                    <Clock className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                      منتظر تایید مدیر بمانید ⏳
                    </span>
                    <h4 className="text-xs font-black text-amber-300 pt-0.5">
                      از مبدا تا مقصد و محل کار با شما هستیم
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      حق مشاوره پرداخت شد. لطفاً منتظر تایید مدیر بمانید تا چت باز شود.
                    </p>
                  </div>
                </div>
              ) : (
                /* STATE 3: APPROVED BY ADMIN */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-3 py-1.5 flex items-center justify-between text-[10px] text-emerald-300 shrink-0">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      گفتگو با مدیریت فعال است
                    </span>
                    <span className="font-mono text-[9px] text-emerald-400/80 truncate max-w-[110px]">
                      {activeSeekerChat.fullName}
                    </span>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-56 bg-slate-950/50">
                    {activeSeekerChat.messages.map((msg) => {
                      const isMe = msg.sender === 'seeker';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-1.5 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <img
                            src={
                              isMe && (currentSeeker?.fullBodyPhotoUrl || currentSeeker?.passportPhotoUrl)
                                ? currentSeeker.fullBodyPhotoUrl || currentSeeker.passportPhotoUrl
                                : '/logo.png'
                            }
                            alt={isMe ? activeSeekerChat.fullName : 'مدیریت کارباما'}
                            className="w-6 h-6 rounded-full object-cover border border-amber-400/60 shrink-0 bg-slate-900"
                          />
                          <div
                            className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-[11px] leading-relaxed ${
                              isMe
                                ? 'bg-red-600 text-white rounded-tr-xs'
                                : 'bg-slate-800 border border-amber-500/40 text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <p className="text-[9px] font-bold opacity-85 mb-0.5">
                              {isMe ? activeSeekerChat.fullName : '🛡️ مدیریت کارباما'}
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
                    className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="پیام خود را بنویسید..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition shrink-0"
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
          {isAdminLoggedIn && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedAdminChat ? (
                <div className="p-2.5 overflow-y-auto space-y-2 max-h-60">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-amber-300 font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>پنل چت آنلاین مدیریت</span>
                  </div>

                  {chatSessions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      هنوز درخواستی ثبت نشده است.
                    </div>
                  ) : (
                    chatSessions.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img
                              src="/logo.png"
                              alt={chat.fullName}
                              className="w-6 h-6 rounded-full object-cover border border-amber-400/50 shrink-0 bg-slate-950"
                            />
                            <span className="font-bold text-white truncate">{chat.fullName}</span>
                          </div>
                          {chat.status === 'pending' ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold shrink-0">
                              منتظر تایید
                            </span>
                          ) : chat.status === 'approved' ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold shrink-0">
                              فعال
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] shrink-0">
                              بسته
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-300 space-y-0.5 font-mono">
                          <div>تلفن: {chat.phone}</div>
                          <div>کد ملی: {chat.nationalId}</div>
                        </div>

                        <div className="flex items-center gap-1 pt-0.5">
                          {chat.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                approveLiveChat(chat.id);
                                setSelectedAdminChatId(chat.id);
                              }}
                              className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تایید و چت</span>
                            </button>
                          )}

                          {chat.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => setSelectedAdminChatId(chat.id)}
                              className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>ورود ({chat.messages.length})</span>
                            </button>
                          )}

                          {chat.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => rejectLiveChat(chat.id)}
                              className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-[10px] transition"
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
                  <div className="bg-slate-800 px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-[11px] shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminChatId(null)}
                      className="text-amber-400 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>بازگشت</span>
                    </button>
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <img
                        src="/logo.png"
                        alt={selectedAdminChat.fullName}
                        className="w-5 h-5 rounded-full object-cover border border-amber-400/50 shrink-0"
                      />
                      <div className="text-left truncate">
                        <span className="font-bold text-white block text-[10px] truncate">{selectedAdminChat.fullName}</span>
                        <span className="text-[8px] text-slate-400 font-mono">
                          {selectedAdminChat.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedAdminChat.status === 'pending' && (
                    <div className="p-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-[10px]">
                      <span className="text-amber-200">منتظر تایید شما:</span>
                      <button
                        type="button"
                        onClick={() => approveLiveChat(selectedAdminChat.id)}
                        className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-[10px]"
                      >
                        تایید گفتگو
                      </button>
                    </div>
                  )}

                  <div className="flex-1 p-2.5 overflow-y-auto space-y-2 max-h-48 bg-slate-950/50">
                    {selectedAdminChat.messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-1.5 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <img
                            src="/logo.png"
                            alt={isAdmin ? 'مدیر' : selectedAdminChat.fullName}
                            className="w-6 h-6 rounded-full object-cover border border-amber-400/60 shrink-0 bg-slate-900"
                          />
                          <div
                            className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-[11px] ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                                : 'bg-slate-800 border border-slate-700 text-white rounded-tl-xs'
                            }`}
                          >
                            <p className="text-[9px] font-bold opacity-80 mb-0.5">
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
                    className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="پاسخ مدیر..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition shrink-0"
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

      {/* Floating Action Button at Bottom of Page */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2.5 py-1 rounded-full bg-slate-900/95 border border-amber-400/50 text-amber-300 text-[10px] font-black shadow-lg hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
        >
          <img
            src="/logo.png"
            alt="کارباما"
            className="w-4 h-4 rounded-full object-cover border border-amber-400"
          />
          <span>چت آنلاین با مدیر</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-full shadow-xl shadow-red-600/50 border border-amber-300 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          title="چت آنلاین با مدیر"
          aria-label="چت آنلاین با مدیر"
        >
          {/* Online pulsing dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950" />
          </span>

          {isOpen ? (
            <X className="w-4 h-4 text-white" />
          ) : (
            <MessageCircle className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};
