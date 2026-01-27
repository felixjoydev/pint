import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    post: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'

describe('POST /api/posts/[id]/publish', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.post.findFirst as ReturnType<typeof vi.fn>
  const mockUpdate = prisma.post.update as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should publish a draft post', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      status: 'draft',
      publishedAt: null,
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({
      id: 'post-1',
      status: 'published',
      _count: { likes: 0 },
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'published' }),
      })
    )
  })

  it('should set publishedAt on first publish', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      status: 'draft',
      publishedAt: null,
      tenantId: 'tenant-123',
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toBeInstanceOf(Date)
      return { id: 'post-1', _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    await POST(request, { params: Promise.resolve({ id: 'post-1' }) })
  })

  it('should unpublish a post', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      status: 'published',
      publishedAt: new Date(),
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({
      id: 'post-1',
      status: 'draft',
      _count: { likes: 0 },
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'unpublish' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'draft' }),
      })
    )
  })

  it('should preserve original publishedAt on unpublish', async () => {
    const originalDate = new Date('2024-01-01')
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      status: 'published',
      publishedAt: originalDate,
      tenantId: 'tenant-123',
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toEqual(originalDate)
      return { id: 'post-1', _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'unpublish' }),
    })
    await POST(request, { params: Promise.resolve({ id: 'post-1' }) })
  })

  it('should preserve publishedAt on re-publish', async () => {
    const originalDate = new Date('2024-01-01')
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'post-1',
      status: 'draft',
      publishedAt: originalDate, // Already published before
      tenantId: 'tenant-123',
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.publishedAt).toEqual(originalDate)
      return { id: 'post-1', _count: { likes: 0 } }
    })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    await POST(request, { params: Promise.resolve({ id: 'post-1' }) })
  })

  it('should return 404 when post not found', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/nonexistent/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(401)
  })

  it('should reject invalid action', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ id: 'post-1', tenantId: 'tenant-123' })

    const request = new NextRequest('http://localhost:3000/api/posts/post-1/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'invalid' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'post-1' }) })

    expect(response.status).toBe(400)
  })

  it('should not allow publishing other tenant posts', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null) // Returns null due to tenant filter

    const request = new NextRequest('http://localhost:3000/api/posts/other-post/publish', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish' }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'other-post' }) })

    expect(response.status).toBe(404)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
