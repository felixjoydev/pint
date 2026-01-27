# Pint MVP - Development Plan

> **Status Legend:** ⬜ Pending | 🔄 In Progress | ✅ Done | ⏸️ Blocked

---

## Phase 0: Project Initialization

**Context:** Set up the foundational Next.js project structure, tooling, and configuration. This phase creates the skeleton upon which all other features will be built.

**Dependencies:** None (starting point)

---

### Task 0.1: Initialize Next.js Project

**Status:** ✅ Done

**Description:**
Create a new Next.js 14+ project using the App Router. Configure TypeScript in strict mode and set up the basic project structure.

**Context:**
Next.js App Router is the foundation of Pint. We use TypeScript strict mode to catch errors early and ensure type safety across the codebase. The `src/` directory pattern keeps source code organized.

**Files to Create:**
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration with strict mode
- `next.config.js` - Next.js configuration
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page placeholder

**Commands:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Verification:**
- [ ] Run `npm run dev` - Server starts without errors
- [ ] Visit `http://localhost:3000` - Page loads
- [ ] Run `npm run typecheck` - No TypeScript errors
- [ ] Verify `tsconfig.json` has `"strict": true`

---

### Task 0.2: Configure Project Structure

**Status:** ✅ Done

**Description:**
Create the folder structure defined in the architecture document. Set up route groups for auth, dashboard, and blog.

**Context:**
The folder structure follows Next.js App Router conventions. Route groups `(auth)`, `(dashboard)`, and `(blog)` allow different layouts without affecting URL structure. The `lib/`, `components/`, `hooks/`, `stores/`, and `types/` folders organize shared code.

**Dependencies:** Task 0.1

**Files to Create:**
```
src/
├── app/
│   ├── (auth)/
│   │   └── .gitkeep
│   ├── (dashboard)/
│   │   └── .gitkeep
│   ├── (blog)/
│   │   └── .gitkeep
│   └── api/
│       └── .gitkeep
├── components/
│   ├── ui/
│   │   └── .gitkeep
│   ├── editor/
│   │   └── .gitkeep
│   ├── dashboard/
│   │   └── .gitkeep
│   ├── blog/
│   │   └── .gitkeep
│   └── widgets/
│       └── .gitkeep
├── lib/
│   ├── db/
│   │   └── .gitkeep
│   ├── auth/
│   │   └── .gitkeep
│   ├── utils/
│   │   └── .gitkeep
│   └── validations/
│       └── .gitkeep
├── hooks/
│   └── .gitkeep
├── stores/
│   └── .gitkeep
└── types/
    └── index.ts
```

**Verification:**
- [ ] All directories exist
- [ ] `npm run dev` still works
- [ ] No import errors

---

### Task 0.3: Configure ESLint and Prettier

**Status:** ✅ Done

**Description:**
Set up ESLint with Next.js recommended rules and Prettier for consistent code formatting.

**Context:**
Consistent code style improves readability and reduces merge conflicts. ESLint catches potential bugs, while Prettier handles formatting automatically.

**Dependencies:** Task 0.1

**Files to Create/Modify:**
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore
- `package.json` - Add lint/format scripts

**Verification:**
- [ ] Run `npm run lint` - No errors
- [ ] Run `npm run format` - Files formatted
- [ ] VS Code shows linting errors in real-time (if configured)

---

### Task 0.4: Configure Tailwind CSS

**Status:** ✅ Done

**Description:**
Customize Tailwind CSS configuration with Pint's design tokens (colors, fonts, spacing).

**Context:**
Tailwind provides utility-first CSS. We extend the default theme with Pint's brand colors, font families, and custom spacing to maintain design consistency.

**Dependencies:** Task 0.1

**Files to Modify:**
- `tailwind.config.ts` - Theme customization
- `src/app/globals.css` - CSS variables for theming

**Theme Configuration:**
- Colors: Primary, secondary, accent, background, foreground
- Fonts: Sans (Inter), Serif (Georgia), Mono
- Spacing: Custom scale if needed

