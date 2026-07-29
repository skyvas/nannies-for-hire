# 🧸 Nannies for Hire - Metro Vancouver Childcare Platform

A modern, full-stack, local-first childcare marketplace built with **Next.js 15 App Router**, **TypeScript**, **Prisma ORM (SQLite)**, **Server-Sent Events (SSE)** real-time messaging, and **Playwright E2E Testing**.

---

## 🌟 Key Features

### 1. On-Demand Caregiver Search & CPR Filtering
- Search local vetted babysitters and nannies across Metro Vancouver (Vancouver, Burnaby, Richmond, Surrey, North Vancouver, Coquitlam).
- Real-time filter toggles (CPR & First Aid Certified, Years of Experience, Hourly Rate in CAD).
- Detailed sitter profiles with hourly rates, vehicle access, languages spoken, and verified ID status.

### 2. Instant Booking & 15% Platform Commission Engine
- Multi-child rate calculation: `((Base Rate + Extra Child Rate * (Children - 1)) * Hours)`.
- Automatic 15% platform commission calculations displayed transparently in price breakdowns.
- Booking status lifecycle (`REQUESTED` ➔ `CONFIRMED` ➔ `IN_PROGRESS` ➔ `SETTLED`).

### 3. Live Caregiver Time-Clocking Portal
- Caregiver dashboard to review incoming job requests, accept/decline bookings, and manage schedules.
- Live arrival/departure time clocking (`Start Sitting` ➔ `End Sitting`) calculating actual sitting duration and final settlement totals.

### 4. Booking-Locked Real-Time SSE Chat & Photo Attachments
- Zero-dependency **Server-Sent Events (SSE)** streaming for instant text messaging and photo updates.
- Quick photo presets (`📷 Bedtime Photo`, `🍎 Snack Time`, `🎨 Crafts & Games`).
- Timestamped read receipts (`✓✓`) turning green when opened by the recipient.
- Embedded web audio chime alerts and floating in-app toasts for incoming messages.

### 5. Robust Navbar Notification Bell (Zero False Positives)
- Real-time badge counter displaying unread messages for the currently logged-in user.
- **Zero False Positives:** Excludes self-authored messages (`senderId !== currentUserId`) and messages where `readAt` is timestamped.
- Interactive dropdown preview menu showing sender avatar, title, per-thread unread badge, and message snippet.
- Automatic count reset to 0 when thread is opened.

### 6. Admin Vetting Queue & Financial GMV Analytics
- Manual ID document vetting approval queue for pending applicant sitters.
- Platform financial ledger displaying Gross Merchandise Value (GMV) and total 15% commission revenue.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router, React 19, TypeScript) |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Database** | Prisma ORM with SQLite (`dev.db`) |
| **Real-Time Streaming** | Server-Sent Events (SSE) via `EventEmitter` |
| **Testing** | Playwright E2E Test Runner in Headed Mode |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Database Schema & Seed Local Data
```bash
npx prisma db push
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform. Use the fixed **Demo Role Switcher** at the bottom right to switch seamlessly between:
- **David Smith** (Parent)
- **Sarah Jenkins** (Caregiver)
- **Platform Admin** (Admin)

---

## 🧪 Playwright End-to-End Testing

The codebase includes a complete **13-spec Playwright E2E test suite** verifying landing page branding, search filters, 15% commission calculations, caregiver clocking, admin vetting, dual-browser side-by-side SSE chat streaming, and the Notification Bell unread counter.

### Run All 13 Tests in Headed Mode
```bash
npm run test:e2e:headed
```

### Run Tests Headlessly
```bash
npm run test:e2e
```

---

## 📁 Project Structure

```text
├── e2e/                             # Playwright E2E Test Suite (13 specs)
│   ├── 01-landing-and-branding.spec.ts
│   ├── 02-search-and-filtering.spec.ts
│   ├── 03-booking-workflow.spec.ts
│   ├── 04-caregiver-portal-and-clocking.spec.ts
│   ├── 05-parent-reviews-and-household.spec.ts
│   ├── 06-admin-vetting-and-analytics.spec.ts
│   ├── 07-realtime-chat-dual-browser.spec.ts
│   └── 08-unread-notification-bell.spec.ts
├── prisma/
│   ├── schema.prisma                # Database Models (User, SitterProfile, Booking, Message, Review)
│   └── seed.ts                      # Metro Vancouver Seed Data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/messages/       # GET/POST Chat Messages
│   │   │   ├── chat/stream/         # SSE Live Event Stream
│   │   │   ├── chat/read/           # Timestamp Read Receipts
│   │   │   └── chat/unread/         # Unread Message Counter API
│   │   ├── parent/                  # Parent Bookings & Household
│   │   ├── sitter/                  # Caregiver Portal & Clocking
│   │   └── admin/                   # Admin Vetting Queue & Financial Analytics
│   ├── components/
│   │   ├── branding/Navbar.tsx      # Top Navigation with Notification Bell
│   │   ├── chat/ChatWindow.tsx      # Real-Time SSE Chat Component
│   │   ├── notifications/NotificationBell.tsx  # Unread Counter & Dropdown Preview
│   │   └── demo/DemoRoleSwitcher.tsx           # Quick Demo Role Toggle Toolbar
│   └── lib/
│       ├── db.ts                    # Prisma Client Singleton
│       └── services/chatStream.ts   # Shared SSE Broadcast Service
└── playwright.config.ts             # Playwright Configuration
```
