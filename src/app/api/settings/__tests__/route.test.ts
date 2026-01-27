import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    tenant: {
      update: vi.fn(),
    },
  },
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'

describe('GET /api/settings', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return tenant settings', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: { title: 'My Blog', description: 'A cool blog' },
    })

    const request = new NextRequest('http://localhost:3000/api/settings')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.settings.title).toBe('My Blog')
    expect(json.tier).toBe('free')
  })

  it('should return empty settings object if none set', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'pro',
      settings: {},
    })

    const request = new NextRequest('http://localhost:3000/api/settings')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.settings).toEqual({})
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/settings')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/settings', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockUpdate = prisma.tenant.update as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should update basic settings for free tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: {},
    })
    mockUpdate.mockResolvedValue({
      settings: { title: 'Updated Blog' },
      tier: 'free',
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Blog' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.settings.title).toBe('Updated Blog')
  })

  it('should reject SEO settings for free tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: {},
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ customMetaTitle: 'SEO Title' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(403)
    const json = await response.json()
    expect(json.error.code).toBe('TIER_LIMIT')
  })

  it('should reject seoEnabled for free tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: {},
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ seoEnabled: true }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(403)
  })

  it('should reject robotsIndexing for free tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: {},
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ robotsIndexing: true }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(403)
  })

  it('should reject externalAnalyticsScript for free tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: {},
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ externalAnalyticsScript: '<script>...</script>' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(403)
  })

  it('should allow SEO settings for pro tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'pro',
      settings: {},
    })
    mockUpdate.mockResolvedValue({
      settings: { customMetaTitle: 'SEO Title' },
      tier: 'pro',
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ customMetaTitle: 'SEO Title' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
  })

  it('should allow all settings for max tier', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'max',
      settings: {},
    })
    mockUpdate.mockResolvedValue({
      settings: {
        customMetaTitle: 'SEO Title',
        seoEnabled: true,
        robotsIndexing: true,
      },
      tier: 'max',
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        customMetaTitle: 'SEO Title',
        seoEnabled: true,
        robotsIndexing: true,
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
  })

  it('should merge with existing settings', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'pro',
      settings: { title: 'Old Title', description: 'Old Desc' },
    })
    mockUpdate.mockImplementation(async ({ data }) => {
      expect(data.settings).toEqual({
        title: 'New Title',
        description: 'Old Desc',
      })
      return { settings: data.settings, tier: 'pro' }
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    await PATCH(request)
  })

  it('should handle null existing settings', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: null,
    })
    mockUpdate.mockResolvedValue({
      settings: { title: 'New Blog' },
      tier: 'free',
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Blog' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(401)
  })

  it('should reject invalid settings values', async () => {
    mockRequireTenant.mockResolvedValue({
      id: 'tenant-123',
      tier: 'free',
      settings: {},
    })

    const request = new NextRequest('http://localhost:3000/api/settings', {
      method: 'PATCH',
      body: JSON.stringify({ defaultTheme: 'invalid-theme' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })
})
