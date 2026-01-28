'use client'

import * as React from 'react'
import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link, Loader2 } from 'lucide-react'
import { useImageUpload } from '../hooks/use-image-upload'
import { cn } from '@/lib/utils/cn'

interface ImageDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onInsert: (_url: string, _alt?: string) => void
}

export function ImageDialog({ open, onOpenChange, onInsert }: ImageDialogProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadImage, isUploading, progress } = useImageUpload({
    onSuccess: (result) => {
      onInsert(result.url, alt || undefined)
      handleClose()
    },
    onError: (error) => {
      console.error('Upload error:', error)
    },
  })

  const handleClose = useCallback(() => {
    setUrl('')
    setAlt('')
    setTab('upload')
    onOpenChange(false)
  }, [onOpenChange])

  const handleFileSelect = useCallback(
    async (file: File) => {
      await uploadImage(file)
    },
    [uploadImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (url.trim()) {
        onInsert(url.trim(), alt || undefined)
        handleClose()
      }
    },
    [url, alt, onInsert, handleClose]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                isDragging
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)]',
                isUploading && 'pointer-events-none opacity-50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Uploading... {progress}%
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="mb-4 h-10 w-10 text-[var(--muted-foreground)]" />
                  <p className="mb-2 text-sm font-medium">
                    Drag and drop an image here
                  </p>
                  <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                    or click to select a file
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Alt text (optional)"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!url.trim()}>
                  Insert
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
