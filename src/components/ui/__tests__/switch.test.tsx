import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from '../switch'

describe('Switch', () => {
  it('renders unchecked by default', () => {
    render(<Switch />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('renders checked when checked prop is true', () => {
    render(<Switch checked />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('handles check changes', () => {
    const handleChange = vi.fn()
    render(<Switch onCheckedChange={handleChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Switch disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('applies default size', () => {
    render(<Switch />)
    expect(screen.getByRole('switch')).toHaveClass('h-6', 'w-11')
  })

  it('applies sm size', () => {
    render(<Switch size="sm" />)
    expect(screen.getByRole('switch')).toHaveClass('h-5', 'w-9')
  })

  it('applies lg size', () => {
    render(<Switch size="lg" />)
    expect(screen.getByRole('switch')).toHaveClass('h-7', 'w-14')
  })

  it('merges custom className', () => {
    render(<Switch className="custom-class" />)
    expect(screen.getByRole('switch')).toHaveClass('custom-class')
  })
})
