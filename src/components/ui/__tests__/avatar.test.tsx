import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from '../avatar'

describe('Avatar', () => {
  it('renders avatar container', () => {
    render(<Avatar data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })

  it('renders with fallback when no image', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('has default size', () => {
    render(<Avatar data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveClass('h-10', 'w-10')
  })

  it('applies custom className', () => {
    render(<Avatar className="h-16 w-16" data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveClass('h-16', 'w-16')
  })

  it('renders AvatarImage component', () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.jpg" alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )
    // Radix Avatar shows fallback initially, the image loads asynchronously
    // We verify the fallback shows correctly
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('is rounded', () => {
    render(<Avatar data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-full')
  })
})
