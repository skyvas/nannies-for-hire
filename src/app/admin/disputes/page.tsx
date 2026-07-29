import React from 'react';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';
import { Navbar } from '../../../components/branding/Navbar';
import { Footer } from '../../../components/branding/Footer';
import { DemoRoleSwitcher } from '../../../components/demo/DemoRoleSwitcher';
import { DollarSign, TrendingUp, Calendar, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDisputesPage() {
  const session = await getCurrentSession();

  // Fetch all bookings
  const bookings = await db.booking.findMany({
    include: {
      household: { include: { members: { include: { user: true } } } },
      sitterProfile: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate Marketplace Analytics
  const completedBookings = bookings.filter((b) => b.status === 'SETTLED' || b.status === 'COMPLETED');
  const gmv = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const platformCommission = completedBookings.reduce((sum, b) => sum + b.platformFee, 0);
  const totalJobsCount = completedBookings.length;

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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4" /> Platform Admin Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Marketplace Financials & Dispute Monitor
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time Gross Merchandise Volume (GMV), 15% commission ledger, and booking dispute resolutions.
          </p>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Gross Merchandise Volume</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">${gmv.toFixed(2)} CAD</p>
            <p className="text-[11px] text-slate-400 font-medium">Total volume processed through platform</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>15% Platform Commission</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-extrabold text-purple-700">${platformCommission.toFixed(2)} CAD</p>
            <p className="text-[11px] text-slate-400 font-medium">Net platform commission revenue</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Completed Jobs</span>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{totalJobsCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Target: 50 completed jobs in first 3 months</p>
          </div>
        </div>

        {/* Bookings Ledger */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="font-bold text-lg text-slate-900">Platform Booking Ledger</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Household</th>
                  <th className="py-3 px-4">Caregiver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Job Subtotal</th>
                  <th className="py-3 px-4">15% Fee</th>
                  <th className="py-3 px-4">Total CAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {b.id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-4">
                      {b.household.familyName} ({b.household.neighborhood})
                    </td>
                    <td className="py-3.5 px-4">
                      {b.sitterProfile.user.firstName} {b.sitterProfile.user.lastName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        b.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">${b.subtotalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-purple-700 font-bold">${b.platformFee.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${b.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
      <DemoRoleSwitcher currentUserId={session.user?.id} demoUsers={demoUserOptions} />
    </div>
  );
}
