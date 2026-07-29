import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { updateNannyApplicationStatusSchema } from '@/lib/validations';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await getCurrentSession();
    if (!adminUser || adminUser.role !== 'ADMIN') {
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

    // Fetch existing application
    const application = await prisma.nannyApplication.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    let provisionedUserId = application.applicantId;

    // AUTOMATIC PROVISIONING ON APPROVAL
    if (status === 'APPROVED') {
      // 1. Find or create User account
      let userAccount = await prisma.user.findUnique({
        where: { email: application.email },
      });

      if (!userAccount) {
        userAccount = await prisma.user.create({
          data: {
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            phone: application.phone,
            role: 'SITTER',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          },
        });
      }

      provisionedUserId = userAccount.id;

      // 2. Find government ID document
      const idDoc = application.documents.find((d) => d.documentType === 'GOVT_ID');

      // 3. Create or update SitterProfile
      const sitterProfile = await prisma.sitterProfile.upsert({
        where: { userId: userAccount.id },
        create: {
          userId: userAccount.id,
          bio: `Dedicated, background-checked nanny based in ${application.city}. CPR certified with ${application.yearsExperience} years of hands-on childcare experience.`,
          headline: `Experienced Caregiver (${application.yearsExperience} yrs exp) • ${application.city}`,
          baseHourlyRate: 26.0,
          extraChildRate: 2.5,
          yearsExperience: application.yearsExperience,
          cprCertified: application.cprCertified,
          hasVehicle: application.ownVehicle,
          languages: application.languages,
          verificationStatus: 'APPROVED',
          idDocumentUrl: idDoc?.storagePath || 'uploads/docs/govt_id.pdf',
          referenceNotes: `Approved from Nanny Application ${application.applicationNumber}`,
        },
        update: {
          verificationStatus: 'APPROVED',
          cprCertified: application.cprCertified,
          hasVehicle: application.ownVehicle,
          languages: application.languages,
        },
      });

      // 4. Provision default weekly availability slots if none exist
      const existingAvail = await prisma.sitterAvailability.count({
        where: { sitterProfileId: sitterProfile.id },
      });

      if (existingAvail === 0) {
        const defaultSlots = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
          sitterProfileId: sitterProfile.id,
          dayOfWeek,
          startTime: '17:00',
          endTime: '23:00',
        }));

        await prisma.sitterAvailability.createMany({
          data: defaultSlots,
        });
      }
    }

    // Update Application Status & Audit Log
    const updated = await prisma.nannyApplication.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        applicantId: provisionedUserId || undefined,
        reviewedAt: new Date(),
        reviewedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      },
      include: {
        documents: true,
      },
    });

    // Dispatch notification to applicant if user account exists
    if (provisionedUserId) {
      try {
        await prisma.notification.create({
          data: {
            userId: provisionedUserId,
            type: status === 'APPROVED' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
            title: status === 'APPROVED' ? 'Nanny Profile Approved!' : 'Application Status Update',
            content:
              status === 'APPROVED'
                ? 'Congratulations! Your caregiver application has been verified and activated on Nannies for Hire.'
                : `Your nanny application status has been updated to ${status}.`,
            targetRoute: status === 'APPROVED' ? '/sitter/jobs' : '/sitter/apply',
            actorName: `${adminUser.firstName} ${adminUser.lastName}`,
            actorAvatar: adminUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
        });
      } catch (notifErr) {
        console.error('Non-blocking admin application notification error:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      application: updated,
      provisionedUserId,
    });
  } catch (error) {
    console.error('Failed to update application status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
