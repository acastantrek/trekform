import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { FormField } from '../../components/FormField'
import { slugify } from '../../lib/slugify'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryInput,
} from '../../services/courses'
import { useConfirm } from '../../hooks/useConfirm'
import type { CourseCategory } from '../../types'

const emptyForm: CategoryInput = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  async function reload() {
    try {
      setCategories(await listCategories())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listCategories()
      .then((data) => {
        setCategories(data)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.'))
      .finally(() => setLoading(false))
  }, [])

  function openCreateModal() {
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
    setFormError(null)
    setIsModalOpen(true)
  }

  function startEdit(category: CourseCategory) {
    setEditingId(category.id)
    setSlugTouched(true)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) {
        await updateCategory(editingId, form)
      } else {
        await createCategory(form)
      }
      closeModal()
      await reload()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'No se pudo guardar la categoría.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: CourseCategory) {
    if (!(await confirm(`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`))) return
    try {
      await deleteCategory(category.id)
      await reload()
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar la categoría.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categorías de cursos</h1>
          <p>Organizan el catálogo público de cursos.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <DataTable
          rows={categories}
          rowKey={(row) => row.id}
          emptyMessage="Todavía no hay categorías."
          columns={[
            { header: 'Nombre', render: (row) => row.name },
            { header: 'Slug', render: (row) => row.slug },
            { header: 'Orden', render: (row) => row.sortOrder },
            { header: 'Activa', render: (row) => (row.isActive ? 'Sí' : 'No') },
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card modal-card--form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="form" onSubmit={handleSubmit}>
              <h2 id="category-modal-title">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div className="form-grid">
                <FormField label="Nombre" htmlFor="cat-name">
                  <input
                    id="cat-name"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(event) => {
                      const name = event.target.value
                      setForm((prev) => ({
                        ...prev,
                        name,
                        slug: slugTouched ? prev.slug : slugify(name),
                      }))
                    }}
                  />
                </FormField>
                <FormField label="Slug" htmlFor="cat-slug">
                  <input
                    id="cat-slug"
                    required
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setForm((prev) => ({ ...prev, slug: event.target.value }))
                    }}
                  />
                </FormField>
              </div>

              <FormField label="Descripción" htmlFor="cat-description">
                <textarea
                  id="cat-description"
                  value={form.description ?? ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </FormField>

              <div className="form-grid">
                <FormField label="Orden" htmlFor="cat-order">
                  <input
                    id="cat-order"
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))
                    }
                  />
                </FormField>
                <FormField label="Activa" htmlFor="cat-active">
                  <div className="checkbox-field">
                    <input
                      id="cat-active"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    />
                    <span>Visible en el sitio público</span>
                  </div>
                </FormField>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear categoría'}
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
