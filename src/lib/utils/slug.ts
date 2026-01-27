/**
 * Slug Generation Utilities
 *
 * Functions for generating and validating URL-safe slugs.
 */

import { prisma } from '@/lib/db/prisma'

/**
 * Generate a URL-safe slug from a title.
 *
 * @param title - The title to convert to a slug
 * @returns A URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 100) // Limit length
}

/**
 * Ensure slug is unique within tenant for posts.
 * Appends -2, -3, etc. if the slug already exists.
 *
 * @param baseSlug - The base slug to check
 * @param tenantId - The tenant ID to scope the uniqueness check
 * @param excludePostId - Optional post ID to exclude (for updates)
 * @returns A unique slug
 */
export async function ensureUniquePostSlug(
  baseSlug: string,
  tenantId: string,
  excludePostId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        tenantId,
        slug,
        ...(excludePostId && { id: { not: excludePostId } }),
      },
      select: { id: true },
    })

    if (!existing) return slug

    counter++
    slug = `${baseSlug}-${counter}`
  }
}

/**
 * Ensure slug is unique within tenant for pages.
 * Appends -2, -3, etc. if the slug already exists.
 *
 * @param baseSlug - The base slug to check
 * @param tenantId - The tenant ID to scope the uniqueness check
 * @param excludePageId - Optional page ID to exclude (for updates)
 * @returns A unique slug
 */
export async function ensureUniquePageSlug(
  baseSlug: string,
  tenantId: string,
  excludePageId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.page.findFirst({
      where: {
        tenantId,
        slug,
        ...(excludePageId && { id: { not: excludePageId } }),
      },
      select: { id: true },
    })

    if (!existing) return slug

    counter++
    slug = `${baseSlug}-${counter}`
  }
}
