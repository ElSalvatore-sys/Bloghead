import { useState, useEffect } from 'react'
import { ReviewCard, ReviewCardSkeleton } from './ReviewCard'
import { ReviewStats, ReviewStatsSkeleton } from './ReviewStats'
import { WriteReviewModal } from './WriteReviewModal'
import { Button } from '../ui/Button'
import {
  getArtistReviews,
  getArtistReviewStats,
  getProviderReviews,
  getProviderReviewStats,
  hasReviewedEntity,
} from '../../services/reviewService'
import type { Review, ReviewStats as ReviewStatsType } from '../../services/reviewService'
import { useAuth } from '../../contexts/AuthContext'

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStatsType | null>(null)
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
            <ReviewStats
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
                  <ReviewCard key={review.id} review={review} />
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