**Verification:**
- [ ] Tailwind classes work in components
- [ ] Custom colors render correctly
- [ ] CSS variables defined in `:root`

---

### Task 0.5: Set Up Environment Variables

**Status:** ✅ Done

**Description:**
Create `.env.example` with all required environment variables documented.

**Context:**
Environment variables store sensitive configuration (API keys, database URLs). The `.env.example` file documents what variables are needed without exposing actual values.

**Dependencies:** Task 0.1

**Files to Create:**
- `.env.example` - Template with all variables
- `.env.local` - Actual values (gitignored)

**Variables to Document:**
```env
# Database (Neon)
DATABASE_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Storage (Cloudflare R2)
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (Resend)
RESEND_API_KEY=

# AI
OPENAI_API_KEY=
ENCRYPTION_KEY=

# Vercel (for custom domains)
VERCEL_PROJECT_ID=
VERCEL_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Verification:**
- [ ] `.env.example` exists with all variables
- [ ] `.env.local` is in `.gitignore`
- [ ] `npm run dev` works (may show warnings for missing vars)

---

### Task 0.6: Initialize Git Repository

**Status:** ✅ Done

**Description:**
Set up Git repository with proper `.gitignore` and make initial commit.

**Context:**
Version control tracks all changes. The `.gitignore` ensures sensitive files and build artifacts aren't committed. Following the Git workflow rules from CLAUDE.md.

**Dependencies:** Tasks 0.1-0.5

**Files to Modify:**
- `.gitignore` - Ensure all necessary ignores

**Files to Ignore:**
```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Build
.next/
out/
build/

# Debug
npm-debug.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

**Commands:**
```bash
git init
git add .
git commit -m "chore: initial project setup"
```

**Verification:**
- [ ] `git status` shows clean working tree
- [ ] No sensitive files committed
- [ ] `.env.local` not in git history

---

## Phase 1: Database & ORM Setup

**Context:** Set up Neon PostgreSQL database and Prisma ORM. Create the complete database schema based on the ERD document. This provides the data layer for all features.

**Dependencies:** Phase 0 complete

---

### Task 1.1: Set Up Neon PostgreSQL

**Status:** ✅ Done

**Description:**
Create a Neon project and configure the database connection.

**Context:**
Neon is a serverless PostgreSQL provider that works well with Vercel. It offers features like database branching for development and automatic scaling.

**Dependencies:** Task 0.5 (env vars)

**Actions:**
1. Create Neon account at neon.tech
2. Create new project (region: us-east-1)
3. Copy connection string to `.env.local`
4. Enable connection pooling

**Files to Modify:**
- `.env.local` - Add DATABASE_URL

**Verification:**
- [ ] Neon dashboard shows project
- [ ] Connection string in `.env.local`
- [ ] Can connect via psql or Neon console

---

### Task 1.2: Install and Configure Prisma

**Status:** ✅ Done

**Description:**
Install Prisma CLI and client, initialize with PostgreSQL provider.

**Context:**
Prisma is a type-safe ORM that generates TypeScript types from the database schema. It provides excellent developer experience with auto-completion and type checking.

**Dependencies:** Task 1.1

**Commands:**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Files Created/Modified:**
- `prisma/schema.prisma` - Prisma schema file
- `.env` - Prisma adds DATABASE_URL (merge with .env.local)

**Files to Create:**
- `src/lib/db/prisma.ts` - Prisma client singleton

