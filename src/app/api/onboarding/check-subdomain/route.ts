/**
 * Check Subdomain Availability API
 *
 * GET /api/onboarding/check-subdomain?subdomain=myblog
 *
 * Returns whether a subdomain is available for registration.
 * Requires authentication.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkSubdomainAvailability, isSubdomainValid } from '@/lib/tenant/resolve'

export async function GET(request: Request) {
  // Require authentication
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get subdomain from query params
  const { searchParams } = new URL(request.url)
  const subdomain = searchParams.get('subdomain')?.toLowerCase().trim()

  if (!subdomain) {
    return NextResponse.json(
      { error: 'Subdomain is required' },
      { status: 400 }
    )
  }

  // Check basic validity first (fast path)
  if (!isSubdomainValid(subdomain)) {
    return NextResponse.json({
      available: false,
      reason: 'Invalid subdomain format or reserved',
    })
  }

  // Check database availability
  const result = await checkSubdomainAvailability(subdomain)

  return NextResponse.json(result)
}
