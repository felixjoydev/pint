# Pint - Technical Architecture Documentation

**Version:** 1.0
**Date:** January 2026
**Status:** Draft

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Architecture](#6-database-architecture)
7. [Multi-Tenancy Implementation](#7-multi-tenancy-implementation)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [API Design](#9-api-design)
10. [Media & File Storage](#10-media--file-storage)
11. [Caching Strategy](#11-caching-strategy)
12. [AI Integration](#12-ai-integration)
13. [Real-Time Features](#13-real-time-features)
14. [Payment Integration](#14-payment-integration)
15. [Email System](#15-email-system)
16. [Security Architecture](#16-security-architecture)
17. [Infrastructure & Deployment](#17-infrastructure--deployment)
18. [Monitoring & Observability](#18-monitoring--observability)
19. [Performance Optimization](#19-performance-optimization)
20. [Scalability Considerations](#20-scalability-considerations)
21. [Disaster Recovery](#21-disaster-recovery)
22. [Development Workflow](#22-development-workflow)

---

## 1. System Overview

### 1.1 What is Pint?

Pint is a multi-tenant blogging platform built with:
- **Next.js 14+** (App Router) for full-stack React
- **Neon** (Serverless PostgreSQL) for data persistence
- **Clerk** for authentication
- **Vercel** for hosting and edge functions
- **Cloudflare R2 + Workers** for media storage and processing

### 1.2 Key Technical Characteristics

| Characteristic | Implementation |
|----------------|----------------|
| Architecture | Serverless-first, edge-optimized |
| Multi-tenancy | Shared database with tenant_id isolation + RLS |
| Rendering | Hybrid (SSG + ISR + CSR) |
| API Style | REST with Next.js API Routes |
| State Management | Server-first, minimal client state |
| Styling | Tailwind CSS + Radix Primitives |

### 1.3 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SYSTEMS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐   │
│  │  Clerk  │  │ Stripe  │  │ Resend  │  │OpenRouter│  │ Cloudflare R2  │   │
│  │  Auth   │  │Payments │  │  Email  │  │   AI    │  │  Media Storage │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘   │
│       │            │            │            │                 │            │
└───────┼────────────┼────────────┼────────────┼─────────────────┼────────────┘
        │            │            │            │                 │
        └────────────┴────────────┴─────┬──────┴─────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                PINT PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         VERCEL EDGE NETWORK                          │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐  │   │
│  │  │  Edge Caching  │  │ Domain Routing │  │    SSL Termination     │  │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        NEXT.JS APPLICATION                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   App       │  │    API      │  │  Middleware │  │   Server    │  │   │
│  │  │   Router    │  │   Routes    │  │  (Tenant)   │  │  Components │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA LAYER                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │   │
│  │  │  Neon Postgres  │  │   Vercel KV     │  │  Cloudflare R2      │   │   │
│  │  │   (Primary DB)  │  │  (Cache/Rate)   │  │  (Media Storage)    │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Creators   │  │  Readers    │  │ RSS Readers │  │   Search Engines    │ │
│  │ (Dashboard) │  │ (Blogs)     │  │ (Feeds)     │  │   (Crawlers)        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

### 2.1 Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Serverless-First** | No servers to manage, auto-scaling | Vercel Functions, Neon Serverless |
| **Edge-Optimized** | Compute and cache at the edge | Vercel Edge, ISR, Cloudflare |
| **Tenant Isolation** | Strong data boundaries | RLS, tenant_id filtering, middleware |
| **Cost Efficiency** | Pay for what you use | Serverless pricing, R2 no egress |
| **Developer Experience** | Fast iteration, type safety | TypeScript, Prisma, hot reload |
| **Progressive Enhancement** | Works without JS, enhanced with | Server Components, hydration |

### 2.2 Technical Constraints

- **No WebSockets** (for MVP) - Simplifies architecture, uses HTTP polling where needed
- **No Background Jobs** (for MVP) - All operations synchronous or edge-triggered
- **Single Region DB** (for MVP) - Neon primary in us-east-1, read replicas later
- **No Self-Hosting** - Vercel-optimized, not designed for self-hosting

### 2.3 Decision Records

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Neon over Supabase | Separation of concerns, better Prisma support | No built-in auth/realtime |
| Clerk over NextAuth | Managed service, faster development | Vendor dependency, cost at scale |
| R2 over S3 | No egress fees, Cloudflare ecosystem | Slightly less mature |
| Vercel KV over Upstash | Tighter integration, simpler billing | Vercel lock-in |

---

## 3. High-Level Architecture

### 3.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  React Server Components │ Client Components │ Layouts │ Pages          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  API Routes │ Server Actions │ Middleware │ Validation │ Business Logic ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Entities │ Value Objects │ Domain Services │ Repository Interfaces     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Prisma ORM │ Clerk SDK │ Stripe SDK │ R2 Client │ Resend │ AI SDK     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PostgreSQL (Neon) │ Redis (Vercel KV) │ Object Storage (R2)           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow

```
┌──────────┐    ┌───────────┐    ┌────────────┐    ┌──────────┐    ┌────────┐
│  Client  │───▶│  Vercel   │───▶│ Middleware │───▶│  Route   │───▶│  DB    │
│          │    │   Edge    │    │  (Tenant)  │    │ Handler  │    │        │
└──────────┘    └───────────┘    └────────────┘    └──────────┘    └────────┘
     │               │                 │                │              │
     │               │                 │                │              │
     │  1. Request   │                 │                │              │
     │──────────────▶│                 │                │              │
     │               │  2. SSL/Cache   │                │              │
     │               │────────────────▶│                │              │
     │               │                 │  3. Resolve    │              │
     │               │                 │     Tenant     │              │
     │               │                 │───────────────▶│              │
     │               │                 │                │  4. Query    │
     │               │                 │                │─────────────▶│
     │               │                 │                │              │
     │               │                 │                │  5. Data     │
     │               │                 │                │◀─────────────│
     │               │                 │  6. Response   │              │
     │◀──────────────│◀────────────────│◀───────────────│              │
     │               │                 │                │              │
```

---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup)
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Creator dashboard
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Dashboard home
│   │   ├── posts/
│   │   │   ├── page.tsx          # Posts list
│   │   │   ├── new/
│   │   │   └── [slug]/
│   │   ├── pages/
│   │   ├── settings/
│   │   ├── widgets/
│   │   └── analytics/
│   ├── (blog)/                   # Public blog routes
│   │   ├── [[...slug]]/          # Catch-all for blog pages
│   │   └── blog/[slug]/          # Individual posts
│   ├── api/                      # API routes
│   │   ├── posts/
│   │   ├── pages/
│   │   ├── widgets/
│   │   ├── likes/
│   │   ├── upload/
│   │   ├── ai/
│   │   └── webhooks/
│   ├── layout.tsx                # Root layout
│   └── not-found.tsx
├── components/
│   ├── ui/                       # Base UI components (Radix-based)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   └── ...
│   ├── editor/                   # Tiptap editor components
│   │   ├── editor.tsx
│   │   ├── toolbar.tsx
│   │   ├── slash-command.tsx
│   │   └── extensions/
│   ├── dashboard/                # Dashboard-specific components
│   ├── blog/                     # Blog-specific components
│   └── widgets/                  # Widget components
│       ├── widget-container.tsx
│       ├── music-player.tsx
│       ├── theme-switcher.tsx
│       └── font-customizer.tsx
├── lib/
│   ├── db/                       # Database utilities
│   │   ├── prisma.ts
│   │   ├── queries/
│   │   └── mutations/
│   ├── auth/                     # Auth utilities
│   ├── api/                      # API client utilities
│   ├── utils/                    # General utilities
│   └── validations/              # Zod schemas
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores
├── types/                        # TypeScript types
└── styles/                       # Global styles
```

### 4.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Page Components                              │    │
│  │  (Server Components - fetch data, minimal client JS)                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │  Dashboard  │  │  BlogPage   │  │  PostPage   │                  │    │
│  │  │    Page     │  │             │  │             │                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       Feature Components                             │    │
│  │  (Mix of Server + Client Components)                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Editor    │  │  PostList   │  │  Settings   │                  │    │
│  │  │  (Client)   │  │  (Server)   │  │   Form      │                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          UI Components                               │    │
│  │  (Radix Primitives + Custom Styling)                                 │    │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │    │
│  │  │Button │ │Dialog │ │Input  │ │Select │ │Toast  │ │...    │       │    │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 State Management

| State Type | Solution | Use Case |
|------------|----------|----------|
| Server State | React Server Components | Initial data, SEO-critical content |
| URL State | Next.js searchParams | Filters, pagination, tabs |
| Form State | React Hook Form | Form inputs, validation |
| UI State | Zustand | Modals, sidebars, toasts |
| Persisted Local | localStorage | Reader preferences (theme, font) |

**Zustand Store Example:**

```typescript
// stores/ui.ts
interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}))
```

### 4.4 Editor Architecture (Tiptap)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TIPTAP EDITOR                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Editor Instance                              │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │                     ProseMirror Core                           │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          Extensions                                  │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │StarterKit│ │ Image  │ │  Link   │ │CodeBlock│ │  Video  │       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │    │
│  │  │Placeholder│ │SlashCmd│ │Highlight│ │ Custom │                   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         UI Components                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│  │  │   Toolbar   │  │ Slash Menu  │  │   Bubble Menu (Selection)   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Output: JSON                                 │    │
│  │  {                                                                   │    │
│  │    "type": "doc",                                                    │    │
│  │    "content": [                                                      │    │
│  │      { "type": "heading", "attrs": { "level": 1 }, ... },           │    │
│  │      { "type": "paragraph", "content": [...] },                      │    │
│  │      { "type": "image", "attrs": { "src": "...", "alt": "..." } }   │    │
│  │    ]                                                                 │    │
│  │  }                                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Backend Architecture

### 5.1 API Routes Structure

```
app/api/
├── posts/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [id]/
│       └── route.ts              # GET, PATCH, DELETE
├── pages/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── widgets/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── likes/
│   └── [postId]/
│       └── route.ts              # POST (toggle), GET (count)
├── upload/
│   └── route.ts                  # POST (get signed URL)
├── ai/
│   ├── check/
│   │   └── route.ts              # POST (writing checks)
│   └── assist/
│       └── route.ts              # POST (writing assistance)
├── import/
│   └── route.ts                  # POST (import content)
├── export/
│   └── route.ts                  # GET (export content)
├── analytics/
│   └── route.ts                  # GET (analytics data)
└── webhooks/
    ├── clerk/
    │   └── route.ts              # Clerk webhooks
    └── stripe/
        └── route.ts              # Stripe webhooks
```

### 5.2 API Handler Pattern

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { getTenantId } from '@/lib/auth/tenant'

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.any(), // Tiptap JSON
  status: z.enum(['draft', 'published']).default('draft'),
})

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createPostSchema.parse(body)

    // Check post limit for free tier
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (tenant?.tier === 'free') {
      const postCount = await prisma.post.count({
        where: { tenantId, status: 'published' },
      })
      if (postCount >= 50) {
        return NextResponse.json(
          { error: 'Free tier limited to 50 posts' },
          { status: 403 }
        )
      }
    }

    const post = await prisma.post.create({
      data: {
        ...validated,
        tenantId,
        slug: generateSlug(validated.title),
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### 5.3 Middleware Architecture

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/blog/(.*)',
  '/rss.xml',
  '/api/webhooks/(.*)',
])

const isDashboardRoute = createRouteMatcher(['/dashboard/(.*)'])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth()

  // Handle subdomain routing
  const hostname = request.headers.get('host') || ''
  const subdomain = extractSubdomain(hostname)

  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    // This is a tenant blog request
    const url = request.nextUrl.clone()
    url.pathname = `/blog/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Protect dashboard routes
  if (isDashboardRoute(request) && !userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add tenant context to headers for downstream use
  const response = NextResponse.next()
  if (subdomain) {
    response.headers.set('x-tenant-subdomain', subdomain)
  }

  return response
})

function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split('.')
  if (parts.length >= 3 && parts[parts.length - 2] === 'pint') {
    return parts[0]
  }
  return null
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

---

## 6. Database Architecture

### 6.1 Prisma Schema Overview

```prisma
// prisma/schema.prisma

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
  id            String    @id @default(uuid())
  subdomain     String    @unique
  customDomain  String?   @unique @map("custom_domain")
  settings      Json      @default("{}")
  tier          Tier      @default(free)

  // Stripe
  stripeCustomerId     String?  @unique @map("stripe_customer_id")
  stripeSubscriptionId String?  @map("stripe_subscription_id")

  // Password protection
  blogPassword  String?   @map("blog_password")

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  users         User[]
  posts         Post[]
  pages         Page[]
  widgets       Widget[]
  wallOfLove    WallOfLove[]
  subscribers   Subscriber[]
  mediaFiles    MediaFile[]
  apiKeys       ApiKey[]

  @@map("tenants")
}

model User {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  clerkId   String   @unique @map("clerk_id")
  email     String

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

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
  password      String?    // Per-post password protection

  publishedAt   DateTime?  @map("published_at")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  // Relations
  tenant        Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  likes         Like[]

  @@unique([tenantId, slug])
  @@index([tenantId, status])
  @@index([tenantId, publishedAt])
  @@map("posts")
}

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

  // Relations
  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)

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

  // Relations
  tenant       Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("widgets")
}

model Like {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  ipHash    String   @map("ip_hash")

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, ipHash])
  @@map("likes")
}

model WallOfLove {
  id        String            @id @default(uuid())
  tenantId  String            @map("tenant_id")
  name      String
  email     String
  message   String
  status    WallOfLoveStatus  @default(pending)

  createdAt DateTime          @default(now()) @map("created_at")

  // Relations
  tenant    Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@map("wall_of_love")
}

model Subscriber {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  email     String
  verified  Boolean  @default(false)

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
  @@map("subscribers")
}

model MediaFile {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  filename  String
  url       String
  size      Int
  mimeType  String   @map("mime_type")

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("media_files")
}

model ApiKey {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  provider     String   // 'openai', 'anthropic', 'openrouter'
  encryptedKey String   @map("encrypted_key")

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, provider])
  @@map("api_keys")
}

model PageView {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  postId    String?  @map("post_id")
  pageId    String?  @map("page_id")
  path      String
  referrer  String?
  country   String?

  createdAt DateTime @default(now()) @map("created_at")

  @@index([tenantId, createdAt])
  @@index([postId])
  @@map("page_views")
}
```

### 6.2 Row-Level Security (RLS)

While Prisma doesn't directly support RLS, we implement tenant isolation at the application layer:

```typescript
// lib/db/tenant-context.ts
import { prisma } from './prisma'

export function createTenantPrisma(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId }
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
      },
    },
  })
}
```

For additional security, add PostgreSQL RLS policies directly:

```sql
-- Enable RLS on tenant-owned tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Create policy (requires setting tenant context via SET app.current_tenant)
CREATE POLICY tenant_isolation ON posts
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## 7. Multi-Tenancy Implementation

### 7.1 Tenant Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TENANT RESOLUTION                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Request: https://johndoe.pint.im/blog/my-first-post                        │
│                                                                              │
│  ┌────────────────┐                                                          │
│  │   1. Extract   │  hostname: johndoe.pint.im                              │
│  │    Hostname    │  subdomain: johndoe                                      │
│  └───────┬────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐                                                          │
│  │  2. Middleware │  Check: Is this a custom domain?                        │
│  │    Routing     │  No → Use subdomain lookup                              │
│  └───────┬────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐                                                          │
│  │   3. Lookup    │  SELECT * FROM tenants                                  │
│  │    Tenant      │  WHERE subdomain = 'johndoe'                            │
│  └───────┬────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐                                                          │
│  │  4. Set Context│  request.headers['x-tenant-id'] = tenant.id            │
│  │                │  Prisma context set for queries                         │
│  └───────┬────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐                                                          │
│  │   5. Route     │  /blog/[tenant]/[slug] → PostPage                       │
│  │    Handler     │  Render with tenant-scoped data                         │
│  └────────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Custom Domain Support

```typescript
// lib/domains.ts
import { prisma } from './db/prisma'

export async function resolveTenant(request: Request): Promise<string | null> {
  const hostname = request.headers.get('host') || ''

  // Check if it's a custom domain
  const customDomainTenant = await prisma.tenant.findFirst({
    where: { customDomain: hostname },
    select: { id: true },
  })

  if (customDomainTenant) {
    return customDomainTenant.id
  }

  // Check if it's a subdomain
  const subdomain = extractSubdomain(hostname)
  if (subdomain) {
    const subdomainTenant = await prisma.tenant.findFirst({
      where: { subdomain },
      select: { id: true },
    })
    return subdomainTenant?.id || null
  }

  return null
}

// Vercel domain management
export async function addCustomDomain(tenantId: string, domain: string) {
  // 1. Validate domain ownership (DNS verification)
  const verified = await verifyDomainOwnership(domain)
  if (!verified) {
    throw new Error('Domain verification failed')
  }

  // 2. Add domain to Vercel project
  await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  })

  // 3. Update tenant record
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { customDomain: domain },
  })
}
```

---

## 8. Authentication & Authorization

### 8.1 Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         NEW USER SIGNUP                               │   │
│  │                                                                        │   │
│  │  User ──▶ Clerk Signup ──▶ Webhook ──▶ Create Tenant + User Record   │   │
│  │                              │                                         │   │
│  │                              ▼                                         │   │
│  │                    POST /api/webhooks/clerk                           │   │
│  │                    {                                                   │   │
│  │                      type: 'user.created',                            │   │
│  │                      data: { id, email, username }                    │   │
│  │                    }                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        EXISTING USER LOGIN                            │   │
│  │                                                                        │   │
│  │  User ──▶ Clerk Login ──▶ JWT Cookie ──▶ Middleware ──▶ Dashboard    │   │
│  │                              │                                         │   │
│  │                              ▼                                         │   │
│  │                    Clerk SDK validates token                          │   │
│  │                    Extracts userId → lookup tenantId                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
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

  const payload = await request.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id!,
      'svix-timestamp': svix_timestamp!,
      'svix-signature': svix_signature!,
    }) as WebhookEvent
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, username } = evt.data
    const email = email_addresses[0]?.email_address

    // Create tenant and user in transaction
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          subdomain: username || generateSubdomain(email),
          tier: 'free',
          settings: getDefaultSettings(),
        },
      })

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

  if (evt.type === 'user.deleted') {
    const { id } = evt.data

    // Find and delete tenant (cascades to all related data)
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
      select: { tenantId: true },
    })

    if (user) {
      await prisma.tenant.delete({ where: { id: user.tenantId } })
    }
  }

  return new Response('OK', { status: 200 })
}
```

### 8.3 Authorization Helpers

```typescript
// lib/auth/permissions.ts
import { prisma } from '@/lib/db/prisma'

export type TierFeature =
  | 'custom_domain'
  | 'unlimited_posts'
  | 'password_protection'
  | 'advanced_seo'
  | 'ai_editor'
  | 'advanced_analytics'
  | 'remove_branding'

const TIER_FEATURES: Record<string, TierFeature[]> = {
  free: [],
  pro: [
    'custom_domain',
    'unlimited_posts',
    'password_protection',
    'advanced_seo',
    'advanced_analytics',
    'remove_branding',
  ],
  max: [
    'custom_domain',
    'unlimited_posts',
    'password_protection',
    'advanced_seo',
    'ai_editor',
    'advanced_analytics',
    'remove_branding',
  ],
  lifetime: [
    'custom_domain',
    'unlimited_posts',
    'password_protection',
    'advanced_seo',
    'advanced_analytics',
    'remove_branding',
    // AI requires BYOK for lifetime
  ],
}

export async function canAccessFeature(
  tenantId: string,
  feature: TierFeature
): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { tier: true },
  })

  if (!tenant) return false

  // Special case: lifetime users can use AI if they have BYOK configured
  if (feature === 'ai_editor' && tenant.tier === 'lifetime') {
    const hasApiKey = await prisma.apiKey.findFirst({
      where: { tenantId },
    })
    return !!hasApiKey
  }

  return TIER_FEATURES[tenant.tier]?.includes(feature) ?? false
}

export async function getPostLimit(tenantId: string): Promise<number | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { tier: true },
  })

  return tenant?.tier === 'free' ? 50 : null // null = unlimited
}
```

---

## 9. API Design

### 9.1 API Conventions

| Aspect | Convention |
|--------|------------|
| Style | REST |
| Content-Type | `application/json` |
| Auth | Bearer token (Clerk JWT) |
| Errors | Standard error format |
| Pagination | Cursor-based |
| Versioning | None (single version) |

### 9.2 Standard Error Response

```typescript
interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

// Example
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "title": "Title is required",
      "content": "Content must be valid JSON"
    }
  }
}
```

### 9.3 API Endpoints Reference

#### Posts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/posts` | List posts | Required |
| POST | `/api/posts` | Create post | Required |
| GET | `/api/posts/:id` | Get post | Required |
| PATCH | `/api/posts/:id` | Update post | Required |
| DELETE | `/api/posts/:id` | Delete post | Required |
| POST | `/api/posts/:id/publish` | Publish post | Required |

#### Pages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pages` | List pages | Required |
| POST | `/api/pages` | Create page | Required |
| GET | `/api/pages/:id` | Get page | Required |
| PATCH | `/api/pages/:id` | Update page | Required |
| DELETE | `/api/pages/:id` | Delete page | Required |

#### Widgets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/widgets` | List widgets | Required |
| PATCH | `/api/widgets/:id` | Update widget | Required |

#### Likes (Public)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/likes/:postId` | Get like count | None |
| POST | `/api/likes/:postId` | Toggle like | Rate-limited |

#### Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Get signed upload URL | Required |

#### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/check` | Run writing checks | Required (Max tier) |
| POST | `/api/ai/assist` | Get writing assistance | Required (Max tier) |

---

## 10. Media & File Storage

### 10.1 Upload Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            UPLOAD FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────┐    ┌────────────┐    ┌─────────────┐    ┌────────────────────┐  │
│  │ Client │    │  API Route │    │     R2      │    │ Cloudflare Worker  │  │
│  └───┬────┘    └─────┬──────┘    └──────┬──────┘    └─────────┬──────────┘  │
│      │               │                  │                     │              │
│      │ 1. Request    │                  │                     │              │
│      │   upload URL  │                  │                     │              │
│      │──────────────▶│                  │                     │              │
│      │               │                  │                     │              │
│      │               │ 2. Generate      │                     │              │
│      │               │    signed URL    │                     │              │
│      │               │─────────────────▶│                     │              │
│      │               │                  │                     │              │
│      │ 3. Return     │                  │                     │              │
│      │   signed URL  │                  │                     │              │
│      │◀──────────────│                  │                     │              │
│      │               │                  │                     │              │
│      │ 4. Direct upload to R2           │                     │              │
│      │─────────────────────────────────▶│                     │              │
│      │               │                  │                     │              │
│      │ 5. First request for image       │                     │              │
│      │─────────────────────────────────────────────────────────▶             │
│      │               │                  │                     │              │
│      │               │                  │ 6. Fetch original   │              │
│      │               │                  │◀────────────────────│              │
│      │               │                  │                     │              │
│      │               │                  │ 7. Transform        │              │
│      │               │                  │   (resize, WebP)    │              │
│      │               │                  │────────────────────▶│              │
│      │               │                  │                     │              │
│      │               │                  │ 8. Store variants   │              │
│      │               │                  │◀────────────────────│              │
│      │               │                  │                     │              │
│      │ 9. Return optimized image        │                     │              │
│      │◀─────────────────────────────────────────────────────────             │
│      │               │                  │                     │              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Upload API Implementation

```typescript
// app/api/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  const tenantId = await getTenantId(request)
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename, contentType } = await request.json()

  // Validate content type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg']
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  // Generate unique key
  const ext = filename.split('.').pop()
  const key = `${tenantId}/${nanoid()}.${ext}`

  // Generate signed URL
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: contentType,
  })

  const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })

  // Track file in database
  await prisma.mediaFile.create({
    data: {
      tenantId,
      filename,
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      size: 0, // Updated after upload
      mimeType: contentType,
    },
  })

  return NextResponse.json({
    uploadUrl: signedUrl,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  })
}
```

### 10.3 Cloudflare Worker for Image Transformation

```typescript
// cloudflare-worker/image-transform.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Parse transformation parameters
    const width = url.searchParams.get('w')
    const format = url.searchParams.get('f') || 'webp'

    // Check cache first
    const cacheKey = `${path}?w=${width}&f=${format}`
    const cached = await env.R2.get(cacheKey)
    if (cached) {
      return new Response(cached.body, {
        headers: {
          'Content-Type': `image/${format}`,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    }

    // Fetch original
    const original = await env.R2.get(path)
    if (!original) {
      return new Response('Not found', { status: 404 })
    }

    // Transform using Cloudflare Image Resizing
    const transformed = await fetch(
      `${env.ORIGIN}${path}`,
      {
        cf: {
          image: {
            width: width ? parseInt(width) : undefined,
            format: format,
            quality: 85,
          },
        },
      }
    )

    // Cache the result
    const transformedBuffer = await transformed.arrayBuffer()
    await env.R2.put(cacheKey, transformedBuffer, {
      httpMetadata: {
        contentType: `image/${format}`,
      },
    })

    return new Response(transformedBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  },
}
```

---

## 11. Caching Strategy

### 11.1 Cache Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CACHING LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Layer 1: Browser Cache                                                      │
│  ├── Static assets (JS, CSS, fonts): max-age=31536000, immutable            │
│  ├── Images: max-age=31536000                                                │
│  └── HTML: no-cache (revalidate)                                            │
│                                                                              │
│  Layer 2: Vercel Edge Cache                                                  │
│  ├── ISR pages: stale-while-revalidate                                      │
│  ├── API responses: Vary by tenant                                          │
│  └── Static generation: Cached until redeployment                           │
│                                                                              │
│  Layer 3: Vercel KV (Redis)                                                  │
│  ├── Rate limiting counters                                                  │
│  ├── Session data                                                            │
│  └── Frequently accessed tenant settings                                     │
│                                                                              │
│  Layer 4: PostgreSQL Query Cache                                             │
│  └── Neon's built-in query caching                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 ISR Implementation

```typescript
// app/blog/[tenant]/[slug]/page.tsx
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  // Pre-generate recent posts from active blogs
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: {
      slug: true,
      tenant: { select: { subdomain: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 1000, // Limit initial static generation
  })

  return posts.map((post) => ({
    tenant: post.tenant.subdomain,
    slug: post.slug,
  }))
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function PostPage({
  params,
}: {
  params: { tenant: string; slug: string }
}) {
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      tenant: { subdomain: params.tenant },
      status: 'published',
    },
  })

  if (!post) {
    notFound()
  }

  return <PostContent post={post} />
}
```

### 11.3 On-Demand Revalidation

```typescript
// app/api/posts/[id]/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // ... update post logic ...

  const post = await prisma.post.update({
    where: { id: params.id },
    data: validated,
    include: { tenant: true },
  })

  // Revalidate the specific post page
  revalidatePath(`/blog/${post.tenant.subdomain}/${post.slug}`)

  // Revalidate the blog homepage
  revalidatePath(`/blog/${post.tenant.subdomain}`)

  // Revalidate RSS feed
  revalidateTag(`rss-${post.tenant.id}`)

  return NextResponse.json(post)
}
```

---

## 12. AI Integration

### 12.1 AI Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI INTEGRATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         CLIENT (Editor)                                 │ │
│  │                                                                          │ │
│  │  User triggers AI action (check grammar, brainstorm, etc.)              │ │
│  │                              │                                           │ │
│  └──────────────────────────────┼───────────────────────────────────────────┘│
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        API Route (/api/ai/*)                            │ │
│  │                                                                          │ │
│  │  1. Authenticate request                                                │ │
│  │  2. Check tier permissions (Max or Lifetime+BYOK)                       │ │
│  │  3. Check/decrement usage quota                                         │ │
│  │  4. Route to appropriate provider                                       │ │
│  │                              │                                           │ │
│  └──────────────────────────────┼───────────────────────────────────────────┘│
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      PROVIDER ROUTING                                   │ │
│  │                                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │ │
│  │  │  Max Tier    │  │  Lifetime    │  │     Vercel AI SDK            │  │ │
│  │  │  (Managed)   │  │  (BYOK)      │  │     (Unified Interface)      │  │ │
│  │  │      │       │  │      │       │  │                              │  │ │
│  │  │      ▼       │  │      ▼       │  │  - Streaming responses       │  │ │
│  │  │  Our API     │  │  OpenRouter  │  │  - Error handling            │  │ │
│  │  │  Key         │  │  (User Key)  │  │  - Provider abstraction      │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────┘  │ │
│  │         │                  │                                            │ │
│  │         └────────┬─────────┘                                            │ │
│  │                  ▼                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    AI Provider APIs                               │  │ │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │ │
│  │  │  │ OpenAI  │  │Anthropic│  │  Gemini │  │  Local  │             │  │ │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 AI API Implementation

```typescript
// app/api/ai/check/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const WRITING_CHECK_PROMPT = `You are a writing assistant. Analyze the following text and identify:
- Grammar and spelling errors
- Wordy phrases that could be more concise
- Clichés and overused expressions
- Passive voice constructions
- Repeated words within close proximity

Return your analysis as JSON:
{
  "suggestions": [
    {
      "type": "grammar" | "brevity" | "cliche" | "passive" | "repetition",
      "severity": "error" | "warning" | "suggestion",
      "original": "the problematic text",
      "suggestion": "the improved version",
      "explanation": "why this change is recommended",
      "position": { "start": 0, "end": 10 }
    }
  ]
}`

export async function POST(request: Request) {
  const tenantId = await getTenantId(request)
  const { text } = await request.json()

  // Check permissions
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { tier: true },
  })

  if (!tenant || (tenant.tier !== 'max' && tenant.tier !== 'lifetime')) {
    return NextResponse.json(
      { error: 'AI features require Max tier' },
      { status: 403 }
    )
  }

  // Get API key (BYOK for lifetime, our key for Max)
  let provider
  if (tenant.tier === 'lifetime') {
    const apiKey = await prisma.apiKey.findFirst({
      where: { tenantId },
    })
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Please configure your API key in settings' },
        { status: 400 }
      )
    }
    const openrouter = createOpenRouter({
      apiKey: decrypt(apiKey.encryptedKey),
    })
    provider = openrouter('openai/gpt-4o')
  } else {
    // Use our managed key
    provider = openai('gpt-4o')
  }

  // Check and decrement usage quota for Max tier
  if (tenant.tier === 'max') {
    const usage = await checkAndDecrementQuota(tenantId)
    if (!usage.allowed) {
      return NextResponse.json(
        { error: 'Monthly AI quota exceeded. Purchase additional credits.' },
        { status: 429 }
      )
    }
  }

  // Stream the response
  const result = await streamText({
    model: provider,
    system: WRITING_CHECK_PROMPT,
    prompt: text,
  })

  return result.toDataStreamResponse()
}
```

### 12.3 API Key Encryption

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

---

## 13. Real-Time Features

### 13.1 Auto-Save Implementation

Since WebSockets are not used for MVP, auto-save uses debounced HTTP requests:

```typescript
// hooks/useAutoSave.ts
import { useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface UseAutoSaveOptions {
  postId: string
  content: any
  onSaveStart: () => void
  onSaveSuccess: () => void
  onSaveError: (error: Error) => void
}

export function useAutoSave({
  postId,
  content,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const lastSavedContent = useRef<string>('')

  const save = useDebouncedCallback(
    async (contentToSave: any) => {
      const contentString = JSON.stringify(contentToSave)

      // Skip if content hasn't changed
      if (contentString === lastSavedContent.current) {
        return
      }

      onSaveStart()

      try {
        await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentToSave }),
        })

        lastSavedContent.current = contentString

        // Also save to localStorage as backup
        localStorage.setItem(`draft-${postId}`, contentString)

        onSaveSuccess()
      } catch (error) {
        onSaveError(error as Error)
      }
    },
    5000, // 5 second debounce
    { maxWait: 10000 } // Force save every 10 seconds max
  )

  useEffect(() => {
    save(content)
  }, [content, save])

  // Force save on unmount
  useEffect(() => {
    return () => {
      save.flush()
    }
  }, [save])

  return {
    forceSave: () => save.flush(),
  }
}
```

### 13.2 Like Count Polling (Widget)

```typescript
// components/widgets/like-button.tsx
'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export function LikeButton({ postId }: { postId: string }) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch initial count and check if user has liked
  useEffect(() => {
    fetch(`/api/likes/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count)
        setLiked(data.userLiked)
      })
  }, [postId])

  // Optional: Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/likes/${postId}`)
      const data = await res.json()
      setCount(data.count)
    }, 30000)

    return () => clearInterval(interval)
  }, [postId])

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    // Optimistic update
    setLiked(!liked)
    setCount((c) => (liked ? c - 1 : c + 1))

    try {
      const res = await fetch(`/api/likes/${postId}`, {
        method: 'POST',
      })

      if (!res.ok) {
        // Revert on error
        setLiked(liked)
        setCount((c) => (liked ? c + 1 : c - 1))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Heart
        className={liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}
      />
      <span>{count}</span>
    </button>
  )
}
```

---

## 14. Payment Integration

### 14.1 Stripe Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STRIPE PAYMENT FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      SUBSCRIPTION FLOW                               │    │
│  │                                                                       │    │
│  │  User clicks "Upgrade"                                               │    │
│  │         │                                                             │    │
│  │         ▼                                                             │    │
│  │  Create Checkout Session (/api/stripe/checkout)                      │    │
│  │         │                                                             │    │
│  │         ▼                                                             │    │
│  │  Redirect to Stripe Checkout                                         │    │
│  │         │                                                             │    │
│  │         ▼                                                             │    │
│  │  User completes payment                                              │    │
│  │         │                                                             │    │
│  │         ▼                                                             │    │
│  │  Stripe sends webhook (checkout.session.completed)                   │    │
│  │         │                                                             │    │
│  │         ▼                                                             │    │
│  │  Update tenant tier in database                                      │    │
│  │         │                                                             │    │
│  │         ▼                                                             │    │
│  │  Redirect to success page                                            │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      WEBHOOK EVENTS                                  │    │
│  │                                                                       │    │
│  │  checkout.session.completed → Create/update subscription            │    │
│  │  invoice.paid → Renew subscription                                  │    │
│  │  invoice.payment_failed → Mark subscription at risk                 │    │
│  │  customer.subscription.deleted → Downgrade to free                  │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 14.2 Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenantId
      const tier = session.metadata?.tier as 'pro' | 'max' | 'lifetime'

      if (tenantId && tier) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            tier,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await prisma.tenant.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          tier: 'free',
          stripeSubscriptionId: null,
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice

      // Send email notification about failed payment
      await sendPaymentFailedEmail(invoice.customer as string)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

### 14.3 Checkout Session Creation

```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS = {
  pro_monthly: 'price_xxx',
  pro_annual: 'price_xxx',
  max_monthly: 'price_xxx',
  max_annual: 'price_xxx',
  lifetime: 'price_xxx',
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await request.json()
  const tenantId = await getTenantIdFromUser(userId)

  const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const tier = plan.startsWith('pro') ? 'pro' : plan.startsWith('max') ? 'max' : 'lifetime'
  const isLifetime = plan === 'lifetime'

  const session = await stripe.checkout.sessions.create({
    mode: isLifetime ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings?canceled=true`,
    metadata: {
      tenantId,
      tier,
    },
  })

  return NextResponse.json({ url: session.url })
}
```

---

## 15. Email System

### 15.1 Email Architecture

```typescript
// lib/email/index.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  return resend.emails.send({
    from: 'Pint <noreply@pint.im>',
    to,
    subject,
    react,
  })
}
```

### 15.2 Email Templates (React Email)

```typescript
// emails/welcome.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  username: string
  blogUrl: string
}

export function WelcomeEmail({ username, blogUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Pint - Your blog is ready!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Welcome to Pint!</Heading>
          <Text style={styles.text}>
            Hi {username}, your blog is now live at:
          </Text>
          <Link href={blogUrl} style={styles.link}>
            {blogUrl}
          </Link>
          <Text style={styles.text}>
            Get started by writing your first post in the dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' },
  container: { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' },
  heading: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
  text: { fontSize: '16px', lineHeight: '24px', color: '#525f7f' },
  link: { color: '#5469d4', textDecoration: 'underline' },
}
```

---

## 16. Security Architecture

### 16.1 Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | HTTPS | Vercel automatic SSL |
| Auth | JWT | Clerk managed tokens |
| CSRF | Token validation | Next.js built-in |
| XSS | Content Security Policy | Headers middleware |
| SQL Injection | Parameterized queries | Prisma ORM |
| Rate Limiting | Per-IP limits | Vercel KV |
| Data Isolation | RLS + tenant_id | Application + DB |
| Secrets | Encryption at rest | AES-256-GCM |
| Input Validation | Schema validation | Zod |

### 16.2 Security Headers

```typescript
// middleware.ts (security headers)
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://api.openai.com https://api.anthropic.com https://openrouter.ai",
      "frame-src https://js.stripe.com",
    ].join('; ')
  )

  return response
}
```

### 16.3 Rate Limiting Implementation

```typescript
// lib/rate-limit.ts
import { kv } from '@vercel/kv'

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `rate-limit:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds

  // Use sorted set for sliding window
  await kv.zremrangebyscore(key, 0, windowStart)

  const count = await kv.zcard(key)

  if (count >= limit) {
    const oldestEntry = await kv.zrange(key, 0, 0, { withScores: true })
    const reset = oldestEntry[0] ? Number(oldestEntry[1]) + windowSeconds : now + windowSeconds

    return {
      success: false,
      remaining: 0,
      reset,
    }
  }

  await kv.zadd(key, { score: now, member: `${now}-${Math.random()}` })
  await kv.expire(key, windowSeconds)

  return {
    success: true,
    remaining: limit - count - 1,
    reset: now + windowSeconds,
  }
}
```

---

## 17. Infrastructure & Deployment

### 17.1 Environment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENTS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Development   │  │    Preview      │  │      Production             │  │
│  │                 │  │                 │  │                             │  │
│  │  localhost:3000 │  │  pr-*.vercel.app│  │  pint.im                    │  │
│  │                 │  │                 │  │  *.pint.im (subdomains)     │  │
│  │  Neon (dev)     │  │  Neon (preview) │  │  Neon (prod)                │  │
│  │  R2 (dev)       │  │  R2 (dev)       │  │  R2 (prod)                  │  │
│  │  Clerk (test)   │  │  Clerk (test)   │  │  Clerk (prod)               │  │
│  │  Stripe (test)  │  │  Stripe (test)  │  │  Stripe (prod)              │  │
│  │                 │  │                 │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 17.2 Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_URL=https://pint.im
NEXT_PUBLIC_APP_ENV=production

# Database (Neon)
DATABASE_URL=postgresql://...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage (Cloudflare R2)
R2_ENDPOINT=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=pint-media
R2_PUBLIC_URL=https://media.pint.im

# Cache (Vercel KV)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# Email (Resend)
RESEND_API_KEY=re_...

# AI
OPENAI_API_KEY=sk_...
ANTHROPIC_API_KEY=sk_...

# Monitoring (Sentry)
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Security
ENCRYPTION_KEY=... # 32-byte hex for API key encryption
```

### 17.3 Deployment Pipeline

```yaml
# Vercel handles most of this automatically, but conceptually:

Pipeline:
  1. Push to main branch
  2. Vercel detects change
  3. Install dependencies (pnpm install)
  4. Run type check (tsc --noEmit)
  5. Run linting (eslint)
  6. Run tests (vitest)
  7. Build application (next build)
  8. Run Prisma migrations (prisma migrate deploy)
  9. Deploy to production
  10. Invalidate caches
  11. Run smoke tests
```

---

## 18. Monitoring & Observability

### 18.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY STACK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │     Sentry      │  │  Vercel Logs    │  │   Vercel Analytics          │  │
│  │                 │  │                 │  │                             │  │
│  │  - Errors       │  │  - Request logs │  │  - Core Web Vitals          │  │
│  │  - Performance  │  │  - Function logs│  │  - Page views               │  │
│  │  - Releases     │  │  - Edge logs    │  │  - Unique visitors          │  │
│  │  - User context │  │                 │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                              │
│  Future:                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │     Axiom       │  │  Custom Metrics │                                   │
│  │                 │  │                 │                                   │
│  │  - Log agg.     │  │  - Business KPIs│                                   │
│  │  - Dashboards   │  │  - Usage metrics│                                   │
│  └─────────────────┘  └─────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 18.2 Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

### 18.3 Custom Logging

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  tenantId?: string
  userId?: string
  requestId?: string
  [key: string]: any
}

class Logger {
  private context: LogContext = {}

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data,
    }

    // In production, this goes to Vercel logs
    console[level](JSON.stringify(entry))
  }

  debug(message: string, data?: any) { this.log('debug', message, data) }
  info(message: string, data?: any) { this.log('info', message, data) }
  warn(message: string, data?: any) { this.log('warn', message, data) }
  error(message: string, data?: any) { this.log('error', message, data) }
}

export const logger = new Logger()
```

---

## 19. Performance Optimization

### 19.1 Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | < 2.5s | 4s |
| FID (First Input Delay) | < 100ms | 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.25 |
| TTFB (Time to First Byte) | < 200ms | 600ms |
| Bundle Size (JS) | < 100KB | 200KB |

### 19.2 Optimization Techniques

```typescript
// 1. Dynamic imports for heavy components
const Editor = dynamic(() => import('@/components/editor'), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Editor is client-only
})

// 2. Image optimization
import Image from 'next/image'

<Image
  src={post.featuredImage}
  alt={post.title}
  width={800}
  height={400}
  placeholder="blur"
  blurDataURL={post.blurHash}
  priority={index === 0} // Priority for above-fold
/>

// 3. Preconnect to external domains
// app/layout.tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://media.pint.im" />
</head>

// 4. Route prefetching
import Link from 'next/link'

<Link href={`/blog/${post.slug}`} prefetch={true}>
  {post.title}
</Link>
```

### 19.3 Database Query Optimization

```typescript
// Use select to limit fields
const posts = await prisma.post.findMany({
  where: { tenantId, status: 'published' },
  select: {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    publishedAt: true,
    // Don't select content unless needed
  },
  orderBy: { publishedAt: 'desc' },
  take: 20,
})

// Use cursor-based pagination for large lists
const posts = await prisma.post.findMany({
  where: { tenantId },
  cursor: cursor ? { id: cursor } : undefined,
  take: 20,
  skip: cursor ? 1 : 0,
})
```

---

## 20. Scalability Considerations

### 20.1 Scaling Path

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCALING MILESTONES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 1: MVP (0 - 10K blogs)                                               │
│  ├── Single Neon database (us-east-1)                                       │
│  ├── Vercel Pro plan                                                        │
│  ├── Basic R2 bucket                                                        │
│  └── Estimated cost: ~$100-150/month                                        │
│                                                                              │
│  Phase 2: Growth (10K - 100K blogs)                                         │
│  ├── Neon Pro with read replicas                                            │
│  ├── Vercel Enterprise                                                      │
│  ├── Multiple R2 buckets by region                                          │
│  ├── Cloudflare for SaaS for custom domains                                 │
│  └── Estimated cost: ~$500-1000/month                                       │
│                                                                              │
│  Phase 3: Scale (100K+ blogs)                                               │
│  ├── Schema-per-tenant or sharded databases                                 │
│  ├── Dedicated compute for heavy operations                                 │
│  ├── Multi-region deployment                                                │
│  ├── Dedicated CDN                                                          │
│  └── Estimated cost: $2000+/month                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 20.2 Horizontal Scaling Considerations

- **Stateless API Routes**: All state in database, easy to scale horizontally
- **Serverless Functions**: Auto-scale based on demand
- **Edge Caching**: Reduces origin load significantly
- **Database**: Neon's serverless architecture handles connection pooling

### 20.3 Database Scaling Options

```typescript
// Future: Read replica for heavy read operations
const readReplica = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_READ_REPLICA },
  },
})

// Use read replica for public blog queries
export async function getPublishedPost(tenantId: string, slug: string) {
  return readReplica.post.findFirst({
    where: { tenantId, slug, status: 'published' },
  })
}

// Use primary for writes
export async function updatePost(id: string, data: any) {
  return prisma.post.update({ where: { id }, data })
}
```

---

## 21. Disaster Recovery

### 21.1 Backup Strategy

| Data | Backup Frequency | Retention | Location |
|------|------------------|-----------|----------|
| Database | Continuous (Neon) | 30 days | Neon managed |
| Media Files | Daily | 90 days | R2 versioning |
| Configuration | Per deploy | 30 deploys | Vercel |

### 21.2 Recovery Procedures

```markdown
## Database Recovery

1. Log into Neon dashboard
2. Navigate to Branches
3. Create branch from desired point in time
4. Test recovery branch
5. Promote to production if valid

## Media Recovery

1. Log into Cloudflare R2 dashboard
2. Navigate to bucket versioning
3. Identify files to restore
4. Restore previous versions

## Full Recovery (worst case)

1. Deploy latest commit from Git
2. Restore database from Neon backup
3. Restore media from R2 versioning
4. Verify all integrations (Stripe, Clerk) are connected
5. Run smoke tests
```

---

## 22. Development Workflow

### 22.1 Local Development Setup

```bash
# Clone repository
git clone https://github.com/pint/pint.git
cd pint

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push  # Push schema to Neon dev branch

# Run development server
pnpm dev

# Other commands
pnpm lint      # Run ESLint
pnpm typecheck # Run TypeScript check
pnpm test      # Run tests
pnpm build     # Production build
```

### 22.2 Git Workflow

```
main
  │
  ├── feature/widget-music-player
  │     └── Commits → PR → Review → Merge
  │
  ├── feature/ai-editor
  │     └── Commits → PR → Review → Merge
  │
  └── fix/like-rate-limit
        └── Commits → PR → Review → Merge

Branch naming:
  feature/[name]  - New features
  fix/[name]      - Bug fixes
  refactor/[name] - Code refactoring
  docs/[name]     - Documentation
```

### 22.3 Code Review Checklist

- [ ] TypeScript types are complete (no `any` without reason)
- [ ] Tenant isolation is maintained
- [ ] Rate limiting applied where needed
- [ ] Error handling is comprehensive
- [ ] Tests added/updated
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] Performance implications considered
- [ ] Security implications considered
- [ ] Migrations are backwards compatible

---

## Appendix: Technology Decision Matrix

| Category | Chosen | Alternatives Considered | Why Chosen |
|----------|--------|------------------------|------------|
| Framework | Next.js | Remix, SvelteKit | Best Vercel integration, RSC |
| Database | Neon | Supabase, PlanetScale | Serverless, Prisma support, branching |
| Auth | Clerk | NextAuth, Auth0 | DX, managed service, webhooks |
| Payments | Stripe | Paddle, LemonSqueezy | Industry standard, best docs |
| Email | Resend | Postmark, SendGrid | DX, React Email, pricing |
| Storage | R2 | S3, Cloudinary | No egress fees, Workers integration |
| Cache | Vercel KV | Upstash, Redis Cloud | Vercel integration |
| Editor | Tiptap | Lexical, Slate | Extensibility, community |
| Monitoring | Sentry | Datadog, LogRocket | Cost, features, Next.js integration |

---

*Document maintained by Pint Engineering Team*
*Last updated: January 2026*
