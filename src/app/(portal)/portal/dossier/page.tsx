'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Calendar,
  Ruler,
  Thermometer,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Flame,
  Sun,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { getBuildingPeriod, getImprovementPotentialColor, getImprovementPotentialLabel } from '@/lib/building-periods'
import type { PropertyType, GlassType, HeatingType } from '@/types/supabase'

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'vrijstaand', label: 'Vrijstaand', icon: '🏠' },
  { value: 'twee_onder_een_kap', label: '2-onder-1-kap', icon: '🏘️' },
  { value: 'hoekwoning', label: 'Hoekwoning', icon: '🏡' },
  { value: 'tussenwoning', label: 'Rijtjeswoning', icon: '🏘️' },
  { value: 'appartement', label: 'Appartement', icon: '🏢' },
  { value: 'overig', label: 'Overig', icon: '🏗️' },
]

const ENERGY_LABELS = ['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

const GLASS_TYPES: { value: GlassType; label: string }[] = [
  { value: 'enkel', label: 'Enkel glas' },
  { value: 'dubbel', label: 'Dubbel glas' },
  { value: 'hr', label: 'HR glas' },
  { value: 'hr_plus', label: 'HR+ glas' },
  { value: 'hr_plus_plus', label: 'HR++ glas' },
  { value: 'triple', label: 'Triple glas' },
]

const HEATING_TYPES: { value: HeatingType; label: string; icon: string }[] = [
  { value: 'cv_ketel', label: 'CV-ketel (gas)', icon: '🔥' },
  { value: 'warmtepomp', label: 'Warmtepomp', icon: '♨️' },
  { value: 'hybride', label: 'Hybride warmtepomp', icon: '⚡' },
  { value: 'stadsverwarming', label: 'Stadsverwarming', icon: '🏭' },
  { value: 'elektrisch', label: 'Elektrisch', icon: '🔌' },
]

type FormData = {
  property_type: PropertyType | ''
  year_built: string
  living_area_m2: string
  woz_value: string
  energy_label: string
  wall_insulation: boolean | null
  floor_insulation: boolean | null
  roof_insulation: boolean | null
  glass_type: GlassType | ''
  heating_type: HeatingType | ''
  solar_panels: boolean
  solar_panels_count: string
}

function DossierContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState<FormData>({
    property_type: '',
    year_built: '',
    living_area_m2: '',
    woz_value: '',
    energy_label: '',
    wall_insulation: null,
    floor_insulation: null,
    roof_insulation: null,
    glass_type: '',
    heating_type: '',
    solar_panels: false,
    solar_panels_count: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    async function loadProfile() {
      if (!token) return

      try {
        const response = await fetch(`/api/portal/dossier?token=${token}`)
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setFormData({
              property_type: data.profile.property_type || '',
              year_built: data.profile.year_built?.toString() || '',
              living_area_m2: data.profile.living_area_m2?.toString() || '',
              woz_value: data.profile.woz_value?.toString() || '',
              energy_label: data.profile.energy_label || '',
              wall_insulation: data.profile.wall_insulation,
              floor_insulation: data.profile.floor_insulation,
              roof_insulation: data.profile.roof_insulation,
              glass_type: data.profile.glass_type || '',
              heating_type: data.profile.heating_type || '',
              solar_panels: data.profile.solar_panels || false,
              solar_panels_count: data.profile.solar_panels_count?.toString() || '',
            })
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  const yearBuilt = parseInt(formData.year_built) || 0
  const buildingPeriod = yearBuilt > 0 ? getBuildingPeriod(yearBuilt) : null

  // Calculate completion percentage
  const filledFields = [
    formData.property_type,
    formData.year_built,
    formData.living_area_m2,
    formData.energy_label,
    formData.wall_insulation !== null,
    formData.roof_insulation !== null,
    formData.floor_insulation !== null,
    formData.glass_type,
    formData.heating_type,
  ].filter(Boolean).length
  const completionPercentage = Math.round((filledFields / 9) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch('/api/portal/dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          profile: {
            property_type: formData.property_type || null,
            year_built: formData.year_built ? parseInt(formData.year_built) : null,
            living_area_m2: formData.living_area_m2 ? parseInt(formData.living_area_m2) : null,
            woz_value: formData.woz_value ? parseInt(formData.woz_value) : null,
            energy_label: formData.energy_label || null,
            wall_insulation: formData.wall_insulation,
            floor_insulation: formData.floor_insulation,
            roof_insulation: formData.roof_insulation,
            glass_type: formData.glass_type || null,
            heating_type: formData.heating_type || null,
            solar_panels: formData.solar_panels,
            solar_panels_count: formData.solar_panels_count ? parseInt(formData.solar_panels_count) : null,
          },
        }),
      })

      if (!response.ok) throw new Error('Opslaan mislukt')

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Er is iets misgegaan bij het opslaan')
    } finally {
      setSaving(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
        Geen geldige toegangstoken gevonden.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Gegevens laden...</p>
      </div>
    )
  }

  const sections = [
    { title: 'Woning', icon: <Home className="h-5 w-5" /> },
    { title: 'Isolatie', icon: <Thermometer className="h-5 w-5" /> },
    { title: 'Installaties', icon: <Flame className="h-5 w-5" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
            <Home className="h-4 w-4" />
            <span>Huisdossier</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Uw woninggegevens</h1>
          <p className="text-blue-100 text-sm">
            Vul uw woninggegevens in voor persoonlijk advies en subsidieberekening
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Profiel compleetheid</span>
          <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        {completionPercentage < 100 && (
          <p className="text-xs text-gray-500 mt-2">
            Hoe meer u invult, hoe nauwkeuriger uw subsidieberekening
          </p>
        )}
      </div>

      {/* Building Period Info */}
      {buildingPeriod && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="p-3 bg-amber-100 rounded-xl h-fit">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">
                Bouwperiode: {buildingPeriod.name}
              </p>
              <p className="text-sm text-amber-800 mb-3">
                {buildingPeriod.description}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getImprovementPotentialColor(buildingPeriod.improvementPotential)}`}>
                {getImprovementPotentialLabel(buildingPeriod.improvementPotential)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section, index) => (
          <button
            key={section.title}
            onClick={() => setActiveSection(index)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === index
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {section.icon}
            {section.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Woning */}
        {activeSection === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Woningtype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, property_type: type.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.property_type === type.value
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{type.icon}</span>
                    <span className={`text-sm font-medium ${
                      formData.property_type === type.value ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Year & Size */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bouwjaar
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                    placeholder="bijv. 1975"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Woonoppervlakte
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={formData.living_area_m2}
                    onChange={(e) => setFormData({ ...formData, living_area_m2: e.target.value })}
                    placeholder="bijv. 120"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
                </div>
              </div>
            </div>

            {/* WOZ & Energy Label */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  WOZ-waarde
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={formData.woz_value}
                    onChange={(e) => setFormData({ ...formData, woz_value: e.target.value })}
                    placeholder="bijv. 350000"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-500">Staat op uw WOZ-beschikking</p>
                  <a
                    href="https://www.wozwaardeloket.nl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Opzoeken
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Energielabel
                </label>
                <select
                  value={formData.energy_label}
                  onChange={(e) => setFormData({ ...formData, energy_label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                >
                  <option value="">Onbekend</option>
                  {ENERGY_LABELS.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Isolatie */}
        {activeSection === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Insulation Options */}
            {[
              { key: 'wall_insulation', label: 'Spouwmuurisolatie', description: 'Is uw spouwmuur geïsoleerd?' },
              { key: 'roof_insulation', label: 'Dakisolatie', description: 'Is uw dak geïsoleerd?' },
              { key: 'floor_insulation', label: 'Vloerisolatie', description: 'Is uw vloer geïsoleerd?' },
            ].map((item) => (
              <div key={item.key} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: true, label: 'Ja', color: 'green' },
                    { value: false, label: 'Nee', color: 'red' },
                    { value: null, label: 'Weet niet', color: 'gray' },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setFormData({ ...formData, [item.key]: option.value })}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        formData[item.key as keyof FormData] === option.value
                          ? option.color === 'green'
                            ? 'bg-green-600 text-white'
                            : option.color === 'red'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Glass Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Type beglazing
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GLASS_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, glass_type: type.value })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      formData.glass_type === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Installaties */}
        {activeSection === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Heating Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Verwarming
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HEATING_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, heating_type: type.value })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      formData.heating_type === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className={`font-medium ${
                      formData.heating_type === type.value ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solar Panels */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Sun className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Zonnepanelen</p>
                  <p className="text-sm text-gray-600">Heeft u zonnepanelen?</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, solar_panels: true })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.solar_panels
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, solar_panels: false, solar_panels_count: '' })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !formData.solar_panels
                      ? 'bg-gray-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Nee
                </button>
              </div>

              {formData.solar_panels && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aantal panelen
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.solar_panels_count}
                    onChange={(e) => setFormData({ ...formData, solar_panels_count: e.target.value })}
                    placeholder="bijv. 12"
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            Gegevens succesvol opgeslagen!
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Opslaan
              </>
            )}
          </button>

          <Link
            href={`/portal/subsidies?token=${token}`}
            className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
          >
            Bekijk subsidies
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function DossierPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Laden...</p>
        </div>
      }
    >
      <DossierContent />
    </Suspense>
  )
}
