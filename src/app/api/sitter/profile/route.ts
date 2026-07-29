import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { updateSitterProfileSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const parseResult = updateSitterProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid sitter profile fields.' }, { status: 400 });
    }

    const { headline, bio, baseHourlyRate, extraChildRate, yearsExperience, cprCertified, hasVehicle, languages } = parseResult.data;

    let sitterProfile = null;
    if (session.user) {
      sitterProfile = await db.sitterProfile.findFirst({
        where: { userId: session.user.id },
      });
    }

    if (!sitterProfile) {
      sitterProfile = await db.sitterProfile.findFirst({
        where: { verificationStatus: 'APPROVED' },
      });
    }

    if (!sitterProfile) {
      return NextResponse.json({ error: 'Sitter profile not found.' }, { status: 404 });
    }

    const updatedProfile = await db.sitterProfile.update({
      where: { id: sitterProfile.id },
      data: {
        headline,
        bio,
        baseHourlyRate: Number(baseHourlyRate),
        extraChildRate: Number(extraChildRate),
        yearsExperience: Number(yearsExperience),
        cprCertified: Boolean(cprCertified),
        hasVehicle: Boolean(hasVehicle),
        languages,
      },
    });

    return NextResponse.json({ success: true, updatedProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sitter profile.' }, { status: 500 });
  }
}
