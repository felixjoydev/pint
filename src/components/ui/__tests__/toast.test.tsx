import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast, ToastTitle, ToastDescription } from '../toast'
import { useToast } from '../use-toast'
import { Toaster } from '../toaster'

describe('Toast', () => {
  it('renders toast with title', () => {
    render(
      <Toast>
        <ToastTitle>Success</ToastTitle>
      </Toast>
    )
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('renders toast with description', () => {
    render(
      <Toast>
        <ToastDescription>Your action was successful</ToastDescription>
      </Toast>
    )
    expect(screen.getByText('Your action was successful')).toBeInTheDocument()
  })

  it('has default variant styling', () => {
    render(
      <Toast data-testid="toast">
        <ToastTitle>Default</ToastTitle>
      </Toast>
    )
    expect(screen.getByTestId('toast')).toHaveClass('bg-[var(--background)]')
  })

  it('has success variant styling', () => {
    render(
      <Toast variant="success" data-testid="toast">
        <ToastTitle>Success</ToastTitle>
      </Toast>
    )
    expect(screen.getByTestId('toast')).toHaveClass('bg-[var(--primary)]')
  })

  it('has error variant styling', () => {
    render(
      <Toast variant="error" data-testid="toast">
        <ToastTitle>Error</ToastTitle>
      </Toast>
    )
    expect(screen.getByTestId('toast')).toHaveClass('bg-[var(--destructive)]')
  })

  it('has warning variant styling', () => {
    render(
      <Toast variant="warning" data-testid="toast">
        <ToastTitle>Warning</ToastTitle>
      </Toast>
    )
    expect(screen.getByTestId('toast')).toHaveClass('bg-[var(--warning)]')
  })

  it('does not render when open is false', () => {
    render(
      <Toast open={false} data-testid="toast">
        <ToastTitle>Hidden</ToastTitle>
      </Toast>
    )
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
  })

  it('calls onOpenChange when close button clicked', () => {
    const handleChange = vi.fn()
    render(
      <Toast onOpenChange={handleChange}>
        <ToastTitle>Closeable</ToastTitle>
      </Toast>
    )
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('has alert role', () => {
    render(
      <Toast>
        <ToastTitle>Alert</ToastTitle>
      </Toast>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Toast className="custom-class" data-testid="toast">
        <ToastTitle>Custom</ToastTitle>
      </Toast>
    )
    expect(screen.getByTestId('toast')).toHaveClass('custom-class')
  })
})

describe('useToast', () => {
  function TestComponent() {
    const { toasts, toast: showToast, dismiss } = useToast()
    return (
      <div>
        <button onClick={() => showToast({ title: 'Test Toast' })}>Add Toast</button>
        <button onClick={() => dismiss()}>Dismiss All</button>
        <span data-testid="count">{toasts.length}</span>
      </div>
    )
  }

  it('initially has no toasts', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})

describe('Toaster', () => {
  it('renders without toasts', () => {
    render(<Toaster />)
    // Should render container but no toasts
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
