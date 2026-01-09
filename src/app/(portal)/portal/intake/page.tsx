'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, CheckCircle2, Loader2 } from 'lucide-react'

type IntakeForm = {
  meter_location: string
  meter_accessibility: string
  parking_available: boolean
  parking_notes: string
  pets: boolean
  pets_notes: string
  doorbell_works: boolean
  special_instructions: string
}

function IntakeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<IntakeForm>({
    meter_location: '',
    meter_accessibility: '',
    parking_available: true,
    parking_notes: '',
    pets: false,
    pets_notes: '',
    doorbell_works: true,
    special_instructions: '',
  })

  // Load existing intake form if available
  useEffect(() => {
    if (!token) return

    const loadExistingForm = async () => {
      try {
        const response = await fetch(`/api/portal/intake?token=${token}`)
        const result = await response.json()

        if (result.data) {
          // Parse stored data back into form fields
          const data = result.data
          setForm({
            meter_location: data.location || '',
            meter_accessibility: data.accessibility || '',
            parking_available: !data.parking_info?.startsWith('Geen'),
            parking_notes: '',
            pets: data.pets?.includes('aanwezig') || false,
            pets_notes: '',
            doorbell_works: !data.notes?.includes('Deurbel werkt niet'),
            special_instructions: data.notes?.replace('Deurbel werkt niet. ', '').replace('. Deurbel werkt niet', '') || '',
          })
        }
      } catch (err) {
        // Silently fail - form will just be empty
      }
    }

    loadExistingForm()
  }, [token])

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Geen geldige toegangstoken gevonden.
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/portal/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          location: form.meter_location,
          accessibility: form.meter_accessibility,
          parking_available: form.parking_available,
          parking_notes: form.parking_notes,
          pets_present: form.pets,
          pets_info: form.pets_notes,
          doorbell_works: form.doorbell_works,
          notes: form.special_instructions,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bedankt voor het invullen!
          </h1>
          <p className="text-gray-600">
            Uw gegevens zijn opgeslagen. De Energie Buddy kan zich nu goed voorbereiden
            op de installatie.
          </p>
          <a
            href={`/portal?token=${token}`}
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Terug naar overzicht
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Intake formulier</h1>
        <p className="text-gray-600 mt-1">
          Help ons voorbereiden door wat informatie te delen
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meterkast */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Meterkast</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waar bevindt de meterkast zich?
              </label>
              <select
                value={form.meter_location}
                onChange={(e) => setForm({ ...form, meter_location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecteer locatie</option>
                <option value="hal">Hal / Gang</option>
                <option value="kelder">Kelder</option>
                <option value="garage">Garage</option>
                <option value="berging">Berging</option>
                <option value="buiten">Buitenkast</option>
                <option value="anders">Anders</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hoe toegankelijk is de meterkast?
              </label>
              <select
                value={form.meter_accessibility}
                onChange={(e) => setForm({ ...form, meter_accessibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecteer toegankelijkheid</option>
                <option value="goed">Goed bereikbaar, voldoende ruimte</option>
                <option value="beperkt">Beperkt bereikbaar, weinig ruimte</option>
                <option value="moeilijk">Moeilijk bereikbaar, zeer krap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Praktische zaken */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Praktische zaken
          </h2>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.parking_available}
                  onChange={(e) => setForm({ ...form, parking_available: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  Er is parkeergelegenheid voor de Energie Buddy
                </span>
              </label>
              {!form.parking_available && (
                <input
                  type="text"
                  value={form.parking_notes}
                  onChange={(e) => setForm({ ...form, parking_notes: e.target.value })}
                  placeholder="Tips voor parkeren?"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.pets}
                  onChange={(e) => setForm({ ...form, pets: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  Er zijn huisdieren aanwezig
                </span>
              </label>
              {form.pets && (
                <input
                  type="text"
                  value={form.pets_notes}
                  onChange={(e) => setForm({ ...form, pets_notes: e.target.value })}
                  placeholder="Welke huisdieren? (bijv. hond, kat)"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.doorbell_works}
                  onChange={(e) => setForm({ ...form, doorbell_works: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  De deurbel werkt
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Extra opmerkingen */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Extra opmerkingen
          </h2>
          <textarea
            value={form.special_instructions}
            onChange={(e) => setForm({ ...form, special_instructions: e.target.value })}
            placeholder="Is er nog iets waar de Energie Buddy rekening mee moet houden?"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verzenden...
            </>
          ) : (
            'Formulier versturen'
          )}
        </button>
      </form>
    </div>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <IntakeContent />
    </Suspense>
  )
}
