/**
 * Page Validation Schemas
 *
 * Zod schemas for validating page API requests.
 */

import { z } from 'zod'

/**
 * Schema for creating a new page.
 */
export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format')
    .optional(),
  content: z.any(), // Tiptap JSON
  showInNav: z.boolean().default(true),
  navOrder: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
})

/**
 * Schema for updating an existing page.
 * All fields are optional for partial updates.
 */
export const updatePageSchema = createPageSchema.partial()

/**
 * TypeScript types inferred from schemas.
 */
export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
