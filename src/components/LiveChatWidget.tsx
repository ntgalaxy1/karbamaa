import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ZarinPalGatewayModal } from './ZarinPalGatewayModal';
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
    requestLiveChat,
    approveLiveChat,
    rejectLiveChat,
    sendLiveChatMessage,
    markChatRead,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  // ZarinPal Payment Flow States
  const [zarinpalModalOpen, setZarinpalModalOpen] = useState(false);
  const [zarinpalRefId, setZarinpalRefId] = useState<string | null>(null);

  // Message input
  const [messageText, setMessageText] = useState('');

  // Selected Chat for Admin View
  const [selectedAdminChatId, setSelectedAdminChatId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      {/* Chat Popup Window (Scaled to ~2/3 size) */}
      {isOpen && (
        <div className="mb-2 w-64 sm:w-64 max-h-[50vh] bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-2.5 py-2 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-red-700" />
              </div>
              <div>
                <h3 className="text-[11px] font-black leading-tight">چت آنلاین با مدیر کارباما</h3>
                <p className="text-[8px] text-red-100 leading-tight">پشتیبانی مستقیم و پاسخگویی آنلاین</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
              title="بستن پنجره چت"
            >
              <X className="w-3 h-3" />
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
                <div className="p-2.5 space-y-2.5 overflow-y-auto text-[10px]">
                  <div className="bg-gradient-to-br from-red-950/90 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-xl p-2.5 space-y-1.5 text-center shadow-md">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-[11px] font-black text-amber-300 leading-snug">
                      از مبدا تا مقصد و محل کار با شما هستیم
                    </h4>
                    <p className="text-[10px] text-slate-200 leading-relaxed font-bold">
                      حق مشاوره ۷۵۰ هزار تومان
                    </p>

                    <ul className="text-right text-[9px] text-slate-300 space-y-1 pt-1.5 border-t border-slate-800">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>مشاوره تخصصی مستقیم با مدیریت کارباما</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>معرفی به فرصت‌های شغلی رسمی با جای خواب و بیمه</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>پشتیبانی کامل از لحظه حرکت تا استقرار</span>
                      </li>
                    </ul>
                  </div>

                  {/* Payment Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setZarinpalModalOpen(true)}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-1.5 text-[10px] cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                    <span>پرداخت آنلاین حق مشاوره (۷۵۰,۰۰۰ تومان)</span>
                  </button>
                </div>
              ) : activeSeekerChat.status === 'pending' ? (
                /* STATE 2: PAID, WAITING FOR ADMIN APPROVAL */
                <div className="p-3 text-center space-y-2.5 overflow-y-auto">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                    <Clock className="w-4 h-4" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black">
                      منتظر تایید مدیر بمانید ⏳
                    </span>
                    <h4 className="text-[11px] font-black text-amber-300 pt-0.5">
                      از مبدا تا مقصد و محل کار با شما هستیم
                    </h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      حق مشاوره (۷۵۰,۰۰۰ تومان) پرداخت شد. لطفاً منتظر تایید مدیر بمانید تا چت باز شود.
                    </p>
                  </div>

                  {zarinpalRefId && (
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-right text-[9px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">کد رهگیری:</span>
                        <span className="font-mono font-black text-emerald-400" dir="ltr">
                          {zarinpalRefId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">مبلغ واریزی:</span>
                        <span className="font-mono font-bold text-white">۷۵۰,۰۰۰ تومان</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* STATE 3: APPROVED BY ADMIN */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-2.5 py-1.5 flex items-center justify-between text-[9px] text-emerald-300 shrink-0">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      گفتگو با مدیریت فعال است
                    </span>
                    <span className="font-mono text-[8px] text-emerald-400/80 truncate max-w-[90px]">
                      {activeSeekerChat.fullName}
                    </span>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 max-h-48 bg-slate-950/50">
                    {activeSeekerChat.messages.map((msg) => {
                      const isMe = msg.sender === 'seeker';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10px] leading-relaxed ${
                              isMe
                                ? 'bg-red-600 text-white rounded-tr-xs'
                                : 'bg-slate-800 border border-amber-500/40 text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <p className="text-[8px] font-bold opacity-80 mb-0.5">
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
                    className="p-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="پیام خود را بنویسید..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition shrink-0"
                      title="ارسال پیام"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ADMIN VIEW INSIDE WIDGET (NO SEEKER FORM TAB) */}
          {/* ========================================================= */}
          {isAdminLoggedIn && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedAdminChat ? (
                <div className="p-2 overflow-y-auto space-y-1.5 max-h-52">
                  <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-amber-300 font-bold flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>پنل چت آنلاین مدیریت</span>
                  </div>

                  {chatSessions.length === 0 ? (
                    <div className="py-6 text-center text-[10px] text-slate-400">
                      هنوز درخواستی ثبت نشده است.
                    </div>
                  ) : (
                    chatSessions.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5 text-[10px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[110px]">{chat.fullName}</span>
                          {chat.status === 'pending' ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                              منتظر تایید
                            </span>
                          ) : chat.status === 'approved' ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-bold">
                              فعال
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[8px]">
                              بسته
                            </span>
                          )}
                        </div>

                        <div className="text-[9px] text-slate-300 space-y-0.5 font-mono">
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
                              className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[9px] transition flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تایید و چت</span>
                            </button>
                          )}

                          {chat.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => setSelectedAdminChatId(chat.id)}
                              className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[9px] transition flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>ورود ({chat.messages.length})</span>
                            </button>
                          )}

                          {chat.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => rejectLiveChat(chat.id)}
                              className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-[9px] transition"
                              title="بستن گفتگو"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-slate-800 px-2.5 py-1.5 border-b border-slate-700 flex items-center justify-between text-[10px] shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminChatId(null)}
                      className="text-amber-400 hover:underline flex items-center gap-0.5 text-[9px] font-bold"
                    >
                      <ChevronRight className="w-3 h-3" />
                      <span>بازگشت</span>
                    </button>
                    <div className="text-left truncate max-w-[130px]">
                      <span className="font-bold text-white block text-[10px] truncate">{selectedAdminChat.fullName}</span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {selectedAdminChat.phone}
                      </span>
                    </div>
                  </div>

                  {selectedAdminChat.status === 'pending' && (
                    <div className="p-1.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-[9px]">
                      <span className="text-amber-200">منتظر تایید شما:</span>
                      <button
                        type="button"
                        onClick={() => approveLiveChat(selectedAdminChat.id)}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-[9px]"
                      >
                        تایید گفتگو
                      </button>
                    </div>
                  )}

                  <div className="flex-1 p-2 overflow-y-auto space-y-1.5 max-h-44 bg-slate-950/50">
                    {selectedAdminChat.messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10px] ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                                : 'bg-slate-800 border border-slate-700 text-white rounded-tl-xs'
                            }`}
                          >
                            <p className="text-[8px] font-bold opacity-75 mb-0.5">
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
                    className="p-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="پاسخ مدیر..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Small Round Floating Button at Bottom of Page (~2/3 size) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1 rounded-full bg-slate-900/95 border border-amber-400/50 text-amber-300 text-[9px] font-black shadow-lg hover:bg-slate-800 transition cursor-pointer"
        >
          چت آنلاین با مدیر
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-9 h-9 flex items-center justify-center bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-full shadow-xl shadow-red-600/50 border border-amber-300 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
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

      {/* ZarinPal Gateway Modal */}
      <ZarinPalGatewayModal
        isOpen={zarinpalModalOpen}
        onClose={() => setZarinpalModalOpen(false)}
        amountToman={750000}
        description="حق مشاوره تخصصی کاریابی، اسکان و اقامت کارباما"
        onSuccess={(refId) => {
          setZarinpalRefId(refId);
          setZarinpalModalOpen(false);

          const fName = currentSeeker?.firstName || currentSeeker?.fullName?.split(' ')[0] || 'کارجو';
          const lName = currentSeeker?.lastName || currentSeeker?.fullName?.split(' ').slice(1).join(' ') || 'عزیز';
          const phoneNum = currentSeeker?.phone || '۰۹۱۲۰۰۰۰۰۰۰';
          const natId = currentSeeker?.nationalId || '۰۰۰۰۰۰۰۰۰۰';

          requestLiveChat({
            firstName: fName,
            lastName: lName,
            phone: phoneNum,
            nationalId: natId,
          });
        }}
      />
    </div>
  );
};
