import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { FormField } from '../../components/FormField'
import { DataTable } from '../../components/DataTable'
import { slugify } from '../../lib/slugify'
import {
  createCourse,
  createModule,
  deleteModule,
  getCourse,
  listCategories,
  listModules,
  updateCourse,
  updateModule,
  type CourseInput,
  type ModuleInput,
} from '../../services/courses'
import { useConfirm } from '../../hooks/useConfirm'
import type { Course, CourseCategory, CourseModule } from '../../types'

function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 16)
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

const emptyForm: CourseInput = {
  categoryId: '',
  title: '',
  slug: '',
  excerpt: '',
  description: '',
  modality: 'presential',
  durationHours: null,
  imageUrl: '',
  isFeatured: false,
  status: 'draft',
  publishedAt: null,
}

const emptyModuleForm = { title: '', content: '', durationMinutes: '' as number | '', position: 0 }

export function CourseFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [modules, setModules] = useState<CourseModule[]>([])
  const [moduleForm, setModuleForm] = useState(emptyModuleForm)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.'))
  }, [])

  async function loadModules(courseId: string) {
    try {
      setModules(await listModules(courseId))
    } catch (cause) {
      setModuleError(cause instanceof Error ? cause.message : 'Error al cargar los módulos.')
    }
  }

  useEffect(() => {
    if (!id) return
    getCourse(id)
      .then((data) => {
        if (!data) {
          setError('No se ha encontrado el curso.')
          return
        }
        setCourse(data)
        setSlugTouched(true)
        setForm({
          categoryId: data.categoryId,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          description: data.description,
          modality: data.modality,
          durationHours: data.durationHours,
          imageUrl: data.imageUrl,
          isFeatured: data.isFeatured,
          status: data.status,
          publishedAt: data.publishedAt,
        })
        return loadModules(id)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar el curso.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (id) {
        await updateCourse(id, form)
      } else {
        const newId = await createCourse(form)
        navigate(`/panel/cursos/${newId}`, { replace: true })
        return
      }
      const refreshed = await getCourse(id)
      if (refreshed) setCourse(refreshed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el curso.')
    } finally {
      setSaving(false)
    }
  }

  function resetModuleForm() {
    setEditingModuleId(null)
    setModuleForm({ ...emptyModuleForm, position: modules.length })
    setModuleError(null)
  }

  function startEditModule(module: CourseModule) {
    setEditingModuleId(module.id)
    setModuleForm({
      title: module.title,
      content: module.content ?? '',
      durationMinutes: module.durationMinutes ?? '',
      position: module.position,
    })
  }

  async function handleModuleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!id) return
    setModuleError(null)

    const input: ModuleInput = {
      courseId: id,
      title: moduleForm.title,
      content: moduleForm.content || null,
      durationMinutes: moduleForm.durationMinutes === '' ? null : Number(moduleForm.durationMinutes),
      position: moduleForm.position,
    }

    try {
      if (editingModuleId) {
        await updateModule(editingModuleId, input)
      } else {
        await createModule(input)
      }
      resetModuleForm()
      await loadModules(id)
    } catch (cause) {
      setModuleError(cause instanceof Error ? cause.message : 'No se pudo guardar el módulo.')
    }
  }

  async function handleDeleteModule(module: CourseModule) {
    if (!id) return
    if (!(await confirm(`¿Eliminar el módulo "${module.title}"? Esta acción no se puede deshacer.`))) return
    try {
      await deleteModule(module.id)
      await loadModules(id)
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar el módulo.')
    }
  }

  if (loading) return <p>Cargando…</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEditing ? course?.title ?? 'Editar curso' : 'Nuevo curso'}</h1>
          <p>Completa la información que se mostrará en el sitio público.</p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">
          <FormField label="Título" htmlFor="course-title">
            <input
              id="course-title"
              required
              value={form.title}
              onChange={(event) => {
                const title = event.target.value
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: slugTouched ? prev.slug : slugify(title),
                }))
              }}
            />
          </FormField>
          <FormField label="Slug" htmlFor="course-slug">
            <input
              id="course-slug"
              required
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true)
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }}
            />
          </FormField>
        </div>

        <div className="form-grid">
          <FormField label="Categoría" htmlFor="course-category">
            <select
              id="course-category"
              required
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Modalidad" htmlFor="course-modality">
            <select
              id="course-modality"
              value={form.modality}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, modality: event.target.value as Course['modality'] }))
              }
            >
              <option value="presential">Presencial</option>
              <option value="online">Online</option>
              <option value="hybrid">Híbrida</option>
            </select>
          </FormField>
        </div>

        <FormField label="Extracto" htmlFor="course-excerpt" hint="Resumen corto para las tarjetas de curso.">
          <textarea
            id="course-excerpt"
            value={form.excerpt ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
          />
        </FormField>

        <FormField label="Descripción" htmlFor="course-description">
          <textarea
            id="course-description"
            value={form.description ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </FormField>

        <div className="form-grid">
          <FormField label="Duración (horas)" htmlFor="course-duration">
            <input
              id="course-duration"
              type="number"
              min="0"
              step="0.5"
              value={form.durationHours ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  durationHours: event.target.value === '' ? null : Number(event.target.value),
                }))
              }
            />
          </FormField>
          <FormField label="URL de imagen" htmlFor="course-image">
            <input
              id="course-image"
              value={form.imageUrl ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
          </FormField>
        </div>

        <div className="form-grid">
          <FormField label="Estado" htmlFor="course-status">
            <select
              id="course-status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as Course['status'] }))
              }
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </FormField>
          <FormField label="Fecha de publicación" htmlFor="course-published-at">
            <input
              id="course-published-at"
              type="datetime-local"
              value={toDatetimeLocal(form.publishedAt)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, publishedAt: fromDatetimeLocal(event.target.value) }))
              }
            />
          </FormField>
        </div>

        <FormField label="Destacado" htmlFor="course-featured">
          <div className="checkbox-field">
            <input
              id="course-featured"
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
            />
            <span>Mostrar en la portada</span>
          </div>
        </FormField>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear curso'}
          </button>
        </div>
      </form>

      {isEditing && id && (
        <section>
          <h2>Módulos del temario</h2>

          <form className="form" onSubmit={handleModuleSubmit} style={{ marginBottom: 20 }}>
            {moduleError && <div className="alert alert-error">{moduleError}</div>}
            <div className="form-grid">
              <FormField label="Título del módulo" htmlFor="module-title">
                <input
                  id="module-title"
                  required
                  value={moduleForm.title}
                  onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </FormField>
              <FormField label="Duración (min)" htmlFor="module-duration">
                <input
                  id="module-duration"
                  type="number"
                  min="0"
                  value={moduleForm.durationMinutes}
                  onChange={(event) =>
                    setModuleForm((prev) => ({
                      ...prev,
                      durationMinutes: event.target.value === '' ? '' : Number(event.target.value),
                    }))
                  }
                />
              </FormField>
            </div>
            <FormField label="Contenido" htmlFor="module-content">
              <textarea
                id="module-content"
                value={moduleForm.content}
                onChange={(event) => setModuleForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </FormField>
            <FormField label="Posición" htmlFor="module-position" hint="Orden dentro del temario, empezando en 0.">
              <input
                id="module-position"
                type="number"
                min="0"
                value={moduleForm.position}
                onChange={(event) =>
                  setModuleForm((prev) => ({ ...prev, position: Number(event.target.value) }))
                }
              />
            </FormField>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> {editingModuleId ? 'Guardar módulo' : 'Añadir módulo'}
              </button>
              {editingModuleId && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetModuleForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <DataTable
            rows={modules}
            rowKey={(row) => row.id}
            emptyMessage="Este curso todavía no tiene módulos."
            columns={[
              { header: 'Posición', render: (row) => row.position },
              { header: 'Título', render: (row) => row.title },
              { header: 'Duración', render: (row) => (row.durationMinutes ? `${row.durationMinutes} min` : '—') },
              {
                header: 'Acciones',
                className: 'col-actions',
                render: (row) => (
                  <div className="row-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEditModule(row)}>
                      <Pencil size={14} /> Editar
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteModule(row)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </section>
      )}

      {!isEditing && <p className="empty-state">Guarda el curso para poder añadir módulos.</p>}
      {dialog}
    </div>
  )
}
