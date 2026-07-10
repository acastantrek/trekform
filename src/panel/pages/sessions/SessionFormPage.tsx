import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormField } from '../../components/FormField'
import {
  createSession,
  getSession,
  listCourseOptions,
  listVenueOptions,
  updateSession,
  type CourseOption,
  type SessionInput,
} from '../../services/sessions'
import type { CourseSession, VenueOption } from '../../types'

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
  status: CourseSession['status']
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

export function SessionFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [courses, setCourses] = useState<CourseOption[]>([])
  const [venues, setVenues] = useState<VenueOption[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listCourseOptions(), listVenueOptions()])
      .then(([courseData, venueData]) => {
        setCourses(courseData)
        setVenues(venueData)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar datos.'))
  }, [])

  useEffect(() => {
    if (!id) return
    getSession(id)
      .then((data) => {
        if (!data) {
          setError('No se ha encontrado la convocatoria.')
          return
        }
        setForm({
          courseId: data.courseId,
          venueId: data.venueId ?? '',
          code: data.code,
          slug: data.slug,
          startsAt: toDatetimeLocal(data.startsAt),
          endsAt: toDatetimeLocal(data.endsAt),
          capacity: data.capacity,
          priceEuros: (data.priceCents / 100).toString(),
          status: data.status,
        })
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar la convocatoria.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

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
      if (id) {
        await updateSession(id, input)
      } else {
        await createSession(input)
      }
      navigate('/panel/convocatorias')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la convocatoria.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando…</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEditing ? 'Editar convocatoria' : 'Nueva convocatoria'}</h1>
          <p>Fecha concreta de un curso, con sede, plazas y precio.</p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">
          <FormField label="Curso" htmlFor="session-course">
            <select
              id="session-course"
              required
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
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as CourseSession['status'] }))
            }
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
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear convocatoria'}
          </button>
        </div>
      </form>
    </div>
  )
}
