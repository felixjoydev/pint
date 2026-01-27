import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, DELETE } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    mediaFile: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/storage', () => ({
  extractKeyFromUrl: vi.fn(),
  deleteObject: vi.fn(),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { extractKeyFromUrl, deleteObject } from '@/lib/storage'

describe('GET /api/media/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindUnique = prisma.mediaFile.findUnique as ReturnType<typeof vi.fn>

  const mockMediaFile = {
    id: 'media-123',
    tenantId: 'tenant-123',
    filename: 'photo.jpg',
    url: 'https://media.example.com/photo.jpg',
    size: 5000000,
    mimeType: 'image/jpeg',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns existing media file', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)

    const request = new NextRequest('http://localhost:3000/api/media/media-123')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.mediaFile.id).toBe('media-123')
    expect(json.mediaFile.filename).toBe('photo.jpg')
  })

  it('returns 404 for non-existent file', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/media/non-existent')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 404 for other tenant file (security)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-other', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile) // belongs to tenant-123

    const request = new NextRequest('http://localhost:3000/api/media/media-123')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/media/media-123')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/media/[id]', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindUnique = prisma.mediaFile.findUnique as ReturnType<typeof vi.fn>
  const mockDelete = prisma.mediaFile.delete as ReturnType<typeof vi.fn>
  const mockExtractKeyFromUrl = extractKeyFromUrl as ReturnType<typeof vi.fn>
  const mockDeleteObject = deleteObject as ReturnType<typeof vi.fn>

  const mockMediaFile = {
    id: 'media-123',
    tenantId: 'tenant-123',
    filename: 'photo.jpg',
    url: 'https://media.example.com/tenants/tenant-123/photo.jpg',
    size: 5000000,
    mimeType: 'image/jpeg',
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('deletes file from database', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('tenants/tenant-123/photo.jpg')
    mockDeleteObject.mockResolvedValue(undefined)
    mockDelete.mockResolvedValue(mockMediaFile)

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(204)
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: 'media-123' },
    })
  })

  it('calls R2 deleteObject', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('tenants/tenant-123/photo.jpg')
    mockDeleteObject.mockResolvedValue(undefined)
    mockDelete.mockResolvedValue(mockMediaFile)

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(mockDeleteObject).toHaveBeenCalledWith('tenants/tenant-123/photo.jpg')
  })

  it('returns 204 on success', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockDeleteObject.mockResolvedValue(undefined)
    mockDelete.mockResolvedValue(mockMediaFile)

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(204)
  })

  it('returns 404 for non-existent file', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/media/non-existent', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 404 for other tenant file (security)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-other', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile) // belongs to tenant-123

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(401)
  })

  it('still deletes from database even if R2 deletion fails', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockDeleteObject.mockRejectedValue(new Error('R2 error'))
    mockDelete.mockResolvedValue(mockMediaFile)

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(204)
    expect(mockDelete).toHaveBeenCalled()
  })

  it('skips R2 deletion when key cannot be extracted', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue(null)
    mockDelete.mockResolvedValue(mockMediaFile)

    const request = new NextRequest('http://localhost:3000/api/media/media-123', {
      method: 'DELETE',
    })
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'media-123' }),
    })

    expect(response.status).toBe(204)
    expect(mockDeleteObject).not.toHaveBeenCalled()
  })
})
