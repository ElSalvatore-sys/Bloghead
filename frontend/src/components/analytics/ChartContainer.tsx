/**
 * ChartContainer - Phase 8 Analytics
 * Wrapper component for charts with loading, error, and empty states
 */

import type { ReactNode } from 'react'
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react'

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  emptyMessage?: string
  height?: string
  actions?: ReactNode
  className?: string
}

export function ChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'Keine Daten verfügbar',
  height = 'h-80',
  actions,
  className = '',
}: ChartContainerProps) {
  return (
    <div
      className={`
        bg-bg-card rounded-xl border border-white/10 p-6
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-white/60 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content Area */}
      <div className={`${height} relative`}>
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-card/80 backdrop-blur-sm rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
              <p className="text-sm text-white/60">Daten werden geladen...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-sm text-white/60">{emptyMessage}</p>
            </div>
          </div>
        )}

        {/* Chart Content */}
        {!loading && !error && !isEmpty && children}
      </div>
    </div>
  )
}

export default ChartContainer
