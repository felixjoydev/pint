import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card', () => {
  it('renders card with children', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders card header', () => {
    render(
      <Card>
        <CardHeader data-testid="header">Header Content</CardHeader>
      </Card>
    )
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders card title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders card description', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card Description')).toBeInTheDocument()
  })

  it('renders card content', () => {
    render(
      <Card>
        <CardContent data-testid="content">Main Content</CardContent>
      </Card>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('renders card footer', () => {
    render(
      <Card>
        <CardFooter data-testid="footer">Footer Content</CardFooter>
      </Card>
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('custom-class')
  })
})
