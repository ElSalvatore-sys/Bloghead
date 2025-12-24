/**
 * ReviewsPage - Phase 7
 * Dashboard page for Artists/Service Providers to view reviews they've received
 */

import { useState, useEffect } from 'react'
import { Star, MessageCircle, ThumbsUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserReviews,
  getUserRatingStats,
  respondToReview,
  type Review,
  type UserRatingStats,
} from '@/services/reviewService'
import { ReviewStats } from '@/components/reviews/ReviewStats'
import { ReviewBadge } from '@/components/reviews/ReviewBadge'
import { ReviewsPageSkeleton } from '@/components/ui/DashboardSkeletons'

// Tab filter type
type ReviewFilter = 'all' | 'pending_response' | 'responded'

export function ReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<UserRatingStats | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [page, setPage] = useState(1)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  const itemsPerPage = 10

  // Load reviews and stats
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Load stats and reviews in parallel
        const [statsResult, reviewsResult] = await Promise.all([
          getUserRatingStats(user.id),
          getUserReviews(user.id, false, itemsPerPage, (page - 1) * itemsPerPage),
        ])

        if (statsResult.error) {
          console.error('Stats error:', statsResult.error)
        } else {
          setStats(statsResult.data)
        }

        if (reviewsResult.error) {
          setError(reviewsResult.error.message)
        } else if (reviewsResult.data) {
          setReviews(reviewsResult.data.reviews)
          setTotal(reviewsResult.data.total)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Ein Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, page])

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (filter === 'pending_response') {
      return !review.response
    }
    if (filter === 'responded') {
      return !!review.response
    }
    return true
  })

  // Handle response submission
  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) return

    setIsSubmittingResponse(true)

    const { data, error: submitError } = await respondToReview(reviewId, responseText.trim())

    setIsSubmittingResponse(false)

    if (submitError || !data?.success) {
      alert(data?.error || 'Fehler beim Senden der Antwort')
      return
    }

    // Update local state
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, response: { content: responseText.trim(), created_at: new Date().toISOString() } }
          : r
      )
    )
    setRespondingTo(null)
    setResponseText('')
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  if (loading) {
    return <ReviewsPageSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Bewertungen</h1>
        <p className="text-white/60 mt-2">Bewertungen, die du von Kunden erhalten hast</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Stats Section */}
      {stats && <ReviewStats stats={stats} />}

      {/* Badges Section */}
      {stats?.badges && stats.badges.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Deine Auszeichnungen</h3>
          <div className="flex flex-wrap gap-3">
            {stats.badges.map((badge) => (
              <ReviewBadge key={badge} badge={badge} size="lg" />
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-accent-purple text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Alle ({total})
        </button>
        <button
          onClick={() => setFilter('pending_response')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending_response'
              ? 'bg-accent-purple text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-1" />
          Antwort ausstehend
        </button>
        <button
          onClick={() => setFilter('responded')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'responded'
              ? 'bg-accent-purple text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Beantwortet
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
          <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Keine Bewertungen</h2>
          <p className="text-white/60">
            {filter === 'all'
              ? 'Du hast noch keine Bewertungen erhalten.'
              : filter === 'pending_response'
              ? 'Alle Bewertungen wurden beantwortet.'
              : 'Du hast noch keine Bewertungen beantwortet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-bg-card rounded-xl border border-white/10 p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.reviewer?.profile_image_url ? (
                    <img
                      src={review.reviewer.profile_image_url}
                      alt={review.reviewer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold">
                      {review.reviewer?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{review.reviewer?.name || 'Anonym'}</p>
                    <p className="text-white/50 text-sm">
                      {new Date(review.event_date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {/* Rating Stars */}
                  <div className="flex gap-1 justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.overall_rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-1">
                    {new Date(review.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="text-white font-medium mb-2">{review.title}</h4>
              )}
              {review.content && (
                <p className="text-white/70 mb-4">{review.content}</p>
              )}

              {/* Category Ratings */}
              {review.categories && review.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.categories.map((cat) => (
                    <span
                      key={cat.category}
                      className="px-2 py-1 bg-white/5 rounded text-xs text-white/60"
                    >
                      {cat.category.replace(/_/g, ' ')}: {cat.rating}/5
                    </span>
                  ))}
                </div>
              )}

              {/* Helpful Count */}
              {review.helpful_count > 0 && (
                <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpful_count} fanden das hilfreich</span>
                </div>
              )}

              {/* Response Section */}
              {review.response ? (
                <div className="bg-white/5 rounded-lg p-4 border-l-2 border-accent-purple">
                  <p className="text-accent-purple text-xs font-medium mb-1">Deine Antwort</p>
                  <p className="text-white/70 text-sm">{review.response.content}</p>
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(review.response.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ) : respondingTo === review.id ? (
                <div className="bg-white/5 rounded-lg p-4">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Schreibe eine Antwort..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setRespondingTo(null)
                        setResponseText('')
                      }}
                      className="px-4 py-2 text-white/60 hover:text-white text-sm"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleSubmitResponse(review.id)}
                      disabled={isSubmittingResponse || !responseText.trim()}
                      className="px-4 py-2 bg-accent-purple text-white text-sm rounded-lg hover:bg-accent-purple/80 disabled:bg-white/10 disabled:cursor-not-allowed"
                    >
                      {isSubmittingResponse ? 'Senden...' : 'Antworten'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRespondingTo(review.id)}
                  className="text-accent-purple text-sm hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Antworten
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
          >
            Zurück
          </button>
          <span className="text-white/60 text-sm">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewsPage
