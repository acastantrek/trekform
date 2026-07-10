import { supabase } from '../lib/supabase'
import type { Course } from '../types/course'

interface CourseRow {
  id: string
  slug: string
  title: string
  featured_image_url: string | null
  duration_minutes: number | null
  excerpt: string | null
  is_featured: boolean
  course_categories: { name: string } | null
  course_category_assignments: Array<{ course_categories: { name: string } | null }>
}

const courseColumns =
  'id, slug, title, featured_image_url, duration_minutes, excerpt, is_featured, course_categories!courses_category_id_fkey(name), course_category_assignments(course_categories(name))'

const fallbackImage =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85'

function formatDuration(minutes: number | null) {
  if (!minutes) return 'Consultar'
  if (minutes % 60 === 0) return `${minutes / 60} horas`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} min`

  return `${hours} h ${remainder} min`
}

function collectCategories(row: {
  course_categories: { name: string } | null
  course_category_assignments: Array<{ course_categories: { name: string } | null }>
}) {
  const primaryCategory = row.course_categories?.name ?? 'Formación'
  const categories = [
    ...new Set([
      primaryCategory,
      ...row.course_category_assignments.flatMap((assignment) =>
        assignment.course_categories?.name ? [assignment.course_categories.name] : [],
      ),
    ]),
  ]

  return { primaryCategory, categories }
}

function mapCourse(row: CourseRow): Course {
  const { primaryCategory, categories } = collectCategories(row)

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: primaryCategory,
    categories,
    image: row.featured_image_url ?? fallbackImage,
    place: 'Toda España',
    duration: formatDuration(row.duration_minutes),
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

  const client = supabase as any
  let query = client
    .from('courses')
    .select(courseColumns)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true })

  if (options.featured) query = query.eq('is_featured', true)

  const result = await query
  if (result.error) {
    throw new Error(`No se pudieron cargar los cursos: ${result.error.message}`)
  }

  return (result.data as CourseRow[]).map(mapCourse)
}

export interface CourseModule {
  id: string
  title: string
  description: string
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
  shortTitle: string
  excerpt: string
  heroText: string
  description: string
  objectives: string
  audienceDescription: string
  audience: 'individuals' | 'companies' | 'both'
  image: string
  modality: string
  methodology: string
  durationMinutes: number | null
  brochureUrl: string
  certificationName: string
  isOfficialCertification: boolean
  isFundaeEligible: boolean
  sidebarCertificationTitle: string
  sidebarCertificationText: string
  sidebarQualityTitle: string
  sidebarQualityText: string
  sidebarFundaeTitle: string
  sidebarFundaeText: string
  categories: string[]
  modules: CourseModule[]
  sessions: CourseSession[]
}

interface CourseDetailRow {
  id: string
  slug: string
  title: string
  short_title: string | null
  excerpt: string | null
  hero_text: string | null
  description: string | null
  objectives: string | null
  audience_description: string | null
  audience: 'individuals' | 'companies' | 'both'
  featured_image_url: string | null
  modality: string
  methodology: string | null
  duration_minutes: number | null
  brochure_url: string | null
  certification_name: string | null
  is_official_certification: boolean
  is_fundae_eligible: boolean
  sidebar_certification_title: string | null
  sidebar_certification_text: string | null
  sidebar_quality_title: string | null
  sidebar_quality_text: string | null
  sidebar_fundae_title: string | null
  sidebar_fundae_text: string | null
  course_categories: { name: string } | null
  course_category_assignments: Array<{ course_categories: { name: string } | null }>
  course_modules: Array<{
    id: string
    title: string
    description: string | null
    duration_minutes: number | null
    sort_order: number
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

function mapSessions(sessions: CourseDetailRow['course_sessions']) {
  return sessions
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
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

function mapCourseDetail(row: CourseDetailRow): CourseDetail {
  const { categories } = collectCategories(row)

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title ?? row.title,
    excerpt: row.excerpt ?? 'Formación profesional para particulares y empresas.',
    heroText: row.hero_text ?? row.excerpt ?? '',
    description:
      row.description ?? 'Curso orientado a adquirir conocimientos prácticos y trabajar con seguridad.',
    objectives: row.objectives ?? '',
    audienceDescription: row.audience_description ?? '',
    audience: row.audience,
    image: row.featured_image_url ?? fallbackImage,
    modality: row.modality,
    methodology: row.methodology ?? '',
    durationMinutes: row.duration_minutes,
    brochureUrl: row.brochure_url ?? '',
    certificationName: row.certification_name ?? 'Diploma acreditativo Trekform',
    isOfficialCertification: row.is_official_certification,
    isFundaeEligible: row.is_fundae_eligible,
    sidebarCertificationTitle: row.sidebar_certification_title ?? 'Certificación oficial',
    sidebarCertificationText: row.sidebar_certification_text ?? '',
    sidebarQualityTitle: row.sidebar_quality_title ?? 'Calidad garantizada',
    sidebarQualityText: row.sidebar_quality_text ?? '',
    sidebarFundaeTitle: row.sidebar_fundae_title ?? 'Bonificaciones',
    sidebarFundaeText: row.sidebar_fundae_text ?? '',
    categories,
    modules: row.course_modules
      .map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description ?? '',
        durationMinutes: module.duration_minutes,
        position: module.sort_order,
      }))
      .sort((a, b) => a.position - b.position),
    sessions: mapSessions(row.course_sessions),
  }
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')

  const client = supabase as any
  const result = await client
    .from('courses')
    .select(
      'id, slug, title, short_title, excerpt, hero_text, description, objectives, audience_description, audience, featured_image_url, modality, methodology, duration_minutes, brochure_url, certification_name, is_official_certification, is_fundae_eligible, sidebar_certification_title, sidebar_certification_text, sidebar_quality_title, sidebar_quality_text, sidebar_fundae_title, sidebar_fundae_text, course_categories!courses_category_id_fkey(name), course_category_assignments(course_categories(name)), course_modules(id, title, description, duration_minutes, sort_order), course_sessions(id, slug, starts_at, ends_at, capacity, price_cents, status, venues(name, address, locations(city, province)))',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (result.error) {
    throw new Error(`No se pudo cargar el curso: ${result.error.message}`)
  }
  if (!result.data) return null

  return mapCourseDetail(result.data as CourseDetailRow)
}
