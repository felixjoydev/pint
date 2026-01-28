import { create } from 'zustand'
import type { Editor } from '@tiptap/react'
import type { EditorContentType, EditorCounts, SaveStatus } from '@/types/editor'

export interface EditorState {
  // Editor instance
  editor: Editor | null
  setEditor: (_editor: Editor | null) => void

  // Content
  content: EditorContentType | null
  setContent: (_content: EditorContentType | null) => void

  // Selection state
  hasSelection: boolean
  selectedText: string
  setSelection: (_hasSelection: boolean, _selectedText: string) => void

  // Counts
  wordCount: number
  characterCount: number
  updateCounts: (_counts: EditorCounts) => void

  // Dialog states
  isImageDialogOpen: boolean
  setImageDialogOpen: (_open: boolean) => void
  isVideoDialogOpen: boolean
  setVideoDialogOpen: (_open: boolean) => void

  // Save status
  saveStatus: SaveStatus
  setSaveStatus: (_status: SaveStatus) => void

  // Reset
  reset: () => void
}

const initialState = {
  editor: null,
  content: null,
  hasSelection: false,
  selectedText: '',
  wordCount: 0,
  characterCount: 0,
  isImageDialogOpen: false,
  isVideoDialogOpen: false,
  saveStatus: 'idle' as SaveStatus,
}

export const useEditorStore = create<EditorState>()((set) => ({
  ...initialState,

  setEditor: (editor) => set({ editor }),
  setContent: (content) => set({ content }),
  setSelection: (hasSelection, selectedText) => set({ hasSelection, selectedText }),
  updateCounts: ({ wordCount, characterCount }) => set({ wordCount, characterCount }),
  setImageDialogOpen: (isImageDialogOpen) => set({ isImageDialogOpen }),
  setVideoDialogOpen: (isVideoDialogOpen) => set({ isVideoDialogOpen }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  reset: () => set(initialState),
}))
