import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

describe('Tabs', () => {
  it('renders tabs with triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole('tab', { name: /tab 1/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tab 2/i })).toBeInTheDocument()
  })

  it('shows correct content for default tab', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )
    expect(screen.getByText('Content 1')).toBeVisible()
  })

  it('renders tab content for default value', () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('data-state', 'active')
  })

  it('marks active tab', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute(
      'data-state',
      'active'
    )
  })

  it('applies custom className to trigger', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-class">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveClass('custom-class')
  })

  it('has tablist role', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
