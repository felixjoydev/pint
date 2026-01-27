import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock dependencies
vi.mock('@/lib/auth/tenant', () => ({
  requireTenant: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    mediaFile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/storage', () => ({
  extractKeyFromUrl: vi.fn(),
  headObject: vi.fn(),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { extractKeyFromUrl, headObject } from '@/lib/storage'

describe('POST /api/upload/[id]/confirm', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockFindUnique = prisma.mediaFile.findUnique as ReturnType<typeof vi.fn>
  const mockUpdate = prisma.mediaFile.update as ReturnType<typeof vi.fn>
  const mockExtractKeyFromUrl = extractKeyFromUrl as ReturnType<typeof vi.fn>
  const mockHeadObject = headObject as ReturnType<typeof vi.fn>

  const mockMediaFile = {
    id: 'media-123',
    tenantId: 'tenant-123',
    filename: 'photo.jpg',
    url: 'https://media.example.com/tenants/tenant-123/2026/01/abc123.jpg',
    size: 5000000,
    mimeType: 'image/jpeg',
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('confirms existing upload', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('tenants/tenant-123/2026/01/abc123.jpg')
    mockHeadObject.mockResolvedValue({ exists: true }) // No size returned, so no update needed

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.id).toBe('media-123')
    expect(json.filename).toBe('photo.jpg')
  })

  it('updates size when provided', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockHeadObject.mockResolvedValue({ exists: true })
    mockUpdate.mockResolvedValue({ ...mockMediaFile, size: 6000000 })

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({ size: 6000000 }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.size).toBe(6000000)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'media-123' },
      data: { size: 6000000 },
    })
  })

  it('updates size from R2 headObject when not provided', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue({ ...mockMediaFile, size: 0 })
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockHeadObject.mockResolvedValue({ exists: true, size: 7500000 })
    mockUpdate.mockResolvedValue({ ...mockMediaFile, size: 7500000 })

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })
    const json = await response.json()

    expect(json.size).toBe(7500000)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'media-123' },
      data: { size: 7500000 },
    })
  })

  it('empty body works (idempotent)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockHeadObject.mockResolvedValue({ exists: true })

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      // No body at all
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })

    expect(response.status).toBe(200)
  })

  it('returns complete media file info', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockHeadObject.mockResolvedValue({ exists: true })

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })
    const json = await response.json()

    expect(json).toHaveProperty('id')
    expect(json).toHaveProperty('filename')
    expect(json).toHaveProperty('url')
    expect(json).toHaveProperty('size')
    expect(json).toHaveProperty('mimeType')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })

    expect(response.status).toBe(401)
  })

  it('returns 404 for non-existent file', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/upload/non-existent/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 404 when accessing other tenant file (security)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-other', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile) // belongs to tenant-123

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })

    expect(response.status).toBe(404)
  })

  it('returns 400 when file not found in R2 storage', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue('key')
    mockHeadObject.mockResolvedValue({ exists: false })

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.details[0].message).toContain('File not found in storage')
  })

  it('skips R2 verification when key cannot be extracted', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockFindUnique.mockResolvedValue(mockMediaFile)
    mockExtractKeyFromUrl.mockReturnValue(null) // URL doesn't match expected format

    const request = new NextRequest('http://localhost:3000/api/upload/media-123/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'media-123' }) })

    expect(response.status).toBe(200)
    expect(mockHeadObject).not.toHaveBeenCalled()
  })
})
