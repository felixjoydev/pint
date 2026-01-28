import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { createSuggestionOptions } from '../slash-commands/suggestion'
import type { SlashCommand } from '../slash-commands/commands'

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: createSuggestionOptions(),
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommand>({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
