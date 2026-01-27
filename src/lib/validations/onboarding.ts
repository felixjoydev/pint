/**
 * Onboarding Validation Schema
 *
 * Zod schemas for validating onboarding form data.
 */

import { z } from 'zod'
import { RESERVED_SUBDOMAINS } from '@/lib/tenant/constants'

/**
 * Schema for the onboarding form.
 */
export const onboardingSchema = z.object({
  blogName: z
    .string()
    .min(2, 'Blog name must be at least 2 characters')
    .max(50, 'Blog name must be less than 50 characters')
    .trim(),

  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be less than 30 characters')
    .toLowerCase()
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{3}$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens (cannot start or end with hyphen)'
    )
    .refine(
      (val) => !val.includes('--'),
      'Subdomain cannot contain consecutive hyphens'
    )
    .refine(
      (val) => !RESERVED_SUBDOMAINS.includes(val as any),
      'This subdomain is reserved'
    ),
})

/**
 * Type for the onboarding form data.
 */
export type OnboardingFormData = z.infer<typeof onboardingSchema>

/**
 * Schema for subdomain-only validation (for availability check).
 */
export const subdomainSchema = onboardingSchema.pick({ subdomain: true })
