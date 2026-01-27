# Pint - Product Requirements Document

**Version:** 2.0
**Date:** January 2026
**Status:** Draft

---

## 1. Executive Summary

### Product Vision
Pint is a minimalist multi-tenant blogging platform designed for creators who value simplicity, aesthetics, and meaningful reader engagement. In a landscape cluttered with feature-bloated platforms, Pint offers a refined writing experience that puts content first while providing thoughtful tools to enhance both creation and consumption.

### Core Value Proposition
1. **Minimalist Design** - Clean, distraction-free writing and reading with a signature Pint aesthetic
2. **Customizable Widgets** - Unique floating widgets that add personality without compromising simplicity
3. **AI-Powered Editor** - Intelligent writing assistance (Max tier) with bring-your-own-key option for flexibility

### Target Users
- **Primary:** Independent bloggers, writers, and content creators seeking a simple yet expressive platform
- **Secondary:** Small teams or publications wanting a clean, professional blog presence
- **Tertiary:** Developers and technical writers who appreciate minimal, fast-loading blogs

### MVP Goals
- Feature-complete launch with full widget system and all three pricing tiers
- Polished, end-to-end tested experience
- Mobile editing as a critical requirement

---

## 2. Multi-Tenant Architecture

### Subdomain Model
Every creator receives a free subdomain upon registration:
- Format: `{username}.pint.im`
- Username constraints: 3-30 characters, alphanumeric and hyphens only, must start with letter
- Reserved subdomains: `www`, `api`, `app`, `admin`, `blog`, `help`, `support`, `mail`

### Custom Domains (Pro/Max Tier)
Pro and Max subscribers can connect custom domains:
- Full apex domain support (e.g., `example.com`)
- Subdomain support (e.g., `blog.example.com`)
- Automatic SSL provisioning
- Step-by-step interactive wizard for DNS configuration
- Maximum 3 custom domains per account

**Implementation:** Start with Vercel's built-in custom domain handling for MVP. Architect for migration to Cloudflare for SaaS when scaling requires it.

### Database Architecture
**Multi-Tenancy Model:** Shared database with tenant isolation at the application layer.

**Security Requirements:**
- Row-Level Security (RLS) enforced on all tenant-owned tables
- `tenant_id` column on every tenant-owned table
- Tenant context set per request via middleware
- Composite indexes starting with `tenant_id` for query performance
- Comprehensive tests that verify cross-tenant access fails
- Upgrade path to schema-per-tenant or separate databases if future scale requires

---

## 3. Authentication & User Management

### Auth Provider
**Clerk** - Managed authentication service providing:
- Email + password authentication
- Google OAuth
- Email verification
- Password reset flows
- Session management

### Account Types
| Type | Description | Capabilities |
|------|-------------|--------------|
| Creator | Blog owner | Full dashboard access, content management, settings |
| Reader | Blog visitor | Like posts, submit to Wall of Love, subscribe (future) |

### Reader Interactions
- Readers do not require accounts to read content
- Liking posts is anonymous (IP-based, rate-limited)
- Wall of Love submissions require email verification
- Future: Optional reader accounts for commenting and subscriptions

---

## 4. Content Model

### Posts
Chronological blog entries forming the core content type.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `tenant_id` | UUID | Yes | Tenant reference |
| `slug` | String | Yes | URL-friendly identifier, auto-generated from title |
| `title` | String | Yes | Post title (max 200 characters) |
| `content` | JSONB | Yes | Block-based content structure (Tiptap JSON) |
| `excerpt` | String | No | Manual excerpt (auto-generated if empty) |
| `featured_image` | URL | No | Hero image for previews |
| `status` | Enum | Yes | `draft`, `published` |
| `published_at` | Timestamp | No | Publication date (can be backdated) |
| `created_at` | Timestamp | Yes | Creation timestamp |
| `updated_at` | Timestamp | Yes | Last modification timestamp |

**Limits:**
- Free tier: Maximum 50 published posts
- Pro/Max tiers: Unlimited posts

