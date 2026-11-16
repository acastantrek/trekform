import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../../components/DataTable'
import { Pagination } from '../../components/Pagination'
import {
  listSessionAlerts,
  updateSessionAlertStatus,
  type SessionAlert,
  type SessionAlertStatus,
} from '../../services/sessionAlerts'

const statusOptions: SessionAlertStatus[] = ['pending', 'notified', 'cancelled']

const statusLabel: Record<SessionAlertStatus, string> = {
  pending: 'Pendiente',
  notified: 'Avisado',
  cancelled: 'Descartado',
}

const PAGE_SIZE = 20

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('es-ES') : '—'
}

/**
 * People who asked to be told when a course gets an open session ("Avísame" on the public
 * site). Notification is manual for now: contact them, then mark the alert as notified.
 */
export function SessionAlertsPage() {
  const [alerts, setAlerts] = useState<SessionAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Pending first: that's the to-do list.
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [courseFilter, setCourseFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    listSessionAlerts()
      .then((data) => {
        setAlerts(data)
        setError(null)
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Error al cargar los avisos.'),
      )
      .finally(() => setLoading(false))
  }, [])

  const pendingCount = alerts.filter((alert) => alert.status === 'pending').length

  // Courses with alerts, busiest (most pending) first, so the filter doubles as a ranking.
  const courseOptions = useMemo(() => {
    const map = new Map<string, { title: string; pending: number }>()
    alerts.forEach((alert) => {
      const entry = map.get(alert.courseId) ?? { title: alert.courseTitle, pending: 0 }
      if (alert.status === 'pending') entry.pending += 1
      map.set(alert.courseId, entry)
    })
    return [...map.entries()].sort(
      ([, a], [, b]) => b.pending - a.pending || a.title.localeCompare(b.title, 'es'),
    )
  }, [alerts])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return alerts.filter((alert) => {
      if (statusFilter && alert.status !== statusFilter) return false
      if (courseFilter && alert.courseId !== courseFilter) return false
      if (
        term &&
        !alert.name.toLowerCase().includes(term) &&
        !alert.email.toLowerCase().includes(term) &&
        !(alert.province ?? '').toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [alerts, statusFilter, courseFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  async function handleStatusChange(alert: SessionAlert, status: SessionAlertStatus) {
    setUpdatingId(alert.id)
    try {
      const { notifiedAt } = await updateSessionAlertStatus(alert.id, status)
      setAlerts((prev) =>
        prev.map((row) => (row.id === alert.id ? { ...row, status, notifiedAt } : row)),
      )
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'No se pudo actualizar el aviso.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="list-page">
      <div className="page-header">
        <div>
          <h1>Avisos de convocatoria</h1>
          <p>
            Personas que quieren saber cuándo hay fechas para un curso.{' '}
            <strong>{pendingCount}</strong> pendientes de avisar.
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </select>
        <select
          value={courseFilter}
          onChange={(event) => {
            setCourseFilter(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Todos los cursos</option>
          {courseOptions.map(([id, { title, pending }]) => (
            <option key={id} value={id}>
              {title}
              {pending ? ` (${pending} pendientes)` : ''}
            </option>
          ))}
        </select>
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por nombre, email o provincia…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        {!loading && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <DataTable
          rows={visible}
          rowKey={(row) => row.id}
          emptyMessage="No hay avisos para este filtro."
          columns={[
            { header: 'Nombre', render: (row) => row.name },
            {
              header: 'Email',
              className: 'col-email',
              render: (row) => (
                <a href={`mailto:${row.email}`} title={row.email}>
                  {row.email}
                </a>
              ),
            },
            {
              header: 'Teléfono',
              render: (row) => (row.phone ? <a href={`tel:${row.phone}`}>{row.phone}</a> : '—'),
            },
            { header: 'Curso', render: (row) => row.courseTitle },
            { header: 'Provincia', render: (row) => row.province ?? 'Cualquiera' },
            { header: 'Alta', className: 'col-date', render: (row) => formatDate(row.createdAt) },
            {
              header: 'Avisado',
              className: 'col-date',
              render: (row) => formatDate(row.notifiedAt),
            },
            {
              header: 'Estado',
              render: (row) => (
                <select
                  value={row.status}
                  disabled={updatingId === row.id}
                  onChange={(event) =>
                    handleStatusChange(row, event.target.value as SessionAlertStatus)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
                </select>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
