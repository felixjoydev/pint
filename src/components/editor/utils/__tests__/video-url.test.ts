import { describe, it, expect } from 'vitest'
import { parseVideoUrl, isVideoUrl } from '../video-url'

describe('parseVideoUrl', () => {
  describe('YouTube URLs', () => {
    it('parses youtube.com/watch?v= URLs', () => {
      const result = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result).toEqual({
        provider: 'youtube',
        id: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      })
    })

    it('parses youtube.com/watch?v= URLs without www', () => {
      const result = parseVideoUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result).toEqual({
        provider: 'youtube',
        id: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      })
    })

    it('parses youtu.be/ URLs', () => {
      const result = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')
      expect(result).toEqual({
        provider: 'youtube',
        id: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      })
    })

    it('parses youtube.com/embed/ URLs', () => {
      const result = parseVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(result).toEqual({
        provider: 'youtube',
        id: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      })
    })

    it('handles URLs with additional parameters', () => {
      const result = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120')
      expect(result?.id).toBe('dQw4w9WgXcQ')
    })
  })

  describe('Vimeo URLs', () => {
    it('parses vimeo.com/ URLs', () => {
      const result = parseVideoUrl('https://vimeo.com/123456789')
      expect(result).toEqual({
        provider: 'vimeo',
        id: '123456789',
        embedUrl: 'https://player.vimeo.com/video/123456789',
      })
    })

    it('parses player.vimeo.com/video/ URLs', () => {
      const result = parseVideoUrl('https://player.vimeo.com/video/123456789')
      expect(result).toEqual({
        provider: 'vimeo',
        id: '123456789',
        embedUrl: 'https://player.vimeo.com/video/123456789',
      })
    })
  })

  describe('Invalid URLs', () => {
    it('returns null for invalid URLs', () => {
      expect(parseVideoUrl('not a url')).toBeNull()
    })

    it('returns null for non-video URLs', () => {
      expect(parseVideoUrl('https://example.com/video')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(parseVideoUrl('')).toBeNull()
    })

    it('returns null for undefined-like values', () => {
      expect(parseVideoUrl('')).toBeNull()
    })
  })
})

describe('isVideoUrl', () => {
  it('returns true for valid YouTube URLs', () => {
    expect(isVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
    expect(isVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
  })

  it('returns true for valid Vimeo URLs', () => {
    expect(isVideoUrl('https://vimeo.com/123456789')).toBe(true)
  })

  it('returns false for invalid URLs', () => {
    expect(isVideoUrl('https://example.com')).toBe(false)
    expect(isVideoUrl('not a url')).toBe(false)
    expect(isVideoUrl('')).toBe(false)
  })
})
