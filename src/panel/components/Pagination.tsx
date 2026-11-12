import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** With both, shows "21–40 de 52"; otherwise "2 de 3" pages. */
  totalItems?: number
  pageSize?: number
}

/** Compact pager: "21–40 de 52  ‹ ›", aligned to the right of the list. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const hasRange = totalItems !== undefined && pageSize !== undefined
  const from = hasRange ? (page - 1) * pageSize + 1 : page
  const to = hasRange ? Math.min(page * pageSize, totalItems) : null
  const total = hasRange ? totalItems : totalPages

  return (
    <nav className="pagination" aria-label="Paginación">
      <p className="pagination-status" aria-live="polite">
        <strong>
          {from}
          {to !== null && to !== from ? `–${to}` : ''}
        </strong>{' '}
        de <strong>{total}</strong>
      </p>
      <button
        type="button"
        className="pagination-arrow"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
        title="Anterior"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="pagination-arrow"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página siguiente"
        title="Siguiente"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  )
}
