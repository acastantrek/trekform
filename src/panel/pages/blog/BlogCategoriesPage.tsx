import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { FormField } from '../../components/FormField'
import { slugify } from '../../lib/slugify'
import {
  createBlogCategory,
  deleteBlogCategory,
  listBlogCategories,
  updateBlogCategory,
  type BlogCategoryInput,
} from '../../services/blog'
import { useConfirm } from '../../hooks/useConfirm'
import type { BlogCategory } from '../../types'

const emptyForm: BlogCategoryInput = { name: '', slug: '', description: '', isActive: true }

export function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BlogCategoryInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  async function reload() {
    try {
      setCategories(await listBlogCategories())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listBlogCategories()
      .then((data) => {
        setCategories(data)
        setError(null)
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.'))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(category: BlogCategory) {
    setEditingId(category.id)
    setSlugTouched(true)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
    })
  }

  function resetForm() {
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
        await updateBlogCategory(editingId, form)
      } else {
        await createBlogCategory(form)
      }
      resetForm()
      await reload()
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'No se pudo guardar la categoría.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: BlogCategory) {
    if (!(await confirm(`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`))) return
    try {
      await deleteBlogCategory(category.id)
      await reload()
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar la categoría.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categorías del blog</h1>
          <p>Clasifican los artículos publicados.</p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <h2>{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
        {formError && <div className="alert alert-error">{formError}</div>}

        <div className="form-grid">
          <FormField label="Nombre" htmlFor="blogcat-name">
            <input
              id="blogcat-name"
              required
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
          <FormField label="Slug" htmlFor="blogcat-slug">
            <input
              id="blogcat-slug"
              required
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true)
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }}
            />
          </FormField>
        </div>

        <FormField label="Descripción" htmlFor="blogcat-description">
          <textarea
            id="blogcat-description"
            value={form.description ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </FormField>

        <FormField label="Activa" htmlFor="blogcat-active">
          <div className="checkbox-field">
            <input
              id="blogcat-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            <span>Visible en el sitio público</span>
          </div>
        </FormField>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear categoría'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

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
      {dialog}
    </div>
  )
}
