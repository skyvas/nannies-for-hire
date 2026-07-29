'use client';

import React, { useState } from 'react';
import { Home, Users, Heart, AlertCircle, Plus, MapPin, Calendar, Check, X } from 'lucide-react';

interface HouseholdClientProps {
  household: any;
}

export function HouseholdClient({ household: initialHousehold }: HouseholdClientProps) {
  const [children, setChildren] = useState(initialHousehold?.children || []);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Male');
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [bedtimeRoutine, setBedtimeRoutine] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialHousehold) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId: initialHousehold.id,
          firstName,
          birthDate,
          gender,
          allergies,
          medicalNotes,
          bedtimeRoutine,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setChildren((prev: any[]) => [...prev, data.child]);
        setShowAddModal(false);
        setFirstName('');
        setBirthDate('');
        setAllergies('');
        setMedicalNotes('');
        setBedtimeRoutine('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Household Overview */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {initialHousehold?.address}, {initialHousehold?.neighborhood}
            </h2>
            <p className="text-xs text-slate-500">
              City: {initialHousehold?.city} • Postal Code: {initialHousehold?.postalCode}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Child Profile
          </button>
        </div>

        {/* Multi-Guardian List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Household Guardians
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {initialHousehold?.members?.map((m: any) => (
              <div
                key={m.id}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {m.user.firstName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">
                    {m.user.firstName} {m.user.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{m.relationship}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Children Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" /> Children Profiles ({children.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child: any) => (
            <div
              key={child.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{child.firstName}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Born: {new Date(child.birthDate).toLocaleDateString()} ({child.gender})
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  Child Profile
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {child.allergies && (
                  <div className="bg-rose-50 text-rose-900 p-2.5 rounded-xl border border-rose-200">
                    <span className="font-bold block text-rose-700">⚠️ Allergies & Alerts:</span>
                    <span>{child.allergies}</span>
                  </div>
                )}

                {child.medicalNotes && (
                  <div className="bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
                    <span className="font-bold block text-amber-700">📋 Medical Notes:</span>
                    <span>{child.medicalNotes}</span>
                  </div>
                )}

                {child.bedtimeRoutine && (
                  <div className="bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold block text-slate-700">🌙 Bedtime Routine:</span>
                    <span>{child.bedtimeRoutine}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Child Profile</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChild} className="space-y-3 text-xs font-medium">
              <div>
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Leo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Allergies (e.g., Peanuts, Dairy, Epipen)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Leave empty if none"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Bedtime Routine Instructions
                </label>
                <textarea
                  rows={2}
                  value={bedtimeRoutine}
                  onChange={(e) => setBedtimeRoutine(e.target.value)}
                  placeholder="e.g., Bedtime story at 8pm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                {isSubmitting ? 'Saving...' : 'Save Child Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
