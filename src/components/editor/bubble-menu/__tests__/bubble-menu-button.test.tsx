import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BubbleMenuButton } from '../bubble-menu-button'

describe('BubbleMenuButton', () => {
  it('renders with children', () => {
    render(<BubbleMenuButton>Test</BubbleMenuButton>)
    expect(screen.getByRole('button')).toHaveTextContent('Test')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<BubbleMenuButton onClick={handleClick}>Click me</BubbleMenuButton>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies active styles when isActive is true', () => {
    render(<BubbleMenuButton isActive>Active</BubbleMenuButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[var(--primary)]')
  })

  it('does not apply active styles when isActive is false', () => {
    render(<BubbleMenuButton isActive={false}>Inactive</BubbleMenuButton>)
    const button = screen.getByRole('button')
    expect(button).not.toHaveClass('bg-[var(--primary)]')
  })

  it('is disabled when disabled prop is true', () => {
    render(<BubbleMenuButton disabled>Disabled</BubbleMenuButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<BubbleMenuButton className="custom-class">Custom</BubbleMenuButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
