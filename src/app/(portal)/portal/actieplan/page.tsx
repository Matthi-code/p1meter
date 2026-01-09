'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Map,
  Loader2,
  CheckCircle2,
  Circle,
  ChevronRight,
  TrendingDown,
  Leaf,
  Euro,
  Home,
  Zap,
  Flame,
  Sun,
  ThermometerSun,
  ArrowRight,
  Info,
  AlertCircle,
  Sparkles,
  Target,
  Clock,
  Trophy,
  Rocket,
  FileText,
  Coins,
  Building2,
  BadgeCheck,
} from 'lucide-react'
import { isEligibleForWaardeCheck, getWaardeCheckStatus } from '@/lib/subsidies/waarde-check'
import { calculateNIPSubsidy } from '@/lib/subsidies/nip-subsidie'
import type { HouseProfile, Customer } from '@/types/supabase'

type RoadmapStep = {
  id: string
  order: number
  name: string
  category: 'isolatie' | 'installatie' | 'opwek'
  icon: React.ReactNode
  description: string
  baseCost: number
  savingPerYear: number
  co2Reduction: number
  eligibleSubsidies: string[]
  reason: string
  status: 'completed' | 'current' | 'upcoming'
}

// Default roadmap for older homes
const DEFAULT_ROADMAP: Omit<RoadmapStep, 'status'>[] = [
  {
    id: 'spouwmuur',
    order: 1,
    name: 'Spouwmuurisolatie',
    category: 'isolatie',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Isolatie van de spouwmuur door inspuiten',
    baseCost: 1800,
    savingPerYear: 450,
    co2Reduction: 570,
    eligibleSubsidies: ['waarde-check', 'nip'],
    reason: 'Grootste impact, laagste kosten, subsidie beschikbaar',
  },
  {
    id: 'dak',
    order: 2,
    name: 'Dakisolatie',
    category: 'isolatie',
    icon: <Home className="h-5 w-5" />,
    description: 'Isolatie van het dak aan binnen- of buitenzijde',
    baseCost: 4000,
    savingPerYear: 375,
    co2Reduction: 475,
    eligibleSubsidies: ['waarde-check', 'nip', 'isde'],
    reason: 'Tot 30% warmteverlies via het dak',
  },
  {
    id: 'vloer',
    order: 3,
    name: 'Vloerisolatie',
    category: 'isolatie',
    icon: <Home className="h-5 w-5" />,
    description: 'Isolatie van de vloer (kruipruimte)',
    baseCost: 1500,
    savingPerYear: 180,
    co2Reduction: 230,
    eligibleSubsidies: ['waarde-check', 'nip', 'isde'],
    reason: 'Comfort verbetering, geen koude voeten meer',
  },
  {
    id: 'glas',
    order: 4,
    name: 'HR++ Glas',
    category: 'isolatie',
    icon: <ThermometerSun className="h-5 w-5" />,
    description: 'Vervang enkel/dubbel glas door HR++',
    baseCost: 5000,
    savingPerYear: 225,
    co2Reduction: 285,
    eligibleSubsidies: ['waarde-check', 'isde'],
    reason: 'Comfort en isolatie, minder condensatie',
  },
  {
    id: 'warmtepomp',
    order: 5,
    name: 'Hybride Warmtepomp',
    category: 'installatie',
    icon: <Flame className="h-5 w-5" />,
    description: 'Combinatie warmtepomp + CV-ketel',
    baseCost: 5500,
    savingPerYear: 750,
    co2Reduction: 950,
    eligibleSubsidies: ['waarde-check', 'isde'],
    reason: 'Na isolatie: efficiënt verwarmen met minder gas',
  },
  {
    id: 'zonnepanelen',
    order: 6,
    name: 'Zonnepanelen',
    category: 'opwek',
    icon: <Sun className="h-5 w-5" />,
    description: '10-12 panelen voor gemiddeld huishouden',
    baseCost: 7000,
    savingPerYear: 700,
    co2Reduction: 1500,
    eligibleSubsidies: ['waarde-check'],
    reason: 'Eigen stroom opwekken, salderen tot 2027',
  },
]

