import Heading from '@tiptap/extension-heading'

export const CustomHeading = Heading.configure({
  levels: [1, 2, 3],
  HTMLAttributes: {
    class: 'font-semibold leading-tight',
  },
})

// Heading styles are defined in editor.css for more control:
// h1: text-2xl (Heading)
// h2: text-xl (Subheading)
// h3: text-lg (Small heading)
