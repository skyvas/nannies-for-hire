import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database tables...');

  // Delete all existing data in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.applicationDocument.deleteMany();
  await prisma.nannyApplication.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.sitterAvailability.deleteMany();
  await prisma.sitterProfile.deleteMany();
  await prisma.child.deleteMany();
  await prisma.householdMember.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Metro Vancouver rich marketplace dataset...');

  // 1. Create Platform Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nanniesforhire.ca',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
  });

  // 2. Create Parent Users & Households across Metro Vancouver
  const parent1 = await prisma.user.create({
    data: {
      email: 'parent.smith@example.com',
      firstName: 'David',
      lastName: 'Smith',
      phone: '604-555-0182',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      email: 'parent.chen@example.com',
      firstName: 'Sophia',
      lastName: 'Chen',
      phone: '604-555-0199',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    },
  });

  const parent3 = await prisma.user.create({
    data: {
      email: 'parent.macdonald@example.com',
      firstName: 'Robert',
      lastName: 'MacDonald',
      phone: '604-555-0211',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    },
  });

  const parent4 = await prisma.user.create({
    data: {
      email: 'parent.patel@example.com',
      firstName: 'Aarav',
      lastName: 'Patel',
      phone: '604-555-0344',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    },
  });

  const parent5 = await prisma.user.create({
    data: {
      email: 'parent.taylor@example.com',
      firstName: 'Jessica',
      lastName: 'Taylor',
      phone: '604-555-0488',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
  });

  const household1 = await prisma.household.create({
    data: {
      familyName: 'Smith Family',
      address: '2410 W 4th Ave',
      city: 'Vancouver',
      neighborhood: 'Kitsilano',
      postalCode: 'V6K 1P4',
      members: { create: { userId: parent1.id, relationship: 'Primary Parent' } },
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
      members: { create: { userId: parent2.id, relationship: 'Primary Parent' } },
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

  const household3 = await prisma.household.create({
    data: {
      familyName: 'MacDonald Family',
      address: '120 Lonsdale Ave',
      city: 'North Vancouver',
      neighborhood: 'Lower Lonsdale',
      postalCode: 'V7M 2E8',
      members: { create: { userId: parent3.id, relationship: 'Primary Parent' } },
      children: {
        create: [
          {
            firstName: 'Liam',
            birthDate: new Date('2019-06-14'),
            gender: 'Male',
            allergies: 'Bee stings',
            bedtimeRoutine: 'Quiet sensory light therapy before 9:00 PM bedtime',
          },
          {
            firstName: 'Emma',
            birthDate: new Date('2022-01-30'),
            gender: 'Female',
            allergies: 'None',
            bedtimeRoutine: 'Warm milk and stuffed bear at 8:00 PM',
          },
        ],
      },
    },
  });

  const household4 = await prisma.household.create({
    data: {
      familyName: 'Patel Family',
      address: '3800 Moncton St',
      city: 'Richmond',
      neighborhood: 'Steveston',
      postalCode: 'V7E 3A7',
      members: { create: { userId: parent4.id, relationship: 'Primary Parent' } },
      children: {
        create: [
          {
            firstName: 'Aarav Jr.',
            birthDate: new Date('2021-08-10'),
            gender: 'Male',
            allergies: 'Tree nuts',
            bedtimeRoutine: 'Soft bedtime stories at 8:15 PM',
          },
        ],
      },
    },
  });

  const household5 = await prisma.household.create({
    data: {
      familyName: 'Taylor Family',
      address: '2929 Barnet Hwy',
      city: 'Coquitlam',
      neighborhood: 'Town Centre',
      postalCode: 'V3B 5R5',
      members: { create: { userId: parent5.id, relationship: 'Primary Parent' } },
      children: {
        create: [
          {
            firstName: 'Noah',
            birthDate: new Date('2020-03-15'),
            gender: 'Male',
            allergies: 'None',
            bedtimeRoutine: 'Board game after dinner, lights out at 8:30 PM',
          },
        ],
      },
    },
  });

  // 3. Create 8 Approved Sitter Profiles
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
    {
      email: 'hannah.fraser@example.com',
      firstName: 'Hannah',
      lastName: 'Fraser',
      phone: '604-555-0277',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      headline: 'Special Needs Trained Nanny & North Shore Local',
      bio: 'Certified in pediatric first aid with specialized training in autism support and sensory care. Experienced with multi-child households.',
      baseHourlyRate: 27.0,
      extraChildRate: 3.5,
      yearsExperience: 7,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English',
      verificationStatus: 'APPROVED',
      averageRating: 5.0,
      totalReviews: 15,
    },
    {
      email: 'amara.okafor@example.com',
      firstName: 'Amara',
      lastName: 'Okafor',
      phone: '604-555-0388',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
      headline: 'Infant Specialist & Certified Pediatric Doula',
      bio: 'Warm, nurturing caregiver specializing in newborn and infant care. 8 years of private home childcare experience.',
      baseHourlyRate: 28.0,
      extraChildRate: 4.0,
      yearsExperience: 8,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English, Swahili',
      verificationStatus: 'APPROVED',
      averageRating: 4.9,
      totalReviews: 31,
    },
    {
      email: 'lucas.silva@example.com',
      firstName: 'Lucas',
      lastName: 'Silva',
      phone: '604-555-0412',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      headline: 'Active Youth Coach & Fun Weekend Babysitter',
      bio: 'Youth soccer coach and SFU student. Active, responsible, and skilled at keeping kids engaged with sports and creative games.',
      baseHourlyRate: 23.0,
      extraChildRate: 2.0,
      yearsExperience: 4,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English, Portuguese',
      verificationStatus: 'APPROVED',
      averageRating: 4.8,
      totalReviews: 9,
    },
    {
      email: 'priya.sharma@example.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '604-555-0555',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      headline: 'Early Childhood Diploma & Multi-Lingual Caregiver',
      bio: 'Experienced nanny skilled in meal prep, homework assistance, and bedtime routines. 5+ years caring for kids of all ages.',
      baseHourlyRate: 25.0,
      extraChildRate: 2.5,
      yearsExperience: 5,
      cprCertified: true,
      hasVehicle: false,
      languages: 'English, Hindi, Punjabi',
      verificationStatus: 'APPROVED',
      averageRating: 5.0,
      totalReviews: 21,
    },
    {
      email: 'zoe.dubois@example.com',
      firstName: 'Zoe',
      lastName: 'Dubois',
      phone: '604-555-0699',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      headline: 'Montessori Educator & Premium Night Sitter',
      bio: '9 years of nanny experience in West Vancouver and Downtown. Specialized in Montessori early development techniques.',
      baseHourlyRate: 29.0,
      extraChildRate: 4.0,
      yearsExperience: 9,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English, French',
      verificationStatus: 'APPROVED',
      averageRating: 5.0,
      totalReviews: 42,
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
            { dayOfWeek: 5, startTime: '17:00', endTime: '23:30' },
            { dayOfWeek: 6, startTime: '15:00', endTime: '24:00' },
            { dayOfWeek: 0, startTime: '16:00', endTime: '22:00' },
          ],
        },
      },
    });

    createdSitters.push({ user, profile: sitterProfile });
  }

  // 4. Create Pending Vetting Sitter for Admin Queue Demo
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

  // Create Nanny Applications for Admin Vetting Queue Demo
  await prisma.nannyApplication.create({
    data: {
      applicationNumber: 'APP-2026-8801',
      applicantId: pendingUser.id,
      firstName: 'Chloe',
      lastName: 'Tremblay',
      email: 'chloe.tremblay@example.com',
      phone: '604-555-0133',
      dob: new Date('1998-05-14'),
      address: '1420 Lonsdale Ave',
      city: 'North Vancouver',
      state: 'BC',
      postalCode: 'V7M 2J1',
      emergencyContact: 'Luc Tremblay',
      emergencyPhone: '604-555-9911',
      yearsExperience: 3,
      childcareTypes: 'Infants, Toddlers, Evening Sitting',
      infantExp: true,
      toddlerExp: true,
      specialNeedsExp: false,
      cprCertified: true,
      ownVehicle: true,
      languages: 'English, French',
      education: 'Capilano University ECE Diploma',
      availability: 'Evenings & Weekends',
      driverLicenseStatus: 'VALID_FULL',
      electronicSignature: 'Chloe Tremblay',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 3600000 * 2),
      documents: {
        create: [
          { documentType: 'GOVT_ID', fileName: 'chloe_bcid.pdf', storagePath: 'uploads/docs/chloe_id.pdf', fileSize: 245000, mimeType: 'application/pdf' },
          { documentType: 'CPR_CERT', fileName: 'cpr_redcross_2026.pdf', storagePath: 'uploads/docs/chloe_cpr.pdf', fileSize: 180000, mimeType: 'application/pdf' },
        ],
      },
    },
  });

  await prisma.nannyApplication.create({
    data: {
      applicationNumber: 'APP-2026-8802',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@example.com',
      phone: '604-555-0711',
      dob: new Date('1996-09-22'),
      address: '2210 Main St',
      city: 'Vancouver',
      state: 'BC',
      postalCode: 'V5T 3C7',
      emergencyContact: 'Sarah Vance',
      emergencyPhone: '604-555-8822',
      yearsExperience: 5,
      childcareTypes: 'School Age, Sports & Activities, Weekend Sitting',
      infantExp: false,
      toddlerExp: true,
      specialNeedsExp: true,
      cprCertified: true,
      ownVehicle: true,
      languages: 'English',
      education: 'SFU Kinesiology Bachelor Degree',
      availability: 'Weekends & After-school',
      driverLicenseStatus: 'VALID_FULL',
      electronicSignature: 'Marcus Vance',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 3600000 * 5),
      documents: {
        create: [
          { documentType: 'GOVT_ID', fileName: 'marcus_dl.pdf', storagePath: 'uploads/docs/marcus_dl.pdf', fileSize: 310000, mimeType: 'application/pdf' },
          { documentType: 'BACKGROUND_CHECK_AUTH', fileName: 'criminal_check_bc.pdf', storagePath: 'uploads/docs/marcus_crc.pdf', fileSize: 420000, mimeType: 'application/pdf' },
        ],
      },
    },
  });

  // 5. Create Bookings Across Various Lifecycle States
  const completedBooking1 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_1',
      householdId: household1.id,
      sitterProfileId: createdSitters[0].profile.id, // Sarah Jenkins
      status: 'SETTLED',
      startDateTime: new Date(Date.now() - 86400000 * 3),
      endDateTime: new Date(Date.now() - 86400000 * 3 + 14400000),
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

  const completedBooking2 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_2',
      householdId: household2.id,
      sitterProfileId: createdSitters[1].profile.id, // Emily Wong
      status: 'SETTLED',
      startDateTime: new Date(Date.now() - 86400000 * 2),
      endDateTime: new Date(Date.now() - 86400000 * 2 + 10800000),
      numChildren: 1,
      hourlyRate: 24.0,
      extraChildRate: 2.0,
      subtotalAmount: 24.0 * 3,   // $72.00
      platformFee: 72.00 * 0.15,  // $10.80
      totalAmount: 72.00 + 10.80, // $82.80
      actualStartTime: new Date(Date.now() - 86400000 * 2),
      actualEndTime: new Date(Date.now() - 86400000 * 2 + 10800000),
    },
  });

  const inProgressBooking = await prisma.booking.create({
    data: {
      id: 'seed_in_progress_booking',
      householdId: household3.id,
      sitterProfileId: createdSitters[3].profile.id, // Hannah Fraser
      status: 'IN_PROGRESS',
      startDateTime: new Date(Date.now() - 3600000 * 2),
      endDateTime: new Date(Date.now() + 3600000 * 2),
      numChildren: 2,
      hourlyRate: 27.0,
      extraChildRate: 3.5,
      subtotalAmount: (27.0 + 3.5) * 4, // $122.00
      platformFee: 122.00 * 0.15,        // $18.30
      totalAmount: 122.00 + 18.30,      // $140.30
      actualStartTime: new Date(Date.now() - 3600000 * 2),
    },
  });

  const requestedBooking1 = await prisma.booking.create({
    data: {
      id: 'seed_requested_booking_1',
      householdId: household4.id,
      sitterProfileId: createdSitters[4].profile.id, // Amara Okafor
      status: 'REQUESTED',
      startDateTime: new Date(Date.now() + 86400000 * 2),
      endDateTime: new Date(Date.now() + 86400000 * 2 + 14400000),
      numChildren: 1,
      hourlyRate: 28.0,
      extraChildRate: 4.0,
      subtotalAmount: 28.0 * 4,   // $112.00
      platformFee: 112.00 * 0.15, // $16.80
      totalAmount: 112.00 + 16.80,// $128.80
    },
  });

  // 6. Create Reviews
  await prisma.review.create({
    data: {
      bookingId: completedBooking1.id,
      authorId: parent1.id,
      targetId: createdSitters[0].user.id,
      rating: 5,
      comment: 'Sarah was incredible with Leo and Maya! She arrived right on time, followed bedtime instructions perfectly, and left the playroom tidy. Will definitely book again!',
      tags: 'Punctual,Great with Toddlers,Clean,Responsive',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking2.id,
      authorId: parent2.id,
      targetId: createdSitters[1].user.id,
      rating: 5,
      comment: 'Emily is fantastic! Oliver loved reading dinosaur books with her. She kept us updated throughout the evening.',
      tags: 'Patient,Communicative,Fun',
    },
  });

  // 7. Create Rich Pre-Populated Notifications
  const now = new Date();
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'NEW_NANNY_APPLICATION',
        title: 'New Nanny Application Submitted',
        content: 'Chloe Tremblay (North Vancouver) • 3 yrs exp • ID & CPR uploaded',
        targetRoute: '/admin/vetting?tab=APPLICATIONS',
        actorName: 'Chloe Tremblay',
        actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 2),
      },
      {
        userId: adminUser.id,
        type: 'NEW_NANNY_APPLICATION',
        title: 'New Nanny Application Submitted',
        content: 'Marcus Vance (Vancouver) • 5 yrs exp • ID & CRC uploaded',
        targetRoute: '/admin/vetting?tab=APPLICATIONS',
        actorName: 'Marcus Vance',
        actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 5),
      },
      {
        userId: createdSitters[0].user.id, // Sarah Jenkins
        type: 'NEW_BOOKING_REQUEST',
        title: 'New Booking Request from Smith Family',
        content: '2 children • $116.00 CAD estimated payout',
        bookingId: completedBooking1.id,
        targetRoute: `/sitter/jobs?bookingId=${completedBooking1.id}`,
        actorName: 'David Smith',
        actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 1),
      },
      {
        userId: parent1.id, // David Smith
        type: 'BOOKING_ACCEPTED',
        title: 'Booking Confirmed by Sarah',
        content: 'Sarah accepted your booking request (2 children • $133.40 CAD total).',
        bookingId: completedBooking1.id,
        targetRoute: `/parent/bookings?bookingId=${completedBooking1.id}`,
        actorName: 'Sarah Jenkins',
        actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 4),
      },
      {
        userId: parent3.id, // Robert MacDonald
        type: 'SITTING_STARTED',
        title: 'Caregiver Clocked In',
        content: 'Hannah has arrived and started the sitting session.',
        bookingId: inProgressBooking.id,
        targetRoute: `/parent/bookings?bookingId=${inProgressBooking.id}`,
        actorName: 'Hannah Fraser',
        actorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 2),
      },
    ],
  });

  console.log('Seeding Metro Vancouver marketplace database completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
