import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createChildSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createChildSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Missing required child profile fields.' }, { status: 400 });
    }

    const { householdId, firstName, birthDate, gender, allergies, medicalNotes, bedtimeRoutine } = parseResult.data;

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
