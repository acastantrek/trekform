import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { FormField } from '../../components/FormField'
import { Pagination } from '../../components/Pagination'
import { StatusBadge } from '../../components/StatusBadge'
import {
  createSession,
  deleteSession,
  listCourseOptions,
  listSessions,
  listVenueOptions,
  updateSession,
  type CourseOption,
  type SessionInput,
} from '../../services/sessions'
import { useConfirm } from '../../hooks/useConfirm'
import type { CourseSession, SessionStatus, VenueOption } from '../../types'

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

function toDatetimeLocal(value: string): string {
  if (!value) return ''
  return value.slice(0, 16)
}

function fromDatetimeLocal(value: string): string {
  return value ? new Date(value).toISOString() : ''
}

interface FormState {
  courseId: string
  venueId: string
  code: string
  slug: string
  startsAt: string
  endsAt: string
  capacity: number
  priceEuros: string
  status: SessionStatus
}

const emptyForm: FormState = {
  courseId: '',
  venueId: '',
  code: '',
  slug: '',
  startsAt: '',
  endsAt: '',
  capacity: 15,
  priceEuros: '0',
  status: 'draft',
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [venues, setVenues] = useState<VenueOption[]>([])
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  async function reload() {
    try {
      const [sessionData, courseData, venueData] = await Promise.all([
        listSessions(),
        listCourseOptions(),
        listVenueOptions(),
      ])
      setSessions(sessionData)
      setCourses(courseData)
      setVenues(venueData)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar las convocatorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([listSessions(), listCourseOptions(), listVenueOptions()])
      .then(([sessionData, courseData, venueData]) => {
        setSessions(sessionData)
        setCourses(courseData)
        setVenues(venueData)
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

  function openCreateModal() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  function startEdit(session: CourseSession) {
    setEditingId(session.id)
    setForm({
      courseId: session.courseId,
      venueId: session.venueId ?? '',
      code: session.code,
      slug: session.slug,
      startsAt: toDatetimeLocal(session.startsAt),
      endsAt: toDatetimeLocal(session.endsAt),
      capacity: session.capacity,
      priceEuros: (session.priceCents / 100).toString(),
      status: session.status,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setFormError(null)

    const input: SessionInput = {
      courseId: form.courseId,
      venueId: form.venueId || null,
      code: form.code,
      slug: form.slug,
      startsAt: fromDatetimeLocal(form.startsAt),
      endsAt: fromDatetimeLocal(form.endsAt),
      capacity: form.capacity,
      priceCents: Math.round(Number(form.priceEuros || '0') * 100),
      status: form.status,
    }

    try {
      if (editingId) {
        await updateSession(editingId, input)
      } else {
        await createSession(input)
      }
      closeModal()
      await reload()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'No se pudo guardar la convocatoria.')
    } finally {
      setSaving(false)
    }
  }

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
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Nueva convocatoria
        </button>
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(row)}>
                    <Pencil size={14} /> Editar
                  </button>
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card modal-card--form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="form" onSubmit={handleSubmit}>
              <h2 id="session-modal-title">{editingId ? 'Editar convocatoria' : 'Nueva convocatoria'}</h2>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div className="form-grid">
                <FormField label="Curso" htmlFor="session-course">
                  <select
                    id="session-course"
                    required
                    autoFocus
                    value={form.courseId}
                    onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}
                  >
                    <option value="" disabled>
                      Selecciona un curso
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Sede" htmlFor="session-venue" hint="Déjalo vacío para convocatorias online.">
                  <select
                    id="session-venue"
                    value={form.venueId}
                    onChange={(event) => setForm((prev) => ({ ...prev, venueId: event.target.value }))}
                  >
                    <option value="">Online / sin sede</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} ({venue.city})
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="form-grid">
                <FormField label="Código" htmlFor="session-code" hint="Identificador único, p. ej. MAD-2026-08">
                  <input
                    id="session-code"
                    required
                    value={form.code}
                    onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                  />
                </FormField>
                <FormField label="Slug" htmlFor="session-slug">
                  <input
                    id="session-slug"
                    required
                    value={form.slug}
                    onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                </FormField>
              </div>

              <div className="form-grid">
                <FormField label="Inicio" htmlFor="session-starts">
                  <input
                    id="session-starts"
                    type="datetime-local"
                    required
                    value={form.startsAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                  />
                </FormField>
                <FormField label="Fin" htmlFor="session-ends">
                  <input
                    id="session-ends"
                    type="datetime-local"
                    required
                    value={form.endsAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
                  />
                </FormField>
              </div>

              <div className="form-grid">
                <FormField label="Plazas" htmlFor="session-capacity">
                  <input
                    id="session-capacity"
                    type="number"
                    min="1"
                    required
                    value={form.capacity}
                    onChange={(event) => setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))}
                  />
                </FormField>
                <FormField label="Precio (€)" htmlFor="session-price">
                  <input
                    id="session-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceEuros}
                    onChange={(event) => setForm((prev) => ({ ...prev, priceEuros: event.target.value }))}
                  />
                </FormField>
              </div>

              <FormField label="Estado" htmlFor="session-status">
                <select
                  id="session-status"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as SessionStatus }))}
                >
                  <option value="draft">Borrador</option>
                  <option value="open">Abierta</option>
                  <option value="full">Completa</option>
                  <option value="completed">Finalizada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </FormField>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear convocatoria'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {dialog}
    </div>
  )
}
