import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { chatStream } from '@/lib/services/chatStream';
import { getMessageQuerySchema, createMessageSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parseResult = getMessageQuerySchema.safeParse({
    bookingId: searchParams.get('bookingId'),
  });

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Missing bookingId' }, { status: 400 });
  }

  const { bookingId } = parseResult.data;

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
    const parseResult = createMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Message content or image required' }, { status: 400 });
    }

    const { bookingId, content, imageUrl, attachments } = parseResult.data;

    // Determine stored media value (JSON array if attachments provided, otherwise single imageUrl)
    let storedImageUrl: string | null = null;
    if (attachments && attachments.length > 0) {
      storedImageUrl = JSON.stringify(attachments);
    } else if (imageUrl) {
      storedImageUrl = imageUrl;
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
        imageUrl: storedImageUrl,
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

    // Create persistent notification for recipient
    const recipientUserId = isAssignedSitter
      ? booking.household.members[0]?.userId
      : booking.sitterProfile.userId;

    if (recipientUserId && recipientUserId !== session.user.id) {
      const recipientIsParent = isAssignedSitter;
      const targetRoute = recipientIsParent
        ? `/parent/bookings?bookingId=${bookingId}`
        : `/sitter/jobs?bookingId=${bookingId}`;

      try {
        await db.notification.create({
          data: {
            userId: recipientUserId,
            type: 'CHAT_MESSAGE',
            title: `New Message from ${session.user.firstName}`,
            content: content || '📷 Sent a photo attachment',
            bookingId,
            targetRoute,
            actorName: `${session.user.firstName} ${session.user.lastName}`,
            actorAvatar: session.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
        });
      } catch (notifErr) {
        console.error('Non-blocking chat notification error:', notifErr);
      }
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Error posting chat message:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
