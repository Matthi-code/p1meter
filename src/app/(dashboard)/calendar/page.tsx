'use client'

import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, EventClickArg } from '@fullcalendar/core'
import { useInstallations, useTasks, useEnergieBuddies, useCustomers, useSmartMeters } from '@/hooks/useData'
import * as dataApi from '@/lib/data'
import { formatDateTime } from '@/lib/utils'
import { installationStatusConfig, taskStatusConfig } from '@/lib/status'
import { Card } from '@/components/ui'
import {
  X,
  Wrench,
  CheckSquare,
  MapPin,
  User,
  Clock,
  Loader2,
  Phone,
  Mail,
  Navigation,
  Camera,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  FileText,
  Building,
  Trash2,
  Check,
} from 'lucide-react'
import type { Installation, Task, Customer, TeamMember, SmartMeter, InstallationWithRelations, TaskWithRelations } from '@/types/supabase'
import type { InstallationStatus, TaskStatus } from '@/types/database'

type CalendarEvent = EventInput & {
  extendedProps: {
    type: 'installation' | 'task'
    data: InstallationWithRelations | TaskWithRelations
  }
}

const installationStatusOptions: InstallationStatus[] = [
  'scheduled',
  'confirmed',
  'traveling',
  'in_progress',
  'completed',
  'cancelled',
]

const taskStatusOptions: TaskStatus[] = ['pending', 'in_progress', 'completed']

