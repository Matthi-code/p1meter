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
  Zap,
  Calendar,
  ChevronRight,
  Loader2,
  ArrowRight,
} from 'lucide-react'

// Dynamic import for the map
const InstallationsMap = dynamic(() => import('@/components/InstallationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[180px] bg-slate-100 rounded-xl flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
})

export function EnergieBuddyDashboard() {
  const { user } = useAuth()
  const { data: installations, isLoading: installationsLoading } = useInstallations()
  const { data: tasks } = useTasks()

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

  // Calculate progress
  const completedCount = todayInstallations.filter(
    (i) => i.status === 'completed'
  ).length
  const totalCount = todayInstallations.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Get next installation
  const nextInstallation = todayInstallations.find(
    (i) => i.status !== 'completed' && i.status !== 'cancelled'
  )

  // Open tasks count
  const openTasksCount = tasks?.filter(
    (t) => t.assigned_to === user?.id && t.status !== 'completed'
  ).length || 0

  if (installationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Goedemorgen, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-slate-500">
          {today.toLocaleDateString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="stat" accentColor="blue" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Vandaag</p>
              <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
              <p className="text-xs text-slate-500">installaties</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="stat" accentColor="emerald" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Voortgang</p>
              <p className="text-2xl font-bold text-slate-900">
                {completedCount}/{totalCount}
              </p>
              <p className="text-xs text-slate-500">voltooid</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Progress bar */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Dagvoortgang</span>
          <span className="text-sm font-bold text-slate-900">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Next installation */}
      {nextInstallation && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Volgende installatie
            </h2>
            <Link
              href="/today"
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
            >
              Bekijk alles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Card variant="gradient" padding="md">
            <div className="flex items-start gap-4">
              {/* Time */}
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white flex-shrink-0">
                <span className="text-xl font-bold">
                  {new Date(nextInstallation.scheduled_at).toLocaleTimeString('nl-NL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  {nextInstallation.customer?.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{nextInstallation.customer?.address}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{nextInstallation.duration_minutes} minuten</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4">
              {nextInstallation.customer?.phone && (
                <a
                  href={`tel:${nextInstallation.customer.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Bellen
                </a>
              )}
              {nextInstallation.customer?.latitude && nextInstallation.customer?.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nextInstallation.customer.latitude},${nextInstallation.customer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Navigeer
                </a>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Today's route */}
      {todayInstallations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Route vandaag
          </h2>
          <Card padding="none" className="overflow-hidden">
            <InstallationsMap installations={todayInstallations} />
          </Card>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/today">
          <Card variant="clickable" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Mijn Dag</p>
                <p className="text-xs text-slate-500">{totalCount} installaties</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 ml-auto" />
            </div>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card variant="clickable" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Taken</p>
                <p className="text-xs text-slate-500">{openTasksCount} open</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 ml-auto" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
