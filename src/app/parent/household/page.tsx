import React from 'react';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';
import { Navbar } from '../../../components/branding/Navbar';
import { Footer } from '../../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../../components/demo/DemoRoleSwitcher';
import { HouseholdClient } from './HouseholdClient';
import { Home, Users, Heart, AlertCircle, Plus } from 'lucide-react';

import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function ParentHouseholdPage() {
  const session = await getCurrentSession();

  if (session.user?.role === 'SITTER') {
    redirect('/sitter/jobs');
  }
  if (session.user?.role === 'ADMIN') {
    redirect('/admin/vetting');
  }

  let household = null;
  if (session.user) {
    const member = await db.householdMember.findFirst({
      where: { userId: session.user.id },
      include: {
        household: {
          include: {
            children: true,
            members: { include: { user: true } },
          },
        },
      },
    });
    if (member) {
      household = member.household;
    }
  }

  // Fallback to first household for demo if not linked
  if (!household) {
    household = await db.household.findFirst({
      include: {
        children: true,
        members: { include: { user: true } },
      },
    });
  }

  const allUsers = await db.user.findMany({
    include: { sitterProfile: true },
  });

  const demoUserOptions = allUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    role: u.role as 'PARENT' | 'SITTER' | 'ADMIN',
    detail: u.role === 'SITTER' && u.sitterProfile ? `$${u.sitterProfile.baseHourlyRate}/hr Sitter` : `${u.role}`,
  }));

  const pendingVettingCount = await db.sitterProfile.count({
    where: { verificationStatus: 'PENDING_VERIFICATION' },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar currentUser={session.user} pendingVettingCount={pendingVettingCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-2">
            <Home className="w-4 h-4" /> Parent Household Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {household?.familyName || 'Family Household'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage shared guardians, child medical notes, allergies, and bedtime instructions.
          </p>
        </div>

        <HouseholdClient household={household} />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
