'use client'

import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/react'

interface UseWordCountReturn {
  wordCount: number
  characterCount: number
}

/**
 * Hook to track word and character counts from a Tiptap editor.
 */
export function useWordCount(editor: Editor | null): UseWordCountReturn {
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)

  useEffect(() => {
    if (!editor) {
      setWordCount(0)
      setCharacterCount(0)
      return
    }

    const updateCounts = () => {
      const text = editor.getText()

      // Character count (excluding leading/trailing whitespace)
      const chars = text.trim().length

      // Word count
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length

      setCharacterCount(chars)
      setWordCount(words)
    }

    // Initial count
    updateCounts()

    // Update on content change
    editor.on('update', updateCounts)

    return () => {
      editor.off('update', updateCounts)
    }
  }, [editor])

  return {
    wordCount,
    characterCount,
  }
}
