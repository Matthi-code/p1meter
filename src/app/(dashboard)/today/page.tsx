'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useInstallations, useTasks } from '@/hooks/useData'
import { useAuth } from '@/lib/auth'
import { formatDateTime } from '@/lib/utils'
import { installationStatusConfig } from '@/lib/status'
import { Card } from '@/components/ui'
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  Circle,
  Loader2,
  Calendar,
  Zap,
  ChevronRight,
  Camera,
} from 'lucide-react'
import type { InstallationWithRelations } from '@/types/supabase'

// Dynamic import for the map
const InstallationsMap = dynamic(() => import('@/components/InstallationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-slate-100 rounded-xl flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
})

export default function TodayPage() {
  const { user } = useAuth()
  const { data: installations, isLoading: installationsLoading } = useInstallations()
  const { data: tasks, isLoading: tasksLoading } = useTasks()

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Filter installations for today assigned to current user
  const todayInstallations = useMemo(() => {
    if (!installations || !user) return []
    return installations
      .filter((inst) => {
        const instDate = new Date(inst.scheduled_at)
        return (
          instDate >= today &&
          instDate < tomorrow &&
          inst.assigned_to === user.id
        )
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [installations, user, today, tomorrow])

  // Filter tasks for today assigned to current user
  const todayTasks = useMemo(() => {
    if (!tasks || !user) return []
    return tasks.filter((task) => {
      if (task.status === 'completed') return false
      if (task.assigned_to !== user.id) return false
      if (!task.scheduled_at) return true // Show unscheduled tasks
      const taskDate = new Date(task.scheduled_at)
      return taskDate >= today && taskDate < tomorrow
    })
  }, [tasks, user, today, tomorrow])

  // Calculate progress
  const completedCount = todayInstallations.filter(
    (i) => i.status === 'completed'
  ).length
  const totalCount = todayInstallations.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Get next installation (first non-completed)
  const nextInstallation = todayInstallations.find(
    (i) => i.status !== 'completed' && i.status !== 'cancelled'
  )

  const isLoading = installationsLoading || tasksLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mijn Dag</h1>
        <p className="text-slate-500">
          {today.toLocaleDateString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Progress card */}
      <Card variant="gradient" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Voortgang vandaag</p>
            <p className="text-3xl font-bold text-slate-900">
              {completedCount}/{totalCount}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {completedCount === totalCount && totalCount > 0
            ? 'Alles voltooid!'
            : `Nog ${totalCount - completedCount} installatie${totalCount - completedCount !== 1 ? 's' : ''} te gaan`}
        </p>
      </Card>

      {/* Next installation - highlighted */}
      {nextInstallation && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Volgende installatie
          </h2>
          <NextInstallationCard installation={nextInstallation} />
        </div>
      )}

      {/* Today's route map */}
      {todayInstallations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Route vandaag
          </h2>
          <Card padding="none" className="overflow-hidden">
            <InstallationsMap
              installations={todayInstallations}
            />
          </Card>
        </div>
      )}

      {/* All installations list */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Alle installaties ({todayInstallations.length})
        </h2>
        {todayInstallations.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Geen installaties gepland voor vandaag</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayInstallations.map((installation, index) => (
              <InstallationItem
                key={installation.id}
                installation={installation}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Today's tasks */}
      {todayTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Taken ({todayTasks.length})
          </h2>
          <Card padding="md">
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <Circle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Next installation card with Street View and actions
function NextInstallationCard({
  installation,
}: {
  installation: InstallationWithRelations
}) {
  const config = installationStatusConfig[installation.status]
  const hasCoords = installation.customer?.latitude && installation.customer?.longitude

  return (
    <Card variant="clickable" padding="none" className="overflow-hidden">
      {/* Street View header */}
      {hasCoords && (
        <div className="relative h-32">
          <img
            src={`https://maps.googleapis.com/maps/api/streetview?size=600x200&location=${installation.customer?.latitude},${installation.customer?.longitude}&fov=80&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
            alt="Straatbeeld"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            <span className="text-white text-sm font-medium">
              {new Date(installation.scheduled_at).toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {installation.customer?.name}
        </h3>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <MapPin className="h-4 w-4" />
          <span>{installation.customer?.address}, {installation.customer?.city}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <Clock className="h-4 w-4" />
          <span>{installation.duration_minutes} minuten</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {installation.customer?.phone && (
            <a
              href={`tel:${installation.customer.phone}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Navigeer
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

// Individual installation item
function InstallationItem({
  installation,
  index,
}: {
  installation: InstallationWithRelations
  index: number
}) {
  const config = installationStatusConfig[installation.status]
  const isCompleted = installation.status === 'completed'

  return (
    <Link href="/installations">
      <Card variant="clickable" padding="md">
        <div className="flex items-center gap-4">
          {/* Number/status indicator */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="font-bold">{index}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-slate-900 truncate">
                {installation.customer?.name}
              </p>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 truncate">
              {installation.customer?.address}
            </p>
          </div>

          {/* Time */}
          <div className="text-right flex-shrink-0">
            <p className="font-medium text-slate-900">
              {new Date(installation.scheduled_at).toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-slate-500">
              {installation.duration_minutes} min
            </p>
          </div>

          <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
        </div>
      </Card>
    </Link>
  )
}
