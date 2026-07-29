import React from 'react';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { Navbar } from '@/components/branding/Navbar';
import { Footer } from '@/components/branding/Footer';
import { DemoRoleSwitcher } from '@/components/demo/DemoRoleSwitcher';
import { NannyApplicationWizard } from './NannyApplicationWizard';

export const revalidate = 0;

export default async function NannyApplyPage() {
  const session = await getCurrentSession();

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
      <Navbar currentUser={session.user} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <NannyApplicationWizard />
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
