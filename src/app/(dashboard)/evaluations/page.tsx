'use client'

import { useMemo, useState } from 'react'
import { useEvaluations } from '@/hooks/useData'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui'
import {
  Star,
  Loader2,
  MessageSquare,
  User,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export default function EvaluationsPage() {
  const { data: evaluations, isLoading } = useEvaluations()
  const [filter, setFilter] = useState<'all' | 'with-feedback'>('all')

  // Stats
  const stats = useMemo(() => {
    if (!evaluations || evaluations.length === 0) {
      return { count: 0, average: 0, withFeedback: 0 }
    }

    const total = evaluations.reduce((sum, e) => sum + e.rating_overall, 0)
    const withFeedback = evaluations.filter((e) => e.feedback && e.feedback.trim() !== '').length

    return {
      count: evaluations.length,
      average: total / evaluations.length,
      withFeedback,
    }
  }, [evaluations])

  // Filtered evaluations
  const filteredEvaluations = useMemo(() => {
    if (!evaluations) return []
    if (filter === 'with-feedback') {
      return evaluations.filter((e) => e.feedback && e.feedback.trim() !== '')
    }
    return evaluations
  }, [evaluations, filter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evaluaties</h1>
        <p className="text-slate-500 mt-1">
          Bekijk klantbeoordelingen na installaties
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
              <p className="text-sm text-slate-500">Totaal</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.average.toFixed(1)}
              </p>
              <p className="text-sm text-slate-500">Gemiddelde score</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.withFeedback}</p>
              <p className="text-sm text-slate-500">Met feedback</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Alle ({evaluations?.length || 0})
        </button>
        <button
          onClick={() => setFilter('with-feedback')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'with-feedback'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Met feedback ({stats.withFeedback})
        </button>
      </div>

      {/* Evaluations List */}
      {filteredEvaluations.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            Nog geen evaluaties
          </h3>
          <p className="text-slate-500">
            Evaluaties verschijnen hier zodra klanten hun installatie-ervaring
            hebben beoordeeld.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.map((evaluation) => (
            <Card key={evaluation.id} padding="md">
              <div className="flex items-start gap-4">
                {/* Rating */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-yellow-700">
                    {evaluation.rating_overall}
                  </span>
                  <span className="text-xs text-yellow-600">/5</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={evaluation.rating_overall} />
                    <span className="text-sm text-slate-500">
                      {formatDate(evaluation.created_at)}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {evaluation.customer?.name}
                    </span>
                    {evaluation.installation?.assignee && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Installatie door {evaluation.installation.assignee.name}
                      </span>
                    )}
                  </div>

                  {/* Feedback */}
                  {evaluation.feedback && (
                    <div className="bg-slate-50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-slate-700 italic">
                        &ldquo;{evaluation.feedback}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Confirmation status */}
                  {evaluation.confirmed_at && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Installatie bevestigd door klant
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
