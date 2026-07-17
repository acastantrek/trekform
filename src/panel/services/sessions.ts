import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { CourseSession, VenueOption } from '../types'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

interface SessionRow {
  id: string
  course_id: string
  venue_id: string | null
  code: string
  slug: string
  starts_at: string
  ends_at: string
  capacity: number
  price_cents: number
  status: CourseSession['status']
  courses: { title: string } | null
  venues: { name: string } | null
}

function mapSession(row: SessionRow): CourseSession {
  return {
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.courses?.title ?? 'Curso eliminado',
    venueId: row.venue_id,
    venueName: row.venues?.name ?? null,
    code: row.code,
    slug: row.slug,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    priceCents: row.price_cents,
    status: row.status,
  }
}

const sessionColumns =
  'id, course_id, venue_id, code, slug, starts_at, ends_at, capacity, price_cents, status, courses(title), venues(name)'

export async function listSessions(): Promise<CourseSession[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('course_sessions')
    .select(sessionColumns)
    .order('starts_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las convocatorias: ${error.message}`)
  return (data as unknown as SessionRow[]).map(mapSession)
}

export interface SessionInput {
  courseId: string
  venueId: string | null
  code: string
  slug: string
  startsAt: string
  endsAt: string
  capacity: number
  priceCents: number
  status: CourseSession['status']
}

function toSessionRecord(input: SessionInput) {
  return {
    course_id: input.courseId,
    venue_id: input.venueId,
    code: input.code,
    slug: input.slug,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    capacity: input.capacity,
    price_cents: input.priceCents,
    status: input.status,
  }
}

export async function createSession(input: SessionInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_sessions').insert(toSessionRecord(input))
  if (error) throw new Error(`No se pudo crear la convocatoria: ${error.message}`)
}

export async function updateSession(id: string, input: SessionInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_sessions').update(toSessionRecord(input)).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar la convocatoria: ${error.message}`)
}

export async function deleteSession(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('course_sessions').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar la convocatoria: ${error.message}`)
}

export interface CourseOption {
  id: string
  title: string
}

export async function listCourseOptions(): Promise<CourseOption[]> {
  const client = requireClient()
  const { data, error } = await client.from('courses').select('id, title').order('title', { ascending: true })
  if (error) throw new Error(`No se pudieron cargar los cursos: ${error.message}`)
  return data as CourseOption[]
}

interface VenueRow {
  id: string
  name: string
  locations: { city: string; province: string } | null
}

export async function listVenueOptions(): Promise<VenueOption[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('venues')
    .select('id, name, locations(city, province)')
    .order('name', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar las sedes: ${error.message}`)
  return (data as unknown as VenueRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    city: row.locations?.city ?? '',
    province: row.locations?.province ?? '',
  }))
}
