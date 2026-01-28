import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

export const CustomCodeBlock = CodeBlockLowlight.configure({
  lowlight,
  HTMLAttributes: {
    class: 'rounded-lg bg-[var(--secondary)] p-4 font-mono text-sm overflow-x-auto my-4',
  },
})

// Supported languages from 'common':
// - javascript, typescript
// - python
// - css, html, xml
// - json
// - bash, shell
// - c, cpp
// - java
// - ruby
// - go
// - rust
// - sql
// - markdown
// - yaml
