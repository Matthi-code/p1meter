'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import * as dataApi from '@/lib/data'
import { formatDateTime } from '@/lib/utils'
import { installationStatusConfig } from '@/lib/status'
import { Card } from '@/components/ui'
import {
  MapPin,
  User,
  ChevronDown,
  Calendar,
  Phone,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
  ExternalLink,
  Camera,
  ArrowLeft,
  Save,
  Clock,
  FileText,
} from 'lucide-react'
import type { Installation, SmartMeter, TeamMember, InstallationWithRelations, ChecklistData } from '@/types/supabase'
import type { InstallationStatus } from '@/types/database'
import { InstallationChecklist } from '@/components/InstallationChecklist'
import { InstallationPhotos } from '@/components/InstallationPhotos'

const statusOptions: InstallationStatus[] = [
  'scheduled',
  'confirmed',
  'traveling',
  'in_progress',
  'completed',
  'cancelled',
]

export default function InstallationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const installationId = params.id as string

  const [installation, setInstallation] = useState<InstallationWithRelations | null>(null)
  const [smartMeters, setSmartMeters] = useState<SmartMeter[]>([])
  const [energieBuddies, setEnergieBuddies] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Editable fields
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [installationsData, metersData, buddiesData] = await Promise.all([
          dataApi.getInstallations(),
          dataApi.getSmartMeters(),
          dataApi.getEnergieBuddies(),
        ])

        const found = installationsData.find((i) => i.id === installationId)
        if (found) {
          setInstallation(found)
          // Initialize editable fields
          const date = new Date(found.scheduled_at)
          setScheduledDate(date.toISOString().split('T')[0])
          setScheduledTime(date.toTimeString().slice(0, 5))
          setDurationMinutes(found.duration_minutes)
          setAssignedTo(found.assigned_to || '')
          setNotes(found.notes || '')
        }
        setSmartMeters(metersData)
        setEnergieBuddies(buddiesData)
      } catch (error) {
        console.error('Error loading installation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [installationId])

  // Track changes
  useEffect(() => {
    if (!installation) return

    const originalDate = new Date(installation.scheduled_at)
    const originalDateStr = originalDate.toISOString().split('T')[0]
    const originalTimeStr = originalDate.toTimeString().slice(0, 5)

    const changed =
      scheduledDate !== originalDateStr ||
      scheduledTime !== originalTimeStr ||
      durationMinutes !== installation.duration_minutes ||
      assignedTo !== (installation.assigned_to || '') ||
      notes !== (installation.notes || '')

    setHasChanges(changed)
  }, [installation, scheduledDate, scheduledTime, durationMinutes, assignedTo, notes])

  async function handleStatusChange(newStatus: InstallationStatus) {
    if (!installation) return
    try {
      await dataApi.updateInstallation(installation.id, { status: newStatus })
      setInstallation((prev) => prev ? { ...prev, status: newStatus } : null)
      setShowStatusMenu(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  async function handleSave() {
    if (!installation || !hasChanges) return

    try {
      setIsSaving(true)
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()

      const updates: Partial<Installation> = {
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        assigned_to: assignedTo || undefined,
        notes: notes || undefined,
      }

      await dataApi.updateInstallation(installation.id, updates)

      // Update local state
      const newAssignee = energieBuddies.find(b => b.id === assignedTo) || null
      setInstallation((prev) => prev ? {
        ...prev,
        ...updates,
        assignee: newAssignee,
      } : null)

      setHasChanges(false)
    } catch (error) {
      console.error('Error saving installation:', error)
      alert('Kon wijzigingen niet opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChecklistUpdate(checklistData: ChecklistData) {
    if (!installation) return
    try {
      await dataApi.updateInstallation(installation.id, { checklist_data: checklistData } as Partial<Installation>)
      setInstallation((prev) => prev ? { ...prev, checklist_data: checklistData } : null)
    } catch (error) {
      console.error('Error updating checklist:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!installation) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/installations')}
          className="flex items-center gap-2 text-slate-600 mb-6 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Terug naar installaties
        </button>
        <Card padding="lg" className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Installatie niet gevonden
          </h2>
          <p className="text-slate-500">
            Deze installatie bestaat niet of is verwijderd.
          </p>
        </Card>
      </div>
    )
  }

  const config = installationStatusConfig[installation.status]
  const hasCoords = installation.customer?.latitude && installation.customer?.longitude

  // Match smart meter based on notes
  const matchedMeter = smartMeters.find((m) =>
    installation.notes?.toLowerCase().includes(m.brand.toLowerCase())
  ) || smartMeters[0]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back and save */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/installations')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Terug naar installaties
        </button>

        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Opslaan
          </button>
        )}
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Street View Header */}
        {hasCoords && (
          <div className="relative h-64">
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${installation.customer?.latitude},${installation.customer?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full hover:opacity-90 transition-opacity"
            >
              <img
                src={`https://maps.googleapis.com/maps/api/streetview?size=1200x400&location=${installation.customer?.latitude},${installation.customer?.longitude}&fov=80&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                alt={`Straatbeeld ${installation.customer?.address}`}
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                {installation.customer?.name}
              </h1>
              <p className="text-white/80 flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                {installation.customer?.address}, {installation.customer?.postal_code} {installation.customer?.city}
              </p>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-1 text-white/60 text-sm">
              <Camera className="h-4 w-4" />
              Klik voor 360° weergave
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Header without Street View */}
          {!hasCoords && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {installation.customer?.name}
              </h1>
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                {installation.customer?.address}, {installation.customer?.postal_code} {installation.customer?.city}
              </p>
            </div>
          )}

          {/* Status and actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-lg ${config.bg} ${config.text}`}
              >
                {config.label}
                <ChevronDown className="h-5 w-5" />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-20 min-w-[180px]">
                    {statusOptions.map((status) => {
                      const statusConfig = installationStatusConfig[status]
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 ${
                            installation.status === status
                              ? 'font-medium text-blue-600'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {installation.customer?.portal_token && (
                <button
                  onClick={() => window.open(`/portal?token=${installation.customer?.portal_token}`, '_blank')}
                  className="btn btn-secondary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Klantportaal
                </button>
              )}
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {installation.customer?.phone && (
              <a
                href={`tel:${installation.customer.phone}`}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-medium text-lg hover:bg-slate-200 transition-colors"
              >
                <Phone className="h-6 w-6" />
                Bellen
              </a>
            )}
            {hasCoords && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${installation.customer?.latitude},${installation.customer?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors"
              >
                <Navigation className="h-6 w-6" />
                Navigeren
              </a>
            )}
          </div>

          {/* Editable Appointment info */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              Afspraak
            </h3>
            <Card variant="stat" padding="md">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Datum</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="input"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Tijd</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="input"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Duur (minuten)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="input"
                  />
                </div>

                {/* Energy Buddy */}
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Energie Buddy</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="input"
                  >
                    <option value="">Niet toegewezen</option>
                    {energieBuddies.map((buddy) => (
                      <option key={buddy.id} value={buddy.id}>
                        {buddy.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact info */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              Contactgegevens
            </h3>
            <Card variant="stat" padding="md">
              <div className="space-y-4">
                {installation.customer?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <a
                      href={`tel:${installation.customer.phone}`}
                      className="text-blue-600 hover:underline text-lg"
                    >
                      {installation.customer.phone}
                    </a>
                  </div>
                )}
                {installation.customer?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <a
                      href={`mailto:${installation.customer.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {installation.customer.email}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Smart meter info */}
          {matchedMeter && (
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-slate-500" />
                Slimme Meter
              </h3>
              <Card variant="stat" padding="md">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-lg">
                      {matchedMeter.brand} {matchedMeter.model}
                    </p>
                    <p className="text-slate-500">SMR {matchedMeter.smr_version}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">USB-C Adapter</p>
                    <span
                      className={`flex items-center gap-2 font-medium ${
                        matchedMeter.needs_adapter ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {matchedMeter.needs_adapter ? (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          Vereist
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Niet nodig
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Editable Notes */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              Notities
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Bijzonderheden voor deze installatie..."
            />
          </div>

          {/* Installation Checklist */}
          <div className="mb-8">
            <InstallationChecklist
              installationId={installation.id}
              checklistData={installation.checklist_data}
              onUpdate={handleChecklistUpdate}
              readOnly={installation.status === 'completed' || installation.status === 'cancelled'}
            />
          </div>

          {/* Installation Photos */}
          <InstallationPhotos
            installationId={installation.id}
            readOnly={installation.status === 'cancelled'}
          />
        </div>
      </Card>

      {/* Floating save button when there are changes */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary shadow-lg px-6 py-3 text-lg"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Wijzigingen opslaan
          </button>
        </div>
      )}
    </div>
  )
}
