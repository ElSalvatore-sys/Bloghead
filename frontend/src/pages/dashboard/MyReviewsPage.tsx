import { Link } from 'react-router-dom'

// Placeholder data
const mockReviews = [
  {
    id: '1',
    artistName: 'DJ Thunder',
    artistId: '1',
    artistImage: '/images/alexander-popov-f3e6YNo3Y98-unsplash.webp',
    rating: 5,
    comment: 'Absolut fantastischer DJ! Hat die Party zum Kochen gebracht. Sehr professionell und freundlich.',
    date: '2024-06-20',
    eventName: 'Geburtstagsparty',
  },
  {
    id: '2',
    artistName: 'Sarah Voice',
    artistId: '2',
    artistImage: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp',
    rating: 4,
    comment: 'Tolle Stimme und gute Performance. Kleine Verspätung, aber ansonsten super!',
    date: '2024-05-15',
    eventName: 'Hochzeitsfeier',
  },
]

function StarIcon({ className = '', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-accent-salmon' : 'text-white/20'}`}
          filled={star <= rating}
        />
      ))}
    </div>
  )
}

export function MyReviewsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Meine Bewertungen</h1>

      {mockReviews.length === 0 ? (
        <div className="bg-bg-card rounded-xl border border-white/10 p-12 text-center">
          <StarIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Keine Bewertungen</h2>
          <p className="text-text-muted mb-6">
            Du hast noch keine Bewertungen abgegeben.
          </p>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            Künstler buchen
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-bg-card rounded-xl border border-white/10 p-6"
            >
              <div className="flex gap-4">
                {/* Artist Image */}
                <Link to={`/artists/${review.artistId}`}>
                  <img
                    src={review.artistImage}
                    alt={review.artistName}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                </Link>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link
                        to={`/artists/${review.artistId}`}
                        className="text-white font-semibold hover:text-accent-purple transition-colors"
                      >
                        {review.artistName}
                      </Link>
                      <p className="text-text-muted text-sm">{review.eventName}</p>
                    </div>
                    <div className="text-right">
                      <StarRating rating={review.rating} />
                      <p className="text-text-muted text-xs mt-1">
                        {new Date(review.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm">{review.comment}</p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="px-3 py-1 border border-white/20 text-white text-xs font-medium rounded hover:bg-white/5 transition-colors">
                      Bearbeiten
                    </button>
                    <button className="px-3 py-1 border border-accent-red/50 text-accent-red text-xs font-medium rounded hover:bg-accent-red/10 transition-colors">
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
