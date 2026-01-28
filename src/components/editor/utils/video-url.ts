export type VideoProvider = 'youtube' | 'vimeo'

export interface ParsedVideo {
  provider: VideoProvider
  id: string
  embedUrl: string
}

/**
 * Parse a video URL and extract provider info and embed URL.
 * Supports YouTube and Vimeo URLs.
 */
export function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url) return null

  // YouTube URL patterns
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://youtube.com/watch?v=VIDEO_ID
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return {
        provider: 'youtube',
        id: match[1],
        embedUrl: `https://www.youtube-nocookie.com/embed/${match[1]}`,
      }
    }
  }

  // Vimeo URL patterns
  // - https://vimeo.com/VIDEO_ID
  // - https://player.vimeo.com/video/VIDEO_ID
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ]

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return {
        provider: 'vimeo',
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
      }
    }
  }

  return null
}

/**
 * Check if a URL is a valid video URL.
 */
export function isVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null
}
