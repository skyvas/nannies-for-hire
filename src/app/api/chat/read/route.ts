import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getCurrentSession } from '../../../../lib/adapters/auth';
import { chatStream } from '../../../../lib/services/chatStream';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { bookingId, markAllRead } = body;

    const now = new Date();

    if (markAllRead) {
      const userHousehold = await db.householdMember.findFirst({
        where: { userId: session.user.id },
        select: { householdId: true },
      });
      const userSitterProfile = await db.sitterProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      const bookings = await db.booking.findMany({
        where: {
          OR: [
            ...(userHousehold ? [{ householdId: userHousehold.householdId }] : []),
            ...(userSitterProfile ? [{ sitterProfileId: userSitterProfile.id }] : []),
          ],
        },
        select: { id: true },
      });
      const bookingIds = bookings.map((b) => b.id);

      if (bookingIds.length > 0) {
        await db.message.updateMany({
          where: {
            bookingId: { in: bookingIds },
            senderId: { not: session.user.id },
            readAt: null,
          },
          data: { readAt: now },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId or markAllRead' }, { status: 400 });
    }

    // Mark unread messages sent by the other party as read
    const updateResult = await db.message.updateMany({
      where: {
        bookingId,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: {
        readAt: now,
      },
    });

    const readData = {
      bookingId,
      readByUserId: session.user.id,
      readAt: now.toISOString(),
      count: updateResult.count,
    };

    chatStream.broadcastRead(bookingId, readData);

    return NextResponse.json({ success: true, ...readData });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
