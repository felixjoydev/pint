import { describe, it, expect } from 'vitest'
import { createPostSchema, updatePostSchema } from '../post'

describe('createPostSchema', () => {
  it('should validate a valid post', () => {
    const validPost = {
      title: 'My First Post',
      content: { type: 'doc', content: [] },
      status: 'draft',
    }
    const result = createPostSchema.safeParse(validPost)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const invalidPost = { title: '', content: {} }
    const result = createPostSchema.safeParse(invalidPost)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required')
    }
  })

  it('should reject title over 200 characters', () => {
    const invalidPost = { title: 'a'.repeat(201), content: {} }
    const result = createPostSchema.safeParse(invalidPost)
    expect(result.success).toBe(false)
  })

  it('should reject invalid slug format', () => {
    const invalidPost = { title: 'Test', slug: 'Invalid Slug!', content: {} }
    const result = createPostSchema.safeParse(invalidPost)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid slug format')
    }
  })

  it('should accept valid slug', () => {
    const validPost = { title: 'Test', slug: 'valid-slug-123', content: {} }
    const result = createPostSchema.safeParse(validPost)
    expect(result.success).toBe(true)
  })

  it('should default status to draft', () => {
    const post = { title: 'Test', content: {} }
    const result = createPostSchema.parse(post)
    expect(result.status).toBe('draft')
  })

  it('should reject invalid status', () => {
    const invalidPost = { title: 'Test', content: {}, status: 'invalid' }
    const result = createPostSchema.safeParse(invalidPost)
    expect(result.success).toBe(false)
  })

  it('should accept valid featured image URL', () => {
    const post = {
      title: 'Test',
      content: {},
      featuredImage: 'https://example.com/image.jpg',
    }
    const result = createPostSchema.safeParse(post)
    expect(result.success).toBe(true)
  })

  it('should reject invalid featured image URL', () => {
    const post = { title: 'Test', content: {}, featuredImage: 'not-a-url' }
    const result = createPostSchema.safeParse(post)
    expect(result.success).toBe(false)
  })

  it('should accept empty string for featured image', () => {
    const post = { title: 'Test', content: {}, featuredImage: '' }
    const result = createPostSchema.safeParse(post)
    expect(result.success).toBe(true)
  })

  it('should accept excerpt within limit', () => {
    const post = { title: 'Test', content: {}, excerpt: 'A short excerpt' }
    const result = createPostSchema.safeParse(post)
    expect(result.success).toBe(true)
  })

  it('should reject excerpt over 500 characters', () => {
    const post = { title: 'Test', content: {}, excerpt: 'a'.repeat(501) }
    const result = createPostSchema.safeParse(post)
    expect(result.success).toBe(false)
  })
})

describe('updatePostSchema', () => {
  it('should allow partial updates', () => {
    const update = { title: 'New Title' }
    const result = updatePostSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updatePostSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should still validate field constraints', () => {
    const update = { title: '' }
    const result = updatePostSchema.safeParse(update)
    expect(result.success).toBe(false)
  })
})
