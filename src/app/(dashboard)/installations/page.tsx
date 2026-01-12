'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useInstallations, useEnergieBuddies, useCustomers, useSmartMeters } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import { formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils'
import { installationStatusConfig } from '@/lib/status'
import { Card } from '@/components/ui'
import {
  Plus,
  Search,
  MapPin,
  User,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Map,
  Phone,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
  ExternalLink,
  Camera,
  ChevronRight,
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-react'
import type { Installation, Customer, TeamMember, SmartMeter, InstallationWithRelations, ChecklistData, CustomerPhoto } from '@/types/supabase'
import type { InstallationStatus, PhotoType } from '@/types/database'
import { InstallationChecklist } from '@/components/InstallationChecklist'
import { InstallationPhotos } from '@/components/InstallationPhotos'
import { exportInstallationsToExcel, exportInstallationsToPDF } from '@/lib/export'

// Dynamic import for the map (disable SSR)
const InstallationsMap = dynamic(() => import('@/components/InstallationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center animate-pulse">
      <div className="text-slate-400">Kaart laden...</div>
    </div>
  ),
})

const statusOptions: InstallationStatus[] = [
  'scheduled',
  'confirmed',
  'traveling',
  'in_progress',
  'completed',
  'cancelled',
]

type SortField = 'date' | 'customer' | 'address' | 'status' | 'assignee'
type SortDirection = 'asc' | 'desc'

