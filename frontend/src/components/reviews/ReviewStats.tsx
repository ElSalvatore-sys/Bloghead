import { StarRating } from '../ui/StarRating'
import type { ReviewStats as ReviewStatsType } from '../../services/reviewService'

interface ReviewStatsProps {
  stats: ReviewStatsType
  showCategoryAverages?: boolean
}

export function ReviewStats({ stats, showCategoryAverages = false }: ReviewStatsProps) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-white">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
          </div>
          <div className="mt-2">
            <StarRating rating={stats.avgRating} size="md" />
          </div>
          <div className="text-white/50 text-sm mt-1">
            {stats.totalReviews} {stats.totalReviews === 1 ? 'Bewertung' : 'Bewertungen'}
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-white/60 text-sm w-4">{star}</span>
                <svg className="w-4 h-4 text-accent-salmon" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-salmon rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-white/40 text-xs w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Averages (for artists) */}
      {showCategoryAverages && stats.categoryAverages && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white/60 text-sm uppercase tracking-wider mb-4">
            Bewertung nach Kategorie
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <CategoryRating label="Zuverlässigkeit" rating={stats.categoryAverages.zuverlaessigkeit} />
            <CategoryRating label="Kommunikation" rating={stats.categoryAverages.kommunikation} />
            <CategoryRating label="Preis/Leistung" rating={stats.categoryAverages.preis_leistung} />
            <CategoryRating label="Stimmung" rating={stats.categoryAverages.stimmung} />
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryRating({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <StarRating rating={rating} size="sm" />
        <span className="text-white/50 text-xs">{rating > 0 ? rating.toFixed(1) : '-'}</span>
      </div>
    </div>
  )
}

// Skeleton loader
export function ReviewStatsSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="h-12 w-16 bg-white/10 rounded mx-auto" />
          <div className="h-4 w-24 bg-white/10 rounded mx-auto mt-2" />
          <div className="h-3 w-20 bg-white/10 rounded mx-auto mt-2" />
        </div>
        <div className="flex-1 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/10 rounded" />
              <div className="w-4 h-4 bg-white/10 rounded" />
              <div className="flex-1 h-2 bg-white/10 rounded-full" />
              <div className="w-8 h-3 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
