import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'

import { CustomLink } from './link'
import { CustomHeading } from './heading'
import { CustomCodeBlock } from './code-block'
import { CustomHorizontalRule } from './horizontal-rule'
import { CustomImage } from './image'
import { CustomYoutube } from './youtube'
import { CustomTable, CustomTableRow, CustomTableCell, CustomTableHeader } from './table'

export interface ExtensionOptions {
  placeholder?: string
}

export function createEditorExtensions(options: ExtensionOptions = {}) {
  const { placeholder = 'Start writing or type "/" for commands...' } = options

  return [
    StarterKit.configure({
      // Disable extensions we're replacing with custom versions
      heading: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),
    Underline,
    CustomHeading,
    CustomCodeBlock,
    CustomHorizontalRule,
    CustomLink,
    CustomImage,
    CustomYoutube,
    CustomTable,
    CustomTableRow,
    CustomTableCell,
    CustomTableHeader,
  ]
}

// Re-export individual extensions for testing
export { CustomLink } from './link'
export { CustomHeading } from './heading'
export { CustomCodeBlock } from './code-block'
export { CustomHorizontalRule } from './horizontal-rule'
export { CustomImage } from './image'
export { CustomYoutube } from './youtube'
export { CustomTable, CustomTableRow, CustomTableCell, CustomTableHeader } from './table'
