import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { StarRating } from '../components/ui/StarRating'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { getServiceProviderById } from '../services/serviceProviderService'
import type { ServiceProviderListItem } from '../services/serviceProviderService'

// Icons
function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function GlobeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function VerifiedIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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

// Extended provider type for detail page
type ProviderDetail = ServiceProviderListItem & {
  address?: string | null
  phone?: string | null
  website_url?: string | null
  instagram_handle?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  pricing_unit?: string | null
  service_radius_km?: number | null
}

export function ServiceProviderProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [provider, setProvider] = useState<ProviderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProvider() {
      if (!id) return

      setLoading(true)
      const { data, error: fetchError } = await getServiceProviderById(id)

      if (fetchError || !data) {
        setError('Dienstleister nicht gefunden')
        console.error(fetchError)
      } else {
        setProvider(data as ProviderDetail)
      }

      setLoading(false)
    }

    fetchProvider()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-white/10 rounded-2xl mb-8" />
            <div className="h-8 bg-white/10 rounded w-1/3 mb-4" />
            <div className="h-4 bg-white/10 rounded w-1/4 mb-8" />
            <div className="h-32 bg-white/10 rounded mb-8" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !provider) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{error || 'Nicht gefunden'}</h1>
          <Link to="/services">
            <Button variant="primary" className="rounded-full">
              Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Format price
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

  const categoryIcon = provider.service_category?.icon
    ? CATEGORY_ICONS[provider.service_category.icon] || '📦'
    : '📦'

  const imageUrl = provider.profile_image_url ||
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop'

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header with background */}
      <div className="relative h-[300px] md:h-[400px]">
        <img
          src={imageUrl}
          alt={provider.business_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />

        {/* Back button */}
        <Link
          to="/services"
          className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Zurück</span>
        </Link>

        {/* Favorite button */}
        <div className="absolute top-6 right-6">
          <FavoriteButton
            itemId={provider?.id || id || ''}
            type="provider"
            size="md"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-purple/20 rounded-full text-sm font-medium text-accent-purple">
                  <span>{categoryIcon}</span>
                  {provider.service_category?.name_de || 'Service'}
                </span>

                {provider.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-full text-sm font-medium text-green-400">
                    <VerifiedIcon className="w-4 h-4" />
                    Verifiziert
                  </span>
                )}

                {provider.is_newcomer && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-accent-orange/20 rounded-full text-sm font-bold text-accent-orange uppercase">
                    Neu
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="font-display text-3xl md:text-4xl text-white mb-4">
                {provider.business_name}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-white/60 mb-4">
                <LocationIcon className="w-5 h-5" />
                <span>
                  {[provider.city, provider.country].filter(Boolean).join(', ')}
                </span>
                {provider.service_radius_km && (
                  <span className="text-white/40">
                    • Aktionsradius: {provider.service_radius_km} km
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarRating rating={provider.avg_rating || 0} size="md" />
                <span className="text-white/60">
                  {provider.avg_rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-white/40">
                  ({provider.total_reviews || 0} Bewertungen)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">
                Über uns
              </h2>
              <p className="text-white/70 leading-relaxed whitespace-pre-line">
                {provider.description || 'Keine Beschreibung verfügbar.'}
              </p>
            </div>

            {/* Gallery */}
            {provider.gallery_urls && provider.gallery_urls.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">
                  Galerie
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.gallery_urls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`${provider.business_name} - Bild ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Preise</h3>
              <div className="text-2xl font-bold text-accent-purple mb-1">
                {priceDisplay}
              </div>
              {provider.pricing_unit && (
                <p className="text-white/50 text-sm mb-6">{provider.pricing_unit}</p>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="rounded-full uppercase tracking-wider"
              >
                Anfrage senden
              </Button>
            </div>

            {/* Contact Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Kontakt</h3>
              <div className="space-y-3">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    <span>{provider.phone}</span>
                  </a>
                )}

                {provider.website_url && (
                  <a
                    href={provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                  >
                    <GlobeIcon className="w-5 h-5" />
                    <span>Website besuchen</span>
                  </a>
                )}

                {provider.instagram_handle && (
                  <a
                    href={`https://instagram.com/${provider.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                  >
                    <InstagramIcon className="w-5 h-5" />
                    <span>@{provider.instagram_handle}</span>
                  </a>
                )}

                {!provider.phone && !provider.website_url && !provider.instagram_handle && (
                  <p className="text-white/40 text-sm">
                    Keine Kontaktdaten verfügbar
                  </p>
                )}
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Kategorie</span>
                  <span className="text-white">
                    {provider.service_category?.name_de || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Standort</span>
                  <span className="text-white">{provider.city || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Bewertungen</span>
                  <span className="text-white">{provider.total_reviews || 0}</span>
                </div>
                {provider.min_guests && provider.max_guests && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Gästeanzahl</span>
                    <span className="text-white">
                      {provider.min_guests} - {provider.max_guests}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
