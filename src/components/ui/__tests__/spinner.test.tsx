import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from '../spinner'

describe('Spinner', () => {
  it('renders spinner', () => {
    render(<Spinner data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('has loading aria-label', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('applies default size', () => {
    render(<Spinner data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toHaveClass('h-6', 'w-6')
  })

  it('applies sm size', () => {
    render(<Spinner size="sm" data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toHaveClass('h-4', 'w-4')
  })

  it('applies lg size', () => {
    render(<Spinner size="lg" data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toHaveClass('h-8', 'w-8')
  })

  it('applies custom className', () => {
    render(<Spinner className="custom-class" data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toHaveClass('custom-class')
  })

  it('has animate-spin class', () => {
    render(<Spinner data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toHaveClass('animate-spin')
  })
})
