# Software Requirements Specification (SRS) & Architecture Rationale

> **Project:** Nannies for Hire (Working Title)  
> **Document Version:** 1.0.0  
> **Compliance Target:** PIPEDA (Canada) & BC PIPA

---

## 1. System Context & External Interfaces

```
+-----------------------------------------------------------------------+
|                           CLIENT LAYER                                |
|   Next.js 15 App Router (React 19, TypeScript, Tailwind CSS v4)      |
|   Responsive PWA / Mobile-First Web Application                      |
+-----------------------------------------------------------------------+
                                   |
                         HTTP / REST API / Server Actions
                                   v
+-----------------------------------------------------------------------+
|                           APPLICATION LAYER                           |
|   Single-Tenant Rebrandable Core (brand.config.ts)                    |
|   Domain Services: Auth, Household, Caregiver, Booking, Payments      |
|   Provider Adapter Layer (Interface Abstraction)                      |
+-----------------------------------------------------------------------+
           |                       |                        |
           v                       v                        v
+-----------------------+ +-----------------------+ +-------------------+
|     AUTH ADAPTER      | |   PAYMENTS ADAPTER    | |  STORAGE ADAPTER  |
| - Local Mock Auth     | | - Local Payment Mock  | | - Local Disk/Data|
| - Clerk / Supabase    | | - Stripe Connect      | | - S3 / R2 Bucket|
+-----------------------+ +-----------------------+ +-------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                           DATABASE LAYER                              |
|   Prisma ORM with SQLite (Local Demo) / PostgreSQL (Production)       |
+-----------------------------------------------------------------------+
```

---

## 2. Technology Stack & Architectural Rationale

### 2.1 Full-Stack Framework: Next.js 15+ (App Router, React 19, TS)
- **Rationale**: Provides unified frontend UI rendering and secure backend API serverless endpoints within a single maintainable repository. React Server Components minimize bundle size while Server Actions deliver type-safe mutations.
- **Local Demo Support**: Runs natively with `npm run dev` with zero setup.

### 2.2 Styling & Design Tokens: Tailwind CSS v4 + Dynamic CSS HSL Variables
- **Rationale**: Single-tenant white-label requirement is satisfied by binding theme tokens (`--primary-hsl`, `--accent-hsl`, `--radius`, `--font-family`, `--brand-logo`) to central CSS variables. Rebranding requires changing only `brand.config.ts` or environment variables without modifying component code.

### 2.3 Database & ORM: Prisma ORM with SQLite (Local) / PostgreSQL (Production)
- **Rationale**: Relational data integrity is non-negotiable for booking transactions, commission calculations, and two-way reviews. Prisma ORM enables zero-config local development using SQLite (`file:./dev.db`), with seamless migration to PostgreSQL for production cloud deployment.

### 2.4 Provider Adapter Pattern (Pluggable Local / Cloud Services)
To guarantee the system is **100% executable locally without third-party API keys**, every external service is implemented behind an Interface Adapter:

1. **Authentication Adapter (`IAuthProvider`)**:
   - `LocalMockAuthAdapter`: Instant role switcher (Parent, Sitter, Admin) using local encrypted session cookies.
   - `ClerkAuthProvider` / `SupabaseAuthProvider`: Production-ready managed OAuth and MFA.
2. **Payments Adapter (`IPaymentProvider`)**:
   - `LocalMockPaymentAdapter`: Simulates card authorization holds, 15% platform fee split, instant confirmation, and payout ledgers locally.
   - `StripeConnectAdapter`: Production Stripe Connect direct charges & transfer payouts.
3. **Storage Adapter (`IStorageProvider`)**:
   - `LocalStorageAdapter`: Stores avatar images and ID documents in local project uploads with signed URLs.
   - `S3StorageAdapter`: AWS S3 / Cloudflare R2 bucket storage.

---

## 3. Security, Privacy & PIPEDA Compliance

1. **Canadian Data Sovereignty & Encryption**:
   - Sensitive child notes (allergies, medical routines) and government ID document paths are encrypted at rest using AES-256-GCM.
2. **Contact Info Leakage Protection**:
   - Phone numbers and email addresses are masked in public profiles. In-app messaging scrubs regex-matched phone numbers and external URLs prior to job confirmation.
3. **Role-Based Access Control (RBAC)**:
   - `PARENT`: Can manage own Household, manage children profiles, create booking requests, rate sitters.
   - `SITTER`: Can edit own profile, manage weekly availability, accept/decline bookings, clock in/out, rate households.
   - `ADMIN`: Can access vetting queue, view all user records, override booking statuses, process dispute refunds.

---

## 4. Risk Assessment & Mitigation Matrix

| Risk Event | Severity | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Off-Platform Leakage** (Parents & Sitters bypass 15% fee) | High | High | Revenue Loss | Mask contact details in chat prior to confirmed booking; offer platform instant coverage & guarantee. |
| **Sitter No-Show** | High | Medium | Customer Trust Loss | Require 4h minimum notice; 2-hour request expiration; reliability penalty score for sitters who cancel; instant re-booking workflow. |
| **Unvetted Sitter Risks** | Critical | Low | Child Safety | Mandatory Admin approval gate (`PENDING_VERIFICATION` state); ID document upload & reference log checks. |
| **Local Demo Setup Friction** | Medium | Medium | Dev Experience | Default to Local Mock Providers and SQLite database so `npm run dev` works instantly with zero API keys. |
| **Rebranding Cost** | Medium | Low | Architectural Debt | Centralize all branding string tokens, asset paths, and HSL color variables in a single `brand.config.ts`. |
