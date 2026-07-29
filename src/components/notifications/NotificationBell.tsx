'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, ChevronRight, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface UnreadThread {
  bookingId: string;
  title: string;
  count: number;
  lastMessage: {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    sender: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    };
  };
}

export function NotificationBell() {
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [threads, setThreads] = useState<UnreadThread[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count & thread previews
  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/chat/unread');
      if (res.ok) {
        const data = await res.json();
        setTotalUnread(data.totalUnread || 0);
        setThreads(data.threads || []);
      }
    } catch (e) {
      console.error('Failed to fetch unread count', e);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 2000); // 2-second poll for zero-lag updates

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        data-testid="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Unread Messages Notification Bell"
      >
        <Bell className="w-5 h-5" />

        {/* Live Badge Counter */}
        {totalUnread > 0 && (
          <span
            id="notification-badge-count"
            data-testid="notification-badge"
            className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white shadow-md animate-pulse"
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="notification-dropdown-menu"
          data-testid="notification-dropdown"
          className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm">Unread Chat Messages</h3>
            </div>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-semibold text-blue-200">
              {totalUnread} Unread
            </span>
          </div>

          {/* List of Unread Threads */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">All caught up! No unread messages.</p>
                <p className="text-[11px] text-slate-400">
                  New live messages from parents or sitters will appear here in real-time.
                </p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.bookingId}
                  data-testid={`unread-thread-${thread.bookingId}`}
                  className="p-3.5 hover:bg-blue-50/50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={thread.lastMessage.sender.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={thread.title}
                      className="w-10 h-10 rounded-full object-cover border border-blue-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{thread.title}</h4>
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                          {thread.count} new
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {thread.lastMessage.content || '📷 Sent a photo update'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/parent/bookings"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 transition-all shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
