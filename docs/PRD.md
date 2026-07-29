# Product Requirements Document (PRD) — Caregiver Marketplace Platform

> **Working Title:** Nannies for Hire  
> **Target Launch Region:** Metro Vancouver, BC, Canada  
> **Primary Monetization:** 15% Platform Commission on top of Caregiver Rate  
> **Rebrandability:** Single-Tenant White-Label Architecture (Central Config & Design Tokens)

---

## 1. Executive Summary & Vision

The platform is an on-demand marketplace connecting families in Metro Vancouver with verified, qualified babysitters for evening and weekend childcare needs. 

The primary business objective is to streamline last-minute and scheduled babysitting bookings with transparent hourly pricing, automated 15% commission capture, two-way user reviews, and strict contact privacy.

The architecture is built from day one to be **100% white-label ready** (swappable branding, color themes, domain, copy, and logo tokens) and **100% locally demoable** without mandatory paid third-party API keys.

---

## 2. Target Persona & User Roles

### 2.1 Family / Parent Household
- **Location:** Metro Vancouver cities (Vancouver, Burnaby, Richmond, Surrey, Coquitlam, North/West Vancouver).
- **Needs:** Trusted, vetted babysitters for evening/weekend events; quick booking turnaround (4-hour lead time); clear emergency contact & medical note sharing.
- **Account Structure:** Multi-guardian Household model (allowing 2 parents/guardians to manage shared children profiles, booking requests, and payment options).

### 2.2 Caregiver / Babysitter
- **Persona:** Experienced caregivers, students, CPR-certified sitters in Metro Vancouver.
- **Needs:** Set custom base hourly rates + per-child incremental rate; set weekly recurring availability; review job details before accepting; secure payouts.
- **Account Structure:** Profile with Bio, Experience, Rate schedule, CPR/First Aid status, Vehicle availability, Photo, and Admin Verification Badge.

### 2.3 Platform Administrator
- **Needs:** Manual sitter vetting (ID document inspection, reference notes, profile approval); booking dispute management & manual refund overrides; user suspension; GMV and commission analytics.

---

## 3. Core Features & Scope

### 3.1 Feature Matrix (MVP vs Future Release)

| Feature Area | MVP Scope | Phase 2 / Future Expansion |
| :--- | :--- | :--- |
| **Service Focus** | On-demand evening & weekend babysitting | Full-time nannies, tutors, special needs care |
| **Search & Discovery** | Neighborhood/City filter, date/time availability, max rate, CPR badge, rating threshold | Radius geo-distance map clustering, AI match scoring |
| **Booking Dispatch** | 1:1 Direct Request (2-hour acceptance expiration) | Broadcast / Job posting board, Instant Booking |
| **Pricing Engine** | `(Base + (ExtraKids * Rate)) * Hours + 15% Fee` | Dynamic weekend surge pricing, holiday rate tiers |
| **Time Clocking** | Sitter Start/End Sitting toggle + Scheduled Auto-Complete (24h dispute window) | GPS geo-fencing check-in, live location tracking |
| **Messaging** | Unlocked strictly post-booking request | Pre-booking inquiries, voice notes, video calls |
| **Trust & Safety** | Manual ID upload, manual admin vetting queue, two-way reviews | Automated Sterling/Checkr background check APIs |
| **Payments & Payouts** | Local Payment Mock + Stripe Connect adapter (CAD, split payments) | Apple Pay, Google Pay, Interac e-Transfer payouts |
| **Notifications** | In-app notification center (badge count) + Transactional Email | SMS alerts via Twilio, push notifications |

---

## 4. User Stories

### Parent Stories
- **US-P1:** *As a parent*, I want to register a Household profile and add multiple children with allergies and medical notes, so sitters have essential care info.
- **US-P2:** *As a parent*, I want to invite a second guardian to our Household, so both parents can view and manage bookings.
- **US-P3:** *As a parent*, I want to search sitters in Kitsilano for a Saturday evening with CPR certification and a rating $\ge 4.5$, so I can find a trusted match.
- **US-P4:** *As a parent*, I want to send a direct booking request to a sitter for a 4-hour job starting in 6 hours, so I can secure care for date night.
- **US-P5:** *As a parent*, I want to message the booked sitter in-app, so we can coordinate arrival details without exposing personal phone numbers.
- **US-P6:** *As a parent*, I want to rate and review the sitter after job completion, so other families benefit from my experience.

