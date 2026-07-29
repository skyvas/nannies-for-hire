import React from 'react';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';
import { Navbar } from '../../../components/branding/Navbar';
import { Footer } from '../../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../../components/demo/DemoRoleSwitcher';
import { SitterJobsClient } from './SitterJobsClient';
import { Calendar, Clock, DollarSign, UserCheck } from 'lucide-react';

export const revalidate = 0;

export default async function SitterJobsPage() {
  const session = await getCurrentSession();

  let sitterProfile = null;
  if (session.user) {
    sitterProfile = await db.sitterProfile.findFirst({
      where: { userId: session.user.id },
    });
  }

  // Fallback to first approved sitter for demo if not logged in as sitter
  if (!sitterProfile) {
    sitterProfile = await db.sitterProfile.findFirst({
      where: { verificationStatus: 'APPROVED' },
    });
  }

  // Fetch bookings assigned to this sitter
  const bookings = sitterProfile
    ? await db.booking.findMany({
        where: { sitterProfileId: sitterProfile.id },
        include: {
          household: {
            include: {
              children: true,
              members: { include: { user: true } },
            },
          },
          messages: {
            include: { sender: true },
            orderBy: { createdAt: 'asc' },
          },
          reviews: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

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
            <UserCheck className="w-4 h-4" /> Caregiver Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Requests & Live Time Clocking
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Accept/decline incoming 1:1 requests, start sitting upon arrival, and track your CAD earnings.
          </p>
        </div>

        <SitterJobsClient
          sitterProfile={sitterProfile}
          bookings={bookings}
          currentUserId={session.user?.id}
        />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
