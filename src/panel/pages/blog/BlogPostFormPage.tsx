import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  Circle,
  Columns2,
  ExternalLink,
  Eye,
  ImageIcon,
  Link2,
  PenLine,
  Save,
  Wand2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Markdown } from '../../../components/common/Markdown'
import { MarkdownToolbar } from '../../components/MarkdownToolbar'
import { useAuth } from '../../contexts/useAuth'
import { slugify } from '../../lib/slugify'
import {
  createPost,
  getPost,
  listBlogCategories,
  updatePost,
  type BlogPostInput,
} from '../../services/blog'
import type { BlogCategory, BlogPost } from '../../types'
import './BlogPostFormPage.css'

type Status = BlogPost['status']
type EditorView = 'write' | 'split' | 'preview'
type ImageState = 'empty' | 'loading' | 'ok' | 'error'

const EXCERPT_IDEAL = 160
const WORDS_PER_MINUTE = 200

const statusOptions: { value: Status; label: string; help: string }[] = [
  { value: 'draft', label: 'Borrador', help: 'Solo se ve en el panel. Puedes seguir editándolo.' },
  { value: 'published', label: 'Publicado', help: 'Visible para todo el mundo en el blog.' },
  { value: 'archived', label: 'Archivado', help: 'Retirado del blog, pero se conserva aquí.' },
]

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

// <input type="datetime-local"> works in local time; the database stores ISO (UTC).
function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function fromDatetimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

function formatDate(value: string | null) {
  const date = value ? new Date(value) : new Date()
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** A Google Images result link ("google.com/imgres?…&imgurl=…") is a page, not an image. */
function realImageFromGoogle(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!/(^|\.)google\.[a-z.]+$/.test(parsed.hostname)) return null
    return parsed.searchParams.get('imgurl')
  } catch {
    return null
  }
}

