'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { mockCustomers, mockInstallations, mockTeamMembers } from '@/lib/mock-data'
import { Star, CheckCircle2, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Customer, Installation, TeamMember } from '@/types/database'

function getCustomerByToken(token: string | null): Customer | null {
  if (!token) return null
  return mockCustomers.find((c) => c.portal_token === token) || null
}

function getCompletedInstallation(customerId: string): Installation | null {
  return (
    mockInstallations.find(
      (i) => i.customer_id === customerId && i.status === 'completed'
    ) || null
  )
}

function getMonteur(monteurId: string | null): TeamMember | null {
  if (!monteurId) return null
  return mockTeamMembers.find((m) => m.id === monteurId) || null
}

function EvaluateContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const customer = getCustomerByToken(token)
  const installation = customer ? getCompletedInstallation(customer.id) : null
  const monteur = installation ? getMonteur(installation.assigned_to) : null

  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (!customer) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Evaluation submitted:', { rating, feedback, confirmed })
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
            Bedankt voor uw evaluatie!
          </h1>
          <p className="text-gray-600">
            Uw feedback helpt ons om onze service te verbeteren.
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
          {monteur && <span> door {monteur.name}</span>}
        </p>
      </div>

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
          disabled={rating === 0}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Evaluatie versturen
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
