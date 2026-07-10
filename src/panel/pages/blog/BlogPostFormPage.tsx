import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Markdown } from '../../../components/common/Markdown'
import { FormField } from '../../components/FormField'
import { useAuth } from '../../contexts/useAuth'
import { slugify } from '../../lib/slugify'
import { createPost, getPost, listBlogCategories, updatePost, type BlogPostInput } from '../../services/blog'
import type { BlogCategory, BlogPost } from '../../types'

function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 16)
}

function fromDatetimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

const emptyForm: BlogPostInput = {
  categoryId: null,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  status: 'draft',
  publishedAt: null,
}

function toInput(post: BlogPost): BlogPostInput {
  return {
    categoryId: post.categoryId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.imageUrl,
    status: post.status,
    publishedAt: post.publishedAt,
  }
}

export function BlogPostFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [form, setForm] = useState<BlogPostInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listBlogCategories()
      .then(setCategories)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.'))
  }, [])

  useEffect(() => {
    if (!id) return
    getPost(id)
      .then((data) => {
        if (!data) {
          setError('No se ha encontrado el artículo.')
          return
        }
        setSlugTouched(true)
        setForm(toInput(data))
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Error al cargar el artículo.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (id) {
        await updatePost(id, form)
      } else {
        await createPost(form, profile?.id ?? null)
      }
      navigate('/panel/blog')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el artículo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando…</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEditing ? 'Editar artículo' : 'Nuevo artículo'}</h1>
          <p>Contenido publicado en el blog del sitio.</p>
        </div>
      </div>

      <form className="form form-wide" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">
          <FormField label="Título" htmlFor="post-title">
            <input
              id="post-title"
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
          <FormField label="Slug" htmlFor="post-slug">
            <input
              id="post-slug"
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
          <FormField label="Categoría" htmlFor="post-category">
            <select
              id="post-category"
              value={form.categoryId ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, categoryId: event.target.value || null }))
              }
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="URL de imagen" htmlFor="post-image">
            <input
              id="post-image"
              value={form.imageUrl ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
          </FormField>
        </div>

        <FormField label="Extracto" htmlFor="post-excerpt" hint="Resumen corto para las tarjetas del blog.">
          <textarea
            id="post-excerpt"
            value={form.excerpt ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
          />
        </FormField>

        <FormField
          label="Contenido"
          htmlFor="post-content"
          hint="Admite Markdown: **negrita**, # títulos, listas, enlaces… se pega tal cual y se renderiza en el blog."
        >
          <div className="markdown-field">
            <textarea
              id="post-content"
              value={form.content ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            />
            <Markdown content={form.content || '*Nada que mostrar todavía.*'} className="markdown-preview" />
          </div>
        </FormField>

        <div className="form-grid">
          <FormField label="Estado" htmlFor="post-status">
            <select
              id="post-status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as BlogPost['status'] }))
              }
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </FormField>
          <FormField label="Fecha de publicación" htmlFor="post-published-at">
            <input
              id="post-published-at"
              type="datetime-local"
              value={toDatetimeLocal(form.publishedAt)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, publishedAt: fromDatetimeLocal(event.target.value) }))
              }
            />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
