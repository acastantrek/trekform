import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../../components/DataTable'
import { listEnrollments, updateEnrollmentStatus } from '../../services/enrollments'
import type { Enrollment, EnrollmentStatus } from '../../types'

const statusOptions: EnrollmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed']

const statusLabel: Record<EnrollmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Finalizada',
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString('es-ES') : '—'
}

export function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    listEnrollments()
      .then((data) => {
        setEnrollments(data)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar las inscripciones.'))
      .finally(() => setLoading(false))
  }, [])

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>()
    enrollments.forEach((enrollment) => map.set(enrollment.courseId, enrollment.courseTitle))
    return Array.from(map.entries())
  }, [enrollments])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return enrollments.filter((enrollment) => {
      if (statusFilter && enrollment.status !== statusFilter) return false
      if (courseFilter && enrollment.courseId !== courseFilter) return false
      if (
        term &&
        !enrollment.studentName.toLowerCase().includes(term) &&
        !(enrollment.studentEmail ?? '').toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [enrollments, statusFilter, courseFilter, search])

  async function handleStatusChange(enrollment: Enrollment, status: EnrollmentStatus) {
    setUpdatingId(enrollment.id)
    try {
      await updateEnrollmentStatus(enrollment.id, status)
      setEnrollments((prev) => prev.map((row) => (row.id === enrollment.id ? { ...row, status } : row)))
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo actualizar el estado.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Inscripciones</h1>
          <p>Alumnos inscritos en las convocatorias.</p>
        </div>
      </div>

      <div className="filters-bar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </select>
        <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
          <option value="">Todos los cursos</option>
          {courseOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por alumno o email…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <DataTable
          rows={filtered}
          rowKey={(row) => row.id}
          emptyMessage="No hay inscripciones para este filtro."
          columns={[
            { header: 'Alumno', render: (row) => row.studentName },
            { header: 'Email', render: (row) => row.studentEmail ?? '—' },
            { header: 'Curso', render: (row) => row.courseTitle },
            { header: 'Convocatoria', render: (row) => row.sessionCode },
            { header: 'Empresa', render: (row) => row.companyName ?? '—' },
            { header: 'Alta', render: (row) => formatDate(row.createdAt) },
            {
              header: 'Estado',
              render: (row) => (
                <select
                  value={row.status}
                  disabled={updatingId === row.id}
                  onChange={(event) => handleStatusChange(row, event.target.value as EnrollmentStatus)}
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
