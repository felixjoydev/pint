// Tiptap Editor Components
// This file exports the main editor component and related utilities

// Main editor component
export { TiptapEditor } from './tiptap-editor'
export { EditorContentWrapper } from './editor-content'
export { SaveStatusIndicator } from './save-status'

// Bubble menu
export { BubbleMenu, BubbleMenuButton } from './bubble-menu'

// Dialogs
export { ImageDialog, VideoDialog } from './dialogs'

// Hooks
export { useAutoSave, useImageUpload, useWordCount } from './hooks'

// Extensions
export { createEditorExtensions } from './extensions'
export { SlashCommandExtension } from './extensions/slash-command'

// Slash commands
export { SLASH_COMMANDS, filterCommands, SlashCommandMenu } from './slash-commands'

// Utilities
export { parseVideoUrl, isVideoUrl } from './utils'

// Types
export type { EditorContentType, EditorDocument, SaveStatus } from '@/types/editor'
export type { SlashCommand } from './slash-commands'
