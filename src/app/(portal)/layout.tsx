'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mockCustomers, mockInstallations } from '@/lib/mock-data'
import { Zap, Calendar, FileText, Camera, Star, AlertCircle, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Customer, Installation } from '@/types/database'

/** Haal klant op basis van token */
function getCustomerByToken(token: string | null): Customer | null {
  if (!token) return null
  return mockCustomers.find((c) => c.portal_token === token) || null
}

/** Haal actieve installatie voor klant */
function getActiveInstallation(customerId: string): Installation | null {
  return (
    mockInstallations.find(
      (i) =>
        i.customer_id === customerId &&
        i.status !== 'completed' &&
        i.status !== 'cancelled'
    ) || null
  )
}

type NavItem = {
  href: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { href: '/portal', label: 'Mijn afspraak', icon: <Calendar className="h-5 w-5" /> },
  { href: '/portal/intake', label: 'Intake', icon: <FileText className="h-5 w-5" /> },
  { href: '/portal/upload', label: "Foto's", icon: <Camera className="h-5 w-5" /> },
  { href: '/portal/evaluate', label: 'Evaluatie', icon: <Star className="h-5 w-5" /> },
  { href: '/portal/issues', label: 'Hulp nodig?', icon: <AlertCircle className="h-5 w-5" /> },
]

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  )
}

function PortalLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const token = searchParams.get('token')

  const customer = getCustomerByToken(token)

  // Geen geldige token
  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Ongeldige link
          </h1>
          <p className="text-gray-600">
            Deze link is niet geldig of verlopen. Neem contact op met uw
            installateur voor een nieuwe link.
          </p>
        </div>
      </div>
    )
  }

  // Token toevoegen aan links
  const getHref = (href: string) => `${href}?token=${token}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={getHref('/portal')} className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">p1Meter</span>
                <p className="text-xs text-gray-500">Klantportaal</p>
              </div>
            </Link>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
              <p className="text-xs text-gray-500">{customer.city}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const href = getHref(item.href)

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Vragen? Neem contact op via de &quot;Hulp nodig?&quot; pagina</p>
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
