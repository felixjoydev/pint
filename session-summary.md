# Pint MVP - Session Summary

> Use this file to resume development in a new conversation context.

**Last Updated:** January 27, 2026

---

## Current Status

- **Branch:** `feature/multi-tenancy`
- **Phase:** Phase 3 Complete - Ready for Phase 4
- **Phases Completed:** Phase 0, Phase 1, Phase 2, Phase 3

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

### Phase 3: Multi-Tenancy & Routing (Current Branch - Ready for PR)
- **Task 3.1:** Tenant Resolution Utilities
- **Task 3.2:** Subdomain Routing Middleware
- **Task 3.3:** Onboarding Page & Form
- **Task 3.4:** Onboarding API Endpoints
- **Task 3.5:** Public Blog Route Structure
- **Task 3.6:** Onboarding Redirect Logic

---

## Phase 3 Implementation Details

### Tenant Resolution (`src/lib/tenant/`)
Created utilities for multi-tenancy:

```
src/lib/tenant/
├── constants.ts  - Reserved subdomains list, ROOT_DOMAIN config
├── resolve.ts    - Tenant resolution functions
└── index.ts      - Exports
```

**Key Functions:**
- `extractSubdomain(hostname)` - Parses subdomain from hostname
- `resolveTenantFromSubdomain(subdomain)` - Database lookup for tenant
- `resolveTenantFromCustomDomain(domain)` - Custom domain resolution
- `resolveTenant(hostname)` - Combined resolution (subdomain + custom domain)
- `isSubdomainValid(subdomain)` - Format validation
- `checkSubdomainAvailability(subdomain)` - DB availability check

### Subdomain Routing in Middleware (`src/middleware.ts`)
The middleware handles:

1. **Subdomain Detection:**
   - Production: Parses from hostname (e.g., `myblog.pint.im` → `myblog`)
   - Development: Supports `?subdomain=myblog` query param for easier testing

2. **URL Rewriting:**
   - Subdomain requests are rewritten to `/(blog)/[subdomain]/...`
   - Example: `myblog.pint.im/my-post` → `/(blog)/myblog/my-post`
   - Sets `x-tenant-subdomain` header for downstream use

3. **Route Protection:**
   - Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks`, `/api/likes`, `/api/subscribe`, `/api/onboarding`, `/api/auth`
   - Protected routes require Clerk authentication

4. **API Routes Exemption:**
   - API routes skip subdomain rewriting (handled via route handlers)

### Onboarding System

**Flow:**
1. User signs up via Clerk → User created with `tenantId: null`
2. User visits `/dashboard` → Redirected to `/onboarding`
3. Onboarding form collects blog name + subdomain
4. Real-time availability check via `/api/onboarding/check-subdomain`
5. Form submission to `/api/onboarding/complete`:
   - Creates Tenant record
   - Links User to Tenant
   - Sets `onboardingComplete: true`
   - Creates default widgets
6. User redirected to `/dashboard`

**Files Created:**
- `src/lib/validations/onboarding.ts` - Zod schema for form validation
- `src/components/onboarding/onboarding-form.tsx` - React Hook Form client component
- `src/app/(dashboard)/onboarding/page.tsx` - Onboarding page (server component)
- `src/app/api/onboarding/check-subdomain/route.ts` - GET endpoint for availability
- `src/app/api/onboarding/complete/route.ts` - POST endpoint to create tenant

### Public Blog Routes (`src/app/(blog)/`)

```
src/app/(blog)/
├── layout.tsx                    - Root blog layout (passthrough)
└── [subdomain]/
    ├── layout.tsx                - Subdomain layout (resolves tenant, 404 if not found)
    ├── page.tsx                  - Blog home (lists published posts)
    └── [slug]/
        └── page.tsx              - Post page (renders individual post)
