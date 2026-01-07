'use client'

import { useState } from 'react'
import { useTeamMembers, useInstallations } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import { formatDate, getRoleLabel } from '@/lib/utils'
import {
  Plus,
  Mail,
  Shield,
  Calendar,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  X,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import type { TeamMember } from '@/types/supabase'
import type { UserRole } from '@/types/database'

const roleOptions: UserRole[] = ['admin', 'planner', 'monteur']

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  planner: 'bg-blue-100 text-blue-700',
  monteur: 'bg-green-100 text-green-700',
  huiseigenaar: 'bg-gray-100 text-gray-700',
}

export default function TeamPage() {
  const { data: teamMembers, isLoading, refetch } = useTeamMembers()
  const { data: installations } = useInstallations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // Tel installaties per monteur
  function getInstallationCount(memberId: string): number {
    return (installations ?? []).filter((i) => i.assigned_to === memberId).length
  }

  // Open modal voor nieuw teamlid
  function handleAddNew() {
    setEditingMember(null)
    setIsModalOpen(true)
  }

  // Open modal voor bewerken
  function handleEdit(member: TeamMember) {
    setEditingMember(member)
    setIsModalOpen(true)
    setMenuOpenId(null)
  }

  // Toggle actief status
  async function handleToggleActive(memberId: string) {
    const member = teamMembers?.find((m) => m.id === memberId)
    if (!member) return

    try {
      await dataApi.updateTeamMember(memberId, { active: !member.active })
      refetch()
    } catch (error) {
      console.error('Error toggling active:', error)
      alert('Kon status niet wijzigen')
    }
    setMenuOpenId(null)
  }

  // Verwijder teamlid (note: we don't have a delete function yet, just toggle inactive)
  function handleDelete(memberId: string) {
    if (confirm('Weet je zeker dat je dit teamlid wilt deactiveren?')) {
      handleToggleActive(memberId)
    }
    setMenuOpenId(null)
  }

  // Opslaan teamlid
  async function handleSave(memberData: Partial<TeamMember>) {
    try {
      if (editingMember) {
        // Bestaand teamlid updaten
        await dataApi.updateTeamMember(editingMember.id, memberData)
      } else {
        // Nieuw teamlid aanmaken via API (stuurt invite email)
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

  // Groepeer per rol
  const membersByRole = {
    admin: allMembers.filter((m) => m.role === 'admin'),
    planner: allMembers.filter((m) => m.role === 'planner'),
    monteur: allMembers.filter((m) => m.role === 'monteur'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600">Beheer je teamleden en rollen</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nieuw teamlid
        </button>
      </div>

      {/* Statistieken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Totaal"
          count={allMembers.length}
          icon={<Shield className="h-5 w-5" />}
          color="bg-gray-500"
        />
        <StatCard
          label="Actief"
          count={allMembers.filter((m) => m.active).length}
          icon={<UserCheck className="h-5 w-5" />}
          color="bg-green-500"
        />
        <StatCard
          label="Inactief"
          count={allMembers.filter((m) => !m.active).length}
          icon={<UserX className="h-5 w-5" />}
          color="bg-red-500"
        />
        <StatCard
          label="Monteurs"
          count={membersByRole.monteur.length}
          icon={<Calendar className="h-5 w-5" />}
          color="bg-blue-500"
        />
      </div>

      {/* Teamleden per rol */}
      <div className="space-y-6">
        {/* Administrators */}
        <RoleSection
          title="Administrators"
          description="Volledige toegang tot het systeem"
          members={membersByRole.admin}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          getInstallationCount={getInstallationCount}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />

        {/* Planners */}
        <RoleSection
          title="Planners"
          description="Kunnen klanten en installaties beheren"
          members={membersByRole.planner}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          getInstallationCount={getInstallationCount}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />

        {/* Monteurs */}
        <RoleSection
          title="Monteurs"
          description="Voeren installaties uit"
          members={membersByRole.monteur}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          getInstallationCount={getInstallationCount}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
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

/** Statistiek kaartje */
function StatCard({
  label,
  count,
  icon,
  color,
}: {
  label: string
  count: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`${color} p-2 rounded-lg text-white`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

/** Rol sectie met teamleden */
function RoleSection({
  title,
  description,
  members,
  menuOpenId,
  setMenuOpenId,
  getInstallationCount,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  title: string
  description: string
  members: TeamMember[]
  menuOpenId: string | null
  setMenuOpenId: (id: string | null) => void
  getInstallationCount: (id: string) => number
  onEdit: (member: TeamMember) => void
  onToggleActive: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (members.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            installationCount={getInstallationCount(member.id)}
            menuOpen={menuOpenId === member.id}
            onMenuToggle={() =>
              setMenuOpenId(menuOpenId === member.id ? null : member.id)
            }
            onEdit={() => onEdit(member)}
            onToggleActive={() => onToggleActive(member.id)}
            onDelete={() => onDelete(member.id)}
          />
        ))}
      </div>
    </div>
  )
}

/** Teamlid rij */
function TeamMemberRow({
  member,
  installationCount,
  menuOpen,
  onMenuToggle,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  member: TeamMember
  installationCount: number
  menuOpen: boolean
  onMenuToggle: () => void
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`px-6 py-4 flex items-center justify-between ${
        !member.active ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
            member.active ? 'bg-blue-600' : 'bg-gray-400'
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
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{member.name}</p>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                roleColors[member.role]
              }`}
            >
              {getRoleLabel(member.role)}
            </span>
            {!member.active && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Inactief
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Mail className="h-3 w-3" />
              {member.email}
            </div>
            {member.role === 'monteur' && (
              <div className="text-sm text-gray-500">
                {installationCount} installaties
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onMenuToggle} />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
              <button
                onClick={onEdit}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Bewerken
              </button>
              <button
                onClick={onToggleActive}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
              <hr className="my-1" />
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Verwijderen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Teamlid formulier modal */
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
    role: member?.role || 'monteur',
    active: member?.active ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const memberData: Partial<TeamMember> = {
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      active: formData.active,
    }

    onSave(memberData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {member ? 'Teamlid bewerken' : 'Nieuw teamlid'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jan de Vries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jan@p1meter.nl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === 'admin' &&
                'Volledige toegang tot alle functies'}
              {formData.role === 'planner' &&
                'Kan klanten en installaties beheren'}
              {formData.role === 'monteur' && 'Ziet eigen taken en installaties'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Account is actief
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              {member ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
