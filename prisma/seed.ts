import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Step 1: Clearing ALL existing database tables...');

  // Delete all existing data in reverse dependency order to avoid FK violations
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

  console.log('✅ All tables cleared.');
  console.log('');
  console.log('🌱 Step 2: Seeding Metro Vancouver Childcare Marketplace...');

  const now = new Date();

  // ─────────────────────────────────────────────
  // 1. PLATFORM ADMIN
  // ─────────────────────────────────────────────
  console.log('  → Creating Platform Admin...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nanniesforhire.ca',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
  });

  // ─────────────────────────────────────────────
  // 2. PARENT USERS (5 families across Metro Van)
  // ─────────────────────────────────────────────
  console.log('  → Creating 5 Parent Users & Households...');

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

  // ─────────────────────────────────────────────
  // 3. HOUSEHOLDS & CHILDREN
  // ─────────────────────────────────────────────
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
            medicalNotes: 'Slight asthma, inhaler in diaper bag',
            bedtimeRoutine: 'Bedtime story at 8:00 PM, dim nightlight on, white noise machine',
          },
          {
            firstName: 'Maya',
            birthDate: new Date('2023-09-05'),
            gender: 'Female',
            allergies: 'None',
            medicalNotes: 'None',
            bedtimeRoutine: 'Lullaby music box before sleep at 7:30 PM, needs pacifier',
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
            medicalNotes: 'None',
            bedtimeRoutine: 'Loves reading dinosaur books at 8:30 PM, star projector nightlight',
          },
          {
            firstName: 'Lily',
            birthDate: new Date('2024-02-14'),
            gender: 'Female',
            allergies: 'None',
            medicalNotes: 'Mild reflux, upright feeding',
            bedtimeRoutine: 'Swaddle wrap, white noise, nursery at 7:00 PM',
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
            medicalNotes: 'Epipen in hallway cabinet',
            bedtimeRoutine: 'Quiet sensory light therapy before 9:00 PM bedtime, weighted blanket',
          },
          {
            firstName: 'Emma',
            birthDate: new Date('2022-01-30'),
            gender: 'Female',
            allergies: 'None',
            medicalNotes: 'None',
            bedtimeRoutine: 'Warm milk and stuffed bear at 8:00 PM, nightlight on',
          },
          {
            firstName: 'Jack',
            birthDate: new Date('2024-06-10'),
            gender: 'Male',
            allergies: 'None',
            medicalNotes: 'Premature birth, regular checkups',
            bedtimeRoutine: 'Rocking chair, pacifier, swaddle at 6:30 PM',
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
            medicalNotes: 'Epipen in kitchen cabinet',
            bedtimeRoutine: 'Soft bedtime stories in Hindi at 8:15 PM, fan on low',
          },
          {
            firstName: 'Diya',
            birthDate: new Date('2023-03-22'),
            gender: 'Female',
            allergies: 'None',
            medicalNotes: 'None',
            bedtimeRoutine: 'Musical mobile, nursery rhymes playlist at 7:45 PM',
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
            medicalNotes: 'None',
            bedtimeRoutine: 'Board game after dinner, lights out at 8:30 PM',
          },
          {
            firstName: 'Ella',
            birthDate: new Date('2022-07-04'),
            gender: 'Female',
            allergies: 'Shellfish',
            medicalNotes: 'Carries Benadryl in bag',
            bedtimeRoutine: 'Drawing time then bedtime at 8:00 PM, door cracked open',
          },
          {
            firstName: 'Mia',
            birthDate: new Date('2024-11-15'),
            gender: 'Female',
            allergies: 'None',
            medicalNotes: 'None',
            bedtimeRoutine: 'Bottle at 6:30 PM, crib with sleep sack',
          },
        ],
      },
    },
  });

  // ─────────────────────────────────────────────
  // 4. APPROVED SITTER PROFILES (8 sitters)
  // ─────────────────────────────────────────────
  console.log('  → Creating 8 Approved Sitter Profiles...');

  const sittersData = [
    {
      email: 'sarah.sitter@example.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phone: '604-555-0144',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      headline: 'Certified ECE & Red Cross CPR Certified Sitter',
      bio: 'Hi! I am an Early Childhood Educator with 5+ years of experience working with infants and toddlers in Vancouver. I love outdoor activities, crafts, and reading stories! Available for evening and weekend bookings across Kitsilano, Downtown, and the West Side.',
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
      bio: 'Hi parents! I am a senior nursing student at UBC with Level C CPR/AED certification. Reliable, energetic, and experienced with toddlers and bedtime routines. Comfortable with infants and special medical needs.',
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
      bio: 'Former nanny and current elementary tutor. Great with bedtime routines, healthy meal prep, and quiet evening games. I bring art supplies and age-appropriate activities.',
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
      bio: 'Certified in pediatric first aid with specialized training in autism support and sensory care. Experienced with multi-child households. Comfortable with complex routines and medical needs.',
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
      bio: 'Warm, nurturing caregiver specializing in newborn and infant care. 8 years of private home childcare experience across Metro Vancouver. Trained in infant CPR and sleep coaching.',
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
      bio: 'Youth soccer coach and SFU student. Active, responsible, and skilled at keeping kids engaged with sports and creative games. Perfect for active families who want their kids entertained.',
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
      bio: 'Experienced nanny skilled in meal prep, homework assistance, and bedtime routines. 5+ years caring for kids of all ages. Fluent in English, Hindi, and Punjabi for bilingual families.',
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
      bio: '9 years of nanny experience in West Vancouver and Downtown. Specialized in Montessori early development techniques. Exceptional with bedtime routines and developmental play.',
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
            { dayOfWeek: 1, startTime: '17:00', endTime: '22:00' },
            { dayOfWeek: 3, startTime: '17:00', endTime: '22:00' },
            { dayOfWeek: 5, startTime: '17:00', endTime: '23:30' },
            { dayOfWeek: 6, startTime: '15:00', endTime: '24:00' },
            { dayOfWeek: 0, startTime: '16:00', endTime: '22:00' },
          ],
        },
      },
    });

    createdSitters.push({ user, profile: sitterProfile });
  }

  // ─────────────────────────────────────────────
  // 5. PENDING VETTING SITTER (for Admin Queue)
  // ─────────────────────────────────────────────
  console.log('  → Creating Pending Vetting Sitter (Chloe Tremblay)...');

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
      bio: 'New to Metro Vancouver! Looking to provide evening babysitting in North Vancouver. Certified in Standard First Aid & CPR C. Former YMCA camp counselor with 3 years of childcare experience.',
      baseHourlyRate: 23.0,
      extraChildRate: 2.0,
      yearsExperience: 3,
      cprCertified: true,
      hasVehicle: true,
      languages: 'English, French',
      verificationStatus: 'PENDING_VERIFICATION',
      idDocumentUrl: '/demo_id_chloe.pdf',
      referenceNotes: 'Reference Check Completed: Verified by former employer at YMCA Camp Elphinstone. Positive references from 2 families.',
    },
  });

  // ─────────────────────────────────────────────
  // 6. NANNY APPLICATIONS (2 for Admin Queue)
  // ─────────────────────────────────────────────
  console.log('  → Creating 2 Nanny Applications...');

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
      firstAidCertified: true,
      ownVehicle: true,
      languages: 'English, French',
      education: 'Capilano University ECE Diploma',
      availability: 'Evenings & Weekends',
      driverLicenseStatus: 'VALID_FULL',
      electronicSignature: 'Chloe Tremblay',
      status: 'SUBMITTED',
      submittedAt: new Date(now.getTime() - 3600000 * 2),
      documents: {
        create: [
          { documentType: 'GOVT_ID', fileName: 'chloe_bcid.pdf', storagePath: 'uploads/docs/chloe_id.pdf', fileSize: 245000, mimeType: 'application/pdf' },
          { documentType: 'CPR_CERT', fileName: 'cpr_redcross_2026.pdf', storagePath: 'uploads/docs/chloe_cpr.pdf', fileSize: 180000, mimeType: 'application/pdf' },
          { documentType: 'FIRST_AID_CERT', fileName: 'first_aid_st_john.pdf', storagePath: 'uploads/docs/chloe_firstaid.pdf', fileSize: 195000, mimeType: 'application/pdf' },
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
      firstAidCertified: true,
      ownVehicle: true,
      languages: 'English',
      education: 'SFU Kinesiology Bachelor Degree',
      availability: 'Weekends & After-school',
      driverLicenseStatus: 'VALID_FULL',
      electronicSignature: 'Marcus Vance',
      status: 'SUBMITTED',
      submittedAt: new Date(now.getTime() - 3600000 * 5),
      documents: {
        create: [
          { documentType: 'GOVT_ID', fileName: 'marcus_dl.pdf', storagePath: 'uploads/docs/marcus_dl.pdf', fileSize: 310000, mimeType: 'application/pdf' },
          { documentType: 'BACKGROUND_CHECK_AUTH', fileName: 'criminal_check_bc.pdf', storagePath: 'uploads/docs/marcus_crc.pdf', fileSize: 420000, mimeType: 'application/pdf' },
          { documentType: 'RESUME', fileName: 'marcus_resume.pdf', storagePath: 'uploads/docs/marcus_resume.pdf', fileSize: 280000, mimeType: 'application/pdf' },
        ],
      },
    },
  });

  // ─────────────────────────────────────────────
  // 7. BOOKINGS (Various Lifecycle States)
  // ─────────────────────────────────────────────
  console.log('  → Creating Bookings across all lifecycle states...');

  // Booking 1: SETTLED (Smith Family ↔ Sarah Jenkins) — Completed 3 days ago
  const completedBooking1 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_1',
      householdId: household1.id,
      sitterProfileId: createdSitters[0].profile.id, // Sarah Jenkins
      status: 'SETTLED',
      startDateTime: new Date(now.getTime() - 86400000 * 3),
      endDateTime: new Date(now.getTime() - 86400000 * 3 + 14400000),
      numChildren: 2,
      hourlyRate: 26.0,
      extraChildRate: 3.0,
      subtotalAmount: (26.0 + 3.0) * 4, // $116.00
      platformFee: 116.0 * 0.15,         // $17.40
      totalAmount: 116.0 + 17.4,         // $133.40
      actualStartTime: new Date(now.getTime() - 86400000 * 3),
      actualEndTime: new Date(now.getTime() - 86400000 * 3 + 14400000),
    },
  });

  // Booking 2: SETTLED (Chen Family ↔ Emily Wong) — Completed 2 days ago
  const completedBooking2 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_2',
      householdId: household2.id,
      sitterProfileId: createdSitters[1].profile.id, // Emily Wong
      status: 'SETTLED',
      startDateTime: new Date(now.getTime() - 86400000 * 2),
      endDateTime: new Date(now.getTime() - 86400000 * 2 + 10800000),
      numChildren: 1,
      hourlyRate: 24.0,
      extraChildRate: 2.0,
      subtotalAmount: 24.0 * 3,    // $72.00
      platformFee: 72.0 * 0.15,    // $10.80
      totalAmount: 72.0 + 10.8,    // $82.80
      actualStartTime: new Date(now.getTime() - 86400000 * 2),
      actualEndTime: new Date(now.getTime() - 86400000 * 2 + 10800000),
    },
  });

  // Booking 3: SETTLED (Patel Family ↔ Jessica Miller) — Completed 5 days ago
  const completedBooking3 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_3',
      householdId: household4.id,
      sitterProfileId: createdSitters[2].profile.id, // Jessica Miller
      status: 'SETTLED',
      startDateTime: new Date(now.getTime() - 86400000 * 5),
      endDateTime: new Date(now.getTime() - 86400000 * 5 + 10800000),
      numChildren: 2,
      hourlyRate: 22.0,
      extraChildRate: 2.5,
      subtotalAmount: (22.0 + 2.5) * 3, // $73.50
      platformFee: 73.5 * 0.15,          // $11.03
      totalAmount: 73.5 + 11.03,         // $84.53
      actualStartTime: new Date(now.getTime() - 86400000 * 5),
      actualEndTime: new Date(now.getTime() - 86400000 * 5 + 10800000),
    },
  });

  // Booking 4: SETTLED (Taylor Family ↔ Priya Sharma) — Completed 1 week ago
  const completedBooking4 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_4',
      householdId: household5.id,
      sitterProfileId: createdSitters[6].profile.id, // Priya Sharma
      status: 'SETTLED',
      startDateTime: new Date(now.getTime() - 86400000 * 7),
      endDateTime: new Date(now.getTime() - 86400000 * 7 + 18000000),
      numChildren: 2,
      hourlyRate: 25.0,
      extraChildRate: 2.5,
      subtotalAmount: (25.0 + 2.5) * 5, // $137.50
      platformFee: 137.5 * 0.15,          // $20.63
      totalAmount: 137.5 + 20.63,         // $158.13
      actualStartTime: new Date(now.getTime() - 86400000 * 7),
      actualEndTime: new Date(now.getTime() - 86400000 * 7 + 18000000),
    },
  });

  // Booking 5: SETTLED (MacDonald Family ↔ Zoe Dubois) — Completed 4 days ago
  const completedBooking5 = await prisma.booking.create({
    data: {
      id: 'seed_completed_booking_5',
      householdId: household3.id,
      sitterProfileId: createdSitters[7].profile.id, // Zoe Dubois
      status: 'SETTLED',
      startDateTime: new Date(now.getTime() - 86400000 * 4),
      endDateTime: new Date(now.getTime() - 86400000 * 4 + 14400000),
      numChildren: 2,
      hourlyRate: 29.0,
      extraChildRate: 4.0,
      subtotalAmount: (29.0 + 4.0) * 4, // $132.00
      platformFee: 132.0 * 0.15,          // $19.80
      totalAmount: 132.0 + 19.8,          // $151.80
      actualStartTime: new Date(now.getTime() - 86400000 * 4),
      actualEndTime: new Date(now.getTime() - 86400000 * 4 + 14400000),
    },
  });

  // Booking 6: IN_PROGRESS (MacDonald Family ↔ Hannah Fraser) — Started 2h ago
  const inProgressBooking = await prisma.booking.create({
    data: {
      id: 'seed_in_progress_booking',
      householdId: household3.id,
      sitterProfileId: createdSitters[3].profile.id, // Hannah Fraser
      status: 'IN_PROGRESS',
      startDateTime: new Date(now.getTime() - 3600000 * 2),
      endDateTime: new Date(now.getTime() + 3600000 * 2),
      numChildren: 2,
      hourlyRate: 27.0,
      extraChildRate: 3.5,
      subtotalAmount: (27.0 + 3.5) * 4, // $122.00
      platformFee: 122.0 * 0.15,         // $18.30
      totalAmount: 122.0 + 18.3,         // $140.30
      actualStartTime: new Date(now.getTime() - 3600000 * 2),
    },
  });

  // Booking 7: CONFIRMED (Smith Family ↔ Emily Wong) — Upcoming tomorrow
  const confirmedBooking = await prisma.booking.create({
    data: {
      id: 'seed_confirmed_booking_1',
      householdId: household1.id,
      sitterProfileId: createdSitters[1].profile.id, // Emily Wong
      status: 'CONFIRMED',
      startDateTime: new Date(now.getTime() + 86400000),
      endDateTime: new Date(now.getTime() + 86400000 + 14400000),
      numChildren: 2,
      hourlyRate: 24.0,
      extraChildRate: 2.0,
      subtotalAmount: (24.0 + 2.0) * 4, // $104.00
      platformFee: 104.0 * 0.15,         // $15.60
      totalAmount: 104.0 + 15.6,         // $119.60
    },
  });

  // Booking 8: REQUESTED (Patel Family ↔ Amara Okafor) — Pending sitter response
  const requestedBooking1 = await prisma.booking.create({
    data: {
      id: 'seed_requested_booking_1',
      householdId: household4.id,
      sitterProfileId: createdSitters[4].profile.id, // Amara Okafor
      status: 'REQUESTED',
      startDateTime: new Date(now.getTime() + 86400000 * 2),
      endDateTime: new Date(now.getTime() + 86400000 * 2 + 14400000),
      numChildren: 1,
      hourlyRate: 28.0,
      extraChildRate: 4.0,
      subtotalAmount: 28.0 * 4,     // $112.00
      platformFee: 112.0 * 0.15,    // $16.80
      totalAmount: 112.0 + 16.8,    // $128.80
    },
  });

  // Booking 9: REQUESTED (Taylor Family ↔ Lucas Silva) — Pending sitter response
  const requestedBooking2 = await prisma.booking.create({
    data: {
      id: 'seed_requested_booking_2',
      householdId: household5.id,
      sitterProfileId: createdSitters[5].profile.id, // Lucas Silva
      status: 'REQUESTED',
      startDateTime: new Date(now.getTime() + 86400000 * 3),
      endDateTime: new Date(now.getTime() + 86400000 * 3 + 10800000),
      numChildren: 2,
      hourlyRate: 23.0,
      extraChildRate: 2.0,
      subtotalAmount: (23.0 + 2.0) * 3, // $75.00
      platformFee: 75.0 * 0.15,          // $11.25
      totalAmount: 75.0 + 11.25,         // $86.25
    },
  });

  // Booking 10: CANCELLED (Chen Family ↔ Sarah Jenkins) — Cancelled by parent
  await prisma.booking.create({
    data: {
      id: 'seed_cancelled_booking_1',
      householdId: household2.id,
      sitterProfileId: createdSitters[0].profile.id, // Sarah Jenkins
      status: 'CANCELLED',
      startDateTime: new Date(now.getTime() - 86400000 * 1),
      endDateTime: new Date(now.getTime() - 86400000 * 1 + 10800000),
      numChildren: 1,
      hourlyRate: 26.0,
      extraChildRate: 3.0,
      subtotalAmount: 26.0 * 3,     // $78.00
      platformFee: 78.0 * 0.15,     // $11.70
      totalAmount: 78.0 + 11.7,     // $89.70
      cancellationReason: 'Family emergency — had to cancel last minute. Sorry Sarah!',
    },
  });

  // ─────────────────────────────────────────────
  // 8. REVIEWS (5 reviews across completed bookings)
  // ─────────────────────────────────────────────
  console.log('  → Creating Reviews...');

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
      comment: 'Emily is fantastic! Oliver loved reading dinosaur books with her. She kept us updated throughout the evening. Highly recommend for families in Burnaby.',
      tags: 'Patient,Communicative,Fun,Great Bedtime Routine',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking3.id,
      authorId: parent4.id,
      targetId: createdSitters[2].user.id,
      rating: 4,
      comment: 'Jessica was great with Aarav Jr. and Diya. Very patient and creative with activities. Only reason for 4 stars is she arrived 10 minutes late, but otherwise excellent.',
      tags: 'Creative,Patient,Good with Multiple Kids',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking4.id,
      authorId: parent5.id,
      targetId: createdSitters[6].user.id,
      rating: 5,
      comment: 'Priya is amazing! She prepared a healthy dinner for Noah and Ella, read bedtime stories in Hindi, and both kids were asleep on time. A true professional.',
      tags: 'Bilingual,Meal Prep,Reliable,Great Bedtime Routine',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking5.id,
      authorId: parent3.id,
      targetId: createdSitters[7].user.id,
      rating: 5,
      comment: 'Zoe used Montessori techniques with Liam and Emma that really engaged them. Jack slept peacefully the entire time. Premium service worth every dollar.',
      tags: 'Montessori,Professional,Calm,Excellent with Infants',
    },
  });

  // ─────────────────────────────────────────────
  // 9. CHAT MESSAGES (conversation history)
  // ─────────────────────────────────────────────
  console.log('  → Creating Chat Message History...');

  // Smith Family ↔ Sarah Jenkins (completedBooking1)
  await prisma.message.createMany({
    data: [
      {
        bookingId: completedBooking1.id,
        senderId: parent1.id,
        content: 'Hi Sarah! Just wanted to confirm — Leo has his Epipen in the kitchen drawer. Maya should be asleep by 7:30.',
        readAt: new Date(now.getTime() - 86400000 * 3 - 3600000),
        createdAt: new Date(now.getTime() - 86400000 * 3 - 7200000),
      },
      {
        bookingId: completedBooking1.id,
        senderId: createdSitters[0].user.id,
        content: 'Thanks David! Got it — Epipen in kitchen drawer. I\'ll have Maya down by 7:30 and then do stories with Leo. See you tonight!',
        readAt: new Date(now.getTime() - 86400000 * 3 - 3000000),
        createdAt: new Date(now.getTime() - 86400000 * 3 - 6800000),
      },
      {
        bookingId: completedBooking1.id,
        senderId: createdSitters[0].user.id,
        content: 'Maya is asleep! Leo is reading his favourite dinosaur book. All good here 🦕📖',
        readAt: new Date(now.getTime() - 86400000 * 3 + 3600000),
        createdAt: new Date(now.getTime() - 86400000 * 3 + 1800000),
      },
      {
        bookingId: completedBooking1.id,
        senderId: parent1.id,
        content: 'Perfect, thank you Sarah! We should be home around 11pm.',
        readAt: new Date(now.getTime() - 86400000 * 3 + 4000000),
        createdAt: new Date(now.getTime() - 86400000 * 3 + 3800000),
      },
    ],
  });

  // Chen Family ↔ Emily Wong (completedBooking2)
  await prisma.message.createMany({
    data: [
      {
        bookingId: completedBooking2.id,
        senderId: parent2.id,
        content: 'Hi Emily! Oliver has lactose-free milk in the fridge. His dinosaur books are on the shelf by his bed.',
        readAt: new Date(now.getTime() - 86400000 * 2 - 3600000),
        createdAt: new Date(now.getTime() - 86400000 * 2 - 7200000),
      },
      {
        bookingId: completedBooking2.id,
        senderId: createdSitters[1].user.id,
        content: 'Got it Sophia! I\'ll use the lactose-free milk. Looking forward to reading dino books with Oliver tonight! 🦖',
        readAt: new Date(now.getTime() - 86400000 * 2 - 3000000),
        createdAt: new Date(now.getTime() - 86400000 * 2 - 6500000),
      },
      {
        bookingId: completedBooking2.id,
        senderId: createdSitters[1].user.id,
        content: 'Oliver is asleep! He wanted to read THREE dino books tonight 😄 All good here.',
        readAt: new Date(now.getTime() - 86400000 * 2 + 3600000),
        createdAt: new Date(now.getTime() - 86400000 * 2 + 2000000),
      },
    ],
  });

  // MacDonald Family ↔ Hannah Fraser (inProgressBooking — current!)
  await prisma.message.createMany({
    data: [
      {
        bookingId: inProgressBooking.id,
        senderId: parent3.id,
        content: 'Hi Hannah! Liam has his weighted blanket ready in his room. Emma\'s milk is warming in the bottle warmer. Jack just had his last feed at 5pm.',
        readAt: new Date(now.getTime() - 3600000 * 2),
        createdAt: new Date(now.getTime() - 3600000 * 3),
      },
      {
        bookingId: inProgressBooking.id,
        senderId: createdSitters[3].user.id,
        content: 'Thanks Robert! All noted. I\'ll get Jack settled first, then work on Emma and Liam\'s routines. Have a great evening!',
        readAt: new Date(now.getTime() - 3600000 * 2 + 300000),
        createdAt: new Date(now.getTime() - 3600000 * 2 - 1800000),
      },
      {
        bookingId: inProgressBooking.id,
        senderId: createdSitters[3].user.id,
        content: 'Quick update — Jack is sleeping peacefully in his crib. Emma is having warm milk and I\'m about to start Liam\'s sensory light routine. Everything is going smoothly! 💤',
        createdAt: new Date(now.getTime() - 3600000),
      },
    ],
  });

  // ─────────────────────────────────────────────
  // 10. RICH NOTIFICATIONS (various types)
  // ─────────────────────────────────────────────
  console.log('  → Creating Rich Notifications...');

  await prisma.notification.createMany({
    data: [
      // Admin: New Nanny Applications
      {
        userId: adminUser.id,
        type: 'NEW_NANNY_APPLICATION',
        title: 'New Nanny Application Submitted',
        content: 'Chloe Tremblay (North Vancouver) • 3 yrs exp • CPR & First Aid certified • ID & CPR docs uploaded',
        targetRoute: '/admin/vetting?tab=APPLICATIONS',
        actorName: 'Chloe Tremblay',
        actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 2),
      },
      {
        userId: adminUser.id,
        type: 'NEW_NANNY_APPLICATION',
        title: 'New Nanny Application Submitted',
        content: 'Marcus Vance (Vancouver) • 5 yrs exp • Special needs trained • ID, CRC & Resume uploaded',
        targetRoute: '/admin/vetting?tab=APPLICATIONS',
        actorName: 'Marcus Vance',
        actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 5),
      },

      // Sitter (Sarah Jenkins): Booking Request from Smith Family
      {
        userId: createdSitters[0].user.id,
        type: 'NEW_BOOKING_REQUEST',
        title: 'New Booking Request from Smith Family',
        content: '2 children • $116.00 CAD estimated payout • Kitsilano, Vancouver',
        bookingId: completedBooking1.id,
        targetRoute: `/sitter/jobs?bookingId=${completedBooking1.id}`,
        actorName: 'David Smith',
        actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        readAt: new Date(now.getTime() - 3600000 * 70),
        createdAt: new Date(now.getTime() - 3600000 * 72),
      },

      // Parent (David Smith): Booking Accepted by Sarah
      {
        userId: parent1.id,
        type: 'BOOKING_ACCEPTED',
        title: 'Booking Confirmed by Sarah Jenkins',
        content: 'Sarah accepted your booking request • 2 children • $133.40 CAD total',
        bookingId: completedBooking1.id,
        targetRoute: `/parent/bookings?bookingId=${completedBooking1.id}`,
        actorName: 'Sarah Jenkins',
        actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        readAt: new Date(now.getTime() - 3600000 * 68),
        createdAt: new Date(now.getTime() - 3600000 * 70),
      },

      // Parent (Robert MacDonald): Sitter Clocked In
      {
        userId: parent3.id,
        type: 'SITTING_STARTED',
        title: 'Caregiver Has Arrived & Clocked In',
        content: 'Hannah Fraser has arrived and started the sitting session with Liam, Emma & Jack.',
        bookingId: inProgressBooking.id,
        targetRoute: `/parent/bookings?bookingId=${inProgressBooking.id}`,
        actorName: 'Hannah Fraser',
        actorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 2),
      },

      // Sitter (Amara Okafor): New Booking Request from Patel Family
      {
        userId: createdSitters[4].user.id,
        type: 'NEW_BOOKING_REQUEST',
        title: 'New Booking Request from Patel Family',
        content: '1 child • $112.00 CAD estimated payout • Steveston, Richmond',
        bookingId: requestedBooking1.id,
        targetRoute: `/sitter/jobs?bookingId=${requestedBooking1.id}`,
        actorName: 'Aarav Patel',
        actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 1),
      },

      // Sitter (Lucas Silva): New Booking Request from Taylor Family
      {
        userId: createdSitters[5].user.id,
        type: 'NEW_BOOKING_REQUEST',
        title: 'New Booking Request from Taylor Family',
        content: '2 children • $75.00 CAD estimated payout • Town Centre, Coquitlam',
        bookingId: requestedBooking2.id,
        targetRoute: `/sitter/jobs?bookingId=${requestedBooking2.id}`,
        actorName: 'Jessica Taylor',
        actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 0.5),
      },

      // Parent (David Smith): Review Received
      {
        userId: createdSitters[0].user.id,
        type: 'REVIEW_SUBMITTED',
        title: 'New 5-Star Review from David Smith',
        content: '"Sarah was incredible with Leo and Maya! She arrived right on time..."',
        bookingId: completedBooking1.id,
        targetRoute: `/sitter/jobs?bookingId=${completedBooking1.id}`,
        actorName: 'David Smith',
        actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        readAt: new Date(now.getTime() - 3600000 * 48),
        createdAt: new Date(now.getTime() - 3600000 * 50),
      },

      // Parent (Sophia Chen): Booking Confirmed
      {
        userId: parent2.id,
        type: 'BOOKING_ACCEPTED',
        title: 'Booking Confirmed by Emily Wong',
        content: 'Emily accepted your booking request • 1 child • $82.80 CAD total',
        bookingId: completedBooking2.id,
        targetRoute: `/parent/bookings?bookingId=${completedBooking2.id}`,
        actorName: 'Emily Wong',
        actorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        readAt: new Date(now.getTime() - 86400000 * 2 - 3600000),
        createdAt: new Date(now.getTime() - 86400000 * 2 - 7200000),
      },

      // Parent (David Smith): Upcoming booking reminder
      {
        userId: parent1.id,
        type: 'BOOKING_ACCEPTED',
        title: 'Upcoming Booking Tomorrow with Emily Wong',
        content: 'Your confirmed booking with Emily is tomorrow evening • 2 children • $119.60 CAD total',
        bookingId: confirmedBooking.id,
        targetRoute: `/parent/bookings?bookingId=${confirmedBooking.id}`,
        actorName: 'Emily Wong',
        actorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        createdAt: new Date(now.getTime() - 3600000 * 0.25),
      },
    ],
  });

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ SEEDING COMPLETE — Metro Vancouver Childcare Marketplace');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('  Users:');
  console.log('    • 1 Platform Admin');
  console.log('    • 5 Parent Users');
  console.log('    • 8 Approved Sitters');
  console.log('    • 1 Pending Verification Sitter');
  console.log('');
  console.log('  Households: 5 (12 children total)');
  console.log('');
  console.log('  Bookings:');
  console.log('    • 5 SETTLED (completed)');
  console.log('    • 1 IN_PROGRESS (active now)');
  console.log('    • 1 CONFIRMED (upcoming)');
  console.log('    • 2 REQUESTED (pending sitter response)');
  console.log('    • 1 CANCELLED');
  console.log('');
  console.log('  Reviews: 5');
  console.log('  Chat Messages: 10');
  console.log('  Nanny Applications: 2');
  console.log('  Notifications: 10');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
