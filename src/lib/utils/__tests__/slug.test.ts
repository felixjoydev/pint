import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSlug, ensureUniquePostSlug, ensureUniquePageSlug } from '../slug'

// Mock prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    post: {
      findFirst: vi.fn(),
    },
    page: {
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db/prisma'

describe('generateSlug', () => {
  it('should convert to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('my first post')).toBe('my-first-post')
  })

  it('should remove special characters', () => {
    expect(generateSlug('Hello! World? @2024')).toBe('hello-world-2024')
  })

  it('should handle multiple spaces', () => {
    expect(generateSlug('hello    world')).toBe('hello-world')
  })

  it('should handle multiple hyphens', () => {
    expect(generateSlug('hello---world')).toBe('hello-world')
  })

  it('should trim leading/trailing spaces', () => {
    expect(generateSlug('  hello world  ')).toBe('hello-world')
  })

  it('should remove leading/trailing hyphens', () => {
    expect(generateSlug('-hello world-')).toBe('hello-world')
  })

  it('should handle diacritics/accents', () => {
    expect(generateSlug('café résumé')).toBe('cafe-resume')
  })

  it('should handle umlauts', () => {
    expect(generateSlug('über naïve')).toBe('uber-naive')
  })

  it('should limit length to 100 characters', () => {
    const longTitle = 'a'.repeat(150)
    expect(generateSlug(longTitle).length).toBe(100)
  })

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('should handle only special characters', () => {
    expect(generateSlug('!@#$%')).toBe('')
  })

  it('should handle numbers', () => {
    expect(generateSlug('Top 10 Tips for 2024')).toBe('top-10-tips-for-2024')
  })

  it('should handle already valid slug', () => {
    expect(generateSlug('already-valid-slug')).toBe('already-valid-slug')
  })

  it('should handle mixed case with numbers', () => {
    expect(generateSlug('Test123ABC')).toBe('test123abc')
  })

  it('should handle underscores', () => {
    expect(generateSlug('hello_world_test')).toBe('hello_world_test')
  })

  it('should handle ampersands', () => {
    expect(generateSlug('Rock & Roll')).toBe('rock-roll')
  })

  it('should handle parentheses', () => {
    expect(generateSlug('Hello (World)')).toBe('hello-world')
  })
})

describe('ensureUniquePostSlug', () => {
  const mockFindFirst = prisma.post.findFirst as ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFindFirst.mockReset()
  })

  it('should return base slug if unique', async () => {
    mockFindFirst.mockResolvedValue(null)
    const slug = await ensureUniquePostSlug('hello-world', 'tenant-123')
    expect(slug).toBe('hello-world')
    expect(mockFindFirst).toHaveBeenCalledTimes(1)
  })

  it('should append -2 if slug exists', async () => {
    mockFindFirst
      .mockResolvedValueOnce({ id: 'existing-1' }) // hello-world exists
      .mockResolvedValueOnce(null) // hello-world-2 is free
    const slug = await ensureUniquePostSlug('hello-world', 'tenant-123')
    expect(slug).toBe('hello-world-2')
  })

  it('should keep incrementing until unique', async () => {
    mockFindFirst
      .mockResolvedValueOnce({ id: 'existing-1' }) // hello-world exists
      .mockResolvedValueOnce({ id: 'existing-2' }) // hello-world-2 exists
      .mockResolvedValueOnce({ id: 'existing-3' }) // hello-world-3 exists
      .mockResolvedValueOnce(null) // hello-world-4 is free
    const slug = await ensureUniquePostSlug('hello-world', 'tenant-123')
    expect(slug).toBe('hello-world-4')
  })

  it('should exclude current post when updating', async () => {
    mockFindFirst.mockResolvedValue(null)
    await ensureUniquePostSlug('hello-world', 'tenant-123', 'post-456')
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-123',
        slug: 'hello-world',
        id: { not: 'post-456' },
      },
      select: { id: true },
    })
  })

  it('should scope to tenant', async () => {
    mockFindFirst.mockResolvedValue(null)
    await ensureUniquePostSlug('hello-world', 'tenant-abc')
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-abc' }),
      })
    )
  })

  it('should not include id filter when no excludePostId', async () => {
    mockFindFirst.mockResolvedValue(null)
    await ensureUniquePostSlug('hello-world', 'tenant-123')
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-123',
        slug: 'hello-world',
      },
      select: { id: true },
    })
  })
})

describe('ensureUniquePageSlug', () => {
  const mockFindFirst = prisma.page.findFirst as ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFindFirst.mockReset()
  })

  it('should return base slug if unique', async () => {
    mockFindFirst.mockResolvedValue(null)
    const slug = await ensureUniquePageSlug('about', 'tenant-123')
    expect(slug).toBe('about')
  })

  it('should append -2 if slug exists', async () => {
    mockFindFirst.mockResolvedValueOnce({ id: 'existing-1' }).mockResolvedValueOnce(null)
    const slug = await ensureUniquePageSlug('about', 'tenant-123')
    expect(slug).toBe('about-2')
  })

  it('should exclude current page when updating', async () => {
    mockFindFirst.mockResolvedValue(null)
    await ensureUniquePageSlug('contact', 'tenant-123', 'page-789')
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-123',
        slug: 'contact',
        id: { not: 'page-789' },
      },
      select: { id: true },
    })
  })

  it('should scope to tenant', async () => {
    mockFindFirst.mockResolvedValue(null)
    await ensureUniquePageSlug('about', 'tenant-xyz')
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-xyz' }),
      })
    )
  })
})
