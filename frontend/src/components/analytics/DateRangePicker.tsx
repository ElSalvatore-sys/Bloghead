/**
 * DateRangePicker - Phase 8 Analytics
 * Period selector for analytics dashboards
 */

import { Calendar } from 'lucide-react'
import type { AnalyticsPeriod } from '@/services/analyticsService'

interface DateRangePickerProps {
  value: AnalyticsPeriod
  onChange: (period: AnalyticsPeriod) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'buttons' | 'dropdown'
}

interface PeriodOption {
  value: AnalyticsPeriod
  label: string
  shortLabel: string
}

const periodOptions: PeriodOption[] = [
  { value: '7d', label: '7 Tage', shortLabel: '7T' },
  { value: '30d', label: '30 Tage', shortLabel: '30T' },
  { value: '90d', label: '90 Tage', shortLabel: '90T' },
  { value: '12m', label: '12 Monate', shortLabel: '12M' },
  { value: 'all', label: 'Gesamt', shortLabel: 'Alle' },
]

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export function DateRangePicker({
  value,
  onChange,
  className = '',
  size = 'md',
  variant = 'buttons',
}: DateRangePickerProps) {
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/60" />
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as AnalyticsPeriod)}
            className={`
              bg-bg-card border border-white/10 rounded-lg
              text-white focus:outline-none focus:ring-2 focus:ring-accent-purple/50
              ${sizeStyles[size]}
            `}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  // Button variant (default)
  return (
    <div
      className={`
        inline-flex items-center gap-1 p-1
        bg-white/5 rounded-lg border border-white/10
        ${className}
      `}
    >
      {periodOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            rounded-md transition-all duration-200
            ${sizeStyles[size]}
            ${
              value === option.value
                ? 'bg-accent-purple text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
        >
          <span className="hidden sm:inline">{option.label}</span>
          <span className="sm:hidden">{option.shortLabel}</span>
        </button>
      ))}
    </div>
  )
}

export default DateRangePicker
