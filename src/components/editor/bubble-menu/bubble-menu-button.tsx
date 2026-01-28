'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface BubbleMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
}

export const BubbleMenuButton = React.forwardRef<HTMLButtonElement, BubbleMenuButtonProps>(
  ({ className, isActive, tooltip, children, disabled, ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded transition-colors',
          'text-[var(--background)] hover:bg-white/10',
          'disabled:pointer-events-none disabled:opacity-50',
          isActive && 'bg-[var(--primary)] text-white',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )

    if (tooltip) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }
)

BubbleMenuButton.displayName = 'BubbleMenuButton'
