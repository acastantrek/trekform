import { useEffect, useState } from 'react'
import type { MonthlyDemand } from './dashboardMetrics'

const PLOT_HEIGHT = 190
const AXIS_BAND = 28
const LEFT_AXIS = 30
const TOP_PAD = 10
const BAR_MAX = 24
const BAR_GAP = 2
const RADIUS = 4
const TOOLTIP_WIDTH = 220

const SERIES = [
  { key: 'requests', label: 'Solicitudes de contacto', color: 'var(--viz-series-1)' },
  { key: 'enrollments', label: 'Inscripciones', color: 'var(--viz-series-2)' },
] as const

/** Integer ticks for small counts: 0..max in clean steps, at most 5 lines. */
function niceTicks(max: number) {
  const top = Math.max(max, 1)
  const rawStep = top / 4
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawStep, 1)))
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? 1)
  const ceiling = Math.ceil(top / step) * step
  const ticks: number[] = []
  for (let value = 0; value <= ceiling; value += step) ticks.push(value)
  return { ticks, ceiling }
}

/** Column with a 4px rounded data end and a square base on the baseline. */
function columnPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(RADIUS, width / 2, height)
  return [
    `M${x},${y + height}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${y + height}`,
    'Z',
  ].join(' ')
}

/**
 * Tracks an element's width. A callback ref (not useRef + effect) so it keeps
 * working when the plot unmounts and remounts (e.g. after "Ver tabla").
 */
function useWidth<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return { ref: setElement, width }
}

export function DemandChart({ data }: { data: MonthlyDemand[] }) {
  const { ref, width } = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const max = Math.max(0, ...data.flatMap((month) => [month.requests, month.enrollments]))
  const { ticks, ceiling } = niceTicks(max)
  const plotWidth = Math.max(width - LEFT_AXIS, 0)
  const band = data.length ? plotWidth / data.length : 0
  const barWidth = Math.max(4, Math.min(BAR_MAX, (band * 0.62 - BAR_GAP) / 2))
  const y = (value: number) => TOP_PAD + PLOT_HEIGHT - (value / ceiling) * PLOT_HEIGHT
  const totalHeight = TOP_PAD + PLOT_HEIGHT + AXIS_BAND
  const activeMonth = active === null ? null : data[active]

  return (
    <div className="dash-chart">
      <div className="dash-chart__toolbar">
        <ul className="dash-legend" aria-label="Leyenda">
          {SERIES.map((series) => (
            <li key={series.key}>
              <span className="dash-legend__swatch" style={{ background: series.color }} />
              {series.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="dash-link-button"
          onClick={() => setShowTable((value) => !value)}
          aria-pressed={showTable}
        >
          {showTable ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </div>

      {showTable ? (
        <table className="dash-table">
          <thead>
            <tr>
              <th scope="col">Mes</th>
              {SERIES.map((series) => (
                <th scope="col" key={series.key}>
                  {series.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((month) => (
              <tr key={month.key}>
                <th scope="row">{month.longLabel}</th>
                <td>{month.requests}</td>
                <td>{month.enrollments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="dash-chart__plot" ref={ref} style={{ height: totalHeight }}>
          {width > 0 && (
            <svg
              width={width}
              height={totalHeight}
              role="img"
              aria-label={`Solicitudes e inscripciones de los últimos ${data.length} meses`}
            >
              {ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={LEFT_AXIS}
                    x2={width}
                    y1={y(tick)}
                    y2={y(tick)}
                    className={tick === 0 ? 'dash-axis' : 'dash-gridline'}
                  />
                  <text x={LEFT_AXIS - 8} y={y(tick)} dy="0.32em" textAnchor="end">
                    {tick}
                  </text>
                </g>
              ))}

              {data.map((month, index) => {
                const center = LEFT_AXIS + band * index + band / 2
                const groupWidth = barWidth * 2 + BAR_GAP
                const values = [month.requests, month.enrollments]
                return (
                  <g key={month.key}>
                    {active === index && (
                      <rect
                        className="dash-band-highlight"
                        x={center - band / 2 + 2}
                        y={TOP_PAD}
                        width={band - 4}
                        height={PLOT_HEIGHT}
                        rx={6}
                      />
                    )}
                    {values.map((value, seriesIndex) =>
                      value > 0 ? (
                        <path
                          key={SERIES[seriesIndex].key}
                          d={columnPath(
                            center - groupWidth / 2 + seriesIndex * (barWidth + BAR_GAP),
                            y(value),
                            barWidth,
                            y(0) - y(value),
                          )}
                          fill={SERIES[seriesIndex].color}
                        />
                      ) : null,
                    )}
                    <text
                      x={center}
                      y={TOP_PAD + PLOT_HEIGHT + 18}
                      textAnchor="middle"
                      className={active === index ? 'is-active' : undefined}
                    >
                      {month.label}
                    </text>
                    {/* The whole month band is the hit target, bigger than the bars. */}
                    <rect
                      className="dash-hit"
                      x={center - band / 2}
                      y={0}
                      width={band}
                      height={totalHeight}
                      tabIndex={0}
                      role="img"
                      aria-label={`${month.longLabel}: ${month.requests} solicitudes, ${month.enrollments} inscripciones`}
                      onPointerEnter={() => setActive(index)}
                      onPointerLeave={() => setActive(null)}
                      onFocus={() => setActive(index)}
                      onBlur={() => setActive(null)}
                    />
                  </g>
                )
              })}
            </svg>
          )}

          {activeMonth && active !== null && (
            <div
              className="dash-tooltip"
              // Beside the hovered month (right side, or left near the edge) so it never
              // covers the bars it describes.
              style={
                LEFT_AXIS + band * (active + 1) + TOOLTIP_WIDTH + 8 <= width
                  ? { left: LEFT_AXIS + band * (active + 1) + 4 }
                  : { left: Math.max(LEFT_AXIS + band * active - TOOLTIP_WIDTH - 4, 0) }
              }
              role="status"
            >
              <strong className="dash-tooltip__title">{activeMonth.longLabel}</strong>
              {SERIES.map((series) => (
                <div className="dash-tooltip__row" key={series.key}>
                  <span className="dash-tooltip__key" style={{ background: series.color }} />
                  <b>{activeMonth[series.key]}</b>
                  <span>{series.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
