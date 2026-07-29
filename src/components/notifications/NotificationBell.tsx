'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, ChevronRight, X, Sparkles, Calendar } from 'lucide-react';
import Link from 'next/link';

interface BookingNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  bookingId?: string | null;
  createdAt: string;
}

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
  const [bookingNotifications, setBookingNotifications] = useState<BookingNotification[]>([]);
  const [threads, setThreads] = useState<UnreadThread[]>([]);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread booking notifications & chat threads
  const fetchAllNotifications = async () => {
    try {
      const [notifRes, chatRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/chat/unread'),
      ]);

      let notifCount = 0;
      let notifs: BookingNotification[] = [];
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        notifCount = notifData.totalUnread || 0;
        notifs = notifData.notifications || [];
        setBookingNotifications(notifs);
      }

      let chatCount = 0;
      let chatThreads: UnreadThread[] = [];
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        chatCount = chatData.totalUnread || 0;
        chatThreads = chatData.threads || [];
        setThreads(chatThreads);
      }

      setTotalUnread(notifCount + chatCount);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 2000); // 2-second poll for instant sync

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

  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchAllNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        data-testid="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Notifications & Live Chat Alerts"
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
              <h3 className="font-bold text-sm">Notifications & Alerts</h3>
            </div>
            <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full font-semibold text-blue-200">
              {totalUnread} Unread
            </span>
          </div>

          {/* Combined List of Booking Notifications & Unread Threads */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {bookingNotifications.length === 0 && threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">All caught up! No new notifications.</p>
                <p className="text-[11px] text-slate-400">
                  New booking requests and live chat messages will appear here in real-time.
                </p>
              </div>
            ) : (
              <>
                {/* Booking Request Notifications */}
                {bookingNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    data-testid={`booking-notif-${notif.id}`}
                    className="p-3.5 bg-indigo-50/40 hover:bg-indigo-50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{notif.title}</h4>
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                            NEW
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">{notif.content}</p>
                      </div>
                    </div>

                    <Link
                      href="/sitter/jobs"
                      onClick={() => {
                        handleMarkNotifRead(notif.id);
                        setIsOpen(false);
                      }}
                      className="p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shrink-0 shadow-sm"
                      title="View Job Requests"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}

                {/* Unread Chat Threads */}
                {threads.map((thread) => (
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
                            {thread.count} new msg
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
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
