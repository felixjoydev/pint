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
  'audio/mpeg', // MP3
  'audio/wav',
  'audio/ogg',
] as const

// All supported MIME types
export const SUPPORTED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
] as const

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number]
export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number]
export type AudioMimeType = (typeof AUDIO_MIME_TYPES)[number]

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024 // 50MB

// Presigned URL expiration (in seconds)
export const PRESIGNED_URL_EXPIRY = 60 * 10 // 10 minutes

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
export function isSupportedMimeType(
  mimeType: string
): mimeType is SupportedMimeType {
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
