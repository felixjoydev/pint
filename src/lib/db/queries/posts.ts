import { prisma } from '../prisma'
import { PostStatus } from '@prisma/client'

export async function getPostsByTenant(tenantId: string, status?: PostStatus) {
  return prisma.post.findMany({
    where: {
      tenantId,
      ...(status && { status }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPublishedPostsByTenant(tenantId: string) {
  return prisma.post.findMany({
    where: {
      tenantId,
      status: 'published',
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
    },
  })
}

export async function getPostBySlug(tenantId: string, slug: string) {
  return prisma.post.findUnique({
    where: {
      tenantId_slug: { tenantId, slug },
    },
  })
}

export async function getPostById(tenantId: string, id: string) {
  return prisma.post.findFirst({
    where: {
      id,
      tenantId,
    },
  })
}

export async function getPostWithLikes(tenantId: string, slug: string) {
  return prisma.post.findUnique({
    where: {
      tenantId_slug: { tenantId, slug },
    },
    include: {
      _count: {
        select: { likes: true },
      },
    },
  })
}
