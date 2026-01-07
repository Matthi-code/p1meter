'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { getSupabaseClient } from './supabase'
import type { UserRole } from '@/types/database'
import type { TeamMember } from '@/types/supabase'

// Auth user type
type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

/** Auth provider met Supabase */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const supabase = getSupabaseClient()
    let mounted = true

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          // Fetch team member data
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('id, email, name, role')
            .eq('user_id', session.user.id)
            .single<Pick<TeamMember, 'id' | 'email' | 'name' | 'role'>>()

          if (mounted && teamMember) {
            setUser({
              id: teamMember.id,
              email: teamMember.email,
              name: teamMember.name,
              role: teamMember.role,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch team member data
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('id, email, name, role')
            .eq('user_id', session.user.id)
            .single<Pick<TeamMember, 'id' | 'email' | 'name' | 'role'>>()

          if (mounted && teamMember) {
            setUser({
              id: teamMember.id,
              email: teamMember.email,
              name: teamMember.name,
              role: teamMember.role,
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /** Login met Supabase */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setIsLoading(false)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Fetch team member data
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('id, email, name, role')
          .eq('user_id', data.user.id)
          .single<Pick<TeamMember, 'id' | 'email' | 'name' | 'role'>>()

        if (teamError || !teamMember) {
          setIsLoading(false)
          return {
            success: false,
            error: 'Geen team member profiel gevonden. Neem contact op met de administrator.',
          }
        }

        setUser({
          id: teamMember.id,
          email: teamMember.email,
          name: teamMember.name,
          role: teamMember.role,
        })

        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: 'Onbekende fout' }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: 'Verbindingsfout' }
    }
  }, [])

  /** Uitloggen */
  const logout = useCallback(async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  /** Check of user een van de gegeven rollen heeft */
  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user]
  )

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook om auth context te gebruiken */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth moet binnen AuthProvider gebruikt worden')
  }

  return context
}

/** Hook om te checken of user is ingelogd */
export function useRequireAuth() {
  const { user, isLoading } = useAuth()

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}
