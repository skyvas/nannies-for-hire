import React from 'react';
import Link from 'next/link';
import { brandConfig } from '../../../brand.config';
import { HeartHandshake, Search, Calendar, ShieldCheck, UserCheck, Settings, Home, FileText, Bell } from 'lucide-react';

import { NotificationBell } from '../notifications/NotificationBell';

interface NavbarProps {
  currentUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'PARENT' | 'SITTER' | 'ADMIN';
    avatarUrl?: string | null;
  } | null;
  pendingVettingCount?: number;
}

export function Navbar({ currentUser, pendingVettingCount = 0 }: NavbarProps) {
  const role = currentUser?.role || 'PARENT';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                {brandConfig.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Metro Vancouver
              </span>
            </div>
          </Link>

          {/* Navigation Links according to Role */}
          <nav className="hidden md:flex items-center gap-1">
            {role === 'PARENT' && (
              <>
                <Link
                  href="/search"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-colors"
                >
                  <Search className="w-4 h-4 text-blue-500" />
                  Find Babysitters
                </Link>
                <Link
                  href="/parent/household"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  My Household & Kids
                </Link>
                <Link
                  href="/parent/bookings"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Bookings
                </Link>
              </>
            )}

            {role === 'SITTER' && (
              <>
                <Link
                  href="/sitter/jobs"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Job Requests & Clock
                </Link>
                <Link
                  href="/sitter/profile"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  Sitter Profile & Schedule
                </Link>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/vetting"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 transition-colors relative"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Vetting Queue
                  {pendingVettingCount > 0 && (
                    <span className="ml-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {pendingVettingCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/disputes"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  Dispute & GMV Analytics
                </Link>
              </>
            )}
          </nav>

          {/* User Status / Account Indicator + Notification Bell */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 pl-3 pr-2 py-1.5 rounded-full border border-slate-200">
              <span className="text-xs font-semibold text-slate-800">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                role === 'SITTER' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {role}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