```

**Features:**
- Tenant resolution in layout (single DB query)
- 404 for non-existent subdomains
- 404 for non-existent or unpublished posts
- Blog header with title from tenant settings

### Dashboard Protection (`src/app/(dashboard)/dashboard/page.tsx`)
- Checks authentication via Clerk
- Checks onboarding status via `getCurrentUser()`
- Redirects to `/sign-in` if not authenticated
- Redirects to `/onboarding` if not onboarded
- Shows loading state while user record is being created (webhook delay)

### API Endpoints Created

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/onboarding/check-subdomain` | GET | Real-time subdomain availability check |
| `/api/onboarding/complete` | POST | Create tenant, link user, create widgets |
| `/api/auth/onboarding-status` | GET | Returns onboarding status for middleware |

---

## Key Architecture Decisions

### Onboarding Flow (Deferred Tenant Creation)
The User model supports deferred onboarding:

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

**Reasoning:** Clerk doesn't collect subdomain at signup. We collect it during onboarding so users can choose their blog URL.

### API Route Auth Pattern
API routes like `/api/onboarding/*` and `/api/auth/*` are marked as "public" in middleware to bypass Clerk's HTML redirect. Authentication is handled in the route handlers themselves using `await auth()`.

### Development Testing
For local development without subdomain DNS setup:
- Use `?subdomain=myblog` query parameter
- Example: `http://localhost:3000/?subdomain=myblog` renders myblog's homepage

---

## Key Files Reference

### Configuration
- `prisma/schema.prisma` - Complete database schema
- `src/middleware.ts` - Clerk middleware with subdomain routing
- `src/app/layout.tsx` - Root layout with ClerkProvider
- `.env.example` - Environment variable documentation

### Tenant Resolution
- `src/lib/tenant/constants.ts` - Reserved subdomains, ROOT_DOMAIN
- `src/lib/tenant/resolve.ts` - Resolution functions
- `src/lib/tenant/index.ts` - Exports

### Auth Pages
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `src/app/(auth)/layout.tsx`

### Onboarding
- `src/app/(dashboard)/onboarding/page.tsx` - Onboarding page
- `src/components/onboarding/onboarding-form.tsx` - Form component
- `src/lib/validations/onboarding.ts` - Zod schema
- `src/app/api/onboarding/check-subdomain/route.ts`
- `src/app/api/onboarding/complete/route.ts`

### Public Blog
- `src/app/(blog)/[subdomain]/layout.tsx` - Tenant resolution
- `src/app/(blog)/[subdomain]/page.tsx` - Blog home
- `src/app/(blog)/[subdomain]/[slug]/page.tsx` - Post page

### Dashboard
- `src/app/(dashboard)/dashboard/page.tsx` - Main dashboard

### Webhooks
- `src/app/api/webhooks/clerk/route.ts` - Clerk webhook handler

### Auth Utilities
- `src/lib/auth/tenant.ts` - User/Tenant resolution functions
- `src/lib/auth/permissions.ts` - Tier-based permissions

### Database
- `src/lib/db/prisma.ts` - Prisma client singleton
- `src/lib/db/queries/*.ts` - Read operations
- `src/lib/db/mutations/*.ts` - Write operations

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
NEXT_PUBLIC_ROOT_DOMAIN=pint.im   # Added in Phase 3
```

---

## Testing Notes

- **Local Subdomain Testing:** Use `?subdomain=myblog` query param
- **Webhooks:** Use ngrok for local testing (`ngrok http 3000`)
- **Database:** Use Prisma Studio (`npx prisma studio`) to inspect data
- **Auth:** Test both email and Google OAuth flows
- **User deletion:** Delete from Clerk dashboard to test cascade
- **Onboarding:** Create new Clerk user to test full flow

---

## Git Workflow Reminder

- Always create feature branch before starting work
- Never commit directly to `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- PR for each phase, merge to main after review

---

## Next Phase: Phase 4 - Core API Routes

The next phase will implement:
- CRUD API routes for posts
- CRUD API routes for pages
- CRUD API routes for widgets
- API validation and error handling
- Server actions where appropriate

See `plan-phase-4.md` for detailed task breakdown.

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

*To resume: Start with "Continue from session-summary.md - Phase 4"*
