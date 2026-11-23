import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Horizontal row of category chips. When the chips don't fit (mobile) the row scrolls sideways —
 * by swiping, trackpad or the arrow buttons — and an arrow shows beside the row on each side
 * that still has hidden chips, so visitors know there is more to see.
 */
export function CategoryChips({
  categories,
  active,
  onSelect,
  labelFor = (category) => category,
}: {
  categories: string[]
  active: string
  onSelect: (category: string) => void
  labelFor?: (category: string) => string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateEdges = useCallback(() => {
    const list = listRef.current
    const row = list?.parentElement
    if (!list || !row) return
    // The arrows take room from the list when shown, so whether the chips fit is checked against
    // the whole row; otherwise the arrows could keep themselves visible on a row that has space.
    if (list.scrollWidth <= row.clientWidth + 1) {
      list.scrollLeft = 0
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    // 1px tolerance: scroll positions can be fractional on high-DPI screens.
    setCanScrollLeft(list.scrollLeft > 1)
    setCanScrollRight(list.scrollLeft + list.clientWidth < list.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const list = listRef.current
    const row = list?.parentElement
    if (!list || !row) return
    updateEdges()
    const observer = new ResizeObserver(updateEdges)
    observer.observe(row)
    observer.observe(list)
    return () => observer.disconnect()
  }, [updateEdges, categories])

  // Keep the selected chip in view (e.g. when it was preselected from the home's category cards).
  useEffect(() => {
    const list = listRef.current
    const chip = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!list || !chip) return
    const chipLeft = chip.offsetLeft - list.offsetLeft
    if (
      chipLeft < list.scrollLeft ||
      chipLeft + chip.offsetWidth > list.scrollLeft + list.clientWidth
    ) {
      list.scrollTo({ left: chipLeft - 16, behavior: 'smooth' })
    }
  }, [active, categories])

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current
    if (!list) return
    list.scrollBy({ left: direction * list.clientWidth * 0.7, behavior: 'smooth' })
  }

  return (
    <nav
      className={`courses-category-chips${canScrollLeft ? ' can-scroll-left' : ''}${
        canScrollRight ? ' can-scroll-right' : ''
      }`}
      aria-label="Categorías de cursos"
    >
      <div className="courses-category-chips-list" ref={listRef} onScroll={updateEdges}>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={active === item ? 'is-active' : ''}
            aria-pressed={active === item}
            onClick={() => onSelect(item)}
          >
            {labelFor(item)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="courses-category-chips-arrow is-left"
        onClick={() => scrollBy(-1)}
        aria-label="Ver categorías anteriores"
        tabIndex={canScrollLeft ? 0 : -1}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="courses-category-chips-arrow is-right"
        onClick={() => scrollBy(1)}
        aria-label="Ver más categorías"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  )
}
