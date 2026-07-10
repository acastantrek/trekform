import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Enrollment, EnrollmentStatus } from '../types'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

interface EnrollmentRow {
  id: string
  status: EnrollmentStatus
  notes: string | null
  created_at: string
  student_id: string
  course_session_id: string
  company_id: string | null
  students: { first_name: string; last_name: string; email: string | null; phone: string | null } | null
  course_sessions: {
    code: string
    starts_at: string
    course_id: string
    courses: { title: string } | null
  } | null
  companies: { legal_name: string } | null
}

function mapEnrollment(row: EnrollmentRow): Enrollment {
  const student = row.students
  const session = row.course_sessions

  return {
    id: row.id,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    studentId: row.student_id,
    studentName: student ? `${student.first_name} ${student.last_name}` : 'Alumno eliminado',
    studentEmail: student?.email ?? null,
    studentPhone: student?.phone ?? null,
    courseSessionId: row.course_session_id,
    sessionCode: session?.code ?? '—',
    sessionStartsAt: session?.starts_at ?? '',
    courseId: session?.course_id ?? '',
    courseTitle: session?.courses?.title ?? 'Curso eliminado',
    companyId: row.company_id,
    companyName: row.companies?.legal_name ?? null,
  }
}

const enrollmentColumns =
  'id, status, notes, created_at, student_id, course_session_id, company_id, students(first_name, last_name, email, phone), course_sessions(code, starts_at, course_id, courses(title)), companies(legal_name)'

export async function listEnrollments(): Promise<Enrollment[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('enrollments')
    .select(enrollmentColumns)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las inscripciones: ${error.message}`)
  return (data as unknown as EnrollmentRow[]).map(mapEnrollment)
}

export async function updateEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('enrollments').update({ status }).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar la inscripción: ${error.message}`)
}
