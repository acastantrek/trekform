import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Course, CourseCategory, CourseModule } from '../types'

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

interface CourseRow {
  id: string
  category_id: string
  title: string
  slug: string
  excerpt: string | null
  description: string | null
  modality: Course['modality']
  duration_hours: number | null
  image_url: string | null
  is_featured: boolean
  status: Course['status']
  published_at: string | null
  course_categories: { name: string } | null
}

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.course_categories?.name ?? 'Sin categoría',
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    description: row.description,
    modality: row.modality,
    durationHours: row.duration_hours,
    imageUrl: row.image_url,
    isFeatured: row.is_featured,
    status: row.status,
    publishedAt: row.published_at,
  }
}

const courseColumns =
  'id, category_id, title, slug, excerpt, description, modality, duration_hours, image_url, is_featured, status, published_at, course_categories!courses_category_id_fkey(name)'

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
  const { data, error } = await client.from('courses').select(courseColumns).eq('id', id).maybeSingle()

  if (error) throw new Error(`No se pudo cargar el curso: ${error.message}`)
  return data ? mapCourse(data as unknown as CourseRow) : null
}

export interface CourseInput {
  categoryId: string
  title: string
  slug: string
  excerpt: string | null
  description: string | null
  modality: Course['modality']
  durationHours: number | null
  imageUrl: string | null
  isFeatured: boolean
  status: Course['status']
  publishedAt: string | null
}

function toCourseRecord(input: CourseInput) {
  return {
    category_id: input.categoryId,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    description: input.description,
    modality: input.modality,
    duration_hours: input.durationHours,
    image_url: input.imageUrl,
    is_featured: input.isFeatured,
    status: input.status,
    published_at: input.publishedAt,
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
  return (data as { id: string }).id
}

export async function updateCourse(id: string, input: CourseInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('courses').update(toCourseRecord(input)).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el curso: ${error.message}`)
}

export async function deleteCourse(id: string): Promise<void> {
  const client = requireClient()
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
    duration_minutes: input.durationMinutes,
    position: input.position,
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
      duration_minutes: input.durationMinutes,
      position: input.position,
    })
    .eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el módulo: ${error.message}`)
}

export async function deleteModule(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_modules').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el módulo: ${error.message}`)
}