**Prisma Client Singleton:**
```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Verification:**
- [ ] `prisma/schema.prisma` exists
- [ ] Prisma client can be imported
- [ ] No TypeScript errors

---

### Task 1.3: Create Database Schema - Enums and Tenant Model

**Status:** ✅ Done

**Description:**
Define enums and the core Tenant model in Prisma schema.

**Context:**
The Tenant model is the root entity representing a blog/site. Every other model references tenant_id for multi-tenancy. Enums ensure type safety for status fields.

**Dependencies:** Task 1.2

**Files to Modify:**
- `prisma/schema.prisma`

**Schema:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Tier {
  free
  pro
  max
  lifetime
}

enum PostStatus {
  draft
  published
}

enum PageStatus {
  draft
  published
}

enum WallOfLoveStatus {
  pending
  approved
  rejected
}

model Tenant {
  id                   String    @id @default(uuid())
  subdomain            String    @unique
  customDomain         String?   @unique @map("custom_domain")
  settings             Json      @default("{}")
  tier                 Tier      @default(free)
  stripeCustomerId     String?   @unique @map("stripe_customer_id")
  stripeSubscriptionId String?   @map("stripe_subscription_id")
  blogPassword         String?   @map("blog_password")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  // Relations
  users       User[]
  posts       Post[]
  pages       Page[]
  widgets     Widget[]
  wallOfLove  WallOfLove[]
  subscribers Subscriber[]
  mediaFiles  MediaFile[]
  apiKeys     ApiKey[]
  pageViews   PageView[]

  @@map("tenants")
}
```

**Verification:**
- [ ] Schema parses without errors: `npx prisma validate`
- [ ] Enums defined correctly

---

### Task 1.4: Create Database Schema - User and Post Models

**Status:** ✅ Done

**Description:**
Add User and Post models to Prisma schema.

**Context:**
User links Clerk authentication to our database. Post stores blog content with Tiptap JSON. Both models have tenant_id for multi-tenancy.

**Dependencies:** Task 1.3

**Files to Modify:**
- `prisma/schema.prisma`

**Schema Addition:**
```prisma
model User {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  clerkId   String   @unique @map("clerk_id")
  email     String
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("users")
}

model Post {
  id            String     @id @default(uuid())
  tenantId      String     @map("tenant_id")
  slug          String
  title         String
  content       Json
  excerpt       String?
  featuredImage String?    @map("featured_image")
  status        PostStatus @default(draft)
  password      String?
  publishedAt   DateTime?  @map("published_at")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  likes  Like[]

  @@unique([tenantId, slug])
  @@index([tenantId, status])
  @@index([tenantId, publishedAt])
  @@map("posts")
}
```

**Verification:**
- [ ] `npx prisma validate` passes
- [ ] User and Post models defined

---

### Task 1.5: Create Database Schema - Page and Widget Models

**Status:** ✅ Done

**Description:**
Add Page and Widget models to Prisma schema.

**Context:**
Page stores static content (About, Contact, etc.). Widget stores floating widget configurations (theme switcher, music player, etc.).

**Dependencies:** Task 1.4

**Files to Modify:**
- `prisma/schema.prisma`

**Schema Addition:**
```prisma
model Page {
  id        String     @id @default(uuid())
  tenantId  String     @map("tenant_id")
  slug      String
  title     String
  content   Json
  showInNav Boolean    @default(true) @map("show_in_nav")
  navOrder  Int?       @map("nav_order")
  status    PageStatus @default(draft)
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  pageViews PageView[]

  @@unique([tenantId, slug])
  @@index([tenantId, status])
  @@map("pages")
}

model Widget {
  id           String  @id @default(uuid())
  tenantId     String  @map("tenant_id")
  type         String
  enabled      Boolean @default(false)
  config       Json    @default("{}")
  displayOrder Int     @default(0) @map("display_order")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("widgets")
}
```

**Verification:**
- [ ] `npx prisma validate` passes
- [ ] Page and Widget models defined

---

### Task 1.6: Create Database Schema - Engagement Models

**Status:** ✅ Done

**Description:**
Add Like, WallOfLove, and Subscriber models to Prisma schema.

**Context:**
Like tracks post reactions (anonymous via IP hash). WallOfLove stores reader testimonials for moderation. Subscriber stores newsletter signups.

**Dependencies:** Task 1.5

**Files to Modify:**
- `prisma/schema.prisma`

**Schema Addition:**
```prisma
model Like {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  ipHash    String   @map("ip_hash")
  createdAt DateTime @default(now()) @map("created_at")

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, ipHash])
  @@index([postId])
  @@map("likes")
}

model WallOfLove {
  id        String            @id @default(uuid())
  tenantId  String            @map("tenant_id")
  name      String
  email     String
  message   String
  avatarUrl String?           @map("avatar_url")
  status    WallOfLoveStatus  @default(pending)
  createdAt DateTime          @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@map("wall_of_love")
}

model Subscriber {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  email     String
  verified  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("subscribers")
}
```

