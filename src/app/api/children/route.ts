import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { householdId, firstName, birthDate, gender, allergies, medicalNotes, bedtimeRoutine } =
      await request.json();

    if (!householdId || !firstName || !birthDate) {
      return NextResponse.json({ error: 'Missing required child profile fields.' }, { status: 400 });
    }

    const child = await db.child.create({
      data: {
        householdId,
        firstName,
        birthDate: new Date(birthDate),
        gender,
        allergies,
        medicalNotes,
        bedtimeRoutine,
      },
    });

    return NextResponse.json({ success: true, child });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add child profile.' }, { status: 500 });
  }
}
