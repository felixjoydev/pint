import { describe, it, expect } from 'vitest'
import {
  isSupportedMimeType,
  isImageMimeType,
  isAudioMimeType,
  getMaxFileSize,
  MAX_IMAGE_SIZE,
  MAX_AUDIO_SIZE,
  IMAGE_MIME_TYPES,
  AUDIO_MIME_TYPES,
  SUPPORTED_MIME_TYPES,
  MIME_TO_EXTENSION,
} from '../constants'

describe('Storage Constants', () => {
  describe('MIME type arrays', () => {
    it('IMAGE_MIME_TYPES contains expected types', () => {
      expect(IMAGE_MIME_TYPES).toContain('image/jpeg')
      expect(IMAGE_MIME_TYPES).toContain('image/png')
      expect(IMAGE_MIME_TYPES).toContain('image/gif')
      expect(IMAGE_MIME_TYPES).toContain('image/webp')
      expect(IMAGE_MIME_TYPES).toHaveLength(4)
    })

    it('AUDIO_MIME_TYPES contains expected types', () => {
      expect(AUDIO_MIME_TYPES).toContain('audio/mpeg')
      expect(AUDIO_MIME_TYPES).toContain('audio/wav')
      expect(AUDIO_MIME_TYPES).toContain('audio/ogg')
      expect(AUDIO_MIME_TYPES).toHaveLength(3)
    })

    it('SUPPORTED_MIME_TYPES is union of image and audio', () => {
      expect(SUPPORTED_MIME_TYPES).toHaveLength(7)
      IMAGE_MIME_TYPES.forEach((type) => {
        expect(SUPPORTED_MIME_TYPES).toContain(type)
      })
      AUDIO_MIME_TYPES.forEach((type) => {
        expect(SUPPORTED_MIME_TYPES).toContain(type)
      })
    })
  })

  describe('MIME_TO_EXTENSION', () => {
    it('maps image types to correct extensions', () => {
      expect(MIME_TO_EXTENSION['image/jpeg']).toBe('.jpg')
      expect(MIME_TO_EXTENSION['image/png']).toBe('.png')
      expect(MIME_TO_EXTENSION['image/gif']).toBe('.gif')
      expect(MIME_TO_EXTENSION['image/webp']).toBe('.webp')
    })

    it('maps audio types to correct extensions', () => {
      expect(MIME_TO_EXTENSION['audio/mpeg']).toBe('.mp3')
      expect(MIME_TO_EXTENSION['audio/wav']).toBe('.wav')
      expect(MIME_TO_EXTENSION['audio/ogg']).toBe('.ogg')
    })
  })

  describe('isSupportedMimeType', () => {
    it('returns true for image/jpeg', () => {
      expect(isSupportedMimeType('image/jpeg')).toBe(true)
    })

    it('returns true for image/png', () => {
      expect(isSupportedMimeType('image/png')).toBe(true)
    })

    it('returns true for image/gif', () => {
      expect(isSupportedMimeType('image/gif')).toBe(true)
    })

    it('returns true for image/webp', () => {
      expect(isSupportedMimeType('image/webp')).toBe(true)
    })

    it('returns true for audio/mpeg', () => {
      expect(isSupportedMimeType('audio/mpeg')).toBe(true)
    })

    it('returns true for audio/wav', () => {
      expect(isSupportedMimeType('audio/wav')).toBe(true)
    })

    it('returns true for audio/ogg', () => {
      expect(isSupportedMimeType('audio/ogg')).toBe(true)
    })

    it('returns false for application/pdf', () => {
      expect(isSupportedMimeType('application/pdf')).toBe(false)
    })

    it('returns false for text/plain', () => {
      expect(isSupportedMimeType('text/plain')).toBe(false)
    })

    it('returns false for video/mp4', () => {
      expect(isSupportedMimeType('video/mp4')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isSupportedMimeType('')).toBe(false)
    })
  })

  describe('isImageMimeType', () => {
    it('returns true for image/jpeg', () => {
      expect(isImageMimeType('image/jpeg')).toBe(true)
    })

    it('returns true for image/png', () => {
      expect(isImageMimeType('image/png')).toBe(true)
    })

    it('returns true for image/gif', () => {
      expect(isImageMimeType('image/gif')).toBe(true)
    })

    it('returns true for image/webp', () => {
      expect(isImageMimeType('image/webp')).toBe(true)
    })

    it('returns false for audio/mpeg', () => {
      expect(isImageMimeType('audio/mpeg')).toBe(false)
    })

    it('returns false for audio/wav', () => {
      expect(isImageMimeType('audio/wav')).toBe(false)
    })

    it('returns false for application/pdf', () => {
      expect(isImageMimeType('application/pdf')).toBe(false)
    })
  })

  describe('isAudioMimeType', () => {
    it('returns true for audio/mpeg', () => {
      expect(isAudioMimeType('audio/mpeg')).toBe(true)
    })

    it('returns true for audio/wav', () => {
      expect(isAudioMimeType('audio/wav')).toBe(true)
    })

    it('returns true for audio/ogg', () => {
      expect(isAudioMimeType('audio/ogg')).toBe(true)
    })

    it('returns false for image/jpeg', () => {
      expect(isAudioMimeType('image/jpeg')).toBe(false)
    })

    it('returns false for image/png', () => {
      expect(isAudioMimeType('image/png')).toBe(false)
    })

    it('returns false for video/mp4', () => {
      expect(isAudioMimeType('video/mp4')).toBe(false)
    })
  })

  describe('getMaxFileSize', () => {
    it('returns 10MB for image/jpeg', () => {
      expect(getMaxFileSize('image/jpeg')).toBe(MAX_IMAGE_SIZE)
      expect(getMaxFileSize('image/jpeg')).toBe(10 * 1024 * 1024)
    })

    it('returns 10MB for image/png', () => {
      expect(getMaxFileSize('image/png')).toBe(MAX_IMAGE_SIZE)
    })

    it('returns 10MB for image/gif', () => {
      expect(getMaxFileSize('image/gif')).toBe(MAX_IMAGE_SIZE)
    })

    it('returns 10MB for image/webp', () => {
      expect(getMaxFileSize('image/webp')).toBe(MAX_IMAGE_SIZE)
    })

    it('returns 50MB for audio/mpeg', () => {
      expect(getMaxFileSize('audio/mpeg')).toBe(MAX_AUDIO_SIZE)
      expect(getMaxFileSize('audio/mpeg')).toBe(50 * 1024 * 1024)
    })

    it('returns 50MB for audio/wav', () => {
      expect(getMaxFileSize('audio/wav')).toBe(MAX_AUDIO_SIZE)
    })

    it('returns 50MB for audio/ogg', () => {
      expect(getMaxFileSize('audio/ogg')).toBe(MAX_AUDIO_SIZE)
    })

    it('returns 0 for unsupported types', () => {
      expect(getMaxFileSize('application/pdf')).toBe(0)
    })

    it('returns 0 for video/mp4', () => {
      expect(getMaxFileSize('video/mp4')).toBe(0)
    })

    it('returns 0 for empty string', () => {
      expect(getMaxFileSize('')).toBe(0)
    })
  })

  describe('size constants', () => {
    it('MAX_IMAGE_SIZE is 10MB', () => {
      expect(MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024)
    })

    it('MAX_AUDIO_SIZE is 50MB', () => {
      expect(MAX_AUDIO_SIZE).toBe(50 * 1024 * 1024)
    })
  })
})
