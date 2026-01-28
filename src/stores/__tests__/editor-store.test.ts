import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../editor-store'

describe('useEditorStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useEditorStore.getState().reset()
  })

  it('has correct initial state', () => {
    const state = useEditorStore.getState()
    expect(state.editor).toBeNull()
    expect(state.content).toBeNull()
    expect(state.hasSelection).toBe(false)
    expect(state.selectedText).toBe('')
    expect(state.wordCount).toBe(0)
    expect(state.characterCount).toBe(0)
    expect(state.isImageDialogOpen).toBe(false)
    expect(state.isVideoDialogOpen).toBe(false)
    expect(state.saveStatus).toBe('idle')
  })

  it('setEditor updates editor reference', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockEditor = { isEditable: true } as any

    useEditorStore.getState().setEditor(mockEditor)
    const state = useEditorStore.getState()
    expect(state.editor).toBe(mockEditor)
  })

  it('setContent updates content', () => {
    const content = { type: 'doc', content: [{ type: 'paragraph' }] }
    useEditorStore.getState().setContent(content)
    const state = useEditorStore.getState()
    expect(state.content).toEqual(content)
  })

  it('setSelection updates selection state', () => {
    useEditorStore.getState().setSelection(true, 'selected text')
    const state = useEditorStore.getState()
    expect(state.hasSelection).toBe(true)
    expect(state.selectedText).toBe('selected text')
  })

  it('updateCounts updates word and character counts', () => {
    useEditorStore.getState().updateCounts({ wordCount: 150, characterCount: 800 })
    const state = useEditorStore.getState()
    expect(state.wordCount).toBe(150)
    expect(state.characterCount).toBe(800)
  })

  it('setImageDialogOpen updates image dialog state', () => {
    useEditorStore.getState().setImageDialogOpen(true)
    expect(useEditorStore.getState().isImageDialogOpen).toBe(true)
    useEditorStore.getState().setImageDialogOpen(false)
    expect(useEditorStore.getState().isImageDialogOpen).toBe(false)
  })

  it('setVideoDialogOpen updates video dialog state', () => {
    useEditorStore.getState().setVideoDialogOpen(true)
    expect(useEditorStore.getState().isVideoDialogOpen).toBe(true)
    useEditorStore.getState().setVideoDialogOpen(false)
    expect(useEditorStore.getState().isVideoDialogOpen).toBe(false)
  })

  it('setSaveStatus updates save status', () => {
    useEditorStore.getState().setSaveStatus('saving')
    expect(useEditorStore.getState().saveStatus).toBe('saving')
    useEditorStore.getState().setSaveStatus('saved')
    expect(useEditorStore.getState().saveStatus).toBe('saved')
    useEditorStore.getState().setSaveStatus('error')
    expect(useEditorStore.getState().saveStatus).toBe('error')
  })

  it('reset clears all state to initial values', () => {
    // Set various state values
    useEditorStore.getState().setContent({ type: 'doc' })
    useEditorStore.getState().setSelection(true, 'text')
    useEditorStore.getState().updateCounts({ wordCount: 100, characterCount: 500 })
    useEditorStore.getState().setImageDialogOpen(true)
    useEditorStore.getState().setVideoDialogOpen(true)
    useEditorStore.getState().setSaveStatus('saved')

    // Reset
    useEditorStore.getState().reset()

    // Verify all values reset
    const state = useEditorStore.getState()
    expect(state.editor).toBeNull()
    expect(state.content).toBeNull()
    expect(state.hasSelection).toBe(false)
    expect(state.selectedText).toBe('')
    expect(state.wordCount).toBe(0)
    expect(state.characterCount).toBe(0)
    expect(state.isImageDialogOpen).toBe(false)
    expect(state.isVideoDialogOpen).toBe(false)
    expect(state.saveStatus).toBe('idle')
  })
})
