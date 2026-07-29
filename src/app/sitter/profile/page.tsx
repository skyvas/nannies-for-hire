import React from 'react';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';
import { Navbar } from '../../../components/branding/Navbar';
import { Footer } from '../../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../../components/demo/DemoRoleSwitcher';
import { SitterProfileClient } from './SitterProfileClient';
import { UserCheck, ShieldCheck, Calendar, Award } from 'lucide-react';

import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function SitterProfilePage() {
  const session = await getCurrentSession();

  if (session.user?.role === 'PARENT') {
    redirect('/parent/bookings');
  }
  if (session.user?.role === 'ADMIN') {
    redirect('/admin/vetting');
  }

  let sitterProfile = null;
  if (session.user) {
    sitterProfile = await db.sitterProfile.findFirst({
      where: { userId: session.user.id },
      include: {
        user: true,
        availability: true,
      },
    });
  }

  if (!sitterProfile) {
    sitterProfile = await db.sitterProfile.findFirst({
      where: { verificationStatus: 'APPROVED' },
      include: {
        user: true,
        availability: true,
      },
    });
  }

  const pendingVettingCount = await db.sitterProfile.count({
    where: { verificationStatus: 'PENDING_VERIFICATION' },
  });

  const allUsers = await db.user.findMany({
    include: { sitterProfile: true },
  });

  const demoUserOptions = allUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    role: u.role as 'PARENT' | 'SITTER' | 'ADMIN',
    detail: u.role === 'SITTER' && u.sitterProfile ? `$${u.sitterProfile.baseHourlyRate}/hr Sitter` : `${u.role}`,
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar currentUser={session.user} pendingVettingCount={pendingVettingCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mb-2">
            <UserCheck className="w-4 h-4" /> Caregiver Profile Settings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sitter Profile & Schedule Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Update your hourly rate breakdown, CPR verification badges, and weekly available shifts.
          </p>
        </div>

        <SitterProfileClient sitterProfile={sitterProfile} />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
