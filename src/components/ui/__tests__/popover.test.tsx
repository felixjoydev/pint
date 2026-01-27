import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Popover, PopoverTrigger, PopoverContent } from '../popover'

describe('Popover', () => {
  it('renders trigger button', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument()
  })

  it('opens on trigger click', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )
    fireEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(await screen.findByText('Popover Content')).toBeInTheDocument()
  })

  it('renders content when open', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Hello World</PopoverContent>
      </Popover>
    )
    expect(await screen.findByText('Hello World')).toBeInTheDocument()
  })

  it('applies custom className to content', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class">Content</PopoverContent>
      </Popover>
    )
    expect(await screen.findByText('Content')).toHaveClass('custom-class')
  })

  it('has default width', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    expect(await screen.findByText('Content')).toHaveClass('w-72')
  })
})
