/**
 * WriteReviewModal Component - Legacy
 * Modal for writing entity-based reviews (artist/veranstalter profiles)
 */

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { createReview } from '../../services/reviewService'
import { useAuth } from '../../contexts/AuthContext'
import { Star } from 'lucide-react'

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'artist' | 'veranstalter'
  entityId: string
  entityName: string
  entityImage?: string
  bookingId?: string
  onSuccess?: () => void
}

export function WriteReviewModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  entityImage,
  bookingId,
  onSuccess,
}: WriteReviewModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [overallRating, setOverallRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryRatings, setCategoryRatings] = useState({
    zuverlaessigkeit: 0,
    kommunikation: 0,
    preis_leistung: 0,
    stimmung: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Du musst eingeloggt sein, um eine Bewertung abzugeben.')
      return
    }

    if (overallRating === 0) {
      setError('Bitte gib eine Gesamtbewertung ab.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: submitError } = await createReview({
        rater_id: user.id,
        rated_entity_type: entityType,
        rated_entity_id: entityId,
        booking_id: bookingId,
        overall_rating: overallRating,
        review_title: title || undefined,
        review_text: content || undefined,
        quick_feedback: [],
        zuverlaessigkeit: categoryRatings.zuverlaessigkeit || undefined,
        kommunikation: categoryRatings.kommunikation || undefined,
        preis_leistung: categoryRatings.preis_leistung || undefined,
        stimmung: categoryRatings.stimmung || undefined,
      })

      if (submitError) {
        console.error('Review submit error:', submitError)
        setError('Bewertung konnte nicht gespeichert werden. Bitte versuche es erneut.')
        return
      }

      setSubmitted(true)
      onSuccess?.()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    setError(null)
    setOverallRating(0)
    setTitle('')
    setContent('')
    setCategoryRatings({
      zuverlaessigkeit: 0,
      kommunikation: 0,
      preis_leistung: 0,
      stimmung: 0,
    })
    onClose()
  }

  const renderStars = (
    rating: number,
    onRate: (rating: number) => void,
    hover?: number,
    onHover?: (rating: number) => void,
    size: 'sm' | 'lg' = 'lg'
  ) => {
    const displayRating = hover || rating
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            className={`${sizeClass} transition-all duration-150 ${
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

  const categoryLabels: Record<string, string> = {
    zuverlaessigkeit: 'Zuverlässigkeit',
    kommunikation: 'Kommunikation',
    preis_leistung: 'Preis-Leistung',
    stimmung: 'Stimmung',
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={submitted ? '' : 'Bewertung schreiben'}>
      <div className="px-6 pb-6">
        {/* Success State */}
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Vielen Dank!</h3>
            <p className="text-white/60 mb-6">
              Deine Bewertung für {entityName} wurde erfolgreich gespeichert.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-accent-purple text-white rounded-full hover:bg-accent-purple/80 transition-colors"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Entity Info Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              {entityImage ? (
                <img
                  src={entityImage}
                  alt={entityName}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent-purple/30 flex items-center justify-center text-white text-xl font-bold">
                  {entityName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold text-lg">{entityName}</h3>
                <p className="text-white/50 text-sm">
                  {entityType === 'artist' ? 'Künstler' : 'Dienstleister'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Overall Rating */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-white/80">
                Gesamtbewertung *
              </label>
              <div className="flex items-center gap-4">
                {renderStars(overallRating, setOverallRating, hoverRating, setHoverRating)}
                <span className="text-sm text-white/50">
                  {overallRating > 0 ? `${overallRating} von 5 Sternen` : 'Klicke zum Bewerten'}
                </span>
              </div>
            </div>

            {/* Category Ratings (for artists) */}
            {entityType === 'artist' && (
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-white/80">
                  Detailbewertungen (optional)
                </label>
                <div className="grid gap-3">
                  {Object.entries(categoryRatings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
                    >
                      <span className="text-sm text-white/70">{categoryLabels[key]}</span>
                      {renderStars(
                        value,
                        (rating) => setCategoryRatings((prev) => ({ ...prev, [key]: rating })),
                        undefined,
                        undefined,
                        'sm'
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2 mb-4">
              <label htmlFor="review-title" className="block text-sm font-medium text-white/80">
                Titel (optional)
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kurze Zusammenfassung"
                maxLength={200}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple outline-none"
              />
            </div>

            {/* Content */}
            <div className="space-y-2 mb-6">
              <label htmlFor="review-content" className="block text-sm font-medium text-white/80">
                Deine Bewertung (optional)
              </label>
              <textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Beschreibe deine Erfahrung..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-white/60 hover:text-white transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting || overallRating === 0}
                className="px-6 py-2 bg-accent-purple text-white rounded-full hover:bg-accent-purple/80 disabled:bg-white/10 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Wird gespeichert...' : 'Bewertung abgeben'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
