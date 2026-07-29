import React from 'react';
import Link from 'next/link';
import { db } from '../lib/db';
import { getCurrentSession } from '../lib/adapters/auth';
import { brandConfig } from '../../brand.config';
import { Navbar } from '../components/branding/Navbar';
import { Footer } from '../components/branding/Footer';
import { DemoRoleSwitcher } from '../components/demo/DemoRoleSwitcher';
import { Search, ShieldCheck, HeartHandshake, Star, MapPin, Calendar, Clock, Sparkles, CheckCircle2, DollarSign, Award, ChevronRight } from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function HomePage() {
  const session = await getCurrentSession();

  // Fetch approved sitters for homepage showcase
  const approvedSitters = await db.sitterProfile.findMany({
    where: { verificationStatus: 'APPROVED' },
    include: { user: true },
    take: 3,
  });

  // Fetch all users for Demo Role Switcher
  const allUsers = await db.user.findMany({
    include: { sitterProfile: true },
  });

  const demoUserOptions = allUsers.map((u) => {
    let detail = `Role: ${u.role}`;
    if (u.role === 'SITTER' && u.sitterProfile) {
      detail = `${u.sitterProfile.verificationStatus} Sitter • $${u.sitterProfile.baseHourlyRate}/hr`;
    } else if (u.role === 'PARENT') {
      detail = 'Metro Vancouver Parent';
    } else if (u.role === 'ADMIN') {
      detail = 'Platform Administrator';
    }
    return {
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role as 'PARENT' | 'SITTER' | 'ADMIN',
      detail,
    };
  });

  // Count pending vetters for admin navbar badge
  const pendingVettingCount = await db.sitterProfile.count({
    where: { verificationStatus: 'PENDING_VERIFICATION' },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Branded Header */}
      <Navbar currentUser={session.user} pendingVettingCount={pendingVettingCount} />

      {/* Hero Section with Vibrant Gradient & Micro-Animations */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative Glassmorphic Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Serving All Metro Vancouver Cities • 100% Local & Verified</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Book Trusted, Local <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
              Babysitters in Metro Vancouver
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {brandConfig.description}
          </p>

          {/* Quick Search Action Box */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-200/80 text-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full flex items-center gap-2.5 bg-slate-50 px-3.5 py-3 rounded-xl border border-slate-200">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Neighborhood
                  </label>
                  <select className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer">
                    <option value="">All Metro Vancouver Cities</option>
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
              </div>

              <div className="w-full sm:w-auto">
                <Link
                  href="/search"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  Search Sitters
                </Link>
              </div>
            </div>
          </div>

          {/* Key Stat Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              15% Protected Marketplace Commission
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Manual Government ID Vetting
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              4-Hour Minimum Advance Notice
            </span>
          </div>

        </div>
      </section>

      {/* Featured Verified Caregivers Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" /> Background Vetted Caregivers
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Top-Rated Sitters
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Experienced, Red Cross CPR certified caregivers available for evening & weekend bookings.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline group"
          >
            View All Verified Sitters <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedSitters.map((sitter) => (
            <div
              key={sitter.id}
              className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={sitter.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={`${sitter.user.firstName}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {sitter.user.firstName} {sitter.user.lastName.charAt(0)}.
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{sitter.averageRating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({sitter.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    ${sitter.baseHourlyRate.toFixed(2)}/hr CAD
                  </span>
                </div>

                <p className="font-medium text-xs text-slate-800 line-clamp-1">
                  {sitter.headline}
                </p>

                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                  {sitter.bio}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-2">
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
                    +{sitter.yearsExperience} yrs exp
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Metro Vancouver
                </span>

                <Link
                  href={`/search?sitterId=${sitter.id}`}
                  className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Request Booking
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How {brandConfig.name} Works
            </h2>
            <p className="text-slate-500 text-sm">
              Simple, transparent 3-step booking designed for busy parents in Metro Vancouver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900">Search & Filter</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Filter sitters by neighborhood in Metro Vancouver, CPR certification, hourly rate, and target date/time.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900">Direct 1:1 Booking Request</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Send a direct booking request. The sitter has 2 hours to accept. Contact messaging unlocks automatically post-request.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                3
              </div>
              <h3 className="font-bold text-lg text-slate-900">Clocking & Protected Payouts</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Sitters tap "Start Sitting" on arrival and "End Sitting" when finished. 15% platform commission is automatically calculated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Demo Role Switcher Toolbar */}
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
