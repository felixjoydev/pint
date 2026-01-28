import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinkEditPopover } from '../link-edit-popover'

describe('LinkEditPopover', () => {
  const defaultProps = {
    isActive: false,
    currentUrl: '',
    onSetLink: vi.fn(),
    onUnsetLink: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button', () => {
    render(<LinkEditPopover {...defaultProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('opens popover on click', async () => {
    const user = userEvent.setup()
    render(<LinkEditPopover {...defaultProps} />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
    })
  })

  it('pre-fills URL when link is active', async () => {
    const user = userEvent.setup()
    render(<LinkEditPopover {...defaultProps} isActive currentUrl="https://example.com" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      const input = screen.getByPlaceholderText('https://example.com')
      expect(input).toHaveValue('https://example.com')
    })
  })

  it('calls onSetLink on submit with valid URL', async () => {
    const user = userEvent.setup()
    const onSetLink = vi.fn()
    render(<LinkEditPopover {...defaultProps} onSetLink={onSetLink} />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('https://example.com')
    await user.clear(input)
    await user.type(input, 'https://test.com')

    const submitButton = screen.getByRole('button', { name: /add link/i })
    await user.click(submitButton)

    expect(onSetLink).toHaveBeenCalledWith('https://test.com')
  })

  it('adds https:// if no protocol specified', async () => {
    const user = userEvent.setup()
    const onSetLink = vi.fn()
    render(<LinkEditPopover {...defaultProps} onSetLink={onSetLink} />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('https://example.com')
    await user.clear(input)
    await user.type(input, 'test.com')

    const submitButton = screen.getByRole('button', { name: /add link/i })
    await user.click(submitButton)

    expect(onSetLink).toHaveBeenCalledWith('https://test.com')
  })

  it('shows Update button when link is active', async () => {
    const user = userEvent.setup()
    render(<LinkEditPopover {...defaultProps} isActive currentUrl="https://example.com" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
    })
  })

  it('shows remove button when link is active', async () => {
    const user = userEvent.setup()
    render(<LinkEditPopover {...defaultProps} isActive currentUrl="https://example.com" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      // Remove button has trash icon
      const buttons = screen.getAllByRole('button')
      const removeButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'))
      expect(removeButton).toBeInTheDocument()
    })
  })

  it('calls onUnsetLink on remove', async () => {
    const user = userEvent.setup()
    const onUnsetLink = vi.fn()
    render(<LinkEditPopover {...defaultProps} isActive currentUrl="https://example.com" onUnsetLink={onUnsetLink} />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
    })

    // Find and click remove button (the one with trash icon)
    const buttons = screen.getAllByRole('button')
    const removeButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'))
    if (removeButton) {
      await user.click(removeButton)
    }

    expect(onUnsetLink).toHaveBeenCalled()
  })
})
