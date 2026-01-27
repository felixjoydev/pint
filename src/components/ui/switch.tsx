'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-[var(--muted-foreground)]/30',
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-[var(--background)] shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        default: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(switchVariants({ size, className }))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }))} />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