**Verification:**
- [ ] `npx prisma validate` passes
- [ ] Like, WallOfLove, Subscriber models defined

---

### Task 1.7: Create Database Schema - Media and API Key Models

**Status:** ✅ Done

**Description:**
Add MediaFile and ApiKey models to Prisma schema.

**Context:**
MediaFile tracks uploaded images/audio files. ApiKey stores encrypted BYOK API keys for AI features (Lifetime tier).

**Dependencies:** Task 1.6

**Files to Modify:**
- `prisma/schema.prisma`

**Schema Addition:**
```prisma
model MediaFile {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  filename  String
  url       String
  size      Int
  mimeType  String   @map("mime_type")
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("media_files")
}

model ApiKey {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  provider     String
  encryptedKey String   @map("encrypted_key")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, provider])
  @@index([tenantId])
  @@map("api_keys")
}
```

**Verification:**
- [ ] `npx prisma validate` passes
- [ ] MediaFile and ApiKey models defined

---

### Task 1.8: Create Database Schema - PageView Model

**Status:** ✅ Done

**Description:**
Add PageView model for analytics tracking.

**Context:**
PageView stores privacy-friendly analytics data (views, referrers, country). Links to both posts and pages for tracking.

**Dependencies:** Task 1.7

**Files to Modify:**
- `prisma/schema.prisma`

**Schema Addition:**
```prisma
model PageView {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  postId    String?  @map("post_id")
  pageId    String?  @map("page_id")
  path      String
  referrer  String?
  country   String?
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  post   Post?  @relation(fields: [postId], references: [id], onDelete: SetNull)
  page   Page?  @relation(fields: [pageId], references: [id], onDelete: SetNull)

  @@index([tenantId, createdAt])
  @@index([postId])
  @@index([pageId])
  @@map("page_views")
}

// Update Post model to include pageViews relation
// (Add this to existing Post model)
// pageViews PageView[]
```

**Verification:**
- [ ] `npx prisma validate` passes
- [ ] PageView model defined
- [ ] All relations correctly defined

---

### Task 1.9: Run Initial Migration

**Status:** ✅ Done

**Description:**
Push the schema to Neon database and generate Prisma client.

**Context:**
`prisma db push` syncs the schema to the database. `prisma generate` creates the TypeScript client with full type safety.

**Dependencies:** Tasks 1.3-1.8

**Commands:**
```bash
npx prisma db push
npx prisma generate
```

**Verification:**
- [ ] Database tables created (check Neon dashboard)
- [ ] `node_modules/.prisma/client` generated
- [ ] Can import `PrismaClient` without errors
- [ ] Test query works:
  ```typescript
  import { prisma } from '@/lib/db/prisma'
  const tenants = await prisma.tenant.findMany()
  ```

---

### Task 1.10: Create Database Utility Functions

**Status:** ✅ Done

**Description:**
Create helper functions for common database operations.

**Context:**
Utility functions encapsulate common patterns like tenant-scoped queries, preventing accidental cross-tenant data access.

**Dependencies:** Task 1.9

**Files to Create:**
- `src/lib/db/queries/tenants.ts` - Tenant queries
- `src/lib/db/queries/posts.ts` - Post queries
- `src/lib/db/queries/pages.ts` - Page queries
- `src/lib/db/mutations/posts.ts` - Post mutations
- `src/lib/db/mutations/pages.ts` - Page mutations

**Example (posts.ts):**
```typescript
// src/lib/db/queries/posts.ts
import { prisma } from '../prisma'
import { PostStatus } from '@prisma/client'

export async function getPostsByTenant(tenantId: string, status?: PostStatus) {
  return prisma.post.findMany({
    where: {
      tenantId,
      ...(status && { status }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPostBySlug(tenantId: string, slug: string) {
  return prisma.post.findUnique({
    where: {
      tenantId_slug: { tenantId, slug },
    },
  })
}
```

**Verification:**
- [ ] All utility files created
- [ ] Functions are properly typed
- [ ] Test a query function

---

## Phase 2: Authentication (Clerk)

**Context:** Integrate Clerk for authentication. Set up webhooks to sync users with our database and create tenants on signup.

**Dependencies:** Phase 1 complete

---

### Task 2.1: Create Clerk Application

**Status:** ✅ Done

**Description:**
Set up Clerk application in their dashboard and configure authentication methods.

**Context:**
Clerk handles authentication, including email/password and OAuth. We configure sign-up to collect username for subdomain generation.

**Dependencies:** Phase 1

**Actions:**
1. Create Clerk account at clerk.com
2. Create new application
3. Enable sign-up methods: Email + Google OAuth
4. Configure email verification
5. Copy API keys to `.env.local`

**Environment Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Verification:**
- [ ] Clerk dashboard shows application
- [ ] API keys in `.env.local`
- [ ] Email and Google OAuth enabled

---

### Task 2.2: Install and Configure Clerk SDK

**Status:** ✅ Done

**Description:**
Install `@clerk/nextjs` and configure the application.

**Context:**
The Clerk SDK provides components and middleware for authentication in Next.js. We wrap the app with ClerkProvider for global auth state.

**Dependencies:** Task 2.1

**Commands:**
```bash
npm install @clerk/nextjs
```

**Files to Modify:**
- `src/app/layout.tsx` - Wrap with ClerkProvider

**Files to Create:**
- `src/middleware.ts` - Clerk middleware

**Layout Update:**
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Verification:**
- [ ] No import errors
- [ ] App still renders
- [ ] Clerk provider active

---

### Task 2.3: Create Authentication Middleware

**Status:** ✅ Done

**Description:**
Set up Next.js middleware with Clerk for route protection.

**Context:**
Middleware runs before every request. We use it to protect dashboard routes and extract tenant context from subdomains.

**Dependencies:** Task 2.2

**Files to Create:**
- `src/middleware.ts`

**Middleware Code:**
```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/blog(.*)',
  '/rss.xml',
  '/sitemap.xml',
  '/robots.txt',
  '/api/webhooks(.*)',
  '/api/likes(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**Verification:**
- [ ] Dashboard routes redirect to sign-in when not authenticated
- [ ] Public routes accessible without auth
- [ ] No middleware errors in console

---

### Task 2.4: Create Auth Pages

**Status:** ✅ Done

**Description:**
Create sign-in and sign-up pages using Clerk components.

**Context:**
Clerk provides pre-built UI components for authentication. We customize them to match Pint's design.

**Dependencies:** Task 2.3

**Files to Create:**
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `src/app/(auth)/layout.tsx`

**Sign-In Page:**
```typescript
// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
```

**Verification:**
- [ ] `/sign-in` page renders
- [ ] `/sign-up` page renders
- [ ] Can complete sign-up flow
- [ ] Redirects to dashboard after sign-in

---

### Task 2.5: Set Up Clerk Webhook

**Status:** ✅ Done

**Description:**
Create webhook endpoint to handle Clerk events (user created, deleted).

**Context:**
When a user signs up via Clerk, we need to create a corresponding Tenant and User in our database. Webhooks notify us of these events.

**Dependencies:** Task 2.4

**Actions:**
1. Configure webhook in Clerk dashboard
2. Add webhook secret to `.env.local`
3. Create webhook handler

**Files to Create:**
- `src/app/api/webhooks/clerk/route.ts`

**Webhook Handler:**
```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    // Handle in next task
  }

  if (evt.type === 'user.deleted') {
    // Handle in next task
  }

  return new Response('OK', { status: 200 })
}
```

**Commands:**
```bash
npm install svix
```

**Verification:**
- [ ] Webhook endpoint exists
- [ ] Clerk webhook configured (check Clerk dashboard)
- [ ] Test webhook in Clerk dashboard shows success

---

### Task 2.6: Handle User Created Webhook

**Status:** ✅ Done

**Description:**
Implement user.created webhook handler to create tenant and user.

**Context:**
When someone signs up, we automatically create their blog (tenant) with a subdomain based on their username/email, and link their Clerk account to our user record.

**Dependencies:** Task 2.5

**Files to Modify:**
- `src/app/api/webhooks/clerk/route.ts`

**Handler Code:**
```typescript
if (evt.type === 'user.created') {
  const { id, email_addresses, username } = evt.data
  const email = email_addresses[0]?.email_address

  if (!email) {
    return new Response('No email', { status: 400 })
  }

  // Generate subdomain from username or email
  const subdomain = username || email.split('@')[0]
  const cleanSubdomain = subdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30)

  await prisma.$transaction(async (tx) => {
    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        subdomain: cleanSubdomain,
        tier: 'free',
        settings: {
          title: `${cleanSubdomain}'s Blog`,
          description: '',
        },
      },
    })

    // Create user
    await tx.user.create({
      data: {
        tenantId: tenant.id,
        clerkId: id,
        email: email,
      },
    })

    // Create default widgets
    await tx.widget.createMany({
      data: [
        { tenantId: tenant.id, type: 'theme_switcher', enabled: true, displayOrder: 1 },
        { tenantId: tenant.id, type: 'font_customizer', enabled: true, displayOrder: 2 },
        { tenantId: tenant.id, type: 'music_player', enabled: false, displayOrder: 3 },
      ],
    })
  })
}
```

**Verification:**
- [ ] Sign up creates tenant in database
- [ ] Sign up creates user in database
- [ ] Default widgets created
- [ ] Subdomain generated correctly

---

### Task 2.7: Handle User Deleted Webhook

**Status:** ✅ Done

**Description:**
Implement user.deleted webhook handler to clean up data.

**Context:**
When a user deletes their Clerk account, we delete their tenant and all associated data (posts, pages, etc.). Prisma's onDelete: Cascade handles related records.

**Dependencies:** Task 2.6

**Files to Modify:**
- `src/app/api/webhooks/clerk/route.ts`

**Handler Code:**
```typescript
if (evt.type === 'user.deleted') {
  const { id } = evt.data

  const user = await prisma.user.findUnique({
    where: { clerkId: id },
    select: { tenantId: true },
  })

  if (user) {
    // Delete tenant (cascades to all related data)
    await prisma.tenant.delete({
      where: { id: user.tenantId },
    })
  }
}
```

**Verification:**
- [ ] Deleting Clerk user removes tenant
- [ ] All related data (posts, pages, widgets) deleted
- [ ] No orphaned records

---

### Task 2.8: Create Auth Utility Functions

**Status:** ✅ Done

**Description:**
Create helper functions for getting current user and tenant.

**Context:**
These utilities are used throughout the app to get the authenticated user's tenant context for database queries.

**Dependencies:** Task 2.7

**Files to Create:**
- `src/lib/auth/tenant.ts`
- `src/lib/auth/permissions.ts`

**Tenant Helper:**
```typescript
// src/lib/auth/tenant.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function getCurrentTenant() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { tenant: true },
  })

  return user?.tenant || null
}

