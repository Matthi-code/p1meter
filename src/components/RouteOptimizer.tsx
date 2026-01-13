'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'
import {
  Route,
  Loader2,
  Clock,
  Car,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import type { InstallationWithRelations } from '@/types/supabase'

type OptimizedRoute = {
  order: string[]
  totalDurationMinutes: number
  totalDistanceKm: number
  legs: {
    from: string
    to: string
    durationMinutes: number
    distanceKm: number
  }[]
}

type RouteOptimizerProps = {
  installations: InstallationWithRelations[]
  onOptimized?: (orderedInstallations: InstallationWithRelations[]) => void
}

export function RouteOptimizer({ installations, onOptimized }: RouteOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isApplied, setIsApplied] = useState(false)

  // Filter installations with coordinates
  const installationsWithCoords = installations.filter(
    (i) => i.customer?.latitude && i.customer?.longitude
  )

  async function handleOptimize() {
    if (installationsWithCoords.length < 2) return

    setIsOptimizing(true)
    setError(null)
    setIsApplied(false)

    try {
      const locations = installationsWithCoords.map((i) => ({
        id: i.id,
        lat: i.customer!.latitude!,
        lng: i.customer!.longitude!,
      }))

      const response = await fetch('/api/route/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
      })

      if (!response.ok) {
        throw new Error('Failed to optimize route')
      }

      const result: OptimizedRoute = await response.json()
      setOptimizedRoute(result)

      // Create ordered installations array
      const orderedInstallations = result.order
        .map((id) => installations.find((i) => i.id === id))
        .filter((i): i is InstallationWithRelations => i !== undefined)

      onOptimized?.(orderedInstallations)
    } catch (err) {
      setError('Kon route niet optimaliseren')
      console.error('Optimization error:', err)
    } finally {
      setIsOptimizing(false)
    }
  }

  function handleApply() {
    setIsApplied(true)
  }

  // Not enough installations to optimize
  if (installationsWithCoords.length < 2) {
    return null
  }

  // Get installation name by ID
  const getInstallationName = (id: string) => {
    const inst = installations.find((i) => i.id === id)
    return inst?.customer?.name || 'Onbekend'
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Route className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Route optimalisatie</h3>
            <p className="text-sm text-slate-500">
              {installationsWithCoords.length} locaties
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Berekenen...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Optimaliseer
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {optimizedRoute && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {optimizedRoute.totalDurationMinutes} min reistijd
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
              <Car className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {optimizedRoute.totalDistanceKm} km
              </span>
            </div>
          </div>

          {/* Route steps */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Geoptimaliseerde volgorde:</p>
            <div className="space-y-1">
              {optimizedRoute.order.map((id, index) => (
                <div key={id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-700">
                    {getInstallationName(id)}
                  </span>
                  {index < optimizedRoute.legs.length && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                      <ArrowRight className="h-3 w-3" />
                      {optimizedRoute.legs[index].durationMinutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Apply button */}
          {!isApplied ? (
            <button
              onClick={handleApply}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Deze volgorde toepassen
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-medium">
              <CheckCircle className="h-4 w-4" />
              Volgorde toegepast
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