### Pages
Static content pages for non-chronological information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `tenant_id` | UUID | Yes | Tenant reference |
| `slug` | String | Yes | URL path (e.g., `about`, `now`) |
| `title` | String | Yes | Page title |
| `content` | JSONB | Yes | Block-based content structure |
| `show_in_nav` | Boolean | Yes | Display in site navigation |
| `nav_order` | Integer | No | Navigation display order |
| `status` | Enum | Yes | `draft`, `published` |

**Notes:**
- Pages are optional; creators configure their nav as they want
- No mandatory page templates (About, Contact, etc.)
- Pages auto-appear in navigation when published
- Creators can reorder pages in dashboard

### URL Structure
- Posts: `/blog/{slug}`
- Pages: `/{slug}`
- Slug is auto-generated from title (customization option planned for future)

### Publishing Flow
1. Create content in editor (auto-saved periodically)
2. Option to manually save at any time
3. Preview rendered output
4. Publish immediately or backdate
5. Triggers RSS update

**Note:** Scheduled publishing is a future feature, not included in MVP.

---

## 5. Editor Requirements

### Architecture
Block-based rich text editor using **Tiptap** (ProseMirror-based).

### Content Storage
- Store Tiptap JSON in PostgreSQL JSONB column
- Architect for future migration to R2 object storage if content size requires

### Slash Command Menu
Typing `/` opens a searchable command palette with essential blocks:
- `/heading1`, `/heading2`, `/heading3` - Heading levels
- `/paragraph` - Standard text block
- `/bullet` - Bulleted list
- `/numbered` - Numbered list
- `/quote` - Blockquote
- `/code` - Code block (with syntax highlighting)
- `/image` - Image upload/embed
- `/video` - YouTube/Vimeo embed by URL
- `/divider` - Horizontal rule

### Core Formatting
**Inline Formatting:**
- Bold (`Cmd/Ctrl + B`)
- Italic (`Cmd/Ctrl + I`)
- Strikethrough
- Inline code
- Links (`Cmd/Ctrl + K`)

**Block Types:**
- Headings (H1, H2, H3)
- Paragraphs
- Bulleted lists
- Numbered lists
- Blockquotes
- Code blocks (with language selection)
- Images (with alt text and caption support)
- Video embeds (YouTube, Vimeo)
- Horizontal dividers

### Image Handling
- Drag-and-drop upload
- Paste from clipboard
- URL embed
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, WebP
- Processing via Cloudflare R2 + Workers (resize, optimize, WebP conversion)

### Auto-Save
- Simple HTTP-based auto-save (every 5-10 seconds when changes detected)
- Visual indicator: "Saving..." / "Saved"
- Manual save option always available
- Browser localStorage backup for crash recovery
- Version history planned for future release

### Mobile Editing
**Critical requirement** - Full editing experience must work well on mobile devices:
- Touch-friendly block manipulation
- Mobile-optimized slash command menu
- Responsive toolbar/formatting options

---

## 6. RSS Feeds

### Feed Endpoint
Each blog provides an RSS 2.0 feed at:
- `{subdomain}.pint.im/rss.xml`
- `{custom-domain}/rss.xml`

### Required Fields
```xml
<rss version="2.0">
  <channel>
    <title>Blog Title</title>
    <link>https://username.pint.im</link>
    <description>Blog description</description>
    <language>en-us</language>
    <lastBuildDate>RFC 822 timestamp</lastBuildDate>
    <item>
      <title>Post Title</title>
      <link>https://username.pint.im/blog/post-slug</link>
      <guid>https://username.pint.im/blog/post-slug</guid>
      <pubDate>RFC 822 timestamp</pubDate>
      <description>Post excerpt or full content</description>
      <content:encoded>Full HTML content</content:encoded>
    </item>
  </channel>
</rss>
```

### Feed Options (Creator Settings)
- Include full content vs. excerpt only
- Number of items (10, 25, 50, all)
- Include featured images

