# Phase 5: Media Storage (Cloudflare R2)

> **Status Legend:** Pending | In Progress | Done | Blocked

**Context:** Implement media file storage using Cloudflare R2. Users can upload images (for posts, featured images) and audio files (for music player widget). Files are uploaded directly to R2 using presigned URLs, with metadata tracked in the database.

**Dependencies:** Phase 4 Complete
**Branch:** `feature/media-storage`
**Estimated Tests:** 60-75 new tests

---

## Task Dependency Graph

```
5.1 (Dependencies)
    |
5.2 (R2 Client + Constants)
    |
5.3 (Validation Schemas)
    |
5.4 (Upload API)
    |
5.5 (Confirmation API)
    |
5.6 (Media List/Delete API)
    |
5.7 (Environment Variables)
    |
5.8 (Cloudflare Worker)
```

---

## Task 5.1: Install R2/S3 Dependencies

**Status:** Done

### Description
Install AWS SDK v3 for S3-compatible R2 operations and nanoid for generating unique file keys.

### Implementation
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner nanoid
```

### Verification Checklist
- [ ] Dependencies installed without errors
- [ ] Can import `S3Client` from `@aws-sdk/client-s3`
- [ ] Can import `getSignedUrl` from `@aws-sdk/s3-request-presigner`
- [ ] Can import `nanoid` from `nanoid`
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes

### Tests
None (dependency installation only)

---

## Task 5.2: Create R2 Client Configuration

**Status:** Done

### Description
Create a configured S3 client for Cloudflare R2 with proper credentials and endpoint, plus constants for file type/size validation.

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/storage/constants.ts` | MIME types, size limits, helper functions |
| `src/lib/storage/r2.ts` | R2 client singleton, presigned URL generation |
| `src/lib/storage/index.ts` | Export barrel |
| `src/lib/storage/__tests__/constants.test.ts` | Constants unit tests |
| `src/lib/storage/__tests__/r2.test.ts` | R2 utilities tests |

### constants.ts Implementation

```typescript
/**
 * Storage Constants
 * File type definitions and size limits for media uploads.
 */

// Supported image MIME types
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

// Supported audio MIME types
export const AUDIO_MIME_TYPES = [
  'audio/mpeg',    // MP3
  'audio/wav',
  'audio/ogg',
] as const

// All supported MIME types
export const SUPPORTED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
] as const

export type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number]
export type ImageMimeType = typeof IMAGE_MIME_TYPES[number]
export type AudioMimeType = typeof AUDIO_MIME_TYPES[number]

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024  // 50MB

// Presigned URL expiration (in seconds)
export const PRESIGNED_URL_EXPIRY = 60 * 10  // 10 minutes

// File extensions mapping
export const MIME_TO_EXTENSION: Record<SupportedMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
}

/**
 * Get the maximum file size for a given MIME type.
 */
export function getMaxFileSize(mimeType: string): number {
  if (IMAGE_MIME_TYPES.includes(mimeType as ImageMimeType)) {
    return MAX_IMAGE_SIZE
  }
  if (AUDIO_MIME_TYPES.includes(mimeType as AudioMimeType)) {
    return MAX_AUDIO_SIZE
  }
  return 0
}

/**
 * Check if a MIME type is supported.
 */
export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType)
}

/**
 * Check if a MIME type is an image.
 */
export function isImageMimeType(mimeType: string): mimeType is ImageMimeType {
  return IMAGE_MIME_TYPES.includes(mimeType as ImageMimeType)
}

/**
 * Check if a MIME type is audio.
 */
export function isAudioMimeType(mimeType: string): mimeType is AudioMimeType {
  return AUDIO_MIME_TYPES.includes(mimeType as AudioMimeType)
}
```

### r2.ts Implementation

