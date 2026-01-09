'use client'

import { useState, useMemo } from 'react'
import { useTeamMembers, useInstallations } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import { formatDateTime, getRoleLabel } from '@/lib/utils'
import { Card } from '@/components/ui'
import {
  Plus,
  Mail,
  Shield,
  Calendar,
  UserCheck,
  UserX,
  X,
  Loader2,
  KeyRound,
  Search,
  ChevronRight,
  ArrowLeft,
  User,
  Wrench,
  Phone,
  ChevronDown,
  Trash2,
  Users,
} from 'lucide-react'
import type { TeamMember, InstallationWithRelations } from '@/types/supabase'
import type { UserRole } from '@/types/database'

const roleOptions: UserRole[] = ['admin', 'planner', 'energiebuddy']

const roleConfig: Record<UserRole, { label: string; bg: string; text: string; description: string }> = {
  admin: {
    label: 'Administrator',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    description: 'Volledige toegang tot alle functies',
  },
  planner: {
    label: 'Planner',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    description: 'Kan klanten en installaties beheren',
  },
  energiebuddy: {
    label: 'Energie Buddy',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    description: 'Ziet eigen taken en installaties',
  },
  huiseigenaar: {
    label: 'Huiseigenaar',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    description: 'Klant portaal toegang',
  },
}

