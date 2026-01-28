import { describe, it, expect } from 'vitest'
import {
  jsonContentSchema,
  editorContentSchema,
  postContentSchema,
  editorSaveSchema,
} from '../editor'

describe('jsonContentSchema', () => {
  it('validates simple paragraph content', () => {
    const content = {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello world' }
      ]
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })

  it('validates document with nested content', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'world', marks: [{ type: 'bold' }] }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            { type: 'text', text: 'Title' }
          ]
        }
      ]
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })

  it('validates content with marks (formatting)', () => {
    const content = {
      type: 'text',
      text: 'formatted text',
      marks: [
        { type: 'bold' },
        { type: 'italic' },
        { type: 'link', attrs: { href: 'https://example.com' } }
      ]
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })

  it('validates content with attributes', () => {
    const content = {
      type: 'image',
      attrs: {
        src: 'https://example.com/image.jpg',
        alt: 'Example image',
        title: 'Image title'
      }
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })

  it('rejects invalid structure (missing type)', () => {
    const content = {
      content: [{ type: 'text', text: 'Hello' }]
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(false)
  })

  it('validates empty content array', () => {
    const content = {
      type: 'doc',
      content: []
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })

  it('validates deeply nested content', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'List item' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    const result = jsonContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })
})

describe('editorContentSchema', () => {
  it('is equivalent to jsonContentSchema', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }
      ]
    }

    const result = editorContentSchema.safeParse(content)
    expect(result.success).toBe(true)
  })
})

describe('postContentSchema', () => {
  it('validates complete post content', () => {
    const post = {
      title: 'My Post Title',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Content' }] }
        ]
      },
      excerpt: 'A short excerpt',
      featuredImage: 'https://example.com/image.jpg'
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(true)
  })

  it('validates post without optional fields', () => {
    const post = {
      title: 'My Post Title',
      content: {
        type: 'doc',
        content: []
      }
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const post = {
      title: '',
      content: { type: 'doc', content: [] }
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Title is required')
    }
  })

  it('rejects title over 200 characters', () => {
    const post = {
      title: 'a'.repeat(201),
      content: { type: 'doc', content: [] }
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Title too long')
    }
  })

  it('rejects excerpt over 500 characters', () => {
    const post = {
      title: 'Valid Title',
      content: { type: 'doc', content: [] },
      excerpt: 'a'.repeat(501)
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(false)
  })

  it('allows empty string for featuredImage', () => {
    const post = {
      title: 'Valid Title',
      content: { type: 'doc', content: [] },
      featuredImage: ''
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL for featuredImage', () => {
    const post = {
      title: 'Valid Title',
      content: { type: 'doc', content: [] },
      featuredImage: 'not-a-url'
    }

    const result = postContentSchema.safeParse(post)
    expect(result.success).toBe(false)
  })
})

describe('editorSaveSchema', () => {
  it('validates save payload with counts', () => {
    const payload = {
      content: { type: 'doc', content: [] },
      wordCount: 150,
      characterCount: 750
    }

    const result = editorSaveSchema.safeParse(payload)
    expect(result.success).toBe(true)
  })

  it('validates save payload without counts', () => {
    const payload = {
      content: { type: 'doc', content: [] }
    }

    const result = editorSaveSchema.safeParse(payload)
    expect(result.success).toBe(true)
  })

  it('rejects negative word count', () => {
    const payload = {
      content: { type: 'doc', content: [] },
      wordCount: -1
    }

    const result = editorSaveSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})
