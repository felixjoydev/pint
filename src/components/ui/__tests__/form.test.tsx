import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import * as React from 'react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '../form'
import { Input } from '../input'

describe('Form', () => {
  function TestForm({
    onSubmit = vi.fn(),
  }: {
    onSubmit?: (_data: { email: string }) => void
  }) {
    const form = useForm<{ email: string }>({
      defaultValues: { email: '' },
    })

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormDescription>Enter your email address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <button type="submit">Submit</button>
        </form>
      </Form>
    )
  }

  function TestFormWithError() {
    const form = useForm<{ email: string }>({
      defaultValues: { email: '' },
    })

    React.useEffect(() => {
      form.setError('email', { type: 'manual', message: 'Email is required' })
    }, [form])

    return (
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }

  it('renders form with label', () => {
    render(<TestForm />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders form with description', () => {
    render(<TestForm />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('renders form input', () => {
    render(<TestForm />)
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument()
  })

  it('shows error message when error exists', async () => {
    render(<TestFormWithError />)
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
  })

  it('label has error styling when error exists', async () => {
    render(<TestFormWithError />)
    await screen.findByText('Email is required')
    const label = screen.getByText('Email')
    expect(label).toHaveClass('text-[var(--destructive)]')
  })

  it('input has aria-invalid when error exists', async () => {
    render(<TestFormWithError />)
    await screen.findByText('Email is required')
    const input = screen.getByPlaceholderText('email@example.com')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('submits form with values', async () => {
    const handleSubmit = vi.fn()
    render(<TestForm onSubmit={handleSubmit} />)

    const input = screen.getByPlaceholderText('email@example.com')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Wait for form submission
    await vi.waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        expect.anything()
      )
    })
  })

  it('label is associated with input', () => {
    render(<TestForm />)
    const label = screen.getByText('Email')
    const input = screen.getByPlaceholderText('email@example.com')
    expect(label).toHaveAttribute('for', input.id)
  })
})
