import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter description" />)
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test content' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies error styles when error is true', () => {
    render(<Textarea error />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-[var(--destructive)]')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies resize-none when autoResize is true', () => {
    render(<Textarea autoResize />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-none')
  })

  it('merges custom className', () => {
    render(<Textarea className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Textarea ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('has minimum height styling', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveClass('min-h-[80px]')
  })
})
