'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase'
import { Zap, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const result = await login(email, password)

    if (result.success) {
      // Redirect naar juiste pagina op basis van rol
      // De useAuth hook update de user state, dus we moeten even wachten
      // De middleware handelt de rest af
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        const role = teamMember?.role || 'huiseigenaar'

        // Redirect op basis van rol
        if (role === 'huiseigenaar') {
          router.push('/portal')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } else {
      setError(result.error || 'Ongeldige inloggegevens')
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetMessage('')
    setError('')
    setResetLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setResetMessage('Check je e-mail voor de reset link!')
      }
    } catch {
      setError('Er is een fout opgetreden')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            p1Meter Installaties
          </h1>
          <p className="mt-2 text-gray-600">
            {showForgotPassword ? 'Wachtwoord herstellen' : 'Log in om door te gaan'}
          </p>
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                E-mailadres
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="naam@voorbeeld.nl"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                {resetMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? 'Bezig...' : 'Verstuur reset link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
                setError('')
                setResetMessage('')
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar inloggen
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="naam@voorbeeld.nl"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Bezig...' : 'Inloggen'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Wachtwoord vergeten?
            </button>
          </form>
        )}

        {/* Help text */}
        <p className="text-center text-sm text-gray-500">
          Neem contact op met de administrator als je geen account hebt.
        </p>
      </div>
    </div>
  )
}
