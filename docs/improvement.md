# Project Improvements Backlog

This document tracks identified technical debt, architectural enhancements, refactoring opportunities, security hardening, performance optimizations, and feature ideas for the project.

---

## Standardize Schema Validation for API Routes (Zod)
**Category:** Security
**Description:**
Introduce runtime schema validation using `zod` for all API route handlers across [src/app/api/](file:///Users/akash-mac/workspace/project/src/app/api).
**Reason:**
Currently, handlers manually parse JSON payloads and check fields using ad-hoc `if` conditions (e.g. [route.ts](file:///Users/akash-mac/workspace/project/src/app/api/chat/messages/route.ts#L43-L45)). Using Zod ensures strict payload shape, type safety, automatic field sanitization, and structured validation error responses.
**Suggested Implementation:**
1. Install `zod` dependency (`npm i zod`).
2. Create validation schemas directory in `src/lib/validations/` (e.g., `chat.ts`, `booking.ts`).
3. Parse request body and query parameters with `.safeParse()` inside route handlers before processing database calls.
4. Return a standardized 400 Bad Request response with formatted validation errors on parse failure.
**Priority:** High
**Status:** Done

---

## Isolate Demo Authentication Fallbacks for Production Safety
**Category:** Security
**Description:**
Refactor `getCurrentSession()` in [src/lib/adapters/auth/index.ts](file:///Users/akash-mac/workspace/project/src/lib/adapters/auth/index.ts) to strictly guard demo fallback user queries behind development environment checks.
**Reason:**
If no session cookie is set, `getCurrentSession()` currently queries the database for the first user with role `PARENT` and logs them in automatically. While helpful for local UI testing, this creates a security vulnerability if deployed to production.
**Suggested Implementation:**
1. Add an explicit environment check (`process.env.NODE_ENV === 'development'`) around demo user fallbacks in [index.ts](file:///Users/akash-mac/workspace/project/src/lib/adapters/auth/index.ts#L20-L36).
2. Ensure production builds default to returning `{ user: null }` when authentication tokens/cookies are absent.
3. Configure environment variable validation for auth secret keys.
**Priority:** High
**Status:** Done

---

## Clean Up Imports with Configured `@/*` Path Alias
**Category:** Refactoring
**Description:**
Replace relative directory import paths (e.g., `../../../../lib/db`) with TypeScript path alias `@/*` configured in [tsconfig.json](file:///Users/akash-mac/workspace/project/tsconfig.json#L22).
**Reason:**
Deeply nested relative paths degrade developer experience, reduce readability, and cause broken imports during code refactoring or component relocations.
**Suggested Implementation:**
1. Run a workspace-wide search for relative imports reaching into `lib` or `components` (e.g., `../../lib/`).
2. Update imports to use `@/lib/db`, `@/lib/adapters/auth`, etc., across all files in [src/app/api/](file:///Users/akash-mac/workspace/project/src/app/api) and [src/components/](file:///Users/akash-mac/workspace/project/src/components).
**Priority:** Medium
**Status:** Done

---

## Establish UI Component Primitives Directory (`src/components/ui/`)
**Category:** Developer Experience
**Description:**
Structure [src/components/](file:///Users/akash-mac/workspace/project/src/components) by introducing an isolated `ui/` directory dedicated to atomic UI primitives (e.g., `Button`, `Input`, `Modal`, `Badge`, `Card`).
**Reason:**
Feature components in `chat` and `notifications` currently embed their own ad-hoc button and layout styling. Establishing shared UI primitives promotes visual consistency, simplifies theme updates, and speeds up feature creation.
**Suggested Implementation:**
1. Create directory `src/components/ui/`.
2. Extract common primitive components (`Button.tsx`, `Modal.tsx`, `Badge.tsx`) with flexible variant props.
3. Refactor feature-specific components in `src/components/chat/` and `src/components/notifications/` to compose these shared UI primitives.
**Priority:** Medium
**Status:** Done

---

## Add Unit and Integration Test Coverage for Core Business Services
**Category:** Testing
**Description:**
Introduce Vitest or Jest to write unit and integration tests for critical backend domain logic in [src/lib/services/](file:///Users/akash-mac/workspace/project/src/lib/services) (such as pricing formulas in [pricing.ts](file:///Users/akash-mac/workspace/project/src/lib/services/pricing.ts)).
**Reason:**
Currently, testing is limited to Playwright E2E browser tests. Unit tests for pure business logic execute in milliseconds, allowing rapid verification of edge cases (e.g., extra child rate calculations, surcharge rules) without spinning up full browser contexts.
**Suggested Implementation:**
1. Install `vitest`.
2. Add a `test` script in `package.json`.
3. Write unit tests for `pricing.ts` and authorization helper functions.
4. Integrate test execution into CI workflow (.github/workflows).
**Priority:** Medium
**Status:** Done

---

## Implement OWASP API Security Top 10 Test Suite & Auditing
**Category:** Security
**Description:**
Create an automated security test suite and audit plan evaluating all API endpoints under [src/app/api/](file:///Users/akash-mac/workspace/project/src/app/api) against the **OWASP API Security Top 10 (2026)** vulnerability matrix.
**Reason:**
Testing APIs against the OWASP Top 10 ensures protection against Broken Object Level Authorization (BOLA), Broken Function Level Authorization (BFLA), Mass Assignment, SSRF, Unrestricted Resource Consumption, and Error Disclosure before production deployment.
**Suggested Implementation:**
1. Document full test plan matrix in `docs/owasp_api_security_test_plan.md`.
2. Add automated security tests in `e2e/security/` testing BOLA, BFLA, and payload size bounds.
3. Audit API response headers and error handling to ensure stack traces are never exposed in production error responses.
**Priority:** High
**Status:** Pending