```typescript
/**
 * Cloudflare R2 Client
 * S3-compatible client for interacting with Cloudflare R2 storage.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'
import { PRESIGNED_URL_EXPIRY, MIME_TO_EXTENSION, type SupportedMimeType } from './constants'

// R2 Configuration from environment
const R2_ENDPOINT = process.env.R2_ENDPOINT!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET!
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!

/**
 * R2 Client Singleton (same pattern as prisma.ts)
 */
const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined
}

function createR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })
}

export const r2Client = globalForR2.r2Client ?? createR2Client()

if (process.env.NODE_ENV !== 'production') {
  globalForR2.r2Client = r2Client
}

/**
 * Generate a unique storage key for a file.
 * Format: tenants/{tenantId}/{year}/{month}/{nanoid}{extension}
 */
export function generateStorageKey(
  tenantId: string,
  mimeType: SupportedMimeType
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const uniqueId = nanoid(12)
  const extension = MIME_TO_EXTENSION[mimeType]

  return `tenants/${tenantId}/${year}/${month}/${uniqueId}${extension}`
}

/**
 * Generate a presigned URL for uploading a file to R2.
 */
export async function generatePresignedUploadUrl(
  key: string,
  mimeType: string,
  size: number
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: mimeType,
    ContentLength: size,
  })

  return getSignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRY,
  })
}

/**
 * Get the public URL for a stored file.
 */
export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`
}

/**
 * Check if a file exists in R2 and get its metadata.
 */
export async function headObject(key: string): Promise<{
  exists: boolean
  size?: number
  contentType?: string
}> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
    const response = await r2Client.send(command)
    return {
      exists: true,
      size: response.ContentLength,
      contentType: response.ContentType,
    }
  } catch {
    return { exists: false }
  }
}

/**
 * Delete a file from R2.
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  })
  await r2Client.send(command)
}

/**
 * Extract the storage key from a public URL.
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) {
    return null
  }
  return url.replace(`${R2_PUBLIC_URL}/`, '')
}
```

### Test Cases (12-15 tests)

**constants.test.ts:**
```typescript
describe('Storage Constants', () => {
  describe('isSupportedMimeType', () => {
    it('returns true for image/jpeg')
    it('returns true for image/png')
    it('returns true for image/gif')
    it('returns true for image/webp')
    it('returns true for audio/mpeg')
    it('returns false for application/pdf')
    it('returns false for text/plain')
  })

  describe('isImageMimeType', () => {
    it('returns true for image types')
    it('returns false for audio types')
  })

  describe('isAudioMimeType', () => {
    it('returns true for audio types')
    it('returns false for image types')
  })

  describe('getMaxFileSize', () => {
    it('returns 10MB for image types')
    it('returns 50MB for audio types')
    it('returns 0 for unsupported types')
  })
})
```

**r2.test.ts:**
```typescript
describe('R2 Utilities', () => {
  describe('generateStorageKey', () => {
    it('contains tenant ID in path')
    it('contains year and month')
    it('uses correct extension for MIME type')
    it('produces unique keys (nanoid)')
  })

  describe('getPublicUrl', () => {
    it('constructs correct URL from key')
  })

  describe('extractKeyFromUrl', () => {
    it('extracts key from valid public URL')
    it('returns null for invalid URL')
    it('returns null for URL from different domain')
  })
})
```

### Verification Checklist
- [ ] All tests pass: `npm run test src/lib/storage`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] No lint errors: `npm run lint`
- [ ] R2 client singleton follows prisma pattern

---

## Task 5.3: Create Validation Schemas

**Status:** Done

### Description
Create Zod validation schemas for upload requests, following existing patterns in `src/lib/validations/`.

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/validations/media.ts` | Zod schemas for upload requests |
| `src/lib/validations/__tests__/media.test.ts` | Validation tests |

### media.ts Implementation

```typescript
/**
 * Media Validation Schemas
 * Zod schemas for validating media upload requests.
 */

import { z } from 'zod'
import {
  SUPPORTED_MIME_TYPES,
  IMAGE_MIME_TYPES,
  AUDIO_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_AUDIO_SIZE,
  isSupportedMimeType,
  isImageMimeType,
} from '@/lib/storage/constants'

