import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { EnrollmentStatus, RecordStatus, SessionStatus } from '../types'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

export type ContactRequestStatus = 'new' | 'in_progress' | 'resolved' | 'spam'

export interface DashboardEnrollment {
  id: string
  status: EnrollmentStatus
  paymentStatus: 'pending' | 'paid' | 'refunded'
  amountPaidCents: number
  createdAt: string
  sessionId: string
}

export interface DashboardSession {
  id: string
  code: string
  startsAt: string
  capacity: number
  priceCents: number
  status: SessionStatus
  courseId: string
  courseTitle: string
  venueName: string | null
}

export interface DashboardCourse {
  id: string
  title: string
  status: RecordStatus
  categoryName: string
}

export interface DashboardContactRequest {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  subject: string | null
  status: ContactRequestStatus
  createdAt: string
}

export interface DashboardBlogPost {
  id: string
  status: RecordStatus
  publishedAt: string | null
}

export interface DashboardData {
  enrollments: DashboardEnrollment[]
  sessions: DashboardSession[]
  courses: DashboardCourse[]
  contactRequests: DashboardContactRequest[]
  blogPosts: DashboardBlogPost[]
  studentCount: number
}

interface EnrollmentRow {
  id: string
  status: EnrollmentStatus
  payment_status: DashboardEnrollment['paymentStatus'] | null
  amount_paid_cents: number | null
  created_at: string
  course_session_id: string
}

interface SessionRow {
  id: string
  code: string
  starts_at: string
  capacity: number
  price_cents: number
  status: SessionStatus
  course_id: string
  courses: { title: string } | null
  venues: { name: string } | null
}

interface CourseRow {
  id: string
  title: string
  status: RecordStatus
  course_categories: { name: string } | null
}

interface ContactRequestRow {
  id: string
  name: string
  email: string
  phone: string | null
  company_name: string | null
  subject: string | null
  status: ContactRequestStatus
  created_at: string
}

interface BlogPostRow {
  id: string
  status: RecordStatus
  published_at: string | null
}

/** Loads everything the dashboard needs in parallel, selecting only the columns it uses. */
export async function loadDashboardData(): Promise<DashboardData> {
  const client = requireClient()

  const [enrollments, sessions, courses, contactRequests, blogPosts, students] = await Promise.all([
    client
      .from('enrollments')
      .select('id, status, payment_status, amount_paid_cents, created_at, course_session_id'),
    client
      .from('course_sessions')
      .select(
        'id, code, starts_at, capacity, price_cents, status, course_id, courses(title), venues(name)',
      ),
    client
      .from('courses')
      .select('id, title, status, course_categories!courses_category_id_fkey(name)'),
    client
      .from('contact_requests')
      .select('id, name, email, phone, company_name, subject, status, created_at')
      .order('created_at', { ascending: false }),
    client.from('blog_posts').select('id, status, published_at'),
    client.from('students').select('id', { count: 'exact', head: true }),
  ])

  const failed = [enrollments, sessions, courses, contactRequests, blogPosts, students].find(
    (result) => result.error,
  )
  if (failed?.error) {
    throw new Error(`No se pudieron cargar los datos del panel: ${failed.error.message}`)
  }

  return {
    enrollments: (enrollments.data as EnrollmentRow[]).map((row) => ({
      id: row.id,
      status: row.status,
      paymentStatus: row.payment_status ?? 'pending',
      amountPaidCents: row.amount_paid_cents ?? 0,
      createdAt: row.created_at,
      sessionId: row.course_session_id,
    })),
    sessions: (sessions.data as unknown as SessionRow[]).map((row) => ({
      id: row.id,
      code: row.code,
      startsAt: row.starts_at,
      capacity: row.capacity,
      priceCents: row.price_cents,
      status: row.status,
      courseId: row.course_id,
      courseTitle: row.courses?.title ?? 'Curso eliminado',
      venueName: row.venues?.name ?? null,
    })),
    courses: (courses.data as unknown as CourseRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      categoryName: row.course_categories?.name ?? 'Sin categoría',
    })),
    contactRequests: (contactRequests.data as ContactRequestRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      companyName: row.company_name,
      subject: row.subject,
      status: row.status,
      createdAt: row.created_at,
    })),
    blogPosts: (blogPosts.data as BlogPostRow[]).map((row) => ({
      id: row.id,
      status: row.status,
      publishedAt: row.published_at,
    })),
    studentCount: students.count ?? 0,
  }
}

export async function resolveContactRequest(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('contact_requests')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`No se pudo marcar la solicitud como atendida: ${error.message}`)
}
