# Pint MVP - Session Summary

> Use this file to resume development in a new conversation context.

**Last Updated:** January 27, 2026

---

## Current Status

- **Branch:** `feature/core-api-routes`
- **Phase:** Phase 4 Complete - Ready for Phase 5
- **Phases Completed:** Phase 0, Phase 1, Phase 2, Phase 3, Phase 4

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
- Complete database schema implemented
- Database utility functions created

### Phase 2: Authentication with Clerk (PR #2 - Merged)
- Clerk SDK installed and configured
- Authentication middleware with route protection
- Sign-in and sign-up pages created
- Webhook endpoint with svix signature verification
- Auth utilities for user/tenant resolution

### Phase 3: Multi-Tenancy & Routing (PR #3 - Merged)
- Tenant resolution utilities
- Subdomain routing middleware
- Onboarding page & form
- Public blog route structure

### Phase 4: Core API Routes (Current Branch - Ready for PR)
- **Test Setup:** Vitest configured with 202 passing tests
- **Validation Schemas:** Zod schemas for posts, pages, widgets, settings
- **Error Handling:** Standardized API errors and response utilities
- **Slug Generation:** URL-safe slug utilities with uniqueness checks
- **Posts API:** Full CRUD + publish/unpublish, 50 post limit for free tier
- **Pages API:** Full CRUD with navOrder management
- **Widgets API:** List, single update, bulk order update
- **Settings API:** Get/update with tier-based restrictions

---

## Phase 4 Implementation Details

### Test Infrastructure

```
vitest.config.ts           - Vitest configuration
src/test/setup.ts          - Test setup with Clerk mocks
src/test/utils.ts          - Mock tenant, user, and prisma utilities
```

**Test Scripts:**
- `npm run test` - Watch mode
- `npm run test:run` - Single run
- `npm run test:coverage` - Coverage report

### Validation Schemas (`src/lib/validations/`)

| File | Schemas |
|------|---------|
| `post.ts` | createPostSchema, updatePostSchema |
| `page.ts` | createPageSchema, updatePageSchema |
| `widget.ts` | updateWidgetSchema, updateWidgetOrderSchema |
| `settings.ts` | updateSettingsSchema |

### API Error Handling (`src/lib/api/`)

**Error Classes:**
- `ApiError` - Base error class
- `NotFoundError` - 404 errors
- `ValidationError` - 400 with details
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `TierLimitError` - Feature restrictions
- `PostLimitError` - Free tier limit

**Response Utilities:**
- `successResponse(data, status)` - Standard success
- `createdResponse(data)` - 201 Created
- `noContentResponse()` - 204 No Content
- `errorResponse(error)` - Format ApiError
- `handleApiError(error)` - Catch-all handler

### Slug Utilities (`src/lib/utils/slug.ts`)

- `generateSlug(title)` - URL-safe slug from title
- `ensureUniquePostSlug(slug, tenantId, excludeId?)` - Unique slug for posts
- `ensureUniquePageSlug(slug, tenantId, excludeId?)` - Unique slug for pages

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | List posts (filter by status) |
| `/api/posts` | POST | Create post (auto-slug, 50 limit for free) |
| `/api/posts/[id]` | GET | Get single post |
| `/api/posts/[id]` | PATCH | Update post |
| `/api/posts/[id]` | DELETE | Delete post |
| `/api/posts/[id]/publish` | POST | Publish/unpublish |
| `/api/pages` | GET | List pages (ordered by navOrder) |
| `/api/pages` | POST | Create page (auto-slug, auto-navOrder) |
| `/api/pages/[id]` | GET | Get single page |
| `/api/pages/[id]` | PATCH | Update page |
| `/api/pages/[id]` | DELETE | Delete page |
| `/api/widgets` | GET | List widgets |
| `/api/widgets` | PATCH | Bulk update order |
| `/api/widgets/[id]` | PATCH | Update single widget |
| `/api/settings` | GET | Get tenant settings |
| `/api/settings` | PATCH | Update settings (tier restrictions) |

### Key Features

1. **Tenant Isolation:** All queries include `tenantId` filter
2. **Tier-Based Restrictions:**
   - Free tier: 50 post limit
   - Pro/Max: Unlimited posts
   - Settings like SEO require Pro+
3. **Auto Slug Generation:** Falls back to title if not provided
4. **Unique Slug Enforcement:** Appends -2, -3, etc. if exists
5. **Publish Tracking:** `publishedAt` set on first publish only
6. **Transaction Support:** Widget bulk order uses `$transaction`

---

## Test Results

- **15 test files**
- **202 tests passing**
- TypeScript: ✅ No errors
- ESLint: ✅ No errors

---

## Key Files Reference

### Phase 4 Files

```
# Test Setup
vitest.config.ts
src/test/setup.ts
src/test/utils.ts

# Validation Schemas
src/lib/validations/post.ts
src/lib/validations/page.ts
src/lib/validations/widget.ts
src/lib/validations/settings.ts

# API Utilities
src/lib/api/errors.ts
src/lib/api/response.ts
src/lib/utils/slug.ts

# API Routes
src/app/api/posts/route.ts
src/app/api/posts/[id]/route.ts
src/app/api/posts/[id]/publish/route.ts
src/app/api/pages/route.ts
src/app/api/pages/[id]/route.ts
src/app/api/widgets/route.ts
src/app/api/widgets/[id]/route.ts
src/app/api/settings/route.ts

# Tests (15 files)
src/lib/validations/__tests__/*.test.ts
src/lib/api/__tests__/*.test.ts
src/lib/utils/__tests__/*.test.ts
src/app/api/*/__tests__/*.test.ts
```

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
NEXT_PUBLIC_ROOT_DOMAIN=pint.im
```

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Run tests (watch mode)
npm run test:run     # Run tests (single)
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate client
npx prisma studio    # Database GUI
```

---

## Git Workflow Reminder

- Always create feature branch before starting work
- Never commit directly to `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- PR for each phase, merge to main after review

---

## Next Phase: Phase 5

See `plan.md` for Phase 5 task breakdown.

---

*To resume: Start with "Continue from session-summary.md - Phase 5"*
