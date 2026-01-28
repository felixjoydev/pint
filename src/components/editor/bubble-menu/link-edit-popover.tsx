'use client'

import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BubbleMenuButton } from './bubble-menu-button'
import { Link2, Trash2 } from 'lucide-react'

interface LinkEditPopoverProps {
  isActive: boolean
  currentUrl: string
  onSetLink: (url: string) => void
  onUnsetLink: () => void
}

export function LinkEditPopover({ isActive, currentUrl, onSetLink, onUnsetLink }: LinkEditPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState(currentUrl)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setUrl(currentUrl)
      // Focus input after popover opens
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open, currentUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      // Add https:// if no protocol specified
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
      onSetLink(finalUrl)
    }
    setOpen(false)
  }

  const handleRemove = () => {
    onUnsetLink()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <BubbleMenuButton isActive={isActive} tooltip="Link">
          <Link2 className="h-4 w-4" />
        </BubbleMenuButton>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" sideOffset={8}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              {isActive ? 'Update' : 'Add Link'}
            </Button>
            {isActive && (
              <Button type="button" variant="destructive" size="sm" onClick={handleRemove}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
