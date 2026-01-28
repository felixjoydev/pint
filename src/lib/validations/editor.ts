/**
 * Editor Validation Schemas
 *
 * Zod schemas for validating Tiptap editor content.
 */

import { z } from 'zod'

/**
 * Schema for Tiptap mark (inline formatting like bold, italic, link).
 */
export const markSchema = z.object({
  type: z.string(),
  attrs: z.any().optional(),
})

/**
 * Recursive schema for Tiptap JSON content.
 * Represents the structure of ProseMirror/Tiptap documents.
 *
 * Note: Uses z.any() for attrs to avoid Zod v4 issues with recursive
 * z.record() types. Content is still validated for proper structure.
 */
export const jsonContentSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.any().optional(),
    content: z.array(jsonContentSchema).optional(),
    marks: z.array(markSchema).optional(),
    text: z.string().optional(),
  })
)

/**
 * Schema for the complete editor document content.
 */
export const editorContentSchema = jsonContentSchema

/**
 * Schema for post content with metadata.
 */
export const postContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: editorContentSchema,
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
})

/**
 * Schema for editor save payload.
 */
export const editorSaveSchema = z.object({
  content: editorContentSchema,
  wordCount: z.number().int().nonnegative().optional(),
  characterCount: z.number().int().nonnegative().optional(),
})

/**
 * TypeScript types inferred from schemas.
 */
export type JsonContent = z.infer<typeof jsonContentSchema>
export type EditorContent = z.infer<typeof editorContentSchema>
export type PostContent = z.infer<typeof postContentSchema>
export type EditorSave = z.infer<typeof editorSaveSchema>
