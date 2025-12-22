/**
 * ReviewStats Component - Phase 7
 * Display user rating statistics with distribution
 */

import { Star } from 'lucide-react'
import { BADGE_INFO, type UserRatingStats, type BadgeType } from '@/services/reviewService'

interface ReviewStatsProps {
  stats: UserRatingStats | null
  compact?: boolean
}

export function ReviewStats({ stats, compact = false }: ReviewStatsProps) {
  if (!stats || stats.total_reviews === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-400">Noch keine Bewertungen vorhanden</p>
      </div>
    )
  }

  const maxCount = Math.max(...Object.values(stats.rating_distribution))

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-lg font-semibold text-white">
            {stats.average_rating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-zinc-400">
          ({stats.total_reviews} {stats.total_reviews === 1 ? 'Bewertung' : 'Bewertungen'})
        </span>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
      {/* Overall Rating */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-white">
            {stats.average_rating.toFixed(1)}
          </div>
          <div className="flex justify-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.average_rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-zinc-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {stats.total_reviews} {stats.total_reviews === 1 ? 'Bewertung' : 'Bewertungen'}
          </p>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_distribution[String(rating)] || 0
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-zinc-400 w-4">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-zinc-500 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Averages */}
      {Object.keys(stats.category_averages).length > 0 && (
        <div className="border-t border-zinc-800 pt-6">
          <h4 className="text-sm font-medium text-zinc-300 mb-4">Detailbewertungen</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.category_averages).map(([category, avg]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 capitalize">
                  {category.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-white">
                    {Number(avg).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {stats.badges && stats.badges.length > 0 && (
        <div className="border-t border-zinc-800 pt-6">
          <h4 className="text-sm font-medium text-zinc-300 mb-4">Auszeichnungen</h4>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => {
              const info = BADGE_INFO[badge as BadgeType]
              return (
                <div
                  key={badge}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full ${info?.color || 'text-zinc-400'}`}
                >
                  <span>{info?.icon}</span>
                  <span className="text-sm font-medium">{info?.label || badge}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewStats
