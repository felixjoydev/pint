import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '../select'

describe('Select', () => {
  it('renders trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('opens on trigger click', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    fireEvent.click(screen.getByRole('combobox'))
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
  })

  it('renders options when open', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(await screen.findByRole('option', { name: /option 1/i })).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: /option 2/i })).toBeInTheDocument()
  })

  it('calls onValueChange when option selected', async () => {
    const handleChange = vi.fn()
    render(
      <Select open onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    fireEvent.click(await screen.findByRole('option', { name: /option 1/i }))
    expect(handleChange).toHaveBeenCalledWith('option1')
  })

  it('shows selected value', () => {
    render(
      <Select value="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')
  })

  it('renders groups and labels', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    expect(await screen.findByText('Group 1')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('applies custom className to trigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-class">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByRole('combobox')).toHaveClass('custom-class')
  })
})
