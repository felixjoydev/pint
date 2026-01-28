'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import type { SlashCommand } from './commands'

interface SlashCommandMenuProps {
  commands: SlashCommand[]
  selectedIndex: number
  onSelect: (_index: number) => void
}

export function SlashCommandMenu({ commands, selectedIndex, onSelect }: SlashCommandMenuProps) {
  if (commands.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 shadow-lg">
        <p className="text-sm text-[var(--muted-foreground)]">No results found</p>
      </div>
    )
  }

  return (
    <div className="max-h-80 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] py-1 shadow-lg">
      {commands.map((command, index) => {
        const Icon = command.icon
        const isSelected = index === selectedIndex

        return (
          <button
            key={command.id}
            type="button"
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
              isSelected && 'bg-[var(--accent)]',
              !isSelected && 'hover:bg-[var(--accent)]'
            )}
            onClick={() => onSelect(index)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)]">
              <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{command.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{command.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
