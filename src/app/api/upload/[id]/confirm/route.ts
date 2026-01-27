/**
 * Upload Confirmation API
 * POST /api/upload/[id]/confirm
 *
 * Confirms an upload is complete and optionally verifies the file exists in R2.
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/api/errors'
import { uploadConfirmSchema } from '@/lib/validations/media'
import { extractKeyFromUrl, headObject } from '@/lib/storage'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const data = uploadConfirmSchema.parse(body)

    // Find the media file
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      throw new NotFoundError('Media file')
    }

    // Verify tenant ownership (security)
    if (mediaFile.tenantId !== tenant.id) {
      throw new NotFoundError('Media file')
    }

    // Extract key and verify file exists in R2
    const key = extractKeyFromUrl(mediaFile.url)
    if (key) {
      const fileInfo = await headObject(key)
      if (!fileInfo.exists) {
        throw new ValidationError([
          {
            path: 'upload',
            message: 'File not found in storage. Upload may have failed.',
          },
        ])
      }

      // Update size from actual file if not provided
      if (!data.size && fileInfo.size) {
        data.size = fileInfo.size
      }
    }

    // Update media file if size changed
    const updatedFile = data.size
      ? await prisma.mediaFile.update({
          where: { id },
          data: { size: data.size },
        })
      : mediaFile

    return successResponse({
      id: updatedFile.id,
      filename: updatedFile.filename,
      url: updatedFile.url,
      size: updatedFile.size,
      mimeType: updatedFile.mimeType,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
