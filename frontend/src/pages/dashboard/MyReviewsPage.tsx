/**
 * MyReviewsPage - Phase 7
 * Dashboard page for Fans to view reviews they've written
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserReviews,
  getPendingReviewsForUser,
  type Review,
} from '@/services/reviewService'
import { ReviewsPageSkeleton } from '@/components/ui/DashboardSkeletons'

// Tab filter type
type ReviewTab = 'written' | 'pending'

export function MyReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [pendingReviews, setPendingReviews] = useState<
    { booking_id: string; artist_name: string; event_date: string; days_left: number }[]
  >([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<ReviewTab>('written')
  const [page, setPage] = useState(1)

  const itemsPerPage = 10

  // Load reviews
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Load written reviews and pending reviews in parallel
        const [reviewsResult, pendingResult] = await Promise.all([
          getUserReviews(user.id, true, itemsPerPage, (page - 1) * itemsPerPage),
          getPendingReviewsForUser(),
        ])

        if (reviewsResult.error) {
          setError(reviewsResult.error.message)
        } else if (reviewsResult.data) {
          setReviews(reviewsResult.data.reviews)
          setTotal(reviewsResult.data.total)
        }

        if (pendingResult.data) {
          setPendingReviews(pendingResult.data)
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

  const totalPages = Math.ceil(total / itemsPerPage)

  if (loading) {
    return <ReviewsPageSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Meine Bewertungen</h1>
        <p className="text-white/60 mt-2">Bewertungen, die du abgegeben hast</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Pending Reviews Alert */}
      {pendingReviews.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium">
                {pendingReviews.length} ausstehende{' '}
                {pendingReviews.length === 1 ? 'Bewertung' : 'Bewertungen'}
              </p>
              <p className="text-amber-400/70 text-sm mt-1">
                Du kannst nur innerhalb von 14 Tagen nach dem Event eine Bewertung abgeben.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setTab('written')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'written'
              ? 'bg-accent-purple text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Abgegebene Bewertungen ({total})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === 'pending'
              ? 'bg-accent-purple text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          Ausstehend ({pendingReviews.length})
        </button>
      </div>

      {/* Content based on tab */}
      {tab === 'pending' ? (
        // Pending Reviews Tab
        pendingReviews.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
            <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Keine ausstehenden Bewertungen</h2>
            <p className="text-white/60">
              Nach abgeschlossenen Buchungen hast du 14 Tage Zeit, eine Bewertung abzugeben.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((pending) => (
              <Link
                key={pending.booking_id}
                to={`/dashboard/bookings/${pending.booking_id}/review`}
                className="block bg-bg-card rounded-xl border border-white/10 p-6 hover:border-accent-purple/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{pending.artist_name}</p>
                    <p className="text-white/50 text-sm">
                      Event am{' '}
                      {new Date(pending.event_date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pending.days_left <= 3
                          ? 'bg-red-500/20 text-red-400'
                          : pending.days_left <= 7
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      Noch {pending.days_left} {pending.days_left === 1 ? 'Tag' : 'Tage'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-accent-purple transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        // Written Reviews Tab
        reviews.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
            <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Keine Bewertungen</h2>
            <p className="text-white/60 mb-6">
              Du hast noch keine Bewertungen abgegeben.
            </p>
            <Link
              to="/artists"
              className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
            >
              Künstler entdecken
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-bg-card rounded-xl border border-white/10 p-6"
              >
                <div className="flex gap-4">
                  {/* Reviewee Image */}
                  <Link
                    to={`/artists/${review.reviewee?.id}`}
                    className="flex-shrink-0"
                  >
                    {review.reviewee?.profile_image_url ? (
                      <img
                        src={review.reviewee.profile_image_url}
                        alt={review.reviewee.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold text-xl">
                        {review.reviewee?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </Link>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          to={`/artists/${review.reviewee?.id}`}
                          className="text-white font-semibold hover:text-accent-purple transition-colors"
                        >
                          {review.reviewee?.name || 'Unbekannt'}
                        </Link>
                        <p className="text-white/50 text-sm">
                          Event am{' '}
                          {new Date(review.event_date).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {/* Rating Stars */}
                        <div className="flex gap-1 justify-end">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
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

                    {review.title && (
                      <h4 className="text-white font-medium mb-1">{review.title}</h4>
                    )}
                    {review.content && (
                      <p className="text-white/70 text-sm">{review.content}</p>
                    )}

                    {/* Artist Response */}
                    {review.response && (
                      <div className="bg-white/5 rounded-lg p-3 mt-3 border-l-2 border-accent-purple">
                        <p className="text-accent-purple text-xs font-medium mb-1">Antwort</p>
                        <p className="text-white/60 text-sm">{review.response.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Pagination (only for written reviews) */}
      {tab === 'written' && totalPages > 1 && (
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

export default MyReviewsPage
