import { describe, it, expect } from 'vitest'
import { createPageSchema, updatePageSchema } from '../page'

describe('createPageSchema', () => {
  it('should validate a valid page', () => {
    const validPage = {
      title: 'About',
      content: { type: 'doc', content: [] },
    }
    const result = createPageSchema.safeParse(validPage)
    expect(result.success).toBe(true)
  })

  it('should default showInNav to true', () => {
    const page = { title: 'Test', content: {} }
    const result = createPageSchema.parse(page)
    expect(result.showInNav).toBe(true)
  })

  it('should default status to draft', () => {
    const page = { title: 'Test', content: {} }
    const result = createPageSchema.parse(page)
    expect(result.status).toBe('draft')
  })

  it('should reject negative navOrder', () => {
    const page = { title: 'Test', content: {}, navOrder: -1 }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(false)
  })

  it('should accept valid navOrder', () => {
    const page = { title: 'Test', content: {}, navOrder: 5 }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(true)
  })

  it('should accept zero navOrder', () => {
    const page = { title: 'Test', content: {}, navOrder: 0 }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const page = { title: '', content: {} }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(false)
  })

  it('should reject title over 200 characters', () => {
    const page = { title: 'a'.repeat(201), content: {} }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(false)
  })

  it('should accept valid slug', () => {
    const page = { title: 'Test', content: {}, slug: 'about-us' }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(true)
  })

  it('should reject invalid slug format', () => {
    const page = { title: 'Test', content: {}, slug: 'About Us' }
    const result = createPageSchema.safeParse(page)
    expect(result.success).toBe(false)
  })
})

describe('updatePageSchema', () => {
  it('should allow updating only showInNav', () => {
    const update = { showInNav: false }
    const result = updatePageSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow updating only navOrder', () => {
    const update = { navOrder: 3 }
    const result = updatePageSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updatePageSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