---

## 7. Widgets System (Core Differentiator)

### Architecture
Widgets are modular, toggleable components displayed as a **floating stack in the bottom-right corner** of blog pages.

**Widget Structure:**
```
Widget {
  id: UUID
  tenant_id: UUID
  type: WidgetType
  enabled: Boolean
  config: JSON
  display_order: Integer
}
```

### Display Behavior
- **Desktop & Mobile:** Floating icon stack in bottom-right corner
- Hover/click reveals widget controls (play/pause, settings, etc.)
- No autoplay for any widget
- Widgets can be minimized by readers
- Reader preferences persisted in localStorage

### Phase 1 Widgets (MVP)

#### Ambient Music Player
Background music that plays while reading.
| Setting | Options |
|---------|---------|
| Audio source | Upload MP3 (max 50MB), Spotify playlist embed, SoundCloud embed |
| Autoplay | Disabled (browsers block; user must click to play) |
| Loop | Yes, No |
| Volume default | 0-100% slider |
| Visual style | Minimal, Waveform, Album art |

**Tier:** Free (1 track), Pro/Max (playlist support)

#### Font Customization
Allow readers to adjust typography within Pint's predefined options.
| Setting | Options |
|---------|---------|
| Font family | Predefined families matching Pint aesthetic |
| Font size | Predefined sizes (Small, Medium, Large, X-Large) |
| Line height | Compact, Normal, Relaxed |
| Persist preference | Yes (localStorage) |

**Behavior:** Creator sets default in dashboard settings. If widget is enabled, readers can adjust. Initial page load uses creator's settings.

**Tier:** Free (presets), Pro/Max (custom fonts - future)

#### Color Theme Switcher
Reader-controlled color themes.
| Setting | Options |
|---------|---------|
| Available themes | Predefined palettes (creator defines which to offer) |
| Default theme | Creator-selected |
| Allow switching | Yes, No |

**Behavior:** Creator sets default and available themes. Reader selections persist in localStorage.

**Tier:** Free (3 themes), Pro/Max (additional custom themes - future)

### Phase 2 Widgets (Post-MVP)

#### Polls
Interactive reader polls.
| Feature | Description |
|---------|-------------|
| Question | Single question text |
| Options | 2-6 answer choices |
| Duration | Active period (1 day - indefinite) |
| Results | Show after voting, always, or never |
| Voting | One vote per reader (cookie/IP based) |

**Tier:** Pro/Max only

#### Wall of Love
Moderated reader testimonials/messages.
| Feature | Description |
|---------|-------------|
| Submission form | Name, message, optional avatar |
| Moderation | All submissions require creator approval |
| Display | Masonry grid of approved messages |
| Limit | Display latest N messages |

**Tier:** Free (display 10), Pro/Max (unlimited)

#### Post Activity Chart
Visual representation of posting frequency.
| Feature | Description |
|---------|-------------|
| Chart type | GitHub-style contribution grid |
| Timeframe | Last 12 months |
| Data | Post count per day/week |
| Hover detail | Date and post count |

**Tier:** Pro/Max only

### Widget Tier Summary (MVP)
| Widget | Free | Pro | Max |
|--------|------|-----|-----|
| Ambient Music | 1 track | Playlists | Playlists |
| Font Customization | Presets | Presets | Presets |
| Color Themes | 3 built-in | 3 built-in | 3 built-in |

### Scalability
Widget system should be architected for easy addition of new widgets. Configuration is JSON-based and extensible.

---

## 8. Reader Engagement

### Likes/Upvotes
Simple appreciation mechanism for posts.

**Implementation:**
- Heart/like button on each post
- **Anonymous likes** - no account or email required
- Rate limiting: 1 like per post per IP per 24 hours (via Vercel KV)
- Display total count on post

**Creator Controls:**
- Enable/disable likes per blog
- Show/hide like counts publicly

### Sharing
- Single "copy link" button only
- No social sharing buttons (keeps UI minimal)

