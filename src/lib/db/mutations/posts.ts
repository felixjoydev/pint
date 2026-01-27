import { prisma } from '../prisma'
import { PostStatus, Prisma } from '@prisma/client'

export type CreatePostInput = {
  tenantId: string
  slug: string
  title: string
  content: Prisma.InputJsonValue
  excerpt?: string
  featuredImage?: string
  status?: PostStatus
  password?: string
  publishedAt?: Date
}

export async function createPost(data: CreatePostInput) {
  return prisma.post.create({
    data: {
      tenantId: data.tenantId,
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      status: data.status ?? 'draft',
      password: data.password,
      publishedAt: data.publishedAt,
    },
  })
}

export type UpdatePostInput = {
  slug?: string
  title?: string
  content?: Prisma.InputJsonValue
  excerpt?: string | null
  featuredImage?: string | null
  status?: PostStatus
  password?: string | null
  publishedAt?: Date | null
}

export async function updatePost(
  tenantId: string,
  id: string,
  data: UpdatePostInput
) {
  return prisma.post.updateMany({
    where: {
      id,
      tenantId,
    },
    data,
  })
}

export async function deletePost(tenantId: string, id: string) {
  return prisma.post.deleteMany({
    where: {
      id,
      tenantId,
    },
  })
}

export async function publishPost(tenantId: string, id: string) {
  return prisma.post.updateMany({
    where: {
      id,
      tenantId,
    },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  })
}

export async function unpublishPost(tenantId: string, id: string) {
  return prisma.post.updateMany({
    where: {
      id,
      tenantId,
    },
    data: {
      status: 'draft',
      publishedAt: null,
    },
  })
}