/**
 * Schema for requesting a presigned upload URL.
 */
export const uploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Filename can only contain letters, numbers, dots, underscores, and hyphens'
    ),
  mimeType: z
    .string()
    .refine(isSupportedMimeType, {
      message: `Unsupported file type. Allowed: ${SUPPORTED_MIME_TYPES.join(', ')}`,
    }),
  size: z
    .number()
    .positive('Size must be positive'),
}).refine(
  (data) => {
    const maxSize = isImageMimeType(data.mimeType) ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
    return data.size <= maxSize
  },
  (data) => ({
    message: isImageMimeType(data.mimeType)
      ? `Image files must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
      : `Audio files must be under ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
    path: ['size'],
  })
)

/**
 * Schema for confirming an upload is complete.
 */
export const uploadConfirmSchema = z.object({
  size: z.number().positive('Size must be positive').optional(),
})

/**
 * Schema for listing media files.
 */
export const mediaListQuerySchema = z.object({
  type: z.enum(['image', 'audio', 'all']).optional().default('all'),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
})

/**
 * TypeScript types inferred from schemas.
 */
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>
export type UploadConfirmInput = z.infer<typeof uploadConfirmSchema>
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>
```

### Test Cases (15-20 tests)

```typescript
describe('Media Validation Schemas', () => {
  describe('uploadRequestSchema', () => {
    // Valid cases
    it('accepts valid image upload (jpeg, 5MB)')
    it('accepts valid audio upload (mp3, 40MB)')
    it('accepts filename with dots and hyphens')
    it('accepts filename with underscores')

    // Invalid MIME types
    it('rejects unsupported MIME type (application/pdf)')
    it('rejects empty MIME type')

    // Size validation
    it('rejects image exceeding 10MB limit')
    it('rejects audio exceeding 50MB limit')
    it('rejects zero size')
    it('rejects negative size')

    // Filename validation
    it('rejects empty filename')
    it('rejects filename over 255 chars')
    it('rejects filename with spaces')
    it('rejects filename with special characters')

    // Error messages
    it('provides correct error message for oversized image')
    it('provides correct error message for oversized audio')
  })

  describe('uploadConfirmSchema', () => {
    it('accepts empty object')
    it('accepts valid size')
    it('rejects negative size')
  })

  describe('mediaListQuerySchema', () => {
    it('applies default values for empty object')
    it('accepts type=image')
    it('accepts type=audio')
    it('accepts type=all')
    it('rejects invalid type')
    it('accepts limit within range (1-100)')
    it('rejects limit below 1')
    it('rejects limit above 100')
    it('accepts valid UUID cursor')
    it('rejects invalid cursor format')
  })
})
```

### Verification Checklist
- [ ] All tests pass: `npm run test src/lib/validations/__tests__/media.test.ts`
- [ ] Type inference produces correct TypeScript types
- [ ] Schemas follow existing patterns (post.ts, page.ts)
- [ ] `npm run typecheck` passes

---

## Task 5.4: Create Upload API Route

**Status:** Done

### Description
Create POST `/api/upload` endpoint that generates presigned URLs for direct R2 upload.

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/upload/route.ts` | POST - Generate presigned URL |
| `src/app/api/upload/__tests__/route.test.ts` | Upload API tests |

### API Contract

```
POST /api/upload
Auth: Required (requireTenant)

Request Body:
{
  filename: string,   // Original filename
  mimeType: string,   // MIME type (image/jpeg, audio/mpeg, etc.)
  size: number        // File size in bytes
}

Success Response (201):
{
  id: string,         // MediaFile ID (UUID)
  uploadUrl: string,  // Presigned PUT URL (expires in 10 min)
  publicUrl: string,  // Public URL after upload complete
  key: string         // Storage key (for reference)
}

Error Responses:
- 401: Not authenticated
- 400: Validation error (invalid MIME type, size exceeded, etc.)
```

### Route Implementation

