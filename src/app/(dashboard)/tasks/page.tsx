'use client'

import { useState, useMemo } from 'react'
import { useTasks, useCustomers, useTeamMembers } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import { formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  User,
  RefreshCw,
  X,
  Calendar,
  ChevronDown,
  Check,
  Loader2,
} from 'lucide-react'
import type { Task, Customer, TeamMember, TaskWithRelations } from '@/types/supabase'
import type { TaskStatus } from '@/types/database'

const statusOptions: TaskStatus[] = ['pending', 'in_progress', 'completed']

const recurrenceOptions = [
  { value: '', label: 'Eenmalig' },
  { value: 'FREQ=DAILY', label: 'Dagelijks' },
  { value: 'FREQ=WEEKLY', label: 'Wekelijks' },
  { value: 'FREQ=WEEKLY;BYDAY=MO,WE,FR', label: 'Ma, Wo, Vr' },
  { value: 'FREQ=MONTHLY', label: 'Maandelijks' },
]

export default function TasksPage() {
  const { data: tasks, isLoading, refetch } = useTasks()
  const { data: customers } = useCustomers()
  const { data: teamMembers } = useTeamMembers()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)

  // Gefilterde taken
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    let result = [...tasks]

    // Verberg voltooide taken
    if (!showCompleted) {
      result = result.filter((t) => t.status !== 'completed')
    }

    // Filter op zoekquery
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.assignee?.name.toLowerCase().includes(query) ||
          t.customer?.name.toLowerCase().includes(query)
      )
    }

    // Filter op status
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // Sorteer op datum
    result.sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )

    return result
  }, [tasks, searchQuery, statusFilter, showCompleted])

  // Open modal voor nieuwe taak
  function handleAddNew() {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  // Open modal voor bewerken
  function handleEdit(task: TaskWithRelations) {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Status wijzigen
  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      await dataApi.updateTask(taskId, { status: newStatus })
      refetch()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  // Taak voltooien (quick action)
  function handleComplete(taskId: string) {
    handleStatusChange(taskId, 'completed')
  }

  // Opslaan taak
  async function handleSave(taskData: Partial<Task>) {
    try {
      if (editingTask) {
        await dataApi.updateTask(editingTask.id, taskData)
      } else {
        await dataApi.createTask(taskData as Parameters<typeof dataApi.createTask>[0])
      }
      setIsModalOpen(false)
      setEditingTask(null)
      refetch()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Kon taak niet opslaan')
    }
  }

  // Verwijder taak
  async function handleDelete(taskId: string) {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      try {
        await dataApi.deleteTask(taskId)
        refetch()
      } catch (error) {
        console.error('Error deleting task:', error)
        alert('Kon taak niet verwijderen')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  const allTasks = tasks ?? []

  // Statistieken
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter((t) => t.status === 'pending').length,
    inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    recurring: allTasks.filter((t) => t.is_recurring).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taken</h1>
          <p className="text-gray-600">Beheer taken en terugkerende activiteiten</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nieuwe taak
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek op titel, beschrijving of toegewezen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Alle statussen</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Toon voltooide taken
        </label>
      </div>

      {/* Statistieken */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Totaal" count={stats.total} color="bg-gray-500" />
        <StatCard label="Open" count={stats.pending} color="bg-yellow-500" />
        <StatCard label="Bezig" count={stats.inProgress} color="bg-blue-500" />
        <StatCard label="Voltooid" count={stats.completed} color="bg-green-500" />
        <StatCard
          label="Terugkerend"
          count={stats.recurring}
          color="bg-purple-500"
          icon={<RefreshCw className="h-4 w-4" />}
        />
      </div>

      {/* Taken lijst */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Geen taken gevonden
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleEdit(task)}
                onComplete={() => handleComplete(task.id)}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onDelete={() => handleDelete(task.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          customers={customers ?? []}
          teamMembers={teamMembers ?? []}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
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
  icon,
}: {
  label: string
  count: number
  color: string
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold text-gray-900">{count}</p>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

/** Taak kaart */
function TaskCard({
  task,
  onEdit,
  onComplete,
  onStatusChange,
  onDelete,
}: {
  task: TaskWithRelations
  onEdit: () => void
  onComplete: () => void
  onStatusChange: (status: TaskStatus) => void
  onDelete: () => void
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const isCompleted = task.status === 'completed'

  return (
    <div
      className={`p-4 hover:bg-gray-50 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={onComplete}
          disabled={isCompleted}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3
              className={`font-medium ${
                isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            {task.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                <RefreshCw className="h-3 w-3" />
                Terugkerend
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                  task.status
                )}`}
              >
                {getStatusLabel(task.status)}
                <ChevronDown className="h-3 w-3" />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          onStatusChange(status)
                          setShowStatusMenu(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          task.status === status
                            ? 'font-medium text-blue-600'
                            : 'text-gray-700'
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

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDateTime(task.scheduled_at)}
            </div>
            {task.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {task.duration_minutes} min
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {task.assignee.name}
              </div>
            )}
            {task.customer && (
              <div className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                {task.customer.name}
              </div>
            )}
          </div>
        </div>

        {/* Acties */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Bewerken
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  )
}

/** Taak formulier modal */
function TaskModal({
  task,
  customers,
  teamMembers,
  onClose,
  onSave,
}: {
  task: TaskWithRelations | null
  customers: Customer[]
  teamMembers: TeamMember[]
  onClose: () => void
  onSave: (task: Partial<Task>) => void
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    scheduled_date: task
      ? new Date(task.scheduled_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    scheduled_time: task
      ? new Date(task.scheduled_at).toTimeString().slice(0, 5)
      : '09:00',
    duration_minutes: task?.duration_minutes || 60,
    assigned_to: task?.assigned_to || '',
    customer_id: task?.customer_id || '',
    is_recurring: task?.is_recurring || false,
    recurrence_rule: task?.recurrence_rule || '',
    status: task?.status || 'pending',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const scheduledAt = new Date(
      `${formData.scheduled_date}T${formData.scheduled_time}:00`
    ).toISOString()

    const taskData: Partial<Task> = {
      title: formData.title,
      description: formData.description || undefined,
      scheduled_at: scheduledAt,
      duration_minutes: formData.duration_minutes || undefined,
      assigned_to: formData.assigned_to || undefined,
      customer_id: formData.customer_id || undefined,
      is_recurring: formData.is_recurring,
      recurrence_rule: formData.is_recurring ? formData.recurrence_rule : undefined,
      status: formData.status as TaskStatus,
    }

    onSave(taskData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {task ? 'Taak bewerken' : 'Nieuwe taak'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Titel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Teamoverleg, Voorraad check, etc."
            />
          </div>

          {/* Beschrijving */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschrijving
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optionele beschrijving..."
            />
          </div>

          {/* Datum en tijd */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duur en toewijzen */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duur (minuten)
              </label>
              <input
                type="number"
                min={0}
                step={15}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_minutes: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Toewijzen aan
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assigned_to: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Niet toegewezen</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Klant (optioneel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gekoppelde klant (optioneel)
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customer_id: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Geen klant</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Terugkerend */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_recurring: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Terugkerende taak
              </span>
            </label>

            {formData.is_recurring && (
              <select
                value={formData.recurrence_rule}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recurrence_rule: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {recurrenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status (alleen bij bewerken) */}
          {task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as TaskStatus }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {task ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
