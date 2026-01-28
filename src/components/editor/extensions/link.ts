import Link from '@tiptap/extension-link'

export const CustomLink = Link.configure({
  openOnClick: false, // Disabled in edit mode, handled separately
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    class: 'text-[var(--primary)] underline underline-offset-2 hover:opacity-80 transition-opacity',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
})
