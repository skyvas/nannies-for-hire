import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json(); // "APPROVE" or "REJECT"

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

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
