import { describe, it, expect } from 'vitest'
import { CustomCodeBlock } from '../code-block'

describe('CustomCodeBlock extension', () => {
  it('is defined', () => {
    expect(CustomCodeBlock).toBeDefined()
  })

  it('has correct name', () => {
    expect(CustomCodeBlock.name).toBe('codeBlock')
  })

  it('has lowlight for syntax highlighting', () => {
    const options = CustomCodeBlock.options
    expect(options.lowlight).toBeDefined()
  })

  it('has correct HTML attributes for styling', () => {
    const options = CustomCodeBlock.options
    expect(options.HTMLAttributes).toBeDefined()
    expect(options.HTMLAttributes.class).toContain('rounded-lg')
    expect(options.HTMLAttributes.class).toContain('bg-[var(--secondary)]')
    expect(options.HTMLAttributes.class).toContain('font-mono')
  })
})
