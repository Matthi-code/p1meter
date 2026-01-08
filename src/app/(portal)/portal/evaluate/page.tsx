'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Star, CheckCircle2, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type InstallationData = {
  id: string
  scheduled_at: string
  status: string
  assignee?: { name: string } | null
}

function EvaluateContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installation, setInstallation] = useState<InstallationData | null>(null)
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  // Load installation data
  useEffect(() => {
    if (!token) {
      setIsLoadingData(false)
      return
    }

    const loadData = async () => {
      try {
        // Get customer and installation data via portal main page API or direct fetch
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/customers?portal_token=eq.${token}&select=id,installations(id,scheduled_at,status,assignee:team_members(name))`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
          }
        )
        const customers = await response.json()
        const customer = customers?.[0]

        if (customer?.installations?.length > 0) {
          // Find completed installation
          const completedInstallation = customer.installations.find(
            (i: InstallationData) => i.status === 'completed'
          )
          if (completedInstallation) {
            setInstallation(completedInstallation)

            // Check if already evaluated
            const evalResponse = await fetch(`/api/portal/evaluate?token=${token}`)
            const evalResult = await evalResponse.json()
            if (evalResult.data?.some((e: { installation_id: string }) => e.installation_id === completedInstallation.id)) {
              setAlreadyEvaluated(true)
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setIsLoadingData(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/portal/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          installation_id: installation?.id,
          rating,
          feedback,
          confirmed,
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

  if (isLoadingData) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (submitted || alreadyEvaluated) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {alreadyEvaluated ? 'Al beoordeeld' : 'Bedankt voor uw evaluatie!'}
          </h1>
          <p className="text-gray-600">
            {alreadyEvaluated
              ? 'U heeft deze installatie al beoordeeld.'
              : 'Uw feedback helpt ons om onze service te verbeteren.'}
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

  if (!installation) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluatie</h1>
          <p className="text-gray-600 mt-1">
            Beoordeel uw installatie-ervaring
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nog geen voltooide installatie
          </h2>
          <p className="text-gray-600">
            Na afronding van de installatie kunt u hier uw ervaring delen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluatie</h1>
        <p className="text-gray-600 mt-1">
          Beoordeel uw installatie-ervaring
        </p>
      </div>

      {/* Installation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Installatie op {formatDate(installation.scheduled_at)}</span>
          {installation.assignee && <span> door {installation.assignee.name}</span>}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hoe beoordeelt u de installatie?
          </h2>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 1 && 'Onvoldoende'}
              {rating === 2 && 'Matig'}
              {rating === 3 && 'Voldoende'}
              {rating === 4 && 'Goed'}
              {rating === 5 && 'Uitstekend'}
            </p>
          )}
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Uw opmerkingen
          </h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Deel uw ervaring met ons (optioneel)"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Confirmation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <span className="text-gray-700">
              Ik bevestig dat de p1Meter installatie is voltooid en de meter
              correct werkt in de HomeWizard app.
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={rating === 0 || isLoading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verzenden...
            </>
          ) : (
            'Evaluatie versturen'
          )}
        </button>
      </form>
    </div>
  )
}

export default function EvaluatePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <EvaluateContent />
    </Suspense>
  )
}
