'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import {
  useDashboardStats,
  useUpcomingInstallations,
  useTodayTasks,
} from '@/hooks/useData'
import { getStatusLabel, getStatusColor } from '@/lib/utils'
import {
  Calendar,
  Users,
  Wrench,
  CheckSquare,
  TrendingUp,
  ArrowRight,
  Clock,
  MapPin,
  UserCheck,
  Loader2,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: upcomingInstallations, isLoading: installationsLoading } = useUpcomingInstallations(5)
  const { data: todayTasks, isLoading: tasksLoading } = useTodayTasks()

  // Statistieken met links
  const statCards = [
    {
      label: 'Installaties vandaag',
      value: stats?.todayInstallations ?? 0,
      total: stats?.totalInstallations ?? 0,
      icon: <Wrench className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      href: '/installations',
    },
    {
      label: 'Openstaande taken',
      value: stats?.pendingTasks ?? 0,
      total: stats?.pendingTasks ?? 0,
      icon: <CheckSquare className="h-6 w-6" />,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-100',
      iconBg: 'bg-amber-500',
      href: '/tasks',
    },
    {
      label: 'Actieve klanten',
      value: stats?.totalCustomers ?? 0,
      total: stats?.totalCustomers ?? 0,
      icon: <Users className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-100',
      iconBg: 'bg-emerald-500',
      href: '/customers',
    },
    {
      label: 'Actieve monteurs',
      value: stats?.activeMonteurs ?? 0,
      total: stats?.activeMonteurs ?? 0,
      icon: <UserCheck className="h-6 w-6" />,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-100',
      iconBg: 'bg-violet-500',
      href: '/team',
    },
  ]

  // Filter taken die nog niet voltooid zijn
  const pendingTodayTasks = todayTasks?.filter(t => t.status !== 'completed') ?? []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welkom terug, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-1">
            Hier is een overzicht van je dag
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Colored top accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${stat.gradient}`} />

            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}>
                <div className={`${stat.iconBg} p-2 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>

            <div className="mt-4">
              {statsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                  {stat.total !== stat.value && (
                    <span className="text-lg font-normal text-slate-400">/{stat.total}</span>
                  )}
                </p>
              )}
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>

            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Bekijk details
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Two columns: Upcoming installations + Today's tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Komende installaties - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Komende installaties
                </h2>
                <p className="text-sm text-slate-500">
                  {upcomingInstallations?.length ?? 0} gepland
                </p>
              </div>
            </div>
            <Link
              href="/installations"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Alles bekijken
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {installationsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
              </div>
            ) : !upcomingInstallations || upcomingInstallations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">Geen geplande installaties</p>
              </div>
            ) : (
              upcomingInstallations.map((installation) => (
                <Link
                  key={installation.id}
                  href="/installations"
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {new Date(installation.scheduled_at).toLocaleDateString('nl-NL', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {new Date(installation.scheduled_at).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {installation.customer?.name || 'Onbekende klant'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {installation.customer?.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(installation.scheduled_at).toLocaleTimeString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(
                        installation.status
                      )}`}
                    >
                      {getStatusLabel(installation.status)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Taken vandaag - 1/3 width */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100">
                <CheckSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Taken vandaag
                </h2>
                <p className="text-sm text-slate-500">
                  {pendingTodayTasks.length} openstaand
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {tasksLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
              </div>
            ) : pendingTodayTasks.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckSquare className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm text-slate-500">Geen taken voor vandaag</p>
              </div>
            ) : (
              pendingTodayTasks.slice(0, 4).map((task) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="block p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      task.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate group-hover:text-blue-700">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(task.scheduled_at).toLocaleTimeString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {task.assignee && ` - ${task.assignee.name}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}

            <Link
              href="/tasks"
              className="block text-center py-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Alle taken bekijken
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Snelle acties</h3>
            <p className="text-slate-400 text-sm mt-1">
              Begin direct met een nieuwe taak
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/installations"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              <Wrench className="h-4 w-4" />
              Nieuwe installatie
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              <Users className="h-4 w-4" />
              Klant toevoegen
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/30"
            >
              <Calendar className="h-4 w-4" />
              Bekijk kalender
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
