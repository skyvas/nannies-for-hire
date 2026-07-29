import React from 'react';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';
import { Navbar } from '../../../components/branding/Navbar';
import { Footer } from '../../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../../components/demo/DemoRoleSwitcher';
import { AdminVettingClient } from './AdminVettingClient';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminVettingPage() {
  const session = await getCurrentSession();

  if (session.user?.role === 'PARENT') {
    redirect('/parent/bookings');
  }
  if (session.user?.role === 'SITTER') {
    redirect('/sitter/jobs');
  }

  // Fetch pending vetting sitters
  const pendingSitters = await db.sitterProfile.findMany({
    where: { verificationStatus: 'PENDING_VERIFICATION' },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch approved sitters for reference
  const approvedSitters = await db.sitterProfile.findMany({
    where: { verificationStatus: 'APPROVED' },
    include: { user: true },
    take: 5,
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
      <Navbar currentUser={session.user} pendingVettingCount={pendingSitters.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4" /> Platform Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Caregiver Vetting & Verification Queue
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review uploaded government ID documents, reference notes, and CPR certifications before approving sitters to appear in public search.
          </p>
        </div>

        <AdminVettingClient pendingSitters={pendingSitters} approvedSitters={approvedSitters} />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
