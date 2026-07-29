'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, DollarSign, Award, Calendar, Check, Save, AlertCircle } from 'lucide-react';

interface SitterProfileClientProps {
  sitterProfile: any;
}

export function SitterProfileClient({ sitterProfile }: SitterProfileClientProps) {
  const [headline, setHeadline] = useState(sitterProfile?.headline || '');
  const [bio, setBio] = useState(sitterProfile?.bio || '');
  const [baseHourlyRate, setBaseHourlyRate] = useState(sitterProfile?.baseHourlyRate || 25);
  const [extraChildRate, setExtraChildRate] = useState(sitterProfile?.extraChildRate || 2);
  const [yearsExperience, setYearsExperience] = useState(sitterProfile?.yearsExperience || 3);
  const [cprCertified, setCprCertified] = useState(sitterProfile?.cprCertified || false);
  const [hasVehicle, setHasVehicle] = useState(sitterProfile?.hasVehicle || false);
  const [languages, setLanguages] = useState(sitterProfile?.languages || 'English');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/sitter/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          bio,
          baseHourlyRate,
          extraChildRate,
          yearsExperience,
          cprCertified,
          hasVehicle,
          languages,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Profile and rate preferences successfully updated!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayName = (dayNum: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || 'Day';
  };

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sitter Profile Edit Form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={sitterProfile?.user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
            />
            <div>
              <h2 className="font-bold text-base text-slate-900">
                {sitterProfile?.user?.firstName} {sitterProfile?.user?.lastName}
              </h2>
              <p className="text-xs text-slate-500">
                Verification Status:{' '}
                <strong className="text-emerald-600 font-bold uppercase">{sitterProfile?.verificationStatus}</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Profile Headline
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Bio & Experience Details
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                Base Hourly Rate ($ CAD for 1 Child)
              </label>
              <input
                type="number"
                step="0.50"
                min="18"
                max="60"
                required
                value={baseHourlyRate}
                onChange={(e) => setBaseHourlyRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-extrabold text-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                Extra Child Incremental Rate ($ CAD / hr)
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                max="15"
                required
                value={extraChildRate}
                onChange={(e) => setExtraChildRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-extrabold text-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-bold">CPR / First Aid Certified</span>
              <input
                type="checkbox"
                checked={cprCertified}
                onChange={(e) => setCprCertified(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-bold">Has Personal Vehicle</span>
              <input
                type="checkbox"
                checked={hasVehicle}
                onChange={(e) => setHasVehicle(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                Years of Experience
              </label>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving Changes...' : 'Save Caregiver Profile & Rates'}
          </button>
        </form>
      </div>

      {/* Weekly Shifts Availability Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Weekly Recurring Shifts & Available Windows
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {sitterProfile?.availability?.map((a: any) => (
            <div key={a.id} className="py-3 flex items-center justify-between">
              <span className="font-bold text-slate-900">{getDayName(a.dayOfWeek)} Shifts</span>
              <span className="bg-blue-50 text-blue-800 font-semibold px-3 py-1 rounded-full border border-blue-200">
                {a.startTime} – {a.endTime} PST
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