function isGooglePage(url: string) {
  try {
    const parsed = new URL(url)
    return /(^|\.)google\.[a-z.]+$/.test(parsed.hostname)
  } catch {
    return false
  }
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function BlogPostFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [form, setForm] = useState<BlogPostInput>(emptyForm)
  const [savedForm, setSavedForm] = useState<BlogPostInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [editingSlug, setEditingSlug] = useState(false)
  const [view, setView] = useState<EditorView>('split')
  const [image, setImage] = useState<{ url: string; state: ImageState }>({
    url: '',
    state: 'empty',
  })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    listBlogCategories()
      .then(setCategories)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.'),
      )
  }, [])

  useEffect(() => {
    if (!id) return
    getPost(id)
      .then((data) => {
        if (!data) {
          setError('No se ha encontrado el artículo.')
          return
        }
        const input = toInput(data)
        setForm(input)
        setSavedForm(input)
        setSlugTouched(true) // an existing URL must not change just because the title does
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Error al cargar el artículo.'),
      )
      .finally(() => setLoading(false))
  }, [id])

  const update = useCallback(<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const imageUrl = (form.imageUrl ?? '').trim()
  const imageState: ImageState = !imageUrl
    ? 'empty'
    : image.url === imageUrl
      ? image.state
      : 'loading'
  const googleImage = imageUrl ? realImageFromGoogle(imageUrl) : null
  const googlePage = imageUrl ? isGooglePage(imageUrl) : false

  const content = form.content ?? ''
  const excerpt = form.excerpt ?? ''
  const words = countWords(content)
  const readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  const categoryName = categories.find((item) => item.id === form.categoryId)?.name ?? null
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm)

  const checklist = useMemo(
    () => [
      { done: form.title.trim().length >= 10, label: 'Título descriptivo' },
      { done: excerpt.trim().length >= 40, label: 'Extracto para la tarjeta' },
      { done: imageState === 'ok', label: 'Imagen destacada que carga' },
      { done: Boolean(form.categoryId), label: 'Categoría asignada' },
      { done: words >= 150, label: 'Contenido de al menos 150 palabras' },
    ],
    [form.title, excerpt, imageState, form.categoryId, words],
  )
  const checklistDone = checklist.filter((item) => item.done).length

  async function save() {
    if (!form.title.trim()) {
      setError('El artículo necesita un título.')
      document.getElementById('post-title')?.focus()
      return
    }
    setSaving(true)
    setError(null)
    // Publishing without a date means "now", so the post doesn't end up undated in the blog.
    const payload: BlogPostInput = {
      ...form,
      slug: form.slug || slugify(form.title),
      publishedAt:
        form.status === 'published' && !form.publishedAt
          ? new Date().toISOString()
          : form.publishedAt,
    }
    try {
      if (id) {
        await updatePost(id, payload)
      } else {
        await createPost(payload, profile?.id ?? null)
      }
      setSavedForm(payload)
      navigate('/panel/blog')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el artículo.')
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void save()
  }

  // Ctrl/Cmd + S saves without leaving the keyboard.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (loading) return <p>Cargando…</p>

  const saveLabel = saving
    ? 'Guardando…'
    : form.status === 'published'
      ? isEditing && savedForm.status === 'published'
        ? 'Guardar cambios'
        : 'Publicar artículo'
      : form.status === 'archived'
        ? 'Guardar como archivado'
        : 'Guardar borrador'

  const excerptLength = excerpt.length
  const excerptTone =
    excerptLength === 0 ? '' : excerptLength > EXCERPT_IDEAL + 40 ? 'is-over' : 'is-ok'

  return (
    <form className="post-editor" ref={formRef} onSubmit={handleSubmit} noValidate>
      <header className="post-editor__header">
        <div>
          <Link to="/panel/blog" className="post-editor__back">
            <ArrowLeft size={15} /> Artículos
          </Link>
          <h1>{isEditing ? 'Editar artículo' : 'Nuevo artículo'}</h1>
          <p className="post-editor__meta">
            <span className={`post-status-pill is-${form.status}`}>
              {statusOptions.find((item) => item.value === form.status)?.label}
            </span>
            {isDirty ? (
              <span className="post-editor__dirty">Cambios sin guardar</span>
            ) : (
              <span className="post-editor__clean">
                <Check size={14} /> Todo guardado
              </span>
            )}
          </p>
        </div>
        <div className="post-editor__header-actions">
          {isEditing && savedForm.status === 'published' && savedForm.slug ? (
            <a
              className="btn btn-secondary"
              href={`/blog/${savedForm.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={15} /> Ver en la web
            </a>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={15} /> {saveLabel}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="post-editor__layout">
        {/* ---------- Main column ---------- */}
        <div className="post-editor__main">
          <section className="post-card">
            <label className="post-title-field" htmlFor="post-title">
              <span className="sr-only">Título</span>
              <input
                id="post-title"
                required
                placeholder="Título"
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
            </label>

            <div className="post-slug">
              <Link2 size={14} aria-hidden="true" />
              <span className="post-slug__base">trekform.com/blog/</span>
              {editingSlug ? (
                <input
                  autoFocus
                  aria-label="URL del artículo"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    // Cleaned up with slugify on blur, so hyphens can be typed freely here.
                    update('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }}
                  onBlur={() => {
                    setEditingSlug(false)
                    update('slug', slugify(form.slug) || slugify(form.title))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      event.currentTarget.blur()
                    }
                  }}
                />
              ) : (
                <>
                  <strong>{form.slug || 'se-genera-con-el-titulo'}</strong>
                  <button type="button" onClick={() => setEditingSlug(true)}>
                    <PenLine size={13} /> Cambiar
                  </button>
                </>
              )}
            </div>

            <div className="post-field">
              <div className="post-field__label">
                <label htmlFor="post-excerpt">Extracto</label>
                <span className={`post-counter ${excerptTone}`}>
                  {excerptLength} / {EXCERPT_IDEAL}
                </span>
              </div>
              <textarea
                id="post-excerpt"
                rows={3}
                placeholder="Dos o tres frases que resuman el artículo. Aparece en la tarjeta del blog."
                value={excerpt}
                onChange={(event) => update('excerpt', event.target.value)}
              />
              {excerptTone === 'is-over' ? (
                <p className="post-field__hint is-warning">
                  Es algo largo: en la tarjeta se recortará. Lo ideal son unos {EXCERPT_IDEAL}{' '}
                  caracteres.
                </p>
              ) : null}
            </div>
          </section>

          <section className="post-card post-card--editor">
            <div className="post-editor-bar">
              <MarkdownToolbar
                textareaRef={contentRef}
                value={content}
                onChange={(value) => update('content', value)}
              />
              <div className="post-view-switch" role="tablist" aria-label="Vista del editor">
                {(
                  [
                    { value: 'write', label: 'Escribir', icon: PenLine },
                    { value: 'split', label: 'Ambos', icon: Columns2 },
                    { value: 'preview', label: 'Vista previa', icon: Eye },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={view === value}
                    className={view === value ? 'is-active' : ''}
                    onClick={() => setView(value)}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`post-editor-panes is-${view}`}>
              <textarea
                ref={contentRef}
                id="post-content"
                aria-label="Contenido del artículo"
                placeholder={
                  'Empieza a escribir aquí…\n\nUsa los botones de arriba para dar formato, añadir enlaces, imágenes, vídeos de YouTube o botones de llamada a la acción.'
                }
                value={content}
                onChange={(event) => update('content', event.target.value)}
              />
              <div className="post-preview" aria-label="Vista previa">
                {content.trim() ? (
                  <Markdown content={content} className="blog-article-content" />
                ) : (
                  <p className="post-preview__empty">
                    Aquí verás el artículo tal y como se mostrará en el blog.
                  </p>
                )}
              </div>
            </div>

            <footer className="post-editor-foot">
              <span>
                {words} {words === 1 ? 'palabra' : 'palabras'} · {readingMinutes} min de lectura
              </span>
              <details className="post-help">
                <summary>Guía rápida de formato</summary>
                <dl>
                  <dt>**texto**</dt>
                  <dd>Negrita</dd>
                  <dt>## Subtítulo</dt>
                  <dd>Título de sección</dd>
                  <dt>- elemento</dt>
                  <dd>Lista</dd>
                  <dt>[texto](https://…)</dt>
                  <dd>Enlace (los externos abren otra pestaña)</dd>
                  <dt>URL de YouTube sola en su línea</dt>
                  <dd>Vídeo incrustado</dd>
                  <dt>[[cta: Texto | /url]]</dt>
                  <dd>Botón de llamada a la acción</dd>
                </dl>
              </details>
            </footer>
          </section>
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="post-editor__side">
          <section className="post-card post-side-card">
            <h2>Publicación</h2>
            <div className="post-status-options" role="radiogroup" aria-label="Estado">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`post-status-option${form.status === option.value ? ' is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="post-status"
                    value={option.value}
                    checked={form.status === option.value}
                    onChange={() => update('status', option.value)}
                  />
                  <span className={`post-status-dot is-${option.value}`} aria-hidden="true" />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.help}</small>
                  </span>
                </label>
              ))}
            </div>

            <div className="post-field">
              <div className="post-field__label">
                <label htmlFor="post-published-at">
                  <CalendarClock size={14} /> Fecha de publicación
                </label>
                <button
                  type="button"
                  className="post-link-button"
                  onClick={() => update('publishedAt', new Date().toISOString())}
                >
                  Ahora
                </button>
              </div>
              <input
                id="post-published-at"
                type="datetime-local"
                value={toDatetimeLocal(form.publishedAt)}
                onChange={(event) => update('publishedAt', fromDatetimeLocal(event.target.value))}
              />
              {form.status === 'published' && !form.publishedAt ? (
                <p className="post-field__hint">
                  Si la dejas vacía, se usará el momento de guardar.
                </p>
              ) : null}
            </div>

            <button type="submit" className="btn btn-primary post-save" disabled={saving}>
              <Save size={15} /> {saveLabel}
            </button>
            <p className="post-shortcut">
              Atajo: <kbd>Ctrl</kbd> + <kbd>S</kbd>
            </p>
          </section>

          <section className="post-card post-side-card">
            <h2>Imagen destacada</h2>
            <div className={`post-image-preview is-${imageState}`}>
              {imageUrl ? (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt=""
                  onLoad={() => setImage({ url: imageUrl, state: 'ok' })}
                  onError={() => setImage({ url: imageUrl, state: 'error' })}
                />
              ) : null}
              {imageState === 'empty' ? (
                <span className="post-image-preview__placeholder">
                  <ImageIcon size={28} />
                  Pega abajo la dirección de la imagen
                </span>
              ) : null}
              {imageState === 'error' ? (
                <span className="post-image-preview__placeholder is-error">
                  <AlertTriangle size={26} />
                  Esta dirección no muestra ninguna imagen
                </span>
              ) : null}
            </div>
            <input
              id="post-image"
              aria-label="URL de la imagen destacada"
              placeholder="/imagenes/mi-foto.jpg o https://…"
              value={form.imageUrl ?? ''}
              onChange={(event) => update('imageUrl', event.target.value)}
            />
            {googleImage ? (
              <div className="post-notice">
                <AlertTriangle size={16} />
                <div>
                  <p>
                    Has pegado el enlace de <strong>Google Imágenes</strong>, no el de la imagen.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => update('imageUrl', googleImage)}
                  >
                    <Wand2 size={14} /> Usar la imagen real
                  </button>
                </div>
              </div>
            ) : googlePage ? (
              <div className="post-notice">
                <AlertTriangle size={16} />
                <p>
                  Es un enlace a una página de Google. En la imagen, usa clic derecho →{' '}
                  <strong>Copiar dirección de la imagen</strong>.
                </p>
              </div>
            ) : (
              <p className="post-field__hint">
                Mejor imágenes propias subidas a <code>/imagenes/</code>. Formato horizontal, mínimo
                1200 px de ancho.
              </p>
            )}
          </section>

          <section className="post-card post-side-card">
            <h2>Categoría</h2>
            <select
              id="post-category"
              aria-label="Categoría"
              value={form.categoryId ?? ''}
              onChange={(event) => update('categoryId', event.target.value || null)}
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </section>

          <section className="post-card post-side-card">
            <h2>Así se verá en el blog</h2>
            <article className="post-card-preview">
              <div className="post-card-preview__image">
                {imageState === 'ok' ? <img src={imageUrl} alt="" /> : <ImageIcon size={26} />}
                {categoryName ? <span>{categoryName}</span> : null}
              </div>
              <div className="post-card-preview__body">
                <small>{formatDate(form.publishedAt)}</small>
                <strong>{form.title || 'Título del artículo'}</strong>
                <p>{excerpt || 'Aquí aparecerá el extracto del artículo.'}</p>
              </div>
            </article>
          </section>

          <section className="post-card post-side-card">
            <div className="post-checklist__head">
              <h2>Antes de publicar</h2>
              <span>
                {checklistDone}/{checklist.length}
              </span>
            </div>
            <div className="post-checklist__bar" aria-hidden="true">
              <span style={{ width: `${(checklistDone / checklist.length) * 100}%` }} />
            </div>
            <ul className="post-checklist">
              {checklist.map((item) => (
                <li key={item.label} className={item.done ? 'is-done' : ''}>
                  {item.done ? <Check size={15} /> : <Circle size={15} />}
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </form>
  )
}
