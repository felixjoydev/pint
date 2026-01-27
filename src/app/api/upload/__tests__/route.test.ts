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
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/storage', () => ({
  generateStorageKey: vi.fn(),
  generatePresignedUploadUrl: vi.fn(),
  getPublicUrl: vi.fn(),
}))

import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import {
  generateStorageKey,
  generatePresignedUploadUrl,
  getPublicUrl,
} from '@/lib/storage'

describe('POST /api/upload', () => {
  const mockRequireTenant = requireTenant as ReturnType<typeof vi.fn>
  const mockCreate = prisma.mediaFile.create as ReturnType<typeof vi.fn>
  const mockGenerateStorageKey = generateStorageKey as ReturnType<typeof vi.fn>
  const mockGeneratePresignedUploadUrl = generatePresignedUploadUrl as ReturnType<typeof vi.fn>
  const mockGetPublicUrl = getPublicUrl as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('creates presigned URL for valid image upload', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockGenerateStorageKey.mockReturnValue('tenants/tenant-123/2026/01/abc123.jpg')
    mockGeneratePresignedUploadUrl.mockResolvedValue('https://r2.example.com/presigned-url')
    mockGetPublicUrl.mockReturnValue('https://media.example.com/tenants/tenant-123/2026/01/abc123.jpg')
    mockCreate.mockResolvedValue({
      id: 'media-file-id',
      tenantId: 'tenant-123',
      filename: 'photo.jpg',
      url: 'https://media.example.com/tenants/tenant-123/2026/01/abc123.jpg',
      size: 5000000,
      mimeType: 'image/jpeg',
    })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 5000000,
      }),
    })
    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.id).toBe('media-file-id')
    expect(json.uploadUrl).toBe('https://r2.example.com/presigned-url')
    expect(json.publicUrl).toBe('https://media.example.com/tenants/tenant-123/2026/01/abc123.jpg')
    expect(json.key).toBe('tenants/tenant-123/2026/01/abc123.jpg')
  })

  it('creates presigned URL for valid audio upload', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockGenerateStorageKey.mockReturnValue('tenants/tenant-123/2026/01/xyz789.mp3')
    mockGeneratePresignedUploadUrl.mockResolvedValue('https://r2.example.com/audio-presigned')
    mockGetPublicUrl.mockReturnValue('https://media.example.com/tenants/tenant-123/2026/01/xyz789.mp3')
    mockCreate.mockResolvedValue({
      id: 'audio-file-id',
      tenantId: 'tenant-123',
      filename: 'song.mp3',
      url: 'https://media.example.com/tenants/tenant-123/2026/01/xyz789.mp3',
      size: 40000000,
      mimeType: 'audio/mpeg',
    })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'song.mp3',
        mimeType: 'audio/mpeg',
        size: 40000000,
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockGenerateStorageKey).toHaveBeenCalledWith('tenant-123', 'audio/mpeg')
  })

  it('creates MediaFile record with correct tenantId', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-abc', tier: 'pro' })
    mockGenerateStorageKey.mockReturnValue('tenants/tenant-abc/2026/01/file.png')
    mockGeneratePresignedUploadUrl.mockResolvedValue('https://presigned.url')
    mockGetPublicUrl.mockReturnValue('https://public.url/file.png')
    mockCreate.mockResolvedValue({ id: 'media-id' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'image.png',
        mimeType: 'image/png',
        size: 1000,
      }),
    })
    await POST(request)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant-abc',
        filename: 'image.png',
        mimeType: 'image/png',
        size: 1000,
      }),
    })
  })

  it('returns all required fields (id, uploadUrl, publicUrl, key)', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockGenerateStorageKey.mockReturnValue('storage-key')
    mockGeneratePresignedUploadUrl.mockResolvedValue('upload-url')
    mockGetPublicUrl.mockReturnValue('public-url')
    mockCreate.mockResolvedValue({ id: 'file-id' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      }),
    })
    const response = await POST(request)
    const json = await response.json()

    expect(json).toHaveProperty('id')
    expect(json).toHaveProperty('uploadUrl')
    expect(json).toHaveProperty('publicUrl')
    expect(json).toHaveProperty('key')
  })

  it('storage key contains tenant ID for isolation', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'isolated-tenant', tier: 'free' })
    mockGenerateStorageKey.mockReturnValue('tenants/isolated-tenant/2026/01/file.jpg')
    mockGeneratePresignedUploadUrl.mockResolvedValue('url')
    mockGetPublicUrl.mockReturnValue('public-url')
    mockCreate.mockResolvedValue({ id: 'id' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      }),
    })
    const response = await POST(request)
    const json = await response.json()

    expect(json.key).toContain('isolated-tenant')
    expect(mockGenerateStorageKey).toHaveBeenCalledWith('isolated-tenant', 'image/jpeg')
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireTenant.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 for unsupported MIME type', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1000,
      }),
    })
    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for file exceeding size limit', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'huge-image.jpg',
        mimeType: 'image/jpeg',
        size: 15 * 1024 * 1024, // 15MB, exceeds 10MB limit
      }),
    })
    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for missing required fields', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.jpg',
        // missing mimeType and size
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid filename format', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'invalid file name.jpg', // has spaces
        mimeType: 'image/jpeg',
        size: 1000,
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('calls generatePresignedUploadUrl with correct parameters', async () => {
    mockRequireTenant.mockResolvedValue({ id: 'tenant-123', tier: 'free' })
    mockGenerateStorageKey.mockReturnValue('generated-key')
    mockGeneratePresignedUploadUrl.mockResolvedValue('presigned-url')
    mockGetPublicUrl.mockReturnValue('public-url')
    mockCreate.mockResolvedValue({ id: 'id' })

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'test.gif',
        mimeType: 'image/gif',
        size: 2500000,
      }),
    })
    await POST(request)

    expect(mockGeneratePresignedUploadUrl).toHaveBeenCalledWith(
      'generated-key',
      'image/gif',
      2500000
    )
  })
})
