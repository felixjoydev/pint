# Phase 4: Core API Routes

> **Status Legend:** ⬜ Pending | 🔄 In Progress | ✅ Done | ⏸️ Blocked

**Context:** Implement CRUD API routes for posts, pages, widgets, and settings. Create Zod validation schemas, standardized error handling, slug generation, and server actions. **Each task includes unit/integration tests.**

**Dependencies:** Phase 3 complete

**Branch:** `feature/core-api-routes`

**Testing Strategy:** Test as you build (Testing Pyramid)
- Unit tests for utilities and validation
- Integration tests for API routes
- Multi-tenant isolation tests for security

---

## Summary

**Completed:** Tasks 4.1-4.10 (Prerequisites through Settings API)
**Tests:** 202 passing across 15 test files
**Status:** All API routes, validation schemas, and utilities implemented with tests

---

## Prerequisites: Test Setup ✅

**Status:** ✅ Done

**Files created:**
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Test setup file
- `src/test/utils.ts` - Test utilities (mock tenant, mock user, etc.)

**package.json scripts added:**
- `test` - Run tests in watch mode
- `test:run` - Run tests once
- `test:coverage` - Run tests with coverage

---

## Task 4.1: Zod Validation Schemas ✅

**Status:** ✅ Done

**Files created:**
- `src/lib/validations/post.ts` - createPostSchema, updatePostSchema
- `src/lib/validations/page.ts` - createPageSchema, updatePageSchema
- `src/lib/validations/widget.ts` - updateWidgetSchema, updateWidgetOrderSchema
- `src/lib/validations/settings.ts` - updateSettingsSchema
- `src/lib/validations/__tests__/post.test.ts`
- `src/lib/validations/__tests__/page.test.ts`
- `src/lib/validations/__tests__/widget.test.ts`
- `src/lib/validations/__tests__/settings.test.ts`

**Tests:** 52 passing

---

## Task 4.2: API Error Handling ✅

**Status:** ✅ Done

**Files created:**
- `src/lib/api/errors.ts` - ApiError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, TierLimitError, PostLimitError
- `src/lib/api/response.ts` - successResponse, createdResponse, noContentResponse, errorResponse, handleApiError
- `src/lib/api/__tests__/errors.test.ts`
- `src/lib/api/__tests__/response.test.ts`

**Tests:** 30 passing

---

## Task 4.3: Slug Generation ✅

**Status:** ✅ Done

**Files created:**
- `src/lib/utils/slug.ts` - generateSlug, ensureUniquePostSlug, ensureUniquePageSlug
- `src/lib/utils/__tests__/slug.test.ts`

**Tests:** 28 passing

---

## Task 4.4-4.6: Posts API ✅

**Status:** ✅ Done

**Files created:**
- `src/app/api/posts/route.ts` - GET (list), POST (create)
- `src/app/api/posts/[id]/route.ts` - GET, PATCH, DELETE
- `src/app/api/posts/[id]/publish/route.ts` - POST (publish/unpublish)
- `src/app/api/posts/__tests__/route.test.ts`
- `src/app/api/posts/[id]/__tests__/route.test.ts`
- `src/app/api/posts/[id]/publish/__tests__/route.test.ts`

**Features:**
- List posts with status filter
- Create post with auto-slug generation
- Update post with slug uniqueness check
- Delete post
- Publish/unpublish with publishedAt tracking
- 50 post limit for free tier

**Tests:** 39 passing

---

## Task 4.7-4.8: Pages API ✅

**Status:** ✅ Done

**Files created:**
- `src/app/api/pages/route.ts` - GET (list), POST (create)
- `src/app/api/pages/[id]/route.ts` - GET, PATCH, DELETE
- `src/app/api/pages/__tests__/route.test.ts`
- `src/app/api/pages/[id]/__tests__/route.test.ts`

**Features:**
- List pages ordered by navOrder
- Create page with auto-slug and auto-navOrder
- Update page including showInNav and navOrder
- Delete page

**Tests:** 24 passing

---

## Task 4.9: Widgets API ✅

**Status:** ✅ Done

**Files created:**
- `src/app/api/widgets/route.ts` - GET (list), PATCH (bulk order update)
- `src/app/api/widgets/[id]/route.ts` - PATCH (single update)
- `src/app/api/widgets/__tests__/route.test.ts`
- `src/app/api/widgets/[id]/__tests__/route.test.ts`