function calculateSubsidyForStep(
  step: Omit<RoadmapStep, 'status'>,
  waardeCheckRemaining: number,
  nipAmount: number,
  nipUsed: boolean
): { subsidyAmount: number; newWaardeCheckRemaining: number; nipNowUsed: boolean; breakdown: string[] } {
  let subsidyAmount = 0
  let newWaardeCheckRemaining = waardeCheckRemaining
  let nipNowUsed = nipUsed
  const breakdown: string[] = []

  // NIP first (for isolation measures)
  if (!nipNowUsed && nipAmount > 0 && step.eligibleSubsidies.includes('nip')) {
    subsidyAmount += nipAmount
    nipNowUsed = true
    breakdown.push(`NIP: €${nipAmount}`)
  }

  // Then Waarde Check
  if (newWaardeCheckRemaining > 0 && step.eligibleSubsidies.includes('waarde-check')) {
    const waardeCheckContribution = Math.min(step.baseCost - subsidyAmount, newWaardeCheckRemaining)
    if (waardeCheckContribution > 0) {
      subsidyAmount += waardeCheckContribution
      newWaardeCheckRemaining -= waardeCheckContribution
      breakdown.push(`Waarde Check: €${waardeCheckContribution}`)
    }
  }

  // ISDE estimate (simplified)
  if (step.eligibleSubsidies.includes('isde')) {
    let isdeAmount = 0
    if (step.id === 'warmtepomp') isdeAmount = 2350
    else if (step.id === 'glas') isdeAmount = 500
    else if (step.id === 'dak' || step.id === 'vloer') isdeAmount = 200

    if (isdeAmount > 0) {
      subsidyAmount += isdeAmount
      breakdown.push(`ISDE: ~€${isdeAmount}`)
    }
  }

  return { subsidyAmount, newWaardeCheckRemaining, nipNowUsed, breakdown }
}

function ActieplanContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [profile, setProfile] = useState<HouseProfile | null>(null)
  const [expandedStep, setExpandedStep] = useState<string | null>('spouwmuur')

  useEffect(() => {
    async function loadData() {
      if (!token) return

      try {
        const response = await fetch(`/api/portal/dossier?token=${token}`)
        if (response.ok) {
          const data = await response.json()
          setCustomer(data.customer)
          setProfile(data.profile)
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
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Geen geldige toegangstoken gevonden.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Actieplan berekenen...</p>
      </div>
    )
  }

  // Calculate available subsidies
  const waardeCheckStatus = customer ? getWaardeCheckStatus(customer) : null
  const nipResult = profile ? calculateNIPSubsidy(profile) : null

  const initialWaardeCheck = waardeCheckStatus?.eligible ? waardeCheckStatus.totalAmount : 0
  const nipAmount = nipResult?.eligible ? nipResult.amount : 0

  // Build roadmap with costs
  let waardeCheckRemaining = initialWaardeCheck
  let nipUsed = false
  let totalBaseCost = 0
  let totalAfterSubsidy = 0
  let totalSavingPerYear = 0
  let totalCO2Reduction = 0

  const roadmapWithCosts = DEFAULT_ROADMAP.map((step, index) => {
    const { subsidyAmount, newWaardeCheckRemaining, nipNowUsed, breakdown } = calculateSubsidyForStep(
      step,
      waardeCheckRemaining,
      nipAmount,
      nipUsed
    )

    waardeCheckRemaining = newWaardeCheckRemaining
    nipUsed = nipNowUsed

    const finalCost = Math.max(0, step.baseCost - subsidyAmount)
    totalBaseCost += step.baseCost
    totalAfterSubsidy += finalCost
    totalSavingPerYear += step.savingPerYear
    totalCO2Reduction += step.co2Reduction

    return {
      ...step,
      subsidyAmount,
      finalCost,
      subsidyBreakdown: breakdown,
      status: index === 0 ? 'current' : 'upcoming' as const,
    }
  })

  const totalSubsidyUsed = totalBaseCost - totalAfterSubsidy
  const paybackYears = totalAfterSubsidy > 0 ? Math.round(totalAfterSubsidy / totalSavingPerYear * 10) / 10 : 0

  const categoryColors = {
    isolatie: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-amber-500' },
    installatie: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-500 to-pink-500' },
    opwek: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200', gradient: 'from-yellow-500 to-amber-500' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-4 right-4 opacity-10">
          <Rocket className="h-32 w-32" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 text-purple-200 text-sm mb-2">
            <Target className="h-4 w-4" />
            <span>Persoonlijk Actieplan</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Jouw Route naar Energielabel A</h1>
          <p className="text-purple-100 mb-4">
            6 stappen • {paybackYears} jaar terugverdientijd
          </p>

          {/* Quick stats in header */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-purple-200 text-xs mb-1">Investering</p>
              <p className="text-xl font-bold">€{totalAfterSubsidy.toLocaleString('nl-NL')}</p>
              <p className="text-purple-200 text-xs line-through">€{totalBaseCost.toLocaleString('nl-NL')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-purple-200 text-xs mb-1">Besparing</p>
              <p className="text-xl font-bold">€{totalSavingPerYear.toLocaleString('nl-NL')}</p>
              <p className="text-purple-200 text-xs">per jaar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-purple-200 text-xs mb-1">Subsidie</p>
              <p className="text-xl font-bold text-green-300">€{totalSubsidyUsed.toLocaleString('nl-NL')}</p>
              <p className="text-purple-200 text-xs">beschikbaar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if no profile */}
      {!profile && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">Huisdossier niet ingevuld</h3>
              <p className="text-sm text-amber-700 mb-3">
                Dit actieplan is een algemeen voorbeeld. Vul uw huisdossier in voor een persoonlijk plan op maat.
              </p>
              <Link
                href={`/portal/dossier?token=${token}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Huisdossier invullen
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Energy Label Improvement Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 p-1">
          <div className="bg-white rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Nu</p>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile?.energy_label || 'E'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gray-300" />
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="w-8 h-0.5 bg-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Doel</p>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    A
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-500">Geschatte waardestijging</p>
                <p className="text-2xl font-bold text-green-600">+€15.000 - €25.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Map className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Jouw Stappenplan</h2>
              <p className="text-sm text-gray-500">Klik op een stap voor details</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {roadmapWithCosts.map((step, index) => {
              const isExpanded = expandedStep === step.id
              const colors = categoryColors[step.category]

              return (
                <div key={step.id} className="relative">
                  {/* Connection line */}
                  {index < roadmapWithCosts.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 -mb-3" />
                  )}

                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className={`w-full text-left transition-all ${
                      isExpanded ? 'mb-0' : ''
                    }`}
                  >
                    <div className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      isExpanded
                        ? `${colors.bg} ${colors.border}`
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    }`}>
                      {/* Step number */}
                      <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                        step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : step.status === 'current'
                          ? `bg-gradient-to-br ${colors.gradient} text-white`
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          step.order
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{step.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {step.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{step.reason}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {step.finalCost === 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                            <BadgeCheck className="h-4 w-4" />
                            GRATIS
                          </span>
                        ) : (
                          <>
                            <p className="text-sm text-gray-400 line-through">€{step.baseCost}</p>
                            <p className="text-lg font-bold text-gray-900">€{step.finalCost}</p>
                          </>
                        )}
                      </div>

                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className={`ml-16 mr-4 mb-4 p-4 rounded-xl border ${colors.border} ${colors.bg}/30`}>
                      <p className="text-sm text-gray-600 mb-4">{step.description}</p>

                      {/* Subsidies */}
                      {step.subsidyBreakdown.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Beschikbare subsidies:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.subsidyBreakdown.map((item, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                                <Coins className="h-3 w-3" />
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 text-center">
                          <TrendingDown className="h-4 w-4 text-green-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-gray-900">€{step.savingPerYear}</p>
                          <p className="text-xs text-gray-500">besparing/jaar</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <Leaf className="h-4 w-4 text-green-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-gray-900">{step.co2Reduction} kg</p>
                          <p className="text-xs text-gray-500">CO₂ reductie</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-gray-900">{step.finalCost > 0 ? Math.round(step.finalCost / step.savingPerYear * 10) / 10 : 0}</p>
                          <p className="text-xs text-gray-500">jaar terugverdien</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Why this order */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Waarom deze volgorde?</h3>
              <p className="text-sm text-gray-500">De Trias Energetica</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">1</span>
                <span className="font-semibold text-gray-900">Isoleren</span>
              </div>
              <p className="text-sm text-gray-600">
                Verminder eerst de warmtevraag. Dit is het goedkoopst en geeft de meeste subsidie.
              </p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-8 w-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 font-bold">2</span>
                <span className="font-semibold text-gray-900">Installaties</span>
              </div>
              <p className="text-sm text-gray-600">
                Een warmtepomp werkt efficiënter in een goed geïsoleerd huis. Bespaar tot 50% gas.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 font-bold">3</span>
                <span className="font-semibold text-gray-900">Opwekken</span>
              </div>
              <p className="text-sm text-gray-600">
                Zonnepanelen voor de resterende (nu veel lagere) energievraag. Salderen tot 2027.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Totale besparing</p>
              <p className="text-3xl font-bold">€{totalSavingPerYear.toLocaleString('nl-NL')}/jaar</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sm text-green-100">
              Dat is <strong className="text-white">€{Math.round(totalSavingPerYear / 12)}</strong> per maand minder energiekosten
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">CO₂ reductie</p>
              <p className="text-3xl font-bold">{totalCO2Reduction.toLocaleString('nl-NL')} kg/jaar</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sm text-emerald-100">
              Equivalent van <strong className="text-white">{Math.round(totalCO2Reduction / 21)}</strong> bomen planten
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/portal/subsidies?token=${token}`}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          <Coins className="h-5 w-5" />
          Bekijk subsidie details
        </Link>
        <Link
          href={`/portal/dossier?token=${token}`}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <FileText className="h-5 w-5" />
          Huisdossier aanpassen
        </Link>
      </div>
    </div>
  )
}

export default function ActieplanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Actieplan berekenen...</p>
        </div>
      }
    >
      <ActieplanContent />
    </Suspense>
  )
}
