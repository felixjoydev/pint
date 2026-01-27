import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    page: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/utils/slug', () => ({
  ensureUniquePageSlug: vi.fn((slug: string) => Promise.resolve(slug)),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { ensureUniquePageSlug } from '@/lib/utils/slug'

describe('GET /api/pages/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.page.findFirst as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return page for authenticated tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'page-1',
      title: 'About',
      tenantId: 'tenant-123',
    })

    const request = new NextRequest('http://localhost:3000/api/pages/page-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'page-1' }) })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.page.id).toBe('page-1')
  })

  it('should return 404 when page not found', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should not return page from different tenant (security)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/other-page')
    const response = await GET(request, { params: Promise.resolve({ id: 'other-page' }) })

    expect(response.status).toBe(404)
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-123' }),
      })
    )
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/page-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'page-1' }) })

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/pages/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.page.findFirst as ReturnType<typeof vi.fn>
  const mockUpdate = prisma.page.update as ReturnType<typeof vi.fn>
  const mockEnsureUniqueSlug = ensureUniquePageSlug as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mockEnsureUniqueSlug.mockImplementation((slug: string) => Promise.resolve(slug))
  })

  it('should update page title', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'page-1',
      title: 'Old Title',
      slug: 'old-title',
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({
      id: 'page-1',
      title: 'New Title',
    })

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'page-1' }) })

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
      id: 'page-1',
      slug: 'old-slug',
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({ id: 'page-1' })

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'PATCH',
      body: JSON.stringify({ slug: 'new-slug' }),
    })
    await PATCH(request, { params: Promise.resolve({ id: 'page-1' }) })

    expect(mockEnsureUniqueSlug).toHaveBeenCalledWith('new-slug', 'tenant-123', 'page-1')
  })

  it('should update navOrder', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'page-1',
      slug: 'about',
      tenantId: 'tenant-123',
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.navOrder).toBe(5)
      return { id: 'page-1' }
    })

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'PATCH',
      body: JSON.stringify({ navOrder: 5 }),
    })
    await PATCH(request, { params: Promise.resolve({ id: 'page-1' }) })
  })

  it('should update showInNav', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'page-1',
      slug: 'about',
      tenantId: 'tenant-123',
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.showInNav).toBe(false)
      return { id: 'page-1' }
    })

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'PATCH',
      body: JSON.stringify({ showInNav: false }),
    })
    await PATCH(request, { params: Promise.resolve({ id: 'page-1' }) })
  })

  it('should return 404 when page not found', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'page-1' }) })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/pages/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.page.findFirst as ReturnType<typeof vi.fn>
  const mockDelete = prisma.page.delete as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should delete page', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ id: 'page-1', tenantId: 'tenant-123' })
    mockDelete.mockResolvedValue({ id: 'page-1' })

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'page-1' }) })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'page-1' } })
  })

  it('should return 404 for non-existent page', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/nonexistent', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should not delete page from different tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/other-page', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'other-page' }) })

    expect(response.status).toBe(404)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages/page-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'page-1' }) })

    expect(response.status).toBe(401)
  })
})
