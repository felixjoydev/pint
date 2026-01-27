'use client'

import { useToast } from './use-toast'
import { Toast, ToastTitle, ToastDescription } from './toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, variant, open, onOpenChange }) => (
        <Toast key={id} variant={variant} open={open} onOpenChange={onOpenChange}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </div>
  )
}
