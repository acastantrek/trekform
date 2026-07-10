import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

export interface AuthState {
  session: Session | null
  profile: Profile | null
  isAdmin: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
