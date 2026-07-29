import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ totalUnread: 0, notifications: [] });
    }

    const userId = session.user.id;

    const unreadNotifications = await db.notification.findMany({
      where: {
        userId,
        readAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      totalUnread: unreadNotifications.length,
      notifications: unreadNotifications,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ totalUnread: 0, notifications: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, bookingId, markAllRead } = await req.json();

    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId: session.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await db.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    } else if (bookingId) {
      await db.notification.updateMany({
        where: { userId: session.user.id, bookingId, readAt: null },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating notification read status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
