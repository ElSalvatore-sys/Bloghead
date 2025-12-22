/**
 * ReviewsList Component - Phase 7
 * Paginated list of reviews
 */

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getUserReviews, type Review } from '@/services/reviewService'
import { ReviewCard } from './ReviewCard'

interface ReviewsListProps {
  userId: string
  asReviewer?: boolean
  canRespond?: boolean
  onFlag?: (reviewId: string) => void
  itemsPerPage?: number
}

export function ReviewsList({
  userId,
  asReviewer = false,
  canRespond = false,
  onFlag,
  itemsPerPage = 5,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / itemsPerPage)

  useEffect(() => {
    loadReviews()
  }, [userId, asReviewer, page])

  const loadReviews = async () => {
    setIsLoading(true)
    setError(null)

    const offset = (page - 1) * itemsPerPage
    const { data, error: loadError } = await getUserReviews(userId, asReviewer, itemsPerPage, offset)

    setIsLoading(false)

    if (loadError) {
      setError(loadError.message)
      return
    }

    if (data) {
      setReviews(data.reviews)
      setTotal(data.total)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadReviews}
          className="mt-4 text-sm text-purple-400 hover:text-purple-300"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-400">
          {asReviewer ? 'Du hast noch keine Bewertungen abgegeben' : 'Noch keine Bewertungen erhalten'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canRespond={canRespond && !asReviewer}
            onFlag={onFlag}
          />
        ))}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-zinc-400">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewsList
