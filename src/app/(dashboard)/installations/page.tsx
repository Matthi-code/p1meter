'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useInstallations, useEnergieBuddies, useCustomers, useSmartMeters } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import {
  formatDateTime,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils'
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
  List,
  LayoutList,
  Phone,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react'
import type { Installation, Customer, TeamMember, SmartMeter, InstallationWithRelations } from '@/types/supabase'
import type { InstallationStatus } from '@/types/database'

// Dynamic import voor de kaart (SSR uitschakelen)
const InstallationsMap = dynamic(() => import('@/components/InstallationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-[var(--gray-100)] rounded-2xl flex items-center justify-center animate-pulse">
      <div className="text-[var(--gray-400)]">Kaart laden...</div>
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

type ViewMode = 'cards' | 'compact' | 'map'
type SortField = 'date' | 'customer' | 'city' | 'status' | 'assignee'
type SortDirection = 'asc' | 'desc'

export default function InstallationsPage() {
  const { data: installations, isLoading, refetch } = useInstallations()
  const { data: energieBuddies } = useEnergieBuddies()
  const { data: customers } = useCustomers()
  const { data: smartMeters } = useSmartMeters()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstallation, setEditingInstallation] = useState<InstallationWithRelations | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationWithRelations | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorteer functie toggle
  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Gefilterde en gesorteerde installaties
  const filteredInstallations = useMemo(() => {
    if (!installations) return []
    let result = [...installations]

    // Filter op zoekquery
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

    // Filter op status
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter)
    }

    // Sorteer op geselecteerde veld
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          break
        case 'customer':
          comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '')
          break
        case 'city':
          comparison = (a.customer?.city || '').localeCompare(b.customer?.city || '')
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
  }, [installations, searchQuery, statusFilter, sortField, sortDirection])

  // Open modal voor nieuwe installatie
  function handleAddNew() {
    setEditingInstallation(null)
    setIsModalOpen(true)
  }

  // Open modal voor bewerken
  function handleEdit(installation: InstallationWithRelations) {
    setEditingInstallation(installation)
    setIsModalOpen(true)
  }

  // Status wijzigen
  async function handleStatusChange(installationId: string, newStatus: InstallationStatus) {
    try {
      await dataApi.updateInstallation(installationId, { status: newStatus })
      refetch()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  // Opslaan installatie
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

  // Selecteer installatie vanuit kaart
  function handleMapSelect(installation: InstallationWithRelations) {
    setSelectedInstallation(installation)
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--gray-900)]">Installaties</h1>
          <p className="text-[var(--gray-500)]">Beheer geplande en uitgevoerde installaties</p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nieuwe installatie
        </button>
      </div>

      {/* Zoeken & View toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--gray-400)]" />
          <input
            type="text"
            placeholder="Zoek op klant, adres of Energie Buddy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* View toggle */}
        <div className="flex bg-[var(--gray-100)] rounded-xl p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-white text-[var(--gray-900)] shadow-sm'
                : 'text-[var(--gray-500)] hover:text-[var(--gray-700)]'
            }`}
            title="Kaartweergave"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Kaarten</span>
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'compact'
                ? 'bg-white text-[var(--gray-900)] shadow-sm'
                : 'text-[var(--gray-500)] hover:text-[var(--gray-700)]'
            }`}
            title="Compacte lijst"
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">Compact</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-white text-[var(--gray-900)] shadow-sm'
                : 'text-[var(--gray-500)] hover:text-[var(--gray-700)]'
            }`}
            title="Kaartweergave"
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Kaart</span>
          </button>
        </div>
      </div>

      {/* Status filter knoppen */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

          // Bepaal actieve button kleur op basis van status
          const activeColors: Record<InstallationStatus, string> = {
            scheduled: 'bg-blue-600 text-white',
            confirmed: 'bg-emerald-600 text-white',
            traveling: 'bg-purple-600 text-white',
            in_progress: 'bg-amber-600 text-white',
            completed: 'bg-slate-600 text-white',
            cancelled: 'bg-red-600 text-white',
          }

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? activeColors[status]
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getStatusLabel(status)} ({count})
            </button>
          )
        })}
      </div>

      {/* Statistieken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Gepland"
          count={allInstallations.filter((i) => i.status === 'scheduled').length}
          color="bg-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Bevestigd"
          count={allInstallations.filter((i) => i.status === 'confirmed').length}
          color="bg-emerald-500"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Bezig"
          count={allInstallations.filter((i) => i.status === 'in_progress' || i.status === 'traveling').length}
          color="bg-amber-500"
          bgColor="bg-amber-50"
        />
        <StatCard
          label="Voltooid"
          count={allInstallations.filter((i) => i.status === 'completed').length}
          color="bg-gray-500"
          bgColor="bg-gray-100"
        />
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <InstallationsMap
            installations={filteredInstallations}
            onSelectInstallation={handleMapSelect}
          />

          {/* Selected installation detail */}
          {selectedInstallation && (
            <InstallationDetail
              installation={selectedInstallation}
              onClose={() => setSelectedInstallation(null)}
              onEdit={() => handleEdit(selectedInstallation)}
              smartMeters={smartMeters ?? []}
            />
          )}
        </div>
      )}

      {/* Cards view */}
      {viewMode === 'cards' && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-[var(--gray-50)]">
            {filteredInstallations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--gray-100)] flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-[var(--gray-400)]" />
                </div>
                <p className="text-[var(--gray-500)]">Geen installaties gevonden</p>
              </div>
            ) : (
              filteredInstallations.map((installation) => (
                <InstallationCard
                  key={installation.id}
                  installation={installation}
                  onEdit={() => handleEdit(installation)}
                  onStatusChange={(status) =>
                    handleStatusChange(installation.id, status)
                  }
                  onSelect={() => setSelectedInstallation(installation)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Compact list view */}
      {viewMode === 'compact' && (
        <div className="card overflow-hidden">
          {filteredInstallations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--gray-100)] flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-[var(--gray-400)]" />
              </div>
              <p className="text-[var(--gray-500)]">Geen installaties gevonden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3">
                      <button
                        onClick={() => toggleSort('date')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                      >
                        Datum
                        {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">
                      <button
                        onClick={() => toggleSort('customer')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                      >
                        Klant
                        {sortField === 'customer' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">
                      <button
                        onClick={() => toggleSort('city')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                      >
                        Plaats
                        {sortField === 'city' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">
                      <button
                        onClick={() => toggleSort('status')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                      >
                        Status
                        {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">
                      <button
                        onClick={() => toggleSort('assignee')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                      >
                        Energie Buddy
                        {sortField === 'assignee' && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstallations.map((installation) => (
                    <tr
                      key={installation.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedInstallation(installation)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                        {formatDateTime(installation.scheduled_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">{installation.customer?.name}</div>
                        <div className="text-xs text-slate-500 md:hidden">{installation.customer?.city}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                        {installation.customer?.city}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(installation.status)}`}>
                          {getStatusLabel(installation.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                        {installation.assignee?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(installation)
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Bewerken
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Selected installation detail (cards/compact view) */}
      {(viewMode === 'cards' || viewMode === 'compact') && selectedInstallation && (
        <InstallationDetail
          installation={selectedInstallation}
          onClose={() => setSelectedInstallation(null)}
          onEdit={() => handleEdit(selectedInstallation)}
          smartMeters={smartMeters ?? []}
        />
      )}

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

/** Statistiek kaartje */
function StatCard({
  label,
  count,
  color,
  bgColor,
}: {
  label: string
  count: number
  color: string
  bgColor: string
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-[var(--gray-100)]`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div>
          <p className="text-2xl font-bold text-[var(--gray-900)]">{count}</p>
          <p className="text-sm text-[var(--gray-600)]">{label}</p>
        </div>
      </div>
    </div>
  )
}

/** Installatie detail panel */
function InstallationDetail({
  installation,
  onClose,
  onEdit,
  smartMeters,
}: {
  installation: InstallationWithRelations
  onClose: () => void
  onEdit: () => void
  smartMeters: SmartMeter[]
}) {
  // Simulate matching a smart meter based on notes (in real app, would be stored)
  const matchedMeter = smartMeters.find((m) =>
    installation.notes?.toLowerCase().includes(m.brand.toLowerCase())
  ) || smartMeters[0]

  return (
    <div className="card p-6 animate-slideUp">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--gray-900)]">
              {installation.customer?.name}
            </h3>
            <span
              className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                installation.status
              )}`}
            >
              {getStatusLabel(installation.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {installation.customer?.portal_token && (
            <button
              onClick={() => window.open(`/portal?token=${installation.customer?.portal_token}`, '_blank')}
              className="btn btn-secondary"
            >
              <ExternalLink className="h-4 w-4" />
              Klantportal
            </button>
          )}
          <button
            onClick={onEdit}
            className="btn btn-secondary"
          >
            Bewerken
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Klant info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-[var(--gray-900)] flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--gray-500)]" />
            Klantgegevens
          </h4>

          <div className="bg-[var(--gray-50)] rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[var(--gray-400)] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--gray-900)]">
                  {installation.customer?.address}
                </p>
                <p className="text-sm text-[var(--gray-500)]">
                  {installation.customer?.postal_code} {installation.customer?.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[var(--gray-400)]" />
              <a
                href={`tel:${installation.customer?.phone}`}
                className="text-sm text-[var(--primary-600)] hover:underline"
              >
                {installation.customer?.phone}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[var(--gray-400)]" />
              <a
                href={`mailto:${installation.customer?.email}`}
                className="text-sm text-[var(--primary-600)] hover:underline"
              >
                {installation.customer?.email}
              </a>
            </div>

            {installation.customer?.notes && (
              <div className="pt-2 border-t border-[var(--gray-200)]">
                <p className="text-sm text-[var(--gray-600)] italic">
                  {installation.customer.notes}
                </p>
              </div>
            )}
          </div>

          {/* Afspraak info */}
          <div className="bg-[var(--gray-50)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[var(--gray-400)]" />
              <p className="text-sm text-[var(--gray-700)]">
                {formatDateTime(installation.scheduled_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-[var(--gray-400)]" />
              <p className="text-sm text-[var(--gray-700)]">
                {installation.duration_minutes} minuten
              </p>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[var(--gray-400)]" />
              <p className="text-sm text-[var(--gray-700)]">
                {installation.assignee?.name || 'Niet toegewezen'}
              </p>
            </div>
          </div>
        </div>

        {/* Slimme meter info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-[var(--gray-900)] flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--gray-500)]" />
            Slimme Meter
          </h4>

          <div className="bg-[var(--gray-50)] rounded-xl p-4">
            {/* Meter afbeelding placeholder */}
            <div className="aspect-video bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)] rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto bg-white/80 rounded-xl flex items-center justify-center mb-3">
                  <Zap className="h-8 w-8 text-[var(--primary-500)]" />
                </div>
                <p className="text-sm font-medium text-[var(--gray-700)]">
                  {matchedMeter.brand} {matchedMeter.model}
                </p>
                <p className="text-xs text-[var(--gray-500)]">
                  SMR {matchedMeter.smr_version}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-600)]">Merk</span>
                <span className="text-sm font-medium text-[var(--gray-900)]">
                  {matchedMeter.brand}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-600)]">Model</span>
                <span className="text-sm font-medium text-[var(--gray-900)]">
                  {matchedMeter.model}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-600)]">SMR Versie</span>
                <span className="text-sm font-medium text-[var(--gray-900)]">
                  {matchedMeter.smr_version}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--gray-600)]">USB-C Adapter</span>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    matchedMeter.needs_adapter
                      ? 'text-amber-600'
                      : 'text-emerald-600'
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

              {matchedMeter.notes && (
                <div className="pt-2 border-t border-[var(--gray-200)]">
                  <p className="text-xs text-[var(--gray-500)]">{matchedMeter.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notities */}
          {installation.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800 mb-1">Notities</p>
              <p className="text-sm text-amber-700">{installation.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Installatie kaart */
function InstallationCard({
  installation,
  onEdit,
  onStatusChange,
  onSelect,
}: {
  installation: InstallationWithRelations
  onEdit: () => void
  onStatusChange: (status: InstallationStatus) => void
  onSelect: () => void
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  return (
    <div
      className="p-3 sm:p-4 hover:bg-[var(--gray-50)] transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        {/* Links: klant info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center justify-between sm:justify-start gap-2 sm:gap-3 mb-2">
            <h3 className="font-medium text-[var(--gray-900)] truncate text-sm sm:text-base">
              {installation.customer?.name || 'Onbekende klant'}
            </h3>
            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${getStatusColor(
                  installation.status
                )}`}
              >
                {getStatusLabel(installation.status)}
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Status dropdown */}
              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute right-0 sm:left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[var(--gray-100)] py-1 z-20 min-w-[140px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          onStatusChange(status)
                          setShowStatusMenu(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--gray-50)] ${
                          installation.status === status
                            ? 'font-medium text-[var(--primary-600)]'
                            : 'text-[var(--gray-700)]'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--gray-500)]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              <span className="truncate">{formatDateTime(installation.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              {installation.duration_minutes} min
            </div>
            <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
              <MapPin className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              <span className="truncate">{installation.customer?.city}</span>
            </div>
            <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
              <User className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              <span className="truncate">{installation.assignee?.name || 'Niet toegewezen'}</span>
            </div>
          </div>

          {installation.notes && (
            <p className="mt-2 text-xs sm:text-sm text-[var(--gray-600)] bg-[var(--gray-50)] rounded-lg px-3 py-2 line-clamp-1">
              {installation.notes}
            </p>
          )}
        </div>

        {/* Rechts: acties */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="btn btn-ghost text-[var(--primary-600)] self-end sm:self-auto text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
        >
          Bewerken
        </button>
      </div>
    </div>
  )
}

/** Installatie formulier modal */
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
        <div className="flex items-center justify-between p-6 border-b border-[var(--gray-100)]">
          <h3 className="text-lg font-semibold text-[var(--gray-900)]">
            {installation ? 'Installatie bewerken' : 'Nieuwe installatie'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-[var(--gray-500)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Klant */}
          <div>
            <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
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
                  {customer.name} - {customer.city}
                </option>
              ))}
            </select>
          </div>

          {/* Datum en tijd */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
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
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
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

          {/* Duur en Energie Buddy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
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
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
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

          {/* Status (alleen bij bewerken) */}
          {installation && (
            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as InstallationStatus }))
                }
                className="input"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notities */}
          <div>
            <label className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
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
