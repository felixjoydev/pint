'use client'

import * as React from 'react'
import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseVideoUrl, type ParsedVideo } from '../utils/video-url'
import { AlertCircle, Video } from 'lucide-react'

interface VideoDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onInsert: (_embedUrl: string) => void
}

export function VideoDialog({ open, onOpenChange, onInsert }: VideoDialogProps) {
  const [url, setUrl] = useState('')
  const [parsedVideo, setParsedVideo] = useState<ParsedVideo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Parse URL on change
  useEffect(() => {
    if (!url.trim()) {
      setParsedVideo(null)
      setError(null)
      return
    }

    const result = parseVideoUrl(url)
    if (result) {
      setParsedVideo(result)
      setError(null)
    } else {
      setParsedVideo(null)
      setError('Invalid video URL. Please use a YouTube or Vimeo link.')
    }
  }, [url])

  const handleClose = useCallback(() => {
    setUrl('')
    setParsedVideo(null)
    setError(null)
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (parsedVideo) {
        onInsert(parsedVideo.embedUrl)
        handleClose()
      }
    },
    [parsedVideo, onInsert, handleClose]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={!!error}
            />
            {error && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--destructive)]">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          {/* Video Preview */}
          {parsedVideo && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--background)]">
                  <Video className="h-6 w-6 text-[var(--muted-foreground)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize">
                    {parsedVideo.provider} Video
                  </p>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    ID: {parsedVideo.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!parsedVideo}>
              Insert Video
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
