import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ totalUnread: 0, totalCount: 0, notifications: [] });
    }

    const userId = session.user.id;

    // Fetch all notifications for persistent history viewing
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalUnread = notifications.filter((n) => n.readAt === null).length;

    return NextResponse.json({
      totalUnread,
      totalCount: notifications.length,
      notifications,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ totalUnread: 0, totalCount: 0, notifications: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { action, id, bookingId } = body;

    // Legacy parameters compatibility
    if (body.markAllRead || action === 'MARK_ALL_READ') {
      await db.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'DELETE_ALL') {
      await db.notification.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'DELETE' && id) {
      await db.notification.deleteMany({
        where: { id, userId },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'MARK_UNREAD' && id) {
      await db.notification.updateMany({
        where: { id, userId },
        data: { readAt: null },
      });
      return NextResponse.json({ success: true });
    }

    // Default MARK_READ
    if (id) {
      await db.notification.updateMany({
        where: { id, userId },
        data: { readAt: new Date() },
      });
    } else if (bookingId) {
      await db.notification.updateMany({
        where: { userId, bookingId, readAt: null },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating notification management:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
