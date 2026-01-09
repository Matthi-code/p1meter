'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  BarChart3,
  Coins,
  Map,
  ChevronRight,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  Calendar,
  ArrowRight,
  Gift,
  CheckCircle2,
  Clock,
} from 'lucide-react'

type CustomerData = {
  id: string
  name: string
  email: string
  address: string
  city: string
  postal_code: string
}

type HouseProfile = {
  property_type?: string
  year_built?: number
  energy_label?: string
  woz_value?: number
}

function PortalContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [profile, setProfile] = useState<HouseProfile | null>(null)
  const [subsidyAmount, setSubsidyAmount] = useState(0)

  useEffect(() => {
    async function loadData() {
      if (!token) return

      try {
        // Load customer and profile data
        const response = await fetch(`/api/portal/dossier?token=${token}`)
        if (response.ok) {
          const data = await response.json()
          setCustomer(data.customer)
          setProfile(data.profile)

          // Calculate subsidies based on profile and postal code
          let total = 0
          const postal4 = data.customer?.postal_code?.substring(0, 4)

          // Waarde Check Bon (postcodes 4765, 4781, 4782, 4767)
          if (['4765', '4781', '4782', '4767'].includes(postal4)) {
            total += 2000
          }

          // NIP Subsidie
          if (data.profile?.year_built && data.profile.year_built < 1993) {
            if (data.profile.woz_value && data.profile.woz_value <= 400000) {
              total += 2000
            } else if (data.profile.woz_value && data.profile.woz_value <= 477000) {
              total += 1000
            }
          }

          setSubsidyAmount(total)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  if (!token) {
    return null
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Even geduld...</p>
      </div>
    )
  }

  const firstName = customer?.name?.split(' ')[0] || 'Welkom'
  const getHref = (path: string) => `${path}?token=${token}`

  // Determine greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond'

  // Quick stats
  const stats = [
    {
      label: 'Woningtype',
      value: profile?.property_type
        ? profile.property_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Nog invullen',
      filled: !!profile?.property_type,
    },
    {
      label: 'Bouwjaar',
      value: profile?.year_built || 'Nog invullen',
      filled: !!profile?.year_built,
    },
    {
      label: 'Energielabel',
      value: profile?.energy_label || 'Nog invullen',
      filled: !!profile?.energy_label,
    },
  ]

  const completedSteps = [
    !!profile?.property_type,
    !!profile?.year_built,
    !!profile?.energy_label,
  ].filter(Boolean).length

  const quickActions = [
    {
      href: getHref('/portal/dossier'),
      icon: <Home className="h-6 w-6" />,
      title: 'Huisdossier',
      description: 'Vul uw woninggegevens in',
      color: 'from-blue-500 to-blue-600',
      priority: !profile?.property_type,
    },
    {
      href: getHref('/portal/verbruik'),
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Verbruik',
      description: 'Bekijk uw energieverbruik',
      color: 'from-emerald-500 to-emerald-600',
      priority: false,
    },
    {
      href: getHref('/portal/subsidies'),
      icon: <Coins className="h-6 w-6" />,
      title: 'Subsidies',
      description: `€${subsidyAmount.toLocaleString('nl-NL')} beschikbaar`,
      color: 'from-amber-500 to-orange-500',
      priority: subsidyAmount > 0,
    },
    {
      href: getHref('/portal/actieplan'),
      icon: <Map className="h-6 w-6" />,
      title: 'Actieplan',
      description: 'Uw persoonlijke roadmap',
      color: 'from-purple-500 to-purple-600',
      priority: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Klantportaal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {greeting}, {firstName}!
          </h1>

          <p className="text-blue-100 mb-6 max-w-lg">
            Welkom in uw persoonlijke energieportaal. Ontdek hoeveel u kunt besparen en welke subsidies voor u beschikbaar zijn.
          </p>

          {/* Address */}
          {customer && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <Home className="h-4 w-4 text-blue-200" />
              <span>{customer.address}, {customer.postal_code} {customer.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subsidy Highlight */}
      {subsidyAmount > 0 && (
        <Link
          href={getHref('/portal/subsidies')}
          className="block group"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white transition-all hover:shadow-lg hover:scale-[1.01]">
            <div className="absolute top-0 right-0 opacity-10">
              <Gift className="h-32 w-32 -mt-4 -mr-4" />
            </div>

            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-100 text-sm mb-1">
                  <Gift className="h-4 w-4" />
                  <span>Beschikbaar voor u</span>
                </div>
                <p className="text-4xl sm:text-5xl font-bold">
                  €{subsidyAmount.toLocaleString('nl-NL')}
                </p>
                <p className="text-emerald-100 mt-2">
                  aan subsidies en tegoed
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium group-hover:bg-white/30 transition-colors">
                Bekijk details
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Uw profiel</h2>
          <span className="text-sm text-gray-500">{completedSteps}/3 ingevuld</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / 3) * 100}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`font-semibold ${stat.filled ? 'text-gray-900' : 'text-gray-400'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {completedSteps < 3 && (
          <Link
            href={getHref('/portal/dossier')}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
          >
            Profiel aanvullen
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Snel naar</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all"
            >
              {action.priority && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </span>
                </span>
              )}

              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>

              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Tips voor u</span>
        </div>

        <div className="space-y-3">
          {!profile?.property_type && (
            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Vul uw huisdossier in</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Voor een nauwkeurige berekening van uw subsidies en besparingen.
                </p>
              </div>
            </div>
          )}

          {subsidyAmount > 0 && (
            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Coins className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">€{subsidyAmount.toLocaleString('nl-NL')} subsidie beschikbaar</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bekijk hoe u dit kunt inzetten voor isolatie of een warmtepomp.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 bg-white rounded-xl p-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">P1 Meter installatie</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Na installatie ziet u hier uw real-time energieverbruik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Even geduld...</p>
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  )
}
