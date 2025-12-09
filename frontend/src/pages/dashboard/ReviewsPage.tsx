// Reviews received by artist/service provider
const mockReviews = [
  {
    id: '1',
    clientName: 'Max Mustermann',
    rating: 5,
    comment: 'Absolut fantastisch! Der beste DJ, den wir je gebucht haben. Hat unsere Hochzeit unvergesslich gemacht.',
    date: '2024-06-20',
    eventType: 'Hochzeit',
    response: null,
  },
  {
    id: '2',
    clientName: 'Lisa Schmidt',
    rating: 4,
    comment: 'Sehr gute Performance und professionell. Würde ich wieder buchen!',
    date: '2024-06-15',
    eventType: 'Geburtstagsparty',
    response: 'Vielen Dank für das tolle Feedback, Lisa! Es hat mir sehr viel Spaß gemacht.',
  },
  {
    id: '3',
    clientName: 'Thomas Weber',
    rating: 5,
    comment: 'Einfach nur wow! Die Stimmung war grandios.',
    date: '2024-05-10',
    eventType: 'Firmenfeier',
    response: null,
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

export function ReviewsPage() {
  const averageRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length
  const ratingCounts = [5, 4, 3, 2, 1].map(rating =>
    mockReviews.filter(r => r.rating === rating).length
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Bewertungen</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Average Rating */}
        <div className="bg-bg-card rounded-xl border border-white/10 p-6 text-center">
          <p className="text-5xl font-bold text-white mb-2">{averageRating.toFixed(1)}</p>
          <div className="flex justify-center mb-2">
            <StarRating rating={Math.round(averageRating)} />
          </div>
          <p className="text-text-muted text-sm">{mockReviews.length} Bewertungen</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 bg-bg-card rounded-xl border border-white/10 p-6">
          <h3 className="text-white font-medium mb-4">Bewertungsverteilung</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingCounts[index]
              const percentage = mockReviews.length > 0 ? (count / mockReviews.length) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-text-muted text-sm w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-salmon rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-text-muted text-sm w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="bg-bg-card rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center text-white font-bold">
                  {review.clientName.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{review.clientName}</p>
                  <p className="text-text-muted text-sm">{review.eventType}</p>
                </div>
              </div>
              <div className="text-right">
                <StarRating rating={review.rating} />
                <p className="text-text-muted text-xs mt-1">
                  {new Date(review.date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>

            <p className="text-text-secondary mb-4">{review.comment}</p>

            {/* Response */}
            {review.response ? (
              <div className="bg-white/5 rounded-lg p-4 border-l-2 border-accent-purple">
                <p className="text-accent-purple text-xs font-medium mb-1">Deine Antwort</p>
                <p className="text-text-secondary text-sm">{review.response}</p>
              </div>
            ) : (
              <button className="text-accent-purple text-sm hover:underline">
                Antworten
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
