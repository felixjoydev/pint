import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/utils/slug', () => ({
  generateSlug: vi.fn((title: string) =>
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  ),
  ensureUniquePostSlug: vi.fn((slug: string) => Promise.resolve(slug)),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { ensureUniquePostSlug } from '@/lib/utils/slug'

describe('GET /api/posts', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindMany = prisma.post.findMany as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return posts for authenticated tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([
      { id: 'post-1', title: 'Post 1', _count: { likes: 5 } },
      { id: 'post-2', title: 'Post 2', _count: { likes: 10 } },
    ])

    const request = new NextRequest('http://localhost:3000/api/posts')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.posts).toHaveLength(2)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123' },
      })
    )
  })

  it('should filter by status when provided', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/posts?status=published')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123', status: 'published' },
      })
    )
  })

  it('should filter by draft status', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/posts?status=draft')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123', status: 'draft' },
      })
    )
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should order by createdAt descending', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/posts')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should include like count', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/posts')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { _count: { select: { likes: true } } },
      })
    )
  })
})

describe('POST /api/posts', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockCreate = prisma.post.create as ReturnType<typeof vi.fn>
  const mockCount = prisma.post.count as ReturnType<typeof vi.fn>
  const mockEnsureUniqueSlug = ensureUniquePostSlug as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mockEnsureUniqueSlug.mockImplementation((slug: string) => Promise.resolve(slug))
  })

  it('should create post with auto-generated slug', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'pro' })
    mockCreate.mockResolvedValue({
      id: 'new-post',
      title: 'Hello World',
      slug: 'hello-world',
      _count: { likes: 0 },
    })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hello World', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.post.slug).toBe('hello-world')
  })

  it('should create post with custom slug', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'pro' })
    mockCreate.mockResolvedValue({
      id: 'new-post',
      slug: 'my-custom-slug',
      _count: { likes: 0 },
    })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hello', content: {}, slug: 'my-custom-slug' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockEnsureUniqueSlug).toHaveBeenCalledWith('my-custom-slug', 'tenant-123')
  })

  it('should enforce 50 post limit for free tier', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockCount.mockResolvedValue(50)

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Post', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(403)
    const json = await response.json()
    expect(json.error.code).toBe('POST_LIMIT')
  })

  it('should allow posts under limit for free tier', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockCount.mockResolvedValue(49)
    mockCreate.mockResolvedValue({ id: 'new-post', _count: { likes: 0 } })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Post', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
  })

  it('should allow unlimited posts for pro tier', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'pro' })
    mockCreate.mockResolvedValue({ id: 'new-post', _count: { likes: 0 } })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Post', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockCount).not.toHaveBeenCalled()
  })

  it('should set publishedAt when status is published', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'pro' })
    mockCreate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toBeInstanceOf(Date)
      return { id: 'new-post', ...data, _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Published Post', content: {}, status: 'published' }),
    })
    await POST(request)
  })

  it('should not set publishedAt for drafts', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'pro' })
    mockCreate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toBeNull()
      return { id: 'new-post', ...data, _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Draft Post', content: {}, status: 'draft' }),
    })
    await POST(request)
  })

  it('should reject invalid input', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'pro' })

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: '', content: {} }), // Empty title
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })
})
