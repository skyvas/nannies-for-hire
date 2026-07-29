import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';

export async function GET(req: Request) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const cprOnly = searchParams.get('cprOnly') === 'true';

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (cprOnly) {
      whereClause.cprCertified = true;
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { applicationNumber: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const applications = await prisma.nannyApplication.findMany({
      where: whereClause,
      include: {
        documents: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Failed to fetch nanny applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
