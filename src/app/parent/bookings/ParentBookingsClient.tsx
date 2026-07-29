'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Star, MessageSquare, ShieldCheck, CheckCircle2, DollarSign, X } from 'lucide-react';
import { ChatWindow } from '../../../components/chat/ChatWindow';

interface ParentBookingsClientProps {
  bookings: any[];
  currentUserId?: string;
}

export function ParentBookingsClient({ bookings: initialBookings, currentUserId }: ParentBookingsClientProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<any | null>(null);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>(['Punctual', 'Great with Toddlers']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingForReview.id,
          targetId: selectedBookingForReview.sitterProfile.user.id,
          rating,
          comment,
          tags,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBookingForReview.id
              ? { ...b, reviews: [...(b.reviews || []), data.review] }
              : b
          )
        );
        setSelectedBookingForReview(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <h2 className="font-bold text-lg text-slate-900">All Bookings ({bookings.length})</h2>

        <div className="space-y-4">
          {bookings.map((b) => {
            const sitter = b.sitterProfile;
            const hasReview = b.reviews && b.reviews.length > 0;
            const isChatActive = activeChatBooking?.id === b.id;

            return (
              <div
                key={b.id}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={sitter.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      className="w-12 h-12 rounded-full object-cover border border-blue-200"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        {sitter.user.firstName} {sitter.user.lastName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        📅 {new Date(b.startDateTime).toLocaleDateString()} ({b.numChildren} Children)
                      </p>
                    </div>
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

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 block">
                        ${b.totalAmount.toFixed(2)} CAD
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Includes 15% Fee: ${b.platformFee.toFixed(2)})
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      b.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Embedded Live Chat Container when active */}
                {isChatActive && (
                  <div className="pt-3 border-t border-slate-200">
                    <ChatWindow
                      bookingId={b.id}
                      currentUserId={currentUserId || 'demo_parent_1'}
                      otherPartyName={`${sitter.user.firstName} ${sitter.user.lastName}`}
                      otherPartyAvatar={sitter.user.avatarUrl}
                      initialMessages={b.messages || []}
                    />
                  </div>
                )}

                {/* Review Action */}
                {(b.status === 'SETTLED' || b.status === 'COMPLETED') && (
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    {hasReview ? (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 w-full text-slate-700 space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{b.reviews[0].rating} / 5 Stars</span>
                          <span className="text-slate-400 font-normal text-[11px] ml-2">"{b.reviews[0].comment}"</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4 fill-white" /> Rate & Review Sitter
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Rate & Review {selectedBookingForReview.sitterProfile.user.firstName}
              </h3>
              <button
                onClick={() => setSelectedBookingForReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Overall Rating (1-5 Stars)
                </label>
                <div className="flex items-center gap-2 text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Review Comment
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback on punctuality, bedtime routines, cleanliness..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Highlight Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Punctual', 'Great with Toddlers', 'Clean', 'Responsive', 'Patient', 'CPR Confident'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        tags.includes(t)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