export async function requireTenant() {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    throw new Error('Not authenticated')
  }

  return tenant
}
```

**Verification:**
- [ ] `getCurrentTenant()` returns tenant for authenticated user
- [ ] `requireTenant()` throws for unauthenticated users
- [ ] Tenant includes all fields

---

## Phase 3: Multi-Tenancy & Routing

**Context:** Implement subdomain-based multi-tenancy. Users get `{subdomain}.pint.im` URLs. The middleware handles routing, tenant resolution, and onboarding redirects.

**Dependencies:** Phase 2 complete

---

### Task 3.1: Create Tenant Resolution Utilities

**Status:** ✅ Done

**Description:**
Create utility functions for resolving tenants from subdomains and custom domains. These are used by middleware and server components.

**Files Created:**
- `src/lib/tenant/constants.ts` - Reserved subdomains list, ROOT_DOMAIN config
- `src/lib/tenant/resolve.ts` - Tenant resolution functions
- `src/lib/tenant/index.ts` - Exports

**Key Functions:**
- `extractSubdomain(hostname)` - Parses subdomain from hostname
- `resolveTenantFromSubdomain(subdomain)` - Database lookup for tenant
- `resolveTenantFromCustomDomain(domain)` - Custom domain resolution
- `resolveTenant(hostname)` - Combined resolution
- `isSubdomainValid(subdomain)` - Format validation
- `checkSubdomainAvailability(subdomain)` - DB availability check

---

### Task 3.2: Update Middleware for Subdomain Routing

**Status:** ✅ Done

**Description:**
Update the existing Clerk middleware to handle subdomain-based routing, set tenant context in headers, and handle onboarding redirects.

**Files Modified:**
- `src/middleware.ts` - Added subdomain routing logic
- `.env.example` - Added `NEXT_PUBLIC_ROOT_DOMAIN`

**Features:**
- Subdomain extraction from hostname
- Development fallback via `?subdomain=` query param
- URL rewriting to `/(blog)/[subdomain]/...`
- API routes exempted from subdomain rewriting
- `x-tenant-subdomain` header for downstream use

---

### Task 3.3: Create Onboarding Page & Form

**Status:** ✅ Done

**Description:**
Create the onboarding page where new users set up their blog (name and subdomain).

**Files Created:**
- `src/lib/validations/onboarding.ts` - Zod schema for validation
- `src/components/onboarding/onboarding-form.tsx` - React Hook Form client component
- `src/app/(dashboard)/onboarding/page.tsx` - Onboarding page

**Features:**
- Blog name input (2-50 chars)
- Subdomain input with validation (3-30 chars, alphanumeric + hyphens)
- Real-time availability check (debounced)
- URL preview (e.g., "https://myblog.pint.im")
- Reserved subdomain validation

---

### Task 3.4: Create Onboarding API

**Status:** ✅ Done

**Description:**
Create API endpoints for checking subdomain availability and completing onboarding.

**Files Created:**
- `src/app/api/onboarding/check-subdomain/route.ts` - GET endpoint
- `src/app/api/onboarding/complete/route.ts` - POST endpoint

**Endpoints:**
- `GET /api/onboarding/check-subdomain?subdomain=x` - Returns `{ available: boolean }`
- `POST /api/onboarding/complete` - Creates tenant, links user, creates default widgets

---

### Task 3.5: Create Public Blog Route Structure

**Status:** ✅ Done

**Description:**
Create the route structure for public blog pages that will be rendered for subdomain requests.

**Files Created:**
- `src/app/(blog)/layout.tsx` - Root blog layout
- `src/app/(blog)/[subdomain]/layout.tsx` - Tenant resolution, 404 handling
- `src/app/(blog)/[subdomain]/page.tsx` - Blog home (post list)
- `src/app/(blog)/[subdomain]/[slug]/page.tsx` - Individual post page

**Files Modified:**
- `src/lib/db/queries/posts.ts` - Added select fields to `getPublishedPostsByTenant`

---

### Task 3.6: Add Redirect Logic for Onboarding

**Status:** ✅ Done

**Description:**
Complete the redirect logic to ensure:
- Non-onboarded users are redirected to `/onboarding`
- Onboarded users at `/onboarding` are redirected to `/dashboard`

**Files Created:**
- `src/app/api/auth/onboarding-status/route.ts` - Onboarding status endpoint

**Files Modified:**
- `src/middleware.ts` - Added `/api/onboarding(.*)` and `/api/auth(.*)` to public routes
- `src/app/(dashboard)/dashboard/page.tsx` - Added onboarding check and redirect

---

## Phase 4: Core API Routes

**Context:** Implement CRUD API routes for posts, pages, widgets, and settings. Create Zod validation schemas, standardized error handling, slug generation, and comprehensive test coverage.

**Dependencies:** Phase 3 complete

**Branch:** `feature/core-api-routes`

---

### Task 4.0: Test Setup (Prerequisites)

**Status:** ✅ Done

**Description:**
Set up Vitest testing framework with mocks for Clerk auth and Prisma client.

**Files Created:**
- `vitest.config.ts` - Vitest configuration with path aliases
- `src/test/setup.ts` - Test setup file with Clerk mocks
- `src/test/utils.ts` - Test utilities (mock tenant, mock user, mock prisma)

**Scripts Added:**
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

---

### Task 4.1: Zod Validation Schemas

**Status:** ✅ Done

**Description:**
Create Zod validation schemas for all API inputs (posts, pages, widgets, settings).

**Files Created:**
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

### Task 4.2: API Error Handling

**Status:** ✅ Done

**Description:**
Create standardized error handling with custom error classes and response utilities.

**Files Created:**
- `src/lib/api/errors.ts` - ApiError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, TierLimitError, PostLimitError
- `src/lib/api/response.ts` - successResponse, createdResponse, noContentResponse, errorResponse, handleApiError
- `src/lib/api/__tests__/errors.test.ts`
- `src/lib/api/__tests__/response.test.ts`

**Tests:** 30 passing

---

### Task 4.3: Slug Generation

**Status:** ✅ Done

**Description:**
Create URL-safe slug generation with uniqueness enforcement per tenant.

**Files Created:**
- `src/lib/utils/slug.ts` - generateSlug, ensureUniquePostSlug, ensureUniquePageSlug
- `src/lib/utils/__tests__/slug.test.ts`

**Tests:** 28 passing

---

### Task 4.4-4.6: Posts API

**Status:** ✅ Done

**Description:**
Implement full CRUD for posts with publish/unpublish actions and tier-based limits.

**Files Created:**
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

### Task 4.7-4.8: Pages API

**Status:** ✅ Done

**Description:**
Implement full CRUD for static pages with nav order management.

**Files Created:**
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

### Task 4.9: Widgets API

**Status:** ✅ Done

**Description:**
Implement widget listing and ordering APIs with bulk update support.

**Files Created:**
- `src/app/api/widgets/route.ts` - GET (list), PATCH (bulk order update)
- `src/app/api/widgets/[id]/route.ts` - PATCH (single update)
- `src/app/api/widgets/__tests__/route.test.ts`
- `src/app/api/widgets/[id]/__tests__/route.test.ts`

**Features:**
- List widgets ordered by displayOrder
- Bulk update widget order with $transaction
- Update single widget enabled/config/displayOrder
- Tenant isolation for all operations

**Tests:** 15 passing

---

### Task 4.10: Settings API

**Status:** ✅ Done

**Description:**
Implement tenant settings GET and PATCH with tier-based restrictions.

**Files Created:**
- `src/app/api/settings/route.ts` - GET, PATCH
- `src/app/api/settings/__tests__/route.test.ts`

**Features:**
- Get current tenant settings
- Update settings with merge
- Tier-based restrictions (SEO settings require Pro+)
- Returns tier with settings for client-side feature checks

**Tests:** 14 passing

---

### Phase 4 Summary

**API Endpoints Implemented:**
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

**Test Results:**
- 15 test files
- 202 tests passing
- TypeScript: ✅ No errors
- ESLint: ✅ No errors

---

## Phase 5-17: [Additional Phases]

> **Note:** Phases 5-17 follow the same detailed structure. Each task includes:
> - Status marker
> - Description
> - Context explaining why
> - Dependencies
> - Files to create/modify
> - Verification steps

**Remaining Phases:**
- Phase 5: Media Storage (Cloudflare R2)
- Phase 6: UI Component Library
- Phase 7: Tiptap Editor
- Phase 8: Dashboard
- Phase 9: Public Blog
- Phase 10: Widgets System
- Phase 11: Reader Engagement
- Phase 12: Payments (Stripe)
- Phase 13: AI Features
- Phase 14: Import/Export
- Phase 15: Email (Resend)
- Phase 16: Testing
- Phase 17: Production & Monitoring

*Tasks for these phases will be expanded as we progress through earlier phases.*

---

## Quick Reference

### Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
npx prisma db push   # Push schema to database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open Prisma Studio
```

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Never commit `.env.local`

### Git Workflow
- Branch: `feature/<name>`, `fix/<name>`
- Commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Never push directly to `main`

---

*Last Updated: January 2026*
