'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { mockCustomers, mockInstallations, mockTeamMembers } from '@/lib/mock-data'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, MapPin, Phone, CheckCircle2, Loader2 } from 'lucide-react'
import type { Customer, Installation, TeamMember } from '@/types/database'

function getCustomerByToken(token: string | null): Customer | null {
  if (!token) return null
  return mockCustomers.find((c) => c.portal_token === token) || null
}

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

function getMonteur(monteurId: string | null): TeamMember | null {
  if (!monteurId) return null
  return mockTeamMembers.find((m) => m.id === monteurId) || null
}

function PortalContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const customer = getCustomerByToken(token)
  const installation = customer ? getActiveInstallation(customer.id) : null
  const monteur = installation ? getMonteur(installation.assigned_to) : null

  if (!customer) {
    return null // Layout handles invalid token
  }

  const statusSteps = [
    { key: 'scheduled', label: 'Ingepland', done: true },
    { key: 'confirmed', label: 'Bevestigd', done: installation?.status !== 'scheduled' },
    { key: 'in_progress', label: 'Bezig', done: installation?.status === 'in_progress' || installation?.status === 'completed' },
    { key: 'completed', label: 'Voltooid', done: installation?.status === 'completed' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mijn afspraak</h1>
        <p className="text-gray-600 mt-1">
          Bekijk de details van uw p1Meter installatie
        </p>
      </div>

      {installation ? (
        <>
          {/* Status Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.done
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        step.done ? 'text-green-600 font-medium' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        statusSteps[index + 1].done ? 'bg-green-200' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Afspraakgegevens
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Datum</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(installation.scheduled_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tijd</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(installation.scheduled_at)} ({installation.duration_minutes} min)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monteur</p>
                  <p className="font-medium text-gray-900">
                    {monteur?.name || 'Nog niet toegewezen'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Locatie</p>
                  <p className="font-medium text-gray-900">
                    {customer.address}, {customer.postal_code} {customer.city}
                  </p>
                </div>
              </div>
            </div>

            {installation.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Opmerkingen</p>
                <p className="text-gray-700">{installation.notes}</p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vragen over uw afspraak?</p>
                <p className="font-medium text-gray-900">
                  Bel ons op 085-1234567
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={`/portal/intake?token=${token}`}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Intake formulier</h3>
              <p className="text-sm text-gray-600 mt-1">
                Vul alvast informatie in over uw meterkast
              </p>
            </a>
            <a
              href={`/portal/upload?token=${token}`}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Foto&apos;s uploaden</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload foto&apos;s van uw meterkast
              </p>
            </a>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Geen actieve afspraak
          </h2>
          <p className="text-gray-600">
            Er is momenteel geen installatie ingepland. Neem contact op met uw
            installateur voor meer informatie.
          </p>
        </div>
      )}
    </div>
  )
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <PortalContent />
    </Suspense>
  )
}
