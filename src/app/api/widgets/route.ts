/**
 * Widgets API - List & Bulk Update
 *
 * GET /api/widgets - List all widgets for the authenticated tenant
 * PATCH /api/widgets - Bulk update widget order
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError, NotFoundError } from '@/lib/api/errors'
import { updateWidgetOrderSchema } from '@/lib/validations/widget'

/**
 * GET /api/widgets
 * List all widgets for the authenticated tenant.
 */
export async function GET(_request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const widgets = await prisma.widget.findMany({
      where: { tenantId: tenant.id },
      orderBy: { displayOrder: 'asc' },
    })

    return successResponse({ widgets })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/widgets
 * Bulk update widget display order.
 */
export async function PATCH(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const body = await request.json()
    const { widgets } = updateWidgetOrderSchema.parse(body)

    // Verify all widgets belong to tenant
    const widgetIds = widgets.map((w) => w.id)
    const existingWidgets = await prisma.widget.findMany({
      where: { id: { in: widgetIds }, tenantId: tenant.id },
      select: { id: true },
    })

    if (existingWidgets.length !== widgetIds.length) {
      throw new NotFoundError('Widget')
    }

    // Update all in transaction
    await prisma.$transaction(
      widgets.map((w) =>
        prisma.widget.update({
          where: { id: w.id },
          data: { displayOrder: w.displayOrder },
        })
      )
    )

    const updatedWidgets = await prisma.widget.findMany({
      where: { tenantId: tenant.id },
      orderBy: { displayOrder: 'asc' },
    })

    return successResponse({ widgets: updatedWidgets })
  } catch (error) {
    return handleApiError(error)
  }
}
