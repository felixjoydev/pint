import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { isImageMimeType } from '@/lib/storage/constants'

export const dropPastePluginKey = new PluginKey('dropPasteHandler')

interface DropPasteHandlerOptions {
  onImageDrop: (file: File, pos: number) => void
  onImagePaste: (file: File) => void
}

export function createDropPasteHandler(options: DropPasteHandlerOptions): Plugin {
  return new Plugin({
    key: dropPastePluginKey,
    props: {
      handleDrop(view: EditorView, event: DragEvent): boolean {
        if (!event.dataTransfer?.files?.length) {
          return false
        }

        const files = Array.from(event.dataTransfer.files)
        const imageFiles = files.filter((file) => isImageMimeType(file.type))

        if (imageFiles.length === 0) {
          return false
        }

        event.preventDefault()

        // Get drop position
        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })

        if (!pos) return false

        // Handle each image file
        imageFiles.forEach((file) => {
          options.onImageDrop(file, pos.pos)
        })

        return true
      },

      handlePaste(view: EditorView, event: ClipboardEvent): boolean {
        const items = event.clipboardData?.items
        if (!items) return false

        const imageItems = Array.from(items).filter(
          (item) => item.kind === 'file' && isImageMimeType(item.type)
        )

        if (imageItems.length === 0) {
          return false
        }

        event.preventDefault()

        // Handle each pasted image
        imageItems.forEach((item) => {
          const file = item.getAsFile()
          if (file) {
            options.onImagePaste(file)
          }
        })

        return true
      },
    },
  })
}
