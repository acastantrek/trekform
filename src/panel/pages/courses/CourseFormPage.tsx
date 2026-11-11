import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
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
  type ModuleInput,
} from '../../services/courses'
import { useConfirm } from '../../hooks/useConfirm'
import {
  emptyForm,
  fromDatetimeLocal,
  toCourseInput,
  toDatetimeLocal,
  toFormState,
  type CourseFormState,
  type ExtraSectionDraft,
  type TypologyCardDraft,
} from './courseFormState'
import type { Course, CourseAudience, CourseCategory, CourseModule } from '../../types'

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      {description && <p className="form-section-description">{description}</p>}
      {children}
    </fieldset>
  )
}

const emptyModuleForm = { title: '', content: '', durationMinutes: '' as number | '', position: 0 }

export function CourseFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseFormState>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [modules, setModules] = useState<CourseModule[]>([])
  const [moduleForm, setModuleForm] = useState(emptyModuleForm)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  function setField<K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) {
    setSaved(false)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateTypologyCard(index: number, patch: Partial<TypologyCardDraft>) {
    setField(
      'typologyCards',
      form.typologyCards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, ...patch } : card,
      ),
    )
  }

  function updateExtraSection(index: number, patch: Partial<ExtraSectionDraft>) {
    setField(
      'extraSections',
      form.extraSections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    )
  }

  function toggleExtraCategory(categoryId: string, checked: boolean) {
    setField(
      'extraCategoryIds',
      checked
        ? [...form.extraCategoryIds, categoryId]
        : form.extraCategoryIds.filter((item) => item !== categoryId),
    )
  }

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Error al cargar categorías.'),
      )
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
        setForm(toFormState(data))
        return loadModules(id)
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Error al cargar el curso.'),
      )
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const input = toCourseInput(form)
      if (id) {
        await updateCourse(id, input)
      } else {
        const newId = await createCourse(input)
        navigate(`/panel/cursos/${newId}`, { replace: true })
        return
      }
      const refreshed = await getCourse(id)
      if (refreshed) {
        setCourse(refreshed)
        setForm(toFormState(refreshed))
      }
      setSaved(true)
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
      durationMinutes:
        moduleForm.durationMinutes === '' ? null : Number(moduleForm.durationMinutes),
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
    if (
      !(await confirm(`¿Eliminar el módulo "${module.title}"? Esta acción no se puede deshacer.`))
    )
      return
    try {
      await deleteModule(module.id)
      await loadModules(id)
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'No se pudo eliminar el módulo.')
    }
  }

  if (loading) return <p>Cargando…</p>

  const extraCategoryOptions = categories.filter((category) => category.id !== form.categoryId)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEditing ? (course?.title ?? 'Editar curso') : 'Nuevo curso'}</h1>
          <p>Completa la información que se mostrará en el sitio público.</p>
        </div>
      </div>

      <form className="form form-wide" onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <FormSection title="Datos básicos">
          <div className="form-grid">
            <FormField label="Título" htmlFor="course-title">
              <input
                id="course-title"
                required
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value
                  setSaved(false)
                  setForm((prev) => ({
                    ...prev,
                    title,
                    slug: slugTouched ? prev.slug : slugify(title),
                  }))
                }}
              />
            </FormField>
            <FormField
              label="Título corto"
              htmlFor="course-short-title"
              hint="Se usa en la ficha del curso. Si se deja vacío, se usa el título."
            >
              <input
                id="course-short-title"
                value={form.shortTitle ?? ''}
                onChange={(event) => setField('shortTitle', event.target.value)}
              />
            </FormField>
          </div>

          <div className="form-grid">
            <FormField label="Slug" htmlFor="course-slug" hint="Parte final de la URL del curso.">
              <input
                id="course-slug"
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  setField('slug', event.target.value)
                }}
              />
            </FormField>
            <FormField label="Categoría principal" htmlFor="course-category">
              <select
                id="course-category"
                required
                value={form.categoryId}
                onChange={(event) => setField('categoryId', event.target.value)}
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
          </div>

          <FormField
            label="Categorías adicionales"
            htmlFor="course-extra-categories"
            hint="El curso también aparecerá al filtrar el catálogo por estas categorías."
          >
            <div id="course-extra-categories" className="checkbox-list">
              {extraCategoryOptions.map((category) => (
                <label key={category.id} className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.extraCategoryIds.includes(category.id)}
                    onChange={(event) => toggleExtraCategory(category.id, event.target.checked)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </FormField>

          <div className="form-grid">
            <FormField label="Estado" htmlFor="course-status">
              <select
                id="course-status"
                value={form.status}
                onChange={(event) => setField('status', event.target.value as Course['status'])}
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
                onChange={(event) => setField('publishedAt', fromDatetimeLocal(event.target.value))}
              />
            </FormField>
          </div>

          <div className="form-grid">
            <FormField
              label="Orden en el catálogo"
              htmlFor="course-sort-order"
              hint="Los números más bajos salen antes."
            >
              <input
                id="course-sort-order"
                type="number"
                step="1"
                required
                value={form.sortOrder}
                onChange={(event) => setField('sortOrder', Number(event.target.value))}
              />
            </FormField>
            <FormField label="Destacado" htmlFor="course-featured">
              <div className="checkbox-field">
                <input
                  id="course-featured"
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setField('isFeatured', event.target.checked)}
                />
                <span>Mostrar en la portada y marcar como "Más demandado"</span>
              </div>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Formato">
          <div className="form-grid">
            <FormField label="Modalidad" htmlFor="course-modality">
              <select
                id="course-modality"
                value={form.modality}
                onChange={(event) => setField('modality', event.target.value as Course['modality'])}
              >
                <option value="presential">Presencial</option>
                <option value="online">Online</option>
                <option value="hybrid">Semipresencial</option>
              </select>
            </FormField>
            <FormField
              label="Texto de la modalidad"
              htmlFor="course-modality-label"
              hint="Opcional. Sustituye a la modalidad en la ficha (p. ej. «A distancia»)."
            >
              <input
                id="course-modality-label"
                value={form.modalityLabel ?? ''}
                onChange={(event) => setField('modalityLabel', event.target.value)}
              />
            </FormField>
          </div>

          <div className="form-grid">
            <FormField label="Duración (horas)" htmlFor="course-duration">
              <input
                id="course-duration"
                type="number"
                min="0.5"
                step="0.5"
                value={form.durationHours ?? ''}
                onChange={(event) =>
                  setField(
                    'durationHours',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </FormField>
            <FormField
              label="Texto de la duración"
              htmlFor="course-duration-label"
              hint="Opcional. Sustituye a la duración en la ficha (p. ej. «8 horas + práctica»)."
            >
              <input
                id="course-duration-label"
                value={form.durationLabel ?? ''}
                onChange={(event) => setField('durationLabel', event.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="Metodología"
            htmlFor="course-methodology"
            hint="Si se deja vacío, la ficha muestra «Teórico-práctica»."
          >
            <input
              id="course-methodology"
              list="course-methodology-options"
              value={form.methodology ?? ''}
              onChange={(event) => setField('methodology', event.target.value)}
            />
            <datalist id="course-methodology-options">
              <option value="Teórico-práctica" />
              <option value="Teórico" />
              <option value="Plataforma online" />
            </datalist>
          </FormField>
        </FormSection>

        <FormSection title="Textos">
          <FormField
            label="Extracto"
            htmlFor="course-excerpt"
            hint="Resumen corto para las tarjetas del catálogo."
          >
            <textarea
              id="course-excerpt"
              value={form.excerpt ?? ''}
              onChange={(event) => setField('excerpt', event.target.value)}
            />
          </FormField>

          <FormField
            label="Texto de cabecera"
            htmlFor="course-hero-text"
            hint="Aparece bajo el título en la ficha del curso. Si se deja vacío, se usa el extracto."
          >
            <textarea
              id="course-hero-text"
              value={form.heroText ?? ''}
              onChange={(event) => setField('heroText', event.target.value)}
            />
          </FormField>

          <FormField
            label="Descripción SEO"
            htmlFor="course-seo-description"
            hint="Descripción para buscadores. Recomendado: menos de 160 caracteres."
          >
            <textarea
              id="course-seo-description"
              value={form.seoDescription ?? ''}
              onChange={(event) => setField('seoDescription', event.target.value)}
            />
          </FormField>

          <FormField label="Descripción" htmlFor="course-description">
            <textarea
              id="course-description"
              value={form.description ?? ''}
              onChange={(event) => setField('description', event.target.value)}
            />
          </FormField>

          <FormField
            label="Objetivos"
            htmlFor="course-objectives"
            hint="Separa cada objetivo con una línea en blanco."
          >
            <textarea
              id="course-objectives"
              rows={6}
              value={form.objectives ?? ''}
              onChange={(event) => setField('objectives', event.target.value)}
            />
          </FormField>
        </FormSection>

        <FormSection title="Público">
          <div className="form-grid">
            <FormField label="Dirigido a" htmlFor="course-audience">
              <select
                id="course-audience"
                value={form.audience}
                onChange={(event) => setField('audience', event.target.value as CourseAudience)}
              >
                <option value="both">Particulares y empresas</option>
                <option value="individuals">Particulares</option>
                <option value="companies">Empresas</option>
              </select>
            </FormField>
            <FormField
              label="Texto del público"
              htmlFor="course-audience-label"
              hint="Opcional. Completa «Pensado para…» en la ficha."
            >
              <input
                id="course-audience-label"
                value={form.audienceLabel ?? ''}
                onChange={(event) => setField('audienceLabel', event.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="A quién va dirigido"
            htmlFor="course-audience-description"
            hint="Separa cada párrafo con una línea en blanco. Si se deja vacío, la sección no aparece."
          >
            <textarea
              id="course-audience-description"
              rows={5}
              value={form.audienceDescription ?? ''}
              onChange={(event) => setField('audienceDescription', event.target.value)}
            />
          </FormField>
        </FormSection>

        <FormSection title="Certificación">
          <div className="form-grid">
            <FormField label="Certificación oficial" htmlFor="course-official">
              <div className="checkbox-field">
                <input
                  id="course-official"
                  type="checkbox"
                  checked={form.isOfficialCertification}
                  onChange={(event) => setField('isOfficialCertification', event.target.checked)}
                />
                <span>Carnet o diploma homologado</span>
              </div>
            </FormField>
            <FormField label="FUNDAE" htmlFor="course-fundae">
              <div className="checkbox-field">
                <input
                  id="course-fundae"
                  type="checkbox"
                  checked={form.isFundaeEligible}
                  onChange={(event) => setField('isFundaeEligible', event.target.checked)}
                />
                <span>Bonificable por FUNDAE</span>
              </div>
            </FormField>
          </div>

          <FormField
            label="Título de la certificación"
            htmlFor="course-accreditation-title"
            hint="Se muestra en la ficha, el catálogo y las inscripciones (p. ej. «Carnet y diploma homologado»)."
          >
            <input
              id="course-accreditation-title"
              value={form.accreditationTitle ?? ''}
              onChange={(event) => setField('accreditationTitle', event.target.value)}
            />
          </FormField>

          <div className="form-grid">
            <FormField
              label="Acreditaciones incluidas"
              htmlFor="course-accreditation-items"
              hint="Una por línea."
            >
              <textarea
                id="course-accreditation-items"
                rows={5}
                value={form.accreditationItems ?? ''}
                onChange={(event) => setField('accreditationItems', event.target.value)}
              />
            </FormField>
            <FormField label="Ventajas" htmlFor="course-benefits-items" hint="Una por línea.">
              <textarea
                id="course-benefits-items"
                rows={5}
                value={form.benefitsItems ?? ''}
                onChange={(event) => setField('benefitsItems', event.target.value)}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Multimedia">
          <FormField
            label="URL de imagen"
            htmlFor="course-image"
            hint="Ruta del sitio (p. ej. /cursos/mi-curso.jpg) o URL completa."
          >
            <input
              id="course-image"
              value={form.imageUrl ?? ''}
              onChange={(event) => setField('imageUrl', event.target.value)}
            />
          </FormField>
          <div className="form-grid">
            <FormField
              label="URL de la ficha PDF"
              htmlFor="course-brochure"
              hint="Si se deja vacío, la ficha no muestra el enlace de descarga."
            >
              <input
                id="course-brochure"
                value={form.brochureUrl ?? ''}
                onChange={(event) => setField('brochureUrl', event.target.value)}
              />
            </FormField>
            <FormField
              label="URL del vídeo de YouTube"
              htmlFor="course-video"
              hint="Si se deja vacío, la ficha no muestra la sección de vídeo."
            >
              <input
                id="course-video"
                type="url"
                value={form.videoUrl ?? ''}
                onChange={(event) => setField('videoUrl', event.target.value)}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Tipología"
          description="Tarjetas «Curso Abierto / In-Company» de la ficha. Sin personalizar, los cursos presenciales y semipresenciales muestran las tarjetas estándar y los online no muestran ninguna."
        >
          <FormField
            label="Personalizar"
            htmlFor="course-custom-typology"
            hint="Personalizada y sin tarjetas, la sección no aparece en la ficha."
          >
            <div className="checkbox-field">
              <input
                id="course-custom-typology"
                type="checkbox"
                checked={form.customTypology}
                onChange={(event) => setField('customTypology', event.target.checked)}
              />
              <span>Usar tarjetas propias para este curso</span>
            </div>
          </FormField>

          {form.customTypology && (
            <>
              {form.typologyCards.map((card, index) => (
                <div className="form-repeater-item" key={index}>
                  <div className="form-repeater-header">
                    <strong>Tarjeta {index + 1}</strong>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setField(
                          'typologyCards',
                          form.typologyCards.filter((_, cardIndex) => cardIndex !== index),
                        )
                      }
                    >
                      <Trash2 size={14} /> Quitar
                    </button>
                  </div>
                  <FormField label="Título" htmlFor={`typology-title-${index}`}>
                    <input
                      id={`typology-title-${index}`}
                      value={card.title}
                      onChange={(event) => updateTypologyCard(index, { title: event.target.value })}
                    />
                  </FormField>
                  <FormField
                    label="Texto"
                    htmlFor={`typology-lines-${index}`}
                    hint="Una idea por línea."
                  >
                    <textarea
                      id={`typology-lines-${index}`}
                      value={card.lines}
                      onChange={(event) => updateTypologyCard(index, { lines: event.target.value })}
                    />
                  </FormField>
                </div>
              ))}
              <div className="form-actions" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setField('typologyCards', [...form.typologyCards, { title: '', lines: '' }])
                  }
                >
                  <Plus size={14} /> Añadir tarjeta
                </button>
              </div>
              <FormField
                label="Nota bajo las tarjetas"
                htmlFor="course-typology-note"
                hint="Opcional. Separa cada párrafo con una línea en blanco."
              >
                <textarea
                  id="course-typology-note"
                  value={form.typologyNote}
                  onChange={(event) => setField('typologyNote', event.target.value)}
                />
              </FormField>
            </>
          )}
        </FormSection>

        <FormSection
          title="Secciones adicionales"
          description="Bloques extra de la ficha, debajo de los objetivos (p. ej. «Cursos específicos disponibles»)."
        >
          {form.extraSections.map((section, index) => (
            <div className="form-repeater-item" key={index}>
              <div className="form-repeater-header">
                <strong>Sección {index + 1}</strong>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    setField(
                      'extraSections',
                      form.extraSections.filter((_, sectionIndex) => sectionIndex !== index),
                    )
                  }
                >
                  <Trash2 size={14} /> Quitar
                </button>
              </div>
              <FormField label="Título" htmlFor={`extra-title-${index}`}>
                <input
                  id={`extra-title-${index}`}
                  required
                  value={section.title}
                  onChange={(event) => updateExtraSection(index, { title: event.target.value })}
                />
              </FormField>
              <FormField
                label="Lista"
                htmlFor={`extra-items-${index}`}
                hint="Un elemento por línea."
              >
                <textarea
                  id={`extra-items-${index}`}
                  value={section.items}
                  onChange={(event) => updateExtraSection(index, { items: event.target.value })}
                />
              </FormField>
              <FormField
                label="Párrafos"
                htmlFor={`extra-paragraphs-${index}`}
                hint="Separa cada párrafo con una línea en blanco."
              >
                <textarea
                  id={`extra-paragraphs-${index}`}
                  value={section.paragraphs}
                  onChange={(event) =>
                    updateExtraSection(index, { paragraphs: event.target.value })
                  }
                />
              </FormField>
            </div>
          ))}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setField('extraSections', [
                  ...form.extraSections,
                  { title: '', items: '', paragraphs: '' },
                ])
              }
            >
              <Plus size={14} /> Añadir sección
            </button>
          </div>
        </FormSection>

        {saved && <div className="alert alert-success">Cambios guardados.</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear curso'}
          </button>
        </div>
      </form>

      {isEditing && id && (
        <section>
          <h2>Módulos del temario</h2>

          <form
            className="form form-wide"
            onSubmit={handleModuleSubmit}
            style={{ marginBottom: 20 }}
          >
            {moduleError && <div className="alert alert-error">{moduleError}</div>}
            <div className="form-grid">
              <FormField label="Título del módulo" htmlFor="module-title">
                <input
                  id="module-title"
                  required
                  value={moduleForm.title}
                  onChange={(event) =>
                    setModuleForm((prev) => ({ ...prev, title: event.target.value }))
                  }
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
                onChange={(event) =>
                  setModuleForm((prev) => ({ ...prev, content: event.target.value }))
                }
              />
            </FormField>
            <FormField
              label="Posición"
              htmlFor="module-position"
              hint="Orden dentro del temario, empezando en 0."
            >
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
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={resetModuleForm}
                >
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
              {
                header: 'Duración',
                render: (row) => (row.durationMinutes ? `${row.durationMinutes} min` : '—'),
              },
              {
                header: 'Acciones',
                className: 'col-actions',
                render: (row) => (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => startEditModule(row)}
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteModule(row)}
                    >
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
