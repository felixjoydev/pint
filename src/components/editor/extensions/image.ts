import Image from '@tiptap/extension-image'

export const CustomImage = Image.configure({
  inline: false, // Block-level
  allowBase64: true, // Allow pasted images
  HTMLAttributes: {
    class: 'max-w-full rounded-lg my-4 mx-auto',
  },
})

// Image attributes:
// - src: Image URL
// - alt: Alt text for accessibility
// - title: Optional caption
