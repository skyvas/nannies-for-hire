import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { createNannyApplicationSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = createNannyApplicationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check for duplicate active application by email
    const existing = await prisma.nannyApplication.findFirst({
      where: {
        email: data.email,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'INTERVIEW_SCHEDULED', 'BACKGROUND_CHECK'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An active application with this email address is already under review.' },
        { status: 400 }
      );
    }

    // Generate reference number (e.g. APP-849201)
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const applicationNumber = `APP-${randomCode}`;

    // Format childcareTypes string
    const childcareTypesStr = Array.isArray(data.childcareTypes)
      ? JSON.stringify(data.childcareTypes)
      : data.childcareTypes;

    // Create Application and related ApplicationDocument records
    const application = await prisma.nannyApplication.create({
      data: {
        applicationNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: new Date(data.dob),
        address: data.address,
        city: data.city,
        state: data.state || 'BC',
        postalCode: data.postalCode,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,

        // Professional Info
        yearsExperience: data.yearsExperience,
        childcareTypes: childcareTypesStr,
        infantExp: data.infantExp,
        toddlerExp: data.toddlerExp,
        specialNeedsExp: data.specialNeedsExp,
        languages: data.languages,
        education: data.education,
        certifications: data.certifications || null,
        availability: data.availability,
        preferredSchedule: data.preferredSchedule || null,
        willingToTravel: data.willingToTravel,
        driverLicenseStatus: data.driverLicenseStatus,
        ownVehicle: data.ownVehicle,
        cprCertified: data.cprCertified,
        firstAidCertified: data.firstAidCertified,

        // Agreements
        agreementsAccepted: data.agreementsAccepted,
        electronicSignature: data.electronicSignature,
        ipAddress: data.ipAddress || req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: data.userAgent || req.headers.get('user-agent') || 'Browser',

        status: 'SUBMITTED',

        documents: {
          create: data.documents.map((doc) => ({
            documentType: doc.documentType,
            fileName: doc.fileName,
            storagePath: doc.storagePath,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            verificationStatus: 'PENDING',
          })),
        },
      },
      include: {
        documents: true,
      },
    });

    // Notify Platform Admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminUser) {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          type: 'NEW_NANNY_APPLICATION',
          title: 'New Nanny Application Submitted',
          content: `${data.firstName} ${data.lastName} (${data.city}, BC) submitted application ${applicationNumber}.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      applicationNumber: application.applicationNumber,
      id: application.id,
      submittedAt: application.submittedAt,
    });
  } catch (error) {
    console.error('Failed to submit nanny application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
