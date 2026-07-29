# System Architecture, Database Schema & Folder Structure

> **Project:** Nannies for Hire (Working Title)  
> **Document Version:** 1.0.0

---

## 1. High-Level Architecture & Component Flow

```
                                    +-----------------------+
                                    |     brand.config.ts   |
                                    | (White-Label Config)  |
                                    +-----------------------+
                                                |
                                                v
+-----------------------------------------------------------------------------------+
|                              NEXT.JS APP ROUTER                                   |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |     (auth) Routes      |  |    (parent) Routes     |  |   (sitter) Routes   |  |
|  | /login, /register      |  | /search, /bookings     |  | /schedule, /jobs    |  |
|  +------------------------+  +------------------------+  +---------------------+  |
|                                                                                   |
|  +------------------------+  +-------------------------------------------------+  |
|  |     (admin) Routes     |  |            Shared UI Design System              |  |
|  | /vetting, /disputes    |  | (HSL Tokens, Navigation, Modals, Badges)       |  |
|  +------------------------+  +-------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                        |
                            Server Actions & REST APIs
                                        v
+-----------------------------------------------------------------------------------+
|                              DOMAIN SERVICE LAYER                                 |
|                                                                                   |
|  +------------------+  +--------------------+  +------------------+  +---------+  |
|  | Household Service|  | Caregiver Service  |  | Booking Engine   |  | Reviews |  |
|  +------------------+  +--------------------+  +------------------+  +---------+  |
+-----------------------------------------------------------------------------------+
                                        |
                            Provider Adapter Interface
                                        v
+-----------------------+  +--------------------------+  +--------------------------+
|  IAuthProvider        |  |  IPaymentProvider        |  |  IStorageProvider        |
| - LocalMockAuthProvider|  | - LocalMockPaymentAdapter|  | - LocalDiskStorageAdapter|
| - ClerkAuthProvider   |  | - StripeConnectAdapter   |  | - S3StorageAdapter       |
+-----------------------+  +--------------------------+  +--------------------------+
                                        |
                            Prisma ORM Client Layer
                                        v
+-----------------------------------------------------------------------------------+
|                         DATABASE LAYER (SQLite / PostgreSQL)                      |
+-----------------------------------------------------------------------------------+
```

---

## 2. Database Entity Data Model (ERD Schema)

Below is the complete entity model represented in Prisma schema modeling notation:

```prisma
// Core User & Authentication
model User {
  id            String       @id @default(uuid())
  email         String       @unique
  passwordHash  String?
  role          UserRole     @default(PARENT) // PARENT, SITTER, ADMIN
  firstName     String
  lastName      String
  phone         String?
  avatarUrl     String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  householdMembers HouseholdMember[]
  sitterProfile    SitterProfile?
  givenReviews     Review[]          @relation("ReviewAuthor")
  receivedReviews  Review[]          @relation("ReviewTarget")
  messages         Message[]
}

enum UserRole {
  PARENT
  SITTER
  ADMIN
}

// Multi-Guardian Household Model
model Household {
  id           String            @id @default(uuid())
  familyName   String            // e.g. "Smith Household"
  address      String
  city         String            // Metro Vancouver city
  neighborhood String            // e.g. "Kitsilano", "Downtown"
  postalCode   String
  createdAt    DateTime          @default(now())
  
  // Relations
  members      HouseholdMember[]
  children     Child[]
  bookings     Booking[]
}

model HouseholdMember {
  id          String       @id @default(uuid())
  householdId String
  userId      String
  relationship String      // "Primary Parent", "Guardian", "Spouse"
  
  household   Household    @relation(fields: [householdId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([householdId, userId])
}

model Child {
  id           String    @id @default(uuid())
  householdId  String
  firstName    String
  birthDate    DateTime
  gender       String?
  allergies    String?
  medicalNotes String?
  bedtimeRoutine String?
  
  household    Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
}

// Sitter / Caregiver Profile & Availability
model SitterProfile {
  id                String            @id @default(uuid())
  userId            String            @unique
  bio               String
  headline          String
  baseHourlyRate    Float             // CAD base rate for 1 child
  extraChildRate    Float             @default(2.0) // Incremental rate per additional child
  yearsExperience   Int
  cprCertified      Boolean           @default(false)
  hasVehicle        Boolean           @default(false)
  languages         String            // Comma-separated languages
  verificationStatus VerificationStatus @default(PENDING_VERIFICATION)
  idDocumentUrl     String?
  referenceNotes    String?
  averageRating     Float             @default(5.0)
  totalReviews      Int               @default(0)
  createdAt         DateTime          @default(now())
  
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  availability      SitterAvailability[]
  bookings          Booking[]
}

enum VerificationStatus {
  DRAFT
  PENDING_VERIFICATION
  APPROVED
  REJECTED
}

model SitterAvailability {
  id              String        @id @default(uuid())
  sitterProfileId String
  dayOfWeek       Int           // 0 = Sunday, 6 = Saturday
  startTime       String        // "17:00"
  endTime         String        // "23:00"
  
  sitterProfile   SitterProfile @relation(fields: [sitterProfileId], references: [id], onDelete: Cascade)
}

// Booking & Transaction State Machine
model Booking {
  id              String        @id @default(uuid())
  householdId     String
  sitterProfileId String
  status          BookingStatus @default(REQUESTED)
  
  startDateTime   DateTime
  endDateTime     DateTime
  numChildren     Int
  hourlyRate      Float
  extraChildRate  Float
  subtotalAmount  Float
  platformFee     Float         // 15% commission
  totalAmount     Float
  
  actualStartTime DateTime?
  actualEndTime   DateTime?
  cancellationReason String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  household       Household     @relation(fields: [householdId], references: [id])
  sitterProfile   SitterProfile @relation(fields: [sitterProfileId], references: [id])
  messages        Message[]
  reviews         Review[]
}

enum BookingStatus {
  REQUESTED
  CONFIRMED
  DECLINED
  EXPIRED
  IN_PROGRESS
  COMPLETED
  SETTLED
  CANCELLED
}

// In-App Messaging
model Message {
  id        String   @id @default(uuid())
  bookingId String
  senderId  String
  content   String
  createdAt DateTime @default(now())

  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  sender    User     @relation(fields: [senderId], references: [id])
}

// Two-Way Rating & Reviews
model Review {
  id         String   @id @default(uuid())
  bookingId  String
  authorId   String
  targetId   String
  rating     Int      // 1 to 5 stars
  comment    String
  tags       String?  // Comma-separated: "Punctual,Great with Toddlers,Clean"
  createdAt  DateTime @default(now())

  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  author     User     @relation("ReviewAuthor", fields: [authorId], references: [id])
  target     User     @relation("ReviewTarget", fields: [targetId], references: [id])
}
```

