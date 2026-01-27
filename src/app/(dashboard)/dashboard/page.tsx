/**
 * Dashboard Page
 *
 * Protected route that requires authentication and completed onboarding.
 * Will be fully implemented in a later phase.
 */

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/auth/tenant'

export default async function DashboardPage() {
  const { userId } = await auth()

  // Not authenticated - Clerk middleware should handle this,
  // but double-check just in case
  if (!userId) {
    redirect('/sign-in')
  }

  // Get user and check onboarding status
  const user = await getCurrentUser()

  // User not in database yet (webhook pending)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <p className="mt-4 text-gray-600">Setting up your account...</p>
          <p className="mt-2 text-sm text-gray-500">
            Please refresh the page in a moment.
          </p>
        </div>
      </div>
    )
  }

  // Not onboarded - redirect to onboarding
  if (!user.onboardingComplete || !user.tenantId) {
    redirect('/onboarding')
  }

  // User is authenticated and onboarded
  const tenant = user.tenant

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your dashboard, {tenant?.subdomain || 'user'}!
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Your blog is at:{' '}
          <a
            href={`/?subdomain=${tenant?.subdomain}`}
            className="underline hover:text-gray-700"
          >
            {tenant?.subdomain}.pint.im
          </a>
        </p>
      </div>
    </div>
  )
}
