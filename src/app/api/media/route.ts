/**
 * Media API - List Media Files
 * GET /api/media
 *
 * Lists media files for the authenticated tenant with filtering and pagination.
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError } from '@/lib/api/errors'
import { mediaListQuerySchema } from '@/lib/validations/media'
import { IMAGE_MIME_TYPES, AUDIO_MIME_TYPES } from '@/lib/storage/constants'

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const query = mediaListQuerySchema.parse(searchParams)

    // Build where clause based on type filter
    const mimeTypes =
      query.type === 'image'
        ? [...IMAGE_MIME_TYPES]
        : query.type === 'audio'
          ? [...AUDIO_MIME_TYPES]
          : undefined

    const mediaFiles = await prisma.mediaFile.findMany({
      where: {
        tenantId: tenant.id,
        ...(mimeTypes && { mimeType: { in: mimeTypes } }),
        ...(query.cursor && { id: { lt: query.cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1, // Fetch one extra for pagination
    })

    // Check if there are more results
    const hasMore = mediaFiles.length > query.limit
    const items = hasMore ? mediaFiles.slice(0, -1) : mediaFiles
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return successResponse({
      items,
      nextCursor,
      hasMore,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
