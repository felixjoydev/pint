/**
 * Widgets API - Update Single Widget
 *
 * PATCH /api/widgets/[id] - Update a single widget
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { NotFoundError, UnauthorizedError } from '@/lib/api/errors'
import { updateWidgetSchema } from '@/lib/validations/widget'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/widgets/[id]
 * Update a single widget's config, enabled state, or display order.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await context.params

    // Check widget exists and belongs to tenant
    const existingWidget = await prisma.widget.findFirst({
      where: { id, tenantId: tenant.id },
    })
    if (!existingWidget) throw new NotFoundError('Widget')

    const body = await request.json()
    const data = updateWidgetSchema.parse(body)

    const widget = await prisma.widget.update({
      where: { id },
      data: {
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.config !== undefined && { config: data.config }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
    })

    return successResponse({ widget })
  } catch (error) {
    return handleApiError(error)
  }
}