### Caregiver Stories
- **US-C1:** *As a sitter*, I want to create a profile setting my base rate ($25/hr) and extra child fee (+$2/hr per child), so pricing is calculated automatically.
- **US-C2:** *As a sitter*, I want to upload my government ID and CPR certificate for admin review, so my profile receives an Approved badge.
- **US-C3:** *As a sitter*, I want to receive booking request alerts and accept/decline within 2 hours, so I retain control over my schedule.
- **US-C4:** *As a sitter*, I want to tap "Start Sitting" when I arrive and "End Sitting" when I leave, so exact hours are logged.
- **US-C5:** *As a sitter*, I want my earnings (85% of job subtotal) transferred directly to my bank account, so I get paid reliably.

### Admin Stories
- **US-A1:** *As an admin*, I want a vetting queue where I can inspect uploaded IDs and reference notes to approve or reject sitter profiles.
- **US-A2:** *As an admin*, I want to review booking disputes and issue partial or full refunds if needed.
- **US-A3:** *As an admin*, I want to view gross marketplace volume (GMV), total completed jobs, and total 15% commission collected.

---

## 5. Functional Requirements

1. **FR-1 Brand Configuration**: The system MUST read brand identity (App name, logo path, primary color HSL, support email, meta title) from a central configuration object (`brand.config.ts`) and environment variables.
2. **FR-2 Household Entity**: The system MUST group parents into Household accounts supporting multiple guardians and multiple child profiles.
3. **FR-3 Sitter Vetting State Machine**: Sitter profiles MUST initialize as `DRAFT` $\rightarrow$ transition to `PENDING_VERIFICATION` upon document upload $\rightarrow$ transition to `APPROVED` or `REJECTED` by Admin. Only `APPROVED` profiles MUST appear in search.
4. **FR-4 Booking Pricing Calculation**:
   $$\text{Subtotal} = \left(\text{BaseRate} + (\text{ChildCount} - 1) \times \text{ExtraChildRate}\right) \times \text{Hours}$$
   $$\text{PlatformFee} = \text{Subtotal} \times 0.15$$
   $$\text{TotalCharged} = \text{Subtotal} + \text{PlatformFee}$$
5. **FR-5 Booking State Machine**:
   `REQUESTED` $\xrightarrow{\text{Sitter Accepts within 2h}}$ `CONFIRMED` $\xrightarrow{\text{Start Sitting}}$ `IN_PROGRESS` $\xrightarrow{\text{End Sitting}}$ `COMPLETED` $\xrightarrow{\text{24h Window}}$ `SETTLED`.
   `REQUESTED` $\xrightarrow{\text{2h Expiration OR Sitter Declines}}$ `EXPIRED` / `DECLINED`.
   `CONFIRMED` $\xrightarrow{\text{Parent Cancels >24h}}$ `CANCELLED_FULL_REFUND`.
   `CONFIRMED` $\xrightarrow{\text{Parent Cancels <24h}}$ `CANCELLED_PARTIAL_FEE`.
6. **FR-6 Contact Privacy & Leakage Guard**: Direct phone numbers and email addresses MUST NOT be exposed in chat. Chat endpoints MUST block messaging unless an active booking exists between the household and sitter.
7. **FR-7 Two-Way Reviews**: Parents and Sitters MUST be eligible to leave a 1–5 star review + text comment + rating tags ONLY after a booking reaches `COMPLETED` or `SETTLED` state.

---

## 6. Non-Functional Requirements (NFRs)

1. **NFR-1 Local Executability**: The application MUST run completely locally (`npm run dev`) with zero required external API keys via pluggable Mock Provider Adapters (Local Mock Auth, Local Mock Payments, Local Storage).
2. **NFR-2 Performance**: Page load time under 1.5 seconds; API search response $< 200\text{ms}$ for Metro Vancouver queries.
3. **NFR-3 Responsive UI**: Mobile-first responsive design supporting screen widths from 360px (mobile) to 4K desktop displays.
4. **NFR-4 Security & PIPEDA Compliance**: Passwords hashed with Argon2id / bcrypt; sensitive medical notes encrypted at rest; document uploads restricted to authorized roles.
5. **NFR-5 Accessibility**: WCAG 2.1 Level AA compliance (contrast ratios, ARIA attributes, full keyboard navigation).
