import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutoSave } from '../use-auto-save'
import type { EditorContentType } from '@/types/editor'

describe('useAutoSave', () => {
  const mockContent: EditorContentType = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
  }

  const storageKey = 'pint-editor-draft-test-doc'

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('returns initial status as idle', () => {
    const { result } = renderHook(() => useAutoSave(null))
    expect(result.current.status).toBe('idle')
  })

  it('saves to localStorage immediately on content change', () => {
    const { rerender } = renderHook(
      ({ content }) => useAutoSave(content, { documentId: 'test-doc' }),
      { initialProps: { content: null as EditorContentType | null } }
    )

    rerender({ content: mockContent })

    const saved = localStorage.getItem(storageKey)
    expect(saved).toBe(JSON.stringify(mockContent))
  })

  it('recovers from localStorage', () => {
    localStorage.setItem(storageKey, JSON.stringify(mockContent))

    const { result } = renderHook(() => useAutoSave(null, { documentId: 'test-doc' }))

    const recovered = result.current.recoverFromLocalStorage()
    expect(recovered).toEqual(mockContent)
  })

  it('triggers debounced save on content change', async () => {
    vi.useRealTimers() // Use real timers for this test
    const onSave = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ content }) => useAutoSave(content, { documentId: 'test-doc', delay: 50, onSave }),
      { initialProps: { content: null as EditorContentType | null } }
    )

    rerender({ content: mockContent })

    // Wait for debounce to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(mockContent)
    }, { timeout: 200 })

    vi.useFakeTimers() // Restore fake timers
  })

  it('saveNow saves immediately', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)

    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { documentId: 'test-doc', delay: 5000, onSave }),
      { initialProps: { content: null as EditorContentType | null } }
    )

    rerender({ content: mockContent })

    await act(async () => {
      await result.current.saveNow()
    })

    expect(onSave).toHaveBeenCalledWith(mockContent)
  })

  it('skips save if content unchanged', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)

    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { documentId: 'test-doc', delay: 1000, onSave }),
      { initialProps: { content: mockContent } }
    )

    // Trigger save to set lastSavedContent
    await act(async () => {
      await result.current.saveNow()
    })

    expect(onSave).toHaveBeenCalledTimes(1)

    // Rerender with same content
    rerender({ content: mockContent })

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Should not trigger another save
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('sets error status on save failure', async () => {
    vi.useRealTimers() // Use real timers for this test
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))

    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { documentId: 'test-doc', delay: 50, onSave }),
      { initialProps: { content: null as EditorContentType | null } }
    )

    rerender({ content: mockContent })

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    }, { timeout: 200 })

    vi.useFakeTimers() // Restore fake timers
  })

  it('clears localStorage', () => {
    localStorage.setItem(storageKey, JSON.stringify(mockContent))

    const { result } = renderHook(() => useAutoSave(null, { documentId: 'test-doc' }))

    result.current.clearLocalStorage()

    expect(localStorage.getItem(storageKey)).toBeNull()
  })
})
