'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  Activity,
  Wifi,
  Euro,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Gauge,
  BarChart3,
} from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  // Check if user is logged in (display only, no redirect)
  useEffect(() => {
    const storageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`
    const session = localStorage.getItem(storageKey)
    if (session) {
      try {
        const parsed = JSON.parse(session)
        setCurrentUser(parsed.user?.email || 'Ingelogd')
      } catch {
        setCurrentUser(null)
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Direct fetch to Supabase auth endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok && data.access_token) {

        // Store session in localStorage (for client-side)
        const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
        const storageKey = `sb-${projectRef}-auth-token`
        const sessionData = JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          expires_in: data.expires_in,
          token_type: data.token_type,
          user: data.user,
        })
        localStorage.setItem(storageKey, sessionData)

        // Also store in cookies for middleware (SSR)
        const maxAge = data.expires_in || 3600
        document.cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(sessionData)}; path=/; max-age=${maxAge}; SameSite=Lax`
        document.cookie = `sb-${projectRef}-auth-token.0=${encodeURIComponent(sessionData)}; path=/; max-age=${maxAge}; SameSite=Lax`

        // Get role from team_members via direct fetch
        const roleResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/team_members?user_id=eq.${data.user.id}&select=role`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${data.access_token}`,
            },
          }
        )
        const roleData = await roleResponse.json()
        const role = roleData?.[0]?.role || 'huiseigenaar'
        setCurrentUser(data.user?.email || 'Ingelogd')

        // Redirect based on role
        window.location.href = role === 'huiseigenaar' ? '/portal' : '/dashboard'
      } else {
        const errorMsg = data.error_description || data.error || data.msg || 'Login mislukt'
        setError(errorMsg === 'Invalid login credentials' ? 'Ongeldige inloggegevens' : errorMsg)
        setIsLoading(false)
      }
    } catch {
      setError('Kon geen verbinding maken met de server')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-900/90 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 lg:p-2.5 rounded-xl">
                <Zap className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg lg:text-xl text-white">p1Meter</span>
                <span className="hidden sm:block text-xs text-slate-400">Installatie Manager</span>
              </div>
            </div>
            <nav className="flex items-center gap-4 lg:gap-6">
              <Link href="/faq" className="text-sm text-slate-300 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/over" className="text-sm text-slate-300 hover:text-white transition-colors">
                Over ons
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Vertical on mobile, horizontal on desktop */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Top/Left Side - Info & P1Meter Visual */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-12 xl:px-20 pt-24 pb-8 lg:pt-0 lg:pb-0 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-1/4 -left-20 w-64 lg:w-96 h-64 lg:h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-48 lg:w-80 h-48 lg:h-80 bg-teal-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-500/20 text-blue-300 rounded-full text-xs lg:text-sm font-medium mb-4 lg:mb-8 backdrop-blur-sm border border-blue-500/30">
              <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              HomeWizard p1Meter Partner
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 lg:mb-6">
              Realtime inzicht in je{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                energieverbruik
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-6 lg:mb-10 leading-relaxed">
              De p1Meter van HomeWizard geeft je direct inzicht in je stroom- en gasverbruik.
              Wij verzorgen de professionele installatie bij jou thuis.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-12">
              <div className="flex items-center gap-2 lg:gap-3 text-slate-300">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm">Realtime monitoring</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-slate-300">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm">Bespaar op energie</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-slate-300">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm">Gratis HomeWizard app</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-slate-300">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm">Professionele installatie</span>
              </div>
            </div>

            {/* P1Meter Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-700/50">
                <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                  {/* P1Meter Device Image */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-20 h-32 sm:w-24 sm:h-38 lg:w-28 lg:h-44">
                      <Image
                        src="/images/p1meter.svg"
                        alt="HomeWizard P1 Meter"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-3xl blur-xl -z-10" />
                  </div>

                  {/* Stats */}
                  <div className="flex-1 space-y-3 lg:space-y-4">
                    <div className="bg-slate-800/50 rounded-xl p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] lg:text-xs">
                          <Activity className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                          Huidig verbruik
                        </div>
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-400 rounded-full animate-pulse" />
                      </div>
                      <div className="text-xl lg:text-2xl font-bold text-white">1.247 <span className="text-xs lg:text-sm font-normal text-slate-400">kW</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <div className="bg-slate-800/50 rounded-xl p-2 lg:p-3">
                        <Gauge className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-blue-400 mb-1" />
                        <div className="text-xs lg:text-sm font-semibold text-white">Stroom</div>
                        <div className="text-[10px] lg:text-xs text-slate-400">342 kWh</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-2 lg:p-3">
                        <BarChart3 className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-teal-400 mb-1" />
                        <div className="text-xs lg:text-sm font-semibold text-white">Gas</div>
                        <div className="text-[10px] lg:text-xs text-slate-400">48 m³</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom/Right Side - Login Form */}
        <div className="lg:flex-none lg:w-[480px] xl:w-[540px] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 lg:py-12 bg-white lg:bg-slate-50 rounded-t-[2rem] lg:rounded-t-none lg:rounded-l-[3rem] lg:shadow-2xl relative">
          {/* Show logged in state */}
          {currentUser && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-emerald-800 text-sm mb-3">
                Je bent ingelogd als <strong>{currentUser}</strong>
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors w-full justify-center"
              >
                Ga naar Dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 lg:mb-10 text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welkom terug</h2>
            <p className="text-sm lg:text-base text-slate-500">Log in om verder te gaan naar je dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 lg:mb-2">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="naam@voorbeeld.nl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5 lg:mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Je wachtwoord"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Bezig met inloggen...
                </>
              ) : (
                <>
                  Inloggen
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login?forgot=true"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Wachtwoord vergeten?
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 lg:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white lg:bg-slate-50 text-slate-500">Of</span>
            </div>
          </div>

          {/* Customer Portal Link */}
          <Link
            href="/portal-login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Zap className="h-5 w-5" />
            Ik ben klant - Naar mijn portaal
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
          </div>

          {/* Info Links */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <Link
              href="/faq"
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs lg:text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Wifi className="h-4 w-4 text-blue-500" />
              <span className="hidden sm:inline">Veel gestelde </span>vragen
            </Link>
            <Link
              href="/over"
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs lg:text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Euro className="h-4 w-4 text-emerald-500" />
              Over p1Meter
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-6 lg:mt-10 pb-6 lg:pb-0 text-center text-xs lg:text-sm text-slate-500">
            Medewerker zonder account?{' '}
            <span className="text-slate-700">Neem contact op met de administrator.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
