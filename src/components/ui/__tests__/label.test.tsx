import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '../label'

describe('Label', () => {
  it('renders with children', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows required indicator when required is true', () => {
    render(<Label required>Email</Label>)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show required indicator by default', () => {
    render(<Label>Email</Label>)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('applies htmlFor attribute', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })

  it('merges custom className', () => {
    render(<Label className="custom-class">Email</Label>)
    expect(screen.getByText('Email')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toHaveClass('text-sm', 'font-medium')
  })
})
