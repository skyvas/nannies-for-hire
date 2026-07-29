import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getCurrentSession } from '../../../../lib/adapters/auth';
import { calculateBookingPrice } from '../../../../lib/services/pricing';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const { sitterProfileId, householdId, startDateTime, endDateTime, numChildren, durationHours } =
      await request.json();

    if (!sitterProfileId || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Missing required booking fields.' }, { status: 400 });
    }

    // Find sitter profile to get rate rules
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

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Failed to create booking request', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
