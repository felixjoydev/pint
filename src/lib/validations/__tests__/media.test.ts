import { describe, it, expect } from 'vitest'
import {
  uploadRequestSchema,
  uploadConfirmSchema,
  mediaListQuerySchema,
} from '../media'
import { MAX_IMAGE_SIZE, MAX_AUDIO_SIZE } from '@/lib/storage/constants'

describe('Media Validation Schemas', () => {
  describe('uploadRequestSchema', () => {
    // Valid cases
    it('accepts valid image upload (jpeg, 5MB)', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 5 * 1024 * 1024,
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid audio upload (mp3, 40MB)', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'song.mp3',
        mimeType: 'audio/mpeg',
        size: 40 * 1024 * 1024,
      })
      expect(result.success).toBe(true)
    })

    it('accepts filename with dots and hyphens', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'my-photo.test.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      })
      expect(result.success).toBe(true)
    })

    it('accepts filename with underscores', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'my_photo_2024.png',
        mimeType: 'image/png',
        size: 1000,
      })
      expect(result.success).toBe(true)
    })

    it('accepts all supported image types', () => {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      imageTypes.forEach((mimeType) => {
        const result = uploadRequestSchema.safeParse({
          filename: 'test.jpg',
          mimeType,
          size: 1000,
        })
        expect(result.success).toBe(true)
      })
    })

    it('accepts all supported audio types', () => {
      const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg']
      audioTypes.forEach((mimeType) => {
        const result = uploadRequestSchema.safeParse({
          filename: 'test.mp3',
          mimeType,
          size: 1000,
        })
        expect(result.success).toBe(true)
      })
    })

    // Invalid MIME types
    it('rejects unsupported MIME type (application/pdf)', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1000,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Unsupported file type')
      }
    })

    it('rejects unsupported MIME type (video/mp4)', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'video.mp4',
        mimeType: 'video/mp4',
        size: 1000,
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty MIME type', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'test.jpg',
        mimeType: '',
        size: 1000,
      })
      expect(result.success).toBe(false)
    })

    // Size validation
    it('rejects image exceeding 10MB limit', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'large.jpg',
        mimeType: 'image/jpeg',
        size: MAX_IMAGE_SIZE + 1,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const sizeError = result.error.issues.find(
          (i) => i.path.includes('size') || i.message.includes('10MB')
        )
        expect(sizeError).toBeDefined()
        expect(sizeError?.message).toContain('10MB')
      }
    })

    it('accepts image at exactly 10MB', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'exact.jpg',
        mimeType: 'image/jpeg',
        size: MAX_IMAGE_SIZE,
      })
      expect(result.success).toBe(true)
    })

    it('rejects audio exceeding 50MB limit', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'large.mp3',
        mimeType: 'audio/mpeg',
        size: MAX_AUDIO_SIZE + 1,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const sizeError = result.error.issues.find(
          (i) => i.path.includes('size') || i.message.includes('50MB')
        )
        expect(sizeError).toBeDefined()
        expect(sizeError?.message).toContain('50MB')
      }
    })

    it('accepts audio at exactly 50MB', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'exact.mp3',
        mimeType: 'audio/mpeg',
        size: MAX_AUDIO_SIZE,
      })
      expect(result.success).toBe(true)
    })

    it('rejects zero size', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 0,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive')
      }
    })

    it('rejects negative size', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: -1000,
      })
      expect(result.success).toBe(false)
    })

    // Filename validation
    it('rejects empty filename', () => {
      const result = uploadRequestSchema.safeParse({
        filename: '',
        mimeType: 'image/jpeg',
        size: 1000,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('rejects filename over 255 chars', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'a'.repeat(256) + '.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too long')
      }
    })

    it('accepts filename at exactly 255 chars', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'a'.repeat(251) + '.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      })
      expect(result.success).toBe(true)
    })

    it('rejects filename with spaces', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'my photo.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('letters, numbers')
      }
    })

    it('rejects filename with special characters', () => {
      const specialChars = ['@', '#', '$', '%', '&', '*', '!', '?', '/', '\\']
      specialChars.forEach((char) => {
        const result = uploadRequestSchema.safeParse({
          filename: `test${char}file.jpg`,
          mimeType: 'image/jpeg',
          size: 1000,
        })
        expect(result.success).toBe(false)
      })
    })

    // Error messages
    it('provides correct error message for oversized image', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'large.png',
        mimeType: 'image/png',
        size: 15 * 1024 * 1024,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message)
        expect(errorMessages).toContain('Image files must be under 10MB')
      }
    })

    it('provides correct error message for oversized audio', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'large.wav',
        mimeType: 'audio/wav',
        size: 60 * 1024 * 1024,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message)
        expect(errorMessages).toContain('Audio files must be under 50MB')
      }
    })

    // Missing required fields
    it('rejects missing filename', () => {
      const result = uploadRequestSchema.safeParse({
        mimeType: 'image/jpeg',
        size: 1000,
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing mimeType', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'test.jpg',
        size: 1000,
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing size', () => {
      const result = uploadRequestSchema.safeParse({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('uploadConfirmSchema', () => {
    it('accepts empty object', () => {
      const result = uploadConfirmSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts valid size', () => {
      const result = uploadConfirmSchema.safeParse({
        size: 5000,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.size).toBe(5000)
      }
    })

    it('rejects zero size', () => {
      const result = uploadConfirmSchema.safeParse({
        size: 0,
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative size', () => {
      const result = uploadConfirmSchema.safeParse({
        size: -100,
      })
      expect(result.success).toBe(false)
    })

    it('accepts undefined size', () => {
      const result = uploadConfirmSchema.safeParse({
        size: undefined,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.size).toBeUndefined()
      }
    })
  })

  describe('mediaListQuerySchema', () => {
    it('applies default values for empty object', () => {
      const result = mediaListQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('all')
        expect(result.data.limit).toBe(50)
        expect(result.data.cursor).toBeUndefined()
      }
    })

    it('accepts type=image', () => {
      const result = mediaListQuerySchema.safeParse({ type: 'image' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('image')
      }
    })

    it('accepts type=audio', () => {
      const result = mediaListQuerySchema.safeParse({ type: 'audio' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('audio')
      }
    })

    it('accepts type=all', () => {
      const result = mediaListQuerySchema.safeParse({ type: 'all' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('all')
      }
    })

    it('rejects invalid type', () => {
      const result = mediaListQuerySchema.safeParse({ type: 'video' })
      expect(result.success).toBe(false)
    })

    it('accepts limit within range (1-100)', () => {
      const limits = [1, 25, 50, 75, 100]
      limits.forEach((limit) => {
        const result = mediaListQuerySchema.safeParse({ limit })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.limit).toBe(limit)
        }
      })
    })

    it('rejects limit below 1', () => {
      const result = mediaListQuerySchema.safeParse({ limit: 0 })
      expect(result.success).toBe(false)
    })

    it('rejects limit above 100', () => {
      const result = mediaListQuerySchema.safeParse({ limit: 101 })
      expect(result.success).toBe(false)
    })

    it('coerces string limit to number', () => {
      const result = mediaListQuerySchema.safeParse({ limit: '25' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(25)
      }
    })

    it('accepts valid UUID cursor', () => {
      const result = mediaListQuerySchema.safeParse({
        cursor: '123e4567-e89b-12d3-a456-426614174000',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid cursor format', () => {
      const result = mediaListQuerySchema.safeParse({
        cursor: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })

    it('rejects cursor that is not a valid UUID', () => {
      const result = mediaListQuerySchema.safeParse({
        cursor: '12345',
      })
      expect(result.success).toBe(false)
    })

    it('accepts all parameters together', () => {
      const result = mediaListQuerySchema.safeParse({
        type: 'image',
        limit: 20,
        cursor: '123e4567-e89b-12d3-a456-426614174000',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('image')
        expect(result.data.limit).toBe(20)
        expect(result.data.cursor).toBe('123e4567-e89b-12d3-a456-426614174000')
      }
    })
  })
})
