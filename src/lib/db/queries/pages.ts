import { prisma } from '../prisma'
import { PageStatus } from '@prisma/client'

export async function getPagesByTenant(tenantId: string, status?: PageStatus) {
  return prisma.page.findMany({
    where: {
      tenantId,
      ...(status && { status }),
    },
    orderBy: { navOrder: 'asc' },
  })
}

export async function getPublishedPagesByTenant(tenantId: string) {
  return prisma.page.findMany({
    where: {
      tenantId,
      status: 'published',
    },
    orderBy: { navOrder: 'asc' },
  })
}

export async function getNavPages(tenantId: string) {
  return prisma.page.findMany({
    where: {
      tenantId,
      status: 'published',
      showInNav: true,
    },
    orderBy: { navOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      navOrder: true,
    },
  })
}

export async function getPageBySlug(tenantId: string, slug: string) {
  return prisma.page.findUnique({
    where: {
      tenantId_slug: { tenantId, slug },
    },
  })
}

export async function getPageById(tenantId: string, id: string) {
  return prisma.page.findFirst({
    where: {
      id,
      tenantId,
    },
  })
}