export default function InstallationsPage() {
  const { data: installations, isLoading, refetch } = useInstallations()
  const { data: energieBuddies } = useEnergieBuddies()
  const { data: customers } = useCustomers()
  const { data: smartMeters } = useSmartMeters()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [buddyFilter, setBuddyFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstallation, setEditingInstallation] = useState<InstallationWithRelations | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [activeInstallation, setActiveInstallation] = useState<InstallationWithRelations | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Toggle sort
  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filtered and sorted installations
  const filteredInstallations = useMemo(() => {
    if (!installations) return []
    let result = [...installations]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (i) =>
          i.customer?.name.toLowerCase().includes(query) ||
          i.customer?.address.toLowerCase().includes(query) ||
          i.customer?.city.toLowerCase().includes(query) ||
          i.assignee?.name.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter)
    }

    // Filter by energy buddy
    if (buddyFilter !== 'all') {
      if (buddyFilter === 'unassigned') {
        result = result.filter((i) => !i.assigned_to)
      } else {
        result = result.filter((i) => i.assigned_to === buddyFilter)
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          break
        case 'customer':
          comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '')
          break
        case 'address':
          comparison = (a.customer?.address || '').localeCompare(b.customer?.address || '')
          break
        case 'status':
          comparison = statusOptions.indexOf(a.status) - statusOptions.indexOf(b.status)
          break
        case 'assignee':
          comparison = (a.assignee?.name || 'ZZZ').localeCompare(b.assignee?.name || 'ZZZ')
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [installations, searchQuery, statusFilter, buddyFilter, sortField, sortDirection])

  // Open modal for new installation
  function handleAddNew() {
    setEditingInstallation(null)
    setIsModalOpen(true)
  }

  // Change status
  async function handleStatusChange(installationId: string, newStatus: InstallationStatus) {
    try {
      await dataApi.updateInstallation(installationId, { status: newStatus })
      refetch()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  // Save installation
  async function handleSave(installationData: Partial<Installation>) {
    try {
      if (editingInstallation) {
        await dataApi.updateInstallation(editingInstallation.id, installationData)
      } else {
        await dataApi.createInstallation(installationData as Parameters<typeof dataApi.createInstallation>[0])
      }
      setIsModalOpen(false)
      setEditingInstallation(null)
      refetch()
    } catch (error) {
      console.error('Error saving installation:', error)
      alert('Kon installatie niet opslaan')
    }
  }

  // Update checklist
  async function handleChecklistUpdate(installationId: string, checklistData: ChecklistData) {
    try {
      await dataApi.updateInstallation(installationId, { checklist_data: checklistData } as Partial<Installation>)
      refetch()
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

  const allInstallations = installations ?? []

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Installaties</h1>
          <p className="text-slate-500">Beheer geplande en uitgevoerde installaties</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`btn ${showMap ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Map className="h-4 w-4" />
            Kaart
          </button>
          <InstallationsExportDropdown installations={filteredInstallations} />
          <button onClick={handleAddNew} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Nieuwe installatie
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="space-y-3 mb-4">
        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-slate-500 py-1.5">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle ({allInstallations.length})
          </button>
          {statusOptions.map((status) => {
            const count = allInstallations.filter((i) => i.status === status).length
            if (count === 0 && statusFilter !== status) return null

            const config = installationStatusConfig[status]

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? `${config.bg} ${config.text}`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Energie Buddy filter buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-slate-500 py-1.5">
            <User className="h-4 w-4 inline mr-1" />
            Buddy:
          </span>
          <button
            onClick={() => setBuddyFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              buddyFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setBuddyFilter('unassigned')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              buddyFilter === 'unassigned'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Niet toegewezen ({allInstallations.filter((i) => !i.assigned_to).length})
          </button>
          {energieBuddies?.map((buddy) => {
            const count = allInstallations.filter((i) => i.assigned_to === buddy.id).length
            if (count === 0 && buddyFilter !== buddy.id) return null

            return (
              <button
                key={buddy.id}
                onClick={() => setBuddyFilter(buddy.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  buddyFilter === buddy.id
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {buddy.name.split(' ')[0]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Map view */}
      {showMap && (
        <div className="mb-6">
          <Card padding="none" className="overflow-hidden">
            <InstallationsMap
              installations={filteredInstallations}
              onSelectInstallation={(inst) => setActiveInstallation(inst)}
            />
          </Card>
        </div>
      )}

      {/* Master-Detail Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Installation List - hidden on mobile when detail is shown */}
        <div className={`flex flex-col ${activeInstallation ? 'hidden lg:flex lg:w-[400px]' : 'w-full'}`}>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op klant, adres of Energie Buddy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* List */}
          <Card padding="none" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredInstallations.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Geen installaties gevonden</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredInstallations.map((installation) => (
                    <InstallationListItem
                      key={installation.id}
                      installation={installation}
                      isActive={activeInstallation?.id === installation.id}
                      onSelect={() => setActiveInstallation(installation)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Installation Detail - full screen on mobile */}
        {activeInstallation && (
          <InstallationDetailPanel
            installation={activeInstallation}
            smartMeters={smartMeters ?? []}
            onClose={() => setActiveInstallation(null)}
            onStatusChange={(status) => handleStatusChange(activeInstallation.id, status)}
            onChecklistUpdate={(data) => handleChecklistUpdate(activeInstallation.id, data)}
          />
        )}

        {/* Empty state when no installation selected (desktop only) */}
        {!activeInstallation && (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <Card padding="lg" className="text-center max-w-sm">
              <Zap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Selecteer een installatie
              </h3>
              <p className="text-slate-500">
                Klik op een installatie in de lijst om de details te bekijken
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <InstallationModal
          installation={editingInstallation}
          customers={customers ?? []}
          energieBuddies={energieBuddies ?? []}
          onClose={() => {
            setIsModalOpen(false)
            setEditingInstallation(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

/** Installation list item */
function InstallationListItem({
  installation,
  isActive,
  onSelect,
}: {
  installation: InstallationWithRelations
  isActive: boolean
  onSelect: () => void
}) {
  const config = installationStatusConfig[installation.status]
  const hasPhone = installation.customer?.phone
  const hasCoords = installation.customer?.latitude && installation.customer?.longitude

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Time badge */}
        <div className="w-14 flex-shrink-0 text-center">
          <p className="text-sm font-bold text-slate-900">
            {new Date(installation.scheduled_at).toLocaleTimeString('nl-NL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(installation.scheduled_at).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-slate-900 truncate">
              {installation.customer?.name || 'Onbekende klant'}
            </p>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {installation.customer?.address}, {installation.customer?.city}
          </p>
          <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <User className="h-3.5 w-3.5" />
            {installation.assignee?.name || 'Niet toegewezen'}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasPhone && (
            <a
              href={`tel:${installation.customer?.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Bellen"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${installation.customer?.latitude},${installation.customer?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Navigeren"
            >
              <Navigation className="h-4 w-4" />
            </a>
          )}
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </div>
    </div>
  )
}

/** Installation detail panel */
function InstallationDetailPanel({
  installation,
  smartMeters,
  onClose,
  onStatusChange,
  onChecklistUpdate,
}: {
  installation: InstallationWithRelations
  smartMeters: SmartMeter[]
  onClose: () => void
  onStatusChange: (status: InstallationStatus) => void
  onChecklistUpdate: (data: ChecklistData) => Promise<void>
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const config = installationStatusConfig[installation.status]
  const hasCoords = installation.customer?.latitude && installation.customer?.longitude

  // Match smart meter based on notes
  const matchedMeter = smartMeters.find((m) =>
    installation.notes?.toLowerCase().includes(m.brand.toLowerCase())
  ) || smartMeters[0]

  return (
    <div className="flex-1 flex flex-col lg:max-w-2xl">
      {/* Mobile back button */}
      <button
        onClick={onClose}
        className="lg:hidden flex items-center gap-2 text-slate-600 mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Terug naar lijst
      </button>

      <Card padding="none" className="flex-1 overflow-hidden flex flex-col">
        {/* Street View Header */}
        {hasCoords && (
          <div className="relative h-48 flex-shrink-0">
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${installation.customer?.latitude},${installation.customer?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full hover:opacity-90 transition-opacity"
            >
              <img
                src={`https://maps.googleapis.com/maps/api/streetview?size=800x300&location=${installation.customer?.latitude},${installation.customer?.longitude}&fov=80&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                alt={`Straatbeeld ${installation.customer?.address}`}
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl font-bold text-white mb-1">
                {installation.customer?.name}
              </h2>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {installation.customer?.address}, {installation.customer?.city}
              </p>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={onClose}
                className="hidden lg:flex p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-1 text-white/60 text-xs">
              <Camera className="h-3 w-3" />
              Klik voor 360° weergave
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header without Street View */}
          {!hasCoords && (
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {installation.customer?.name}
                </h2>
                <p className="text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {installation.customer?.address}, {installation.customer?.city}
                </p>
              </div>
              <button
                onClick={onClose}
                className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          )}

          {/* Status and actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${config.bg} ${config.text}`}
              >
                {config.label}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[160px]">
                    {statusOptions.map((status) => {
                      const statusConfig = installationStatusConfig[status]
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            onStatusChange(status)
                            setShowStatusMenu(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                            installation.status === status
                              ? 'font-medium text-blue-600'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {installation.customer?.portal_token && (
                <button
                  onClick={() => window.open(`/portal?token=${installation.customer?.portal_token}`, '_blank')}
                  className="btn btn-secondary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Portal
                </button>
              )}
              <a href={`/installations/${installation.id}`} className="btn btn-primary">
                Bewerken
              </a>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {installation.customer?.phone && (
              <a
                href={`tel:${installation.customer.phone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Bellen
              </a>
            )}
            {hasCoords && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${installation.customer?.latitude},${installation.customer?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Navigation className="h-5 w-5" />
                Navigeren
              </a>
            )}
          </div>

          {/* Appointment info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Afspraak
            </h3>
            <Card variant="stat" padding="md">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Datum & tijd</p>
                  <p className="font-medium text-slate-900">
                    {formatDateTime(installation.scheduled_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Duur</p>
                  <p className="font-medium text-slate-900">
                    {installation.duration_minutes} min
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Energie Buddy</p>
                  <p className="font-medium text-slate-900">
                    {installation.assignee?.name || 'Niet toegewezen'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Klantgegevens
            </h3>
            <Card variant="stat" padding="md">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {installation.customer?.address}
                    </p>
                    <p className="text-sm text-slate-500">
                      {installation.customer?.postal_code} {installation.customer?.city}
                    </p>
                  </div>
                </div>
                {installation.customer?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a
                      href={`tel:${installation.customer.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {installation.customer.phone}
                    </a>
                  </div>
                )}
                {installation.customer?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a
                      href={`mailto:${installation.customer.email}`}
                      className="text-sm text-blue-600 hover:underline"
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
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-slate-500" />
                Slimme Meter
              </h3>
              <Card variant="stat" padding="md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Zap className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {matchedMeter.brand} {matchedMeter.model}
                    </p>
                    <p className="text-sm text-slate-500">SMR {matchedMeter.smr_version}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-600">USB-C Adapter</span>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      matchedMeter.needs_adapter ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {matchedMeter.needs_adapter ? (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Vereist
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Niet nodig
                      </>
                    )}
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Notes */}
          {installation.notes && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Notities</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">{installation.notes}</p>
              </div>
            </div>
          )}

          {/* Installation Checklist */}
          <InstallationChecklist
            installationId={installation.id}
            checklistData={installation.checklist_data}
            onUpdate={onChecklistUpdate}
            readOnly={installation.status === 'completed' || installation.status === 'cancelled'}
          />

          {/* Installation Photos */}
          <InstallationPhotos
            installationId={installation.id}
            readOnly={installation.status === 'cancelled'}
          />
        </div>
      </Card>
    </div>
  )
}

/** Installation form modal */
function InstallationModal({
  installation,
  customers,
  energieBuddies,
  onClose,
  onSave,
}: {
  installation: InstallationWithRelations | null
  customers: Customer[]
  energieBuddies: TeamMember[]
  onClose: () => void
  onSave: (installation: Partial<Installation>) => void
}) {
  const [formData, setFormData] = useState({
    customer_id: installation?.customer_id || '',
    scheduled_date: installation
      ? new Date(installation.scheduled_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    scheduled_time: installation
      ? new Date(installation.scheduled_at).toTimeString().slice(0, 5)
      : '09:00',
    duration_minutes: installation?.duration_minutes || 60,
    assigned_to: installation?.assigned_to || '',
    notes: installation?.notes || '',
    status: installation?.status || 'scheduled',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const scheduledAt = new Date(
      `${formData.scheduled_date}T${formData.scheduled_time}:00`
    ).toISOString()

    const installationData: Partial<Installation> = {
      customer_id: formData.customer_id,
      scheduled_at: scheduledAt,
      duration_minutes: formData.duration_minutes,
      status: formData.status as InstallationStatus,
      assigned_to: formData.assigned_to || undefined,
      notes: formData.notes || undefined,
    }

    onSave(installationData)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {installation ? 'Installatie bewerken' : 'Nieuwe installatie'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Klant *
            </label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customer_id: e.target.value }))
              }
              className="input"
            >
              <option value="">Selecteer klant...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.address}
                </option>
              ))}
            </select>
          </div>

          {/* Date and time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Datum *
              </label>
              <input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduled_date: e.target.value,
                  }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tijd *
              </label>
              <input
                type="time"
                required
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduled_time: e.target.value,
                  }))
                }
                className="input"
              />
            </div>
          </div>

          {/* Duration and Energy Buddy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Duur (minuten) *
              </label>
              <input
                type="number"
                required
                min={15}
                step={15}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_minutes: parseInt(e.target.value),
                  }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Energie Buddy *
              </label>
              <select
                required
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assigned_to: e.target.value,
                  }))
                }
                className="input"
              >
                <option value="">Selecteer Energie Buddy...</option>
                {energieBuddies.map((buddy) => (
                  <option key={buddy.id} value={buddy.id}>
                    {buddy.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (only when editing) */}
          {installation && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as InstallationStatus }))
                }
                className="input"
              >
                {statusOptions.map((status) => {
                  const statusConfig = installationStatusConfig[status]
                  return (
                    <option key={status} value={status}>
                      {statusConfig.label}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notities
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="input resize-none"
              placeholder="Bijzonderheden voor deze installatie..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              {installation ? 'Opslaan' : 'Inplannen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** Export dropdown for installations */
function InstallationsExportDropdown({ installations }: { installations: InstallationWithRelations[] }) {
  const [isOpen, setIsOpen] = useState(false)

  const statusLabels: Record<string, string> = {
    scheduled: 'Gepland',
    confirmed: 'Bevestigd',
    traveling: 'Onderweg',
    in_progress: 'Bezig',
    completed: 'Voltooid',
    cancelled: 'Geannuleerd',
  }

  function handleExportExcel() {
    const data = installations.map((i) => ({
      customer_name: i.customer?.name || 'Onbekend',
      customer_address: i.customer?.address || '',
      customer_city: i.customer?.city || '',
      scheduled_at: i.scheduled_at,
      status: statusLabels[i.status] || i.status,
      assignee_name: i.assignee?.name || 'Niet toegewezen',
    }))
    exportInstallationsToExcel(data)
    setIsOpen(false)
  }

  function handleExportPDF() {
    const data = installations.map((i) => ({
      customer_name: i.customer?.name || 'Onbekend',
      customer_address: i.customer?.address || '',
      scheduled_at: i.scheduled_at,
      status: statusLabels[i.status] || i.status,
      assignee_name: i.assignee?.name || 'Niet toegewezen',
    }))
    exportInstallationsToPDF(data)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 min-w-[160px]">
            <button
              onClick={handleExportExcel}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-red-600" />
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}
