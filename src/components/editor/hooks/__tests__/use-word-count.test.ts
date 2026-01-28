import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWordCount } from '../use-word-count'

describe('useWordCount', () => {
  const createMockEditor = (text: string) => {
    const listeners: Record<string, (() => void)[]> = {}

    return {
      getText: vi.fn().mockReturnValue(text),
      on: vi.fn((event: string, callback: () => void) => {
        if (!listeners[event]) listeners[event] = []
        listeners[event].push(callback)
      }),
      off: vi.fn((event: string, callback: () => void) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((cb) => cb !== callback)
        }
      }),
      emit: (event: string) => {
        listeners[event]?.forEach((cb) => cb())
      },
    }
  }

  it('returns zero counts for null editor', () => {
    const { result } = renderHook(() => useWordCount(null))

    expect(result.current.wordCount).toBe(0)
    expect(result.current.characterCount).toBe(0)
  })

  it('counts words correctly', () => {
    const mockEditor = createMockEditor('Hello world, this is a test')
    
    const { result } = renderHook(() => useWordCount(mockEditor as any))

    expect(result.current.wordCount).toBe(6)
  })

  it('counts characters correctly', () => {
    const mockEditor = createMockEditor('Hello')
    
    const { result } = renderHook(() => useWordCount(mockEditor as any))

    expect(result.current.characterCount).toBe(5)
  })

  it('handles empty content', () => {
    const mockEditor = createMockEditor('')
    
    const { result } = renderHook(() => useWordCount(mockEditor as any))

    expect(result.current.wordCount).toBe(0)
    expect(result.current.characterCount).toBe(0)
  })

  it('handles whitespace-only content', () => {
    const mockEditor = createMockEditor('   \n\t  ')
    
    const { result } = renderHook(() => useWordCount(mockEditor as any))

    expect(result.current.wordCount).toBe(0)
    expect(result.current.characterCount).toBe(0)
  })

  it('updates on content change', () => {
    const mockEditor = createMockEditor('Hello')
    
    const { result } = renderHook(() => useWordCount(mockEditor as any))

    expect(result.current.wordCount).toBe(1)

    // Simulate content change
    mockEditor.getText.mockReturnValue('Hello world')
    act(() => {
      mockEditor.emit('update')
    })

    expect(result.current.wordCount).toBe(2)
    expect(result.current.characterCount).toBe(11)
  })

  it('unsubscribes on unmount', () => {
    const mockEditor = createMockEditor('Hello')
    
    const { unmount } = renderHook(() => useWordCount(mockEditor as any))

    unmount()

    expect(mockEditor.off).toHaveBeenCalledWith('update', expect.any(Function))
  })
})
