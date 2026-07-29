import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { calculateBookingPrice } from '@/lib/services/pricing';
import { createBookingRequestSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const parseResult = createBookingRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    const { sitterProfileId, householdId, startDateTime, endDateTime, numChildren, durationHours } = parseResult.data;

    // Validate that requested booking start time is not in the past
    const requestedStart = new Date(startDateTime);
    if (isNaN(requestedStart.getTime()) || requestedStart < new Date(Date.now() - 60000)) {
      return NextResponse.json(
        { error: 'Booking start time cannot be in the past. Please select a future time in Vancouver.' },
        { status: 400 }
      );
    }

    // Find sitter profile to get rate rules & userId
    const sitter = await db.sitterProfile.findUnique({
      where: { id: sitterProfileId },
    });

    if (!sitter) {
      return NextResponse.json({ error: 'Sitter profile not found.' }, { status: 404 });
    }

    // Calculate exact pricing
    const pricing = calculateBookingPrice(
      sitter.baseHourlyRate,
      sitter.extraChildRate,
      numChildren || 1,
      durationHours || 4
    );

    // Get household
    let targetHouseholdId = householdId;
    if (!targetHouseholdId || targetHouseholdId === 'demo_household_1') {
      const defaultHousehold = await db.household.findFirst();
      targetHouseholdId = defaultHousehold?.id;
    }

    if (!targetHouseholdId) {
      return NextResponse.json({ error: 'No parent household available.' }, { status: 400 });
    }

    const household = await db.household.findUnique({
      where: { id: targetHouseholdId },
    });

    // Create booking transaction in REQUESTED state
    const booking = await db.booking.create({
      data: {
        householdId: targetHouseholdId,
        sitterProfileId: sitter.id,
        status: 'REQUESTED',
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        numChildren: pricing.numChildren,
        hourlyRate: pricing.baseHourlyRate,
        extraChildRate: pricing.extraChildRate,
        subtotalAmount: pricing.subtotalAmount,
        platformFee: pricing.platformFee,
        totalAmount: pricing.totalAmount,
      },
    });

    // Create notification for targeted sitter
    await db.notification.create({
      data: {
        userId: sitter.userId,
        type: 'NEW_BOOKING_REQUEST',
        title: `New Booking Request from ${household?.familyName || 'Parent Household'}`,
        content: `${pricing.numChildren} ${pricing.numChildren === 1 ? 'child' : 'children'} • $${pricing.subtotalAmount.toFixed(2)} CAD estimated payout`,
        bookingId: booking.id,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Failed to create booking request', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
