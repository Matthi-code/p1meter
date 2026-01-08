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

  // Check for existing session on mount (using localStorage directly to avoid SDK hanging)
  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      try {
        // Read session from localStorage directly
        const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
        const storageKey = `sb-${projectRef}-auth-token`
        const sessionStr = localStorage.getItem(storageKey)

        if (!sessionStr) {
          if (mounted) setIsLoading(false)
          return
        }

        const session = JSON.parse(sessionStr)
        if (!session?.user?.id || !session?.access_token) {
          if (mounted) setIsLoading(false)
          return
        }

        // Fetch team member data via direct fetch
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/team_members?user_id=eq.${session.user.id}&select=id,email,name,role`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        )
        const teamMembers = await response.json()
        const teamMember = teamMembers?.[0]

        if (mounted && teamMember) {
          setUser({
            id: teamMember.id,
            email: teamMember.email,
            name: teamMember.name,
            role: teamMember.role,
          })
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

    return () => {
      mounted = false
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
    // Clear session from localStorage and cookies
    const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
    localStorage.removeItem(`sb-${projectRef}-auth-token`)
    document.cookie = `sb-${projectRef}-auth-token=; path=/; max-age=0`
    document.cookie = `sb-${projectRef}-auth-token.0=; path=/; max-age=0`
    setUser(null)
    // Redirect naar startpagina
    window.location.href = '/'
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
