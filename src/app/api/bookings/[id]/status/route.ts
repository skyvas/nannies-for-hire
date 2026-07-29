import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateBookingStatusSchema } from '@/lib/validations';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = updateBookingStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid action.' }, { status: 400 });
    }

    const { action } = parseResult.data;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        household: { include: { members: { include: { user: true } } } },
        sitterProfile: { include: { user: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    let updateData: any = {};
    let notifType = '';
    let notifTitle = '';
    let notifContent = '';

    const parentUser = booking.household.members[0]?.user;
    const sitterUser = booking.sitterProfile.user;

    switch (action) {
      case 'ACCEPT':
        updateData = { status: 'CONFIRMED' };
        notifType = 'BOOKING_ACCEPTED';
        notifTitle = `Booking Confirmed by ${sitterUser.firstName}`;
        notifContent = `${sitterUser.firstName} accepted your booking request (${booking.numChildren} ${booking.numChildren === 1 ? 'child' : 'children'} • $${booking.totalAmount.toFixed(2)} CAD).`;
        break;
      case 'DECLINE':
        updateData = { status: 'DECLINED' };
        notifType = 'BOOKING_DECLINED';
        notifTitle = `Booking Request Declined`;
        notifContent = `${sitterUser.firstName} is unavailable for your requested time slot.`;
        break;
      case 'START_SITTING':
        updateData = {
          status: 'IN_PROGRESS',
          actualStartTime: new Date(),
        };
        notifType = 'SITTING_STARTED';
        notifTitle = `Caregiver Clocked In`;
        notifContent = `${sitterUser.firstName} has arrived and started the sitting session.`;
        break;
      case 'END_SITTING':
        updateData = {
          status: 'SETTLED',
          actualEndTime: new Date(),
        };
        notifType = 'SITTING_COMPLETED';
        notifTitle = `Sitting Completed & Settled`;
        notifContent = `Sitting session completed. $${booking.totalAmount.toFixed(2)} CAD settled via platform payment engine.`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: updateData,
    });

    // Dispatch non-blocking notification to parent user
    if (parentUser && notifType) {
      try {
        await db.notification.create({
          data: {
            userId: parentUser.id,
            type: notifType,
            title: notifTitle,
            content: notifContent,
            bookingId: booking.id,
            targetRoute: `/parent/bookings?bookingId=${booking.id}`,
            actorName: `${sitterUser.firstName} ${sitterUser.lastName}`,
            actorAvatar: sitterUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          },
        });
      } catch (notifErr) {
        console.error('Non-blocking notification dispatch error:', notifErr);
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking status.' }, { status: 500 });
  }
}
