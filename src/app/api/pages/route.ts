/**
 * Pages API - List & Create
 *
 * GET /api/pages - List all pages for the authenticated tenant
 * POST /api/pages - Create a new page
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, createdResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError } from '@/lib/api/errors'
import { createPageSchema } from '@/lib/validations/page'
import { generateSlug, ensureUniquePageSlug } from '@/lib/utils/slug'
import type { PageStatus } from '@prisma/client'

/**
 * GET /api/pages
 * List all pages for the authenticated tenant.
 * Optionally filter by status using ?status=draft|published
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as PageStatus | null

    const pages = await prisma.page.findMany({
      where: {
        tenantId: tenant.id,
        ...(status && { status }),
      },
      orderBy: [{ navOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return successResponse({ pages })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/pages
 * Create a new page for the authenticated tenant.
 */
export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const body = await request.json()
    const data = createPageSchema.parse(body)

    // Generate slug if not provided
    const baseSlug = data.slug || generateSlug(data.title)
    const slug = await ensureUniquePageSlug(baseSlug, tenant.id)

    // Get next navOrder if not provided
    let navOrder = data.navOrder
    if (navOrder === undefined && data.showInNav) {
      const lastPage = await prisma.page.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { navOrder: 'desc' },
        select: { navOrder: true },
      })
      navOrder = (lastPage?.navOrder ?? -1) + 1
    }

    const page = await prisma.page.create({
      data: {
        tenantId: tenant.id,
        title: data.title,
        slug,
        content: data.content,
        showInNav: data.showInNav,
        navOrder: navOrder ?? 0,
        status: data.status,
      },
    })

    return createdResponse({ page })
  } catch (error) {
    return handleApiError(error)
  }
}
