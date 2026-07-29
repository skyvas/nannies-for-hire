import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getCurrentSession } from '../../../../lib/adapters/auth';
import { chatStream } from '../../../../lib/services/chatStream';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  const messages = await db.message.findMany({
    where: { bookingId },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, content, imageUrl } = body;

    if (!bookingId || (!content && !imageUrl)) {
      return NextResponse.json({ error: 'Message content or image required' }, { status: 400 });
    }

    // Verify booking access
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        household: { include: { members: true } },
        sitterProfile: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isParentMember = booking.household.members.some((m) => m.userId === session.user?.id);
    const isAssignedSitter = booking.sitterProfile.userId === session.user?.id;

    if (!isParentMember && !isAssignedSitter && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You are not part of this booking' }, { status: 403 });
    }

    const newMessage = await db.message.create({
      data: {
        bookingId,
        senderId: session.user.id,
        content: content || '',
        imageUrl: imageUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Broadcast live event via SSE
    chatStream.broadcastMessage(bookingId, newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Error posting chat message:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
