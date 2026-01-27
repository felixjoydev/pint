/**
 * Pages API - Get, Update, Delete Single Page
 *
 * GET /api/pages/[id] - Get a single page
 * PATCH /api/pages/[id] - Update a page
 * DELETE /api/pages/[id] - Delete a page
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { NotFoundError, UnauthorizedError } from '@/lib/api/errors'
import { updatePageSchema } from '@/lib/validations/page'
import { ensureUniquePageSlug } from '@/lib/utils/slug'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/pages/[id]
 * Get a single page by ID.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    const page = await prisma.page.findFirst({
      where: {
        id,
        tenantId: tenant.id, // Security: tenant isolation
      },
    })

    if (!page) throw new NotFoundError('Page')

    return successResponse({ page })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/pages/[id]
 * Update a page by ID.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    // Check page exists and belongs to tenant
    const existingPage = await prisma.page.findFirst({
      where: { id, tenantId: tenant.id },
    })
    if (!existingPage) throw new NotFoundError('Page')

    const body = await request.json()
    const data = updatePageSchema.parse(body)

    // Handle slug change
    let slug = existingPage.slug
    if (data.slug && data.slug !== existingPage.slug) {
      slug = await ensureUniquePageSlug(data.slug, tenant.id, id)
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug && { slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.showInNav !== undefined && { showInNav: data.showInNav }),
        ...(data.navOrder !== undefined && { navOrder: data.navOrder }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })

    return successResponse({ page })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/pages/[id]
 * Delete a page by ID.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    const existingPage = await prisma.page.findFirst({
      where: { id, tenantId: tenant.id },
    })
    if (!existingPage) throw new NotFoundError('Page')

    await prisma.page.delete({
      where: { id },
    })

    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