### Future: Comments
Subscriber-only commenting system (planned for post-MVP).

### Wall of Love
See Widgets section (7.2.2) for full specification.

---

## 9. AI Editor (Max Tier Feature)

### Writing Checks
Real-time analysis tools that help creators improve their writing.

| Check | Description | Severity Levels |
|-------|-------------|-----------------|
| **Grammar** | Spelling, punctuation, syntax errors | Error, Warning |
| **Brevity** | Identifies wordy phrases and suggests concise alternatives | Suggestion |
| **Cliches** | Flags overused expressions | Suggestion |
| **Readability** | Flesch-Kincaid score with plain-language suggestions | Info |
| **Passive Voice** | Highlights passive constructions | Suggestion |
| **Tone** | Analyzes formality and emotional tone | Info |
| **Citations** | Suggests citations for claims and statistics | Warning |
| **Repetition** | Flags overused words within proximity | Suggestion |
| **Custom Rules** | User-defined patterns to flag or avoid | Configurable |

**UI Presentation:**
- Sidebar panel showing all suggestions
- Inline highlighting in editor
- One-click accept/dismiss for suggestions
- "Check all" button for full document scan

### Writing Assistance
AI-powered tools for content creation.

| Feature | Description |
|---------|-------------|
| **Block Suggestions** | AI suggests next paragraph based on context |
| **Brainstorming** | Generate ideas related to current topic |
| **Outline Generation** | Create structured outline from topic/title |
| **Rewriting** | Rephrase selected text in different styles (formal, casual, concise) |
| **Expand** | Elaborate on a brief point |
| **Summarize** | Condense long sections |

### AI Architecture
**Layered approach for flexibility:**
1. **Vercel AI SDK** - Unified interface, good DX, handles streaming
2. **OpenRouter** - Provider-agnostic abstraction for BYOK users
3. **Direct APIs** - For managed tier (OpenAI, Anthropic)

**BYOK (Bring Your Own Key):**
- Lifetime plan users connect their own API keys
- Support any provider via OpenRouter
- Keys encrypted at rest with proper security measures
- Keys never logged or stored in plaintext

**Usage Limits (Max tier):**
- 100 AI requests per month included
- Additional requests: $0.02 per request (prepaid credits)

**Privacy:**
- Content processed only when feature is invoked
- No persistent storage of content for AI training
- Option to disable AI features entirely

---

## 10. Import/Export

### One-Click Import (MVP)
Supported platforms for automated import:

| Platform | Supported Content | Method |
|----------|-------------------|--------|
| **WordPress** | Posts, pages, images | WXR file upload |
| **Medium** | Posts, images | Export file upload |
| **Substack** | Posts, images | Export file upload |
| **Markdown files** | Posts | Folder upload (ZIP) or JSON |

**Import Flow:**
1. Select source platform
2. Upload export file
3. Preview content mapping
4. Select posts/pages to import
5. Choose handling for duplicates
6. Import with progress tracking

**Post-Import:**
- All imported content starts as drafts
- Image URLs are migrated to Pint hosting
- Slug conflicts are auto-resolved with suffix
- Import report with success/failure details

### Full Content Export
Complete data portability for users.

**Export Includes:**
- All posts and pages (Markdown + JSON)
- Images (original files)
- Site settings and configuration
- Widget configurations

**Export Formats:**
- Pint native (JSON) - for re-import
- Markdown bundle (ZIP) - universal compatibility

**Export Trigger:**
- Manual: Dashboard → Settings → Export
- Automatic: Monthly backup email (Pro/Max)

---

## 11. Monetization & Tiers

### Free Tier
Core blogging functionality with limits.

**Included:**
- Subdomain (`username.pint.im`)
- Up to 50 published posts
- Basic editor (no AI)
- 3 built-in color themes
- Basic widgets (font, theme switcher, single music track)
- RSS feed
- Basic analytics (views, likes)
- Pint branding in footer
- Search engine indexing (opt-in/opt-out)

