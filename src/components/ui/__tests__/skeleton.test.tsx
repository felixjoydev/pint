import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders skeleton', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('has pulse animation', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse')
  })

  it('has rounded styling', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('rounded-lg')
  })

  it('applies custom className', () => {
    render(<Skeleton className="h-10 w-full" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('h-10', 'w-full')
  })

  it('accepts custom dimensions via className', () => {
    render(<Skeleton className="h-4 w-[200px]" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('h-4', 'w-[200px]')
  })
})
