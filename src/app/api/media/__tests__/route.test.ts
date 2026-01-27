import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    mediaFile: {
      findMany: vi.fn(),
    },
  },
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'

describe('GET /api/media', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindMany = prisma.mediaFile.findMany as ReturnType<typeof vi.fn>

  const mockMediaFiles = [
    {
      id: 'media-1',
      tenantId: 'tenant-123',
      filename: 'photo1.jpg',
      url: 'https://media.example.com/photo1.jpg',
      size: 1000000,
      mimeType: 'image/jpeg',
      createdAt: new Date('2026-01-15'),
    },
    {
      id: 'media-2',
      tenantId: 'tenant-123',
      filename: 'photo2.png',
      url: 'https://media.example.com/photo2.png',
      size: 2000000,
      mimeType: 'image/png',
      createdAt: new Date('2026-01-14'),
    },
    {
      id: 'media-3',
      tenantId: 'tenant-123',
      filename: 'song.mp3',
      url: 'https://media.example.com/song.mp3',
      size: 5000000,
      mimeType: 'audio/mpeg',
      createdAt: new Date('2026-01-13'),
    },
  ]

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists all media files for tenant', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue(mockMediaFiles)

    const request = new NextRequest('http://localhost:3000/api/media')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.items).toHaveLength(3)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-123' },
      })
    )
  })

  it('filters by image type', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([mockMediaFiles[0], mockMediaFiles[1]])

    const request = new NextRequest('http://localhost:3000/api/media?type=image')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.items).toHaveLength(2)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 'tenant-123',
          mimeType: {
            in: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          },
        },
      })
    )
  })

  it('filters by audio type', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([mockMediaFiles[2]])

    const request = new NextRequest('http://localhost:3000/api/media?type=audio')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.items).toHaveLength(1)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 'tenant-123',
          mimeType: {
            in: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
          },
        },
      })
    )
  })

  it('returns empty list when no files', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/media')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.items).toHaveLength(0)
    expect(json.hasMore).toBe(false)
  })

  it('applies default limit of 50', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/media')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 51, // 50 + 1 for pagination check
      })
    )
  })

  it('respects custom limit', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/media?limit=20')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 21, // 20 + 1 for pagination check
      })
    )
  })

  it('supports cursor pagination', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const cursorId = '123e4567-e89b-12d3-a456-426614174000'
    const request = new NextRequest(
      `http://localhost:3000/api/media?cursor=${cursorId}`
    )
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { lt: cursorId },
        }),
      })
    )
  })

  it('returns hasMore and nextCursor correctly when more results exist', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    // Return 3 items when limit is 2 (indicating more exist)
    mockFindMany.mockResolvedValue([
      { id: 'media-1', filename: 'file1.jpg' },
      { id: 'media-2', filename: 'file2.jpg' },
      { id: 'media-3', filename: 'file3.jpg' },
    ])

    const request = new NextRequest('http://localhost:3000/api/media?limit=2')
    const response = await GET(request)
    const json = await response.json()

    expect(json.hasMore).toBe(true)
    expect(json.nextCursor).toBe('media-2')
    expect(json.items).toHaveLength(2) // Only return requested limit
  })

  it('returns hasMore false when no more results', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    // Return fewer items than limit + 1
    mockFindMany.mockResolvedValue([
      { id: 'media-1', filename: 'file1.jpg' },
    ])

    const request = new NextRequest('http://localhost:3000/api/media?limit=2')
    const response = await GET(request)
    const json = await response.json()

    expect(json.hasMore).toBe(false)
    expect(json.nextCursor).toBeUndefined()
  })

  it('orders by createdAt descending', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/media')
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/media')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})
