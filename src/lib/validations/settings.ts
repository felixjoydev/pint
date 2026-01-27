/**
 * Settings Validation Schema
 *
 * Zod schema for validating tenant settings API requests.
 */

import { z } from 'zod'

/**
 * Schema for updating tenant settings.
 * All fields are optional since settings are stored as JSONB and merged.
 */
export const updateSettingsSchema = z.object({
  // Branding
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  language: z.string().length(2).optional(),

  // Appearance
  defaultTheme: z.enum(['light', 'dark', 'sepia']).optional(),
  defaultFont: z.string().optional(),
  defaultFontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),

  // SEO (Pro/Max only)
  seoEnabled: z.boolean().optional(),
  robotsIndexing: z.boolean().optional(),
  customMetaTitle: z.string().max(60).optional(),
  customMetaDescription: z.string().max(160).optional(),

  // Features
  likesEnabled: z.boolean().optional(),
  likesPublic: z.boolean().optional(),

  // RSS
  rssFullContent: z.boolean().optional(),
  rssItemCount: z.number().int().min(10).max(100).optional(),

  // Analytics (Pro/Max only)
  analyticsEnabled: z.boolean().optional(),
  externalAnalyticsScript: z.string().optional(),

  // Homepage
  homepageContent: z.any().optional(),
})

/**
 * TypeScript type inferred from schema.
 */
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
