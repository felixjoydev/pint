import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageUpload } from '../use-image-upload'

describe('useImageUpload', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  function createMockFile(type: string, size: number): File {
    const buffer = new ArrayBuffer(size)
    const blob = new Blob([buffer], { type })
    return new File([blob], 'test.jpg', { type })
  }

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useImageUpload())

    expect(result.current.isUploading).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(typeof result.current.uploadImage).toBe('function')
    expect(typeof result.current.validateFile).toBe('function')
  })

  it('rejects unsupported file types', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useImageUpload({ onError }))

    const file = createMockFile('application/pdf', 1024)

    await act(async () => {
      await result.current.uploadImage(file)
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Unsupported file type'),
      })
    )
  })

  it('rejects files over 10MB', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useImageUpload({ onError }))

    const file = createMockFile('image/jpeg', 11 * 1024 * 1024) // 11MB

    await act(async () => {
      await result.current.uploadImage(file)
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('File too large'),
      })
    )
  })

  it('uploads image successfully', async () => {
    const onSuccess = vi.fn()
    const mockPublicUrl = 'https://cdn.example.com/image.jpg'

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'file-123',
          uploadUrl: 'https://r2.example.com/upload',
          publicUrl: mockPublicUrl,
        }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() => useImageUpload({ onSuccess }))

    const file = createMockFile('image/jpeg', 1024)

    await act(async () => {
      await result.current.uploadImage(file)
    })

    expect(onSuccess).toHaveBeenCalledWith({
      url: mockPublicUrl,
      id: 'file-123',
    })
  })

  it('shows loading state during upload', async () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100))
    )

    const { result } = renderHook(() => useImageUpload())
    const file = createMockFile('image/jpeg', 1024)

    act(() => {
      result.current.uploadImage(file)
    })

    expect(result.current.isUploading).toBe(true)
  })

  it('handles upload errors', async () => {
    const onError = vi.fn()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    })

    const { result } = renderHook(() => useImageUpload({ onError }))
    const file = createMockFile('image/jpeg', 1024)

    await act(async () => {
      await result.current.uploadImage(file)
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Failed to get upload URL'),
      })
    )
  })

  it('validateFile returns null for valid files', () => {
    const { result } = renderHook(() => useImageUpload())

    const validFile = createMockFile('image/jpeg', 1024)
    expect(result.current.validateFile(validFile)).toBeNull()

    const pngFile = createMockFile('image/png', 1024)
    expect(result.current.validateFile(pngFile)).toBeNull()

    const gifFile = createMockFile('image/gif', 1024)
    expect(result.current.validateFile(gifFile)).toBeNull()

    const webpFile = createMockFile('image/webp', 1024)
    expect(result.current.validateFile(webpFile)).toBeNull()
  })

  it('validateFile returns error for invalid files', () => {
    const { result } = renderHook(() => useImageUpload())

    const invalidType = createMockFile('application/pdf', 1024)
    expect(result.current.validateFile(invalidType)).toBeInstanceOf(Error)

    const tooLarge = createMockFile('image/jpeg', 11 * 1024 * 1024)
    expect(result.current.validateFile(tooLarge)).toBeInstanceOf(Error)
  })
})
