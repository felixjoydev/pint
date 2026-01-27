/**
 * Posts API - Publish/Unpublish
 *
 * POST /api/posts/[id]/publish - Publish or unpublish a post
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { NotFoundError, UnauthorizedError } from '@/lib/api/errors'

const publishSchema = z.object({
  action: z.enum(['publish', 'unpublish']),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * POST /api/posts/[id]/publish
 * Publish or unpublish a post.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    const existingPost = await prisma.post.findFirst({
      where: { id, tenantId: tenant.id },
    })
    if (!existingPost) throw new NotFoundError('Post')

    const body = await request.json()
    const { action } = publishSchema.parse(body)

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: action === 'publish' ? 'published' : 'draft',
        publishedAt:
          action === 'publish' && !existingPost.publishedAt
            ? new Date()
            : existingPost.publishedAt,
      },
      include: {
        _count: { select: { likes: true } },
      },
    })

    return successResponse({ post })
  } catch (error) {
    return handleApiError(error)
  }
}
