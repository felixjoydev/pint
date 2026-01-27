/**
 * Onboarding Status API
 *
 * GET /api/auth/onboarding-status
 *
 * Returns the current user's onboarding status.
 * Used by middleware and client components to check onboarding state.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      onboardingComplete: false,
    })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      onboardingComplete: true,
      tenantId: true,
      tenant: {
        select: {
          subdomain: true,
        },
      },
    },
  })

  if (!user) {
    // User authenticated with Clerk but not in our database yet
    // (webhook might not have fired)
    return NextResponse.json({
      authenticated: true,
      onboardingComplete: false,
      userExists: false,
    })
  }

  return NextResponse.json({
    authenticated: true,
    onboardingComplete: user.onboardingComplete && !!user.tenantId,
    userExists: true,
    subdomain: user.tenant?.subdomain || null,
  })
}
