# Database Seed Script — Metro Vancouver Childcare Marketplace

> **Last Updated:** July 29, 2026  
> **Script Location:** [`prisma/seed.ts`](file:///Users/akash-mac/workspace/project/prisma/seed.ts)

---

## Overview

This script **deletes all existing data** from every table and re-seeds the database with a comprehensive, production-representative dataset for the **Nannies For Hire** Metro Vancouver childcare marketplace.

## How to Run

```bash
# From the project root:
npm run db:seed
```

This executes:
```
ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

---

## Data Summary

| Entity                | Count | Notes                                          |
|-----------------------|------:|-------------------------------------------------|
| **Users**             |    15 | 1 Admin + 5 Parents + 8 Approved Sitters + 1 Pending |
| **Households**        |     5 | Across Vancouver, Burnaby, N. Van, Richmond, Coquitlam |
| **Children**          |    12 | Ages ranging from infant to school-age          |
| **Sitter Profiles**   |     9 | 8 `APPROVED` + 1 `PENDING_VERIFICATION`         |
| **Sitter Availability** |  45 | 5 availability slots per approved sitter         |
| **Bookings**          |    10 | All lifecycle states represented                |
| **Reviews**           |     5 | 4★–5★ ratings with tags                         |
| **Chat Messages**     |    10 | Across 3 booking conversations                  |
| **Nanny Applications**|     2 | `SUBMITTED` status with uploaded documents       |
| **Application Docs**  |     6 | Govt ID, CPR Cert, CRC, Resume, First Aid       |
| **Notifications**     |    10 | 7 types: booking, review, application, clock-in |

---

## Detailed Entity Breakdown

### 1. Platform Admin

| Name           | Email                     | Role  |
|----------------|---------------------------|-------|
| Platform Admin | admin@nanniesforhire.ca   | ADMIN |

### 2. Parent Users

| Name             | Email                           | Phone        | City           | Neighborhood    |
|------------------|---------------------------------|--------------|----------------|-----------------|
| David Smith      | parent.smith@example.com        | 604-555-0182 | Vancouver      | Kitsilano       |
| Sophia Chen      | parent.chen@example.com         | 604-555-0199 | Burnaby        | Brentwood       |
| Robert MacDonald | parent.macdonald@example.com    | 604-555-0211 | North Vancouver| Lower Lonsdale  |
| Aarav Patel      | parent.patel@example.com        | 604-555-0344 | Richmond       | Steveston       |
| Jessica Taylor   | parent.taylor@example.com       | 604-555-0488 | Coquitlam      | Town Centre     |

### 3. Households & Children

| Family           | Address                | Children                                       |
|------------------|------------------------|-------------------------------------------------|
| **Smith Family** | 2410 W 4th Ave, Vancouver | Leo (M, 2021) — peanut allergy, asthma; Maya (F, 2023) |
| **Chen Family**  | 4500 Lougheed Hwy, Burnaby | Oliver (M, 2020) — dairy sensitive; Lily (F, 2024) — mild reflux |
| **MacDonald Family** | 120 Lonsdale Ave, N. Van | Liam (M, 2019) — bee stings; Emma (F, 2022); Jack (M, 2024) — premature |
| **Patel Family** | 3800 Moncton St, Richmond | Aarav Jr. (M, 2021) — tree nuts; Diya (F, 2023) |
| **Taylor Family** | 2929 Barnet Hwy, Coquitlam | Noah (M, 2020); Ella (F, 2022) — shellfish; Mia (F, 2024) |

### 4. Approved Sitter Profiles

| Name            | Rate/hr | Extra Child | Exp | CPR | Vehicle | Languages              | Rating |
|-----------------|--------:|------------:|----:|-----|---------|------------------------|-------:|
| Sarah Jenkins   | $26.00  | $3.00       |   5 | ✅  | ✅      | English, French         |    4.9 |
| Emily Wong      | $24.00  | $2.00       |   4 | ✅  | ❌      | English, Cantonese, Mandarin |  5.0 |
| Jessica Miller  | $22.00  | $2.50       |   6 | ✅  | ✅      | English                 |    4.8 |
| Hannah Fraser   | $27.00  | $3.50       |   7 | ✅  | ✅      | English                 |    5.0 |
| Amara Okafor    | $28.00  | $4.00       |   8 | ✅  | ✅      | English, Swahili        |    4.9 |
| Lucas Silva     | $23.00  | $2.00       |   4 | ✅  | ✅      | English, Portuguese     |    4.8 |
| Priya Sharma    | $25.00  | $2.50       |   5 | ✅  | ❌      | English, Hindi, Punjabi |    5.0 |
| Zoe Dubois      | $29.00  | $4.00       |   9 | ✅  | ✅      | English, French         |    5.0 |

### 5. Pending Verification Sitter (Admin Vetting Queue)

| Name            | Status                | Notes                                    |
|-----------------|-----------------------|------------------------------------------|
| Chloe Tremblay  | `PENDING_VERIFICATION`| Camp counselor, 3 yrs exp, has application |

### 6. Bookings

| ID                          | Family      | Sitter         | Status       | Children | Total     |
|-----------------------------|-------------|----------------|--------------|----------|-----------|
| `seed_completed_booking_1`  | Smith       | Sarah Jenkins  | `SETTLED`    | 2        | $133.40   |
| `seed_completed_booking_2`  | Chen        | Emily Wong     | `SETTLED`    | 1        | $82.80    |
| `seed_completed_booking_3`  | Patel       | Jessica Miller | `SETTLED`    | 2        | $84.53    |
| `seed_completed_booking_4`  | Taylor      | Priya Sharma   | `SETTLED`    | 2        | $158.13   |
| `seed_completed_booking_5`  | MacDonald   | Zoe Dubois     | `SETTLED`    | 2        | $151.80   |
| `seed_in_progress_booking`  | MacDonald   | Hannah Fraser  | `IN_PROGRESS`| 2        | $140.30   |
| `seed_confirmed_booking_1`  | Smith       | Emily Wong     | `CONFIRMED`  | 2        | $119.60   |
| `seed_requested_booking_1`  | Patel       | Amara Okafor   | `REQUESTED`  | 1        | $128.80   |
| `seed_requested_booking_2`  | Taylor      | Lucas Silva    | `REQUESTED`  | 2        | $86.25    |
| `seed_cancelled_booking_1`  | Chen        | Sarah Jenkins  | `CANCELLED`  | 1        | $89.70    |

**Financial Totals (Settled Only):**
- Gross Merchandise Volume: **$610.66**
- Platform Commission (15%): **$79.86**
- Sitter Payouts (85%): **$530.80**

### 7. Reviews

| Booking                     | Author           | Sitter          | Rating | Tags                                |
|-----------------------------|------------------|-----------------|--------|-------------------------------------|
| `seed_completed_booking_1`  | David Smith      | Sarah Jenkins   | ⭐⭐⭐⭐⭐ | Punctual, Great with Toddlers, Clean |
| `seed_completed_booking_2`  | Sophia Chen      | Emily Wong      | ⭐⭐⭐⭐⭐ | Patient, Communicative, Fun          |
| `seed_completed_booking_3`  | Aarav Patel      | Jessica Miller  | ⭐⭐⭐⭐   | Creative, Patient, Good with Multiple Kids |
| `seed_completed_booking_4`  | Jessica Taylor   | Priya Sharma    | ⭐⭐⭐⭐⭐ | Bilingual, Meal Prep, Reliable       |
| `seed_completed_booking_5`  | Robert MacDonald | Zoe Dubois      | ⭐⭐⭐⭐⭐ | Montessori, Professional, Calm       |

### 8. Chat Messages

| Booking Thread               | Between                      | Messages | Notes               |
|------------------------------|------------------------------|----------|----------------------|
| Smith ↔ Sarah Jenkins        | David Smith ↔ Sarah Jenkins  | 4        | All read             |
| Chen ↔ Emily Wong            | Sophia Chen ↔ Emily Wong     | 3        | All read             |
| MacDonald ↔ Hannah Fraser    | Robert MacDonald ↔ Hannah    | 3        | 1 unread (latest)    |

### 9. Nanny Applications

| App Number     | Name            | Status      | Experience | Documents          |
|----------------|-----------------|-------------|------------|--------------------|
| APP-2026-8801  | Chloe Tremblay  | `SUBMITTED` | 3 years    | ID, CPR, First Aid |
| APP-2026-8802  | Marcus Vance    | `SUBMITTED` | 5 years    | ID, CRC, Resume    |

### 10. Notifications (10 total)

| Recipient         | Type                    | Summary                                    | Read?  |
|-------------------|-------------------------|--------------------------------------------|--------|
| Platform Admin    | `NEW_NANNY_APPLICATION` | Chloe Tremblay submitted application       | ❌     |
| Platform Admin    | `NEW_NANNY_APPLICATION` | Marcus Vance submitted application         | ❌     |
| Sarah Jenkins     | `NEW_BOOKING_REQUEST`   | Smith Family booking request               | ✅     |
| David Smith       | `BOOKING_ACCEPTED`      | Sarah accepted booking                     | ✅     |
| Robert MacDonald  | `SITTING_STARTED`       | Hannah Fraser clocked in                   | ❌     |
| Amara Okafor      | `NEW_BOOKING_REQUEST`   | Patel Family booking request               | ❌     |
| Lucas Silva       | `NEW_BOOKING_REQUEST`   | Taylor Family booking request              | ❌     |
| Sarah Jenkins     | `REVIEW_SUBMITTED`      | 5-star review from David Smith             | ✅     |
| Sophia Chen       | `BOOKING_ACCEPTED`      | Emily Wong accepted booking                | ✅     |
| David Smith       | `BOOKING_ACCEPTED`      | Upcoming booking with Emily Wong           | ❌     |

---

## E2E Test Compatibility

> [!IMPORTANT]
> The following seeded IDs are **required** by Playwright E2E tests:

| Seeded ID                    | Used By Tests                                     |
|------------------------------|---------------------------------------------------|
| `seed_completed_booking_1`   | `07-realtime-chat`, `08-notification-bell`         |
| `seed_requested_booking_1`   | `09-booking-request-notifications`                 |
| `seed_in_progress_booking`   | `04-caregiver-portal-and-clocking`                 |

**Demo Role Users** (used for role switching in tests):
- `David Smith` → Parent role
- `Sarah Jenkins` → Sitter role
- `Platform Admin` → Admin role

---

## Deletion Order (FK-Safe)

The script deletes tables in reverse dependency order to avoid foreign key violations:

```
1.  Notification
2.  ApplicationDocument
3.  NannyApplication
4.  Review
5.  Message
6.  Booking
7.  SitterAvailability
8.  SitterProfile
9.  Child
10. HouseholdMember
11. Household
12. User
```

---

## Architecture Notes

- **No `CHAT_MESSAGE` notifications are seeded.** The chat message route (`/api/chat/messages`) creates `CHAT_MESSAGE` notifications at runtime. These are excluded from the notification bell's unread count to prevent double-counting (chat unread is tracked separately via `/api/chat/unread`).
- **All booking amounts use 15% platform commission.** The formula: `totalAmount = subtotalAmount + (subtotalAmount × 0.15)`
- **Timestamps are relative to `now`.** Completed bookings are dated 1–7 days ago. Requested bookings are 2–3 days in the future.
