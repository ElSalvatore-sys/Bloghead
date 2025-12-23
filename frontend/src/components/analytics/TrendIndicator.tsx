/**
 * TrendIndicator - Phase 8 Analytics
 * Displays trend direction with percentage change
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendIndicatorProps {
  value: number
  trend?: 'up' | 'down' | 'stable'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showValue?: boolean
  inverted?: boolean // For metrics where down is good (e.g., response time)
  className?: string
}

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function TrendIndicator({
  value,
  trend,
  size = 'md',
  showIcon = true,
  showValue = true,
  inverted = false,
  className = '',
}: TrendIndicatorProps) {
  // Determine trend from value if not provided
  const actualTrend = trend || (value > 0 ? 'up' : value < 0 ? 'down' : 'stable')

  // Determine if this is positive (considering inverted metrics)
  const isPositive = inverted
    ? actualTrend === 'down'
    : actualTrend === 'up'

  const isNegative = inverted
    ? actualTrend === 'up'
    : actualTrend === 'down'

  // Color based on positive/negative
  const colorClass = isPositive
    ? 'text-green-400'
    : isNegative
    ? 'text-red-400'
    : 'text-white/50'

  // Background color for badge style
  const bgClass = isPositive
    ? 'bg-green-400/10'
    : isNegative
    ? 'bg-red-400/10'
    : 'bg-white/5'

  // Format value
  const formattedValue = Math.abs(value).toFixed(1) + '%'
  const prefix = value > 0 ? '+' : value < 0 ? '-' : ''

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        ${bgClass} ${colorClass} ${sizeStyles[size]} ${className}
      `}
    >
      {showIcon && (
        <>
          {actualTrend === 'up' && <TrendingUp className={iconSizes[size]} />}
          {actualTrend === 'down' && <TrendingDown className={iconSizes[size]} />}
          {actualTrend === 'stable' && <Minus className={iconSizes[size]} />}
        </>
      )}
      {showValue && (
        <span className="font-medium">
          {prefix}{formattedValue}
        </span>
      )}
    </span>
  )
}

export default TrendIndicator
