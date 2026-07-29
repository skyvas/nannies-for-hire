# Development Milestones, Roadmap & Deployment Strategy

> **Project:** Nannies for Hire (Working Title)  
> **Document Version:** 1.0.0

---

## 1. Development Milestones & Sprint Roadmap

```
+-----------------------------------------------------------------------------------+
| MILESTONE 1: Project Setup & White-Label Foundation (Week 1)                     |
| - Initialize Next.js 15 App Router + Tailwind CSS v4 design system tokens.        |
| - Build brand.config.ts white-label configuration engine.                         |
| - Setup Prisma ORM with SQLite database schema and seed script for Metro Van.    |
| - Implement Provider Adapter interfaces (Auth, Payment, Storage).                |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
| MILESTONE 2: Authentication & Multi-Role User Portals (Week 2)                   |
| - Build Local Mock Auth provider with floating Demo Role Switcher bar.            |
| - Build Parent Household creation portal (guardians, children, allergies, notes). |
| - Build Sitter Profile registration (rates, CPR badge, vehicle status, ID upload).|
| - Build Admin Vetting Queue & Profile Approval/Rejection workflow.               |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
| MILESTONE 3: Search, Booking Dispatch & Pricing Engine (Weeks 3-4)               |
| - Implement Metro Vancouver search grid with neighborhood & date/rate filters.     |
| - Build 1:1 Direct Request dispatch workflow with 2h expiration timer.            |
| - Implement Pricing Engine: `(Base + (ExtraKids * Rate)) * Hours + 15% Fee`.     |
| - Build Sitter Request Accept/Decline portal & Parent booking tracker.            |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
| MILESTONE 4: Time Clocking, Cancellation, Chat & Reviews (Week 5)                |
| - Implement Sitter "Start Sitting / End Sitting" live clock toggle.               |
| - Implement Cancellation & Refund logic (>24h 100% refund, <24h 50% charge).       |
| - Implement Post-Booking Contact-Protected In-App Messaging.                     |
| - Implement Two-Way Ratings & Review system (1-5 stars, tags, text feedback).     |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
| MILESTONE 5: Admin Dashboard, Production Testing & Deployment (Week 6)            |
| - Build Admin GMV & Commission reporting dashboard.                               |
| - Integrate automated unit & integration test suites.                            |
| - Deployment configuration for cloud hosting (Vercel / AWS / Docker container).  |
| - Write end-user and administrator guides in /docs.                               |
+-----------------------------------------------------------------------------------+
```

---

## 2. Local Demo vs Production Deployment Strategy

### 2.1 Local Demo Mode (Zero Setup Friction)
- **Environment**: `NODE_ENV=development`, `AUTH_PROVIDER=mock`, `PAYMENT_PROVIDER=mock`, `STORAGE_PROVIDER=local`, `DATABASE_URL="file:./dev.db"`.
- **Command**: `npm run dev`
- **Behavior**: Starts Next.js app locally on `http://localhost:3000`. Includes a floating **"Demo Role Switcher"** toolbar allowing any tester to instantly switch between Parent, Sitter, and Admin perspectives without typing passwords or needing internet access.

### 2.2 Production Cloud Deployment Strategy
- **Frontend / API Host**: Vercel / Netlify or Docker container on AWS ECS.
- **Database**: Managed PostgreSQL (Supabase / AWS RDS / Neon Postgres).
- **Authentication**: Managed Clerk / Supabase Auth with OAuth (Google, Apple).
- **Payments**: Stripe Connect Direct Charges & Express Custom Payouts in CAD.
- **Storage**: AWS S3 / Cloudflare R2 bucket with private signed URLs for ID documents.
- **CI/CD Pipeline**: GitHub Actions running linting, type-checking, Prisma migration validations, and Jest/Playwright tests on every Pull Request.
