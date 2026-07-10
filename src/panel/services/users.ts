import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { AdminUser, AppRole } from '../types'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

interface ProfileRow {
  id: string
  role: AppRole
  first_name: string | null
  last_name: string | null
  is_active: boolean
  created_at: string
  students: { email: string | null }[] | { email: string | null } | null
}

function mapUser(row: ProfileRow): AdminUser {
  const student = Array.isArray(row.students) ? row.students[0] : row.students

  return {
    id: row.id,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    email: student?.email ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export async function listUsers(): Promise<AdminUser[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('profiles')
    .select('id, role, first_name, last_name, is_active, created_at, students(email)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los usuarios: ${error.message}`)
  return (data as unknown as ProfileRow[]).map(mapUser)
}

export async function updateUserRole(id: string, role: AppRole): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('profiles').update({ role }).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el rol: ${error.message}`)
}

export async function updateUserActive(id: string, isActive: boolean): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('profiles').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el estado: ${error.message}`)
}

export interface InviteAdminInput {
  email: string
  firstName: string
  lastName: string
}

export async function inviteAdminUser(input: InviteAdminInput): Promise<void> {
  const client = requireClient()
  const { data, error } = await client.functions.invoke('invite-admin', {
    body: { email: input.email, firstName: input.firstName, lastName: input.lastName },
  })

  if (error) {
    const context = (error as { context?: Response }).context
    const body = await context?.json().catch(() => null)
    throw new Error(body?.error ?? `No se pudo enviar la invitación: ${error.message}`)
  }
  if (data?.error) throw new Error(data.error)
}
