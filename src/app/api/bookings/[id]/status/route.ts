import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json(); // "ACCEPT", "DECLINE", "START_SITTING", "END_SITTING"

    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    let updateData: any = {};

    switch (action) {
      case 'ACCEPT':
        updateData = { status: 'CONFIRMED' };
        break;
      case 'DECLINE':
        updateData = { status: 'DECLINED' };
        break;
      case 'START_SITTING':
        updateData = {
          status: 'IN_PROGRESS',
          actualStartTime: new Date(),
        };
        break;
      case 'END_SITTING':
        updateData = {
          status: 'SETTLED',
          actualEndTime: new Date(),
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking status.' }, { status: 500 });
  }
}