### Pro Tier ($4.99/month)
All features except AI.

**Included (everything in Free, plus):**
- Unlimited posts
- Custom domain support (up to 3)
- All widgets (polls, extended Wall of Love, activity chart)
- Password-protected blogs (entire blog or per-post)
- Advanced SEO controls
- Remove Pint branding
- Advanced analytics
- Monthly backup exports
- Connect external analytics platforms
- Ability to link own analytics (Plausible, Fathom, etc.)

### Max Tier ($11.99/month)
Everything including AI.

**Included (everything in Pro, plus):**
- AI Editor (100 requests/month)
- All AI writing checks and assistance features
- Additional AI requests at $0.02 each

### Pricing Structure

| Plan | Price | Billing |
|------|-------|---------|
| Free | $0 | - |
| Pro Monthly | $4.99/month | Monthly |
| Pro Annual | $49.99/year | Annual |
| Max Monthly | $11.99/month | Monthly |
| Max Annual | $99.99/year | Annual |
| Lifetime | $124.99 one-time | Lifetime access to Pro features |

### Lifetime Deal
- One-time payment of $124.99
- Includes all Pro tier features forever
- **AI features require BYOK** (bring your own API key)
- Cap may be introduced later based on sustainability review

### Downgrade Behavior
When a Pro/Max user downgrades to Free:
- Latest 50 posts remain visible
- Older posts are hidden (not deleted)
- Custom domain stops working (redirects to subdomain)
- Pro widgets become disabled
- AI features stop working
- Full content remains accessible for export

### Payment Processing
**Stripe** - Industry standard, 2.9% + $0.30 per transaction
- Checkout for one-time and subscription
- Billing portal for subscription management
- No free trial; payment required upfront

---

## 12. Future Roadmap

### Phase 2 (Post-Launch)
- **Newsletter Functionality**
  - Collect subscriber emails
  - Send notifications when new posts are published
  - Basic analytics (opens, clicks)

- **Scheduled Publishing**
  - Schedule posts for future dates
  - Queue management in dashboard

- **Post Version History**
  - Track changes over time
  - Restore previous versions
  - Diff view

- **Comments System**
  - Subscriber-only comments
  - Threaded discussions
  - Moderation tools

### Phase 3 (Growth)
- **Paid Subscriptions**
  - Creators set subscription price
  - Paywalled content
  - Stripe Connect integration
  - Revenue dashboard

- **Advanced Analytics**
  - Traffic sources
  - Popular posts
  - Reader retention
  - Geographic data

- **Collaboration**
  - Multi-author blogs
  - Editorial workflow
  - Guest posts

### Phase 4 (Scale)
- **API Access**
  - Public API for integrations
  - Headless CMS mode
  - Webhooks

- **Mobile Apps**
  - iOS and Android apps
  - Native editor experience
  - Push notifications

- **Community Features**
  - Discover page for blogs (opt-in directory)
  - Cross-blog recommendations
  - Creator profiles

---

## 13. Technical Architecture

### Stack

**Frontend:**
| Component | Choice | Notes |
|-----------|--------|-------|
| Framework | Next.js 14+ (App Router) | Server components, optimal for Vercel |
| Styling | Tailwind CSS | Utility-first, consistent |
| UI Components | Radix Primitives + Custom | Maximum design flexibility |
| Editor | Tiptap | ProseMirror-based, extensible |
| State | Zustand or Jotai | Lightweight, performant |
| Animations | Framer Motion | Micro-interactions, transitions |

**Backend:**
| Component | Choice | Notes |
|-----------|--------|-------|
| Runtime | Next.js API Routes | Serverless, scales automatically |
| Database | Neon (PostgreSQL) | Serverless Postgres, branching |
| Auth | Clerk | Managed auth, great DX |
| Cache/Rate Limit | Vercel KV | Redis-compatible, serverless |
| Search | PostgreSQL full-text | Start simple, upgrade if needed |

