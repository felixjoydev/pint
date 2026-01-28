'use client'

import { useState, useCallback } from 'react'
import { IMAGE_MIME_TYPES, MAX_IMAGE_SIZE, isImageMimeType } from '@/lib/storage/constants'

interface UploadResult {
  url: string
  id: string
}

interface UseImageUploadOptions {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: Error) => void
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateFile = useCallback((file: File): Error | null => {
    // Check file type
    if (!isImageMimeType(file.type)) {
      return new Error(
        `Unsupported file type: ${file.type}. Supported types: ${IMAGE_MIME_TYPES.join(', ')}`
      )
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      return new Error(
        `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
      )
    }

    return null
  }, [])

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        options.onError?.(validationError)
        return null
      }

      setIsUploading(true)
      setProgress(0)

      try {
        // Step 1: Request presigned URL from our API
        const presignResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        })

        if (!presignResponse.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { id, uploadUrl, publicUrl } = await presignResponse.json()
        setProgress(25)

        // Step 2: Upload directly to R2 using presigned URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }
        setProgress(75)

        // Step 3: Confirm upload
        const confirmResponse = await fetch(`/api/upload/${id}/confirm`, {
          method: 'POST',
        })

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm upload')
        }
        setProgress(100)

        const result = { url: publicUrl, id }
        options.onSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Upload failed')
        options.onError?.(err)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [validateFile, options]
  )

  return {
    uploadImage,
    isUploading,
    progress,
    validateFile,
  }
}
