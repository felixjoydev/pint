import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

export const CustomTable = Table.configure({
  resizable: true,
  HTMLAttributes: {
    class: 'border-collapse w-full my-4',
  },
})

export const CustomTableRow = TableRow.configure({
  HTMLAttributes: {
    class: '',
  },
})

export const CustomTableCell = TableCell.configure({
  HTMLAttributes: {
    class: 'border border-[var(--border)] p-2',
  },
})

export const CustomTableHeader = TableHeader.configure({
  HTMLAttributes: {
    class: 'border border-[var(--border)] p-2 bg-[var(--secondary)] font-semibold text-left',
  },
})
