import { useEffect, useRef, type ReactNode } from 'react'

export interface DataTableColumn<T> {
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
}

// On narrow screens each row becomes a card (see panel.css): cells show their
// header as a label via data-label, and the actions column spans the card.
function cellClassName(className: string | undefined, header: string) {
  const classes = [className, header === 'Acciones' ? 'cell-actions' : undefined]
  return classes.filter(Boolean).join(' ') || undefined
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No hay elementos todavía.',
}: DataTableProps<T>) {
  const wrapRef = useRef<HTMLDivElement>(null)

  // The table scrolls on its own (see .list-page): start at the top when a different
  // set of rows is shown (new page, filter or search). Keyed on the row ids, not the
  // array, so editing a row in place (status, role…) doesn't jump back to the top.
  const rowsSignature = rows.map(rowKey).join('|')
  useEffect(() => {
    wrapRef.current?.scrollTo({ top: 0 })
  }, [rowsSignature])

  if (!rows.length) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <div className="table-wrap" ref={wrapRef}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={cellClassName(column.className, column.header)}
                  data-label={column.header}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
