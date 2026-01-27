/**
 * Complete Onboarding API
 *
 * POST /api/onboarding/complete
 * Body: { blogName: string, subdomain: string }
 *
 * Creates tenant, links to user, and marks onboarding complete.
 * Requires authentication.
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { onboardingSchema } from '@/lib/validations/onboarding'
import { checkSubdomainAvailability } from '@/lib/tenant/resolve'

export async function POST(request: Request) {
  // Require authentication
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      tenantId: true,
      onboardingComplete: true,
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found. Please try again in a moment.' },
      { status: 404 }
    )
  }

  // Check if already onboarded
  if (user.onboardingComplete && user.tenantId) {
    return NextResponse.json(
      { error: 'You have already completed onboarding.' },
      { status: 400 }
    )
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const validation = onboardingSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const { blogName, subdomain } = validation.data
  const normalizedSubdomain = subdomain.toLowerCase()

  // Final availability check (race condition protection)
  const availability = await checkSubdomainAvailability(normalizedSubdomain)

  if (!availability.available) {
    return NextResponse.json(
      { error: availability.reason || 'Subdomain is not available' },
      { status: 400 }
    )
  }

  // Create tenant and update user in a transaction
  try {
    const tenant = await prisma.$transaction(async (tx) => {
      // Create tenant
      const newTenant = await tx.tenant.create({
        data: {
          subdomain: normalizedSubdomain,
          tier: 'free',
          settings: {
            title: blogName.trim(),
            description: '',
            theme: 'default',
          },
        },
      })

      // Update user with tenant and mark onboarding complete
      await tx.user.update({
        where: { id: user.id },
        data: {
          tenantId: newTenant.id,
          onboardingComplete: true,
        },
      })

      // Create default widgets
      await tx.widget.createMany({
        data: [
          {
            tenantId: newTenant.id,
            type: 'theme_switcher',
            enabled: true,
            displayOrder: 1,
            config: {},
          },
          {
            tenantId: newTenant.id,
            type: 'font_customizer',
            enabled: true,
            displayOrder: 2,
            config: {},
          },
          {
            tenantId: newTenant.id,
            type: 'music_player',
            enabled: false,
            displayOrder: 3,
            config: {},
          },
        ],
      })

      return newTenant
    })

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
      },
    })
  } catch (error) {
    console.error('Onboarding error:', error)

    // Check for unique constraint violation (subdomain taken)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: 'This subdomain was just taken. Please try another.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
