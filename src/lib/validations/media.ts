/**
 * Media Validation Schemas
 * Zod schemas for validating media upload requests.
 */

import { z } from 'zod'
import {
  SUPPORTED_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_AUDIO_SIZE,
  isSupportedMimeType,
  isImageMimeType,
} from '@/lib/storage/constants'

/**
 * Schema for requesting a presigned upload URL.
 */
export const uploadRequestSchema = z
  .object({
    filename: z
      .string()
      .min(1, 'Filename is required')
      .max(255, 'Filename too long')
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Filename can only contain letters, numbers, dots, underscores, and hyphens'
      ),
    mimeType: z.string().refine(isSupportedMimeType, {
      message: `Unsupported file type. Allowed: ${SUPPORTED_MIME_TYPES.join(', ')}`,
    }),
    size: z.number().positive('Size must be positive'),
  })
  .superRefine((data, ctx) => {
    // Only validate size if mimeType is supported
    if (!isSupportedMimeType(data.mimeType)) {
      return
    }

    const maxSize = isImageMimeType(data.mimeType)
      ? MAX_IMAGE_SIZE
      : MAX_AUDIO_SIZE

    if (data.size > maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: isImageMimeType(data.mimeType)
          ? `Image files must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
          : `Audio files must be under ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
        path: ['size'],
      })
    }
  })

/**
 * Schema for confirming an upload is complete.
 */
export const uploadConfirmSchema = z.object({
  size: z.number().positive('Size must be positive').optional(),
})

/**
 * Schema for listing media files.
 */
export const mediaListQuerySchema = z.object({
  type: z.enum(['image', 'audio', 'all']).optional().default('all'),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
})

/**
 * TypeScript types inferred from schemas.
 */
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>
export type UploadConfirmInput = z.infer<typeof uploadConfirmSchema>
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>
