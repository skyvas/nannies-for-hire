import React from 'react';
import Link from 'next/link';
import { db } from '../../lib/db';
import { getCurrentSession } from '../../lib/adapters/auth';
import { brandConfig } from '../../../brand.config';
import { Navbar } from '../../components/branding/Navbar';
import { Footer } from '../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../components/demo/DemoRoleSwitcher';
import { SitterSearchClient } from './SitterSearchClient';

export const revalidate = 0; // Dynamic server page

interface SearchPageProps {
  searchParams: Promise<{
    neighborhood?: string;
    maxRate?: string;
    cprOnly?: string;
    minRating?: string;
    sitterId?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const session = await getCurrentSession();

  // Fetch approved sitters
  const sitters = await db.sitterProfile.findMany({
    where: { verificationStatus: 'APPROVED' },
    include: {
      user: {
        include: {
          receivedReviews: {
            include: { author: true },
            take: 2,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      availability: true,
    },
    orderBy: { averageRating: 'desc' },
  });

  // Fetch user's household if logged in as Parent
  let userHousehold = null;
  if (session.user) {
    const member = await db.householdMember.findFirst({
      where: { userId: session.user.id },
      include: { household: { include: { children: true } } },
    });
    if (member) {
      userHousehold = member.household;
    }
  }

  // Fetch demo users for switcher
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Babysitters in Metro Vancouver
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse verified, CPR-certified caregivers available for on-demand evening and weekend bookings.
          </p>
        </div>

        {/* Client-side Search, Filter & Booking Request Modal */}
        <SitterSearchClient
          sitters={sitters}
          userHousehold={userHousehold}
          currentUserId={session.user?.id}
          initialNeighborhood={params.neighborhood}
          initialSitterId={params.sitterId}
        />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