**Infrastructure:**
| Component | Choice | Notes |
|-----------|--------|-------|
| Hosting | Vercel | Optimal for Next.js |
| CDN | Vercel Edge + Cloudflare (later) | Edge caching, custom domains |
| Media Storage | Cloudflare R2 | S3-compatible, no egress fees |
| Image Processing | Cloudflare Workers | Resize, optimize, WebP on-demand |
| Email | Resend (→ AWS SES at scale) | Developer-friendly, good deliverability |
| Monitoring | Sentry + Vercel | Error tracking + logs |
| AI | Vercel AI SDK + OpenRouter | Multi-provider support |

### Database Design

**Multi-Tenancy:**
- All tables include `tenant_id` column
- Row-level security (RLS) policies enforced
- Composite indexes: `(tenant_id, ...)` for all tenant queries
- Middleware sets tenant context per request

**Core Tables:**
```sql
-- Tenants (blogs)
tenants (
  id UUID PRIMARY KEY,
  subdomain VARCHAR UNIQUE NOT NULL,
  custom_domain VARCHAR UNIQUE,
  settings JSONB,
  tier ENUM('free', 'pro', 'max', 'lifetime'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Users (creators)
users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants,
  clerk_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  created_at TIMESTAMP
)

-- Posts
posts (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants,
  slug VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content JSONB NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR,
  status ENUM('draft', 'published'),
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(tenant_id, slug)
)

-- Pages
pages (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants,
  slug VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content JSONB NOT NULL,
  show_in_nav BOOLEAN DEFAULT true,
  nav_order INTEGER,
  status ENUM('draft', 'published'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(tenant_id, slug)
)

-- Widgets
widgets (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants,
  type VARCHAR NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB,
  display_order INTEGER
)

-- Likes
likes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts,
  ip_hash VARCHAR NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(post_id, ip_hash)
)

-- Wall of Love submissions
wall_of_love (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected'),
  created_at TIMESTAMP
)

-- Newsletter subscribers
subscribers (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants,
  email VARCHAR NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  UNIQUE(tenant_id, email)
)
```

### Media Hosting Strategy

**Upload Flow:**
1. Client requests signed upload URL from API
2. Direct upload to Cloudflare R2
3. Cloudflare Worker processes image on first request:
   - Resize to multiple dimensions (thumbnail, medium, large, original)
   - Convert to WebP for modern browsers
   - Cache transformed versions
4. Serve via R2 with CDN caching

**Limits:**
- No hard storage limits (fair use policy)
- Individual file max: 10MB for images, 50MB for audio
- Free tier naturally limited by 50 post cap

### Caching Strategy

**Hybrid approach:**
- **Posts/Pages:** ISR (Incremental Static Regeneration) - pre-render, revalidate on publish
- **Widgets:** Client-side fetch for dynamic data (likes, polls)
- **Static assets:** Edge cached via Vercel/Cloudflare

### Rate Limiting

**Vercel KV** for application-level rate limiting:
- Likes: 1 per post per IP per 24 hours
- API calls: Tiered by subscription level
- Form submissions: Anti-spam limits

**Cloudflare edge rate limiting** added if bot traffic becomes an issue.

### Security

- HTTPS everywhere (automatic via Vercel/Cloudflare)
- CSRF protection on all mutations
- Input sanitization and validation
- SQL injection prevention via parameterized queries
- XSS prevention via content security policy
- API key encryption at rest
- No secrets in client-side code

### Testing Strategy

**Unit + Integration testing:**
- Vitest for logic and utilities
- React Testing Library for components
- API route testing
- Multi-tenant isolation tests (critical)

**E2E for critical paths:**
- Auth flows
- Payment flows
- Publishing flow

### Content Moderation

**Reactive approach:**
- Clear Terms of Service
- Report mechanism for readers
- Manual review queue for reported content
- Takedown process documented

---

## 14. Blog Homepage & Navigation

### Homepage Layout
Minimalist, strictly defined layout:

