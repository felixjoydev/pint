import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useEditorStore } from '@/stores/editor-store'
import { VideoDialog } from '../dialogs/video-dialog'
import { SLASH_COMMANDS, filterCommands } from '../slash-commands'
import { parseVideoUrl, isVideoUrl } from '../utils'

// Note: Full Tiptap integration tests are challenging due to ProseMirror's
// DOM-dependent nature. These tests focus on component integration and
// utility function integration rather than full E2E editor interaction.
// Dialog tests with tabs are omitted as Radix UI tabs have timing issues in tests.

describe('Editor Store Integration', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  it('tracks dialog states correctly', () => {
    const { setImageDialogOpen, setVideoDialogOpen } = useEditorStore.getState()

    // Open image dialog
    setImageDialogOpen(true)
    expect(useEditorStore.getState().isImageDialogOpen).toBe(true)
    expect(useEditorStore.getState().isVideoDialogOpen).toBe(false)

    // Close image dialog
    setImageDialogOpen(false)
    expect(useEditorStore.getState().isImageDialogOpen).toBe(false)

    // Open video dialog
    setVideoDialogOpen(true)
    expect(useEditorStore.getState().isVideoDialogOpen).toBe(true)

    // Close video dialog
    setVideoDialogOpen(false)
    expect(useEditorStore.getState().isVideoDialogOpen).toBe(false)
  })

  it('resets all state correctly', () => {
    const {
      setContent,
      updateCounts,
      setImageDialogOpen,
      setSaveStatus,
    } = useEditorStore.getState()

    // Set various state - updateCounts takes an object
    setContent({ type: 'doc', content: [] })
    updateCounts({ wordCount: 100, characterCount: 500 })
    setImageDialogOpen(true)
    setSaveStatus('saving')

    // Verify state is set
    expect(useEditorStore.getState().content).not.toBeNull()
    expect(useEditorStore.getState().wordCount).toBe(100)
    expect(useEditorStore.getState().isImageDialogOpen).toBe(true)
    expect(useEditorStore.getState().saveStatus).toBe('saving')

    // Reset
    useEditorStore.getState().reset()

    // Verify state is cleared
    expect(useEditorStore.getState().content).toBeNull()
    expect(useEditorStore.getState().wordCount).toBe(0)
    expect(useEditorStore.getState().isImageDialogOpen).toBe(false)
    expect(useEditorStore.getState().saveStatus).toBe('idle')
  })

  it('tracks selection state', () => {
    const { setSelection } = useEditorStore.getState()

    setSelection(true, 'selected text')
    expect(useEditorStore.getState().hasSelection).toBe(true)
    expect(useEditorStore.getState().selectedText).toBe('selected text')

    setSelection(false, '')
    expect(useEditorStore.getState().hasSelection).toBe(false)
    expect(useEditorStore.getState().selectedText).toBe('')
  })

  it('manages save status lifecycle', () => {
    const { setSaveStatus } = useEditorStore.getState()

    expect(useEditorStore.getState().saveStatus).toBe('idle')

    setSaveStatus('saving')
    expect(useEditorStore.getState().saveStatus).toBe('saving')

    setSaveStatus('saved')
    expect(useEditorStore.getState().saveStatus).toBe('saved')

    setSaveStatus('error')
    expect(useEditorStore.getState().saveStatus).toBe('error')
  })
})

describe('Video Dialog Integration', () => {
  it('renders with empty state', () => {
    render(
      <VideoDialog
        open={true}
        onOpenChange={() => {}}
        onInsert={() => {}}
      />
    )

    expect(screen.getByText('Embed Video')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /insert video/i })).toBeDisabled()
  })

  it('shows error for invalid video URL', async () => {
    render(
      <VideoDialog
        open={true}
        onOpenChange={() => {}}
        onInsert={() => {}}
      />
    )

    const urlInput = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(urlInput, { target: { value: 'https://example.com/not-a-video' } })

    await waitFor(() => {
      expect(screen.getByText(/invalid video url/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /insert video/i })).toBeDisabled()
  })

  it('enables insert button for valid YouTube URL', async () => {
    render(
      <VideoDialog
        open={true}
        onOpenChange={() => {}}
        onInsert={() => {}}
      />
    )

    const urlInput = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(urlInput, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } })

    await waitFor(() => {
      expect(screen.getByText(/youtube video/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /insert video/i })).not.toBeDisabled()
  })
})

