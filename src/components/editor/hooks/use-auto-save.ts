'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { SaveStatus, EditorContentType } from '@/types/editor'

interface UseAutoSaveOptions {
  documentId?: string
  delay?: number
  onSave?: (content: EditorContentType) => Promise<void>
}

interface UseAutoSaveReturn {
  status: SaveStatus
  saveNow: () => Promise<void>
  recoverFromLocalStorage: () => EditorContentType | null
  clearLocalStorage: () => void
}

const LOCAL_STORAGE_PREFIX = 'pint-editor-draft-'

export function useAutoSave(
  content: EditorContentType | null,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const { documentId = 'default', delay = 5000, onSave } = options

  const [status, setStatus] = useState<SaveStatus>('idle')
  const lastSavedContentRef = useRef<string | null>(null)
  const storageKey = `${LOCAL_STORAGE_PREFIX}${documentId}`

  // Get content as string for comparison
  const contentString = content ? JSON.stringify(content) : null

  // Save to localStorage immediately
  const saveToLocalStorage = useCallback(
    (content: EditorContentType | null) => {
      if (content && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(content))
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }
      }
    },
    [storageKey]
  )

  // Save to server
  const saveToServer = useCallback(
    async (content: EditorContentType) => {
      if (!onSave) return

      setStatus('saving')
      try {
        await onSave(content)
        setStatus('saved')
        lastSavedContentRef.current = JSON.stringify(content)

        // Clear saved status after 2 seconds
        setTimeout(() => {
          setStatus((prev) => (prev === 'saved' ? 'idle' : prev))
        }, 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setStatus('error')
      }
    },
    [onSave]
  )

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    (content: EditorContentType) => {
      saveToServer(content)
    },
    delay
  )

  // Save now (immediate)
  const saveNow = useCallback(async () => {
    if (content) {
      debouncedSave.cancel()
      await saveToServer(content)
    }
  }, [content, debouncedSave, saveToServer])

  // Recover from localStorage
  const recoverFromLocalStorage = useCallback((): EditorContentType | null => {
    if (typeof window === 'undefined') return null

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved) as EditorContentType
      }
    } catch (error) {
      console.error('Failed to recover from localStorage:', error)
    }
    return null
  }, [storageKey])

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // Effect: Save to localStorage immediately on content change
  useEffect(() => {
    if (content) {
      saveToLocalStorage(content)
    }
  }, [content, saveToLocalStorage])

  // Effect: Trigger debounced save when content changes
  useEffect(() => {
    // Skip if content is null or hasn't changed
    if (!contentString || contentString === lastSavedContentRef.current) {
      return
    }

    if (content) {
      debouncedSave(content)
    }
  }, [contentString, content, debouncedSave])

  return {
    status,
    saveNow,
    recoverFromLocalStorage,
    clearLocalStorage,
  }
}
