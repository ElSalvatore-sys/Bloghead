import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-accent-purple to-accent-red text-white hover:opacity-90 hover:-translate-y-0.5',
  secondary: 'bg-bg-card text-white border border-white/20 hover:bg-bg-card-hover',
  outline: 'bg-transparent text-white border border-white hover:bg-white/10',
  ghost: 'bg-transparent text-white hover:bg-white/10',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, disabled, ...props }, ref) => {
    const MotionButton = motion.button as typeof motion.button

    return (
      <MotionButton
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-bg-primary
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        disabled={disabled}
        {...(props as any)}
      >
        {children}
      </MotionButton>
    )
  }
)

Button.displayName = 'Button'
