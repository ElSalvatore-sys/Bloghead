/**
 * ReviewBadge Component - Phase 7
 * Display individual badge with tooltip
 */

import { BADGE_INFO, type BadgeType } from '@/services/reviewService'

interface ReviewBadgeProps {
  badge: BadgeType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ReviewBadge({ badge, size = 'md', showLabel = true }: ReviewBadgeProps) {
  const info = BADGE_INFO[badge]
  
  if (!info) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-zinc-800/50 rounded-full ${sizeClasses[size]} ${info.color}`}
      title={info.label}
    >
      <span>{info.icon}</span>
      {showLabel && <span className="font-medium">{info.label}</span>}
    </div>
  )
}

export default ReviewBadge
