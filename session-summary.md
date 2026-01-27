# Pint MVP - Session Summary

> Use this file to resume development in a new conversation context.

**Last Updated:** January 27, 2026

---

## Current Status

- **Branch:** `feature/multi-tenancy`
- **Phase:** Starting Phase 3 (Multi-Tenancy & Routing)
- **Phases Completed:** Phase 0, Phase 1, Phase 2

---

## Completed Work

### Phase 0: Project Initialization (PR #0 - Initial)
- Next.js 14+ project with App Router
- TypeScript strict mode
- Tailwind CSS configuration
- ESLint + Prettier setup
- Project folder structure created
- Environment variables documented

### Phase 1: Database & ORM Setup (PR #1 - Merged)
- Neon PostgreSQL database configured
- Prisma ORM installed and configured
- Complete database schema implemented:
  - Enums: `Tier`, `PostStatus`, `PageStatus`, `WallOfLoveStatus`
  - Models: `Tenant`, `User`, `Post`, `Page`, `Widget`, `Like`, `WallOfLove`, `Subscriber`, `MediaFile`, `ApiKey`, `PageView`
- Database utility functions created:
  - `src/lib/db/queries/tenants.ts`
  - `src/lib/db/queries/posts.ts`
  - `src/lib/db/queries/pages.ts`
  - `src/lib/db/mutations/posts.ts`
  - `src/lib/db/mutations/pages.ts`

### Phase 2: Authentication with Clerk (PR #2 - Merged)
- Clerk SDK installed and configured
- Authentication middleware with route protection
- Sign-in and sign-up pages created
- Webhook endpoint with svix signature verification
- User created handler (creates User in DB, no tenant yet)
- User deleted handler (deletes User and Tenant if exists)
- Auth utilities:
  - `src/lib/auth/tenant.ts` - getCurrentUser, requireUser, getCurrentTenant, requireTenant, hasCompletedOnboarding
  - `src/lib/auth/permissions.ts` - Tier-based feature permissions

---

## Key Architecture Decisions

### Onboarding Flow (Important!)
The User model was modified to support a deferred onboarding pattern:

```prisma
model User {
  id                 String   @id @default(uuid())
  tenantId           String?  @map("tenant_id")  // NULLABLE - set during onboarding
  clerkId            String   @unique @map("clerk_id")
  email              String
  onboardingComplete Boolean  @default(false) @map("onboarding_complete")
  createdAt          DateTime @default(now()) @map("created_at")
  tenant Tenant? @relation(fields: [tenantId], references: [id], onDelete: SetNull)
  @@index([tenantId])
  @@map("users")
}
```

**Flow:**
1. User signs up via Clerk (email or Google OAuth)
2. Webhook creates User with `tenantId: null`, `onboardingComplete: false`
3. User is redirected to onboarding page
4. Onboarding collects blog name and subdomain
5. Tenant is created, User is updated with `tenantId` and `onboardingComplete: true`
6. User proceeds to dashboard

**Reasoning:** Clerk doesn't collect subdomain at signup. We collect it during onboarding so users can choose their blog URL.

### Clerk ↔ Database Relationship
- **Clerk is the source of truth** for authentication
- Webhooks sync Clerk events to our database (one-way)
- We never push changes from our DB back to Clerk
- User records in our DB are created/deleted via webhooks

---

## Key Files

### Configuration
- `prisma/schema.prisma` - Complete database schema
- `src/middleware.ts` - Clerk middleware for route protection
- `src/app/layout.tsx` - Root layout with ClerkProvider

### Auth Pages
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `src/app/(auth)/layout.tsx`

### Webhooks
- `src/app/api/webhooks/clerk/route.ts` - Handles user.created, user.deleted

### Auth Utilities
- `src/lib/auth/tenant.ts` - User/Tenant resolution functions
- `src/lib/auth/permissions.ts` - Tier-based permissions (TIER_FEATURES)

### Database
- `src/lib/db/prisma.ts` - Prisma client singleton
- `src/lib/db/queries/*.ts` - Read operations
- `src/lib/db/mutations/*.ts` - Write operations

---

## Phase 3: Multi-Tenancy & Routing (Next Up)

Proposed tasks:

### Task 3.1: Update Middleware for Subdomain Routing
- Parse subdomain from request hostname
- Set tenant context in request headers
- Handle main domain vs subdomain routing

### Task 3.2: Create Tenant Resolution Utilities
- `resolveTenantFromSubdomain(subdomain)`
- `resolveTenantFromCustomDomain(domain)`
- Cache tenant lookups

### Task 3.3: Create Onboarding Page & Form
- `/onboarding` route (protected)
- Form: blog name, subdomain input
- Real-time subdomain availability check
- Subdomain preview (e.g., "myblog.pint.im")

### Task 3.4: Create Onboarding API
- `POST /api/onboarding/check-subdomain` - Check availability
- `POST /api/onboarding/complete` - Create tenant, update user

### Task 3.5: Create Public Blog Route Structure
- `src/app/(blog)/[subdomain]/page.tsx` - Blog home
- `src/app/(blog)/[subdomain]/[slug]/page.tsx` - Post page
- Dynamic rendering based on tenant

### Task 3.6: Add Redirect Logic
- Non-onboarded users → `/onboarding`
- Onboarded users at `/onboarding` → `/dashboard`

---

## Environment Variables Required

```env
# Database (Neon)
DATABASE_URL=postgresql://...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Notes

- **Webhooks:** Use ngrok for local testing (`ngrok http 3000`)
- **Database:** Use Prisma Studio (`npx prisma studio`) to inspect data
- **Auth:** Test both email and Google OAuth flows
- **User deletion:** Delete from Clerk dashboard to test cascade

---

## Git Workflow Reminder

- Always create feature branch before starting work
- Never commit directly to `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- PR for each phase, merge to main after review

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate client
npx prisma studio    # Database GUI
```

---

*To resume: Start with "Continue Phase 3 from session-summary.md"*
