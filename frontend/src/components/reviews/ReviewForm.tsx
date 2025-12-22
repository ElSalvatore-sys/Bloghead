/**
 * ReviewForm Component - Phase 7
 * Form for submitting reviews with category ratings
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, X, AlertCircle } from 'lucide-react'
import {
  submitReview,
  getCategoriesForReviewerType,
  type ReviewerType,
  type CategoryRating,
} from '@/services/reviewService'

interface ReviewFormProps {
  bookingId: string
  reviewerType: ReviewerType
  revieweeName: string
  eventDate: string
  onSuccess?: (reviewId: string) => void
  onCancel?: () => void
}

export function ReviewForm({
  bookingId,
  reviewerType,
  revieweeName,
  eventDate,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = getCategoriesForReviewerType(reviewerType)

  const handleCategoryRating = (category: string, rating: number) => {
    setCategoryRatings((prev) => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (overallRating === 0) {
      setError('Bitte gib eine Gesamtbewertung ab')
      return
    }

    setIsSubmitting(true)

    // Convert category ratings to array format
    const categoryArray: CategoryRating[] = Object.entries(categoryRatings)
      .filter(([_, rating]) => rating > 0)
      .map(([category, rating]) => ({
        category: category as CategoryRating['category'],
        rating,
      }))

    const { data, error: submitError } = await submitReview(
      bookingId,
      overallRating,
      title || undefined,
      content || undefined,
      categoryArray
    )

    setIsSubmitting(false)

    if (submitError || !data?.success) {
      setError(data?.error || submitError?.message || 'Fehler beim Absenden der Bewertung')
      return
    }

    onSuccess?.(data.review_id!)
  }

  const renderStars = (
    rating: number,
    onRate: (rating: number) => void,
    onHover?: (rating: number) => void,
    hoverValue?: number,
    size: 'sm' | 'lg' = 'lg'
  ) => {
    const displayRating = hoverValue || rating
    const sizeClasses = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            className={`${sizeClasses} transition-all duration-150 ${
              star <= displayRating
                ? 'text-yellow-400 scale-110'
                : 'text-zinc-600 hover:text-yellow-400/50'
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {reviewerType === 'client' ? 'Künstler bewerten' : 'Kunde bewerten'}
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            {revieweeName} • Event am {new Date(eventDate).toLocaleDateString('de-DE')}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Overall Rating */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          Gesamtbewertung *
        </label>
        <div className="flex items-center gap-4">
          {renderStars(overallRating, setOverallRating, setHoverRating, hoverRating)}
          <span className="text-sm text-zinc-400">
            {overallRating > 0 ? `${overallRating} von 5 Sternen` : 'Klicke zum Bewerten'}
          </span>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-300">
          Detailbewertungen (optional)
        </label>
        <div className="grid gap-3">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{cat.label}</p>
                <p className="text-xs text-zinc-500">{cat.description}</p>
              </div>
              {renderStars(
                categoryRatings[cat.category] || 0,
                (rating) => handleCategoryRating(cat.category, rating),
                undefined,
                undefined,
                'sm'
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="review-title" className="block text-sm font-medium text-zinc-300">
          Titel (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kurze Zusammenfassung deiner Erfahrung"
          maxLength={200}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label htmlFor="review-content" className="block text-sm font-medium text-zinc-300">
          Deine Bewertung (optional)
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Beschreibe deine Erfahrung..."
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
        />
        <p className="text-xs text-zinc-500 text-right">{content.length} / 2000 Zeichen</p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-4 py-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || overallRating === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Bewertung absenden
        </button>
      </div>
    </motion.form>
  )
}

export default ReviewForm
