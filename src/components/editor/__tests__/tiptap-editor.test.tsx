import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SaveStatusIndicator } from '../save-status'
import { EditorContentWrapper } from '../editor-content'

// Note: Full TiptapEditor tests require a complete mock of @tiptap/react
// which is complex due to the ProseMirror dependencies.
// These tests cover the simpler components that can be tested in isolation.

describe('SaveStatusIndicator', () => {
  it('renders idle state', () => {
    const { container } = render(<SaveStatusIndicator status="idle" />)
    expect(container.textContent).toContain('Saved')
  })

  it('renders saving state', () => {
    const { container } = render(<SaveStatusIndicator status="saving" />)
    expect(container.textContent).toContain('Saving...')
  })

  it('renders saved state', () => {
    const { container } = render(<SaveStatusIndicator status="saved" />)
    expect(container.textContent).toContain('Saved')
  })

  it('renders error state', () => {
    const { container } = render(<SaveStatusIndicator status="error" />)
    expect(container.textContent).toContain('Save failed')
  })

  it('applies custom className', () => {
    const { container } = render(<SaveStatusIndicator status="idle" className="custom-class" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })
})

describe('EditorContentWrapper', () => {
  it('renders with null editor', () => {
    const { container } = render(<EditorContentWrapper editor={null} />)
    expect(container.querySelector('.prose')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<EditorContentWrapper editor={null} className="custom-class" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })
})

// Export tests describe TiptapEditor's expected structure
describe('TiptapEditor module exports', () => {
  it('exports TiptapEditor component', async () => {
    const exports = await import('../index')
    expect(exports.TiptapEditor).toBeDefined()
  })

  it('exports hook functions', async () => {
    const exports = await import('../index')
    expect(exports.useAutoSave).toBeDefined()
    expect(exports.useImageUpload).toBeDefined()
    expect(exports.useWordCount).toBeDefined()
  })

  it('exports dialog components', async () => {
    const exports = await import('../index')
    expect(exports.ImageDialog).toBeDefined()
    expect(exports.VideoDialog).toBeDefined()
  })

  it('exports slash command utilities', async () => {
    const exports = await import('../index')
    expect(exports.SLASH_COMMANDS).toBeDefined()
    expect(exports.filterCommands).toBeDefined()
  })
})
