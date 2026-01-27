import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { extractSubdomain } from '@/lib/tenant/resolve'

/**
 * Public routes that don't require authentication on main app.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/likes(.*)',
  '/api/subscribe(.*)',
  '/api/onboarding(.*)', // Auth handled in route handlers
  '/api/auth(.*)', // Auth status endpoints
])

/**
 * Get subdomain from request.
 *
 * In production: extracts from hostname (myblog.pint.im → myblog)
 * In development: also supports ?subdomain=myblog query param for easier testing
 */
function getSubdomainFromRequest(request: Request): string | null {
  const url = new URL(request.url)

  // Development fallback: check query param first
  if (process.env.NODE_ENV === 'development') {
    const querySubdomain = url.searchParams.get('subdomain')
    if (querySubdomain) {
      return querySubdomain.toLowerCase()
    }
  }

  // Production: extract from hostname
  const hostname = request.headers.get('host') || ''
  return extractSubdomain(hostname)
}

export default clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl

  // Skip subdomain rewriting for API routes
  const isApiRoute = url.pathname.startsWith('/api/')

  const subdomain = isApiRoute ? null : getSubdomainFromRequest(request)

  // If subdomain exists, this is a tenant blog request
  // Rewrite to blog routes: myblog.pint.im/post → /(blog)/myblog/post
  if (subdomain) {
    // Build the rewritten path
    // / → /[subdomain]
    // /post-slug → /[subdomain]/post-slug
    const pathWithoutLeadingSlash = url.pathname.slice(1)
    const newPath = pathWithoutLeadingSlash
      ? `/${subdomain}/${pathWithoutLeadingSlash}`
      : `/${subdomain}`

    // Create rewrite response
    const rewriteUrl = new URL(newPath, request.url)

    // Preserve query params (except subdomain in dev mode)
    url.searchParams.forEach((value, key) => {
      if (key !== 'subdomain') {
        rewriteUrl.searchParams.set(key, value)
      }
    })

    const response = NextResponse.rewrite(rewriteUrl)

    // Set subdomain header for downstream use (layouts, pages)
    response.headers.set('x-tenant-subdomain', subdomain)

    return response
  }

  // Main app routes - protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
