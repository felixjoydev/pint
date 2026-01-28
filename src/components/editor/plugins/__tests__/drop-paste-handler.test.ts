import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDropPasteHandler, dropPastePluginKey } from '../drop-paste-handler'

describe('createDropPasteHandler', () => {
  const mockOnImageDrop = vi.fn()
  const mockOnImagePaste = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createMockFile(type: string): File {
    return new File(['test'], 'test.jpg', { type })
  }

  function createMockView(pos: number) {
    return {
      posAtCoords: vi.fn().mockReturnValue({ pos }),
    }
  }

  function createMockDragEvent(files: File[]): DragEvent {
    return {
      dataTransfer: {
        files: files as unknown as FileList,
      },
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    } as unknown as DragEvent
  }

  function createMockClipboardEvent(items: DataTransferItem[]): ClipboardEvent {
    return {
      clipboardData: {
        items: items as unknown as DataTransferItemList,
      },
      preventDefault: vi.fn(),
    } as unknown as ClipboardEvent
  }

  it('creates a plugin with the correct key', () => {
    const plugin = createDropPasteHandler({
      onImageDrop: mockOnImageDrop,
      onImagePaste: mockOnImagePaste,
    })

    expect(plugin.spec.key).toBe(dropPastePluginKey)
  })

  it('handles image drop', () => {
    const plugin = createDropPasteHandler({
      onImageDrop: mockOnImageDrop,
      onImagePaste: mockOnImagePaste,
    })

    const file = createMockFile('image/jpeg')
    const event = createMockDragEvent([file])
    const view = createMockView(100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDrop = plugin.props.handleDrop!.bind(plugin)
    const result = handleDrop(view as any, event, null as any, false)

    expect(result).toBe(true)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(mockOnImageDrop).toHaveBeenCalledWith(file, 100)
  })

  it('ignores non-image drop', () => {
    const plugin = createDropPasteHandler({
      onImageDrop: mockOnImageDrop,
      onImagePaste: mockOnImagePaste,
    })

    const file = createMockFile('application/pdf')
    const event = createMockDragEvent([file])
    const view = createMockView(100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDrop = plugin.props.handleDrop!.bind(plugin)
    const result = handleDrop(view as any, event, null as any, false)

    expect(result).toBe(false)
    expect(mockOnImageDrop).not.toHaveBeenCalled()
  })

  it('handles image paste', () => {
    const plugin = createDropPasteHandler({
      onImageDrop: mockOnImageDrop,
      onImagePaste: mockOnImagePaste,
    })

    const file = createMockFile('image/png')
    const item = {
      kind: 'file',
      type: 'image/png',
      getAsFile: vi.fn().mockReturnValue(file),
    }
    const event = createMockClipboardEvent([item as unknown as DataTransferItem])
    const view = createMockView(0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePaste = plugin.props.handlePaste!.bind(plugin)
    const result = handlePaste(view as any, event, null as any)

    expect(result).toBe(true)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(mockOnImagePaste).toHaveBeenCalledWith(file)
  })

  it('ignores non-image paste', () => {
    const plugin = createDropPasteHandler({
      onImageDrop: mockOnImageDrop,
      onImagePaste: mockOnImagePaste,
    })

    const item = {
      kind: 'file',
      type: 'text/plain',
      getAsFile: vi.fn(),
    }
    const event = createMockClipboardEvent([item as unknown as DataTransferItem])
    const view = createMockView(0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePaste = plugin.props.handlePaste!.bind(plugin)
    const result = handlePaste(view as any, event, null as any)

    expect(result).toBe(false)
    expect(mockOnImagePaste).not.toHaveBeenCalled()
  })
})