---

## 3. API Strategy

The application exposes type-safe Next.js Server Actions and REST API routes under `/api`:

### 3.1 Authentication & Profile APIs
- `POST /api/auth/login`: Authenticate user session.
- `POST /api/auth/mock-switch`: Instant role-switcher for local demoing.
- `GET /api/sitter/search`: Search approved sitters by city, neighborhood, rate, date/time, CPR.
- `POST /api/sitter/profile`: Create/update sitter profile and upload ID document.

### 3.2 Household & Booking APIs
- `POST /api/household`: Register household and child profiles.
- `POST /api/bookings/request`: Submit a direct 1:1 booking request (triggers 2h countdown).
- `POST /api/bookings/[id]/respond`: Accept or decline booking request.
- `POST /api/bookings/[id]/clock`: Start/End sitting clocking toggle.
- `POST /api/bookings/[id]/cancel`: Cancel booking and calculate refund according to notice window ($>24\text{h}$ vs $<24\text{h}$).

### 3.3 Admin APIs
- `GET /api/admin/vetting`: List `PENDING_VERIFICATION` sitter profiles.
- `POST /api/admin/vetting/[id]/approve`: Approve/Reject sitter profile.
- `GET /api/admin/disputes`: List flagged or disputed bookings.

---

## 4. Initial Project Folder Structure

```
/Users/akash-mac/workspace/project
├── brand.config.ts             # White-label app name, HSL palette, logos, copy
├── docs/                       # Project engineering documentation
│   ├── PRD.md
│   ├── SRS.md
│   ├── architecture.md
│   └── milestones.md
├── prisma/                     # Database ORM schema & seed data
│   ├── schema.prisma
│   └── seed.ts                 # Sample Metro Vancouver sitters & households seed
├── src/
│   ├── app/                    # Next.js 15 App Router pages & API routes
│   │   ├── (admin)/            # Admin vetting & dispute pages
│   │   ├── (auth)/             # Login, register, demo role-switch
│   │   ├── (parent)/           # Parent search, booking, household management
│   │   ├── (sitter)/           # Sitter calendar, job requests, clocking
│   │   ├── api/                # REST endpoints
│   │   ├── globals.css         # Tailwind CSS v4 & HSL theme variables
│   │   ├── layout.tsx          # Dynamic branded root layout
│   │   └── page.tsx            # Branded landing page
│   ├── components/             # Reusable UI component library
│   │   ├── ui/                 # Buttons, cards, badges, modals, inputs
│   │   ├── branding/           # Branded header, footer, logo renderer
│   │   └── demo/               # Local Demo Role Switcher floating toolbar
│   ├── lib/                    # Domain logic & Provider Adapters
│   │   ├── adapters/           # Auth, Payment, and Storage interface adapters
│   │   │   ├── auth/           # LocalMockAuthAdapter & ClerkAdapter
│   │   │   ├── payment/        # LocalMockPaymentAdapter & StripeConnectAdapter
│   │   │   └── storage/        # LocalStorageAdapter & S3Adapter
│   │   ├── services/           # Booking engine, pricing calculator, vetting service
│   │   └── db.ts               # Prisma database client
│   └── types/                  # TypeScript domain models
├── AI_PROJECT_RULES.md         # Workflow guidelines
└── PROJECT_STEPS.md            # Conversation & execution history log
```
