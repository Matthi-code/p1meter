'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { mockCustomers } from '@/lib/mock-data'
import { AlertCircle, CheckCircle2, HelpCircle, Phone, Mail, Upload, X, Loader2 } from 'lucide-react'
import type { Customer } from '@/types/database'

function getCustomerByToken(token: string | null): Customer | null {
  if (!token) return null
  return mockCustomers.find((c) => c.portal_token === token) || null
}

const issueTypes = [
  { key: 'no_data', label: 'Geen data in HomeWizard app' },
  { key: 'connection', label: 'Verbindingsproblemen' },
  { key: 'led_issue', label: 'LED knippert rood/niet' },
  { key: 'physical', label: 'Fysiek probleem met meter' },
  { key: 'question', label: 'Algemene vraag' },
  { key: 'other', label: 'Anders' },
]

function IssuesContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const customer = getCustomerByToken(token)

  const [submitted, setSubmitted] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null)

  if (!customer) {
    return null
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setPhoto({ file, preview: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Issue submitted:', { issueType, description, hasPhoto: !!photo })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Melding ontvangen!
          </h1>
          <p className="text-gray-600">
            We nemen zo snel mogelijk contact met u op om uw probleem op te lossen.
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
        <h1 className="text-2xl font-bold text-gray-900">Hulp nodig?</h1>
        <p className="text-gray-600 mt-1">
          Meld een probleem of stel een vraag
        </p>
      </div>

      {/* Quick Help */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <HelpCircle className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Veelgestelde vragen</h2>
        </div>

        <div className="space-y-3">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-2 text-gray-700 hover:text-gray-900">
              <span>Geen data in de HomeWizard app?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pl-4 pb-2 text-sm text-gray-600">
              <ol className="list-decimal list-inside space-y-1">
                <li>Controleer of de LED op de p1Meter groen knippert</li>
                <li>Zorg dat de p1Meter correct in de P1-poort zit</li>
                <li>Herstart de HomeWizard app</li>
                <li>Wacht 5 minuten - data kan vertraagd zijn</li>
              </ol>
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-2 text-gray-700 hover:text-gray-900">
              <span>LED knippert rood?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pl-4 pb-2 text-sm text-gray-600">
              <p>Een rode LED betekent meestal een verbindingsprobleem:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Controleer de WiFi-verbinding</li>
                <li>Zorg dat de p1Meter binnen bereik van uw router is</li>
                <li>Probeer de p1Meter opnieuw te koppelen via de app</li>
              </ol>
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-2 text-gray-700 hover:text-gray-900">
              <span>Hoe reset ik de p1Meter?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pl-4 pb-2 text-sm text-gray-600">
              <p>
                Houd de knop op de p1Meter 10 seconden ingedrukt totdat de LED
                snel begint te knipperen. De meter is nu gereset en kan opnieuw
                worden gekoppeld.
              </p>
            </div>
          </details>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Direct contact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="tel:0851234567"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Bellen</p>
              <p className="text-sm text-gray-500">085-1234567</p>
            </div>
          </a>
          <a
            href="mailto:support@p1meter.nl"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">E-mail</p>
              <p className="text-sm text-gray-500">support@p1meter.nl</p>
            </div>
          </a>
        </div>
      </div>

      {/* Issue Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Probleem melden</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type probleem
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecteer type</option>
                {issueTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschrijf het probleem zo duidelijk mogelijk"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto (optioneel)
              </label>
              {photo ? (
                <div className="relative inline-block">
                  <img
                    src={photo.preview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-fit">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Foto toevoegen</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Melding versturen
        </button>
      </form>
    </div>
  )
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <IssuesContent />
    </Suspense>
  )
}
