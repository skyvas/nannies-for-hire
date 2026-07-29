import React from 'react';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';
import { Navbar } from '../../../components/branding/Navbar';
import { Footer } from '../../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../../components/demo/DemoRoleSwitcher';
import { ParentBookingsClient } from './ParentBookingsClient';
import { Calendar, Clock, Heart } from 'lucide-react';

export const revalidate = 0;

export default async function ParentBookingsPage() {
  const session = await getCurrentSession();

  let household = null;
  if (session.user) {
    const member = await db.householdMember.findFirst({
      where: { userId: session.user.id },
    });
    if (member) {
      household = await db.household.findUnique({
        where: { id: member.householdId },
      });
    }
  }

  if (!household) {
    household = await db.household.findFirst();
  }

  const bookings = household
    ? await db.booking.findMany({
        where: { householdId: household.id },
        include: {
          sitterProfile: { include: { user: true } },
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Babysitting Bookings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View booking status, track platform payments, communicate with sitters via live chat, and submit reviews.
          </p>
        </div>

        <ParentBookingsClient bookings={bookings} currentUserId={session.user?.id} />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
