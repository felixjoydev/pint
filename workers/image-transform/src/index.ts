/**
 * Pint Image Transform Worker
 * Cloudflare Worker for on-demand image transformation.
 *
 * URL format: /{key}?w=800&f=webp&q=80
 *
 * Query parameters:
 * - w: Width (100-2000px)
 * - f: Format (webp, jpeg, jpg, png)
 * - q: Quality (1-100, default 80)
 */

interface Env {
  MEDIA_BUCKET: R2Bucket
  R2_PUBLIC_URL: string
}

const MAX_WIDTH = 2000
const MIN_WIDTH = 100
const DEFAULT_QUALITY = 80
const CACHE_TTL = 60 * 60 * 24 * 30 // 30 days

const SUPPORTED_FORMATS = ['webp', 'jpeg', 'jpg', 'png'] as const
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number]

const IMAGE_CONTENT_TYPES: Record<SupportedFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const key = decodeURIComponent(url.pathname.slice(1)) // Remove leading slash

    // Handle empty path
    if (!key) {
      return new Response('Not Found', { status: 404 })
    }

    // Parse query parameters
    const width = parseWidth(url.searchParams.get('w'))
    const format = parseFormat(url.searchParams.get('f'))
    const quality = parseQuality(url.searchParams.get('q'))

    // If no transformations requested, redirect to original
    if (!width && !format) {
      return Response.redirect(`${env.R2_PUBLIC_URL}/${key}`, 302)
    }

    // Generate cache key for transformed image
    const cacheKey = generateCacheKey(request.url, key, width, format, quality)
    const cacheRequest = new Request(cacheKey)

    // Check cache first
    const cache = caches.default
    const cachedResponse = await cache.match(cacheRequest)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch original from R2
    const object = await env.MEDIA_BUCKET.get(key)
    if (!object) {
      return new Response('Not Found', { status: 404 })
    }

    // Get content type
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream'

    // If not an image, return as-is with cache headers
    if (!contentType.startsWith('image/')) {
      const response = new Response(object.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
        },
      })
      return response
    }

    // For images, we need Cloudflare Image Resizing (paid feature)
    // If not available, return original with transformation params noted
    // This is a placeholder - actual transformation requires Cloudflare Pro+ plan

    // Determine output content type
    const outputContentType = format
      ? IMAGE_CONTENT_TYPES[format]
      : contentType

    // Create response with appropriate headers
    const response = new Response(object.body, {
      headers: {
        'Content-Type': outputContentType,
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
        'Vary': 'Accept',
        // Add transformation metadata for debugging
        'X-Pint-Transform': JSON.stringify({
          width: width || 'original',
          format: format || 'original',
          quality,
        }),
      },
    })

    // Cache the response
    // Note: In production with Image Resizing, cache the transformed image
    await cache.put(cacheRequest, response.clone())

    return response
  },
}

/**
 * Parse width parameter, constraining to valid range
 */
function parseWidth(value: string | null): number | undefined {
  if (!value) return undefined
  const num = parseInt(value, 10)
  if (isNaN(num)) return undefined
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, num))
}

/**
 * Parse format parameter, validating against supported formats
 */
function parseFormat(value: string | null): SupportedFormat | undefined {
  if (!value) return undefined
  const lower = value.toLowerCase() as SupportedFormat
  return SUPPORTED_FORMATS.includes(lower) ? lower : undefined
}

/**
 * Parse quality parameter, constraining to valid range
 */
function parseQuality(value: string | null): number {
  if (!value) return DEFAULT_QUALITY
  const num = parseInt(value, 10)
  if (isNaN(num)) return DEFAULT_QUALITY
  return Math.min(100, Math.max(1, num))
}

/**
 * Generate a unique cache key for the transformed image
 */
function generateCacheKey(
  originalUrl: string,
  key: string,
  width: number | undefined,
  format: SupportedFormat | undefined,
  quality: number
): string {
  // Use the original URL as base to ensure uniqueness per transformation
  const parts = [originalUrl]
  if (width) parts.push(`w=${width}`)
  if (format) parts.push(`f=${format}`)
  parts.push(`q=${quality}`)
  return parts.join('&')
}
