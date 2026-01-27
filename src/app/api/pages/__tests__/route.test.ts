import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    page: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
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
  ensureUniquePageSlug: vi.fn((slug: string) => Promise.resolve(slug)),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { ensureUniquePageSlug } from '@/lib/utils/slug'

describe('GET /api/pages', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindMany = prisma.page.findMany as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return pages for authenticated tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([
      { id: 'page-1', title: 'About', navOrder: 0 },
      { id: 'page-2', title: 'Contact', navOrder: 1 },
    ])

    const request = new NextRequest('http://localhost:3000/api/pages')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.pages).toHaveLength(2)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123' },
      })
    )
  })

  it('should order by navOrder, then createdAt', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/pages')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ navOrder: 'asc' }, { createdAt: 'desc' }],
      })
    )
  })

  it('should filter by status when provided', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/pages?status=published')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123', status: 'published' },
      })
    )
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('POST /api/pages', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockCreate = prisma.page.create as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.page.findFirst as ReturnType<typeof vi.fn>
  const mockEnsureUniqueSlug = ensureUniquePageSlug as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mockEnsureUniqueSlug.mockImplementation((slug: string) => Promise.resolve(slug))
  })

  it('should create page with auto-generated slug', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ navOrder: 2 })
    mockCreate.mockResolvedValue({
      id: 'new-page',
      title: 'About Us',
      slug: 'about-us',
    })

    const request = new NextRequest('http://localhost:3000/api/pages', {
      method: 'POST',
      body: JSON.stringify({ title: 'About Us', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.page.slug).toBe('about-us')
  })

  it('should create page with custom slug', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({
      id: 'new-page',
      slug: 'custom-slug',
    })

    const request = new NextRequest('http://localhost:3000/api/pages', {
      method: 'POST',
      body: JSON.stringify({ title: 'About', content: {}, slug: 'custom-slug' }),
    })
    await POST(request)

    expect(mockEnsureUniqueSlug).toHaveBeenCalledWith('custom-slug', 'tenant-123')
  })

  it('should auto-assign navOrder for showInNav pages', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ navOrder: 5 })
    mockCreate.mockImplementation(async ({ data }) => {
      expect(data.navOrder).toBe(6) // 5 + 1
      return { id: 'new-page', ...data }
    })

    const request = new NextRequest('http://localhost:3000/api/pages', {
      method: 'POST',
      body: JSON.stringify({ title: 'Contact', content: {}, showInNav: true }),
    })
    await POST(request)
  })

  it('should default showInNav to true', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockImplementation(async ({ data }) => {
      expect(data.showInNav).toBe(true)
      return { id: 'new-page', ...data }
    })

    const request = new NextRequest('http://localhost:3000/api/pages', {
      method: 'POST',
      body: JSON.stringify({ title: 'About', content: {} }),
    })
    await POST(request)
  })

  it('should reject invalid input', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })

    const request = new NextRequest('http://localhost:3000/api/pages', {
      method: 'POST',
      body: JSON.stringify({ title: '', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/pages', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', content: {} }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })
})
