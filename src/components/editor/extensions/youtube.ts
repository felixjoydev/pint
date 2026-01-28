import Youtube from '@tiptap/extension-youtube'

export const CustomYoutube = Youtube.configure({
  inline: false,
  nocookie: true, // Use youtube-nocookie.com for privacy
  allowFullscreen: true,
  HTMLAttributes: {
    class: 'w-full aspect-video rounded-lg my-4 overflow-hidden',
  },
})

// Supports:
// - youtube.com/watch?v=VIDEO_ID
// - youtu.be/VIDEO_ID
// - youtube.com/embed/VIDEO_ID
