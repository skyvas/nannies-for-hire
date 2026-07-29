import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Metro Vancouver childcare database...');

  // Clean existing tables
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.sitterAvailability.deleteMany();
  await prisma.sitterProfile.deleteMany();
  await prisma.child.deleteMany();
  await prisma.householdMember.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nanniesforhire.ca',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
  });

  // 2. Create Parent Users & Households
  const parentUser1 = await prisma.user.create({
    data: {
      email: 'parent.smith@example.com',
      firstName: 'David',
      lastName: 'Smith',
      phone: '604-555-0182',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    },
  });

  const parentUser2 = await prisma.user.create({
    data: {
      email: 'parent.chen@example.com',
      firstName: 'Sophia',
      lastName: 'Chen',
      phone: '604-555-0199',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    },
  });

  const household1 = await prisma.household.create({
    data: {
      familyName: 'Smith Family',
      address: '2410 W 4th Ave',
      city: 'Vancouver',
      neighborhood: 'Kitsilano',
      postalCode: 'V6K 1P4',
      members: {
        create: {
          userId: parentUser1.id,
          relationship: 'Primary Parent',
        },
      },
      children: {
        create: [
          {
            firstName: 'Leo',
            birthDate: new Date('2021-04-12'),
            gender: 'Male',
            allergies: 'Peanut allergy (Epipen in kitchen drawer)',
            medicalNotes: 'Slight asthma, inhaler in bag',
            bedtimeRoutine: 'Bedtime story at 8:00 PM, dim nightlight on',
          },
          {
            firstName: 'Maya',
            birthDate: new Date('2023-09-05'),
            gender: 'Female',
            allergies: 'None',
            bedtimeRoutine: 'Lullaby music box before sleep at 7:30 PM',
          },
        ],
      },
    },
  });

  const household2 = await prisma.household.create({
    data: {
      familyName: 'Chen Family',
      address: '4500 Lougheed Hwy',
      city: 'Burnaby',
      neighborhood: 'Brentwood',
      postalCode: 'V5C 3Z3',
      members: {
        create: {
          userId: parentUser2.id,
          relationship: 'Primary Parent',
        },
      },
      children: {
        create: [
          {
            firstName: 'Oliver',
            birthDate: new Date('2020-11-20'),
            gender: 'Male',
            allergies: 'Dairy sensitive (Lactose free milk provided)',
            bedtimeRoutine: 'Loves reading dinosaur books at 8:30 PM',
          },
        ],
      },
    },
  });

  // 3. Create Approved Sitters
  const sittersData = [
    {
      email: 'sarah.sitter@example.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phone: '604-555-0144',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      headline: 'Certified ECE & Red Cross CPR Certified Sitter',
      bio: 'Hi! I am an Early Childhood Educator with 5+ years of experience working with infants and toddlers in Vancouver. I love outdoor activities, crafts, and reading stories!',
      baseHourlyRate: 26.0,
      extraChildRate: 3.0,
      yearsExperience: 5,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English, French',
      verificationStatus: 'APPROVED',
      averageRating: 4.9,
      totalReviews: 18,
    },
    {
      email: 'emily.wong@example.com',
      firstName: 'Emily',
      lastName: 'Wong',
      phone: '604-555-0167',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      headline: 'UBC Nursing Student & Experienced Evening Babysitter',
      bio: 'Hi parents! I am a senior nursing student at UBC with Level C CPR/AED certification. Reliable, energetic, and experienced with toddlers and bedtime routines.',
      baseHourlyRate: 24.0,
      extraChildRate: 2.0,
      yearsExperience: 4,
      cprCertified: true,
      hasVehicle: false,
      languages: 'English, Cantonese, Mandarin',
      verificationStatus: 'APPROVED',
      averageRating: 5.0,
      totalReviews: 12,
    },
    {
      email: 'jessica.m@example.com',
      firstName: 'Jessica',
      lastName: 'Miller',
      phone: '604-555-0191',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
      headline: 'Patient & Creative Babysitter in Burnaby/East Van',
      bio: 'Former nanny and current elementary tutor. Great with bedtime routines, healthy meal prep, and quiet evening games.',
      baseHourlyRate: 22.0,
      extraChildRate: 2.5,
      yearsExperience: 6,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English',
      verificationStatus: 'APPROVED',
      averageRating: 4.8,
      totalReviews: 24,
    },
  ];

  const createdSitters = [];
  for (const s of sittersData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        role: 'SITTER',
        avatarUrl: s.avatarUrl,
      },
    });

    const sitterProfile = await prisma.sitterProfile.create({
      data: {
        userId: user.id,
        headline: s.headline,
        bio: s.bio,
        baseHourlyRate: s.baseHourlyRate,
        extraChildRate: s.extraChildRate,
        yearsExperience: s.yearsExperience,
        cprCertified: s.cprCertified,
        hasVehicle: s.hasVehicle,
        languages: s.languages,
        verificationStatus: s.verificationStatus,
        averageRating: s.averageRating,
        totalReviews: s.totalReviews,
        availability: {
          create: [
            { dayOfWeek: 5, startTime: '17:00', endTime: '23:30' }, // Friday
            { dayOfWeek: 6, startTime: '15:00', endTime: '24:00' }, // Saturday
            { dayOfWeek: 0, startTime: '16:00', endTime: '22:00' }, // Sunday
          ],
        },
      },
    });

    createdSitters.push({ user, profile: sitterProfile });
  }

  // 4. Create 1 Pending Vetting Sitter for Admin Queue Demo
  const pendingUser = await prisma.user.create({
    data: {
      email: 'chloe.tremblay@example.com',
      firstName: 'Chloe',
      lastName: 'Tremblay',
      phone: '604-555-0133',
      role: 'SITTER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
  });

  await prisma.sitterProfile.create({
    data: {
      userId: pendingUser.id,
      headline: 'Certified Camp Counselor & First Aid Trained',
      bio: 'New to Metro Vancouver! Looking to provide evening babysitting in North Vancouver. Certified in Standard First Aid & CPR C.',
      baseHourlyRate: 23.0,
      extraChildRate: 2.0,
      yearsExperience: 3,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English, French',
      verificationStatus: 'PENDING_VERIFICATION',
      idDocumentUrl: '/demo_id_chloe.pdf',
      referenceNotes: 'Reference Check Completed: Verified by former employer at YMCA Camp.',
    },
  });

  // 5. Create Sample Completed Booking with Review
  const completedBooking = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_1',
      householdId: household1.id,
      sitterProfileId: createdSitters[0].profile.id, // Sarah Jenkins
      status: 'SETTLED',
      startDateTime: new Date(Date.now() - 86400000 * 3), // 3 days ago
      endDateTime: new Date(Date.now() - 86400000 * 3 + 14400000), // 4 hours
      numChildren: 2,
      hourlyRate: 26.0,
      extraChildRate: 3.0,
      subtotalAmount: (26.0 + 3.0) * 4, // $116.00
      platformFee: 116.00 * 0.15,        // $17.40
      totalAmount: 116.00 + 17.40,      // $133.40
      actualStartTime: new Date(Date.now() - 86400000 * 3),
      actualEndTime: new Date(Date.now() - 86400000 * 3 + 14400000),
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      authorId: parentUser1.id,
      targetId: createdSitters[0].user.id,
      rating: 5,
      comment: 'Sarah was incredible with Leo and Maya! She arrived right on time, followed bedtime instructions perfectly, and left the playroom tidy. Will definitely book again!',
      tags: 'Punctual,Great with Toddlers,Clean,Responsive',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
