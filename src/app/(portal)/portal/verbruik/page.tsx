'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Flame,
  Zap,
  Sun,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Loader2,
  Save,
  Info,
  ChevronRight,
  Receipt,
  Sparkles,
  ArrowRight,
  Calendar,
  Euro,
  Building2,
} from 'lucide-react'
import { getReferenceConsumption, compareWithReference, estimateEnergyCosts, calculateInsulationSavings } from '@/lib/reference-consumption'
import type { PropertyType, HouseProfile } from '@/types/supabase'

type FormData = {
  year: number
  gas_m3: string
  gas_cost_euro: string
  electricity_kwh_total: string
  electricity_kwh_high: string
  electricity_kwh_low: string
  electricity_cost_euro: string
  electricity_returned_kwh: string
  energy_supplier: string
}

function VerbruikContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [houseProfile, setHouseProfile] = useState<HouseProfile | null>(null)

  const [formData, setFormData] = useState<FormData>({
    year: new Date().getFullYear() - 1,
    gas_m3: '',
    gas_cost_euro: '',
    electricity_kwh_total: '',
    electricity_kwh_high: '',
    electricity_kwh_low: '',
    electricity_cost_euro: '',
    electricity_returned_kwh: '',
    energy_supplier: '',
  })

  // Load existing data
  useEffect(() => {
    async function loadData() {
      if (!token) return

      try {
        // Load house profile
        const profileRes = await fetch(`/api/portal/dossier?token=${token}`)
        if (profileRes.ok) {
          const data = await profileRes.json()
          if (data.profile) {
            setHouseProfile(data.profile)
          }
        }

        // Load existing consumption data
        const consumptionRes = await fetch(`/api/portal/verbruik?token=${token}&year=${formData.year}`)
        if (consumptionRes.ok) {
          const data = await consumptionRes.json()
          if (data.consumption) {
            setFormData({
              year: data.consumption.year || formData.year,
              gas_m3: data.consumption.gas_m3?.toString() || '',
              gas_cost_euro: data.consumption.gas_cost_euro?.toString() || '',
              electricity_kwh_total: data.consumption.electricity_kwh_total?.toString() || '',
              electricity_kwh_high: data.consumption.electricity_kwh_high?.toString() || '',
              electricity_kwh_low: data.consumption.electricity_kwh_low?.toString() || '',
              electricity_cost_euro: data.consumption.electricity_cost_euro?.toString() || '',
              electricity_returned_kwh: data.consumption.electricity_returned_kwh?.toString() || '',
              energy_supplier: data.consumption.energy_supplier || '',
            })
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  const handleYearChange = async (newYear: number) => {
    setFormData({ ...formData, year: newYear })

    if (!token) return

    try {
      const consumptionRes = await fetch(`/api/portal/verbruik?token=${token}&year=${newYear}`)
      if (consumptionRes.ok) {
        const data = await consumptionRes.json()
        if (data.consumption) {
          setFormData({
            year: newYear,
            gas_m3: data.consumption.gas_m3?.toString() || '',
            gas_cost_euro: data.consumption.gas_cost_euro?.toString() || '',
            electricity_kwh_total: data.consumption.electricity_kwh_total?.toString() || '',
            electricity_kwh_high: data.consumption.electricity_kwh_high?.toString() || '',
            electricity_kwh_low: data.consumption.electricity_kwh_low?.toString() || '',
            electricity_cost_euro: data.consumption.electricity_cost_euro?.toString() || '',
            electricity_returned_kwh: data.consumption.electricity_returned_kwh?.toString() || '',
            energy_supplier: data.consumption.energy_supplier || '',
          })
        } else {
          // Clear form for new year
          setFormData({
            year: newYear,
            gas_m3: '',
            gas_cost_euro: '',
            electricity_kwh_total: '',
            electricity_kwh_high: '',
            electricity_kwh_low: '',
            electricity_cost_euro: '',
            electricity_returned_kwh: '',
            energy_supplier: '',
          })
        }
      }
    } catch (err) {
      console.error('Error loading year data:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setError(null)
    setSaving(true)

    try {
      const response = await fetch(`/api/portal/verbruik?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: formData.year,
          gas_m3: formData.gas_m3 ? parseInt(formData.gas_m3) : null,
          gas_cost_euro: formData.gas_cost_euro ? parseFloat(formData.gas_cost_euro) : null,
          electricity_kwh_total: formData.electricity_kwh_total ? parseInt(formData.electricity_kwh_total) : null,
          electricity_kwh_high: formData.electricity_kwh_high ? parseInt(formData.electricity_kwh_high) : null,
          electricity_kwh_low: formData.electricity_kwh_low ? parseInt(formData.electricity_kwh_low) : null,
          electricity_cost_euro: formData.electricity_cost_euro ? parseFloat(formData.electricity_cost_euro) : null,
          electricity_returned_kwh: formData.electricity_returned_kwh ? parseInt(formData.electricity_returned_kwh) : null,
          energy_supplier: formData.energy_supplier || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Opslaan mislukt')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Er is iets misgegaan bij het opslaan')
    } finally {
      setSaving(false)
    }
  }

  // Calculate comparison with reference
  const reference = houseProfile?.property_type && houseProfile?.year_built
    ? getReferenceConsumption(houseProfile.property_type as PropertyType, houseProfile.year_built)
    : null

  const gasValue = formData.gas_m3 ? parseInt(formData.gas_m3) : 0
  const elecValue = formData.electricity_kwh_total ? parseInt(formData.electricity_kwh_total) : 0
  const returnValue = formData.electricity_returned_kwh ? parseInt(formData.electricity_returned_kwh) : 0

  const comparison = reference && gasValue && elecValue
    ? compareWithReference(gasValue, elecValue, reference)
    : null

  const costs = gasValue || elecValue
    ? estimateEnergyCosts(gasValue, elecValue, returnValue)
    : null

  const insulationSavings = houseProfile && gasValue
    ? calculateInsulationSavings(
        gasValue,
        houseProfile.wall_insulation || false,
        houseProfile.floor_insulation || false,
        houseProfile.roof_insulation || false,
        houseProfile.glass_type || 'dubbel'
      )
    : []

  const totalSavings = insulationSavings.reduce((sum, s) => sum + s.savingEuro, 0)

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
        <p className="text-gray-500">Verbruiksgegevens laden...</p>
      </div>
    )
  }

  const propertyTypeLabels: Record<string, string> = {
    tussenwoning: 'Tussenwoning',
    vrijstaand: 'Vrijstaande woning',
    twee_onder_een_kap: '2-onder-1-kap',
    hoekwoning: 'Hoekwoning',
    appartement: 'Appartement',
  }

  return (
    <div className="space-y-6">
      {/* Header with cost overview */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 text-emerald-200 text-sm mb-2">
            <BarChart3 className="h-4 w-4" />
            <span>Energieverbruik</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Jouw Verbruik</h1>
          <p className="text-emerald-100 mb-4">
            Inzicht in je energie en besparingspotentieel
          </p>

          {costs && (gasValue || elecValue) ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-orange-300 text-sm mb-1">
                  <Flame className="h-4 w-4" />
                  <span>Gas</span>
                </div>
                <p className="text-2xl font-bold">{gasValue.toLocaleString('nl-NL')} m³</p>
                <p className="text-emerald-200 text-sm">€{costs.gasCost}/jaar</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-300 text-sm mb-1">
                  <Zap className="h-4 w-4" />
                  <span>Stroom</span>
                </div>
                <p className="text-2xl font-bold">{elecValue.toLocaleString('nl-NL')} kWh</p>
                <p className="text-emerald-200 text-sm">€{costs.electricityCost}/jaar</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
              <p className="text-emerald-100 text-sm">
                Vul je verbruiksgegevens in om inzicht te krijgen in je energiekosten en besparingspotentieel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* No house profile warning */}
      {!houseProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">Vul eerst je huisdossier in</h3>
              <p className="text-sm text-amber-700 mb-3">
                Om je verbruik te vergelijken met soortgelijke woningen, hebben we je woninggegevens nodig.
              </p>
              <Link
                href={`/portal/dossier?token=${token}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Naar huisdossier
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Savings highlight - only show if there are savings */}
      {totalSavings > 0 && (
        <Link href={`/portal/actieplan?token=${token}`} className="block group">
          <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 opacity-10">
              <TrendingDown className="h-24 w-24 -mt-4 -mr-4" />
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-100 text-sm mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Besparingspotentieel</span>
                </div>
                <p className="text-3xl font-bold">€{totalSavings}/jaar</p>
                <p className="text-green-100 text-sm mt-1">
                  {insulationSavings.length} mogelijke maatregelen
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium group-hover:bg-white/30 transition-colors">
                Bekijk actieplan
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Jaarverbruik invoeren</h2>
                  <p className="text-sm text-gray-500">Van je jaarafrekening</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Year selector */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Jaar
                </label>
                <div className="flex gap-2">
                  {[2024, 2023, 2022, 2021].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearChange(y)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        formData.year === y
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gas Section */}
              <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-700 mb-4">
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="font-semibold">Gasverbruik</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Verbruik
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="1500"
                        value={formData.gas_m3}
                        onChange={(e) => setFormData({ ...formData, gas_m3: e.target.value })}
                        className="w-full pl-3 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m³</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Kosten
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1800"
                        value={formData.gas_cost_euro}
                        onChange={(e) => setFormData({ ...formData, gas_cost_euro: e.target.value })}
                        className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Electricity Section */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-4">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-semibold">Elektriciteit</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Totaal verbruik
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="3500"
                        value={formData.electricity_kwh_total}
                        onChange={(e) => setFormData({ ...formData, electricity_kwh_total: e.target.value })}
                        className="w-full pl-3 pr-14 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Kosten
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1200"
                        value={formData.electricity_cost_euro}
                        onChange={(e) => setFormData({ ...formData, electricity_cost_euro: e.target.value })}
                        className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Piek/normaal <span className="text-gray-400">(optioneel)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="-"
                        value={formData.electricity_kwh_high}
                        onChange={(e) => setFormData({ ...formData, electricity_kwh_high: e.target.value })}
                        className="w-full pl-3 pr-14 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Dal tarief <span className="text-gray-400">(optioneel)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="-"
                        value={formData.electricity_kwh_low}
                        onChange={(e) => setFormData({ ...formData, electricity_kwh_low: e.target.value })}
                        className="w-full pl-3 pr-14 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solar return */}
              <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center gap-2 text-yellow-700 mb-4">
                  <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Sun className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="font-semibold">Teruglevering</span>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Zonnepanelen</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Teruggeleverd aan het net
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="2000"
                      value={formData.electricity_returned_kwh}
                      onChange={(e) => setFormData({ ...formData, electricity_returned_kwh: e.target.value })}
                      className="w-full pl-3 pr-14 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh</span>
                  </div>
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Energieleverancier <span className="text-gray-400 font-normal">(optioneel)</span>
                </label>
                <input
                  placeholder="bijv. Eneco, Vattenfall, Essent"
                  value={formData.energy_supplier}
                  onChange={(e) => setFormData({ ...formData, energy_supplier: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Save button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Opslaan...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Opgeslagen!
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Opslaan in dossier
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Results & Comparison */}
        <div className="space-y-4">
          {/* Cost summary card */}
          {costs && (gasValue || elecValue) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Euro className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Energiekosten {formData.year}</h2>
                    <p className="text-sm text-gray-500">Op basis van je invoer</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">Gas</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">€{costs.gasCost}</p>
                    <p className="text-sm text-gray-500">{gasValue.toLocaleString('nl-NL')} m³</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">Stroom</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">€{costs.electricityCost}</p>
                    <p className="text-sm text-gray-500">{elecValue.toLocaleString('nl-NL')} kWh</p>
                  </div>
                </div>

                {costs.returnValue > 0 && (
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl border border-yellow-100 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Sun className="h-4 w-4" />
                        <span className="text-sm font-medium">Teruglevering</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">-€{costs.returnValue}</p>
                        <p className="text-xs text-gray-500">{returnValue.toLocaleString('nl-NL')} kWh</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-600">Totaal per jaar</span>
                    <span className="text-3xl font-bold text-gray-900">€{costs.totalCost}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Gemiddeld per maand</span>
                    <span className="font-medium">€{Math.round(costs.totalCost / 12)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparison with reference */}
          {comparison && reference && houseProfile && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Vergelijking</h2>
                    <p className="text-sm text-gray-500">
                      {propertyTypeLabels[houseProfile.property_type || ''] || 'Woning'}, bouwjaar {houseProfile.year_built}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Gas comparison */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Gas
                    </span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      comparison.gasComparison === 'onder'
                        ? 'bg-green-100 text-green-700'
                        : comparison.gasComparison === 'boven'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {comparison.gasComparison === 'onder' ? 'Onder gemiddeld' :
                       comparison.gasComparison === 'boven' ? 'Boven gemiddeld' :
                       'Gemiddeld'}
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-gray-200 rounded-full" style={{ width: '100%' }} />
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        comparison.gasComparison === 'onder' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        comparison.gasComparison === 'boven' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      }`}
                      style={{ width: `${Math.min(comparison.gasPercentage, 100)}%` }}
                    />
                    {comparison.gasPercentage <= 100 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-400 rounded"
                        style={{ left: '100%', marginLeft: '-2px' }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Jij: <strong className="text-gray-700">{gasValue} m³</strong></span>
                    <span>Referentie: {reference.gasMin}-{reference.gasMax} m³</span>
                  </div>
                </div>

                {/* Electricity comparison */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Elektriciteit
                    </span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      comparison.elecComparison === 'onder'
                        ? 'bg-green-100 text-green-700'
                        : comparison.elecComparison === 'boven'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {comparison.elecComparison === 'onder' ? 'Onder gemiddeld' :
                       comparison.elecComparison === 'boven' ? 'Boven gemiddeld' :
                       'Gemiddeld'}
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-gray-200 rounded-full" style={{ width: '100%' }} />
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        comparison.elecComparison === 'onder' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        comparison.elecComparison === 'boven' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      }`}
                      style={{ width: `${Math.min(comparison.elecPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Jij: <strong className="text-gray-700">{elecValue} kWh</strong></span>
                    <span>Referentie: {reference.elecMin}-{reference.elecMax} kWh</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Savings potential details */}
          {insulationSavings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Besparingsmogelijkheden</h2>
                    <p className="text-sm text-green-700">Op basis van je isolatiestatus</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  {insulationSavings.map((saving, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700">{saving.measure}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">-€{saving.savingEuro}/jaar</p>
                        <p className="text-xs text-gray-500">-{saving.savingM3} m³ gas</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800">Totaal potentieel</span>
                    <span className="text-2xl font-bold text-green-600">
                      -€{totalSavings}/jaar
                    </span>
                  </div>
                </div>

                <Link
                  href={`/portal/actieplan?token=${token}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Bekijk je persoonlijke actieplan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Empty state when no data */}
          {!costs && !(gasValue || elecValue) && (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nog geen verbruik ingevuld</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Vul je jaarverbruik in via het formulier om inzicht te krijgen in je energiekosten en besparingspotentieel.
              </p>
            </div>
          )}

          {/* Info card */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Waar vind ik mijn verbruik?</p>
                <p>Je vindt je jaarverbruik op je jaarafrekening van je energieleverancier, of in de app van je leverancier onder "Mijn verbruik".</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerbruikPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Verbruiksgegevens laden...</p>
      </div>
    }>
      <VerbruikContent />
    </Suspense>
  )
}
