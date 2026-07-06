import { supabase } from '../lib/supabase'
import type { Course } from '../types/course'

interface CourseRow {
  id: string
  slug: string
  title: string
  image_url: string | null
  duration_hours: number | null
  excerpt: string | null
  is_featured: boolean
  course_categories: { name: string } | null
  course_category_assignments: Array<{ course_categories: { name: string } | null }>
}

const courseColumns =
  'id, slug, title, image_url, duration_hours, excerpt, is_featured, course_categories!courses_category_id_fkey(name), course_category_assignments(course_categories(name))'

const fallbackImage =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85'

function mapCourse(row: CourseRow): Course {
  const primaryCategory = row.course_categories?.name ?? 'Formación'
  const categories = [
    ...new Set([
      primaryCategory,
      ...row.course_category_assignments.flatMap((assignment) =>
        assignment.course_categories?.name ? [assignment.course_categories.name] : [],
      ),
    ]),
  ]

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: primaryCategory,
    categories,
    image: row.image_url ?? fallbackImage,
    place: 'Toda España',
    duration: row.duration_hours ? `${row.duration_hours} horas` : 'Consultar',
    color: '#d9ff43',
    description: row.excerpt ?? '',
    featured: row.is_featured,
    order: 0,
  }
}

export async function getCourses(options: { featured?: boolean } = {}): Promise<Course[]> {
  if (!supabase) {
    throw new Error('Falta configurar la conexión con Supabase.')
  }

  let query = supabase
    .from('courses')
    .select(courseColumns)
    .order('is_featured', { ascending: false })
    .order('title', { ascending: true })

  if (options.featured) query = query.eq('is_featured', true)

  const { data, error } = await query
  if (error) throw new Error(`No se pudieron cargar los cursos: ${error.message}`)

  return (data as CourseRow[]).map(mapCourse)
}

export interface CourseModule {
  id: string
  title: string
  content: string
  durationMinutes: number | null
  position: number
}

export interface CourseSession {
  id: string
  slug: string
  startsAt: string
  endsAt: string
  capacity: number
  priceCents: number
  status: 'open' | 'full' | 'completed'
  venue: string
  city: string
  province: string
}

export interface CourseDetail {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  image: string
  modality: string
  durationHours: number | null
  categories: string[]
  modules: CourseModule[]
  sessions: CourseSession[]
}

interface CourseDetailRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  description: string | null
  image_url: string | null
  modality: string
  duration_hours: number | null
  course_categories: { name: string } | null
  course_category_assignments: Array<{ course_categories: { name: string } | null }>
  course_modules: Array<{
    id: string
    title: string
    content: string | null
    duration_minutes: number | null
    position: number
  }>
  course_sessions: Array<{
    id: string
    slug: string
    starts_at: string
    ends_at: string
    capacity: number
    price_cents: number
    status: 'open' | 'full' | 'completed'
    venues: {
      name: string
      address: string
      locations: { city: string; province: string } | null
    } | null
  }>
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')

  const { data, error } = await supabase
    .from('courses')
    .select(
      'id, slug, title, excerpt, description, image_url, modality, duration_hours, course_categories!courses_category_id_fkey(name), course_category_assignments(course_categories(name)), course_modules(id, title, content, duration_minutes, position), course_sessions(id, slug, starts_at, ends_at, capacity, price_cents, status, venues(name, address, locations(city, province)))',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(`No se pudo cargar el curso: ${error.message}`)
  if (!data) return null

  const row = data as CourseDetailRow
  const primaryCategory = row.course_categories?.name ?? 'Formación'
  const categories = [
    ...new Set([
      primaryCategory,
      ...row.course_category_assignments.flatMap((assignment) =>
        assignment.course_categories?.name ? [assignment.course_categories.name] : [],
      ),
    ]),
  ]

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? 'Formación profesional para particulares y empresas.',
    description:
      row.description ??
      'Curso orientado a adquirir conocimientos prácticos y trabajar con seguridad.',
    image: row.image_url ?? fallbackImage,
    modality: row.modality,
    durationHours: row.duration_hours,
    categories,
    modules: row.course_modules
      .map((module) => ({
        id: module.id,
        title: module.title,
        content: module.content ?? '',
        durationMinutes: module.duration_minutes,
        position: module.position,
      }))
      .sort((a, b) => a.position - b.position),
    sessions: row.course_sessions
      .filter((session) => session.status !== 'completed' && new Date(session.ends_at) >= new Date())
      .map((session) => ({
        id: session.id,
        slug: session.slug,
        startsAt: session.starts_at,
        endsAt: session.ends_at,
        capacity: session.capacity,
        priceCents: session.price_cents,
        status: session.status,
        venue: session.venues?.name ?? 'Formación online',
        city: session.venues?.locations?.city ?? 'Online',
        province: session.venues?.locations?.province ?? '',
      }))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
  }
}