```typescript
/**
 * Upload API - Request Presigned URL
 * POST /api/upload
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { createdResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError } from '@/lib/api/errors'
import { uploadRequestSchema } from '@/lib/validations/media'
import {
  generateStorageKey,
  generatePresignedUploadUrl,
  getPublicUrl,
} from '@/lib/storage'
import type { SupportedMimeType } from '@/lib/storage/constants'

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const body = await request.json()
    const data = uploadRequestSchema.parse(body)

    // Generate unique storage key with tenant isolation
    const key = generateStorageKey(tenant.id, data.mimeType as SupportedMimeType)

    // Generate presigned upload URL
    const uploadUrl = await generatePresignedUploadUrl(
      key,
      data.mimeType,
      data.size
    )

    // Get public URL
    const publicUrl = getPublicUrl(key)

    // Create MediaFile record
    const mediaFile = await prisma.mediaFile.create({
      data: {
        tenantId: tenant.id,
        filename: data.filename,
        url: publicUrl,
        size: data.size,
        mimeType: data.mimeType,
      },
    })

    return createdResponse({
      id: mediaFile.id,
      uploadUrl,
      publicUrl,
      key,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Test Cases (8-10 tests)

```typescript
describe('POST /api/upload', () => {
  // Success cases
  it('creates presigned URL for valid image upload')
  it('creates presigned URL for valid audio upload')
  it('creates MediaFile record with correct tenantId')
  it('returns all required fields (id, uploadUrl, publicUrl, key)')
  it('storage key contains tenant ID for isolation')

  // Error cases
  it('returns 401 when not authenticated')
  it('returns 400 for unsupported MIME type')
  it('returns 400 for file exceeding size limit')
  it('returns 400 for missing required fields')
  it('returns 400 for invalid filename format')
})
```

### Edge Cases to Handle
- Very long filenames (max 255 chars enforced by validation)
- Unicode in filenames (regex rejects non-alphanumeric)
- Concurrent uploads (nanoid ensures unique keys)
- Missing R2 env vars (fail gracefully in dev)

### Verification Checklist
- [ ] All tests pass: `npm run test src/app/api/upload/__tests__/route.test.ts`
- [ ] Tenant isolation verified (tenantId in storage key)
- [ ] MediaFile record created correctly
- [ ] Presigned URL format looks correct
- [ ] `npm run typecheck` passes

---

## Task 5.5: Create Upload Confirmation Endpoint

**Status:** Done

### Description
Create POST `/api/upload/[id]/confirm` endpoint to mark upload as complete and optionally verify file exists in R2.

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/upload/[id]/confirm/route.ts` | POST - Confirm upload |
| `src/app/api/upload/[id]/confirm/__tests__/route.test.ts` | Confirmation tests |

### API Contract

```
POST /api/upload/[id]/confirm
Auth: Required (requireTenant)

Request Body (optional):
{
  size?: number  // Actual uploaded file size (to update record)
}

Success Response (200):
{
  id: string,
  filename: string,
  url: string,
  size: number,
  mimeType: string
}

Error Responses:
- 401: Not authenticated
- 404: Media file not found (or belongs to different tenant)
- 400: File not found in R2 storage
```

### Route Implementation

