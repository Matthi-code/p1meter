'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Card } from '@/components/ui'
import { TrendingUp, PieChart as PieChartIcon, Users, Calendar } from 'lucide-react'
import type { InstallationWithRelations } from '@/types/supabase'
import type { TeamMember } from '@/types/supabase'

type DashboardAnalyticsProps = {
  installations: InstallationWithRelations[]
  energieBuddies: TeamMember[]
}

// Colors for charts
const COLORS = {
  completed: '#10b981', // emerald-500
  scheduled: '#3b82f6', // blue-500
  cancelled: '#ef4444', // red-500
  inProgress: '#f59e0b', // amber-500
  primary: '#2563eb', // blue-600
  secondary: '#64748b', // slate-500
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

export function DashboardAnalytics({ installations, energieBuddies }: DashboardAnalyticsProps) {
  // Calculate weekly trend data (last 6 weeks)
  const weeklyTrendData = useMemo(() => {
    const weeks: { week: string; voltooid: number; gepland: number }[] = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay() + 1)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const weekInstallations = installations.filter((inst) => {
        const instDate = new Date(inst.scheduled_at)
        return instDate >= weekStart && instDate < weekEnd
      })

      const completed = weekInstallations.filter((i) => i.status === 'completed').length
      const scheduled = weekInstallations.length

      // Format week label
      const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`

      weeks.push({
        week: weekLabel,
        voltooid: completed,
        gepland: scheduled,
      })
    }

    return weeks
  }, [installations])

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    const distribution = {
      completed: 0,
      scheduled: 0,
      inProgress: 0,
      cancelled: 0,
    }

    installations.forEach((inst) => {
      if (inst.status === 'completed') distribution.completed++
      else if (inst.status === 'cancelled') distribution.cancelled++
      else if (inst.status === 'in_progress' || inst.status === 'traveling') distribution.inProgress++
      else distribution.scheduled++
    })

    return [
      { name: 'Voltooid', value: distribution.completed, color: COLORS.completed },
      { name: 'Gepland', value: distribution.scheduled, color: COLORS.scheduled },
      { name: 'Bezig', value: distribution.inProgress, color: COLORS.inProgress },
      { name: 'Geannuleerd', value: distribution.cancelled, color: COLORS.cancelled },
    ].filter((item) => item.value > 0)
  }, [installations])

  // Calculate completion rate
  const completionRate = useMemo(() => {
    const total = installations.filter((i) => i.status !== 'cancelled').length
    const completed = installations.filter((i) => i.status === 'completed').length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [installations])

  // Calculate energy buddy performance
  const buddyPerformance = useMemo(() => {
    const performance: { name: string; installaties: number; voltooid: number }[] = []

    energieBuddies.forEach((buddy) => {
      const buddyInstallations = installations.filter((i) => i.assigned_to === buddy.id)
      const completed = buddyInstallations.filter((i) => i.status === 'completed').length

      if (buddyInstallations.length > 0) {
        performance.push({
          name: buddy.name.split(' ')[0], // First name only
          installaties: buddyInstallations.length,
          voltooid: completed,
        })
      }
    })

    // Sort by total installations
    return performance.sort((a, b) => b.installaties - a.installaties).slice(0, 5)
  }, [installations, energieBuddies])

  // Calculate monthly comparison
  const monthlyComparison = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Current month
    const currentMonthInstallations = installations.filter((inst) => {
      const d = new Date(inst.scheduled_at)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    // Previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const prevMonthInstallations = installations.filter((inst) => {
      const d = new Date(inst.scheduled_at)
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear
    })

    const currentCompleted = currentMonthInstallations.filter((i) => i.status === 'completed').length
    const prevCompleted = prevMonthInstallations.filter((i) => i.status === 'completed').length

    const change = prevCompleted > 0
      ? Math.round(((currentCompleted - prevCompleted) / prevCompleted) * 100)
      : currentCompleted > 0 ? 100 : 0

    return {
      current: currentMonthInstallations.length,
      currentCompleted,
      previous: prevMonthInstallations.length,
      previousCompleted: prevCompleted,
      change,
    }
  }, [installations])

  return (
    <div className="space-y-6">
      {/* Analytics header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500">Overzicht van prestaties en trends</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
            <p className="text-sm text-slate-500">Voltooiingsgraad</p>
          </div>
        </Card>

        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{monthlyComparison.currentCompleted}</p>
            <p className="text-sm text-slate-500">Voltooid deze maand</p>
            {monthlyComparison.change !== 0 && (
              <p className={`text-xs font-medium ${monthlyComparison.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {monthlyComparison.change > 0 ? '+' : ''}{monthlyComparison.change}% vs vorige maand
              </p>
            )}
          </div>
        </Card>

        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{installations.length}</p>
            <p className="text-sm text-slate-500">Totaal installaties</p>
          </div>
        </Card>

        <Card padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              {installations.filter((i) => i.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-500">Totaal voltooid</p>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly trend chart */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Wekelijkse trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="gepland" name="Gepland" fill={COLORS.scheduled} radius={[4, 4, 0, 0]} />
                <Bar dataKey="voltooid" name="Voltooid" fill={COLORS.completed} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.scheduled }} />
              <span className="text-sm text-slate-600">Gepland</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.completed }} />
              <span className="text-sm text-slate-600">Voltooid</span>
            </div>
          </div>
        </Card>

        {/* Status distribution pie chart */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Status verdeling</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Energy Buddy performance */}
      {buddyPerformance.length > 0 && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Energie Buddy prestaties</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buddyPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="installaties" name="Totaal" fill={COLORS.scheduled} radius={[0, 4, 4, 0]} />
                <Bar dataKey="voltooid" name="Voltooid" fill={COLORS.completed} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.scheduled }} />
              <span className="text-sm text-slate-600">Totaal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.completed }} />
              <span className="text-sm text-slate-600">Voltooid</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
