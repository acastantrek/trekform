import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { Pagination } from '../../components/Pagination'
import { StatusBadge } from '../../components/StatusBadge'
import { deleteSession, listCourseOptions, listSessions, type CourseOption } from '../../services/sessions'
import { useConfirm } from '../../hooks/useConfirm'
import type { CourseSession, SessionStatus } from '../../types'

const statusOptions: SessionStatus[] = ['draft', 'open', 'full', 'completed', 'cancelled']

const statusLabel: Record<SessionStatus, string> = {
  draft: 'Borrador',
  open: 'Abierta',
  full: 'Completa',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
}

const PAGE_SIZE = 20

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  async function reload() {
    try {
      const [sessionData, courseData] = await Promise.all([listSessions(), listCourseOptions()])
      setSessions(sessionData)
      setCourses(courseData)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar las convocatorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([listSessions(), listCourseOptions()])
      .then(([sessionData, courseData]) => {
        setSessions(sessionData)
        setCourses(courseData)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar las convocatorias.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sessions.filter((session) => {
      if (courseFilter && session.courseId !== courseFilter) return false
      if (statusFilter && session.status !== statusFilter) return false
      if (
        term &&
        !session.code.toLowerCase().includes(term) &&
        !session.courseTitle.toLowerCase().includes(term) &&
        !(session.venueName ?? '').toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [sessions, courseFilter, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  async function handleDelete(session: CourseSession) {
    if (!(await confirm(`¿Eliminar la convocatoria "${session.code}"? Esta acción no se puede deshacer.`))) return
    try {
      await deleteSession(session.id)
      await reload()
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar la convocatoria.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Convocatorias</h1>
          <p>
            {filteredSessions.length} de {sessions.length} convocatorias.
          </p>
        </div>
        <Link to="/panel/convocatorias/nueva" className="btn btn-primary">
          <Plus size={16} /> Nueva convocatoria
        </Link>
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
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por código, curso o sede…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <DataTable
          rows={paginatedSessions}
          rowKey={(row) => row.id}
          emptyMessage="No hay convocatorias para estos filtros."
          columns={[
            { header: 'Código', render: (row) => row.code },
            { header: 'Curso', render: (row) => row.courseTitle },
            { header: 'Sede', render: (row) => row.venueName ?? 'Online' },
            { header: 'Inicio', render: (row) => formatDateTime(row.startsAt) },
            { header: 'Fin', render: (row) => formatDateTime(row.endsAt) },
            { header: 'Plazas', render: (row) => row.capacity },
            { header: 'Precio', render: (row) => formatPrice(row.priceCents) },
            { header: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
            {
              header: 'Acciones',
              className: 'col-actions',
              render: (row) => (
                <div className="row-actions">
                  <Link to={`/panel/convocatorias/${row.id}`} className="btn btn-secondary btn-sm">
                    <Pencil size={14} /> Editar
                  </Link>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      {dialog}
    </div>
  )
}
