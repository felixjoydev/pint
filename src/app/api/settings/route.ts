/**
 * Settings API - Get & Update Tenant Settings
 *
 * GET /api/settings - Get current tenant settings
 * PATCH /api/settings - Update tenant settings
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError, TierLimitError } from '@/lib/api/errors'
import { updateSettingsSchema, type UpdateSettingsInput } from '@/lib/validations/settings'

// Settings that require Pro tier or higher
const PRO_SETTINGS: (keyof UpdateSettingsInput)[] = [
  'seoEnabled',
  'robotsIndexing',
  'customMetaTitle',
  'customMetaDescription',
  'externalAnalyticsScript',
]

/**
 * GET /api/settings
 * Get current tenant settings.
 */
export async function GET(_request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    return successResponse({
      settings: tenant.settings,
      tier: tenant.tier,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/settings
 * Update tenant settings.
 */
export async function PATCH(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    // Check tier restrictions
    if (tenant.tier === 'free') {
      const restrictedKeys = PRO_SETTINGS.filter(
        (key) => data[key] !== undefined
      )
      if (restrictedKeys.length > 0) {
        throw new TierLimitError(restrictedKeys[0], 'Pro')
      }
    }

    // Merge with existing settings
    const currentSettings = (tenant.settings as Record<string, unknown>) || {}
    const newSettings = { ...currentSettings, ...data }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { settings: newSettings },
      select: { settings: true, tier: true },
    })

    return successResponse({
      settings: updated.settings,
      tier: updated.tier,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
