import { describe, it, expect, vi } from 'vitest'

// Mock environment variables before importing r2 module
vi.stubEnv('R2_ENDPOINT', 'https://test-account.r2.cloudflarestorage.com')
vi.stubEnv('R2_ACCESS_KEY_ID', 'test-access-key')
vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret-key')
vi.stubEnv('R2_BUCKET', 'test-bucket')
vi.stubEnv('R2_PUBLIC_URL', 'https://media.test.com')

import { generateStorageKey, getPublicUrl, extractKeyFromUrl } from '../r2'

describe('R2 Utilities', () => {
  describe('generateStorageKey', () => {
    it('contains tenant ID in path', () => {
      const key = generateStorageKey('tenant-123', 'image/jpeg')
      expect(key).toContain('tenants/tenant-123/')
    })

    it('contains year and month', () => {
      const key = generateStorageKey('tenant-123', 'image/jpeg')
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      expect(key).toContain(`/${year}/${month}/`)
    })

    it('uses correct extension for image/jpeg', () => {
      const key = generateStorageKey('tenant-123', 'image/jpeg')
      expect(key).toMatch(/\.jpg$/)
    })

    it('uses correct extension for image/png', () => {
      const key = generateStorageKey('tenant-123', 'image/png')
      expect(key).toMatch(/\.png$/)
    })

    it('uses correct extension for image/gif', () => {
      const key = generateStorageKey('tenant-123', 'image/gif')
      expect(key).toMatch(/\.gif$/)
    })

    it('uses correct extension for image/webp', () => {
      const key = generateStorageKey('tenant-123', 'image/webp')
      expect(key).toMatch(/\.webp$/)
    })

    it('uses correct extension for audio/mpeg', () => {
      const key = generateStorageKey('tenant-123', 'audio/mpeg')
      expect(key).toMatch(/\.mp3$/)
    })

    it('uses correct extension for audio/wav', () => {
      const key = generateStorageKey('tenant-123', 'audio/wav')
      expect(key).toMatch(/\.wav$/)
    })

    it('uses correct extension for audio/ogg', () => {
      const key = generateStorageKey('tenant-123', 'audio/ogg')
      expect(key).toMatch(/\.ogg$/)
    })

    it('produces unique keys (nanoid)', () => {
      const key1 = generateStorageKey('tenant-123', 'image/jpeg')
      const key2 = generateStorageKey('tenant-123', 'image/jpeg')
      expect(key1).not.toBe(key2)
    })

    it('follows expected format pattern', () => {
      const key = generateStorageKey('tenant-abc', 'image/png')
      // Format: tenants/{tenantId}/{year}/{month}/{nanoid}{extension}
      const pattern = /^tenants\/tenant-abc\/\d{4}\/\d{2}\/[A-Za-z0-9_-]{12}\.png$/
      expect(key).toMatch(pattern)
    })
  })

  describe('getPublicUrl', () => {
    it('constructs correct URL from key', () => {
      const key = 'tenants/tenant-123/2026/01/abc123def456.jpg'
      const url = getPublicUrl(key)
      expect(url).toBe('https://media.test.com/tenants/tenant-123/2026/01/abc123def456.jpg')
    })

    it('handles keys without leading slash', () => {
      const key = 'some/path/file.png'
      const url = getPublicUrl(key)
      expect(url).toBe('https://media.test.com/some/path/file.png')
    })

    it('preserves special characters in key', () => {
      const key = 'tenants/tenant_123/2026/01/file-name.jpg'
      const url = getPublicUrl(key)
      expect(url).toBe('https://media.test.com/tenants/tenant_123/2026/01/file-name.jpg')
    })
  })

  describe('extractKeyFromUrl', () => {
    it('extracts key from valid public URL', () => {
      const url = 'https://media.test.com/tenants/tenant-123/2026/01/abc123.jpg'
      const key = extractKeyFromUrl(url)
      expect(key).toBe('tenants/tenant-123/2026/01/abc123.jpg')
    })

    it('returns null for invalid URL', () => {
      const url = 'https://other-domain.com/tenants/tenant-123/file.jpg'
      const key = extractKeyFromUrl(url)
      expect(key).toBeNull()
    })

    it('returns null for URL from different domain', () => {
      const url = 'https://example.com/some/path/file.jpg'
      const key = extractKeyFromUrl(url)
      expect(key).toBeNull()
    })

    it('returns null for partial match of public URL', () => {
      const url = 'https://media.test.com.evil.com/tenants/file.jpg'
      const key = extractKeyFromUrl(url)
      expect(key).toBeNull()
    })

    it('handles empty path after public URL', () => {
      const url = 'https://media.test.com/'
      const key = extractKeyFromUrl(url)
      expect(key).toBe('')
    })

    it('returns null for URL without trailing slash', () => {
      const url = 'https://media.test.com'
      const key = extractKeyFromUrl(url)
      expect(key).toBeNull()
    })

    it('extracts complex nested paths', () => {
      const url = 'https://media.test.com/tenants/abc/2026/12/xyz789.mp3'
      const key = extractKeyFromUrl(url)
      expect(key).toBe('tenants/abc/2026/12/xyz789.mp3')
    })
  })
})