describe('Slash Commands Integration', () => {
  it('has at least 10 commands available', () => {
    expect(SLASH_COMMANDS.length).toBeGreaterThanOrEqual(10)
  })

  it('all commands have required properties', () => {
    SLASH_COMMANDS.forEach(command => {
      expect(command).toHaveProperty('id')
      expect(command).toHaveProperty('title')
      expect(command).toHaveProperty('description')
      expect(command).toHaveProperty('icon')
      expect(command).toHaveProperty('action')
      expect(typeof command.action).toBe('function')
    })
  })

  it('filters commands by title', () => {
    const filtered = filterCommands('head')
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every(c => c.title.toLowerCase().includes('head'))).toBe(true)
  })

  it('filters commands by keywords', () => {
    // 'ul' is a keyword for bullet list
    const filtered = filterCommands('ul')
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.some(c => c.id === 'bullet')).toBe(true)
  })

  it('filters commands by description', () => {
    const filtered = filterCommands('paragraph')
    expect(filtered.length).toBeGreaterThan(0)
  })

  it('returns empty array for no matches', () => {
    const filtered = filterCommands('xyznonexistent')
    expect(filtered).toHaveLength(0)
  })

  it('returns all commands for empty query', () => {
    const filtered = filterCommands('')
    expect(filtered.length).toBe(SLASH_COMMANDS.length)
  })
})

describe('Video URL Utils Integration', () => {
  it('parses standard YouTube watch URL', () => {
    const result = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('youtube')
    expect(result?.id).toBe('dQw4w9WgXcQ')
    // Uses youtube-nocookie.com for privacy-enhanced embedding
    expect(result?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('parses YouTube short URL', () => {
    const result = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('youtube')
    expect(result?.id).toBe('dQw4w9WgXcQ')
  })

  it('parses YouTube embed URL', () => {
    const result = parseVideoUrl('https://youtube.com/embed/dQw4w9WgXcQ')
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('youtube')
    expect(result?.id).toBe('dQw4w9WgXcQ')
  })

  it('parses Vimeo URLs', () => {
    const result = parseVideoUrl('https://vimeo.com/123456789')
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('vimeo')
    expect(result?.id).toBe('123456789')
    expect(result?.embedUrl).toBe('https://player.vimeo.com/video/123456789')
  })

  it('returns null for invalid URLs', () => {
    expect(parseVideoUrl('https://example.com')).toBeNull()
    expect(parseVideoUrl('https://google.com/video')).toBeNull()
    expect(parseVideoUrl('not-a-url')).toBeNull()
    expect(parseVideoUrl('')).toBeNull()
  })

  it('isVideoUrl returns true for valid video URLs', () => {
    expect(isVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
    expect(isVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    expect(isVideoUrl('https://vimeo.com/123456789')).toBe(true)
  })

  it('isVideoUrl returns false for non-video URLs', () => {
    expect(isVideoUrl('https://example.com')).toBe(false)
    expect(isVideoUrl('https://google.com/video')).toBe(false)
    expect(isVideoUrl('not-a-url')).toBe(false)
  })
})

describe('Editor Content Structure', () => {
  it('exports all expected components and utilities', async () => {
    const exports = await import('../index')

    // Main components
    expect(exports.TiptapEditor).toBeDefined()
    expect(exports.EditorContentWrapper).toBeDefined()
    expect(exports.SaveStatusIndicator).toBeDefined()

    // Bubble menu
    expect(exports.BubbleMenu).toBeDefined()
    expect(exports.BubbleMenuButton).toBeDefined()

    // Dialogs
    expect(exports.ImageDialog).toBeDefined()
    expect(exports.VideoDialog).toBeDefined()

    // Hooks
    expect(exports.useAutoSave).toBeDefined()
    expect(exports.useImageUpload).toBeDefined()
    expect(exports.useWordCount).toBeDefined()

    // Extensions
    expect(exports.createEditorExtensions).toBeDefined()
    expect(exports.SlashCommandExtension).toBeDefined()

    // Slash commands
    expect(exports.SLASH_COMMANDS).toBeDefined()
    expect(exports.filterCommands).toBeDefined()
    expect(exports.SlashCommandMenu).toBeDefined()

    // Utils
    expect(exports.parseVideoUrl).toBeDefined()
    expect(exports.isVideoUrl).toBeDefined()
  })

  it('exports types', async () => {
    // Verify type exports compile (runtime check not possible for types)
    const exports = await import('../index')
    expect(typeof exports).toBe('object')
  })
})
