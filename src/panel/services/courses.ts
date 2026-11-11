import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type {
  Course,
  CourseAudience,
  CourseCategory,
  CourseExtraSection,
  CourseModule,
  CourseTypology,
} from '../types'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
}

function mapCategory(row: CategoryRow): CourseCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export async function listCategories(): Promise<CourseCategory[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('course_categories')
    .select('id, name, slug, description, sort_order, is_active')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`)
  return (data as CategoryRow[]).map(mapCategory)
}

export interface CategoryInput {
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
}

export async function createCategory(input: CategoryInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_categories').insert({
    name: input.name,
    slug: input.slug,
    description: input.description,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  })
  if (error) throw new Error(`No se pudo crear la categoría: ${error.message}`)
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('course_categories')
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq('id', id)
  if (error) throw new Error(`No se pudo actualizar la categoría: ${error.message}`)
}

export async function deleteCategory(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_categories').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar la categoría: ${error.message}`)
}

export interface CourseRow {
  id: string
  category_id: string
  title: string
  short_title: string | null
  slug: string
  excerpt: string | null
  hero_text: string | null
  seo_description: string | null
  description: string | null
  objectives: string | null
  audience: CourseAudience | null
  audience_label: string | null
  audience_description: string | null
  methodology: string | null
  modality: Course['modality']
  modality_label: string | null
  duration_hours: number | string | null
  duration_label: string | null
  image_url: string | null
  featured_image_url: string | null
  brochure_url: string | null
  video_url: string | null
  is_official_certification: boolean
  is_fundae_eligible: boolean
  accreditation_title: string | null
  accreditation_items: string | null
  benefits_items: string | null
  typology: CourseTypology | null
  extra_sections: CourseExtraSection[] | null
  is_featured: boolean
  sort_order: number
  status: Course['status']
  published_at: string | null
  course_categories: { name: string } | null
  course_category_assignments: Array<{ category_id: string }>
}

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.course_categories?.name ?? 'Sin categoría',
    extraCategoryIds: row.course_category_assignments
      .map((assignment) => assignment.category_id)
      .filter((categoryId) => categoryId !== row.category_id),
    title: row.title,
    shortTitle: row.short_title,
    slug: row.slug,
    excerpt: row.excerpt,
    heroText: row.hero_text,
    seoDescription: row.seo_description,
    description: row.description,
    objectives: row.objectives,
    audience: row.audience ?? 'both',
    audienceLabel: row.audience_label,
    audienceDescription: row.audience_description,
    methodology: row.methodology,
    modality: row.modality,
    modalityLabel: row.modality_label,
    durationHours: row.duration_hours === null ? null : Number(row.duration_hours),
    durationLabel: row.duration_label,
    // The public site reads featured_image_url (catalog, course page) and image_url
    // (registrations); the panel keeps both columns in sync.
    imageUrl: row.featured_image_url ?? row.image_url,
    brochureUrl: row.brochure_url,
    videoUrl: row.video_url,
    isOfficialCertification: row.is_official_certification,
    isFundaeEligible: row.is_fundae_eligible,
    accreditationTitle: row.accreditation_title,
    accreditationItems: row.accreditation_items,
    benefitsItems: row.benefits_items,
    typology: row.typology,
    extraSections: row.extra_sections ?? [],
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    status: row.status,
    publishedAt: row.published_at,
  }
}

const courseColumns =
  'id, category_id, title, short_title, slug, excerpt, hero_text, seo_description, description, objectives, audience, audience_label, audience_description, methodology, modality, modality_label, duration_hours, duration_label, image_url, featured_image_url, brochure_url, video_url, is_official_certification, is_fundae_eligible, accreditation_title, accreditation_items, benefits_items, typology, extra_sections, is_featured, sort_order, status, published_at, course_categories!courses_category_id_fkey(name), course_category_assignments(category_id)'

