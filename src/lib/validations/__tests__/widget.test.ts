import { describe, it, expect } from 'vitest'
import { updateWidgetSchema, updateWidgetOrderSchema } from '../widget'

describe('updateWidgetSchema', () => {
  it('should validate enabled toggle', () => {
    const update = { enabled: true }
    const result = updateWidgetSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should validate config object', () => {
    const update = { config: { theme: 'dark', volume: 50 } }
    const result = updateWidgetSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should reject negative displayOrder', () => {
    const update = { displayOrder: -1 }
    const result = updateWidgetSchema.safeParse(update)
    expect(result.success).toBe(false)
  })

  it('should accept zero displayOrder', () => {
    const update = { displayOrder: 0 }
    const result = updateWidgetSchema.safeParse(update)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updateWidgetSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should allow multiple fields at once', () => {
    const update = { enabled: false, config: { color: 'red' }, displayOrder: 2 }
    const result = updateWidgetSchema.safeParse(update)
    expect(result.success).toBe(true)
  })
})

describe('updateWidgetOrderSchema', () => {
  it('should validate widget order array', () => {
    const order = {
      widgets: [
        { id: '550e8400-e29b-41d4-a716-446655440000', displayOrder: 0 },
        { id: '550e8400-e29b-41d4-a716-446655440001', displayOrder: 1 },
      ],
    }
    const result = updateWidgetOrderSchema.safeParse(order)
    expect(result.success).toBe(true)
  })

  it('should reject empty widgets array', () => {
    const order = { widgets: [] }
    const result = updateWidgetOrderSchema.safeParse(order)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('At least one widget required')
    }
  })

  it('should reject invalid UUID', () => {
    const order = { widgets: [{ id: 'not-a-uuid', displayOrder: 0 }] }
    const result = updateWidgetOrderSchema.safeParse(order)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid widget ID')
    }
  })

  it('should reject negative displayOrder', () => {
    const order = {
      widgets: [
        { id: '550e8400-e29b-41d4-a716-446655440000', displayOrder: -1 },
      ],
    }
    const result = updateWidgetOrderSchema.safeParse(order)
    expect(result.success).toBe(false)
  })

  it('should accept single widget', () => {
    const order = {
      widgets: [
        { id: '550e8400-e29b-41d4-a716-446655440000', displayOrder: 0 },
      ],
    }
    const result = updateWidgetOrderSchema.safeParse(order)
    expect(result.success).toBe(true)
  })
})
