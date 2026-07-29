'use client';

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, CheckCircle2, XCircle, Play, Square, MessageSquare, AlertCircle, MapPin, User, Heart } from 'lucide-react';
import { ChatWindow } from '../../../components/chat/ChatWindow';

interface SitterJobsClientProps {
  sitterProfile: any;
  bookings: any[];
  currentUserId?: string;
}

export function SitterJobsClient({ sitterProfile, bookings: initialBookings, currentUserId }: SitterJobsClientProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<any | null>(null);

  const handleAction = async (bookingId: string, action: 'ACCEPT' | 'DECLINE' | 'START_SITTING' | 'END_SITTING') => {
    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: data.booking.status } : b))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const requestedBookings = bookings.filter((b) => b.status === 'REQUESTED');
  const activeBookings = bookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter((b) => ['SETTLED', 'COMPLETED'].includes(b.status));

  return (
    <div className="space-y-8">
      {/* Rate Breakdown Card */}
      {sitterProfile && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Current Caregiver Rates
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              ${sitterProfile.baseHourlyRate.toFixed(2)} CAD / hr (1 Child)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              +${sitterProfile.extraChildRate.toFixed(2)} CAD / hr per additional child
            </p>
          </div>

          <div className="bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>85% Payout Direct to Bank Account</span>
          </div>
        </div>
      )}

      {/* Incoming Requests */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Incoming Booking Requests ({requestedBookings.length})
          </h2>
        </div>

        {requestedBookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No pending booking requests right now.</p>
        ) : (
          <div className="space-y-4">
            {requestedBookings.map((b) => {
              const isChatActive = activeChatBooking?.id === b.id;
              const parentUser = b.household?.members?.[0]?.user;

              return (
                <div key={b.id} className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        {b.household.familyName} ({b.household.neighborhood})
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        📅 Date: {new Date(b.startDateTime).toLocaleDateString()} • {new Date(b.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(b.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        👶 Children ({b.numChildren}): {b.household.children.map((c: any) => `${c.firstName} (${c.allergies || 'No allergies'})`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-emerald-700 block">
                        ${b.subtotalAmount.toFixed(2)} CAD
                      </span>
                      <span className="text-[10px] text-slate-400">Sitter Payout</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                    <button
                      onClick={() => setActiveChatBooking(isChatActive ? null : b)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                        isChatActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" /> {isChatActive ? 'Close Live Chat' : 'Open Live Chat'}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAction(b.id, 'DECLINE')}
                        disabled={processingId === b.id}
                        className="bg-white hover:bg-red-50 text-red-700 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAction(b.id, 'ACCEPT')}
                        disabled={processingId === b.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept Job Request
                      </button>
                    </div>
                  </div>

                  {isChatActive && (
                    <div className="pt-3 border-t border-amber-200/60">
                      <ChatWindow
                        bookingId={b.id}
                        currentUserId={currentUserId || sitterProfile?.userId || 'demo_sitter_1'}
                        otherPartyName={parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : b.household.familyName}
                        otherPartyAvatar={parentUser?.avatarUrl}
                        initialMessages={b.messages || []}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmed / In Progress Jobs (Live Clocking) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600 fill-blue-600/20" /> Confirmed & Active Jobs ({activeBookings.length})
        </h2>

        {activeBookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No active jobs in progress.</p>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((b) => {
              const isChatActive = activeChatBooking?.id === b.id;
              const parentUser = b.household?.members?.[0]?.user;

              return (
                <div key={b.id} className="bg-blue-50/50 rounded-2xl p-5 border border-blue-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{b.household.familyName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white animate-pulse' : 'bg-blue-600 text-white'
                        }`}>
                          {b.status === 'IN_PROGRESS' ? 'SITTING IN PROGRESS' : 'CONFIRMED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">📍 Address: {b.household.address}, {b.household.neighborhood}</p>
                      <p className="text-xs text-slate-600 font-medium">
                        👶 Children ({b.numChildren}): {b.household.children.map((c: any) => c.firstName).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        id={`open-chat-btn-${b.id}`}
                        data-testid={`open-chat-btn-${b.id}`}
                        onClick={() => setActiveChatBooking(isChatActive ? null : b)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                          isChatActive
                            ? 'bg-slate-900 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" /> {isChatActive ? 'Close Live Chat' : 'Open Live Chat'}
                      </button>

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleAction(b.id, 'START_SITTING')}
                          disabled={processingId === b.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-white" /> Start Sitting (Arrival)
                        </button>
                      )}

                      {b.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleAction(b.id, 'END_SITTING')}
                          disabled={processingId === b.id}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 animate-bounce"
                        >
                          <Square className="w-4 h-4 fill-white" /> End Sitting (Departure)
                        </button>
                      )}
                    </div>
                  </div>

                  {isChatActive && (
                    <div className="pt-3 border-t border-blue-200">
                      <ChatWindow
                        bookingId={b.id}
                        currentUserId={currentUserId || sitterProfile?.userId || 'demo_sitter_1'}
                        otherPartyName={parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : b.household.familyName}
                        otherPartyAvatar={parentUser?.avatarUrl}
                        initialMessages={b.messages || []}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-base text-slate-900">Completed Jobs & Earnings History ({completedBookings.length})</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {completedBookings.map((b) => {
            const isChatActive = activeChatBooking?.id === b.id;
            const parentUser = b.household?.members?.[0]?.user;

            return (
              <div key={b.id} className="py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{b.household.familyName}</span>
                    <span className="text-slate-400 ml-2">({b.numChildren} kids • {new Date(b.startDateTime).toLocaleDateString()})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      id={`open-chat-btn-${b.id}`}
                      data-testid={`open-chat-btn-${b.id}`}
                      onClick={() => setActiveChatBooking(isChatActive ? null : b)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                        isChatActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {isChatActive ? 'Close Chat' : 'Open Live Chat'}
                    </button>
                    <span className="font-extrabold text-emerald-700">+${b.subtotalAmount.toFixed(2)} CAD</span>
                  </div>
                </div>

                {isChatActive && (
                  <div className="pt-2">
                    <ChatWindow
                      bookingId={b.id}
                      currentUserId={currentUserId || sitterProfile?.userId || 'demo_sitter_1'}
                      otherPartyName={parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : b.household.familyName}
                      otherPartyAvatar={parentUser?.avatarUrl}
                      initialMessages={b.messages || []}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
