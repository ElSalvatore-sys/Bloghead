interface GradientBrushProps {
  className?: string
  variant?: 'horizontal' | 'diagonal'
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

export function GradientBrush({
  className = '',
  variant = 'horizontal',
  size = 'md',
}: GradientBrushProps) {
  const gradientDirection = variant === 'horizontal' ? '90deg' : '135deg'

  return (
    <div
      className={`
        w-full rounded-full
        ${sizeStyles[size]}
        ${className}
      `}
      style={{
        background: `linear-gradient(${gradientDirection}, #610AD1 0%, #F92B02 50%, #FB7A43 100%)`,
      }}
    />
  )
}

// Decorative brush stroke SVG version (more organic look)
interface BrushStrokeSVGProps {
  className?: string
  width?: number
}

export function BrushStrokeSVG({ className = '', width = 200 }: BrushStrokeSVGProps) {
  return (
    <svg
      width={width}
      height={width * 0.08}
      viewBox="0 0 200 16"
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#610AD1" />
          <stop offset="50%" stopColor="#F92B02" />
          <stop offset="100%" stopColor="#FB7A43" />
        </linearGradient>
      </defs>
      <path
        d="M0 8 Q10 4, 25 8 T50 6 T75 10 T100 7 T125 9 T150 6 T175 8 T200 7"
        stroke="url(#brushGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// Section divider with brush stroke
interface SectionDividerProps {
  className?: string
}

export function SectionDivider({ className = '' }: SectionDividerProps) {
  return (
    <div className={`relative py-8 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <GradientBrush size="lg" className="opacity-60" />
      </div>
    </div>
  )
}
