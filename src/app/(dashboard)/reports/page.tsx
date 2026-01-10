'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui'
import { useInstallations, useEvaluations, useEnergieBuddies, useCustomers } from '@/hooks/useData'
import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  Loader2,
  Download,
  FileText,
} from 'lucide-react'
import { exportReportToPDF } from '@/lib/export'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type TimeRange = 'week' | 'month' | 'quarter' | 'year'

export default function ReportsPage() {
  const { data: installations, isLoading: loadingInstallations } = useInstallations()
  const { data: evaluations, isLoading: loadingEvaluations } = useEvaluations()
  const { data: energieBuddies, isLoading: loadingBuddies } = useEnergieBuddies()
  const { data: customers, isLoading: loadingCustomers } = useCustomers()
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  const isLoading = loadingInstallations || loadingEvaluations || loadingBuddies || loadingCustomers

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const start = new Date()

    switch (timeRange) {
      case 'week':
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(now.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(now.getFullYear() - 1)
        break
    }

    return { start, end: now }
  }, [timeRange])

  // Filter installations by date range
  const filteredInstallations = useMemo(() => {
    if (!installations) return []
    return installations.filter((i) => {
      const date = new Date(i.scheduled_at)
      return date >= dateRange.start && date <= dateRange.end
    })
  }, [installations, dateRange])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = filteredInstallations.length
    const completed = filteredInstallations.filter((i) => i.status === 'completed').length
    const scheduled = filteredInstallations.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length
    const cancelled = filteredInstallations.filter((i) => i.status === 'cancelled').length

    // Average rating from evaluations
    const avgRating = evaluations?.length
      ? evaluations.reduce((sum, e) => sum + e.rating_overall, 0) / evaluations.length
      : 0

    // Completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      scheduled,
      cancelled,
      avgRating: avgRating.toFixed(1),
      completionRate,
      totalCustomers: customers?.length || 0,
      totalBuddies: energieBuddies?.length || 0,
    }
  }, [filteredInstallations, evaluations, customers, energieBuddies])

  // Installations per week data
  const weeklyData = useMemo(() => {
    if (!filteredInstallations.length) return []

    const weeks: Record<string, { week: string; completed: number; scheduled: number }> = {}

    filteredInstallations.forEach((inst) => {
      const date = new Date(inst.scheduled_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })

      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, completed: 0, scheduled: 0 }
      }

      if (inst.status === 'completed') {
        weeks[weekKey].completed++
      } else if (inst.status !== 'cancelled') {
        weeks[weekKey].scheduled++
      }
    })

    return Object.values(weeks).slice(-8)
  }, [filteredInstallations])

  // Performance per Energie Buddy
  const buddyPerformance = useMemo(() => {
    if (!filteredInstallations.length || !energieBuddies?.length) return []

    const performance: Record<string, { name: string; completed: number; total: number }> = {}

    energieBuddies.forEach((buddy) => {
      performance[buddy.id] = { name: buddy.name.split(' ')[0], completed: 0, total: 0 }
    })

    filteredInstallations.forEach((inst) => {
      if (inst.assigned_to && performance[inst.assigned_to]) {
        performance[inst.assigned_to].total++
        if (inst.status === 'completed') {
          performance[inst.assigned_to].completed++
        }
      }
    })

    return Object.values(performance)
      .filter((p) => p.total > 0)
      .sort((a, b) => b.completed - a.completed)
  }, [filteredInstallations, energieBuddies])

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const statuses = [
      { name: 'Voltooid', value: metrics.completed, color: '#10b981' },
      { name: 'Gepland', value: metrics.scheduled, color: '#3b82f6' },
      { name: 'Geannuleerd', value: metrics.cancelled, color: '#ef4444' },
    ].filter((s) => s.value > 0)

    return statuses
  }, [metrics])

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    if (!evaluations?.length) return []

    const ratings: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    evaluations.forEach((e) => {
      const rounded = Math.round(e.rating_overall)
      if (ratings[rounded] !== undefined) {
        ratings[rounded]++
      }
    })

    return [
      { rating: '1 ster', count: ratings[1], fill: '#ef4444' },
      { rating: '2 sterren', count: ratings[2], fill: '#f97316' },
      { rating: '3 sterren', count: ratings[3], fill: '#eab308' },
      { rating: '4 sterren', count: ratings[4], fill: '#84cc16' },
      { rating: '5 sterren', count: ratings[5], fill: '#10b981' },
    ]
  }, [evaluations])

  // Export handler
  const handleExportPDF = () => {
    const periodLabel = {
      week: 'Afgelopen week',
      month: 'Afgelopen maand',
      quarter: 'Afgelopen kwartaal',
      year: 'Afgelopen jaar',
    }[timeRange]

    const installationsForExport = filteredInstallations.map((inst) => ({
      customer_name: inst.customer?.name || 'Onbekend',
      scheduled_at: inst.scheduled_at,
      status: inst.status === 'completed' ? 'Voltooid' :
              inst.status === 'scheduled' ? 'Gepland' :
              inst.status === 'confirmed' ? 'Bevestigd' :
              inst.status === 'cancelled' ? 'Geannuleerd' : inst.status,
      assignee_name: inst.assignee?.name || 'Niet toegewezen',
    }))

    exportReportToPDF({
      title: 'Prestatie Rapportage',
      period: periodLabel,
      metrics: [
        { label: 'Totaal installaties', value: metrics.total },
        { label: 'Voltooid', value: metrics.completed },
        { label: 'Voltooiingsgraad', value: `${metrics.completionRate}%` },
        { label: 'Gemiddelde rating', value: metrics.avgRating },
        { label: 'Aantal klanten', value: metrics.totalCustomers },
        { label: 'Energie Buddies', value: metrics.totalBuddies },
      ],
      installations: installationsForExport,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rapportages</h1>
          <p className="text-slate-500">Overzicht van prestaties en statistieken</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range === 'week' && 'Week'}
              {range === 'month' && 'Maand'}
              {range === 'quarter' && 'Kwartaal'}
              {range === 'year' && 'Jaar'}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Totaal installaties"
          value={metrics.total}
          icon={<Zap className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Voltooid"
          value={metrics.completed}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          subtitle={`${metrics.completionRate}% voltooiingsgraad`}
        />
        <MetricCard
          title="Gemiddelde rating"
          value={metrics.avgRating}
          icon={<Star className="h-5 w-5" />}
          color="amber"
          subtitle={`${evaluations?.length || 0} beoordelingen`}
        />
        <MetricCard
          title="Klanten"
          value={metrics.totalCustomers}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Installations Chart */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            Installaties per week
          </h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="completed" name="Voltooid" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scheduled" name="Gepland" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Geen data beschikbaar
            </div>
          )}
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            Status verdeling
          </h3>
          {statusDistribution.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-slate-600">{status.name}</span>
                    <span className="text-sm font-medium text-slate-900 ml-auto">
                      {status.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400">
              Geen data beschikbaar
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buddy Performance */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            Prestaties per Energie Buddy
          </h3>
          {buddyPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={buddyPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="completed" name="Voltooid" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="total" name="Totaal" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Geen data beschikbaar
            </div>
          )}
        </Card>

        {/* Rating Distribution */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-slate-500" />
            Beoordelingen verdeling
          </h3>
          {ratingDistribution.some((r) => r.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="rating" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" name="Aantal" radius={[4, 4, 0, 0]}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Nog geen beoordelingen
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  subtitle?: string
  trend?: { value: number; direction: 'up' | 'down' }
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trend.direction === 'up' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </Card>
  )
}
