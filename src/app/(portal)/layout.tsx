'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Home, BarChart3, Coins, Map, Camera, HelpCircle, AlertCircle, Loader2, Menu, X, User, Star } from 'lucide-react'
import type { ReactNode } from 'react'

type CustomerData = {
  id: string
  name: string
  email: string
  phone: string | null
  address: string
  city: string
  postal_code: string
  portal_token: string
}

type PortalData = {
  customer: CustomerData
  houseProfile: Record<string, unknown> | null
  installation: Record<string, unknown> | null
}

type NavItem = {
  href: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { href: '/portal', label: 'Home', icon: <Zap className="h-5 w-5" /> },
  { href: '/portal/dossier', label: 'Huisdossier', icon: <Home className="h-5 w-5" /> },
  { href: '/portal/verbruik', label: 'Verbruik', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/portal/subsidies', label: 'Subsidies', icon: <Coins className="h-5 w-5" /> },
  { href: '/portal/actieplan', label: 'Actieplan', icon: <Map className="h-5 w-5" /> },
  { href: '/portal/upload', label: "Foto's", icon: <Camera className="h-5 w-5" /> },
  { href: '/portal/evaluate', label: 'Evaluatie', icon: <Star className="h-5 w-5" /> },
  { href: '/portal/issues', label: 'Hulp', icon: <HelpCircle className="h-5 w-5" /> },
]

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-center">Portal laden...</p>
      </div>
    </div>
  )
}

function PortalLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const token = searchParams.get('token')

  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchCustomer() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/portal/auth?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Fout bij ophalen klantgegevens')
          setLoading(false)
          return
        }

        setPortalData(data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching customer:', err)
        setError('Kon klantgegevens niet ophalen')
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [token])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Loading state
  if (loading) {
    return <LoadingFallback />
  }

  // Geen geldige token of klant niet gevonden
  if (!token || error || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Toegang geweigerd
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Deze link is niet geldig of verlopen. Neem contact op met uw installateur voor een nieuwe link.'}
          </p>
          <Link
            href="/portal-login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Inloggen met token
          </Link>
        </div>
      </div>
    )
  }

  const customer = portalData.customer
  const firstName = customer.name?.split(' ')[0] || 'Klant'

  // Token toevoegen aan links
  const getHref = (href: string) => `${href}?token=${token}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={getHref('/portal')} className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900">p1Meter</span>
                <p className="text-xs text-gray-500 -mt-0.5">Klantportaal</p>
              </div>
            </Link>

            {/* Desktop: Customer Info */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                <p className="text-xs text-gray-500">{customer.city}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {firstName[0]}
              </div>
            </div>

            {/* Mobile: Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-white shadow-xl p-4 overflow-y-auto">
            {/* Customer Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {firstName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{customer.name}</p>
                <p className="text-xs text-gray-500">{customer.city}</p>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const href = getHref(item.href)

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const href = getHref(item.href)

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            const href = getHref(item.href)

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Footer - Hidden on mobile */}
      <footer className="hidden md:block border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>p1Meter Klantportaal</p>
            <Link
              href={getHref('/portal/issues')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Hulp nodig?
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </Suspense>
  )
}
