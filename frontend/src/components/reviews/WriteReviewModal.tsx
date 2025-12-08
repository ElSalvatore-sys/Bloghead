import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { ReviewForm, type ReviewFormData } from './ReviewForm'
import { createReview } from '../../services/reviewService'
import { useAuth } from '../../contexts/AuthContext'

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

  const handleSubmit = async (data: ReviewFormData) => {
    if (!user) {
      setError('Du musst eingeloggt sein, um eine Bewertung abzugeben.')
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
        overall_rating: data.overall_rating,
        review_title: data.review_title || undefined,
        review_text: data.review_text || undefined,
        quick_feedback: data.quick_feedback.length > 0 ? data.quick_feedback : undefined,
        zuverlaessigkeit: data.zuverlaessigkeit,
        kommunikation: data.kommunikation,
        preis_leistung: data.preis_leistung,
        stimmung: data.stimmung,
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
    onClose()
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
          <>
            {/* Entity Info Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              {entityImage ? (
                <img
                  src={entityImage}
                  alt={entityName}
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

            {/* Review Form */}
            <ReviewForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isSubmitting={isSubmitting}
              showCategoryRatings={entityType === 'artist'}
            />
          </>
        )}
      </div>
    </Modal>
  )
}