const recurrenceOptions = [
  { value: '', label: 'Eenmalig' },
  { value: 'FREQ=DAILY', label: 'Dagelijks' },
  { value: 'FREQ=WEEKLY', label: 'Wekelijks' },
  { value: 'FREQ=WEEKLY;BYDAY=MO,WE,FR', label: 'Ma, Wo, Vr' },
  { value: 'FREQ=MONTHLY', label: 'Maandelijks' },
]

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [filterEnergieBuddy, setFilterEnergieBuddy] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<'installation' | 'task' | null>(null)

  const { data: installations, isLoading: installationsLoading, refetch: refetchInstallations } = useInstallations()
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { data: energieBuddies, isLoading: energieBuddiesLoading } = useEnergieBuddies()
  const { data: customers } = useCustomers()
  const { data: smartMeters } = useSmartMeters()

  const isLoading = installationsLoading || tasksLoading || energieBuddiesLoading

  // Convert to FullCalendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = []

    // Installations
    ;(installations ?? []).forEach((inst) => {
      if (filterEnergieBuddy !== 'all' && inst.assigned_to !== filterEnergieBuddy) {
        return
      }

      const endDate = new Date(inst.scheduled_at)
      endDate.setMinutes(endDate.getMinutes() + inst.duration_minutes)

      const config = installationStatusConfig[inst.status]

      calendarEvents.push({
        id: `inst-${inst.id}`,
        title: inst.customer?.name || 'Installatie',
        start: inst.scheduled_at,
        end: endDate.toISOString(),
        backgroundColor: config.calendarColor,
        borderColor: config.calendarColor,
        extendedProps: {
          type: 'installation',
          data: inst,
        },
      })
    })

    // Tasks
    ;(tasks ?? []).forEach((task) => {
      if (
        filterEnergieBuddy !== 'all' &&
        task.assigned_to &&
        task.assigned_to !== filterEnergieBuddy
      ) {
        return
      }

      const endDate = new Date(task.scheduled_at)
      if (task.duration_minutes) {
        endDate.setMinutes(endDate.getMinutes() + task.duration_minutes)
      } else {
        endDate.setHours(endDate.getHours() + 1)
      }

      calendarEvents.push({
        id: `task-${task.id}`,
        title: task.title,
        start: task.scheduled_at,
        end: endDate.toISOString(),
        backgroundColor: '#f97316',
        borderColor: '#f97316',
        extendedProps: {
          type: 'task',
          data: task,
        },
      })
    })

    return calendarEvents
  }, [installations, tasks, filterEnergieBuddy])

  // Event click handler
  function handleEventClick(info: EventClickArg) {
    const event = info.event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start?.toISOString(),
      end: event.end?.toISOString(),
      extendedProps: event.extendedProps as CalendarEvent['extendedProps'],
    })
  }

  // Edit handler
  function handleEdit() {
    if (!selectedEvent) return
    setEditingType(selectedEvent.extendedProps.type)
    setIsModalOpen(true)
  }

  // Status change handlers
  async function handleInstallationStatusChange(installationId: string, newStatus: InstallationStatus) {
    try {
      await dataApi.updateInstallation(installationId, { status: newStatus })
      refetchInstallations()
      // Update selected event
      if (selectedEvent?.extendedProps.type === 'installation') {
        const data = selectedEvent.extendedProps.data as InstallationWithRelations
        setSelectedEvent({
          ...selectedEvent,
          extendedProps: {
            ...selectedEvent.extendedProps,
            data: { ...data, status: newStatus },
          },
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  async function handleTaskStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      await dataApi.updateTask(taskId, { status: newStatus })
      refetchTasks()
      // Update selected event
      if (selectedEvent?.extendedProps.type === 'task') {
        const data = selectedEvent.extendedProps.data as TaskWithRelations
        setSelectedEvent({
          ...selectedEvent,
          extendedProps: {
            ...selectedEvent.extendedProps,
            data: { ...data, status: newStatus },
          },
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Kon status niet bijwerken')
    }
  }

  // Save handlers
  async function handleSaveInstallation(installationData: Partial<Installation>) {
    if (!selectedEvent) return
    const data = selectedEvent.extendedProps.data as InstallationWithRelations
    try {
      await dataApi.updateInstallation(data.id, installationData)
      setIsModalOpen(false)
      refetchInstallations()
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error saving installation:', error)
      alert('Kon installatie niet opslaan')
    }
  }

  async function handleSaveTask(taskData: Partial<Task>) {
    if (!selectedEvent) return
    const data = selectedEvent.extendedProps.data as TaskWithRelations
    try {
      await dataApi.updateTask(data.id, taskData)
      setIsModalOpen(false)
      refetchTasks()
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Kon taak niet opslaan')
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      try {
        await dataApi.deleteTask(taskId)
        setSelectedEvent(null)
        refetchTasks()
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalender</h1>
          <p className="text-slate-500">Overzicht van installaties en taken</p>
        </div>
      </div>

      {/* Energie Buddy filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-slate-500 py-1.5">
          <User className="h-4 w-4 inline mr-1" />
          Buddy:
        </span>
        <button
          onClick={() => setFilterEnergieBuddy('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filterEnergieBuddy === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle
        </button>
        {(energieBuddies ?? []).map((buddy) => {
          const instCount = (installations ?? []).filter((i) => i.assigned_to === buddy.id).length
          const taskCount = (tasks ?? []).filter((t) => t.assigned_to === buddy.id).length
          const total = instCount + taskCount
          if (total === 0 && filterEnergieBuddy !== buddy.id) return null

          return (
            <button
              key={buddy.id}
              onClick={() => setFilterEnergieBuddy(buddy.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterEnergieBuddy === buddy.id
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {buddy.name.split(' ')[0]} ({total})
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">Gepland</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Bevestigd/Voltooid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-600">Onderweg/Bezig</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-slate-600">Taak</span>
        </div>
      </div>

      {/* Main content - Calendar + Detail Panel */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Calendar */}
        <div className={`flex-1 ${selectedEvent ? 'hidden lg:block' : ''}`}>
          <Card padding="md" className="h-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              locale="nl"
              firstDay={1}
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              buttonText={{
                today: 'Vandaag',
                month: 'Maand',
                week: 'Week',
                day: 'Dag',
              }}
            />
          </Card>
        </div>

        {/* Detail Panel */}
        {selectedEvent && (
          selectedEvent.extendedProps.type === 'installation' ? (
            <InstallationDetailPanel
              installation={selectedEvent.extendedProps.data as InstallationWithRelations}
              smartMeters={smartMeters ?? []}
              onClose={() => setSelectedEvent(null)}
              onEdit={handleEdit}
              onStatusChange={(status) =>
                handleInstallationStatusChange(
                  (selectedEvent.extendedProps.data as InstallationWithRelations).id,
                  status
                )
              }
            />
          ) : (
            <TaskDetailPanel
              task={selectedEvent.extendedProps.data as TaskWithRelations}
              onClose={() => setSelectedEvent(null)}
              onEdit={handleEdit}
              onStatusChange={(status) =>
                handleTaskStatusChange(
                  (selectedEvent.extendedProps.data as TaskWithRelations).id,
                  status
                )
              }
              onDelete={() =>
                handleDeleteTask((selectedEvent.extendedProps.data as TaskWithRelations).id)
              }
              onComplete={() =>
                handleTaskStatusChange(
                  (selectedEvent.extendedProps.data as TaskWithRelations).id,
                  'completed'
                )
              }
            />
          )
        )}

        {/* Empty state when no event selected (desktop only) */}
        {!selectedEvent && (
          <div className="hidden lg:flex w-[400px] items-center justify-center">
            <Card padding="lg" className="text-center">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Selecteer een afspraak
              </h3>
              <p className="text-slate-500">
                Klik op een installatie of taak in de kalender om details te bekijken
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {isModalOpen && editingType === 'installation' && selectedEvent && (
        <InstallationModal
          installation={selectedEvent.extendedProps.data as InstallationWithRelations}
          customers={customers ?? []}
          energieBuddies={energieBuddies ?? []}
          onClose={() => {
            setIsModalOpen(false)
            setEditingType(null)
          }}
          onSave={handleSaveInstallation}
        />
      )}

      {isModalOpen && editingType === 'task' && selectedEvent && (
        <TaskModal
          task={selectedEvent.extendedProps.data as TaskWithRelations}
          customers={customers ?? []}
          teamMembers={energieBuddies ?? []}
          onClose={() => {
            setIsModalOpen(false)
            setEditingType(null)
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  )
}

/** Installation detail panel */
function InstallationDetailPanel({
  installation,
  smartMeters,
  onClose,
  onEdit,
  onStatusChange,
}: {
  installation: InstallationWithRelations
  smartMeters: SmartMeter[]
  onClose: () => void
  onEdit: () => void
  onStatusChange: (status: InstallationStatus) => void
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const config = installationStatusConfig[installation.status]
  const hasCoords = installation.customer?.latitude && installation.customer?.longitude

  const matchedMeter = smartMeters.find((m) =>
    installation.notes?.toLowerCase().includes(m.brand.toLowerCase())
  ) || smartMeters[0]

  return (
    <div className="w-full lg:w-[450px] flex flex-col">
      {/* Mobile back button */}
      <button
        onClick={onClose}
        className="lg:hidden flex items-center gap-2 text-slate-600 mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Terug naar kalender
      </button>

      <Card padding="none" className="flex-1 overflow-hidden flex flex-col">
        {/* Street View Header */}
        {hasCoords && (
          <div className="relative h-40 flex-shrink-0">
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${installation.customer?.latitude},${installation.customer?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full hover:opacity-90 transition-opacity"
            >
              <img
                src={`https://maps.googleapis.com/maps/api/streetview?size=600x200&location=${installation.customer?.latitude},${installation.customer?.longitude}&fov=80&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                alt={`Straatbeeld ${installation.customer?.address}`}
                className="w-full h-full object-cover"
              />
            </a>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-4 w-4 text-white/80" />
                <span className="text-white/80 text-xs">Installatie</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {installation.customer?.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="hidden lg:flex absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute top-3 left-3 flex items-center gap-1 text-white/60 text-xs">
              <Camera className="h-3 w-3" />
              360° weergave
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Header without Street View */}
          {!hasCoords && (
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Installatie</p>
                  <h2 className="font-bold text-slate-900">
                    {installation.customer?.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* Status and actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
              >
                {config.label}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[140px]">
                    {installationStatusOptions.map((status) => {
                      const statusConfig = installationStatusConfig[status]
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            onStatusChange(status)
                            setShowStatusMenu(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                            installation.status === status ? 'font-medium text-blue-600' : 'text-slate-700'
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

            <button onClick={onEdit} className="btn btn-primary text-sm">
              Bewerken
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {installation.customer?.phone && (
              <a
                href={`tel:${installation.customer.phone}`}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Bellen
              </a>
            )}
            {hasCoords && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${installation.customer?.latitude},${installation.customer?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                Navigeer
              </a>
            )}
          </div>

          {/* Appointment info */}
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Afspraak
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Datum & tijd</span>
                <span className="font-medium text-slate-900">{formatDateTime(installation.scheduled_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duur</span>
                <span className="font-medium text-slate-900">{installation.duration_minutes} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Energie Buddy</span>
                <span className="font-medium text-slate-900">{installation.assignee?.name || 'Niet toegewezen'}</span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Klant
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{installation.customer?.address}</p>
                  <p className="text-slate-500">{installation.customer?.postal_code} {installation.customer?.city}</p>
                </div>
              </div>
              {installation.customer?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${installation.customer.phone}`} className="text-sm text-blue-600 hover:underline">
                    {installation.customer.phone}
                  </a>
                </div>
              )}
              {installation.customer?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${installation.customer.email}`} className="text-sm text-blue-600 hover:underline">
                    {installation.customer.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Smart meter */}
          {matchedMeter && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-slate-500" />
                Slimme Meter
              </h3>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{matchedMeter.brand} {matchedMeter.model}</p>
                    <p className="text-xs text-slate-500">SMR {matchedMeter.smr_version}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500">USB-C Adapter</span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${matchedMeter.needs_adapter ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {matchedMeter.needs_adapter ? (
                      <><AlertCircle className="h-3 w-3" /> Vereist</>
                    ) : (
                      <><CheckCircle className="h-3 w-3" /> Niet nodig</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {installation.notes && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">Notities</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-800">{installation.notes}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
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
    <div className="w-full lg:w-[450px] flex flex-col">
      {/* Mobile back button */}
      <button
        onClick={onClose}
        className="lg:hidden flex items-center gap-2 text-slate-600 mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Terug naar kalender
      </button>

      <Card padding="none" className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
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
                <p className="text-xs text-slate-500">Taak</p>
                <h2 className={`font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {task.title}
                </h2>
                {task.is_recurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 mt-1">
                    <RefreshCw className="h-3 w-3" />
                    Terugkerend
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Status and actions */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
              >
                {config.label}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[140px]">
                    {taskStatusOptions.map((status) => {
                      const statusConfig = taskStatusConfig[status]
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            onStatusChange(status)
                            setShowStatusMenu(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                            task.status === status ? 'font-medium text-blue-600' : 'text-slate-700'
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
              <button onClick={onDelete} className="btn btn-ghost text-red-600 hover:bg-red-50 p-2">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={onEdit} className="btn btn-primary text-sm">
                Bewerken
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Description */}
          {task.description && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Beschrijving
              </h3>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Planning
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Datum & tijd</span>
                <span className="font-medium text-slate-900">{formatDateTime(task.scheduled_at)}</span>
              </div>
              {task.duration_minutes && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duur</span>
                  <span className="font-medium text-slate-900">{task.duration_minutes} min</span>
                </div>
              )}
              {task.is_recurring && task.recurrence_rule && (
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Herhaling</span>
                  <span className="font-medium text-purple-600 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {recurrenceOptions.find(r => r.value === task.recurrence_rule)?.label || task.recurrence_rule}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Toegewezen aan
              </h3>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.assignee.name}</p>
                    {task.assignee.email && (
                      <p className="text-xs text-slate-500">{task.assignee.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer */}
          {task.customer && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-500" />
                Gekoppelde klant
              </h3>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.customer.name}</p>
                    <p className="text-xs text-slate-500">{task.customer.address}, {task.customer.city}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete button */}
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

/** Installation form modal */
function InstallationModal({
  installation,
  customers,
  energieBuddies,
  onClose,
  onSave,
}: {
  installation: InstallationWithRelations
  customers: Customer[]
  energieBuddies: TeamMember[]
  onClose: () => void
  onSave: (data: Partial<Installation>) => void
}) {
  const [formData, setFormData] = useState({
    customer_id: installation.customer_id,
    scheduled_date: new Date(installation.scheduled_at).toISOString().split('T')[0],
    scheduled_time: new Date(installation.scheduled_at).toTimeString().slice(0, 5),
    duration_minutes: installation.duration_minutes,
    assigned_to: installation.assigned_to || '',
    notes: installation.notes || '',
    status: installation.status,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`).toISOString()
    onSave({
      customer_id: formData.customer_id,
      scheduled_at: scheduledAt,
      duration_minutes: formData.duration_minutes,
      status: formData.status,
      assigned_to: formData.assigned_to || undefined,
      notes: formData.notes || undefined,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Installatie bewerken</h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Klant</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_id: e.target.value }))}
              className="input"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.address}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Datum</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_date: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tijd</label>
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duur (min)</label>
              <input
                type="number"
                min={15}
                step={15}
                value={formData.duration_minutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Energie Buddy</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))}
                className="input"
              >
                <option value="">Selecteer...</option>
                {energieBuddies.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as InstallationStatus }))}
              className="input"
            >
              {installationStatusOptions.map((s) => (
                <option key={s} value={s}>{installationStatusConfig[s].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notities</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Annuleren</button>
            <button type="submit" className="btn btn-primary flex-1">Opslaan</button>
          </div>
        </form>
      </div>
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
  task: TaskWithRelations
  customers: Customer[]
  teamMembers: TeamMember[]
  onClose: () => void
  onSave: (data: Partial<Task>) => void
}) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    scheduled_date: new Date(task.scheduled_at).toISOString().split('T')[0],
    scheduled_time: new Date(task.scheduled_at).toTimeString().slice(0, 5),
    duration_minutes: task.duration_minutes || 60,
    assigned_to: task.assigned_to || '',
    customer_id: task.customer_id || '',
    is_recurring: task.is_recurring,
    recurrence_rule: task.recurrence_rule || '',
    status: task.status,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`).toISOString()
    onSave({
      title: formData.title,
      description: formData.description || undefined,
      scheduled_at: scheduledAt,
      duration_minutes: formData.duration_minutes || undefined,
      assigned_to: formData.assigned_to || undefined,
      customer_id: formData.customer_id || undefined,
      is_recurring: formData.is_recurring,
      recurrence_rule: formData.is_recurring ? formData.recurrence_rule : undefined,
      status: formData.status,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Taak bewerken</h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Titel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Beschrijving</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Datum</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_date: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tijd</label>
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duur (min)</label>
              <input
                type="number"
                min={0}
                step={15}
                value={formData.duration_minutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Toewijzen aan</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))}
                className="input"
              >
                <option value="">Niet toegewezen</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Klant (optioneel)</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_id: e.target.value }))}
              className="input"
            >
              <option value="">Geen klant</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_recurring: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Terugkerende taak</span>
            </label>
            {formData.is_recurring && (
              <select
                value={formData.recurrence_rule}
                onChange={(e) => setFormData((prev) => ({ ...prev, recurrence_rule: e.target.value }))}
                className="input"
              >
                {recurrenceOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
              className="input"
            >
              {taskStatusOptions.map((s) => (
                <option key={s} value={s}>{taskStatusConfig[s].label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Annuleren</button>
            <button type="submit" className="btn btn-primary flex-1">Opslaan</button>
          </div>
        </form>
      </div>
    </div>
  )
}
