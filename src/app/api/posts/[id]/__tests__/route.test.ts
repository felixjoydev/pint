import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    post: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/utils/slug', () => ({
  ensureUniquePostSlug: vi.fn((slug: string) => Promise.resolve(slug)),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { ensureUniquePostSlug } from '@/lib/utils/slug'

describe('GET /api/posts/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.post.findFirst as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return post for authenticated tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      title: 'Test Post',
      tenantId: 'tenant-123',
      _count: { likes: 5 },
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'post-1' }) })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.post.id).toBe('post-1')
  })

  it('should return 404 when post not found', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('should not return post from different tenant (security)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null) // Query includes tenantId, so returns null

    const request = new NextRequest('http://localhost:3000/api/posts/other-tenant-post')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'other-tenant-post' }),
    })

    expect(response.status).toBe(404)
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-123', // Ensures tenant isolation
        }),
      })
    )
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(401)
  })

  it('should include like count', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ id: 'post-1', _count: { likes: 10 } })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1')
    await GET(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { _count: { select: { likes: true } } },
      })
    )
  })
})

describe('PATCH /api/posts/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.post.findFirst as ReturnType<typeof vi.fn>
  const mockUpdate = prisma.post.update as ReturnType<typeof vi.fn>
  const mockEnsureUniqueSlug = ensureUniquePostSlug as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mockEnsureUniqueSlug.mockImplementation((slug: string) => Promise.resolve(slug))
  })

  it('should update post title', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      title: 'Old Title',
      slug: 'old-title',
      tenantId: 'tenant-123',
      publishedAt: null,
    })
    mockUpdate.mockResolvedValue({
      id: 'post-1',
      title: 'New Title',
      _count: { likes: 0 },
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'New Title' }),
      })
    )
  })

  it('should update slug with uniqueness check', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      slug: 'old-slug',
      tenantId: 'tenant-123',
      publishedAt: null,
    })
    mockUpdate.mockResolvedValue({ id: 'post-1', _count: { likes: 0 } })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ slug: 'new-slug' }),
    })
    await PATCH(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(mockEnsureUniqueSlug).toHaveBeenCalledWith('new-slug', 'tenant-123', 'post-1')
  })

  it('should set publishedAt on first publish', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      slug: 'test',
      tenantId: 'tenant-123',
      publishedAt: null,
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toBeInstanceOf(Date)
      return { id: 'post-1', _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'published' }),
    })
    await PATCH(request, { params: Promise.resolve({ id: 'post-1' }) })
  })

  it('should preserve publishedAt on re-publish', async () => {
    const originalDate = new Date('2024-01-01')
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      slug: 'test',
      tenantId: 'tenant-123',
      publishedAt: originalDate,
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toEqual(originalDate)
      return { id: 'post-1', _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'published' }),
    })
    await PATCH(request, { params: Promise.resolve({ id: 'post-1' }) })
  })

  it('should return 404 when post not found', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/posts/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.post.findFirst as ReturnType<typeof vi.fn>
  const mockDelete = prisma.post.delete as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should delete post', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ id: 'post-1', tenantId: 'tenant-123' })
    mockDelete.mockResolvedValue({ id: 'post-1' })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'post-1' } })
  })

  it('should return 404 for non-existent post', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/nonexistent', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should not delete post from different tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null) // Returns null due to tenant filter

    const request = new NextRequest('http://localhost:3000/api/posts/other-tenant-post', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'other-tenant-post' }),
    })

    expect(response.status).toBe(404)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(401)
  })
})
