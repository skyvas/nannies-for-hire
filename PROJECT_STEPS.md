# This file contains all the steps that have been taken to, given to the AI agents so that it does not hallucinate from the starting goal. This file will save each step. 

# For Agent - AI agent needs to automatically add the prompts to this file.

# Step 1

**User Prompt:** Project Initialization — Nannies for Hire (Working Title)
- Initial request to start Phase 1 (Discovery) for childcare marketplace platform.
- Application rebrandability requirement (configurable branding, assets, colors, domain).
- Product Discovery interviewing initiated.

# Step 2

**Discovery Phase — Section 1: Business Goals & Vision (Completed)**
- Monetization: 15% booking commission on top of sitter rate (Airbnb model).
- Scope: On-demand babysitting (evenings/weekends, last-minute care).
- Geo Focus: Metro Vancouver, BC, Canada (CAD, PST/PDT timezone).
- Rebrandability: Single-tenant rebrandable baseline (central config, design tokens, env variables).
- Target KPI: 50 completed bookings in first 3 months; 6-month launch window.

# Step 3

**Discovery Phase — Section 2: User Roles & Profiles (Completed)**
- Roles: Family (Household entity allowing multiple guardian users), Babysitter (Caregiver), Platform Admin.
- Household Model: Shared children profiles, address, emergency contacts, payment details across guardians.
- Sitter Profiles: Individual base rate + per-child incremental rate (CAD), experience, CPR/First Aid, transportation, languages, photo, bio.
- Vetting Workflow: Sitter uploads ID and references; admin manually reviews and approves profile before listing in search (`PENDING_VERIFICATION` -> `APPROVED`).
- Pricing Engine: `(BaseRate + (NumChildren - 1) * PerChildIncrement) * DurationHours + 15% Platform Commission`.

# Step 4

**Discovery Phase — Section 3: Booking Workflow & Scheduling (Completed)**
- Dispatch: Direct 1:1 request model; sitter has 2 hours to accept/decline before expiration.
- Constraints: Minimum duration = 2 hours; minimum advance notice = 4 hours.
- Availability: Weekly recurring shifts + date overrides/blockouts + iCal sync export.
- Time Tracking / Clocking: Sitter Start/End Sitting toggle + fallback auto-completion at scheduled end time with 24-hour dispute window.
- Cancellation Rules: >24h notice = 100% refund; <24h notice = 50% charge (partial payout + fee); Sitter cancels = 100% refund + reliability penalty flag.

# Step 5

**Discovery Phase — Section 5: Tech Stack, Payments & Security (Completed)**
- Core Requirement: System MUST be 100% executable and demo-able locally without external API key dependencies (`npm run dev`).
- Architecture Pattern: Provider Adapter Pattern (Interface-driven abstractions for Auth, Payments, Storage, Notifications).
- Payments: Stripe Connect architecture + Local Payment Mock Provider for offline local demoing.
- Authentication: Role-based Auth (Parents, Sitters, Admins) + Local Mock Auth / Session adapter with instant role-switcher for demos.
- Database & Stack: Next.js 15+ (App Router, React 19, TS), Tailwind CSS v4 design system tokens, Prisma ORM (SQLite for zero-config local demo, PG ready).
- Storage: Adapter abstraction (Local disk storage for demo, S3/R2 ready).
- Admin Tools: Caregiver vetting queue, Booking monitor & dispute overrides, User account management, GMV & commission reporting.

# Step 6

**Architectural Specs & Planning Artifacts Generated**
- Created `/docs/PRD.md` (Product Requirements Document, Feature Roadmap, User Stories, Functional & NFR Specs).
- Created `/docs/SRS.md` (Software Requirements Specification, Provider Adapter Rationale, Security & PIPEDA Compliance).
- Created `/docs/architecture.md` (System Architecture Diagram, Prisma ERD Entity Schema, API Strategy, Folder Structure).
- Created `/docs/milestones.md` (Development Milestones Roadmap, Local Demo vs Production Cloud Strategy).
- Created `implementation_plan.md` artifact presenting all 15 deliverables for user review and approval.

# Step 7

**Implementation & Production Verification (Completed)**
- Initialized Next.js 15 App Router + Tailwind CSS v4 + Prisma ORM with SQLite database (`dev.db`).
- Created `brand.config.ts` white-label engine.
- Implemented Provider Adapter Pattern (Local Mock Auth, Local Mock Payments with 15% commission split, Local Storage).
- Built floating `DemoRoleSwitcher` toolbar allowing instant switching between Parent, Caregiver, and Admin.
- Built Landing Page (`/`), Sitter Search (`/search`), Parent Household (`/parent/household`), Parent Bookings & Reviews (`/parent/bookings`), Caregiver Portal & Live Clocking (`/sitter/jobs`, `/sitter/profile`), Admin Vetting Queue (`/admin/vetting`), and Admin Financial Analytics (`/admin/disputes`).

# Step 8

**Live Real-Time Messaging & Chat Implementation (Completed)**
- Extended Prisma `Message` model with `imageUrl` and `readAt` fields.
- Implemented Server-Sent Events (SSE) streaming service (`chatStream.ts`) bound to `globalThis`.
- Built `ChatWindow.tsx` with photo presets, read receipts (`✓✓`), audio chime, and in-app toast notifications.
- Created `e2e/07-realtime-chat-dual-browser.spec.ts` testing side-by-side Parent and Sitter browser windows.

# Step 9

**Navbar Notification Bell & Unread Counter (Completed)**
- Created `GET /api/chat/unread` endpoint calculating zero-false-positive unread message counts.
- Created `NotificationBell.tsx` with live unread badge counter, dropdown preview menu, and auto-reset on thread view.
- Created `e2e/08-unread-notification-bell.spec.ts` verifying unread badge increment and reset logic.

# Step 10

**Full 13-Spec Playwright Headed E2E Verification (100% Passed)**
- Added explicit HTML IDs (`#chat-message-input`, `#chat-send-button`) and `data-testid` attributes.
- Executed full test suite (`npm run test:e2e:headed`).
- **All 13 E2E test specs passed with 100% success rate in 22.5s**.