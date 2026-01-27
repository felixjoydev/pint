/**
 * Cloudflare R2 Client
 * S3-compatible client for interacting with Cloudflare R2 storage.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'
import {
  PRESIGNED_URL_EXPIRY,
  MIME_TO_EXTENSION,
  type SupportedMimeType,
} from './constants'

// R2 Configuration helpers (read at runtime for testability)
function getR2Config() {
  return {
    endpoint: process.env.R2_ENDPOINT!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucket: process.env.R2_BUCKET!,
    publicUrl: process.env.R2_PUBLIC_URL!,
  }
}

/**
 * R2 Client Singleton (same pattern as prisma.ts)
 */
const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined
}

function createR2Client(): S3Client {
  const config = getR2Config()
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
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
  const config = getR2Config()
  const command = new PutObjectCommand({
    Bucket: config.bucket,
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
  const config = getR2Config()
  return `${config.publicUrl}/${key}`
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
    const config = getR2Config()
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
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
  const config = getR2Config()
  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })
  await r2Client.send(command)
}

/**
 * Extract the storage key from a public URL.
 */
export function extractKeyFromUrl(url: string): string | null {
  const config = getR2Config()
  const prefix = `${config.publicUrl}/`
  // Must start with exact prefix (including slash) to prevent partial domain matches
  if (!url.startsWith(prefix)) {
    return null
  }
  return url.slice(prefix.length)
}
