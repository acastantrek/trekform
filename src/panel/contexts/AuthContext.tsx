import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../types'
import { AuthContext, type AuthState } from './auth-context'

interface ProfileRow {
  id: string
  role: 'admin' | 'student' | 'company'
  first_name: string | null
  last_name: string | null
  is_active: boolean
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    isActive: row.is_active,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      Promise.resolve().then(() => setLoading(false))
      return
    }

    let active = true

    async function loadProfile(currentSession: Session | null) {
      if (!currentSession) {
        if (active) setProfile(null)
        return
      }

      const { data, error: profileError } = await (supabase as unknown as SupabaseClient)
        .from('profiles')
        .select('id, role, first_name, last_name, is_active')
        .eq('id', currentSession.user.id)
        .maybeSingle()

      if (!active) return
      if (profileError) {
        setError(profileError.message)
        setProfile(null)
        return
      }

      setProfile(data ? mapProfile(data as ProfileRow) : null)
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadProfile(data.session)
      if (active) setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadProfile(nextSession)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      throw signInError
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
  }

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      isAdmin: profile?.role === 'admin' && profile.isActive,
      loading,
      error,
      signIn,
      signOut,
    }),
    [session, profile, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
