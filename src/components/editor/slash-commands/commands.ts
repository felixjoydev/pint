import type { Editor } from '@tiptap/react'
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  Code2,
  Image,
  Video,
  Minus,
  Table2,
  type LucideIcon,
} from 'lucide-react'

export interface SlashCommand {
  id: string
  title: string
  description: string
  icon: LucideIcon
  keywords: string[]
  action: (_editor: Editor) => void
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'heading',
    title: 'Heading',
    description: 'Large section heading',
    icon: Heading1,
    keywords: ['h1', 'heading', 'title', 'large'],
    action: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    },
  },
  {
    id: 'subheading',
    title: 'Subheading',
    description: 'Medium section heading',
    icon: Heading2,
    keywords: ['h2', 'subheading', 'subtitle', 'medium'],
    action: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    },
  },
  {
    id: 'small-heading',
    title: 'Small heading',
    description: 'Small section heading',
    icon: Heading3,
    keywords: ['h3', 'small', 'heading'],
    action: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
  },
  {
    id: 'text',
    title: 'Text',
    description: 'Plain paragraph text',
    icon: Type,
    keywords: ['text', 'paragraph', 'body', 'p'],
    action: (editor) => {
      editor.chain().focus().setParagraph().run()
    },
  },
  {
    id: 'bullet',
    title: 'Bullet list',
    description: 'Create a bulleted list',
    icon: List,
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    action: (editor) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    id: 'numbered',
    title: 'Numbered list',
    description: 'Create a numbered list',
    icon: ListOrdered,
    keywords: ['numbered', 'list', 'ol', 'ordered'],
    action: (editor) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Add a blockquote',
    icon: Quote,
    keywords: ['quote', 'blockquote', 'callout'],
    action: (editor) => {
      editor.chain().focus().toggleBlockquote().run()
    },
  },
  {
    id: 'code',
    title: 'Code block',
    description: 'Add a code block',
    icon: Code2,
    keywords: ['code', 'codeblock', 'pre', 'snippet'],
    action: (editor) => {
      editor.chain().focus().toggleCodeBlock().run()
    },
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Upload or embed an image',
    icon: Image,
    keywords: ['image', 'picture', 'photo', 'img'],
    action: (_editor) => {
      // This will trigger the image dialog via the editor store
      // The dialog handling is done in the main editor component
      const event = new CustomEvent('editor:open-image-dialog')
      window.dispatchEvent(event)
    },
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Embed a YouTube or Vimeo video',
    icon: Video,
    keywords: ['video', 'youtube', 'vimeo', 'embed'],
    action: (_editor) => {
      // This will trigger the video dialog via the editor store
      // The dialog handling is done in the main editor component
      const event = new CustomEvent('editor:open-video-dialog')
      window.dispatchEvent(event)
    },
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Add a horizontal divider',
    icon: Minus,
    keywords: ['divider', 'hr', 'horizontal', 'rule', 'separator'],
    action: (editor) => {
      editor.chain().focus().setHorizontalRule().run()
    },
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Add a 3x3 table',
    icon: Table2,
    keywords: ['table', 'grid', 'spreadsheet'],
    action: (editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
  },
]

export function filterCommands(query: string): SlashCommand[] {
  if (!query) return SLASH_COMMANDS

  const normalizedQuery = query.toLowerCase()
  return SLASH_COMMANDS.filter(
    (command) =>
      command.title.toLowerCase().includes(normalizedQuery) ||
      command.description.toLowerCase().includes(normalizedQuery) ||
      command.keywords.some((keyword) => keyword.includes(normalizedQuery))
  )
}
