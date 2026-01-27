import { prisma } from '../prisma'
import { PageStatus, Prisma } from '@prisma/client'

export type CreatePageInput = {
  tenantId: string
  slug: string
  title: string
  content: Prisma.InputJsonValue
  showInNav?: boolean
  navOrder?: number
  status?: PageStatus
}

export async function createPage(data: CreatePageInput) {
  return prisma.page.create({
    data: {
      tenantId: data.tenantId,
      slug: data.slug,
      title: data.title,
      content: data.content,
      showInNav: data.showInNav ?? true,
      navOrder: data.navOrder,
      status: data.status ?? 'draft',
    },
  })
}

export type UpdatePageInput = {
  slug?: string
  title?: string
  content?: Prisma.InputJsonValue
  showInNav?: boolean
  navOrder?: number | null
  status?: PageStatus
}

export async function updatePage(
  tenantId: string,
  id: string,
  data: UpdatePageInput
) {
  return prisma.page.updateMany({
    where: {
      id,
      tenantId,
    },
    data,
  })
}

export async function deletePage(tenantId: string, id: string) {
  return prisma.page.deleteMany({
    where: {
      id,
      tenantId,
    },
  })
}

export async function publishPage(tenantId: string, id: string) {
  return prisma.page.updateMany({
    where: {
      id,
      tenantId,
    },
    data: {
      status: 'published',
    },
  })
}

export async function unpublishPage(tenantId: string, id: string) {
  return prisma.page.updateMany({
    where: {
      id,
      tenantId,
    },
    data: {
      status: 'draft',
    },
  })
}

export async function reorderPages(
  tenantId: string,
  pageOrders: { id: string; navOrder: number }[]
) {
  return prisma.$transaction(
    pageOrders.map(({ id, navOrder }) =>
      prisma.page.updateMany({
        where: { id, tenantId },
        data: { navOrder },
      })
    )
  )
}