**Top Section (Editable via block editor):**
- Heading/title
- Description
- Optional links

**Post Listing:**
| Year | Title | Date |
|------|-------|------|
| 2026 | Post title here | Jan 26 |
| 2026 | Another post | Jan 15 |
| 2025 | Older post | Dec 10 |

- Year displayed on left
- Post title (clickable) in center
- Published date on right
- Strictly minimal - no excerpts, no images, no cards

### Navigation
- Pages auto-appear in nav when published
- Creators can reorder pages in dashboard
- Simple flat navigation (no dropdowns)

---

## 15. SEO & Indexing

### Free Tier
- Can opt-in or opt-out of search engine indexing
- No advanced SEO controls

### Pro/Max Tier
- Full SEO control in advanced settings
- Per-post or site-wide configuration
- Custom meta titles and descriptions
- Open Graph image customization
- Sitemap generation
- Structured data (schema.org)

**UX Note:** Advanced settings should not overwhelm. Clean UI with sensible defaults, advanced options tucked away.

---

## 16. Password Protection (Pro/Max)

### Blog-Level Protection
- Single password protects entire blog
- Password set in dashboard settings
- Readers enter password once, stored in session

### Per-Post Protection
- Individual posts can have unique passwords
- Useful for exclusive content or client previews

---

## 17. Analytics

### Free Tier
- Basic counts: total views, views per post, total likes
- Simple dashboard display

### Pro/Max Tier
- Advanced analytics dashboard
- Views over time
- Popular posts
- Geographic data (privacy-friendly, aggregate only)
- Referrer tracking

### External Analytics
- All tiers can connect external analytics (Plausible, Fathom, Google Analytics)
- Script injection in settings

---

## 18. UI & Design Philosophy

### Visual Aesthetic
- **Custom Pint aesthetic** - defined separately in design system
- Linear-level design ideology (not style)
- Micro-interactions and animations throughout
- Consistency via component-based architecture

### Component Architecture
- **Radix Primitives** for accessible, unstyled base components
- Fully custom styling on top
- Nothing hardcoded - everything is a reusable component
- Flexibility to customize any element

### Theme System
- Predefined color palettes (specific colors defined in design system)
- Predefined font families matching Pint aesthetic
- Predefined font sizes
- Creator sets defaults
- Readers can customize if widget enabled

### Dashboard Design
- To be designed separately
- Should feel cohesive with public blog aesthetic

---

## 19. Accessibility & Compliance

### Accessibility (Good to Have)
- WCAG 2.1 AA compliance target
- Screen reader support
- Keyboard navigation throughout
- Focus indicators
- Proper heading hierarchy
- Alt text for images (creator-provided)

### Localization (Future)
- Dashboard i18n support planned
- Blog content is creator-managed (any language)

### Legal Requirements
- Terms of Service
- Privacy Policy
- Cookie consent (if using analytics cookies)
- GDPR compliance for EU users

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Tenant | A single blog/site on the platform |
| Creator | User who owns and manages a blog |
| Reader | Visitor who consumes blog content |
| Widget | Modular floating component in bottom-right |
| Block | Individual content element in editor |
| BYOK | Bring Your Own Key (API key for AI) |

## Appendix B: Success Metrics

**Launch Goals (First 3 Months):**
- 1,000 registered creators
- 500 active blogs (1+ published posts)
- 100 paid subscribers (Pro or Max)
- <500ms average page load time

**Growth Metrics:**
- Creator activation rate (signup → first post)
- Free → paid conversion rate
- Monthly active creators
- Reader engagement (likes, time on site)
- Churn rate (subscription cancellations)

## Appendix C: Go-to-Market

**Launch Strategy:**
- Multiple channels: Indie Hackers, Twitter/X, Reddit
- Product Hunt launch
- Content marketing
- Word of mouth from early users

**Discovery:**
- No public explore/discovery page at launch
- Future consideration based on community growth

---

*Document maintained by Pint Product Team*
*Last updated: January 2026*
*Version: 2.0*
