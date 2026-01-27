# Changelog

All notable changes to Pint are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [Unreleased]

### Added
- Initial project documentation (PRD, Architecture, ERD)
- Claude Code configuration (`claude.md`, `/remember` command)

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
