'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useInstallations, useTasks, useCustomers, useEnergieBuddies } from '@/hooks/useData'
import { useAuth } from '@/lib/auth'
import { formatDateTime } from '@/lib/utils'
import { installationStatusConfig } from '@/lib/status'
import { Card } from '@/components/ui'
import {
  Calendar,
  Users,
  Wrench,
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronRight,
  Plus,
  Loader2,
  User,
  TrendingUp,
} from 'lucide-react'

export function PlannerDashboard() {
  const { user } = useAuth()
  const { data: installations, isLoading: installationsLoading } = useInstallations()
  const { data: tasks } = useTasks()
  const { data: customers } = useCustomers()
  const { data: energieBuddies } = useEnergieBuddies()

  // Get today and this week's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Today's installations
  const todayInstallations = useMemo(() => {
    if (!installations) return []
    return installations.filter((inst) => {
      const instDate = new Date(inst.scheduled_at)
      return instDate >= today && instDate < tomorrow
    })
  }, [installations, today, tomorrow])

  // This week's installations
  const weekInstallations = useMemo(() => {
    if (!installations) return []
    return installations.filter((inst) => {
      const instDate = new Date(inst.scheduled_at)
      return instDate >= today && instDate < weekEnd
    })
  }, [installations, today, weekEnd])

  // Unassigned installations
  const unassignedInstallations = useMemo(() => {
    if (!installations) return []
    return installations.filter(
      (inst) => !inst.assigned_to && inst.status !== 'completed' && inst.status !== 'cancelled'
    )
  }, [installations])

  // Pending confirmations
  const pendingConfirmations = useMemo(() => {
    if (!installations) return []
    return installations.filter((inst) => inst.status === 'scheduled')
  }, [installations])

  // Available energy buddies (those not on an installation right now)
  const availableBuddies = useMemo(() => {
    if (!energieBuddies || !installations) return []
    const busyBuddyIds = installations
      .filter((i) => i.status === 'in_progress' || i.status === 'traveling')
      .map((i) => i.assigned_to)
    return energieBuddies.filter((b) => !busyBuddyIds.includes(b.id))
  }, [energieBuddies, installations])

  // Open tasks
  const openTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.filter((t) => t.status !== 'completed').slice(0, 5)
  }, [tasks])

  // Today's completed count
  const todayCompleted = todayInstallations.filter(
    (i) => i.status === 'completed'
  ).length

  if (installationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welkom terug, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500">
            {today.toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/installations"
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nieuwe installatie
          </Link>
          <Link
            href="/customers"
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nieuwe klant
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="stat" accentColor="blue" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Vandaag</p>
              <p className="text-2xl font-bold text-slate-900">
                {todayInstallations.length}
              </p>
              <p className="text-xs text-emerald-600">
                {todayCompleted} voltooid
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="stat" accentColor="emerald" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Deze week</p>
              <p className="text-2xl font-bold text-slate-900">
                {weekInstallations.length}
              </p>
              <p className="text-xs text-slate-500">installaties</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card variant="stat" accentColor="amber" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Team</p>
              <p className="text-2xl font-bold text-slate-900">
                {availableBuddies.length}/{energieBuddies?.length || 0}
              </p>
              <p className="text-xs text-slate-500">beschikbaar</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card variant="stat" accentColor="purple" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Klanten</p>
              <p className="text-2xl font-bold text-slate-900">
                {customers?.length || 0}
              </p>
              <p className="text-xs text-slate-500">totaal</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Attention needed section */}
      {(unassignedInstallations.length > 0 || pendingConfirmations.length > 0) && (
        <Card padding="md" className="border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Aandacht nodig</h2>
              <p className="text-sm text-slate-500">Acties die je aandacht vereisen</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {unassignedInstallations.length > 0 && (
              <Link href="/installations">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    {unassignedInstallations.length}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Niet toegewezen</p>
                    <p className="text-xs text-slate-500">Wijs een Energie Buddy toe</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            )}

            {pendingConfirmations.length > 0 && (
              <Link href="/installations">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {pendingConfirmations.length}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Wacht op bevestiging</p>
                    <p className="text-xs text-slate-500">Bevestig met klant</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's installations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Vandaag
            </h2>
            <Link
              href="/calendar"
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
            >
              Kalender
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Card padding="none">
            {todayInstallations.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Geen installaties gepland</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayInstallations.slice(0, 5).map((installation) => {
                  const config = installationStatusConfig[installation.status]
                  return (
                    <Link
                      key={installation.id}
                      href="/installations"
                      className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-12 text-center flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(installation.scheduled_at).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {installation.customer?.name}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {installation.assignee?.name || 'Niet toegewezen'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </Link>
                  )
                })}
                {todayInstallations.length > 5 && (
                  <Link
                    href="/calendar"
                    className="block p-3 text-center text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                  >
                    +{todayInstallations.length - 5} meer
                  </Link>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Open tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Openstaande taken
            </h2>
            <Link
              href="/tasks"
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
            >
              Alle taken
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Card padding="none">
            {openTasks.length === 0 ? (
              <div className="p-8 text-center">
                <CheckSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Geen openstaande taken</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {openTasks.map((task) => (
                  <Link
                    key={task.id}
                    href="/tasks"
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {task.assignee?.name || 'Niet toegewezen'}
                      </p>
                    </div>
                    {task.scheduled_at && (
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(task.scheduled_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/calendar">
          <Card variant="clickable" padding="md">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-slate-900">Kalender</p>
            </div>
          </Card>
        </Link>

        <Link href="/installations">
          <Card variant="clickable" padding="md">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="font-medium text-slate-900">Installaties</p>
            </div>
          </Card>
        </Link>

        <Link href="/customers">
          <Card variant="clickable" padding="md">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium text-slate-900">Klanten</p>
            </div>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card variant="clickable" padding="md">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-amber-600" />
              </div>
              <p className="font-medium text-slate-900">Taken</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
