'use client'

/**
 * Onboarding Form Component
 *
 * Client component for collecting blog name and subdomain during onboarding.
 * Features real-time subdomain availability checking and URL preview.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations/onboarding'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'pint.im'

export function OnboardingForm() {
  const router = useRouter()
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean | null
    reason?: string
  }>({ available: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      blogName: '',
      subdomain: '',
    },
    mode: 'onChange',
  })

  const subdomain = watch('subdomain')
  const blogName = watch('blogName')

  // Debounced subdomain availability check
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setAvailabilityStatus({ available: null })
      return
    }

    setIsCheckingAvailability(true)
    try {
      const res = await fetch(
        `/api/onboarding/check-subdomain?subdomain=${encodeURIComponent(value)}`
      )
      const data = await res.json()

      if (res.ok) {
        setAvailabilityStatus({
          available: data.available,
          reason: data.reason,
        })
      } else {
        setAvailabilityStatus({ available: null })
      }
    } catch {
      setAvailabilityStatus({ available: null })
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [])

  // Debounce effect for availability check
  useEffect(() => {
    const normalizedSubdomain = subdomain?.toLowerCase().trim()

    if (!normalizedSubdomain || normalizedSubdomain.length < 3) {
      setAvailabilityStatus({ available: null })
      return
    }

    // Check for validation errors first
    if (errors.subdomain) {
      setAvailabilityStatus({ available: null })
      return
    }

    const timer = setTimeout(() => {
      checkAvailability(normalizedSubdomain)
    }, 500)

    return () => clearTimeout(timer)
  }, [subdomain, errors.subdomain, checkAvailability])

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSubmitError(result.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    blogName?.length >= 2 &&
    subdomain?.length >= 3 &&
    !errors.blogName &&
    !errors.subdomain &&
    availabilityStatus.available === true

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Blog Name Field */}
      <div>
        <label
          htmlFor="blogName"
          className="block text-sm font-medium text-gray-700"
        >
          Blog Name
        </label>
        <input
          {...register('blogName')}
          type="text"
          id="blogName"
          placeholder="My Awesome Blog"
          autoComplete="off"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        {errors.blogName && (
          <p className="mt-1 text-sm text-red-600">{errors.blogName.message}</p>
        )}
      </div>

      {/* Subdomain Field */}
      <div>
        <label
          htmlFor="subdomain"
          className="block text-sm font-medium text-gray-700"
        >
          Subdomain
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            {...register('subdomain')}
            type="text"
            id="subdomain"
            placeholder="myblog"
            autoComplete="off"
            className="block w-full rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            .{ROOT_DOMAIN}
          </span>
        </div>

        {/* Validation Error */}
        {errors.subdomain && (
          <p className="mt-1 text-sm text-red-600">{errors.subdomain.message}</p>
        )}

        {/* Availability Status */}
        {!errors.subdomain && subdomain && subdomain.length >= 3 && (
          <div className="mt-1">
            {isCheckingAvailability && (
              <p className="text-sm text-gray-500">Checking availability...</p>
            )}
            {!isCheckingAvailability && availabilityStatus.available === true && (
              <p className="text-sm text-green-600">
                This subdomain is available!
              </p>
            )}
            {!isCheckingAvailability && availabilityStatus.available === false && (
              <p className="text-sm text-red-600">
                {availabilityStatus.reason || 'This subdomain is not available'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* URL Preview */}
      {subdomain && subdomain.length >= 3 && !errors.subdomain && (
        <div className="rounded-md bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Your blog will be available at:</p>
          <p className="mt-1 text-lg font-medium text-gray-900">
            https://{subdomain.toLowerCase()}.{ROOT_DOMAIN}
          </p>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Creating your blog...' : 'Create Blog'}
      </button>
    </form>
  )
}
