import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { checkIsFavorited, toggleFavorite } from '../../services/favoritesService'

// Heart icon component
function HeartIcon({ filled = false, className = '' }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

interface FavoriteButtonProps {
  itemId: string
  type: 'artist' | 'provider'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'overlay' | 'inline'
  className?: string
  onToggle?: (isFavorited: boolean) => void
}

export function FavoriteButton({
  itemId,
  type,
  size = 'md',
  variant = 'overlay',
  className = '',
  onToggle,
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Check favorite status on mount
  const checkFavoriteStatus = useCallback(async () => {
    if (!user) {
      setInitialLoading(false)
      return
    }

    try {
      const favorited = await checkIsFavorited(user.id, itemId, type)
      setIsFavorited(favorited)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    } finally {
      setInitialLoading(false)
    }
  }, [user, itemId, type])

  useEffect(() => {
    checkFavoriteStatus()
  }, [checkFavoriteStatus])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If not logged in, redirect to login
    if (!user) {
      window.location.href = '/?login=true'
      return
    }

    setLoading(true)

    try {
      const result = await toggleFavorite(user.id, itemId, type)
      if (!result.error) {
        setIsFavorited(result.isFavorited)
        onToggle?.(result.isFavorited)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Variant classes
  const variantClasses = {
    overlay: 'rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70',
    inline: 'rounded-lg bg-white/5 hover:bg-white/10 border border-white/10',
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || initialLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        flex items-center justify-center
        transition-all duration-200
        ${loading || initialLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isFavorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      title={isFavorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      <HeartIcon
        filled={isFavorited}
        className={`
          ${iconSizes[size]}
          transition-colors duration-200
          ${isFavorited ? 'text-red-500' : 'text-white/80 hover:text-white'}
        `}
      />
    </button>
  )
}
