import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 3000

/** Thousands with a dot, also for 4-digit numbers ("5.500"), which `es-ES` leaves ungrouped. */
function formatThousands(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parseFigure(value: string) {
  const match = value.match(/^(\D*)([\d.]+)(.*)$/)
  if (!match) return null
  return { prefix: match[1], target: Number(match[2].replace(/\./g, '')), suffix: match[3] }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * A `<strong>` whose figure counts up from 0 the first time it scrolls into view, like the
 * counters on the current trekform.com (here slowed to 3s, linear). `value` is the final text, e.g.
 * "+250.000": anything before the digits (the "+") stays fixed while the number runs.
 * The figure is plain text inside the `<strong>` (no wrapper elements), so it keeps exactly
 * the styles the page already gives that `<strong>`.
 */
export function CountUp({ value }: { value: string }) {
  const figure = parseFigure(value)
  const ref = useRef<HTMLElement>(null)
  // null = show the final figure (also used with reduced motion).
  const [current, setCurrent] = useState<number | null>(() => (prefersReducedMotion() ? null : 0))

  useEffect(() => {
    const element = ref.current
    const target = parseFigure(value)?.target
    if (!element || target === undefined || prefersReducedMotion()) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1)
          setCurrent(progress < 1 ? Math.round(target * progress) : null)
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  if (!figure) return <strong>{value}</strong>

  return (
    <strong ref={ref}>
      {figure.prefix}
      {formatThousands(current ?? figure.target)}
      {figure.suffix}
    </strong>
  )
}
