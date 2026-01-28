import { describe, it, expect } from 'vitest'
import { CustomLink } from '../link'

describe('CustomLink extension', () => {
  it('is defined', () => {
    expect(CustomLink).toBeDefined()
  })

  it('has correct name', () => {
    expect(CustomLink.name).toBe('link')
  })

  it('has autolink enabled', () => {
    // Access the extension options through the storage
    const options = CustomLink.options
    expect(options.autolink).toBe(true)
  })

  it('has linkOnPaste enabled', () => {
    const options = CustomLink.options
    expect(options.linkOnPaste).toBe(true)
  })

  it('has openOnClick disabled for edit mode', () => {
    const options = CustomLink.options
    expect(options.openOnClick).toBe(false)
  })

  it('has correct HTML attributes for styling', () => {
    const options = CustomLink.options
    expect(options.HTMLAttributes).toBeDefined()
    expect(options.HTMLAttributes.class).toContain('text-[var(--primary)]')
    expect(options.HTMLAttributes.class).toContain('underline')
    expect(options.HTMLAttributes.target).toBe('_blank')
    expect(options.HTMLAttributes.rel).toBe('noopener noreferrer')
  })
})
