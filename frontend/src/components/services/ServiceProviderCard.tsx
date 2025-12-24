import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { StarRating } from '../ui/StarRating'
import { FavoriteButton } from '../ui/FavoriteButton'
import type { ServiceProviderListItem } from '../../services/serviceProviderService'

// Location icon
function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// Verified badge icon
function VerifiedIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  utensils: '🍽️',
  camera: '📷',
  flower: '💐',
  speaker: '🔊',
  shield: '🛡️',
  video: '🎬',
  palette: '🎨',
  scissors: '✂️',
  sparkles: '✨',
  lightbulb: '💡',
  car: '🚗',
  star: '⭐',
  building: '🏛️',
  music: '🎵',
  disc: '💿',
}

interface ServiceProviderCardProps {
  provider: ServiceProviderListItem
}

export function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  // Format price range
  const priceDisplay = (() => {
    if (provider.min_price && provider.max_price) {
      return `€${provider.min_price} - €${provider.max_price}`
    } else if (provider.min_price) {
      return `ab €${provider.min_price}`
    } else if (provider.max_price) {
      return `bis €${provider.max_price}`
    }
    return 'Preis auf Anfrage'
  })()

  // Get pricing unit
  const pricingUnit = (provider as { pricing_unit?: string }).pricing_unit || ''

  // Default image if none provided
  const imageUrl = provider.profile_image_url ||
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop'

  // Get category icon
  const categoryIcon = provider.service_category?.icon
    ? CATEGORY_ICONS[provider.service_category.icon] || '📦'
    : '📦'

  return (
    <motion.div
      className="group flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl group-hover:shadow-accent-purple/20 transition-shadow duration-300">
        <img
          src={imageUrl}
          alt={provider.business_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Category Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            <span>{categoryIcon}</span>
            {provider.service_category?.name_de || 'Service'}
          </span>

          {/* Newcomer Badge */}
          {provider.is_newcomer && (
            <span className="inline-flex items-center px-2.5 py-1 bg-accent-orange/90 rounded-full text-xs font-bold text-white uppercase">
              Neu
            </span>
          )}
        </div>

        {/* Right side: Verified Badge and Favorite Button */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {/* Verified Badge */}
          {provider.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full text-xs font-medium text-white">
              <VerifiedIcon className="w-3.5 h-3.5" />
              Verifiziert
            </span>
          )}

          {/* Favorite Button */}
          <FavoriteButton
            itemId={provider.id}
            type="provider"
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        {/* Business Name */}
        <h3 className="text-white font-bold text-lg uppercase tracking-wide">
          {provider.business_name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-text-muted text-sm">
          <LocationIcon className="w-4 h-4" />
          <span>{provider.city || 'Deutschland'}</span>
        </div>

        {/* Price Range */}
        <p className="text-text-secondary text-sm">
          {priceDisplay}
          {pricingUnit && <span className="text-text-muted"> {pricingUnit}</span>}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 py-1">
          <StarRating rating={provider.avg_rating || 0} size="sm" />
          {provider.total_reviews > 0 && (
            <span className="text-text-muted text-xs">
              ({provider.total_reviews})
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Link to={`/services/${provider.id}`}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="mt-3 rounded-full border-white/30 hover:border-white/50 uppercase tracking-wider"
            >
              Profil Ansehen
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}

// Loading skeleton
export function ServiceProviderCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square mb-4 bg-white/10 rounded-lg" />
      <div className="space-y-2">
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-10 bg-white/10 rounded-full mt-4" />
      </div>
    </div>
  )
}
