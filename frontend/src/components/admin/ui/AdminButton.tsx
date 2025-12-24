import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface AdminButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `bg-purple-600 hover:bg-purple-700 text-white
    shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30`,
  secondary: `bg-gray-700 hover:bg-gray-600 text-white
    shadow-lg shadow-gray-900/20`,
  outline: `bg-transparent border-2 border-gray-600 hover:border-purple-500
    text-gray-300 hover:text-white`,
  ghost: `bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white`,
  danger: `bg-red-600 hover:bg-red-700 text-white
    shadow-lg shadow-red-500/20 hover:shadow-red-500/30`
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  onClick,
  type = 'button',
  title
}: AdminButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      title={title}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${iconSizeStyles[size]}`} />
      ) : (
        Icon && iconPosition === 'left' && <Icon className={iconSizeStyles[size]} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizeStyles[size]} />
      )}
    </motion.button>
  )
}
