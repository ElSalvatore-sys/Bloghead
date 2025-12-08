import { StarRating } from '../ui/StarRating'
import type { Review } from '../../services/reviewService'

interface ReviewCardProps {
  review: Review
  showResponse?: boolean
}

// Format date to German locale
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Get initials from name
function getInitials(vorname: string | null, nachname: string | null): string {
  const first = vorname?.charAt(0)?.toUpperCase() || ''
  const last = nachname?.charAt(0)?.toUpperCase() || ''
  return first + last || '?'
}

// Get display name
function getDisplayName(
  vorname: string | null,
  nachname: string | null,
  membername: string | null
): string {
  if (vorname && nachname) {
    return `${vorname} ${nachname.charAt(0)}.`
  }
  if (membername) {
    return membername
  }
  return 'Anonymer Nutzer'
}

// Quick feedback labels
const QUICK_FEEDBACK_LABELS: Record<string, string> = {
  professional: 'Professionell',
  on_time: 'Pünktlich',
  great_music: 'Tolle Musik',
  friendly: 'Freundlich',
  good_communication: 'Gute Kommunikation',
  recommended: 'Empfehlenswert',
  fair_price: 'Fairer Preis',
  creative: 'Kreativ',
  flexible: 'Flexibel',
  high_quality: 'Hohe Qualität',
}

export function ReviewCard({ review, showResponse = true }: ReviewCardProps) {
  const initials = getInitials(review.rater?.vorname || null, review.rater?.nachname || null)
  const displayName = getDisplayName(
    review.rater?.vorname || null,
    review.rater?.nachname || null,
    review.rater?.membername || null
  )

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      {/* Header: Avatar, Name, Date, Rating */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.rater?.profile_image_url ? (
            <img
              src={review.rater.profile_image_url}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-accent-purple/30 flex items-center justify-center text-white font-medium">
              {initials}
            </div>
          )}
        </div>

        {/* Name and Date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-white font-medium truncate">{displayName}</h4>
            <span className="text-white/40 text-sm flex-shrink-0">
              {formatDate(review.created_at)}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Number(review.overall_rating)} size="sm" />
            <span className="text-white/60 text-sm">
              {Number(review.overall_rating).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Review Title */}
      {review.review_title && (
        <h5 className="text-white font-semibold mb-2">{review.review_title}</h5>
      )}

      {/* Review Text */}
      {review.review_text && (
        <p className="text-white/70 text-sm leading-relaxed mb-4">{review.review_text}</p>
      )}

      {/* Quick Feedback Tags */}
      {review.quick_feedback && review.quick_feedback.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.quick_feedback.map((feedback) => (
            <span
              key={feedback}
              className="px-2.5 py-1 bg-accent-purple/20 text-accent-purple text-xs rounded-full"
            >
              {QUICK_FEEDBACK_LABELS[feedback] || feedback}
            </span>
          ))}
        </div>
      )}

      {/* Category Ratings (if available) */}
      {(review.zuverlaessigkeit ||
        review.kommunikation ||
        review.preis_leistung ||
        review.stimmung) && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 mb-4">
          {review.zuverlaessigkeit && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Zuverlässigkeit</span>
              <div className="flex items-center gap-1">
                <StarRating rating={review.zuverlaessigkeit} maxRating={5} size="sm" />
              </div>
            </div>
          )}
          {review.kommunikation && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Kommunikation</span>
              <div className="flex items-center gap-1">
                <StarRating rating={review.kommunikation} maxRating={5} size="sm" />
              </div>
            </div>
          )}
          {review.preis_leistung && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Preis/Leistung</span>
              <div className="flex items-center gap-1">
                <StarRating rating={review.preis_leistung} maxRating={5} size="sm" />
              </div>
            </div>
          )}
          {review.stimmung && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Stimmung</span>
              <div className="flex items-center gap-1">
                <StarRating rating={review.stimmung} maxRating={5} size="sm" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verified Badge */}
      {review.is_verified && (
        <div className="flex items-center gap-1 text-green-400 text-xs mb-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Verifizierte Buchung</span>
        </div>
      )}

      {/* Response from Artist/Provider */}
      {showResponse && review.response_text && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-accent-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span className="text-white/60 text-sm font-medium">Antwort vom Anbieter</span>
              {review.response_at && (
                <span className="text-white/30 text-xs">• {formatDate(review.response_at)}</span>
              )}
            </div>
            <p className="text-white/70 text-sm">{review.response_text}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton loader for ReviewCard
export function ReviewCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="h-5 bg-white/10 rounded w-32" />
            <div className="h-4 bg-white/10 rounded w-24" />
          </div>
          <div className="h-4 bg-white/10 rounded w-24 mt-2" />
        </div>
      </div>
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-4 bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-white/10 rounded w-2/3" />
    </div>
  )
}
