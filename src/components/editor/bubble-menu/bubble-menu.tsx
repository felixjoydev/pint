'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, Heading1, Heading2, Quote } from 'lucide-react'
import { BubbleMenuButton } from './bubble-menu-button'
import { LinkEditPopover } from './link-edit-popover'
import { cn } from '@/lib/utils/cn'

interface BubbleMenuProps {
  editor: Editor
  className?: string
}

export function BubbleMenu({ editor, className }: BubbleMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Get current link URL if link is active
  const linkUrl = editor.getAttributes('link').href || ''

  const handleSetLink = (url: string) => {
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleUnsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }

  useEffect(() => {
    if (!menuRef.current) return

    const shouldShow: BubbleMenuPluginProps['shouldShow'] = ({ editor: ed, from, to }) => {
      // Only show on text selection, not on nodes like images or code blocks
      if (from === to) return false
      if (ed.isActive('image')) return false
      if (ed.isActive('codeBlock')) return false
      if (ed.isActive('youtube')) return false
      return true
    }

    const plugin = BubbleMenuPlugin({
      pluginKey: 'bubbleMenu',
      editor,
      element: menuRef.current,
      shouldShow,
      updateDelay: 100,
    })

    editor.registerPlugin(plugin)

    return () => {
      editor.unregisterPlugin('bubbleMenu')
    }
  }, [editor])

  // Track visibility based on selection
  useEffect(() => {
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to
      const isValidNode = !editor.isActive('image') && !editor.isActive('codeBlock') && !editor.isActive('youtube')
      setIsVisible(hasSelection && isValidNode)
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('transaction', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('transaction', handleSelectionUpdate)
    }
  }, [editor])

  return (
    <div
      ref={menuRef}
      className={cn(
        'flex items-center gap-0.5 rounded-lg bg-[var(--foreground)] px-1.5 py-1 shadow-lg',
        !isVisible && 'opacity-0 pointer-events-none',
        className
      )}
    >
      {/* Bold */}
      <BubbleMenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Bold"
      >
        <Bold className="h-4 w-4" />
      </BubbleMenuButton>

      {/* Italic */}
      <BubbleMenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Italic"
      >
        <Italic className="h-4 w-4" />
      </BubbleMenuButton>

      {/* Link */}
      <LinkEditPopover
        isActive={editor.isActive('link')}
        currentUrl={linkUrl}
        onSetLink={handleSetLink}
        onUnsetLink={handleUnsetLink}
      />

      {/* Separator */}
      <div className="mx-1 h-5 w-px bg-white/20" />

      {/* Heading 1 */}
      <BubbleMenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        tooltip="Heading"
      >
        <Heading1 className="h-4 w-4" />
      </BubbleMenuButton>

      {/* Heading 2 */}
      <BubbleMenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        tooltip="Subheading"
      >
        <Heading2 className="h-4 w-4" />
      </BubbleMenuButton>

      {/* Quote */}
      <BubbleMenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip="Quote"
      >
        <Quote className="h-4 w-4" />
      </BubbleMenuButton>
    </div>
  )
}
