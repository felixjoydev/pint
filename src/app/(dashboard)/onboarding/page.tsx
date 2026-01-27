/**
 * Onboarding Page
 *
 * Where new users set up their blog after signing up.
 * Collects blog name and subdomain.
 */

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'

export default async function OnboardingPage() {
  const { userId } = await auth()

  // Not authenticated - redirect to sign-in
  if (!userId) {
    redirect('/sign-in')
  }

  // Check if user exists and their onboarding status
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      onboardingComplete: true,
      tenantId: true,
    },
  })

  // User doesn't exist in our DB yet (webhook might not have fired)
  // This is a rare edge case - wait for webhook
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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

  // Already onboarded - redirect to dashboard
  if (user.onboardingComplete && user.tenantId) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Set up your blog
          </h1>
          <p className="mt-2 text-gray-600">
            Choose a name and subdomain for your blog. You can always change
            these later.
          </p>
        </div>

        {/* Form */}
        <OnboardingForm />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By creating a blog, you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
