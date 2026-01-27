import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PATCH } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    widget: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'

describe('PATCH /api/widgets/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindFirst = prisma.widget.findFirst as ReturnType<typeof vi.fn>
  const mockUpdate = prisma.widget.update as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should update widget enabled state', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'widget-1',
      enabled: true,
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({
      id: 'widget-1',
      enabled: false,
    })

    const request = new NextRequest('http://localhost:3000/api/widgets/widget-1', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: false }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'widget-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ enabled: false }),
      })
    )
  })

  it('should update widget config', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'widget-1',
      config: {},
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({
      id: 'widget-1',
      config: { theme: 'dark', fontSize: 14 },
    })

    const request = new NextRequest('http://localhost:3000/api/widgets/widget-1', {
      method: 'PATCH',
      body: JSON.stringify({ config: { theme: 'dark', fontSize: 14 } }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'widget-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ config: { theme: 'dark', fontSize: 14 } }),
      })
    )
  })

  it('should update widget displayOrder', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({
      id: 'widget-1',
      displayOrder: 0,
      tenantId: 'tenant-123',
    })
    mockUpdate.mockResolvedValue({
      id: 'widget-1',
      displayOrder: 5,
    })

    const request = new NextRequest('http://localhost:3000/api/widgets/widget-1', {
      method: 'PATCH',
      body: JSON.stringify({ displayOrder: 5 }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'widget-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ displayOrder: 5 }),
      })
    )
  })

  it('should return 404 when widget not found', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/widgets/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: false }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('should not update widget from different tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue(null) // Returns null due to tenant filter

    const request = new NextRequest('http://localhost:3000/api/widgets/other-widget', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: false }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'other-widget' }) })

    expect(response.status).toBe(404)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/widgets/widget-1', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: false }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'widget-1' }) })

    expect(response.status).toBe(401)
  })

  it('should reject negative displayOrder', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindFirst.mockResolvedValue({ id: 'widget-1', tenantId: 'tenant-123' })

    const request = new NextRequest('http://localhost:3000/api/widgets/widget-1', {
      method: 'PATCH',
      body: JSON.stringify({ displayOrder: -1 }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'widget-1' }) })

    expect(response.status).toBe(400)
  })
})
