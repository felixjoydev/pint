import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

describe('cn utility', () => {
  it('combines multiple class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles undefined and null values', () => {
    expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2')
  })

  it('handles conditional classes with objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })

  it('merges conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('merges conflicting padding classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('handles complex merging scenarios', () => {
    expect(cn('px-4 py-2', 'px-2')).toBe('py-2 px-2')
  })

  it('preserves non-conflicting classes', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles boolean false values in arrays', () => {
    const isActive = false
    expect(cn('base', isActive && 'active')).toBe('base')
  })
})
