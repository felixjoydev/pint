# Changelog

All notable changes to Pint are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [Unreleased]

### Added
- Initial project documentation (PRD, Architecture, ERD)
- Claude Code configuration (`claude.md`, `/remember` command)

---

## [0.5.0] - 2026-01-27

### Added
- Media storage with Cloudflare R2 integration
  - `src/lib/storage/constants.ts` - MIME types, size limits, helper functions
  - `src/lib/storage/r2.ts` - R2 client singleton, presigned URL generation
  - `src/lib/storage/index.ts` - Export barrel
- Media validation schemas (`src/lib/validations/media.ts`)
  - `uploadRequestSchema` - Validate presigned URL requests (filename, mimeType, size)
  - `uploadConfirmSchema` - Validate upload confirmation
  - `mediaListQuerySchema` - Validate list query parameters (type, limit, cursor)
- Upload API (`/api/upload`)
  - POST - Generate presigned URL for direct R2 upload
  - Creates MediaFile record with tenant isolation
  - Validates file types (images: jpeg, png, gif, webp; audio: mp3, wav, ogg)
  - Enforces size limits (10MB images, 50MB audio)
- Upload confirmation API (`/api/upload/[id]/confirm`)
  - POST - Confirm upload complete and verify file exists in R2
  - Updates file size from R2 metadata if not provided
- Media API (`/api/media`)
  - GET - List media files with type filtering and cursor pagination
  - GET `/api/media/[id]` - Get single media file
  - DELETE `/api/media/[id]` - Delete from R2 and database
- Cloudflare Worker for image transformation (`workers/image-transform/`)
  - Resize images: `?w=800` (100-2000px)
  - Convert format: `?f=webp` (webp, jpeg, png)
  - Quality control: `?q=80` (1-100)
  - 30-day cache for transformed images
- Worker scripts in root package.json: `worker:dev`, `worker:deploy`, `worker:install`
- 149 new tests (62 storage + 43 validation + 44 API tests)
- Total: 351 tests passing

### Infrastructure
- Created R2 bucket `pint-media` in Cloudflare (Western Europe region)
- Enabled Public Development URL: `https://pub-4b6ad90498154204ad146660d66cf185.r2.dev`
- Deployed `pint-image-transform` worker to `pint-image-transform.draftmade.workers.dev`
- Configured R2 bucket binding (`MEDIA_BUCKET` → `pint-media`)

### Changed
- Updated `.env.example` with detailed R2 configuration documentation
- Updated `tsconfig.json` to exclude `workers/` directory
- Updated `workers/image-transform/wrangler.toml` with actual R2 public URL

---

## [0.4.0] - 2026-01-27

### Added
- Vitest test infrastructure with Clerk and Prisma mocks
  - `vitest.config.ts` - Test configuration with path aliases
  - `src/test/setup.ts` - Clerk auth mocking
  - `src/test/utils.ts` - Mock tenant, user, and prisma utilities
  - Test scripts: `npm run test`, `npm run test:run`, `npm run test:coverage`
- Zod validation schemas (`src/lib/validations/`)
  - `post.ts` - createPostSchema, updatePostSchema
  - `page.ts` - createPageSchema, updatePageSchema
  - `widget.ts` - updateWidgetSchema, updateWidgetOrderSchema
  - `settings.ts` - updateSettingsSchema
- Standardized API error handling (`src/lib/api/`)
  - `errors.ts` - ApiError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, TierLimitError, PostLimitError
  - `response.ts` - successResponse, createdResponse, noContentResponse, errorResponse, handleApiError
- URL-safe slug generation (`src/lib/utils/slug.ts`)
  - `generateSlug()` - Convert title to URL-safe slug
  - `ensureUniquePostSlug()` - Unique slug per tenant for posts
  - `ensureUniquePageSlug()` - Unique slug per tenant for pages
