import { useState } from 'react'
import { StarRating } from '../ui/StarRating'
import { Button } from '../ui/Button'

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  showCategoryRatings?: boolean
}

export interface ReviewFormData {
  overall_rating: number
  review_title: string
  review_text: string
  quick_feedback: string[]
  zuverlaessigkeit?: number
  kommunikation?: number
  preis_leistung?: number
  stimmung?: number
}

// Quick feedback options
const QUICK_FEEDBACK_OPTIONS = [
  { id: 'professional', label: 'Professionell' },
  { id: 'on_time', label: 'Pünktlich' },
  { id: 'great_music', label: 'Tolle Musik' },
  { id: 'friendly', label: 'Freundlich' },
  { id: 'good_communication', label: 'Gute Kommunikation' },
  { id: 'recommended', label: 'Empfehlenswert' },
  { id: 'fair_price', label: 'Fairer Preis' },
  { id: 'creative', label: 'Kreativ' },
  { id: 'flexible', label: 'Flexibel' },
  { id: 'high_quality', label: 'Hohe Qualität' },
]

const MAX_TITLE_LENGTH = 100
const MAX_TEXT_LENGTH = 1000

export function ReviewForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  showCategoryRatings = true,
}: ReviewFormProps) {
  // Form state
  const [overallRating, setOverallRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [quickFeedback, setQuickFeedback] = useState<string[]>([])

  // Category ratings
  const [zuverlaessigkeit, setZuverlaessigkeit] = useState(0)
  const [kommunikation, setKommunikation] = useState(0)
  const [preisLeistung, setPreisLeistung] = useState(0)
  const [stimmung, setStimmung] = useState(0)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Toggle quick feedback
  const toggleQuickFeedback = (id: string) => {
    setQuickFeedback((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (overallRating === 0) {
      setError('Bitte gib eine Gesamtbewertung ab.')
      return
    }

    const data: ReviewFormData = {
      overall_rating: overallRating,
      review_title: reviewTitle.trim(),
      review_text: reviewText.trim(),
      quick_feedback: quickFeedback,
    }

    if (showCategoryRatings) {
      if (zuverlaessigkeit > 0) data.zuverlaessigkeit = zuverlaessigkeit
      if (kommunikation > 0) data.kommunikation = kommunikation
      if (preisLeistung > 0) data.preis_leistung = preisLeistung
      if (stimmung > 0) data.stimmung = stimmung
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Overall Rating */}
      <div className="text-center">
        <label className="block text-white/60 text-sm uppercase tracking-wider mb-3">
          Gesamtbewertung *
        </label>
        <div className="flex justify-center">
          <StarRating
            rating={overallRating}
            size="lg"
            interactive
            onChange={setOverallRating}
          />
        </div>
        <p className="text-white/40 text-sm mt-2">
          {overallRating === 0 && 'Klicke auf die Sterne'}
          {overallRating === 1 && 'Schlecht'}
          {overallRating === 2 && 'Nicht so gut'}
          {overallRating === 3 && 'Okay'}
          {overallRating === 4 && 'Gut'}
          {overallRating === 5 && 'Ausgezeichnet'}
        </p>
      </div>

      {/* Category Ratings */}
      {showCategoryRatings && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h4 className="text-white/60 text-sm uppercase tracking-wider">
            Detailbewertung (optional)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CategoryRatingInput
              label="Zuverlässigkeit"
              rating={zuverlaessigkeit}
              onChange={setZuverlaessigkeit}
            />
            <CategoryRatingInput
              label="Kommunikation"
              rating={kommunikation}
              onChange={setKommunikation}
            />
            <CategoryRatingInput
              label="Preis/Leistung"
              rating={preisLeistung}
              onChange={setPreisLeistung}
            />
            <CategoryRatingInput
              label="Stimmung"
              rating={stimmung}
              onChange={setStimmung}
            />
          </div>
        </div>
      )}

      {/* Quick Feedback */}
      <div className="pt-4 border-t border-white/10">
        <label className="block text-white/60 text-sm uppercase tracking-wider mb-3">
          Was hat dir gefallen? (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_FEEDBACK_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleQuickFeedback(option.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm transition-colors
                ${
                  quickFeedback.includes(option.id)
                    ? 'bg-accent-purple text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/60 text-sm uppercase tracking-wider">
            Titel (optional)
          </label>
          <span className="text-white/30 text-xs">
            {reviewTitle.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
          placeholder="Fasse deine Erfahrung in einem Satz zusammen"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-purple"
        />
      </div>

      {/* Review Text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/60 text-sm uppercase tracking-wider">
            Deine Bewertung (optional)
          </label>
          <span className="text-white/30 text-xs">
            {reviewText.length}/{MAX_TEXT_LENGTH}
          </span>
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
          placeholder="Erzähle anderen von deiner Erfahrung..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-purple resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Abbrechen
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || overallRating === 0}
          className="flex-1"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Wird gesendet...
            </span>
          ) : (
            'Bewertung abschicken'
          )}
        </Button>
      </div>
    </form>
  )
}

// Category rating input component
function CategoryRatingInput({
  label,
  rating,
  onChange,
}: {
  label: string
  rating: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
      <span className="text-white/70 text-sm">{label}</span>
      <StarRating rating={rating} size="sm" interactive onChange={onChange} />
    </div>
  )
}
