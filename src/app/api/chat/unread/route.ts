import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getCurrentSession } from '../../../../lib/adapters/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ totalUnread: 0, threads: [] });
    }

    const userId = session.user.id;

    // Find all bookings where user is either parent or sitter
    const userHousehold = await db.householdMember.findFirst({
      where: { userId },
      select: { householdId: true },
    });

    const userSitterProfile = await db.sitterProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const bookings = await db.booking.findMany({
      where: {
        OR: [
          ...(userHousehold ? [{ householdId: userHousehold.householdId }] : []),
          ...(userSitterProfile ? [{ sitterProfileId: userSitterProfile.id }] : []),
        ],
      },
      select: {
        id: true,
        household: {
          select: { familyName: true },
        },
        sitterProfile: {
          select: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    const bookingIds = bookings.map((b) => b.id);

    if (bookingIds.length === 0) {
      return NextResponse.json({ totalUnread: 0, threads: [] });
    }

    // Get unread messages (never authored by self, readAt === null)
    const unreadMessages = await db.message.findMany({
      where: {
        bookingId: { in: bookingIds },
        senderId: { not: userId },
        readAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUnread = unreadMessages.length;

    // Group unread messages by booking thread
    const threadsMap = new Map<string, { bookingId: string; title: string; count: number; lastMessage: any }>();

    for (const msg of unreadMessages) {
      const booking = bookings.find((b) => b.id === msg.bookingId);
      const title = session.user.role === 'SITTER'
        ? booking?.household.familyName || 'Booking'
        : `${booking?.sitterProfile.user.firstName} ${booking?.sitterProfile.user.lastName}`;

      if (!threadsMap.has(msg.bookingId)) {
        threadsMap.set(msg.bookingId, {
          bookingId: msg.bookingId,
          title,
          count: 1,
          lastMessage: msg,
        });
      } else {
        const existing = threadsMap.get(msg.bookingId)!;
        existing.count += 1;
      }
    }

    return NextResponse.json({
      totalUnread,
      threads: Array.from(threadsMap.values()),
    });
  } catch (error: any) {
    console.error('Error fetching unread chat count:', error);
    return NextResponse.json({ totalUnread: 0, threads: [] }, { status: 500 });
  }
}
