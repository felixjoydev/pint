import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

/**
 * Get the current user from the database (if authenticated)
 * Returns null if not authenticated or user not found
 */
export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { tenant: true },
  })

  return user
}

/**
 * Get the current user, throwing an error if not authenticated
 * Use in protected routes/actions where authentication is required
 */
export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return user
}

/**
 * Get the current tenant (if user is authenticated and has completed onboarding)
 * Returns null if not authenticated or user hasn't completed onboarding
 */
export async function getCurrentTenant() {
  const user = await getCurrentUser()

  if (!user || !user.tenant) {
    return null
  }

  return user.tenant
}

/**
 * Get the current tenant, throwing an error if not available
 * Use in routes/actions that require a tenant (post-onboarding)
 */
export async function requireTenant() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (!user.tenant) {
    throw new Error('Onboarding not complete')
  }

  return user.tenant
}

/**
 * Check if the current user has completed onboarding
 */
export async function hasCompletedOnboarding() {
  const user = await getCurrentUser()
  return user?.onboardingComplete ?? false
}