**Features:**
- List widgets ordered by displayOrder
- Bulk update widget order with transaction
- Update single widget enabled/config/displayOrder
- Tenant isolation for all operations

**Tests:** 15 passing

---

## Task 4.10: Settings API ✅

**Status:** ✅ Done

**Files created:**
- `src/app/api/settings/route.ts` - GET, PATCH
- `src/app/api/settings/__tests__/route.test.ts`

**Features:**
- Get current tenant settings
- Update settings with merge
- Tier-based restrictions (SEO settings require Pro+)
- Returns tier with settings for client-side feature checks

**Tests:** 14 passing

---

## Task 4.11: Server Actions ⬜

**Status:** ⬜ Pending (Optional - can be added when building dashboard UI)

**Description:** Server actions for form mutations where appropriate.

**Files to create:**
- `src/lib/actions/posts.ts`
- `src/lib/actions/pages.ts`
- `src/lib/actions/__tests__/posts.test.ts`
- `src/lib/actions/__tests__/pages.test.ts`

---

## Task 4.12: Database Queries & Mutations ⬜

**Status:** ⬜ Pending (Optional - existing queries from Phase 1 sufficient for now)

**Description:** Additional database queries and mutations.

**Files to update:**
- `src/lib/db/queries/widgets.ts`
- `src/lib/db/queries/settings.ts`
- `src/lib/db/mutations/widgets.ts`
- `src/lib/db/mutations/settings.ts`

---

## Phase 4 Completion Summary

### Completed Files (30 files)
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/utils.ts`
- `src/lib/validations/post.ts`
- `src/lib/validations/page.ts`
- `src/lib/validations/widget.ts`
- `src/lib/validations/settings.ts`
- `src/lib/validations/__tests__/post.test.ts`
- `src/lib/validations/__tests__/page.test.ts`
- `src/lib/validations/__tests__/widget.test.ts`
- `src/lib/validations/__tests__/settings.test.ts`
- `src/lib/api/errors.ts`
- `src/lib/api/response.ts`
- `src/lib/api/__tests__/errors.test.ts`
- `src/lib/api/__tests__/response.test.ts`
- `src/lib/utils/slug.ts`
- `src/lib/utils/__tests__/slug.test.ts`
- `src/app/api/posts/route.ts`
- `src/app/api/posts/[id]/route.ts`
- `src/app/api/posts/[id]/publish/route.ts`
- `src/app/api/posts/__tests__/route.test.ts`
- `src/app/api/posts/[id]/__tests__/route.test.ts`
- `src/app/api/posts/[id]/publish/__tests__/route.test.ts`
- `src/app/api/pages/route.ts`
- `src/app/api/pages/[id]/route.ts`
- `src/app/api/pages/__tests__/route.test.ts`
- `src/app/api/pages/[id]/__tests__/route.test.ts`
- `src/app/api/widgets/route.ts`
- `src/app/api/widgets/[id]/route.ts`
- `src/app/api/widgets/__tests__/route.test.ts`
- `src/app/api/widgets/[id]/__tests__/route.test.ts`
- `src/app/api/settings/route.ts`
- `src/app/api/settings/__tests__/route.test.ts`

### API Endpoints Implemented
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | List posts (filter by status) |
| `/api/posts` | POST | Create post |
| `/api/posts/[id]` | GET | Get single post |
| `/api/posts/[id]` | PATCH | Update post |
| `/api/posts/[id]` | DELETE | Delete post |
| `/api/posts/[id]/publish` | POST | Publish/unpublish |
| `/api/pages` | GET | List pages |
| `/api/pages` | POST | Create page |
| `/api/pages/[id]` | GET | Get single page |
| `/api/pages/[id]` | PATCH | Update page |
| `/api/pages/[id]` | DELETE | Delete page |
| `/api/widgets` | GET | List widgets |
| `/api/widgets` | PATCH | Bulk update order |
| `/api/widgets/[id]` | PATCH | Update single widget |
| `/api/settings` | GET | Get settings |
| `/api/settings` | PATCH | Update settings |

### Test Results
- **15 test files**
- **202 tests passing**
- TypeScript: ✅ No errors
- ESLint: ✅ No errors

---

*Last Updated: January 27, 2026*
