import { untypedSupabase } from '../lib/supabase'

export interface SessionAlertInput {
  courseId: string
  /** Null means "any province". */
  province: string | null
  name: string
  email: string
  phone?: string
}

/**
 * Signs a visitor up to be told when a course gets an open session ("Avísame"). Anonymous
 * insert into course_session_alerts (see its migration for the RLS policy); the team notifies
 * them manually from the panel.
 */
export async function createSessionAlert(input: SessionAlertInput) {
  if (!untypedSupabase) throw new Error('Falta configurar la conexión con Supabase.')

  const { error } = await untypedSupabase.from('course_session_alerts').insert({
    course_id: input.courseId,
    province: input.province?.trim() || null,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    privacy_accepted_at: new Date().toISOString(),
  })

  // 23505 = this person already has a pending alert for the same course and province: from the
  // visitor's point of view that's a success, they'll be told either way.
  if (error && error.code !== '23505') {
    throw new Error('No se pudo guardar tu solicitud. Inténtalo de nuevo en unos minutos.')
  }
}
