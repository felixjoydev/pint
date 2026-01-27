import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    widget: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'

// Use valid UUIDs for tests
const WIDGET_1 = '550e8400-e29b-41d4-a716-446655440001'
const WIDGET_2 = '550e8400-e29b-41d4-a716-446655440002'
const OTHER_WIDGET = '550e8400-e29b-41d4-a716-446655440099'

describe('GET /api/widgets', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindMany = prisma.widget.findMany as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return widgets ordered by displayOrder', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([
      { id: 'w1', type: 'theme_switcher', displayOrder: 0, enabled: true },
      { id: 'w2', type: 'font_customizer', displayOrder: 1, enabled: true },
    ])

    const request = new NextRequest('http://localhost:3000/api/widgets')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.widgets).toHaveLength(2)
    expect(json.widgets[0].displayOrder).toBe(0)
  })

  it('should order by displayOrder ascending', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/widgets')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { displayOrder: 'asc' },
      })
    )
  })

  it('should scope to tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/widgets')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123' },
      })
    )
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/widgets')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/widgets (bulk order)', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindMany = prisma.widget.findMany as ReturnType<typeof vi.fn>
  const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should update widget order', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValueOnce([{ id: WIDGET_1 }, { id: WIDGET_2 }]) // Verify ownership
    mockFindMany.mockResolvedValueOnce([
      { id: WIDGET_2, displayOrder: 0 },
      { id: WIDGET_1, displayOrder: 1 },
    ]) // After update
    mockTransaction.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/widgets', {
      method: 'PATCH',
      body: JSON.stringify({
        widgets: [
          { id: WIDGET_1, displayOrder: 1 },
          { id: WIDGET_2, displayOrder: 0 },
        ],
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    expect(mockTransaction).toHaveBeenCalled()
  })

  it('should reject if widget belongs to different tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([{ id: WIDGET_1 }]) // Only 1 found, but 2 requested

    const request = new NextRequest('http://localhost:3000/api/widgets', {
      method: 'PATCH',
      body: JSON.stringify({
        widgets: [
          { id: WIDGET_1, displayOrder: 0 },
          { id: OTHER_WIDGET, displayOrder: 1 },
        ],
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(404)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('should reject empty widgets array', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })

    const request = new NextRequest('http://localhost:3000/api/widgets', {
      method: 'PATCH',
      body: JSON.stringify({ widgets: [] }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/widgets', {
      method: 'PATCH',
      body: JSON.stringify({
        widgets: [{ id: WIDGET_1, displayOrder: 0 }],
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(401)
  })
})
