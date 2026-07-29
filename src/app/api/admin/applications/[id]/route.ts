import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { updateNannyApplicationStatusSchema } from '@/lib/validations';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parseResult = updateNannyApplicationStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const { status, notes } = parseResult.data;

    const updated = await prisma.nannyApplication.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        reviewedAt: new Date(),
        reviewedBy: `${user.firstName} ${user.lastName}`,
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Failed to update application status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
