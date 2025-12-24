import { forwardRef, type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, padding = 'md', className = '', children, ...props }, ref) => {
    const baseClassName = `
      bg-bg-card rounded-xl
      ${variant === 'elevated' ? 'shadow-lg' : ''}
      ${variant === 'outlined' ? 'border border-white/10' : ''}
      ${hoverable ? 'transition-all duration-200 hover:bg-bg-card-hover hover:shadow-xl shadow-md hover:shadow-accent-purple/20' : ''}
      ${paddingStyles[padding]}
      ${className}
    `

    if (hoverable) {
      return (
        <motion.div
          ref={ref}
          className={baseClassName}
          whileHover={{
            y: -4,
            scale: 1.01,
            transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
          }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={baseClassName}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Artist Card Component
interface ArtistCardProps {
  image?: string
  name: string
  category: string
  location: string
  rating: number
  price?: string
  onViewProfile?: () => void
  onFavorite?: () => void
  isFavorite?: boolean
}

export function ArtistCard({
  image,
  name,
  category,
  location,
  rating,
  price,
  onViewProfile,
  onFavorite,
  isFavorite = false,
}: ArtistCardProps) {
  return (
    <Card hoverable padding="none" className="overflow-hidden group">
      {/* Image Container */}
      <div className="relative aspect-square bg-bg-card-hover overflow-hidden">
        {image ? (
          <img src={image} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        {/* Favorite Button */}
        <button
          onClick={onFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-accent-purple fill-accent-purple' : 'text-white'}`}
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-text-primary mb-1">{name}</h3>
        <p className="text-text-secondary text-sm mb-1">{category}</p>
        <p className="text-text-muted text-sm mb-3">{location}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${star <= rating ? 'text-accent-salmon fill-accent-salmon' : 'text-text-muted'}`}
              viewBox="0 0 24 24"
              fill={star <= rating ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          {price && <span className="ml-2 text-sm text-text-muted">ab {price}</span>}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={onViewProfile}
          className="w-full py-2.5 bg-gradient-to-r from-accent-purple to-accent-red text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          PROFIL ANSEHEN
        </motion.button>
      </div>
    </Card>
  )
}
