import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-card-hover text-text-secondary',
  primary: 'bg-accent-purple/20 text-accent-purple',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-accent-salmon/20 text-accent-salmon',
  error: 'bg-accent-red/20 text-accent-red',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

// Genre Badge specifically styled for music genres
interface GenreBadgeProps {
  genre: string
  selected?: boolean
  onClick?: () => void
}

export function GenreBadge({ genre, selected = false, onClick }: GenreBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
        ${selected
          ? 'bg-gradient-to-r from-accent-purple to-accent-red text-white'
          : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover border border-white/10'
        }
      `}
    >
      {genre}
    </button>
  )
}

// Status Badge for booking status
interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

const statusConfig = {
  pending: { label: 'Ausstehend', variant: 'warning' as const },
  confirmed: { label: 'Bestätigt', variant: 'success' as const },
  cancelled: { label: 'Storniert', variant: 'error' as const },
  completed: { label: 'Abgeschlossen', variant: 'primary' as const },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
