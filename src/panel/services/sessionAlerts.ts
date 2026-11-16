import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

export type SessionAlertStatus = 'pending' | 'notified' | 'cancelled'

export interface SessionAlert {
  id: string
  courseId: string
  courseTitle: string
  province: string | null
  name: string
  email: string
  phone: string | null
  status: SessionAlertStatus
  notifiedAt: string | null
  createdAt: string
}

interface SessionAlertRow {
  id: string
  course_id: string
  province: string | null
  name: string
  email: string
  phone: string | null
  status: SessionAlertStatus
  notified_at: string | null
  created_at: string
  courses: { title: string } | null
}

export async function listSessionAlerts(): Promise<SessionAlert[]> {
  const { data, error } = await requireClient()
    .from('course_session_alerts')
    .select(
      'id, course_id, province, name, email, phone, status, notified_at, created_at, courses(title)',
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los avisos: ${error.message}`)
  return (data as unknown as SessionAlertRow[]).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.courses?.title ?? 'Curso eliminado',
    province: row.province,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    notifiedAt: row.notified_at,
    createdAt: row.created_at,
  }))
}

/** Marking an alert as notified stamps notified_at; moving it back clears it. */
export async function updateSessionAlertStatus(
  id: string,
  status: SessionAlertStatus,
): Promise<{ notifiedAt: string | null }> {
  const notifiedAt = status === 'notified' ? new Date().toISOString() : null
  const { error } = await requireClient()
    .from('course_session_alerts')
    .update({ status, notified_at: notifiedAt })
    .eq('id', id)

  if (error) throw new Error(`No se pudo actualizar el aviso: ${error.message}`)
  return { notifiedAt }
}
