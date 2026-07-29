'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  ChevronRight,
  X,
  Sparkles,
  Calendar,
  Check,
  RotateCcw,
  Trash2,
  CheckCheck,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface RichNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  bookingId?: string | null;
  targetRoute?: string | null;
  actorName?: string | null;
  actorAvatar?: string | null;
  metadata?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface UnreadThread {
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

// Utility to format relative timestamps (e.g., "5m ago")
function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  } catch (e) {
    return 'Recently';
  }
}

// Utility to format exact creation timestamp (e.g., "Jul 29, 1:45 PM")
function formatCreatedTime(dateString: string): { time: string; date: string; full: string; relative: string } {
  try {
    const d = new Date(dateString);
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const relative = formatRelativeTime(dateString);
    return {
      time,
      date,
      full: `${date}, ${time}`,
      relative,
    };
  } catch (e) {
    return { time: '', date: '', full: 'Recently', relative: 'Recently' };
  }
}

interface NotificationBellProps {
  userRole?: 'PARENT' | 'SITTER' | 'ADMIN';
}

export function NotificationBell({ userRole = 'PARENT' }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<RichNotification[]>([]);
  const [threads, setThreads] = useState<UnreadThread[]>([]);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute unread count from current state (notifications + chat threads)
  const computeUnread = (notifs: RichNotification[], ths: UnreadThread[]) => {
    const notifUnread = notifs.filter((n) => n.readAt === null && n.type !== 'CHAT_MESSAGE').length;
    const chatUnread = ths.reduce((acc, t) => acc + (t.count || 0), 0);
    return notifUnread + chatUnread;
  };

  // Keep totalUnread always derived from the latest notifications and threads
  useEffect(() => {
    setTotalUnread((prev) => {
      const val = computeUnread(notifications, threads);
      if (val === prev) return prev;
      return val;
    });
  }, [notifications, threads]);

  // Fetch notifications & chat threads
  const fetchAllNotifications = async () => {
    try {
      const [notifRes, chatRes] = await Promise.all([
        fetch(`/api/notifications?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/chat/unread?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      let notifUnread = 0;
      let notifs: RichNotification[] = [];
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        notifs = notifData.notifications || [];
        setNotifications(notifs);
        // Exclude CHAT_MESSAGE type notifications from the count — they are already
        // represented in the chatUnread count via /api/chat/unread to avoid double-counting
        notifUnread = notifs.filter(
          (n) => n.readAt === null && n.type !== 'CHAT_MESSAGE'
        ).length;
      }

      let chatUnread = 0;
      let chatThreads: UnreadThread[] = [];
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        chatUnread = chatData.totalUnread || 0;
        chatThreads = chatData.threads || [];
        setThreads(chatThreads);
      }

      // totalUnread will be derived from notifications & threads via effect
      // this avoids incremental drift and race conditions
      // setNotifications/setThreads already called above; effect will recompute
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 2500);

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

  // Notification Management Actions
  const handleMarkRead = async (id: string) => {
    // Optimistic UI update with rollback on failure
    setNotifications((prev) => {
      const prevCopy = prev.slice();
      const next = prevCopy.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      return next;
    });

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_READ', id }),
      });
      if (!res.ok) {
        // If server rejected, refetch to get canonical state
        await fetchAllNotifications();
      } else {
        // Re-sync to be safe
        fetchAllNotifications();
      }
    } catch (e) {
      console.error('Failed to mark read, refreshing list', e);
      await fetchAllNotifications();
    }
  };

  const handleMarkUnread = async (id: string) => {
    // Optimistic UI update with rollback on failure
    setNotifications((prev) => {
      const prevCopy = prev.slice();
      const next = prevCopy.map((n) => (n.id === id ? { ...n, readAt: null } : n));
      return next;
    });

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_UNREAD', id }),
      });
      if (!res.ok) {
        await fetchAllNotifications();
      } else {
        fetchAllNotifications();
      }
    } catch (e) {
      console.error('Failed to mark unread, refreshing list', e);
      await fetchAllNotifications();
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const prevSnapshot = notifications.slice();
    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id }),
      });
      if (!res.ok) {
        // rollback on failure
        setNotifications(prevSnapshot);
        await fetchAllNotifications();
      } else {
        fetchAllNotifications();
      }
    } catch (e) {
      console.error('Failed to delete notification, rolling back', e);
      setNotifications(prevSnapshot);
      await fetchAllNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setIsProcessing(true);
    const prevSnapshot = notifications.slice();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_READ' }),
      });
      if (!res.ok) {
        // rollback
        setNotifications(prevSnapshot);
        await fetchAllNotifications();
      } else {
        fetchAllNotifications();
      }
    } catch (e) {
      console.error('Failed mark all read, rolling back', e);
      setNotifications(prevSnapshot);
      await fetchAllNotifications();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotificationClick = (notif: RichNotification) => {
    if (notif.readAt === null) {
      handleMarkRead(notif.id);
    }
    setIsOpen(false);

    // Deep link navigation logic with fallback
    const route = notif.targetRoute || (notif.bookingId ? `/sitter/jobs?bookingId=${notif.bookingId}` : '/');
    router.push(route);
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchAllNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        data-testid="notification-bell"
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Notifications & Live Alerts"
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

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          id="notification-dropdown-menu"
          data-testid="notification-dropdown"
          className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Popover Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm">Notifications & History</h3>
            </div>

            <div className="flex items-center gap-2">
              {notifications.some((n) => n.readAt === null) && (
                <button
                  id="mark-all-read-btn"
                  data-testid="mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  disabled={isProcessing}
                  className="text-[11px] font-semibold text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}

              <span className="text-xs bg-blue-600 px-2.5 py-0.5 rounded-full font-bold text-white">
                {totalUnread} Unread
              </span>
            </div>
          </div>

          {/* Persistent Notifications & Unread Threads List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 && threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">All caught up! No notifications.</p>
                <p className="text-[11px] text-slate-400">
                  New booking requests, nanny applications, and chat alerts will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* System & Workflow Notifications */}
                {notifications.map((notif) => {
                  const isUnread = notif.readAt === null;
                  const defaultRoute = userRole === 'SITTER' ? '/sitter/jobs' : userRole === 'ADMIN' ? '/admin/vetting' : '/parent/bookings';

                  return (
                    <div
                      key={notif.id}
                      data-testid={`notif-item-${notif.id}`}
                      className={`p-3.5 transition-all flex items-center justify-between gap-3 group relative ${
                        isUnread ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Unread Indicator Dot */}
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 absolute left-2 top-1/2 -translate-y-1/2" />
                      )}

                      <Link
                        data-testid="notif-link"
                        href={notif.targetRoute || (notif.bookingId ? `${defaultRoute}?bookingId=${notif.bookingId}` : defaultRoute)}
                        onClick={() => {
                          if (notif.readAt === null) {
                            handleMarkRead(notif.id);
                          }
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pl-2"
                      >
                        {/* Actor Avatar or Type Icon */}
                        {notif.actorAvatar ? (
                          <img
                            src={notif.actorAvatar}
                            alt={notif.actorName || 'User'}
                            className="w-10 h-10 rounded-full object-cover border border-blue-200 shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                            {notif.type === 'NEW_NANNY_APPLICATION' ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : (
                              <Calendar className="w-5 h-5" />
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {notif.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.content}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200" title={`Created: ${formatCreatedTime(notif.createdAt).full} (${formatRelativeTime(notif.createdAt)})`}>
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatCreatedTime(notif.createdAt).full}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">{formatRelativeTime(notif.createdAt)}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Management Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isUnread ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(notif.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100/60 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkUnread(notif.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-100/60 rounded-full transition-colors"
                            title="Mark as unread"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-full transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Unread Chat Threads Section */}
                {threads.map((thread) => {
                  const threadRoute = userRole === 'SITTER' ? `/sitter/jobs?bookingId=${thread.bookingId}` : `/parent/bookings?bookingId=${thread.bookingId}`;
                  const threadCreated = formatCreatedTime(thread.lastMessage.createdAt);
                  return (
                    <div
                      key={thread.bookingId}
                      data-testid={`unread-thread-${thread.bookingId}`}
                      className="p-3.5 bg-blue-50/40 hover:bg-blue-50 transition-all flex items-center justify-between gap-3 group"
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
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{threadCreated.full}</span>
                            <span>•</span>
                            <span>{threadCreated.relative}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={threadRoute}
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 transition-all shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
