/**
 * Posts API - List & Create
 *
 * GET /api/posts - List all posts for the authenticated tenant
 * POST /api/posts - Create a new post
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, createdResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError, PostLimitError } from '@/lib/api/errors'
import { createPostSchema } from '@/lib/validations/post'
import { generateSlug, ensureUniquePostSlug } from '@/lib/utils/slug'
import type { PostStatus } from '@prisma/client'

const FREE_POST_LIMIT = 50

/**
 * GET /api/posts
 * List all posts for the authenticated tenant.
 * Optionally filter by status using ?status=draft|published
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as PostStatus | null

    const posts = await prisma.post.findMany({
      where: {
        tenantId: tenant.id,
        ...(status && { status }),
      },
      include: {
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ posts })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/posts
 * Create a new post for the authenticated tenant.
 */
export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    // Check post limit for free tier
    if (tenant.tier === 'free') {
      const postCount = await prisma.post.count({
        where: { tenantId: tenant.id },
      })
      if (postCount >= FREE_POST_LIMIT) {
        throw new PostLimitError(FREE_POST_LIMIT)
      }
    }

    const body = await request.json()
    const data = createPostSchema.parse(body)

    // Generate slug if not provided
    const baseSlug = data.slug || generateSlug(data.title)
    const slug = await ensureUniquePostSlug(baseSlug, tenant.id)

    const post = await prisma.post.create({
      data: {
        tenantId: tenant.id,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage || null,
        status: data.status,
        password: data.password,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
      include: {
        _count: { select: { likes: true } },
      },
    })

    return createdResponse({ post })
  } catch (error) {
    return handleApiError(error)
  }
}
