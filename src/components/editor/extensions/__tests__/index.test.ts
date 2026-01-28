import { describe, it, expect } from 'vitest'
import { createEditorExtensions } from '../index'

describe('createEditorExtensions', () => {
  it('returns an array of extensions', () => {
    const extensions = createEditorExtensions()
    expect(Array.isArray(extensions)).toBe(true)
    expect(extensions.length).toBeGreaterThan(0)
  })

  it('includes StarterKit', () => {
    const extensions = createEditorExtensions()
    const extensionNames = extensions.map((ext) => ext.name)
    // StarterKit is bundled as a single extension
    expect(extensionNames).toContain('starterKit')
  })

  it('includes custom extensions', () => {
    const extensions = createEditorExtensions()
    const extensionNames = extensions.map((ext) => ext.name)
    expect(extensionNames).toContain('link')
    expect(extensionNames).toContain('heading')
    expect(extensionNames).toContain('codeBlock')
    expect(extensionNames).toContain('image')
    expect(extensionNames).toContain('youtube')
    expect(extensionNames).toContain('table')
  })

  it('includes placeholder extension', () => {
    const extensions = createEditorExtensions()
    const extensionNames = extensions.map((ext) => ext.name)
    expect(extensionNames).toContain('placeholder')
  })

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = 'Custom placeholder text'
    const extensions = createEditorExtensions({ placeholder: customPlaceholder })
    const placeholderExt = extensions.find((ext) => ext.name === 'placeholder')
    expect(placeholderExt).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((placeholderExt?.options as any).placeholder).toBe(customPlaceholder)
  })
})
