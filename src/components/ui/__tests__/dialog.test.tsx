import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../dialog'

describe('Dialog', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument()
  })

  it('opens dialog on trigger click', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    fireEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('renders dialog title', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(await screen.findByText('Test Title')).toBeInTheDocument()
  })

  it('renders dialog description', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(await screen.findByText('Test Description')).toBeInTheDocument()
  })

  it('renders header and footer', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="footer">Footer Content</DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(await screen.findByTestId('header')).toBeInTheDocument()
    expect(await screen.findByTestId('footer')).toBeInTheDocument()
  })

  it('has close button', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(await screen.findByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('closes on close button click', async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    fireEvent.click(await screen.findByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('applies custom className to content', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="custom-class">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(await screen.findByRole('dialog')).toHaveClass('custom-class')
  })
})
