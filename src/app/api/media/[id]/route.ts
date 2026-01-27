/**
 * Media API - Get/Delete Single Media File
 * GET/DELETE /api/media/[id]
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import {
  successResponse,
  noContentResponse,
  handleApiError,
} from '@/lib/api/response'
import { UnauthorizedError, NotFoundError } from '@/lib/api/errors'
import { extractKeyFromUrl, deleteObject } from '@/lib/storage'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await params

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile || mediaFile.tenantId !== tenant.id) {
      throw new NotFoundError('Media file')
    }

    return successResponse({ mediaFile })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await params

    // Find the media file
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile || mediaFile.tenantId !== tenant.id) {
      throw new NotFoundError('Media file')
    }

    // Delete from R2 (ignore errors - file might not exist)
    const key = extractKeyFromUrl(mediaFile.url)
    if (key) {
      try {
        await deleteObject(key)
      } catch {
        // Ignore R2 deletion errors - file might already be deleted
      }
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id },
    })

    return noContentResponse()
  } catch (error) {
    return handleApiError(error)
  }
}
