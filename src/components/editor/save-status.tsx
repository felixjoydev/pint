'use client'

import * as React from 'react'
import { Cloud, Check, Loader2, AlertCircle } from 'lucide-react'
import type { SaveStatus } from '@/types/editor'
import { cn } from '@/lib/utils/cn'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  className?: string
}

export function SaveStatusIndicator({ status, className }: SaveStatusIndicatorProps) {
  const statusConfig = {
    idle: {
      icon: Cloud,
      text: 'Saved',
      className: 'text-[var(--muted-foreground)]',
    },
    saving: {
      icon: Loader2,
      text: 'Saving...',
      className: 'text-[var(--muted-foreground)]',
      iconClassName: 'animate-spin',
    },
    saved: {
      icon: Check,
      text: 'Saved',
      className: 'text-[var(--primary)]',
    },
    error: {
      icon: AlertCircle,
      text: 'Save failed',
      className: 'text-[var(--destructive)]',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs transition-colors',
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          'h-3.5 w-3.5',
          'iconClassName' in config && config.iconClassName
        )}
      />
      <span>{config.text}</span>
    </div>
  )
}
