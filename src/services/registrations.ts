import { supabase } from '../lib/supabase'

export type RegistrationSessionStatus = 'open' | 'full' | 'completed'

export interface RegistrationSession {
  id: string
  slug: string
  courseSlug: string
  courseTitle: string
  category: string
  excerpt: string
  objectives: string
  accreditationTitle: string | null
  accreditationItems: string | null
  benefitsItems: string | null
  isOfficialCertification: boolean
  image: string
  city: string
  province: string
  venue: string
  address: string
  startsAt: string
  endsAt: string
  modality: string
  durationHours: number | null
  capacity: number | null
  priceCents: number | null
  status: RegistrationSessionStatus
}

interface SessionRow {
  id: string
  slug: string
  starts_at: string
  ends_at: string
  status: RegistrationSessionStatus
  capacity: number | null
  price_cents: number | null
  course_id: string
  venue_id: string | null
}

interface CourseRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  objectives: string | null
  accreditation_title: string | null
  accreditation_items: string | null
  benefits_items: string | null
  is_official_certification: boolean | null
  modality: string | null
  duration_hours: number | null
  image_url: string | null
  category_id: string | null
}

interface CategoryRow {
  id: string
  name: string
}

interface VenueRow {
  id: string
  name: string
  address: string | null
  locations: {
    city: string
    province: string
  } | null
}

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85'

function formatModality(value: string | null) {
  switch (value) {
    case 'presential':
      return 'Presencial'
    case 'online':
      return 'Online'
    case 'blended':
      return 'Blended'
    case 'in_company':
      return 'In-company'
    default:
      return 'Presencial'
  }
}

export async function getRegistrationSessions(): Promise<RegistrationSession[]> {
  if (!supabase) {
    throw new Error('Falta configurar la conexión con Supabase.')
  }

  const nowIso = new Date().toISOString()

  const client = supabase as any

  const [sessionsResult, coursesResult, categoriesResult, venuesResult] = await Promise.all([
    client
      .from('course_sessions')
      .select('id, slug, starts_at, ends_at, status, capacity, price_cents, course_id, venue_id')
      .neq('status', 'completed')
      .gte('ends_at', nowIso)
      .order('starts_at', { ascending: true }),
    client
      .from('courses')
      .select(
        'id, slug, title, excerpt, objectives, accreditation_title, accreditation_items, benefits_items, is_official_certification, modality, duration_hours, image_url, category_id',
      )
      .eq('status', 'published')
      .order('title', { ascending: true }),
    client.from('course_categories').select('id, name').order('name', { ascending: true }),
    client.from('venues').select('id, name, address, locations(city, province)'),
  ])

  if (sessionsResult.error) {
    throw new Error(`No se pudieron cargar las convocatorias: ${sessionsResult.error.message}`)
  }
  if (coursesResult.error) {
    throw new Error(`No se pudieron cargar los cursos: ${coursesResult.error.message}`)
  }
  if (categoriesResult.error) {
    throw new Error(`No se pudieron cargar las categorías: ${categoriesResult.error.message}`)
  }
  if (venuesResult.error) {
    throw new Error(`No se pudieron cargar los centros: ${venuesResult.error.message}`)
  }

  const courseById = new Map<string, CourseRow>(
    ((coursesResult.data as CourseRow[]) ?? []).map((course) => [course.id, course]),
  )
  const categoryById = new Map<string, string>(
    ((categoriesResult.data as CategoryRow[]) ?? []).map((category) => [category.id, category.name]),
  )
  const venueById = new Map<string, VenueRow>(
    ((venuesResult.data as VenueRow[]) ?? []).map((venue) => [venue.id, venue]),
  )

  return ((sessionsResult.data as SessionRow[]) ?? [])
    .map((session) => {
      const course = courseById.get(session.course_id)
      if (!course) return null

      const venue = session.venue_id ? venueById.get(session.venue_id) : null
      const city = venue?.locations?.city ?? 'Online'
      const province = venue?.locations?.province ?? 'Online'

      return {
        id: session.id,
        slug: session.slug,
        courseSlug: course.slug,
        courseTitle: course.title,
        category: (course.category_id && categoryById.get(course.category_id)) || 'Formación',
        excerpt: course.excerpt ?? 'Formación práctica y orientada a la seguridad laboral.',
        objectives: course.objectives ?? '',
        accreditationTitle: course.accreditation_title,
        accreditationItems: course.accreditation_items,
        benefitsItems: course.benefits_items,
        isOfficialCertification: course.is_official_certification ?? false,
        image: course.image_url ?? fallbackImage,
        city,
        province,
        venue: venue?.name ?? 'Campus Trekform Online',
        address: venue?.address ?? 'Acceso online',
        startsAt: session.starts_at,
        endsAt: session.ends_at,
        modality: formatModality(course.modality),
        durationHours: course.duration_hours,
        capacity: session.capacity,
        priceCents: session.price_cents,
        status: session.status,
      } satisfies RegistrationSession
    })
    .filter((session): session is RegistrationSession => Boolean(session))
}
