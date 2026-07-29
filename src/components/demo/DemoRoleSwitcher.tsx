'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, User, Sparkles, ChevronDown, Check } from 'lucide-react';

interface DemoUserOption {
  id: string;
  name: string;
  role: 'PARENT' | 'SITTER' | 'ADMIN';
  detail: string;
}

interface DemoRoleSwitcherProps {
  currentUserId?: string;
  demoUsers: DemoUserOption[];
}

export function DemoRoleSwitcher({ currentUserId, demoUsers }: DemoRoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const currentUser = demoUsers.find((u) => u.id === currentUserId) || demoUsers[0];

  const handleSwitchUser = async (userId: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to switch user', e);
    } finally {
      setLoadingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-medium border border-purple-200">Admin</span>;
      case 'SITTER':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium border border-emerald-200">Sitter</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium border border-blue-200">Parent</span>;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-full shadow-2xl hover:bg-slate-800 transition-all border border-slate-700 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Demo Role:</span>
          <strong className="text-emerald-400 font-semibold">{currentUser?.name}</strong>
          {currentUser && getRoleBadge(currentUser.role)}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-slate-900 text-white p-3 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch Demo Role Instantantly
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Test the platform as Parent, Caregiver, or Platform Administrator.
              </p>
            </div>

            <div className="p-1.5 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {demoUsers.map((user) => {
                const isSelected = user.id === currentUser?.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSwitchUser(user.id)}
                    disabled={loadingId === user.id}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isSelected ? 'bg-slate-100/90 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </span>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-[11px] text-slate-500">{user.detail}</p>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
