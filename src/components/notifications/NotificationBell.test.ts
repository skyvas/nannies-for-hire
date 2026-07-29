import { describe, it, expect } from 'vitest';
import { computeUnread } from './NotificationBell';

const makeNotif = (id: string, read: boolean, type = 'GENERIC') => ({
  id,
  type,
  title: 'T',
  content: 'c',
  createdAt: new Date().toISOString(),
  readAt: read ? new Date().toISOString() : null,
});

const makeThread = (bookingId: string, count: number) => ({
  bookingId,
  title: 'Thread',
  count,
  lastMessage: {
    id: 'm',
    content: 'hi',
    createdAt: new Date().toISOString(),
    sender: { firstName: 'A', lastName: 'B' },
  },
});

describe('computeUnread', () => {
  it('counts unread notifications only (non-chat) and sums thread unread counts', () => {
    const notifs = [makeNotif('n1', false), makeNotif('n2', false), makeNotif('n3', true)];
    const threads = [makeThread('b1', 2), makeThread('b2', 0)];

    const total = computeUnread(notifs, threads);
    // 2 unread notifs + 2 unread thread messages = 4
    expect(total).toBe(4);
  });

  it('ignores CHAT_MESSAGE notifications in the notification unread count (chat handled by threads)', () => {
    const notifs = [makeNotif('n1', false, 'CHAT_MESSAGE'), makeNotif('n2', false)];
    const threads = [makeThread('b1', 3)];

    const total = computeUnread(notifs, threads);
    // CHAT_MESSAGE should be ignored: only n2 counts (1) + threads 3 = 4
    expect(total).toBe(4);
  });

  it('handles marking one as read', () => {
    const notifs = [makeNotif('n1', false), makeNotif('n2', false)];
    const threads: any[] = [];

    const before = computeUnread(notifs, threads);
    expect(before).toBe(2);

    const afterNotifs = notifs.map((n) => (n.id === 'n1' ? { ...n, readAt: new Date().toISOString() } : n));
    const after = computeUnread(afterNotifs, threads);
    expect(after).toBe(1);
  });

  it('handles deletion of an unread notification', () => {
    const notifs = [makeNotif('n1', false), makeNotif('n2', true)];
    const threads: any[] = [];

    const before = computeUnread(notifs, threads);
    expect(before).toBe(1);

    const afterNotifs = notifs.filter((n) => n.id !== 'n1');
    const after = computeUnread(afterNotifs, threads);
    expect(after).toBe(0);
  });

  it('handles new notification arrival', () => {
    const notifs = [makeNotif('n1', true)];
    const threads: any[] = [];

    const before = computeUnread(notifs, threads);
    expect(before).toBe(0);

    const afterNotifs = [...notifs, makeNotif('n2', false)];
    const after = computeUnread(afterNotifs, threads);
    expect(after).toBe(1);
  });

  it('handles bulk mark all read', () => {
    const notifs = [makeNotif('n1', false), makeNotif('n2', false)];
    const threads = [makeThread('b1', 2)];

    // after mark all read, notifs should be all read
    const allRead = notifs.map((n) => ({ ...n, readAt: new Date().toISOString() }));
    const total = computeUnread(allRead, threads);
    // only threads remain unread
    expect(total).toBe(2);
  });

  it('handles concurrent-like state changes (no drift in pure computation)', () => {
    const notifsA = [makeNotif('n1', false), makeNotif('n2', false)];
    const threadsA = [makeThread('b1', 1)];

    const totalA = computeUnread(notifsA, threadsA);
    expect(totalA).toBe(3);

    // another tab marks n1 read and sends update to server; local state now reflects that
    const notifsB = notifsA.map((n) => (n.id === 'n1' ? { ...n, readAt: new Date().toISOString() } : n));
    const totalB = computeUnread(notifsB, threadsA);
    expect(totalB).toBe(2);
  });
});
