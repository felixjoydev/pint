# Pint

Minimalist multi-tenant blogging platform. Creators get `{username}.pint.im` subdomains with optional custom domains.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** Neon (PostgreSQL) + Prisma ORM
- **Auth:** Clerk
- **Hosting:** Vercel
- **Media:** Cloudflare R2 + Workers
- **Payments:** Stripe
- **Email:** Resend
- **Editor:** Tiptap (ProseMirror)
- **Styling:** Tailwind CSS + Radix Primitives
- **State:** Zustand (UI), React Hook Form (forms)
- **AI:** Vercel AI SDK + OpenRouter

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Login, signup
│   ├── (dashboard)/  # Creator dashboard
│   ├── (blog)/       # Public blog routes
│   └── api/          # API routes
├── components/
│   ├── ui/           # Base components (Radix-based)
│   ├── editor/       # Tiptap editor
│   ├── dashboard/    # Dashboard components
│   ├── blog/         # Blog components
│   └── widgets/      # Widget components
├── lib/
│   ├── db/           # Prisma client, queries, mutations
│   ├── auth/         # Auth utilities
│   └── validations/  # Zod schemas
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
└── types/            # TypeScript types
```

## Multi-Tenancy

- All tables include `tenant_id` column
- Row-Level Security (RLS) enforced on all tenant tables
- Middleware sets tenant context per request
- Composite indexes: `(tenant_id, ...)` for all queries
- **Critical:** Write tests verifying cross-tenant access fails

## Key Constraints

- **No WebSockets** in MVP - use HTTP polling
- **No background jobs** in MVP - all ops synchronous
- **Single region DB** for MVP (us-east-1)
- **Server Components first** - minimize client JS
- Never store API keys in plaintext
- Never commit `.env` files
- Never push directly to `main`

## Code Style

- TypeScript strict mode
- Zod for all validation
- Server Actions for mutations where possible
- Prefer Server Components over Client Components
- Use `use client` directive only when necessary
- Colocation: keep related files together

## Git Workflow

**Branch naming:**
- `feature/<name>` - New features (e.g., `feature/auth-flow`)
- `fix/<name>` - Bug fixes (e.g., `fix/slug-generation`)
- `refactor/<name>` - Code refactoring
- `docs/<name>` - Documentation updates

**Rules:**
- Create a new branch for every feature/fix
- Never commit directly to `main`
- Submit PR when feature is complete
- Delete branch after merge

**Commit messages:**
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Keep subject under 72 characters
- Reference issue number if applicable (e.g., `feat: add login flow #12`)

## Task Workflow

**Before starting any task, read [task-workflow.md](./task-workflow.md) for execution rules.**

Key rules:
- Auto-plan each task, wait for approval before executing
- Test/verify each task before proceeding to next
- Mark tasks as ✅ Done in `plan.md` when completed
- Maintain context per phase; provide summary at 40-50% context usage

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Run tests
npm run db:push      # Push Prisma schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## Documentation

- [PRD](./prd.md) - Product requirements
- [Architecture](./architecture.md) - Technical architecture
- [ERD](./erd.md) - Database schema
- [Plan](./plan.md) - Task breakdown with status
- [Task Workflow](./task-workflow.md) - Execution rules
- [Changelog](./changelog.md) - Version history

## Tiers

| Tier | Price | Key Limits |
|------|-------|------------|
| Free | $0 | 50 posts, subdomain only |
| Pro | $4.99/mo | Unlimited, custom domains |
| Max | $11.99/mo | Pro + AI editor (100 req/mo) |
| Lifetime | $124.99 | Pro forever, AI requires BYOK |

## Regression Notes

- [Other] Always plan and get approval before executing any task from plan.md
- [Test] Complete ALL verification steps in plan.md before marking task as done
- [Git] Create feature branch before starting work - never commit directly to main
- [Docs] Update changelog.md after completing each phase (before PR/merge)
