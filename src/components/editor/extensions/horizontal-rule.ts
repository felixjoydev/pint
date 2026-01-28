import HorizontalRule from '@tiptap/extension-horizontal-rule'

export const CustomHorizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: 'border-t border-[var(--border)] my-8',
  },
})
