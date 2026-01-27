/**
 * Posts API - Get, Update, Delete Single Post
 *
 * GET /api/posts/[id] - Get a single post
 * PATCH /api/posts/[id] - Update a post
 * DELETE /api/posts/[id] - Delete a post
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { NotFoundError, UnauthorizedError } from '@/lib/api/errors'
import { updatePostSchema } from '@/lib/validations/post'
import { ensureUniquePostSlug } from '@/lib/utils/slug'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/posts/[id]
 * Get a single post by ID.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    const post = await prisma.post.findFirst({
      where: {
        id,
        tenantId: tenant.id, // Security: tenant isolation
      },
      include: {
        _count: { select: { likes: true } },
      },
    })

    if (!post) throw new NotFoundError('Post')

    return successResponse({ post })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/posts/[id]
 * Update a post by ID.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    // Check post exists and belongs to tenant
    const existingPost = await prisma.post.findFirst({
      where: { id, tenantId: tenant.id },
    })
    if (!existingPost) throw new NotFoundError('Post')

    const body = await request.json()
    const data = updatePostSchema.parse(body)

    // Handle slug change
    let slug = existingPost.slug
    if (data.slug && data.slug !== existingPost.slug) {
      slug = await ensureUniquePostSlug(data.slug, tenant.id, id)
    }

    // Handle first publish
    let publishedAt = existingPost.publishedAt
    if (data.status === 'published' && !existingPost.publishedAt) {
      publishedAt = new Date()
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug && { slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.password !== undefined && { password: data.password }),
        publishedAt,
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

/**
 * DELETE /api/posts/[id]
 * Delete a post by ID.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    const existingPost = await prisma.post.findFirst({
      where: { id, tenantId: tenant.id },
    })
    if (!existingPost) throw new NotFoundError('Post')

    await prisma.post.delete({
      where: { id },
    })

    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
