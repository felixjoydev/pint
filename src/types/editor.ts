import type { JSONContent } from '@tiptap/react'

export type EditorContentType = JSONContent

export interface EditorDocument {
  id: string
  title: string
  content: EditorContentType
  excerpt?: string
  featuredImage?: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
}

export interface EditorSelection {
  hasSelection: boolean
  selectedText: string
  from: number
  to: number
}

export interface EditorCounts {
  wordCount: number
  characterCount: number
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
