# eBookHub Implementation Status

Audit date: 2026-10-29

## Current Stack and Existing Functionality

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Recharts, and existing role-specific layouts/pages.
- Backend: Express 4, TypeScript, Prisma, PostgreSQL, Zod request parsing, bcrypt password hashing, and JWT authentication via HTTP-only cookie and bearer token.
- The Prisma schema already models users/profiles, author applications, books/categories/files, cart, wishlist, orders/payments, entitlements, reviews, coupons, commissions, ledger entries, payouts, notifications, support, audit logs, reading progress, and bookmarks.
- Existing API route groups cover authentication, books, categories, authors, user profile, cart, wishlist, orders, payments, library, reviews, author portal, administration, notifications, and support.
- Book files are stored locally under `uploads/pdfs`; full PDFs are not statically served. Library metadata and stream routes check entitlements, author ownership, or admin access.
- Existing development UI includes user, author, and admin portals and an in-app demo role switcher.

## Changes Made During This Audit

- Fixed duplicate declarations in the frontend API client that prevented TypeScript parsing and supplied its intended generic defaults.
- Restricted checkout simulation to explicit DEMO mode outside production, required a matching pending DEMO payment with the order amount and currency, and labeled checkout results as demo rather than verified provider payments.
- DEMO transactions no longer increment book sales or author earnings/commission ledger balances.
- Changed `/api/health` to run a database query and report `503`/`unavailable` if PostgreSQL cannot be reached instead of hard-coding a connected status.
- Replaced the destructive seed with a minimal, repeatable development-only seed (one admin, one approved author, one pending applicant, one student, one category, one published book, and one pending book). Added a selective cleanup mode that refuses deletion when the demo accounts/books have order or user activity history.
- Updated development login autofill and role switching to use the minimal seeded identities and removed preset credentials from the admin login form.
- Added root scripts for development launch, typechecking, tests, Prisma migration, and explicit seed execution.
- Production startup now refuses to use the known development JWT secret or a JWT secret shorter than 32 characters.
- Environment loading now resolves the backend or root `.env` consistently from source and compiled execution paths.

## Missing or Incomplete Functionality

- No Prisma migration directory/history exists. `prisma migrate status` reports that the database is not managed by Prisma Migrate. No schema migration was applied during this audit.
- Payment integration is not connected: checkout creates synthetic provider IDs, no Razorpay SDK/signature verification or authenticated webhook endpoint was found, and only the development DEMO flow is available.
- Email verification and email delivery are not implemented. Registration currently marks email as verified; password reset returns a reset token in the response for development.
- Authentication uses browser `localStorage` bearer tokens in addition to cookies; session revocation, rate limiting, and server-side session storage are not implemented.
- S3-compatible storage is not implemented. Upload handling writes to local disk and filters by filename extension; PDF magic-byte/content validation and object-storage signed URLs are absent.
- The online reader has navigation controls and persists progress/bookmarks, but it does not render PDF pages; its total-page fallback is a fixed demo value.
- Demo records are now small, clearly labeled, and created only when the explicit seed command is run. Cleanup is scoped to the reserved demo identifiers and aborts when orders or user activity exist.
- Several admin route paths currently reuse other pages as placeholders (for example coupons, reports, settings, and audit logs).
- Existing test coverage is five standalone Node tests for arithmetic and simplified guards; there are no API/database integration or end-to-end workflow tests.
- Root scripts for dev, build, typecheck, test, migration, and explicit seed execution have been added. The frontend package still has no lint/test scripts.
- In this environment, `npm test` emits repeated `Missing script: "b#!/usr/bin/env"` errors; the underlying test file passes when invoked directly with Node. The npm command-resolution issue remains unexplained.

## Identified Bugs and Risks

- Fixed: frontend API client duplicate constants/method declarations blocked the production build.
- Fixed: a client-controlled `simulateSuccess` flag previously granted entitlements without checking environment, configured provider, or a payment record.
- Fixed: simulated checkouts previously counted as sales and author earnings; demo outcomes are now labeled and excluded from those financial totals.
- Fixed: health endpoint previously claimed PostgreSQL was connected without checking it.
- Fixed: the seed no longer clears unrelated records, and its targeted cleanup refuses to proceed when seeded accounts/books have order or user activity history.
- High: account signup, reset flow, upload validation, rate limiting, cookie/session protections, and payment/webhook verification need production hardening before deployment.
- Medium: checkout UI is still a development demo, not a payment provider flow; frontend must not be used to represent a real charge.
- Medium: reader controls do not yet correspond to actual PDF rendering/search; download/stream workflows need full end-to-end testing.
- Medium: dashboard, admin, and author pages need a route-by-route audit for live data, empty/error states, and ownership checks.

## Database and Environment Status

- PostgreSQL is configured through `backend/.env`; the file exists, but its values were not inspected or printed.
- Prisma reports the configured target as local PostgreSQL database `ebookhub` at `localhost:5432`.
- `prisma migrate status` found no `prisma/migrations` history and reports the database is not managed by Prisma Migrate. Existing schema/data has not been reset or migrated by this audit.
- Runtime: the backend is running on port 5000 and the health endpoint successfully queried PostgreSQL. Vite is serving the frontend on port 5173.
- `.env.example` contains placeholder variables only. The configured local provider default is DEMO; real payment, email, and S3 credentials/services are not verified.

## Verification

- Backend TypeScript compile, frontend TypeScript check, and Vite production build: pass when invoked directly from the installed binaries. Backend compilation and tests were rerun after the environment-path change; Vite reports the generated JavaScript chunk exceeds 500 kB.
- `npm run build` passed before the final frontend-only checkout guard; direct compiler and bundler checks passed after it.
- `node --test backend/test/backend.test.js`: 5 passing tests; these are unit-style checks, not full workflow tests.
- `npm test`: not verified due to the local npm shell-resolution error noted above.
- `prisma migrate status`: confirms there is no Prisma migration history; no migrations were applied.
- API runtime/health: passed; returned `healthy`, `database: connected`, and `paymentProvider: DEMO`.
- Frontend runtime: passed; `http://127.0.0.1:5173/` returned HTTP 200.
- Payment provider, email delivery, S3 storage, browser PDF rendering, API integration, and end-to-end workflows: not verified or not implemented.

## Prioritized Implementation Checklist

1. [x] Repair the frontend compile blocker and confirm both production builds.
2. [x] Prevent browser-controlled payment confirmation from being treated as verified provider payment; keep demo finances separate.
3. [x] Make health checks verify database connectivity.
4. [x] Replace destructive seed behavior with a minimal, repeatable, development-only seed and guarded selective cleanup.
5. [ ] Establish a safe baseline and checked-in Prisma migrations without resetting existing database data.
6. [ ] Complete authentication hardening: verification/reset delivery, revocation strategy, login rate limiting, secure cookie/CSRF policy, and remove localStorage token dependence.
7. [ ] Implement provider-backed sandbox checkout, signature verification, idempotent webhooks, payment status history, and refund flow; keep real charges disabled by default.
8. [ ] Implement private object storage or harden local storage; validate file content and finish entitlement-protected PDF rendering and download.
9. [ ] Audit every frontend workflow against its API for persistence, authorization, loading/error/empty states, and refresh behavior.
10. [ ] Implement real financial snapshots, payout settlement records, audit coverage, and dashboards that exclude DEMO activity from verified financial metrics.
11. [ ] Add request/integration/security tests for student, author, admin, payment replay, ownership, and private PDF access.
12. [ ] Add repeatable Windows setup/deployment docs and complete lint, typecheck, unit, integration, and end-to-end verification.
