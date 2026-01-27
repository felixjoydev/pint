import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading is true', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[var(--primary)]')
  })

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[var(--destructive)]')
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[var(--secondary)]')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-[var(--accent)]')
  })

  it('applies link variant classes', () => {
    render(<Button variant="link">Link</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-[var(--primary)]')
  })

  it('applies sm size classes', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')
  })

  it('applies lg size classes', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-12')
  })

  it('applies icon size classes', () => {
    render(<Button size="icon">Icon</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    expect(screen.getByRole('link', { name: /link button/i })).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Click me</Button>)
    expect(ref).toHaveBeenCalled()
  })
})
