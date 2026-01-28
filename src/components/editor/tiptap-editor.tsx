'use client'

import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { useEditor } from '@tiptap/react'
import { cn } from '@/lib/utils/cn'
import { createEditorExtensions } from './extensions'
import { SlashCommandExtension } from './extensions/slash-command'
import { BubbleMenu } from './bubble-menu'
import { ImageDialog } from './dialogs/image-dialog'
import { VideoDialog } from './dialogs/video-dialog'
import { EditorContentWrapper } from './editor-content'
import { SaveStatusIndicator } from './save-status'
import { useAutoSave } from './hooks/use-auto-save'
import { useWordCount } from './hooks/use-word-count'
import { useEditorStore } from '@/stores/editor-store'
import type { EditorContentType } from '@/types/editor'

interface TiptapEditorProps {
  initialContent?: EditorContentType
  placeholder?: string
  className?: string
  editable?: boolean
  autoSaveDelay?: number
  onSave?: (_content: EditorContentType) => Promise<void>
  onChange?: (_content: EditorContentType) => void
}

export function TiptapEditor({
  initialContent,
  placeholder,
  className,
  editable = true,
  autoSaveDelay = 5000,
  onSave,
  onChange,
}: TiptapEditorProps) {
  const {
    setEditor,
    setContent,
    isImageDialogOpen,
    setImageDialogOpen,
    isVideoDialogOpen,
    setVideoDialogOpen,
    reset,
  } = useEditorStore()

  // Create extensions with slash commands
  const extensions = React.useMemo(
    () => [
      ...createEditorExtensions({ placeholder }),
      SlashCommandExtension,
    ],
    [placeholder]
  )

  // Initialize editor
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: 'outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      setContent(json)
      onChange?.(json)
    },
  })

  // Store editor reference
  useEffect(() => {
    setEditor(editor)
    return () => {
      setEditor(null)
      reset()
    }
  }, [editor, setEditor, reset])

  // Get content for auto-save
  const content = editor?.getJSON() ?? null

  // Auto-save hook
  const { status: saveStatus } = useAutoSave(content, {
    delay: autoSaveDelay,
    onSave,
  })

  // Word count hook
  const { wordCount, characterCount } = useWordCount(editor)

  // Handle image insertion
  const handleImageInsert = useCallback(
    (url: string, alt?: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url, alt: alt || '' }).run()
      }
    },
    [editor]
  )

  // Handle video insertion
  const handleVideoInsert = useCallback(
    (embedUrl: string) => {
      if (editor) {
        editor.chain().focus().setYoutubeVideo({ src: embedUrl }).run()
      }
    },
    [editor]
  )

  // Listen for dialog events from slash commands
  useEffect(() => {
    const handleOpenImageDialog = () => setImageDialogOpen(true)
    const handleOpenVideoDialog = () => setVideoDialogOpen(true)

    window.addEventListener('editor:open-image-dialog', handleOpenImageDialog)
    window.addEventListener('editor:open-video-dialog', handleOpenVideoDialog)

    return () => {
      window.removeEventListener('editor:open-image-dialog', handleOpenImageDialog)
      window.removeEventListener('editor:open-video-dialog', handleOpenVideoDialog)
    }
  }, [setImageDialogOpen, setVideoDialogOpen])

  if (!editor) {
    return (
      <div className={cn('animate-pulse rounded-lg bg-[var(--secondary)] h-64', className)} />
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Bubble Menu */}
      <BubbleMenu editor={editor} />

      {/* Editor Content */}
      <EditorContentWrapper editor={editor} />

      {/* Footer: Word count and save status */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
        </div>
        <SaveStatusIndicator status={saveStatus} />
      </div>

      {/* Image Dialog */}
      <ImageDialog
        open={isImageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={handleImageInsert}
      />

      {/* Video Dialog */}
      <VideoDialog
        open={isVideoDialogOpen}
        onOpenChange={setVideoDialogOpen}
        onInsert={handleVideoInsert}
      />
    </div>
  )
}
