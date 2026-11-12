import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Euro,
  Inbox,
  Info,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Plus,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../../styles/panel-dashboard.css'
import { useAuth } from '../../contexts/useAuth'
import {
  loadDashboardData,
  resolveContactRequest,
  type DashboardContactRequest,
  type DashboardData,
} from '../../services/dashboard'
import { DemandChart } from './DemandChart'
import {
  computeDashboardMetrics,
  DEMAND_MONTHS,
  RECENT_DAYS,
  UPCOMING_DAYS,
  type AttentionItem,
  type UpcomingSession,
} from './dashboardMetrics'

const money = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const longDate = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const dayNumber = new Intl.DateTimeFormat('es-ES', { day: '2-digit' })
const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const timeShort = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' })
const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 14) return 'Buenos días'
  if (hour < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

function timeAgo(value: string, now: Date) {
  const minutes = Math.round((new Date(value).getTime() - now.getTime()) / 60000)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return relative.format(days, 'day')
  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) return relative.format(months, 'month')
  return relative.format(Math.round(months / 12), 'year')
}

/** "hoy a las 08:00", "mañana a las 08:00" or "en 12 días", by calendar day. */
function whenLabel(startsAt: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(startsAt)
  day.setHours(0, 0, 0, 0)
  const days = Math.round((day.getTime() - today.getTime()) / 86400000)
  if (days <= 0) return `hoy a las ${timeShort.format(startsAt)}`
  if (days === 1) return `mañana a las ${timeShort.format(startsAt)}`
  return `en ${days} días`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function DashboardPage() {
  const { profile } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [now] = useState(() => new Date())

  const load = useCallback(() => {
    loadDashboardData()
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar el panel.'),
      )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const metrics = useMemo(() => (data ? computeDashboardMetrics(data, now) : null), [data, now])

  const handleResolve = async (request: DashboardContactRequest) => {
    setResolvingId(request.id)
    setActionError(null)
    try {
      await resolveContactRequest(request.id)
      setData((current) =>
        current
          ? {
              ...current,
              contactRequests: current.contactRequests.map((item) =>
                item.id === request.id ? { ...item, status: 'resolved' } : item,
              ),
            }
          : current,
      )
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo actualizar.')
    } finally {
      setResolvingId(null)
    }
  }

  // Skip usernames/emails stored as first name (e.g. "user23") in the greeting.
  const rawFirstName = profile?.firstName?.trim()
  const firstName = rawFirstName && !/[\d@_]/.test(rawFirstName) ? rawFirstName : null

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <p className="dash-eyebrow">{longDate.format(now)}</p>
          <h1>
            {greeting(now)}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="dash-subtitle">Esto es lo que está pasando en Trekform.</p>
        </div>
        <nav className="dash-quick" aria-label="Accesos rápidos">
          <Link className="btn btn-primary" to="/panel/convocatorias">
            <Plus size={16} /> Convocatoria
          </Link>
          <Link className="btn btn-secondary" to="/panel/cursos/nuevo">
            <Plus size={16} /> Curso
          </Link>
          <Link className="btn btn-secondary" to="/panel/blog/nuevo">
            <Plus size={16} /> Artículo
          </Link>
        </nav>
      </header>

      {error && (
        <div className="alert alert-error dash-error">
          <span>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {!metrics && !error && <DashboardSkeleton />}

      {metrics && data && (
        <>
          <section className="dash-kpis" aria-label="Indicadores principales">
            <KpiTile
              icon={<Euro size={18} />}
              label="Ingresos cobrados"
              value={money.format(metrics.revenueCents / 100)}
              detail={`${money.format(metrics.recentRevenueCents / 100)} en los últimos ${RECENT_DAYS} días`}
            />
            <KpiTile
              icon={<Users size={18} />}
              label="Inscripciones"
              value={String(metrics.enrollmentsActive)}
              detail={`${metrics.recentEnrollments} en los últimos ${RECENT_DAYS} días · ${metrics.studentCount} alumnos`}
              to="/panel/inscripciones"
            />
            <KpiTile
              icon={<Inbox size={18} />}
              label="Solicitudes por atender"
              value={String(metrics.openRequests)}
              detail={`de ${metrics.totalRequests} recibidas en total`}
              tone={metrics.openRequests > 0 ? 'warning' : 'default'}
              to="#solicitudes"
            />
            <KpiTile
              icon={<CalendarDays size={18} />}
              label="Próximas convocatorias"
              value={String(metrics.upcomingSessions.length)}
              detail={
                metrics.upcomingSeats > 0
                  ? `${metrics.upcomingEnrolled} de ${metrics.upcomingSeats} plazas ocupadas · próximos ${UPCOMING_DAYS} días`
                  : `en los próximos ${UPCOMING_DAYS} días`
              }
              to="/panel/convocatorias"
            />
          </section>

          <AttentionPanel items={metrics.attention} />

          {/* Two independent columns so cards never leave gaps; on narrow screens
              they interleave by importance (see .dash-order-* in the CSS). */}
          <div className="dash-columns">
            <div className="dash-col">
              <section className="dash-card dash-order-1" aria-labelledby="dash-demand-title">
                <header className="dash-card__header">
                  <div>
                    <h2 id="dash-demand-title">Demanda por mes</h2>
                    <p>
                      Solicitudes de contacto e inscripciones de los últimos {DEMAND_MONTHS} meses.
                    </p>
                  </div>
                </header>
                <DemandChart data={metrics.demand} />
              </section>

              <section className="dash-card dash-order-3" aria-labelledby="dash-upcoming-title">
                <header className="dash-card__header">
                  <div>
                    <h2 id="dash-upcoming-title">Próximas convocatorias</h2>
                    <p>Ocupación de las que empiezan en los próximos {UPCOMING_DAYS} días.</p>
                  </div>
                  <Link className="dash-card__link" to="/panel/convocatorias">
                    Ver todas <ArrowRight size={15} />
                  </Link>
                </header>
                <UpcomingList sessions={metrics.upcomingSessions} />
              </section>
            </div>
            <div className="dash-col">
              <section
                className="dash-card dash-order-2"
                id="solicitudes"
                aria-labelledby="dash-requests-title"
              >
                <header className="dash-card__header">
                  <div>
                    <h2 id="dash-requests-title">Últimas solicitudes</h2>
                    <p>Mensajes del formulario de contacto de la web.</p>
                  </div>
                </header>
                {actionError && <p className="alert alert-error">{actionError}</p>}
                <RequestList
                  requests={data.contactRequests}
                  now={now}
                  resolvingId={resolvingId}
                  onResolve={handleResolve}
                />
              </section>

              <section className="dash-card dash-order-4" aria-labelledby="dash-coverage-title">
                <header className="dash-card__header">
                  <div>
                    <h2 id="dash-coverage-title">Cursos con fechas por categoría</h2>
                    <p>
                      <strong>{metrics.coursesWithDates}</strong> de {metrics.publishedCourses}{' '}
                      cursos publicados tienen alguna convocatoria futura.
                    </p>
                  </div>
                </header>
                <ul className="dash-meters" aria-label="Cobertura por categoría">
                  {metrics.coverage.map((category) => (
                    <li key={category.name} className="dash-meter-row">
                      <span className="dash-meter-row__name">{category.name}</span>
                      <Meter value={category.total ? category.withDates / category.total : 0} />
                      <span className="dash-meter-row__figure">
                        {category.withDates}/{category.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function KpiTile({
  icon,
  label,
  value,
  detail,
  tone = 'default',
  to,
}: {
  icon: ReactNode
  label: string
  value: string
  detail: string
  tone?: 'default' | 'warning'
  to?: string
}) {
  const content = (
    <>
      <span className="dash-kpi__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="dash-kpi__label">{label}</span>
      <span className="dash-kpi__value">{value}</span>
      <span className="dash-kpi__detail">{detail}</span>
    </>
  )
  const className = `dash-kpi${tone === 'warning' ? ' dash-kpi--warning' : ''}`

  if (!to) return <div className={className}>{content}</div>
  if (to.startsWith('#')) {
    return (
      <a className={`${className} dash-kpi--link`} href={to}>
        {content}
      </a>
    )
  }
  return (
    <Link className={`${className} dash-kpi--link`} to={to}>
      {content}
    </Link>
  )
}

function AttentionPanel({ items }: { items: AttentionItem[] }) {
  if (!items.length) {
    return (
      <section className="dash-attention dash-attention--clear" aria-label="Necesita tu atención">
        <CheckCircle2 size={20} aria-hidden="true" />
        <div>
          <strong>Todo al día</strong>
          <p>No hay solicitudes, inscripciones ni convocatorias pendientes de revisar.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="dash-attention" aria-labelledby="dash-attention-title">
      <h2 id="dash-attention-title">Necesita tu atención</h2>
      <ul>
        {items.map((item) => {
          const Icon = item.tone === 'warning' ? AlertTriangle : Info
          const action = (
            <>
              {item.action} <ArrowRight size={14} />
            </>
          )
          return (
            <li key={item.id} className={`dash-attention__item is-${item.tone}`}>
              <span className="dash-attention__icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              <div className="dash-attention__text">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              {item.to.startsWith('#') ? (
                <a className="dash-attention__action" href={item.to}>
                  {action}
                </a>
              ) : (
                <Link className="dash-attention__action" to={item.to}>
                  {action}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Meter({ value }: { value: number }) {
  return (
    <span className="dash-meter" aria-hidden="true">
      <span className="dash-meter__fill" style={{ width: `${Math.round(value * 100)}%` }} />
    </span>
  )
}

function UpcomingList({ sessions }: { sessions: UpcomingSession[] }) {
  if (!sessions.length) {
    return (
      <div className="dash-empty">
        <CalendarDays size={22} aria-hidden="true" />
        <p>No hay convocatorias en los próximos {UPCOMING_DAYS} días.</p>
        <Link className="btn btn-secondary btn-sm" to="/panel/convocatorias">
          <Plus size={15} /> Crear convocatoria
        </Link>
      </div>
    )
  }

  const visible = sessions.slice(0, 6)
  return (
    <>
      <ul className="dash-sessions">
        {visible.map((session) => {
          const startsAt = new Date(session.startsAt)
          const isFull = session.enrolled >= session.capacity
          return (
            <li key={session.id} className="dash-session">
              <span className="dash-session__date" aria-hidden="true">
                <b>{dayNumber.format(startsAt)}</b>
                <span>{monthShort.format(startsAt).replace('.', '')}</span>
              </span>
              <div className="dash-session__info">
                <strong title={session.courseTitle}>{session.courseTitle}</strong>
                <span className="dash-session__meta">
                  {session.venueName ? (
                    <>
                      <MapPin size={13} aria-hidden="true" /> {session.venueName}
                    </>
                  ) : (
                    <>
                      <Monitor size={13} aria-hidden="true" /> Online
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  {whenLabel(startsAt)}
                </span>
                <span className="dash-session__occupancy">
                  <Meter value={session.occupancy} />
                  <span>
                    {session.enrolled}/{session.capacity} plazas
                    {isFull && <em className="badge badge--positive">Completa</em>}
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      {sessions.length > visible.length && (
        <p className="dash-more">
          Y {sessions.length - visible.length} más en los próximos {UPCOMING_DAYS} días.
        </p>
      )}
    </>
  )
}

function RequestList({
  requests,
  now,
  resolvingId,
  onResolve,
}: {
  requests: DashboardContactRequest[]
  now: Date
  resolvingId: string | null
  onResolve: (request: DashboardContactRequest) => void
}) {
  // Open requests first (newest first), then the latest handled ones for context.
  const visible = [
    ...requests.filter((item) => item.status === 'new' || item.status === 'in_progress'),
    ...requests.filter((item) => item.status === 'resolved'),
  ].slice(0, 5)

  if (!visible.length) {
    return (
      <div className="dash-empty">
        <Inbox size={22} aria-hidden="true" />
        <p>Todavía no ha llegado ninguna solicitud desde la web.</p>
      </div>
    )
  }

  return (
    <ul className="dash-requests">
      {visible.map((request) => {
        const isOpen = request.status === 'new' || request.status === 'in_progress'
        return (
          <li key={request.id} className={`dash-request${isOpen ? '' : ' is-resolved'}`}>
            <span className="dash-request__avatar" aria-hidden="true">
              {initials(request.name)}
            </span>
            <div className="dash-request__body">
              <div className="dash-request__top">
                <strong>{request.name}</strong>
                <time dateTime={request.createdAt}>{timeAgo(request.createdAt, now)}</time>
              </div>
              <p>
                {request.subject || 'Sin asunto'}
                {request.companyName ? ` · ${request.companyName}` : ''}
              </p>
              <div className="dash-request__actions">
                <a href={`mailto:${request.email}`} title={request.email}>
                  <Mail size={14} aria-hidden="true" /> Email
                </a>
                {request.phone && (
                  <a href={`tel:${request.phone.replace(/\s+/g, '')}`} title={request.phone}>
                    <Phone size={14} aria-hidden="true" /> Llamar
                  </a>
                )}
                {isOpen ? (
                  <button
                    type="button"
                    onClick={() => onResolve(request)}
                    disabled={resolvingId === request.id}
                  >
                    <Check size={14} aria-hidden="true" />
                    {resolvingId === request.id ? 'Guardando…' : 'Marcar atendida'}
                  </button>
                ) : (
                  <span className="dash-request__done">
                    <CheckCircle2 size={14} aria-hidden="true" /> Atendida
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function DashboardSkeleton() {
  return (
    <div className="dash-skeleton" role="status" aria-label="Cargando el panel">
      <div className="dash-kpis">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="dash-skeleton__block dash-skeleton__block--kpi" />
        ))}
      </div>
      <span className="dash-skeleton__block dash-skeleton__block--wide" />
      <div className="dash-columns">
        <span className="dash-skeleton__block dash-skeleton__block--card" />
        <span className="dash-skeleton__block dash-skeleton__block--card" />
      </div>
    </div>
  )
}
