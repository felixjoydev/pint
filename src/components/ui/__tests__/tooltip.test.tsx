import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../tooltip'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe('Tooltip', () => {
  it('renders trigger', () => {
    renderWithProvider(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('shows tooltip when open', async () => {
    renderWithProvider(
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="tooltip">Tooltip text</TooltipContent>
      </Tooltip>
    )
    expect(await screen.findByTestId('tooltip')).toBeInTheDocument()
  })

  it('applies custom className to content', async () => {
    renderWithProvider(
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className="custom-class" data-testid="tooltip">
          Tooltip text
        </TooltipContent>
      </Tooltip>
    )
    expect(await screen.findByTestId('tooltip')).toHaveClass('custom-class')
  })

  it('has correct base styling', async () => {
    renderWithProvider(
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="tooltip-content">Tooltip text</TooltipContent>
      </Tooltip>
    )
    const tooltip = await screen.findByTestId('tooltip-content')
    expect(tooltip).toHaveClass('rounded-lg', 'px-3', 'py-1.5')
  })

  it('renders with button trigger', () => {
    renderWithProvider(
      <Tooltip>
        <TooltipTrigger asChild>
          <button>Button</button>
        </TooltipTrigger>
        <TooltipContent>Tooltip</TooltipContent>
      </Tooltip>
    )
    expect(screen.getByRole('button', { name: /button/i })).toBeInTheDocument()
  })
})
