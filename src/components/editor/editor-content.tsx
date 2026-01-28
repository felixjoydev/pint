'use client'

import * as React from 'react'
import { EditorContent as TiptapEditorContent, type Editor } from '@tiptap/react'
import { cn } from '@/lib/utils/cn'

interface EditorContentWrapperProps {
  editor: Editor | null
  className?: string
}

export function EditorContentWrapper({ editor, className }: EditorContentWrapperProps) {
  return (
    <div
      className={cn(
        'prose prose-lg max-w-none',
        // Ensure editor content is styled properly
        '[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4',
        // Placeholder styling
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--muted-foreground)]',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
        "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        className
      )}
    >
      <TiptapEditorContent editor={editor} />
    </div>
  )
}
