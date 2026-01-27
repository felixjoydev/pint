import { Tier } from '@prisma/client'
import { getCurrentTenant } from './tenant'

/**
 * Tier hierarchy for feature access
 * Higher index = more features
 */
const TIER_HIERARCHY: Tier[] = ['free', 'pro', 'max', 'lifetime']

/**
 * Check if a tier has access to a feature that requires a minimum tier
 */
export function tierHasAccess(userTier: Tier, requiredTier: Tier): boolean {
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier)
  const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier)
  return userTierIndex >= requiredTierIndex
}

/**
 * Feature flags based on tier
 */
export const TIER_FEATURES = {
  free: {
    maxPosts: 50,
    customDomain: false,
    aiEditor: false,
    aiRequestsPerMonth: 0,
  },
  pro: {
    maxPosts: Infinity,
    customDomain: true,
    aiEditor: false,
    aiRequestsPerMonth: 0,
  },
  max: {
    maxPosts: Infinity,
    customDomain: true,
    aiEditor: true,
    aiRequestsPerMonth: 100,
  },
  lifetime: {
    maxPosts: Infinity,
    customDomain: true,
    aiEditor: true, // Requires BYOK (Bring Your Own Key)
    aiRequestsPerMonth: Infinity, // With own key
  },
} as const

/**
 * Check if current user can access a feature requiring a minimum tier
 */
export async function canAccessFeature(requiredTier: Tier): Promise<boolean> {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    return false
  }

  return tierHasAccess(tenant.tier, requiredTier)
}

/**
 * Get feature limits for current tenant
 */
export async function getFeatureLimits() {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    return TIER_FEATURES.free
  }

  return TIER_FEATURES[tenant.tier]
}
