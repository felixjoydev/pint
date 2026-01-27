/**
 * Post Validation Schemas
 *
 * Zod schemas for validating post API requests.
 */

import { z } from 'zod'

/**
 * Schema for creating a new post.
 */
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format')
    .optional(),
  content: z.any(), // Tiptap JSON
  excerpt: z.string().max(500).optional(),
  featuredImage: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
  status: z.enum(['draft', 'published']).default('draft'),
  password: z.string().optional(),
})

/**
 * Schema for updating an existing post.
 * All fields are optional for partial updates.
 */
export const updatePostSchema = createPostSchema.partial()

/**
 * TypeScript types inferred from schemas.
 */
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
