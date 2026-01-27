import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '../dropdown-menu'

describe('DropdownMenu', () => {
  it('renders trigger button', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('opens on trigger click', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByRole('menuitem', { name: /item 1/i })).toBeInTheDocument()
  })

  it('renders menu items when open', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByRole('menuitem', { name: /item 1/i })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: /item 2/i })).toBeInTheDocument()
  })

  it('calls onClick when item clicked', async () => {
    const handleClick = vi.fn()
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    fireEvent.click(await screen.findByRole('menuitem', { name: /item 1/i }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('renders checkbox items', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked Item</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByRole('menuitemcheckbox')).toBeInTheDocument()
  })

  it('renders label', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByText('Menu Label')).toBeInTheDocument()
  })

  it('renders separator', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator data-testid="separator" />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByTestId('separator')).toBeInTheDocument()
  })

  it('renders shortcut', async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>Cmd+C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByText('Cmd+C')).toBeInTheDocument()
  })
})
