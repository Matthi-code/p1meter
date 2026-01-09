'use client'

import { useState, useMemo } from 'react'
import { useTasks, useCustomers, useTeamMembers } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import { formatDateTime } from '@/lib/utils'
import { taskStatusConfig } from '@/lib/status'
import { Card } from '@/components/ui'
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  User,
  RefreshCw,
  X,
  Calendar,
  ChevronDown,
  Check,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Trash2,
  FileText,
  Building,
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
  const [buddyFilter, setBuddyFilter] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    let result = [...tasks]

    // Hide completed tasks
    if (!showCompleted) {
      result = result.filter((t) => t.status !== 'completed')
    }

    // Filter by search query
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

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // Filter by team member
    if (buddyFilter !== 'all') {
      if (buddyFilter === 'unassigned') {
        result = result.filter((t) => !t.assigned_to)
      } else {
        result = result.filter((t) => t.assigned_to === buddyFilter)
      }
    }

    // Sort by date
    result.sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )

    return result
  }, [tasks, searchQuery, statusFilter, buddyFilter, showCompleted])

  // Open modal for new task
  function handleAddNew() {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  // Open modal for editing
  function handleEdit(task: TaskWithRelations) {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Change status
  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      await dataApi.updateTask(taskId, { status: newStatus })
      refetch()
      // Update active task if it's the same
      if (activeTask?.id === taskId) {
        setActiveTask({ ...activeTask, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  // Complete task (quick action)
  function handleComplete(taskId: string) {
    handleStatusChange(taskId, 'completed')
  }

  // Save task
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

  // Delete task
  async function handleDelete(taskId: string) {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      try {
        await dataApi.deleteTask(taskId)
        if (activeTask?.id === taskId) {
          setActiveTask(null)
        }
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

  // Statistics
  const stats = {
    pending: allTasks.filter((t) => t.status === 'pending').length,
    inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Taken</h1>
          <p className="text-slate-500">Beheer taken en terugkerende activiteiten</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nieuwe taak
        </button>
      </div>

      {/* Filter section */}
      <div className="space-y-3 mb-4">
        {/* Status filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500 py-1.5">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle ({showCompleted ? allTasks.length : allTasks.filter(t => t.status !== 'completed').length})
          </button>
          {statusOptions.map((status) => {
            const count = allTasks.filter((t) => t.status === status).length
            if (count === 0 && statusFilter !== status) return null
            if (status === 'completed' && !showCompleted && statusFilter !== status) return null

            const config = taskStatusConfig[status]

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
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Toon voltooide
          </label>
        </div>

        {/* Team member filter buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-slate-500 py-1.5">
            <User className="h-4 w-4 inline mr-1" />
            Persoon:
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
            Niet toegewezen ({allTasks.filter((t) => !t.assigned_to).length})
          </button>
          {teamMembers?.map((member) => {
            const count = allTasks.filter((t) => t.assigned_to === member.id).length
            if (count === 0 && buddyFilter !== member.id) return null

            return (
              <button
                key={member.id}
                onClick={() => setBuddyFilter(member.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  buddyFilter === member.id
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {member.name.split(' ')[0]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Task List - hidden on mobile when detail is shown */}
        <div className={`flex flex-col ${activeTask ? 'hidden lg:flex lg:w-[400px]' : 'w-full'}`}>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op titel, beschrijving of persoon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* List */}
          <Card padding="none" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Geen taken gevonden</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      isActive={activeTask?.id === task.id}
                      onSelect={() => setActiveTask(task)}
                      onComplete={() => handleComplete(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Task Detail - full screen on mobile */}
        {activeTask && (
          <TaskDetailPanel
            task={activeTask}
            onClose={() => setActiveTask(null)}
            onEdit={() => handleEdit(activeTask)}
            onStatusChange={(status) => handleStatusChange(activeTask.id, status)}
            onDelete={() => handleDelete(activeTask.id)}
            onComplete={() => handleComplete(activeTask.id)}
          />
        )}

        {/* Empty state when no task selected (desktop only) */}
        {!activeTask && (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <Card padding="lg" className="text-center max-w-sm">
              <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Selecteer een taak
              </h3>
              <p className="text-slate-500">
                Klik op een taak in de lijst om de details te bekijken
              </p>
            </Card>
          </div>
        )}
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

/** Task list item */
function TaskListItem({
  task,
  isActive,
  onSelect,
  onComplete,
}: {
  task: TaskWithRelations
  isActive: boolean
  onSelect: () => void
  onComplete: () => void
}) {
  const config = taskStatusConfig[task.status]
  const isCompleted = task.status === 'completed'

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'
      } ${isCompleted ? 'opacity-60' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onComplete()
          }}
          disabled={isCompleted}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-slate-300 hover:border-blue-500'
          }`}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-medium truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
              {task.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            {task.is_recurring && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                <RefreshCw className="h-3 w-3" />
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTime(task.scheduled_at)}
          </p>
          {task.assignee && (
            <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <User className="h-3.5 w-3.5" />
              {task.assignee.name}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
      </div>
    </div>
  )
}

/** Task detail panel */
function TaskDetailPanel({
  task,
  onClose,
  onEdit,
  onStatusChange,
  onDelete,
  onComplete,
}: {
  task: TaskWithRelations
  onClose: () => void
  onEdit: () => void
  onStatusChange: (status: TaskStatus) => void
  onDelete: () => void
  onComplete: () => void
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const config = taskStatusConfig[task.status]
  const isCompleted = task.status === 'completed'

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
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                onClick={onComplete}
                disabled={isCompleted}
                className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 hover:border-blue-500'
                }`}
              >
                {isCompleted && <Check className="h-4 w-4" />}
              </button>
              <div>
                <h2 className={`text-xl font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {task.title}
                </h2>
                {task.is_recurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 mt-2">
                    <RefreshCw className="h-3 w-3" />
                    Terugkerende taak
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Status and actions */}
          <div className="flex items-center justify-between">
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
                      const statusConfig = taskStatusConfig[status]
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            onStatusChange(status)
                            setShowStatusMenu(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                            task.status === status
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
              <button
                onClick={onDelete}
                className="btn btn-ghost text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={onEdit} className="btn btn-primary">
                Bewerken
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Beschrijving
              </h3>
              <Card variant="stat" padding="md">
                <p className="text-slate-700 whitespace-pre-wrap">{task.description}</p>
              </Card>
            </div>
          )}

          {/* Schedule info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Planning
            </h3>
            <Card variant="stat" padding="md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Datum & tijd</p>
                  <p className="font-medium text-slate-900">
                    {formatDateTime(task.scheduled_at)}
                  </p>
                </div>
                {task.duration_minutes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duur</p>
                    <p className="font-medium text-slate-900">
                      {task.duration_minutes} min
                    </p>
                  </div>
                )}
              </div>
              {task.is_recurring && task.recurrence_rule && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Herhaling</p>
                  <p className="font-medium text-slate-900 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-purple-500" />
                    {recurrenceOptions.find(r => r.value === task.recurrence_rule)?.label || task.recurrence_rule}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Toegewezen aan
              </h3>
              <Card variant="stat" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{task.assignee.name}</p>
                    {task.assignee.email && (
                      <p className="text-sm text-slate-500">{task.assignee.email}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Linked customer */}
          {task.customer && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-500" />
                Gekoppelde klant
              </h3>
              <Card variant="stat" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{task.customer.name}</p>
                    <p className="text-sm text-slate-500">{task.customer.address}, {task.customer.city}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Quick complete button (if not completed) */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <Check className="h-5 w-5" />
              Markeer als voltooid
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}

/** Task form modal */
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {task ? 'Taak bewerken' : 'Nieuwe taak'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Titel *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="input"
              placeholder="Teamoverleg, Voorraad check, etc."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Beschrijving
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={2}
              className="input resize-none"
              placeholder="Optionele beschrijving..."
            />
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

          {/* Duration and assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                className="input"
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

          {/* Customer (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Gekoppelde klant (optioneel)
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customer_id: e.target.value }))
              }
              className="input"
            >
              <option value="">Geen klant</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring */}
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
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
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
                className="input"
              >
                {recurrenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status (only when editing) */}
          {task && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as TaskStatus }))
                }
                className="input"
              >
                {statusOptions.map((status) => {
                  const statusConfig = taskStatusConfig[status]
                  return (
                    <option key={status} value={status}>
                      {statusConfig.label}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

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
              {task ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
