'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import {
  Star,
  Eye,
  EyeOff,
  Loader2,
  Quote,
  ExternalLink,
  CheckCircle,
  XCircle,
  MessageSquare,
} from 'lucide-react'

type Review = {
  id: string
  rating_overall: number
  feedback: string
  recommend: boolean
  created_at: string
  customer_name: string
  customer_city: string
  featured: boolean
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'featured' | 'hidden'>('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    try {
      const response = await fetch('/api/admin/reviews')
      const data = await response.json()
      if (data.reviews) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleFeatured(reviewId: string, featured: boolean) {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, featured }),
      })

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, featured } : r))
        )
      }
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'featured') return r.featured
    if (filter === 'hidden') return !r.featured
    return true
  })

  const featuredCount = reviews.filter((r) => r.featured).length
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating_overall, 0) / reviews.length).toFixed(1)
      : '0'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews Beheer</h1>
          <p className="text-slate-500">
            Beheer welke reviews zichtbaar zijn op de website
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          className="btn btn-secondary flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Bekijk website
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{averageRating}</p>
              <p className="text-sm text-slate-500">Gemiddelde score</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{reviews.length}</p>
              <p className="text-sm text-slate-500">Totaal reviews</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{featuredCount}</p>
              <p className="text-sm text-slate-500">Zichtbaar op website</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('featured')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'featured'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Zichtbaar ({featuredCount})
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'hidden'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Verborgen ({reviews.length - featuredCount})
        </button>
      </div>

      {/* Reviews list */}
      <Card padding="none">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Quote className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Geen reviews gevonden</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 ${!review.featured ? 'bg-slate-50 opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Rating */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating_overall
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {review.rating_overall}/5 sterren
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {review.customer_name}
                      </span>
                      {review.customer_city && (
                        <span className="text-sm text-slate-500">
                          uit {review.customer_city}
                        </span>
                      )}
                      {review.recommend && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                          <CheckCircle className="h-3 w-3" />
                          Beveelt aan
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-2">{review.feedback}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleFeatured(review.id, !review.featured)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        review.featured
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {review.featured ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Zichtbaar
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Verborgen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Help text */}
      <p className="mt-4 text-sm text-slate-500 text-center">
        Reviews komen uit klantevaluaties na een installatie. Markeer reviews als
        &ldquo;Zichtbaar&rdquo; om ze op de website te tonen.
      </p>
    </div>
  )
}
