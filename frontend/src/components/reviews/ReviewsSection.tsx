import { useState, useEffect } from 'react'
import { WriteReviewModal } from './WriteReviewModal'
import { Button } from '../ui/Button'
import {
  getArtistReviews,
  getArtistReviewStats,
  getProviderReviews,
  getProviderReviewStats,
  hasReviewedEntity,
} from '../../services/reviewService'
import type { LegacyReview, LegacyReviewStats } from '../../services/reviewService'
import { useAuth } from '../../contexts/AuthContext'
import { Star } from 'lucide-react'

// Legacy Review Card for entity-based reviews (artist/veranstalter profiles)
function LegacyReviewCard({ review }: { review: LegacyReview }) {
  // Build display name from rater data
  const raterName = review.rater
    ? review.rater.membername || `${review.rater.vorname || ''} ${review.rater.nachname || ''}`.trim() || 'Anonym'
    : 'Anonym'
  const raterImage = review.rater?.profile_image_url

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {raterImage ? (
            <img
              src={raterImage}
              alt={raterName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
              {raterName.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{raterName}</span>
            <span className="text-white/50 text-sm">•</span>
            <span className="text-white/50 text-sm">
              {new Date(review.created_at).toLocaleDateString('de-DE')}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= review.overall_rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
              />
            ))}
          </div>
          {review.review_title && (
            <p className="text-white font-medium mt-2">{review.review_title}</p>
          )}
          {review.review_text && (
            <p className="text-white/70 text-sm mt-1">{review.review_text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Skeleton components
function ReviewCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-32" />
          <div className="h-4 bg-white/10 rounded w-24" />
          <div className="h-3 bg-white/10 rounded w-full mt-3" />
          <div className="h-3 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}

function LegacyReviewStatsDisplay({ stats, showCategoryAverages }: { stats: LegacyReviewStats; showCategoryAverages: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-white">{stats.avgRating.toFixed(1)}</div>
          <div className="flex justify-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(stats.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
              />
            ))}
          </div>
          <p className="text-sm text-white/50 mt-1">
            {stats.totalReviews} {stats.totalReviews === 1 ? 'Bewertung' : 'Bewertungen'}
          </p>
        </div>
        {showCategoryAverages && stats.categoryAverages && (
          <div className="flex-1 grid grid-cols-2 gap-3">
            {Object.entries(stats.categoryAverages).map(([cat, avg]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="text-white/60 capitalize">{cat.replace(/_/g, ' ')}</span>
                <span className="text-white font-medium">{(avg as number).toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewStatsSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="text-center space-y-2">
          <div className="h-10 w-16 bg-white/10 rounded mx-auto" />
          <div className="h-4 w-20 bg-white/10 rounded mx-auto" />
          <div className="h-3 w-24 bg-white/10 rounded mx-auto" />
        </div>
      </div>
    </div>
  )
}

interface ReviewsSectionProps {
  entityType: 'artist' | 'veranstalter'
  entityId: string
  entityName: string
  entityImage?: string
  initialLimit?: number
}

export function ReviewsSection({
  entityType,
  entityId,
  entityName,
  entityImage,
  initialLimit = 5,
}: ReviewsSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<LegacyReview[]>([])
  const [stats, setStats] = useState<LegacyReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      try {
        // Fetch stats
        const statsResult =
          entityType === 'artist'
            ? await getArtistReviewStats(entityId)
            : await getProviderReviewStats(entityId)
        setStats(statsResult)

        // Fetch reviews
        const reviewsResult =
          entityType === 'artist'
            ? await getArtistReviews(entityId, initialLimit, 0)
            : await getProviderReviews(entityId, initialLimit, 0)

        if (reviewsResult.data) {
          setReviews(reviewsResult.data)
          setHasMore(reviewsResult.data.length === initialLimit)
        }

        // Check if user has already reviewed
        if (user) {
          const reviewed = await hasReviewedEntity(user.id, entityId, entityType)
          setHasReviewed(reviewed)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [entityType, entityId, initialLimit, user])

  // Load more reviews
  const handleLoadMore = async () => {
    setLoadingMore(true)

    try {
      const newOffset = offset + initialLimit
      const reviewsResult =
        entityType === 'artist'
          ? await getArtistReviews(entityId, initialLimit, newOffset)
          : await getProviderReviews(entityId, initialLimit, newOffset)

      if (reviewsResult.data) {
        setReviews((prev) => [...prev, ...reviewsResult.data!])
        setOffset(newOffset)
        setHasMore(reviewsResult.data.length === initialLimit)
      }
    } catch (error) {
      console.error('Error loading more reviews:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle successful review submission
  const handleReviewSuccess = async () => {
    // Refresh stats and reviews
    const statsResult =
      entityType === 'artist'
        ? await getArtistReviewStats(entityId)
        : await getProviderReviewStats(entityId)
    setStats(statsResult)

    const reviewsResult =
      entityType === 'artist'
        ? await getArtistReviews(entityId, initialLimit, 0)
        : await getProviderReviews(entityId, initialLimit, 0)

    if (reviewsResult.data) {
      setReviews(reviewsResult.data)
      setOffset(0)
      setHasMore(reviewsResult.data.length === initialLimit)
    }

    setHasReviewed(true)
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">Bewertungen</h2>

        {/* Write Review Button */}
        {user && !hasReviewed && !loading && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowWriteModal(true)}
            className="rounded-full"
          >
            Bewertung schreiben
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <ReviewStatsSkeleton />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && stats.totalReviews > 0 && (
            <LegacyReviewStatsDisplay
              stats={stats}
              showCategoryAverages={entityType === 'artist' && !!stats.categoryAverages}
            />
          )}

          {/* No Reviews State */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Noch keine Bewertungen</h3>
              <p className="text-white/50 text-sm mb-4">
                Sei der Erste, der eine Bewertung abgibt!
              </p>
              {user && !hasReviewed && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowWriteModal(true)}
                  className="rounded-full"
                >
                  Erste Bewertung schreiben
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <LegacyReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-full"
                  >
                    {loadingMore ? 'Laden...' : 'Mehr Bewertungen anzeigen'}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
        entityImage={entityImage}
        onSuccess={handleReviewSuccess}
      />
    </section>
  )
}
