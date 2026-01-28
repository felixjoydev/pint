import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlashCommandMenu } from '../slash-command-menu'
import { SLASH_COMMANDS } from '../commands'

describe('SlashCommandMenu', () => {
  const mockCommands = SLASH_COMMANDS.slice(0, 3) // Use first 3 commands for testing

  it('renders command list', () => {
    render(<SlashCommandMenu commands={mockCommands} selectedIndex={0} onSelect={vi.fn()} />)

    mockCommands.forEach((command) => {
      expect(screen.getByText(command.title)).toBeInTheDocument()
    })
  })

  it('highlights selected index', () => {
    render(<SlashCommandMenu commands={mockCommands} selectedIndex={1} onSelect={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).toHaveClass('bg-[var(--accent)]')
  })

  it('does not highlight non-selected items', () => {
    render(<SlashCommandMenu commands={mockCommands} selectedIndex={0} onSelect={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).not.toHaveClass('bg-[var(--accent)]')
    expect(buttons[2]).not.toHaveClass('bg-[var(--accent)]')
  })

  it('calls onSelect when item clicked', () => {
    const onSelect = vi.fn()
    render(<SlashCommandMenu commands={mockCommands} selectedIndex={0} onSelect={onSelect} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])

    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('shows empty state for no results', () => {
    render(<SlashCommandMenu commands={[]} selectedIndex={0} onSelect={vi.fn()} />)

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('displays command descriptions', () => {
    render(<SlashCommandMenu commands={mockCommands} selectedIndex={0} onSelect={vi.fn()} />)

    mockCommands.forEach((command) => {
      expect(screen.getByText(command.description)).toBeInTheDocument()
    })
  })
})