export default function TeamPage() {
  const { data: teamMembers, isLoading, refetch } = useTeamMembers()
  const { data: installations } = useInstallations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Get installations for a member
  function getMemberInstallations(memberId: string): InstallationWithRelations[] {
    return (installations ?? []).filter((i) => i.assigned_to === memberId)
  }

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!teamMembers) return []
    let result = [...teamMembers]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((m) => m.role === roleFilter)
    }

    // Sort by name
    result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [teamMembers, searchQuery, roleFilter])

  // Open modal for new member
  function handleAddNew() {
    setEditingMember(null)
    setIsModalOpen(true)
  }

  // Open modal for editing
  function handleEdit(member: TeamMember) {
    setEditingMember(member)
    setIsModalOpen(true)
  }

  // Toggle active status
  async function handleToggleActive(memberId: string) {
    const member = teamMembers?.find((m) => m.id === memberId)
    if (!member) return

    try {
      await dataApi.updateTeamMember(memberId, { active: !member.active })
      refetch()
      // Update active member if it's the same
      if (activeMember?.id === memberId) {
        setActiveMember({ ...activeMember, active: !member.active })
      }
    } catch (error) {
      console.error('Error toggling active:', error)
      alert('Kon status niet wijzigen')
    }
  }

  // Delete member (deactivate)
  function handleDelete(memberId: string) {
    if (confirm('Weet je zeker dat je dit teamlid wilt deactiveren?')) {
      handleToggleActive(memberId)
    }
  }

  // Reset password
  async function handleResetPassword(email: string) {
    if (!confirm(`Weet je zeker dat je een wachtwoord reset email wilt sturen naar ${email}?`)) {
      return
    }

    try {
      const response = await fetch('/api/team/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kon wachtwoord reset niet versturen')
      }

      alert(`Wachtwoord reset email verstuurd naar ${email}`)
    } catch (error) {
      console.error('Reset password error:', error)
      alert(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    }
  }

  // Save member
  async function handleSave(memberData: Partial<TeamMember>) {
    try {
      if (editingMember) {
        await dataApi.updateTeamMember(editingMember.id, memberData)
      } else {
        const response = await fetch('/api/team/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: memberData.name,
            email: memberData.email,
            role: memberData.role,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Kon teamlid niet aanmaken')
        }

        alert(`Uitnodiging verstuurd naar ${memberData.email}`)
      }
      setIsModalOpen(false)
      setEditingMember(null)
      refetch()
    } catch (error) {
      console.error('Error saving member:', error)
      alert(error instanceof Error ? error.message : 'Kon teamlid niet opslaan')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  const allMembers = teamMembers ?? []

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-500">Beheer je teamleden en rollen</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nieuw teamlid
        </button>
      </div>

      {/* Role filter buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            roleFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle ({allMembers.length})
        </button>
        {roleOptions.map((role) => {
          const count = allMembers.filter((m) => m.role === role).length
          if (count === 0 && roleFilter !== role) return null

          const config = roleConfig[role]

          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                roleFilter === role
                  ? `${config.bg} ${config.text}`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Master-Detail Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Team List */}
        <div className={`flex flex-col ${activeMember ? 'hidden lg:flex lg:w-[400px]' : 'w-full'}`}>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op naam of email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* List */}
          <Card padding="none" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Geen teamleden gevonden</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <TeamMemberListItem
                      key={member.id}
                      member={member}
                      installationCount={getMemberInstallations(member.id).length}
                      isActive={activeMember?.id === member.id}
                      onSelect={() => setActiveMember(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Member Detail */}
        {activeMember && (
          <TeamMemberDetailPanel
            member={activeMember}
            installations={getMemberInstallations(activeMember.id)}
            onClose={() => setActiveMember(null)}
            onEdit={() => handleEdit(activeMember)}
            onToggleActive={() => handleToggleActive(activeMember.id)}
            onResetPassword={() => handleResetPassword(activeMember.email)}
            onDelete={() => handleDelete(activeMember.id)}
          />
        )}

        {/* Empty state when no member selected */}
        {!activeMember && (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <Card padding="lg" className="text-center max-w-sm">
              <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Selecteer een teamlid
              </h3>
              <p className="text-slate-500">
                Klik op een teamlid in de lijst om de details te bekijken
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TeamMemberModal
          member={editingMember}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMember(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

/** Team member list item */
function TeamMemberListItem({
  member,
  installationCount,
  isActive,
  onSelect,
}: {
  member: TeamMember
  installationCount: number
  isActive: boolean
  onSelect: () => void
}) {
  const config = roleConfig[member.role]

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'
      } ${!member.active ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${
            member.active ? 'bg-blue-600' : 'bg-slate-400'
          }`}
        >
          {member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-slate-900 truncate">{member.name}</p>
            {!member.active && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Inactief
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            {member.role === 'energiebuddy' && installationCount > 0 && (
              <span className="text-xs text-slate-500">{installationCount} installaties</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
      </div>
    </div>
  )
}

/** Team member detail panel */
function TeamMemberDetailPanel({
  member,
  installations,
  onClose,
  onEdit,
  onToggleActive,
  onResetPassword,
  onDelete,
}: {
  member: TeamMember
  installations: InstallationWithRelations[]
  onClose: () => void
  onEdit: () => void
  onToggleActive: () => void
  onResetPassword: () => void
  onDelete: () => void
}) {
  const config = roleConfig[member.role]

  // Recent installations (last 5)
  const recentInstallations = installations
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5)

  // Stats
  const completedCount = installations.filter((i) => i.status === 'completed').length
  const scheduledCount = installations.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length

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
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Large avatar */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                  member.active ? 'bg-blue-600' : 'bg-slate-400'
                }`}
              >
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                    {config.label}
                  </span>
                  {!member.active && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      Inactief
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={onEdit} className="btn btn-primary text-sm">
              Bewerken
            </button>
            <button
              onClick={onToggleActive}
              className={`btn text-sm ${member.active ? 'btn-secondary' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            >
              {member.active ? (
                <>
                  <UserX className="h-4 w-4" />
                  Deactiveren
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Activeren
                </>
              )}
            </button>
            <button onClick={onResetPassword} className="btn btn-secondary text-sm">
              <KeyRound className="h-4 w-4" />
              Reset wachtwoord
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Contact info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Contact
            </h3>
            <Card variant="stat" padding="md">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                  {member.email}
                </a>
              </div>
            </Card>
          </div>

          {/* Role info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              Rol & Rechten
            </h3>
            <Card variant="stat" padding="md">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                  <Shield className={`h-5 w-5 ${config.text}`} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{config.label}</p>
                  <p className="text-sm text-slate-500">{config.description}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats for Energie Buddies */}
          {member.role === 'energiebuddy' && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-500" />
                Installaties
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Card variant="stat" accentColor="blue" padding="md">
                  <p className="text-2xl font-bold text-slate-900">{installations.length}</p>
                  <p className="text-xs text-slate-500">Totaal</p>
                </Card>
                <Card variant="stat" accentColor="emerald" padding="md">
                  <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                  <p className="text-xs text-slate-500">Voltooid</p>
                </Card>
                <Card variant="stat" accentColor="amber" padding="md">
                  <p className="text-2xl font-bold text-slate-900">{scheduledCount}</p>
                  <p className="text-xs text-slate-500">Gepland</p>
                </Card>
              </div>
            </div>
          )}

          {/* Recent installations for Energie Buddies */}
          {member.role === 'energiebuddy' && recentInstallations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Recente installaties
              </h3>
              <Card padding="none">
                <div className="divide-y divide-slate-100">
                  {recentInstallations.map((inst) => (
                    <div key={inst.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 text-center flex-shrink-0">
                        <p className="text-xs font-bold text-slate-900">
                          {new Date(inst.scheduled_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate text-sm">
                          {inst.customer?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {inst.customer?.address}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          inst.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {inst.status === 'completed' ? 'Voltooid' : 'Gepland'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Account info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Account
            </h3>
            <Card variant="stat" padding="md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-medium ${member.active ? 'text-emerald-600' : 'text-red-600'}`}>
                    {member.active ? 'Actief' : 'Inactief'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Aangemaakt</span>
                  <span className="font-medium text-slate-900">
                    {new Date(member.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Danger zone */}
          <div>
            <h3 className="font-semibold text-red-600 mb-3">Gevarenzone</h3>
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              <Trash2 className="h-5 w-5" />
              Teamlid deactiveren
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/** Team member form modal */
function TeamMemberModal({
  member,
  onClose,
  onSave,
}: {
  member: TeamMember | null
  onClose: () => void
  onSave: (member: Partial<TeamMember>) => void
}) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || 'energiebuddy',
    active: member?.active ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      active: formData.active,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {member ? 'Teamlid bewerken' : 'Nieuw teamlid'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Naam *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Jan de Vries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              E-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="input"
              placeholder="jan@p1meter.nl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Rol *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
              className="input"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {roleConfig[role].label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              {roleConfig[formData.role as UserRole]?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm text-slate-700">
              Account is actief
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuleren
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {member ? 'Opslaan' : 'Uitnodigen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
