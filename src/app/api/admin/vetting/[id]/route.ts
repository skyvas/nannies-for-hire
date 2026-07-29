import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vettingActionSchema } from '@/lib/validations';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = vettingActionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid action.' }, { status: 400 });
    }

    const { action } = parseResult.data;

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updatedProfile = await db.sitterProfile.update({
      where: { id },
      data: { verificationStatus: newStatus },
      include: { user: true },
    });

    return NextResponse.json({ success: true, updatedProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sitter verification status.' }, { status: 500 });
  }
}