export async function listCourses(): Promise<Course[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('courses')
    .select(courseColumns)
    .order('title', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los cursos: ${error.message}`)
  return (data as unknown as CourseRow[]).map(mapCourse)
}

export async function getCourse(id: string): Promise<Course | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('courses')
    .select(courseColumns)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`No se pudo cargar el curso: ${error.message}`)
  return data ? mapCourse(data as unknown as CourseRow) : null
}

export type CourseInput = Omit<Course, 'id' | 'categoryName'>

function emptyToNull(value: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function toCourseRecord(input: CourseInput) {
  const imageUrl = emptyToNull(input.imageUrl)

  return {
    category_id: input.categoryId,
    title: input.title.trim(),
    short_title: emptyToNull(input.shortTitle),
    slug: input.slug.trim(),
    excerpt: emptyToNull(input.excerpt),
    hero_text: emptyToNull(input.heroText),
    seo_description: emptyToNull(input.seoDescription),
    description: emptyToNull(input.description),
    objectives: emptyToNull(input.objectives),
    audience: input.audience,
    audience_label: emptyToNull(input.audienceLabel),
    audience_description: emptyToNull(input.audienceDescription),
    methodology: emptyToNull(input.methodology),
    modality: input.modality,
    modality_label: emptyToNull(input.modalityLabel),
    // The catalog and registrations read duration_hours; the course page reads duration_minutes.
    duration_hours: input.durationHours,
    duration_minutes: input.durationHours === null ? null : Math.round(input.durationHours * 60),
    duration_label: emptyToNull(input.durationLabel),
    image_url: imageUrl,
    featured_image_url: imageUrl,
    brochure_url: emptyToNull(input.brochureUrl),
    video_url: emptyToNull(input.videoUrl),
    is_official_certification: input.isOfficialCertification,
    is_fundae_eligible: input.isFundaeEligible,
    accreditation_title: emptyToNull(input.accreditationTitle),
    accreditation_items: emptyToNull(input.accreditationItems),
    benefits_items: emptyToNull(input.benefitsItems),
    typology: input.typology,
    extra_sections: input.extraSections.length ? input.extraSections : null,
    is_featured: input.isFeatured,
    sort_order: input.sortOrder,
    status: input.status,
    published_at: input.publishedAt,
  }
}

// Existing data also lists the primary category in course_category_assignments, so it is kept
// there. Only rows that actually change are deleted or inserted.
async function saveCategoryAssignments(courseId: string, input: CourseInput) {
  const client = requireClient()
  const wanted = new Set([input.categoryId, ...input.extraCategoryIds])
  const failure = (message: string) =>
    new Error(`No se pudieron guardar las categorías adicionales: ${message}`)

  const { data, error: readError } = await client
    .from('course_category_assignments')
    .select('category_id')
    .eq('course_id', courseId)
  if (readError) throw failure(readError.message)

  const current = new Set((data as Array<{ category_id: string }>).map((row) => row.category_id))
  const toRemove = [...current].filter((categoryId) => !wanted.has(categoryId))
  const toAdd = [...wanted].filter((categoryId) => !current.has(categoryId))

  if (toRemove.length) {
    const { error } = await client
      .from('course_category_assignments')
      .delete()
      .eq('course_id', courseId)
      .in('category_id', toRemove)
    if (error) throw failure(error.message)
  }

  if (toAdd.length) {
    const { error } = await client
      .from('course_category_assignments')
      .insert(toAdd.map((categoryId) => ({ course_id: courseId, category_id: categoryId })))
    if (error) throw failure(error.message)
  }
}

export async function createCourse(input: CourseInput): Promise<string> {
  const client = requireClient()
  const { data, error } = await client
    .from('courses')
    .insert(toCourseRecord(input))
    .select('id')
    .single()
  if (error) throw new Error(`No se pudo crear el curso: ${error.message}`)

  const id = (data as { id: string }).id
  await saveCategoryAssignments(id, input)
  return id
}

export async function updateCourse(id: string, input: CourseInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('courses').update(toCourseRecord(input)).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el curso: ${error.message}`)
  await saveCategoryAssignments(id, input)
}

export async function deleteCourse(id: string): Promise<void> {
  const client = requireClient()

  // course_sessions.course_id is ON DELETE RESTRICT (to protect sessions that have real
  // enrollments), so a course's sessions must be removed first. This delete itself fails
  // with a clear FK error if any of those sessions still has enrollments.
  const { error: sessionsError } = await client.from('course_sessions').delete().eq('course_id', id)
  if (sessionsError) throw new Error(`No se pudo eliminar el curso: ${sessionsError.message}`)

  const { error } = await client.from('courses').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el curso: ${error.message}`)
}

interface ModuleRow {
  id: string
  course_id: string
  title: string
  content: string | null
  duration_minutes: number | null
  position: number
}

function mapModule(row: ModuleRow): CourseModule {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    content: row.content,
    durationMinutes: row.duration_minutes,
    position: row.position,
  }
}

export async function listModules(courseId: string): Promise<CourseModule[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('course_modules')
    .select('id, course_id, title, content, duration_minutes, position')
    .eq('course_id', courseId)
    .order('position', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los módulos: ${error.message}`)
  return (data as ModuleRow[]).map(mapModule)
}

export interface ModuleInput {
  courseId: string
  title: string
  content: string | null
  durationMinutes: number | null
  position: number
}

export async function createModule(input: ModuleInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_modules').insert({
    course_id: input.courseId,
    title: input.title,
    content: input.content,
    description: input.content,
    duration_minutes: input.durationMinutes,
    position: input.position,
    sort_order: input.position,
  })
  if (error) throw new Error(`No se pudo crear el módulo: ${error.message}`)
}

export async function updateModule(id: string, input: ModuleInput): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('course_modules')
    .update({
      title: input.title,
      content: input.content,
      description: input.content,
      duration_minutes: input.durationMinutes,
      position: input.position,
      sort_order: input.position,
    })
    .eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el módulo: ${error.message}`)
}

export async function deleteModule(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_modules').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el módulo: ${error.message}`)
}