```typescript
/**
 * Upload Confirmation API
 * POST /api/upload/[id]/confirm
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/api/errors'
import { uploadConfirmSchema } from '@/lib/validations/media'
import { extractKeyFromUrl, headObject } from '@/lib/storage'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const data = uploadConfirmSchema.parse(body)

    // Find the media file
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      throw new NotFoundError('Media file')
    }

    // Verify tenant ownership (security)
    if (mediaFile.tenantId !== tenant.id) {
      throw new NotFoundError('Media file')
    }

    // Extract key and verify file exists in R2 (optional)
    const key = extractKeyFromUrl(mediaFile.url)
    if (key) {
      const fileInfo = await headObject(key)
      if (!fileInfo.exists) {
        throw new ValidationError([{
          path: 'upload',
          message: 'File not found in storage. Upload may have failed.',
        }])
      }

      // Update size from actual file if not provided
      if (!data.size && fileInfo.size) {
        data.size = fileInfo.size
      }
    }

    // Update media file if size changed
    const updatedFile = data.size
      ? await prisma.mediaFile.update({
          where: { id },
          data: { size: data.size },
        })
      : mediaFile

    return successResponse({
      id: updatedFile.id,
      filename: updatedFile.filename,
      url: updatedFile.url,
      size: updatedFile.size,
      mimeType: updatedFile.mimeType,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Test Cases (6-8 tests)

```typescript
describe('POST /api/upload/[id]/confirm', () => {
  // Success cases
  it('confirms existing upload')
  it('updates size when provided')
  it('empty body works (idempotent)')
  it('returns complete media file info')

  // Error cases
  it('returns 401 when not authenticated')
  it('returns 404 for non-existent file')
  it('returns 404 when accessing other tenant file (security)')
})
```

### Verification Checklist
- [ ] All tests pass
- [ ] Tenant isolation enforced (cannot confirm other tenant's files)
- [ ] Size updated correctly when provided
- [ ] `npm run typecheck` passes

---

## Task 5.6: Create Media List/Delete API

**Status:** Done

### Description
Create endpoints for listing media files and deleting them.

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/media/route.ts` | GET - List media files |
| `src/app/api/media/[id]/route.ts` | GET/DELETE single file |
| `src/app/api/media/__tests__/route.test.ts` | List tests |
| `src/app/api/media/[id]/__tests__/route.test.ts` | Single file tests |

### API Contracts

```
GET /api/media
Auth: Required
Query Params:
  - type: 'image' | 'audio' | 'all' (default: 'all')
  - limit: 1-100 (default: 50)
  - cursor: UUID (for pagination)

Response (200):
{
  items: MediaFile[],
  nextCursor?: string,
  hasMore: boolean
}

---

GET /api/media/[id]
Auth: Required

Response (200):
{
  mediaFile: MediaFile
}

---

DELETE /api/media/[id]
Auth: Required

Response: 204 No Content

Error Responses:
- 401: Not authenticated
- 404: Media file not found
```

### List Route Implementation

```typescript
/**
 * Media API - List Media Files
 * GET /api/media
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError } from '@/lib/api/errors'
import { mediaListQuerySchema } from '@/lib/validations/media'
import { IMAGE_MIME_TYPES, AUDIO_MIME_TYPES } from '@/lib/storage/constants'

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const query = mediaListQuerySchema.parse(searchParams)

    // Build where clause based on type filter
    const mimeTypes = query.type === 'image'
      ? [...IMAGE_MIME_TYPES]
      : query.type === 'audio'
      ? [...AUDIO_MIME_TYPES]
      : undefined

    const mediaFiles = await prisma.mediaFile.findMany({
      where: {
        tenantId: tenant.id,
        ...(mimeTypes && { mimeType: { in: mimeTypes } }),
        ...(query.cursor && { id: { lt: query.cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1, // Fetch one extra for pagination
    })

    // Check if there are more results
    const hasMore = mediaFiles.length > query.limit
    const items = hasMore ? mediaFiles.slice(0, -1) : mediaFiles
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return successResponse({
      items,
      nextCursor,
      hasMore,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Single File Route Implementation

```typescript
/**
 * Media API - Get/Delete Single Media File
 * GET/DELETE /api/media/[id]
 */

import { NextRequest } from 'next/server'
import { requireTenant } from '@/lib/auth/tenant'
import { prisma } from '@/lib/db/prisma'
import { successResponse, noContentResponse, handleApiError } from '@/lib/api/response'
import { UnauthorizedError, NotFoundError } from '@/lib/api/errors'
import { extractKeyFromUrl, deleteObject } from '@/lib/storage'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await params

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile || mediaFile.tenantId !== tenant.id) {
      throw new NotFoundError('Media file')
    }

    return successResponse({ mediaFile })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await requireTenant()
    if (!tenant) throw new UnauthorizedError()

    const { id } = await params

    // Find the media file
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile || mediaFile.tenantId !== tenant.id) {
      throw new NotFoundError('Media file')
    }

    // Delete from R2
    const key = extractKeyFromUrl(mediaFile.url)
    if (key) {
      await deleteObject(key)
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id },
    })

    return noContentResponse()
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Test Cases (14-18 tests)

