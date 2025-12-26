// ============================================
// VENUE PROFILE PAGE - Public View
// Complete venue profile for potential bookers
// ============================================

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  Share2,
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Star,
  ChevronRight,
} from 'lucide-react';
import {
  VenueEquipmentList,
  VenueRoomCard,
  VenueHoursDisplay,
} from '../components/venues';
import {
  getVenueProfile,
  toggleVenueFavorite,
  isVenueFavorited,
} from '../services/venueService';
import type { Venue } from '../types/venue';
import { VENUE_TYPE_LABELS, PRICE_RANGE_LABELS } from '../types/venue';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';

// Loading skeleton
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg-primary pb-24 animate-pulse">
      {/* Cover skeleton */}
      <div className="h-72 md:h-96 bg-bg-secondary" />

      {/* Content skeleton */}
      <div className="container mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-bg-card rounded-xl h-64" />
            <div className="bg-bg-card rounded-xl h-96" />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-bg-card rounded-xl h-screen" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Share icon component
function ShareIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="38" cy="10" r="6" stroke="currentColor" strokeWidth="3" />
      <circle cx="10" cy="24" r="6" stroke="currentColor" strokeWidth="3" />
      <circle cx="38" cy="38" r="6" stroke="currentColor" strokeWidth="3" />
      <path d="M15 21l18-9M15 27l18 9" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export function VenueProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);

  // Scroll to top on page load
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load venue data
  useEffect(() => {
    if (!slug) {
      setError('Keine Location gefunden.');
      setLoading(false);
      return;
    }

    loadVenue();
  }, [slug]);

  const loadVenue = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const venueData = await getVenueProfile(slug);

      if (!venueData) {
        setError('Location nicht gefunden.');
        return;
      }

      setVenue(venueData);

      // Check if favorited
      if (user) {
        const favorited = await isVenueFavorited(venueData.id);
        setIsFavorited(favorited);
      }
    } catch (err) {
      console.error('Failed to load venue:', err);
      setError('Fehler beim Laden der Location.');
    } finally {
      setLoading(false);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user) {
      // TODO: Show login modal
      alert('Bitte melden Sie sich an, um Favoriten zu speichern.');
      return;
    }

    if (!venue) return;

    try {
      setLoadingFavorite(true);
      const newFavoritedState = await toggleVenueFavorite(venue.id);
      setIsFavorited(newFavoritedState);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      alert('Fehler beim Speichern des Favoriten.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    const title = venue?.name || 'Location';
    const text = venue?.tagline || 'Schau dir diese Location an!';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link in Zwischenablage kopiert!');
    }
  };

  // Loading state
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (error || !venue) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{error || 'Location nicht gefunden'}</h1>
          <Button onClick={() => navigate('/venues')}>Zurück zur Übersicht</Button>
        </div>
      </div>
    );
  }

  const gallery = venue.gallery || [];
  const currentGalleryImage = gallery[selectedGalleryIndex];

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Hero Section */}
      <section className="relative h-72 md:h-96 bg-bg-secondary overflow-hidden">
        {/* Cover Image */}
        {venue.cover_image ? (
          <img
            src={venue.cover_image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-purple/20 to-bg-secondary flex items-center justify-center">
            <MapPin className="w-24 h-24 text-text-muted" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />

        {/* Back Button */}
        <Link
          to="/venues"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Zurück</span>
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
            aria-label="Teilen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleFavoriteToggle}
            disabled={loadingFavorite}
            className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors disabled:opacity-50"
            aria-label="Favorit"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Venue Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card rounded-xl p-6 border border-white/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                    {venue.name}
                  </h1>
                  {venue.tagline && (
                    <p className="text-lg text-text-secondary">{venue.tagline}</p>
                  )}
                </div>

                {venue.is_verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-accent-purple/10 rounded-full">
                    <CheckCircle className="w-4 h-4 text-accent-purple" />
                    <span className="text-accent-purple text-sm font-medium">Verifiziert</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-text-secondary">
                {venue.venue_type && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{VENUE_TYPE_LABELS[venue.venue_type]}</span>
                  </div>
                )}

                {venue.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{venue.city}</span>
                  </div>
                )}

                {(venue.capacity_min || venue.capacity_max) && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>
                      {venue.capacity_min && venue.capacity_max
                        ? `${venue.capacity_min} - ${venue.capacity_max} Personen`
                        : venue.capacity_max
                        ? `bis ${venue.capacity_max} Personen`
                        : `ab ${venue.capacity_min} Personen`}
                    </span>
                  </div>
                )}

                {venue.price_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span>{PRICE_RANGE_LABELS[venue.price_range]}</span>
                  </div>
                )}

                {venue.rating && venue.rating.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span>
                      {venue.rating.average_rating.toFixed(1)} ({venue.rating.total_reviews})
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Photo Gallery */}
            {gallery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-bg-card rounded-xl overflow-hidden border border-white/5"
              >
                {/* Main Image */}
                <div className="relative aspect-video bg-bg-secondary">
                  <img
                    src={currentGalleryImage?.image_url || ''}
                    alt={currentGalleryImage?.caption || venue.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Navigation Arrows */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedGalleryIndex(
                            selectedGalleryIndex === 0
                              ? gallery.length - 1
                              : selectedGalleryIndex - 1
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          setSelectedGalleryIndex(
                            selectedGalleryIndex === gallery.length - 1
                              ? 0
                              : selectedGalleryIndex + 1
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {gallery.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {gallery.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedGalleryIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedGalleryIndex
                            ? 'border-accent-purple'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={image.caption || `Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* About Section */}
            {venue.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-bg-card rounded-xl p-6 border border-white/5"
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Über die Location</h2>
                <p className="text-text-secondary whitespace-pre-line">{venue.description}</p>
              </motion.div>
            )}

            {/* Equipment */}
            {venue.equipment && venue.equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Ausstattung</h2>
                <VenueEquipmentList equipment={venue.equipment} showPricing={true} />
              </motion.div>
            )}

            {/* Rooms & Spaces */}
            {venue.rooms && venue.rooms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-text-primary">Räume & Bereiche</h2>
                {venue.rooms.map((room) => (
                  <VenueRoomCard key={room.id} room={room} />
                ))}
              </motion.div>
            )}

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-bg-card rounded-xl p-6 border border-white/5"
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Annehmlichkeiten</h2>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-bg-secondary rounded-full text-text-secondary"
                    >
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            {venue.reviews && venue.reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-bg-card rounded-xl p-6 border border-white/5"
              >
                <h2 className="text-2xl font-bold text-text-primary mb-6">Bewertungen</h2>

                {/* Rating Summary */}
                {venue.rating && (
                  <div className="mb-6 p-4 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl font-bold text-text-primary">
                        {venue.rating.average_rating.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(venue.rating!.average_rating)
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-text-secondary text-sm">
                          {venue.rating.total_reviews} Bewertung{venue.rating.total_reviews !== 1 ? 'en' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Category Ratings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-text-muted text-sm mb-1">Kommunikation</p>
                        <p className="text-text-primary font-semibold">
                          {venue.rating.avg_communication_rating?.toFixed(1) || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">Gastfreundschaft</p>
                        <p className="text-text-primary font-semibold">
                          {venue.rating.avg_hospitality_rating?.toFixed(1) || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">Ausstattung</p>
                        <p className="text-text-primary font-semibold">
                          {venue.rating.avg_equipment_rating?.toFixed(1) || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted text-sm mb-1">Ambiente</p>
                        <p className="text-text-primary font-semibold">
                          {venue.rating.avg_ambience_rating?.toFixed(1) || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {venue.reviews.map((review) => (
                    <div key={review.id} className="border-b border-white/5 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-text-primary font-semibold">
                            {review.reviewer_name || 'Anonym'}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-text-muted text-sm">
                          {new Date(review.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-text-secondary text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Opening Hours */}
            {venue.hours && venue.hours.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-text-primary mb-4">Öffnungszeiten</h3>
                <VenueHoursDisplay hours={venue.hours} compact={false} />
              </motion.div>
            )}

            {/* Staff Contacts */}
            {venue.staff && venue.staff.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-bg-card rounded-xl p-6 border border-white/5"
              >
                <h3 className="text-xl font-bold text-text-primary mb-4">Ansprechpartner</h3>
                <div className="space-y-4">
                  {venue.staff.map((member, index) => (
                    <div key={index} className="border-b border-white/5 pb-4 last:border-0">
                      <p className="text-text-primary font-semibold">{member.name}</p>
                      <p className="text-text-muted text-sm mb-2">{member.role}</p>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-accent-purple hover:text-accent-purple/80 text-sm mb-1 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-2 text-accent-purple hover:text-accent-purple/80 text-sm transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{member.phone}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <Button
                onClick={() => {
                  // TODO: Open booking flow
                  alert('Booking flow coming soon!');
                }}
                className="w-full"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Location anfragen
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VenueProfilePage;
