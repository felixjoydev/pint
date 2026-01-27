import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Badge Text</Badge>)
    expect(screen.getByText('Badge Text')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    render(<Badge data-testid="badge">Default</Badge>)
    expect(screen.getByTestId('badge')).toHaveClass('bg-[var(--primary)]')
  })

  it('applies secondary variant', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>
    )
    expect(screen.getByTestId('badge')).toHaveClass('bg-[var(--secondary)]')
  })

  it('applies destructive variant', () => {
    render(
      <Badge variant="destructive" data-testid="badge">
        Destructive
      </Badge>
    )
    expect(screen.getByTestId('badge')).toHaveClass('bg-[var(--destructive)]')
  })

  it('applies outline variant', () => {
    render(
      <Badge variant="outline" data-testid="badge">
        Outline
      </Badge>
    )
    expect(screen.getByTestId('badge')).toHaveClass('text-[var(--foreground)]')
  })

  it('applies success variant', () => {
    render(
      <Badge variant="success" data-testid="badge">
        Success
      </Badge>
    )
    expect(screen.getByTestId('badge')).toHaveClass('bg-[var(--success)]')
  })

  it('applies warning variant', () => {
    render(
      <Badge variant="warning" data-testid="badge">
        Warning
      </Badge>
    )
    expect(screen.getByTestId('badge')).toHaveClass('bg-[var(--warning)]')
  })

  it('applies custom className', () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Custom
      </Badge>
    )
    expect(screen.getByTestId('badge')).toHaveClass('custom-class')
  })
})