- Posts API (`/api/posts`)
  - GET - List posts with status filter
  - POST - Create post with auto-slug, 50 post limit for free tier
  - GET `/api/posts/[id]` - Get single post
  - PATCH `/api/posts/[id]` - Update post
  - DELETE `/api/posts/[id]` - Delete post
  - POST `/api/posts/[id]/publish` - Publish/unpublish with publishedAt tracking
- Pages API (`/api/pages`)
  - GET - List pages ordered by navOrder
  - POST - Create page with auto-slug and auto-navOrder
  - GET `/api/pages/[id]` - Get single page
  - PATCH `/api/pages/[id]` - Update page
  - DELETE `/api/pages/[id]` - Delete page
- Widgets API (`/api/widgets`)
  - GET - List widgets ordered by displayOrder
  - PATCH - Bulk update widget order with $transaction
  - PATCH `/api/widgets/[id]` - Update single widget
- Settings API (`/api/settings`)
  - GET - Get tenant settings with tier info
  - PATCH - Update settings with tier-based restrictions (SEO requires Pro+)
- 202 tests across 15 test files

### Changed
- All API routes enforce tenant isolation via `tenantId` filtering

---

## [0.3.0] - 2026-01-27

### Added
- Multi-tenant subdomain routing (`myblog.pint.im` → tenant's blog)
- Tenant resolution utilities (`src/lib/tenant/`)
  - `extractSubdomain()` - Parse subdomain from hostname
  - `resolveTenantFromSubdomain()` - Database lookup
  - `resolveTenantFromCustomDomain()` - Custom domain resolution
  - `checkSubdomainAvailability()` - Availability check
- Reserved subdomains list (www, app, api, admin, etc.)
- Development testing support via `?subdomain=` query parameter
- Onboarding system for new users:
  - `/onboarding` page with blog name and subdomain form
  - Real-time subdomain availability check
  - Zod validation schema for onboarding
  - React Hook Form integration
- Onboarding API endpoints:
  - `GET /api/onboarding/check-subdomain` - Availability check
  - `POST /api/onboarding/complete` - Create tenant and link user
  - `GET /api/auth/onboarding-status` - Check onboarding status
- Public blog routes:
  - `/(blog)/[subdomain]` - Blog homepage with post list
  - `/(blog)/[subdomain]/[slug]` - Individual post page
- Dashboard protection with onboarding redirect
- Dependencies: `react-hook-form`, `@hookform/resolvers`

### Changed
- Middleware updated for subdomain detection and URL rewriting
- API routes (`/api/onboarding/*`, `/api/auth/*`) marked as public for custom auth handling
- `getPublishedPostsByTenant()` now returns select fields for blog listing

---

## [0.2.0] - 2026-01-27

### Added
- Clerk authentication integration (`@clerk/nextjs`)
- Sign-in and sign-up pages with Clerk components
- Authentication middleware for route protection
- Clerk webhook handler with svix signature verification
- User created/deleted webhook handlers
- Auth utilities (`getCurrentUser`, `requireUser`, `getCurrentTenant`, `requireTenant`)
- Tier-based permissions system (`TIER_FEATURES`, `canAccessFeature`, `getFeatureLimits`)
- Onboarding support: User.tenantId now nullable, added `onboardingComplete` field

### Changed
- User model: `tenantId` changed from required to optional (for onboarding flow)

---

## [0.1.0] - 2026-01-27

### Added
- Neon PostgreSQL database setup
- Prisma ORM configuration with singleton client
- Complete database schema:
  - Enums: `Tier`, `PostStatus`, `PageStatus`, `WallOfLoveStatus`
  - Models: `Tenant`, `User`, `Post`, `Page`, `Widget`, `Like`, `WallOfLove`, `Subscriber`, `MediaFile`, `ApiKey`, `PageView`
- Database utility functions (queries and mutations for tenants, posts, pages)
- Composite indexes for multi-tenant queries

### Changed

### Fixed

### Removed

---

<!--
## [0.1.0] - YYYY-MM-DD

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description

### Removed
- Removed feature description
-->
