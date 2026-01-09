'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Coins,
  Gift,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Info,
  Calculator,
  TrendingUp,
  Clock,
  Home,
  Sparkles,
  ArrowRight,
  Wind,
  XCircle,
  HelpCircle,
  Euro,
  Percent,
  FileText,
  Building2,
  Lightbulb,
} from 'lucide-react'
import { isEligibleForWaardeCheck, getWaardeCheckStatus, WAARDE_CHECK_CONFIG } from '@/lib/subsidies/waarde-check'
import { calculateNIPSubsidy, getNIPExplanation, NIP_CONFIG } from '@/lib/subsidies/nip-subsidie'
import { calculateLoan, isEligibleForStimuleringslening, STIMULERINGSLENING_CONFIG, formatCurrency } from '@/lib/subsidies/stimuleringslening'
import type { HouseProfile, Customer } from '@/types/supabase'

function SubsidiesContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [profile, setProfile] = useState<HouseProfile | null>(null)
  const [activeCalculator, setActiveCalculator] = useState<number>(5000)

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
        <p className="text-gray-500">Subsidies berekenen...</p>
      </div>
    )
  }

  // Calculate eligibility
  const waardeCheckStatus = customer ? getWaardeCheckStatus(customer) : null
  const nipResult = profile ? calculateNIPSubsidy(profile) : null
  const stimuleringsleningEligible = customer && profile
    ? isEligibleForStimuleringslening(customer, profile)
    : { eligible: false, reasons: ['Vul eerst uw huisdossier in'] }

  // Calculate totals
  const totalSubsidies =
    (waardeCheckStatus?.eligible ? waardeCheckStatus.totalAmount : 0) +
    (nipResult?.eligible ? nipResult.amount : 0)

  const potentialISDE = 2500

  // Loan calculator
  const loanCalculation = calculateLoan(activeCalculator)

  return (
    <div className="space-y-6">
      {/* Header with total subsidies */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-4 right-4 opacity-10">
          <Gift className="h-32 w-32" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Beschikbaar voor u</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            €{totalSubsidies.toLocaleString('nl-NL')}
          </h1>
          <p className="text-amber-100 mb-4">
            aan subsidies en tegoed
          </p>

          {totalSubsidies > 0 && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mt-4">
              <p className="text-sm">
                Dit geld ligt op u te wachten! Gebruik het voor isolatie, een warmtepomp of zonnepanelen.
              </p>
            </div>
          )}

          {potentialISDE > 0 && (
            <p className="text-amber-200 text-sm mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              + mogelijk €{potentialISDE.toLocaleString('nl-NL')} ISDE bij warmtepomp/isolatie
            </p>
          )}
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
                Vul uw huisdossier in om een nauwkeurige berekening te krijgen van uw subsidies.
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

      {/* Subsidy Cards */}
      <div className="space-y-4">
        {/* Waarde Check Bon */}
        {waardeCheckStatus && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`px-6 py-4 border-b ${
              waardeCheckStatus.eligible
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
                : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    waardeCheckStatus.eligible ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Wind className={`h-6 w-6 ${waardeCheckStatus.eligible ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Waarde Check Bon A16</h3>
                    <p className="text-sm text-gray-500">Windmolens A16</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${waardeCheckStatus.eligible ? 'text-green-600' : 'text-gray-400'}`}>
                    €{waardeCheckStatus.totalAmount.toLocaleString('nl-NL')}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    waardeCheckStatus.eligible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {waardeCheckStatus.eligible ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Beschikbaar
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Niet beschikbaar
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Gratis tegoed van de Windmolens A16. Te besteden aan energiebesparende maatregelen in uw woning.
              </p>

              <div className="space-y-2 mb-4">
                {waardeCheckStatus.eligible ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>Uw postcode ({customer?.postal_code}) komt in aanmerking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>€{waardeCheckStatus.totalAmount} direct besteedbaar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>Te gebruiken voor isolatie, warmtepomp, zonnepanelen</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Uw postcode valt buiten het deelnamegebied</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <span>Alleen voor postcodes 4765, 4781, 4782, 4767</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span>Geldig tot: 31 december 2026</span>
                </div>
                <a
                  href="https://www.waardecheck.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Meer info <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* NIP Subsidie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`px-6 py-4 border-b ${
            nipResult?.eligible
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
              : profile
              ? 'bg-gray-50 border-gray-100'
              : 'bg-yellow-50 border-yellow-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  nipResult?.eligible ? 'bg-green-100' : profile ? 'bg-gray-100' : 'bg-yellow-100'
                }`}>
                  <Home className={`h-6 w-6 ${
                    nipResult?.eligible ? 'text-green-600' : profile ? 'text-gray-400' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">NIP Subsidie</h3>
                  <p className="text-sm text-gray-500">Nationaal Isolatieprogramma</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  nipResult?.eligible ? 'text-green-600' : profile ? 'text-gray-400' : 'text-yellow-600'
                }`}>
                  {nipResult?.eligible ? `€${nipResult.amount.toLocaleString('nl-NL')}` : profile ? '€0' : '?'}
                </p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  nipResult?.eligible
                    ? 'bg-green-100 text-green-700'
                    : profile
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {nipResult?.eligible ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      In aanmerking
                    </>
                  ) : profile ? (
                    <>
                      <XCircle className="h-3 w-3" />
                      Niet in aanmerking
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-3 w-3" />
                      Vul dossier in
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Subsidie voor woningen gebouwd vóór 1993 met energielabel D t/m G of minimaal 2 slecht geïsoleerde bouwdelen.
            </p>

            <div className="space-y-2 mb-4">
              {nipResult ? getNIPExplanation(nipResult).map((detail, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${
                  detail.startsWith('✓') ? 'text-green-700' : detail.startsWith('✗') ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {detail.startsWith('✓') ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : detail.startsWith('✗') ? (
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{detail.replace(/^[✓✗○•]\s*/, '')}</span>
                </div>
              )) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HelpCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Bouwjaar: onbekend (moet vóór 1993)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HelpCircle className="h-4 w-4 flex-shrink-0" />
                    <span>WOZ-waarde: onbekend (max €477.000)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HelpCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Energielabel: onbekend (D/E/F/G)</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>2026 (op is op)</span>
              </div>
              <a
                href={NIP_CONFIG.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Meer info <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* ISDE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ISDE Subsidie</h3>
                  <p className="text-sm text-gray-500">Investeringssubsidie</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">€500 - €5.600</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Altijd beschikbaar
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Subsidie voor warmtepompen, zonneboilers en isolatiemaatregelen. Bedrag afhankelijk van maatregel.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Hybride warmtepomp', amount: '€1.900 - €2.800' },
                { label: 'Lucht-water warmtepomp', amount: '€2.100 - €3.700' },
                { label: 'HR++ glas', amount: '€75/m²' },
                { label: 'Isolatie', amount: 'Diverse bedragen' },
              ].map((item) => (
                <div key={item.label} className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-blue-600 font-semibold">{item.amount}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Aanvragen via RVO na uitvoering</p>
              <a
                href="https://www.rvo.nl/subsidies-financiering/isde"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Meer info <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Stimuleringslening */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`px-6 py-4 border-b ${
            stimuleringsleningEligible.eligible
              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
              : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  stimuleringsleningEligible.eligible ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <Percent className={`h-6 w-6 ${
                    stimuleringsleningEligible.eligible ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Stimuleringslening Moerdijk</h3>
                  <p className="text-sm text-gray-500">Voordelige lening</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  stimuleringsleningEligible.eligible ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  1,7%
                </p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stimuleringsleningEligible.eligible
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {stimuleringsleningEligible.eligible ? 'Lening mogelijk' : 'Niet in aanmerking'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Voordelige lening van €2.500 tot €35.000 voor energiebesparende maatregelen. Extreem lage rente van slechts 1,7%.
            </p>

            {/* Interactive Calculator */}
            <div className="bg-purple-50 rounded-xl p-5 mb-4 border border-purple-100">
              <div className="flex items-center gap-2 text-purple-800 font-medium mb-4">
                <Calculator className="h-5 w-5" />
                <span>Bereken uw maandlasten</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Leenbedrag</label>
                <div className="flex gap-2 flex-wrap">
                  {[3000, 5000, 10000, 15000, 25000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setActiveCalculator(amount)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeCalculator === amount
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      €{amount.toLocaleString('nl-NL')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-purple-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Maandlast</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(loanCalculation.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Looptijd</p>
                    <p className="text-xl font-bold text-gray-900">{loanCalculation.years} jaar</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Totale rente</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(loanCalculation.totalInterest)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {stimuleringsleningEligible.reasons.map((reason, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${
                  stimuleringsleningEligible.eligible ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {stimuleringsleningEligible.eligible ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <a
                href={STIMULERINGSLENING_CONFIG.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Meer info <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* What can you do with the subsidies? */}
      {totalSubsidies > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wat kunt u doen met €{totalSubsidies.toLocaleString('nl-NL')}?</h3>
                <p className="text-sm text-gray-500">Uw subsidie slim inzetten</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {[
                {
                  measure: 'Spouwmuurisolatie',
                  cost: 1800,
                  saving: 450,
                  description: 'Tot 25% besparing op gas',
                  icon: '🧱',
                },
                {
                  measure: 'Vloerisolatie',
                  cost: 1500,
                  saving: 180,
                  description: 'Warme voeten, minder tocht',
                  icon: '🏠',
                },
                {
                  measure: 'HR++ Glas',
                  cost: 4000,
                  saving: 225,
                  description: 'Comfort en warmtebehoud',
                  icon: '🪟',
                },
              ].map((item) => {
                const afterSubsidy = Math.max(0, item.cost - totalSubsidies)
                const isFree = afterSubsidy === 0
                return (
                  <div key={item.measure} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.measure}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 line-through">€{item.cost}</p>
                      <p className={`font-bold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                        {isFree ? 'GRATIS!' : `€${afterSubsidy}`}
                      </p>
                      <p className="text-xs text-green-600">Besparing: €{item.saving}/jaar</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/portal/actieplan?token=${token}`}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          Bekijk uw persoonlijke actieplan
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href={`/portal/dossier?token=${token}`}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <FileText className="h-5 w-5" />
          Huisdossier aanpassen
        </Link>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Hoe werkt het aanvragen?</p>
            <p>
              De meeste subsidies worden door uw installateur voor u aangevraagd. U ontvangt het bedrag terug nadat de werkzaamheden zijn uitgevoerd.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SubsidiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Subsidies berekenen...</p>
        </div>
      }
    >
      <SubsidiesContent />
    </Suspense>
  )
}
