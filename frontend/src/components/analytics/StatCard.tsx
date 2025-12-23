/**
 * StatCard - Phase 8 Analytics
 * Displays a key metric with trend indicator
 */

import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { TrendIndicator } from './TrendIndicator'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction?: 'up' | 'down' | 'stable'
    inverted?: boolean
  }
  loading?: boolean
  error?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'gradient' | 'outlined'
}

const sizeStyles = {
  sm: {
    container: 'p-4',
    title: 'text-xs',
    value: 'text-xl',
    icon: 'w-8 h-8',
  },
  md: {
    container: 'p-5',
    title: 'text-sm',
    value: 'text-2xl',
    icon: 'w-10 h-10',
  },
  lg: {
    container: 'p-6',
    title: 'text-sm',
    value: 'text-3xl',
    icon: 'w-12 h-12',
  },
}

const variantStyles = {
  default: 'bg-bg-card border border-white/10',
  gradient: 'bg-gradient-to-br from-accent-purple/20 to-accent-red/20 border border-accent-purple/30',
  outlined: 'bg-transparent border-2 border-white/20',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
  error = null,
  className = '',
  size = 'md',
  variant = 'default',
}: StatCardProps) {
  const styles = sizeStyles[size]

  if (loading) {
    return (
      <div
        className={`
          rounded-xl ${styles.container} ${variantStyles[variant]}
          flex items-center justify-center min-h-[120px]
          ${className}
        `}
      >
        <Loader2 className="w-6 h-6 text-accent-purple animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`
          rounded-xl ${styles.container} ${variantStyles[variant]}
          ${className}
        `}
      >
        <p className={`${styles.title} text-white/60 mb-2`}>{title}</p>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={`
        rounded-xl ${styles.container} ${variantStyles[variant]}
        transition-all duration-200 hover:border-white/20
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className={`${styles.title} text-white/60 mb-1`}>{title}</p>
          <div className="flex items-baseline gap-3">
            <p className={`${styles.value} font-bold text-white`}>{value}</p>
            {trend && (
              <TrendIndicator
                value={trend.value}
                trend={trend.direction}
                inverted={trend.inverted}
                size={size === 'lg' ? 'md' : 'sm'}
              />
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-white/40 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={`
              ${styles.icon} rounded-lg bg-accent-purple/20
              flex items-center justify-center text-accent-purple
            `}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
