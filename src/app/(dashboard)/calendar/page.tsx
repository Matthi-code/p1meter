'use client'

import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, EventClickArg } from '@fullcalendar/core'
import { useInstallations, useTasks, useMonteurs } from '@/hooks/useData'
import { getStatusLabel } from '@/lib/utils'
import { X, Wrench, CheckSquare, MapPin, User, Clock, Loader2 } from 'lucide-react'
import type { InstallationWithRelations, TaskWithRelations } from '@/types/supabase'

type CalendarEvent = EventInput & {
  extendedProps: {
    type: 'installation' | 'task'
    data: InstallationWithRelations | TaskWithRelations
  }
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [filterMonteur, setFilterMonteur] = useState<string>('all')

  const { data: installations, isLoading: installationsLoading } = useInstallations()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: monteurs, isLoading: monteursLoading } = useMonteurs()

  const isLoading = installationsLoading || tasksLoading || monteursLoading

  // Converteer naar FullCalendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = []

    // Installaties
    ;(installations ?? []).forEach((inst) => {
      // Filter op monteur
      if (filterMonteur !== 'all' && inst.assigned_to !== filterMonteur) {
        return
      }

      const endDate = new Date(inst.scheduled_at)
      endDate.setMinutes(endDate.getMinutes() + inst.duration_minutes)

      calendarEvents.push({
        id: `inst-${inst.id}`,
        title: inst.customer?.name || 'Installatie',
        start: inst.scheduled_at,
        end: endDate.toISOString(),
        backgroundColor: getInstallationColor(inst.status),
        borderColor: getInstallationColor(inst.status),
        extendedProps: {
          type: 'installation',
          data: inst,
        },
      })
    })

    // Taken
    ;(tasks ?? []).forEach((task) => {
      // Filter op monteur (als toegewezen)
      if (
        filterMonteur !== 'all' &&
        task.assigned_to &&
        task.assigned_to !== filterMonteur
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
        backgroundColor: '#f97316', // orange
        borderColor: '#f97316',
        extendedProps: {
          type: 'task',
          data: task,
        },
      })
    })

    return calendarEvents
  }, [installations, tasks, filterMonteur])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
          <p className="text-gray-600">Overzicht van installaties en taken</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Filter monteur:</label>
          <select
            value={filterMonteur}
            onChange={(e) => setFilterMonteur(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle monteurs</option>
            {(monteurs ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Gepland</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Bevestigd/Voltooid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Onderweg/Bezig</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Taak</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

/** Kleur op basis van installatie status */
function getInstallationColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: '#3b82f6', // blue
    confirmed: '#22c55e', // green
    traveling: '#eab308', // yellow
    in_progress: '#eab308', // yellow
    completed: '#22c55e', // green
    cancelled: '#ef4444', // red
  }
  return colors[status] || '#6b7280'
}

/** Event detail modal component */
function EventDetailModal({
  event,
  onClose,
}: {
  event: CalendarEvent
  onClose: () => void
}) {
  const { type, data } = event.extendedProps
  const isInstallation = type === 'installation'
  const installation = isInstallation ? (data as InstallationWithRelations) : null
  const task = !isInstallation ? (data as TaskWithRelations) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isInstallation ? 'bg-blue-100' : 'bg-orange-100'
              }`}
            >
              {isInstallation ? (
                <Wrench
                  className={`h-5 w-5 ${
                    isInstallation ? 'text-blue-600' : 'text-orange-600'
                  }`}
                />
              ) : (
                <CheckSquare className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">
                {isInstallation ? 'Installatie' : 'Taak'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Tijd */}
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>
              {new Date(event.start as string).toLocaleString('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Installatie specifiek */}
          {installation && (
            <>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  {installation.customer?.address},{' '}
                  {installation.customer?.city}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{installation.assignee?.name || 'Niet toegewezen'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium">
                  {getStatusLabel(installation.status)}
                </span>
              </div>
              {installation.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {installation.notes}
                </div>
              )}
            </>
          )}

          {/* Taak specifiek */}
          {task && (
            <>
              {task.assignee && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{task.assignee.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium">{getStatusLabel(task.status)}</span>
              </div>
              {task.description && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {task.description}
                </div>
              )}
              {task.is_recurring && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  🔁 Terugkerende taak
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Sluiten
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Bewerken
          </button>
        </div>
      </div>
    </div>
  )
}
