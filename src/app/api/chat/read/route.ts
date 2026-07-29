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

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const now = new Date();

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
