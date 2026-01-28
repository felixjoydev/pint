'use client'

import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import type { SuggestionOptions, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { Editor } from '@tiptap/react'
import { SlashCommandMenu } from './slash-command-menu'
import { filterCommands, type SlashCommand } from './commands'

class SlashCommandMenuRenderer {
  component: ReactRenderer | null = null
  popup: TippyInstance[] | null = null
  selectedIndex = 0
  commands: SlashCommand[] = []
  editor: Editor | null = null
  currentProps: SuggestionProps<SlashCommand> | null = null

  constructor() {
    this.updateProps = this.updateProps.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  updateProps(props: SuggestionProps<SlashCommand>) {
    this.commands = props.items
    this.editor = props.editor
    this.currentProps = props

    if (this.component) {
      this.component.updateProps({
        commands: this.commands,
        selectedIndex: this.selectedIndex,
        onSelect: (index: number) => {
          this.selectItem(index)
        },
      })
    }
  }

  selectItem(index: number) {
    const command = this.commands[index]
    if (command && this.currentProps?.command) {
      this.currentProps.command(command)
    }
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (this.commands.length === 0) return false

    if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.commands.length) % this.commands.length
      if (this.currentProps) this.updateProps(this.currentProps)
      return true
    }

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.commands.length
      if (this.currentProps) this.updateProps(this.currentProps)
      return true
    }

    if (event.key === 'Enter') {
      this.selectItem(this.selectedIndex)
      return true
    }

    if (event.key === 'Escape') {
      this.popup?.[0]?.hide()
      return true
    }

    return false
  }

  onStart(props: SuggestionProps<SlashCommand>) {
    this.selectedIndex = 0
    this.commands = props.items
    this.editor = props.editor
    this.currentProps = props

    this.component = new ReactRenderer(SlashCommandMenu, {
      props: {
        commands: this.commands,
        selectedIndex: this.selectedIndex,
        onSelect: (index: number) => {
          this.selectItem(index)
        },
      },
      editor: props.editor,
    })

    if (!props.clientRect) return

    this.popup = tippy('body', {
      getReferenceClientRect: props.clientRect as () => DOMRect,
      appendTo: () => document.body,
      content: this.component.element,
      showOnCreate: true,
      interactive: true,
      trigger: 'manual',
      placement: 'bottom-start',
      offset: [0, 8],
    })
  }

  onUpdate(props: SuggestionProps<SlashCommand>) {
    this.updateProps(props)

    if (!props.clientRect) return

    this.popup?.[0]?.setProps({
      getReferenceClientRect: props.clientRect as () => DOMRect,
    })
  }

  onKeyDown(props: SuggestionKeyDownProps): boolean {
    return this.handleKeyDown(props.event)
  }

  onExit() {
    this.popup?.[0]?.destroy()
    this.component?.destroy()
    this.popup = null
    this.component = null
    this.currentProps = null
  }
}

export function createSuggestionOptions(): Omit<SuggestionOptions<SlashCommand>, 'editor'> {
  let renderer: SlashCommandMenuRenderer | null = null

  return {
    char: '/',
    items: ({ query }) => filterCommands(query),
    command: ({ editor, range, props }) => {
      // Delete the "/" and any query text
      editor.chain().focus().deleteRange(range).run()
      // Execute the command
      props.action(editor)
    },
    render: () => {
      renderer = new SlashCommandMenuRenderer()

      return {
        onStart: (props) => renderer?.onStart(props),
        onUpdate: (props) => renderer?.onUpdate(props),
        onKeyDown: (props) => renderer?.onKeyDown(props) ?? false,
        onExit: () => renderer?.onExit(),
      }
    },
  }
}
