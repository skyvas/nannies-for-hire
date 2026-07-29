'use client';

import React, { useState } from 'react';
import { brandConfig } from '../../../brand.config';
import { calculateBookingPrice } from '../../lib/services/pricing';
import { Search, Filter, ShieldCheck, Star, MapPin, Calendar, Clock, DollarSign, Users, X, Check, ArrowRight, AlertCircle } from 'lucide-react';

interface Sitter {
  id: string;
  userId: string;
  bio: string;
  headline: string;
  baseHourlyRate: number;
  extraChildRate: number;
  yearsExperience: number;
  cprCertified: boolean;
  hasVehicle: boolean;
  languages: string;
  averageRating: number;
  totalReviews: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
  };
  reviews?: any[];
}

interface SitterSearchClientProps {
  sitters: Sitter[];
  userHousehold: any;
  currentUserId?: string;
  initialNeighborhood?: string;
  initialSitterId?: string;
}

export function SitterSearchClient({
  sitters,
  userHousehold,
  currentUserId,
  initialNeighborhood = '',
  initialSitterId = '',
}: SitterSearchClientProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialNeighborhood);
  const [maxRate, setMaxRate] = useState<number>(35);
  const [cprOnly, setCprOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Booking Modal State
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(
    sitters.find((s) => s.id === initialSitterId) || null
  );
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('18:00');
  const [durationHours, setDurationHours] = useState<number>(4);
  const [numChildren, setNumChildren] = useState<number>(
    userHousehold?.children?.length || 1
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Filter Sitters
  const filteredSitters = sitters.filter((sitter) => {
    if (selectedNeighborhood && !sitter.bio.toLowerCase().includes(selectedNeighborhood.toLowerCase()) && !sitter.headline.toLowerCase().includes(selectedNeighborhood.toLowerCase())) {
      // Allow flexible matching
    }
    if (sitter.baseHourlyRate > maxRate) return false;
    if (cprOnly && !sitter.cprCertified) return false;
    if (sitter.averageRating < minRating) return false;
    return true;
  });

  // Price Calculation for Modal
  const priceBreakdown = selectedSitter
    ? calculateBookingPrice(
        selectedSitter.baseHourlyRate,
        selectedSitter.extraChildRate,
        numChildren,
        durationHours
      )
    : null;

  // Today in Vancouver (America/Vancouver timezone format YYYY-MM-DD)
  const todayInVancouver = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Vancouver' });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSitter) return;
    if (!bookingDate) {
      setBookingError('Please select a valid booking date.');
      return;
    }

    const startDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
    if (startDateTime.getTime() < Date.now() - 60000) {
      setBookingError('Booking start time cannot be in the past. Please select a future date and time in Vancouver.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const startDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 3600000);

      const res = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sitterProfileId: selectedSitter.id,
          householdId: userHousehold?.id || 'demo_household_1',
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          numChildren,
          durationHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request.');
      }

      setBookingSuccess(`Booking request sent to ${selectedSitter.user.firstName}! The sitter has 2 hours to accept.`);
    } catch (err: any) {
      setBookingError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" /> Filter Caregivers
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredSitters.length} available sitters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
          {/* Neighborhood Filter */}
          <div className="space-y-1">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Metro Vancouver Area
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              {brandConfig.cities.map((city) => (
                <optgroup key={city.name} label={city.name}>
                  {city.neighborhoods.map((n) => (
                    <option key={n} value={n}>
                      {n} ({city.name})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Max Hourly Rate */}
          <div className="space-y-1">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Max Base Rate: ${maxRate}/hr CAD
            </label>
            <input
              type="range"
              min="18"
              max="40"
              step="1"
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer py-2"
            />
          </div>

          {/* CPR Certified Toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-slate-700 font-semibold">CPR Certified Only</span>
            <input
              type="checkbox"
              checked={cprOnly}
              onChange={(e) => setCprOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Rating Filter */}
          <div className="space-y-1">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Rating Threshold
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">★ 4.5 & Above</option>
              <option value="4.8">★ 4.8 & Above</option>
              <option value="5.0">★ 5.0 Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sitter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSitters.map((sitter) => (
          <div
            key={sitter.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={sitter.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={sitter.user.firstName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {sitter.user.firstName} {sitter.user.lastName.charAt(0)}.
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{sitter.averageRating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({sitter.totalReviews})</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 block">
                    ${sitter.baseHourlyRate.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    +${sitter.extraChildRate.toFixed(2)}/extra kid
                  </span>
                </div>
              </div>

              <p className="font-semibold text-xs text-slate-800 line-clamp-1">
                {sitter.headline}
              </p>

              <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                {sitter.bio}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {sitter.cprCertified && (
                  <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600" /> CPR Certified
                  </span>
                )}
                {sitter.hasVehicle && (
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    Has Car
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {sitter.yearsExperience}+ Yrs Exp
                </span>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Metro Vancouver
              </span>

              <button
                onClick={() => {
                  setSelectedSitter(sitter);
                  setBookingSuccess(null);
                  setBookingError(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                Request Booking
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedSitter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedSitter.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  className="w-10 h-10 rounded-full object-cover border border-blue-200"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Request {selectedSitter.user.firstName} {selectedSitter.user.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">1:1 Direct Request • 2-Hour Acceptance Window</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSitter(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-center space-y-3">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">{bookingSuccess}</p>
                <button
                  onClick={() => setSelectedSitter(null)}
                  className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Close & View Bookings
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-medium">
                {bookingError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Booking Date
                    </label>
                    <input
                      type="date"
                      required
                      min={todayInVancouver}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Duration (Hours)
                    </label>
                    <select
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2}>2 Hours (Min)</option>
                      <option value={3}>3 Hours</option>
                      <option value={4}>4 Hours</option>
                      <option value={5}>5 Hours</option>
                      <option value={6}>6 Hours</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Number of Children
                    </label>
                    <select
                      value={numChildren}
                      onChange={(e) => setNumChildren(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 Child (${selectedSitter.baseHourlyRate}/hr)</option>
                      <option value={2}>
                        2 Children (+${selectedSitter.extraChildRate}/hr)
                      </option>
                      <option value={3}>
                        3 Children (+${selectedSitter.extraChildRate * 2}/hr)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Price Breakdown Calculation Card */}
                {priceBreakdown && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Effective Hourly Rate:</span>
                      <span className="font-semibold">${priceBreakdown.effectiveHourlyRate.toFixed(2)}/hr CAD</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Job Subtotal ({priceBreakdown.hours} hrs):</span>
                      <span className="font-semibold">${priceBreakdown.subtotalAmount.toFixed(2)} CAD</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>15% Platform Commission:</span>
                      <span className="font-semibold">${priceBreakdown.platformFee.toFixed(2)} CAD</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-slate-900 font-extrabold text-sm">
                      <span>Total Estimated Cost:</span>
                      <span className="text-blue-600">${priceBreakdown.totalAmount.toFixed(2)} CAD</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting Request...' : `Send Request to ${selectedSitter.user.firstName}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
