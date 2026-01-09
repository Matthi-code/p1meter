'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Key, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'

export default function PortalLoginPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanToken = token.trim()
    if (!cleanToken) {
      setError('Vul uw persoonlijke token in')
      setLoading(false)
      return
    }

    try {
      // Verify token with API
      const response = await fetch(`/api/portal/auth?token=${encodeURIComponent(cleanToken)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ongeldige token')
        setLoading(false)
        return
      }

      // Token is valid, redirect to portal
      router.push(`/portal?token=${encodeURIComponent(cleanToken)}`)
    } catch (err) {
      console.error('Login error:', err)
      setError('Er ging iets mis. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 p-3 rounded-xl mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Klantportaal</h1>
          <p className="text-gray-600 mt-2">
            Welkom bij het p1Meter klantportaal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Uw persoonlijke token
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Voer uw token in"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              U heeft deze token ontvangen per e-mail of SMS van uw installateur.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Bezig met inloggen...
              </>
            ) : (
              <>
                Naar mijn portaal
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Geen token ontvangen of werkt uw token niet?
            <br />
            Neem contact op met uw installateur.
          </p>
        </div>
      </div>
    </div>
  )
}
