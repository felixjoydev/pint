/**
 * Upload API - Request Presigned URL
 * POST /api/upload
 *
 * Generates a presigned URL for direct upload to R2 storage.
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { createdResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError } from '@/lib/api/errors'
import { uploadRequestSchema } from '@/lib/validations/media'
import {
  generateStorageKey,
  generatePresignedUploadUrl,
  getPublicUrl,
} from '@/lib/storage'
import type { SupportedMimeType } from '@/lib/storage/constants'

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const body = await request.json()
    const data = uploadRequestSchema.parse(body)

    // Generate unique storage key with tenant isolation
    const key = generateStorageKey(tenant.id, data.mimeType as SupportedMimeType)

    // Generate presigned upload URL
    const uploadUrl = await generatePresignedUploadUrl(
      key,
      data.mimeType,
      data.size
    )

    // Get public URL
    const publicUrl = getPublicUrl(key)

    // Create MediaFile record
    const mediaFile = await prisma.mediaFile.create({
      data: {
        tenantId: tenant.id,
        filename: data.filename,
        url: publicUrl,
        size: data.size,
        mimeType: data.mimeType,
      },
    })

    return createdResponse({
      id: mediaFile.id,
      uploadUrl,
      publicUrl,
      key,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