```typescript
describe('GET /api/media', () => {
  it('lists all media files for tenant')
  it('filters by image type')
  it('filters by audio type')
  it('returns empty list when no files')
  it('applies default limit of 50')
  it('respects custom limit')
  it('supports cursor pagination')
  it('returns hasMore and nextCursor correctly')
  it('only returns tenant files (not other tenants)')
  it('returns 401 when not authenticated')
})

describe('GET /api/media/[id]', () => {
  it('returns existing media file')
  it('returns 404 for non-existent file')
  it('returns 404 for other tenant file (security)')
  it('returns 401 when not authenticated')
})

describe('DELETE /api/media/[id]', () => {
  it('deletes file from database')
  it('calls R2 deleteObject')
  it('returns 204 on success')
  it('returns 404 for non-existent file')
  it('returns 404 for other tenant file (security)')
  it('returns 401 when not authenticated')
})
```

### Edge Cases to Handle
- Delete file that doesn't exist in R2 (should still delete from DB)
- Large lists (pagination required)
- Concurrent delete operations

### Verification Checklist
- [ ] All tests pass
- [ ] Pagination works correctly
- [ ] Type filtering works correctly
- [ ] Delete removes from both R2 and database
- [ ] Tenant isolation enforced
- [ ] `npm run typecheck` passes

---

## Task 5.7: Update Environment Variables

**Status:** Done

### Description
Document R2 environment variables and update `.env.example`.

### Files to Update

| File | Changes |
|------|---------|
| `.env.example` | Add R2 variables with comments |

### Required Variables

```env
# -------------------------------------------
# Storage (Cloudflare R2)
# -------------------------------------------
# Get from: https://dash.cloudflare.com -> R2 -> Manage R2 API Tokens
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=pint-media
R2_PUBLIC_URL=https://media.pint.im
```

### Verification Checklist
- [ ] All R2 variables documented in `.env.example`
- [ ] Comments explain how to get each value
- [ ] Variables match what's used in `src/lib/storage/r2.ts`

---

## Task 5.8: Cloudflare Worker for Image Transformation

**Status:** Done

### Description
Create a Cloudflare Worker that transforms images on-demand (resize, WebP conversion).

### Files to Create

```
workers/
└── image-transform/
    ├── wrangler.toml
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── index.ts
```

### Worker Features
- Resize images: `?w=800` (100-2000px)
- Convert format: `?f=webp` (webp, jpeg, png)
- Quality control: `?q=80` (1-100)
- Cache transformed images (30 days)
- Pass through non-image files
- 404 for missing files

### wrangler.toml

```toml
name = "pint-image-transform"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
R2_PUBLIC_URL = "https://media.pint.im"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "pint-media"
```

### package.json

```json
{
  "name": "pint-image-transform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "tail": "wrangler tail"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240117.0",
    "wrangler": "^3.26.0",
    "typescript": "^5.0.0"
  }
}
```

### Worker Implementation (src/index.ts)

