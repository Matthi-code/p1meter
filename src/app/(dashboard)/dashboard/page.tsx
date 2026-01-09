'use client'

import { useAuth } from '@/lib/auth'
import { EnergieBuddyDashboard } from '@/components/dashboard/EnergieBuddyDashboard'
import { PlannerDashboard } from '@/components/dashboard/PlannerDashboard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  // Show role-specific dashboard
  if (user?.role === 'energiebuddy') {
    return <EnergieBuddyDashboard />
  }

  // Planner and Admin see the planner dashboard
  return <PlannerDashboard />
}
