/**
 * Widget Validation Schemas
 *
 * Zod schemas for validating widget API requests.
 */

import { z } from 'zod'

/**
 * Schema for updating a single widget.
 */
export const updateWidgetSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
  displayOrder: z.number().int().min(0).optional(),
})

/**
 * Schema for bulk updating widget order.
 */
export const updateWidgetOrderSchema = z.object({
  widgets: z
    .array(
      z.object({
        id: z.string().uuid('Invalid widget ID'),
        displayOrder: z.number().int().min(0),
      })
    )
    .min(1, 'At least one widget required'),
})

/**
 * TypeScript types inferred from schemas.
 */
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>
export type UpdateWidgetOrderInput = z.infer<typeof updateWidgetOrderSchema>