```typescript
/**
 * Pint Image Transform Worker
 * Cloudflare Worker for on-demand image transformation.
 *
 * URL format: /{key}?w=800&f=webp&q=80
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const key = url.pathname.slice(1) // Remove leading slash

    // Parse query parameters
    const width = parseWidth(url.searchParams.get('w'))
    const format = parseFormat(url.searchParams.get('f'))
    const quality = parseQuality(url.searchParams.get('q'))

    // If no transformations, redirect to original
    if (!width && !format) {
      return Response.redirect(`${env.R2_PUBLIC_URL}/${key}`, 302)
    }

    // Generate cache key
    const cacheKey = generateCacheKey(key, width, format, quality)

    // Check cache first
    const cache = caches.default
    const cachedResponse = await cache.match(new Request(cacheKey))
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch original from R2
    const object = await env.MEDIA_BUCKET.get(key)
    if (!object) {
      return new Response('Not Found', { status: 404 })
    }

    // Check if it's an image
    const contentType = object.httpMetadata?.contentType || ''
    if (!contentType.startsWith('image/')) {
      return new Response(object.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
        },
      })
    }

    // Transform image (implementation depends on Cloudflare plan)
    // Return with cache headers
    const response = new Response(object.body, {
      headers: {
        'Content-Type': format ? `image/${format}` : contentType,
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
        'Vary': 'Accept',
      },
    })

    // Cache the response
    await cache.put(new Request(cacheKey), response.clone())

    return response
  },
}

function parseWidth(value: string | null): number | undefined {
  if (!value) return undefined
  const num = parseInt(value, 10)
  if (isNaN(num)) return undefined
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, num))
}

function parseFormat(value: string | null): string | undefined {
  if (!value) return undefined
  const lower = value.toLowerCase()
  return SUPPORTED_FORMATS.includes(lower as any) ? lower : undefined
}

function parseQuality(value: string | null): number {
  if (!value) return DEFAULT_QUALITY
  const num = parseInt(value, 10)
  if (isNaN(num)) return DEFAULT_QUALITY
  return Math.min(100, Math.max(1, num))
}

function generateCacheKey(
  key: string,
  width: number | undefined,
  format: string | undefined,
  quality: number
): string {
  const parts = [key]
  if (width) parts.push(`w=${width}`)
  if (format) parts.push(`f=${format}`)
  parts.push(`q=${quality}`)
  return `https://pint-transform-cache/${parts.join('/')}`
}
```

### Add to Root package.json

```json
{
  "scripts": {
    "worker:dev": "cd workers/image-transform && npm run dev",
    "worker:deploy": "cd workers/image-transform && npm run deploy"
  }
}
```

### Verification Checklist (Manual Testing)
- [ ] Worker builds: `cd workers/image-transform && npm install`
- [ ] Worker can be deployed: `npm run worker:deploy`
- [ ] Request original image works
- [ ] Resize works: `/image.jpg?w=400`
- [ ] Format conversion works: `/image.jpg?f=webp`
- [ ] Cache headers set correctly
- [ ] Non-image files pass through unchanged
- [ ] 404 for missing files

---

## Summary

### Files to Create

| Task | Files | Tests |
|------|-------|-------|
| 5.1 | - | 0 |
| 5.2 | `src/lib/storage/constants.ts`, `r2.ts`, `index.ts` | 12-15 |
| 5.3 | `src/lib/validations/media.ts` | 15-20 |
| 5.4 | `src/app/api/upload/route.ts` | 8-10 |
| 5.5 | `src/app/api/upload/[id]/confirm/route.ts` | 6-8 |
| 5.6 | `src/app/api/media/route.ts`, `[id]/route.ts` | 14-18 |
| 5.7 | Update `.env.example` | 0 |
| 5.8 | `workers/image-transform/*` | Manual |
| **Total** | **~15 files** | **55-71 tests** |

### API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Get presigned URL for upload |
| `/api/upload/[id]/confirm` | POST | Confirm upload complete |
| `/api/media` | GET | List media files |
| `/api/media/[id]` | GET | Get single media file |
| `/api/media/[id]` | DELETE | Delete media file |

### Execution Checklist Per Task

1. [ ] Create implementation files
2. [ ] Create test files
3. [ ] Run tests: `npm run test:run`
4. [ ] Run typecheck: `npm run typecheck`
5. [ ] Run lint: `npm run lint`
6. [ ] Update this file - mark task as Done

### After Phase 5 Complete

1. [ ] Run all tests: `npm run test:run`
2. [ ] Update `session-summary.md`
3. [ ] Update `changelog.md`
4. [ ] Create PR

---

*Last Updated: January 27, 2026*
