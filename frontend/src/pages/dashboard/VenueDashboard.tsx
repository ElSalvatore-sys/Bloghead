// ============================================
// VENUE DASHBOARD - Owner View
// Dashboard for venue owners to manage their venue
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Edit,
  Eye,
  Star,
  Calendar,
  Image,
  Users,
  TrendingUp,
  ArrowRight,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyVenues } from '@/services/venueService';
import type { Venue } from '@/types/venue';
import { VENUE_TYPE_LABELS } from '@/types/venue';
import { Button } from '@/components/ui';

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-bg-card rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-bg-card rounded-xl h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl h-64" />
        <div className="bg-bg-card rounded-xl h-64" />
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card rounded-xl p-6 border border-white/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-accent-purple/10 rounded-lg">{icon}</div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up'
                ? 'text-green-500'
                : trend === 'down'
                ? 'text-red-500'
                : 'text-text-muted'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
          </div>
        )}
      </div>
      <p className="text-text-muted text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
    </motion.div>
  );
}

// Quick Action Card
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  delay?: number;
}

function QuickActionCard({ title, description, icon, to, delay = 0 }: QuickActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        to={to}
        className="block bg-bg-card rounded-xl p-6 border border-white/5 hover:border-accent-purple/50 transition-colors group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-accent-purple/10 rounded-lg group-hover:bg-accent-purple/20 transition-colors">
            {icon}
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-purple transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-sm">{description}</p>
      </Link>
    </motion.div>
  );
}

export function VenueDashboard() {
  const { user } = useAuth();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's venues
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadVenues();
  }, [user?.id]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const venuesData = await getMyVenues();
      setVenues(venuesData);
    } catch (err) {
      console.error('Failed to load venues:', err);
      setError('Fehler beim Laden Ihrer Locations.');
    } finally {
      setLoading(false);
    }
  };

  // Get primary venue (first one for now)
  const primaryVenue = venues[0];

  // Calculate stats (placeholder - will be real data from analytics in future)
  const stats = {
    views: 247, // Placeholder
    bookings: 12, // Placeholder
    rating: primaryVenue?.rating?.average_rating || 0,
    totalReviews: primaryVenue?.rating?.total_reviews || 0,
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  // No venues - show CTA
  if (venues.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="p-6 bg-accent-purple/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-accent-purple" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Registrieren Sie Ihre Location
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Sie haben noch keine Location registriert. Erstellen Sie jetzt Ihr Profil und
            erreichen Sie tausende von Künstlern und Event-Planern.
          </p>
          <Link to="/venues/register">
            <Button size="lg">
              <MapPin className="w-5 h-5 mr-2" />
              Location registrieren
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Fehler</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button onClick={loadVenues}>Erneut versuchen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">Location Dashboard</h1>
        <p className="text-text-secondary">
          Verwalten Sie Ihre Location und verfolgen Sie Ihre Performance
        </p>
      </motion.div>

      {/* Current Venue Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-accent-purple/10 to-bg-card rounded-xl p-6 border border-white/5 mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {primaryVenue.cover_image ? (
              <img
                src={primaryVenue.cover_image}
                alt={primaryVenue.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-bg-secondary flex items-center justify-center">
                <MapPin className="w-8 h-8 text-text-muted" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-text-primary">{primaryVenue.name}</h2>
              <p className="text-text-secondary">
                {primaryVenue.venue_type && VENUE_TYPE_LABELS[primaryVenue.venue_type]} •{' '}
                {primaryVenue.city || 'Deutschland'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/venues/${primaryVenue.slug}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ansehen
              </Button>
            </Link>
            <Link to={`/venues/${primaryVenue.slug}/edit`}>
              <Button size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Profilaufrufe"
          value={stats.views}
          change="+12%"
          trend="up"
          icon={<Eye className="w-6 h-6 text-accent-purple" />}
        />
        <StatCard
          title="Buchungen"
          value={stats.bookings}
          change="+8%"
          trend="up"
          icon={<Calendar className="w-6 h-6 text-accent-purple" />}
        />
        <StatCard
          title="Durchschnittsbewertung"
          value={stats.rating > 0 ? stats.rating.toFixed(1) : '-'}
          change={stats.totalReviews > 0 ? `${stats.totalReviews} Bewertungen` : 'Keine Bewertungen'}
          trend="neutral"
          icon={<Star className="w-6 h-6 text-accent-purple" />}
        />
        <StatCard
          title="Galeriebilder"
          value={primaryVenue.gallery?.length || 0}
          icon={<Image className="w-6 h-6 text-accent-purple" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Galerie verwalten"
            description="Bilder hinzufügen, entfernen oder neu anordnen"
            icon={<Image className="w-6 h-6 text-accent-purple" />}
            to={`/venues/${primaryVenue.slug}/edit#gallery`}
            delay={0.1}
          />
          <QuickActionCard
            title="Ausstattung bearbeiten"
            description="Equipment und technische Details aktualisieren"
            icon={<Settings className="w-6 h-6 text-accent-purple" />}
            to={`/venues/${primaryVenue.slug}/edit#equipment`}
            delay={0.2}
          />
          <QuickActionCard
            title="Buchungen ansehen"
            description="Aktuelle und vergangene Buchungsanfragen"
            icon={<Calendar className="w-6 h-6 text-accent-purple" />}
            to="/dashboard/bookings"
            delay={0.3}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-card rounded-xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary">Letzte Buchungen</h3>
            <Link
              to="/dashboard/bookings"
              className="text-accent-purple hover:text-accent-purple/80 text-sm font-medium transition-colors"
            >
              Alle anzeigen →
            </Link>
          </div>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">Noch keine Buchungen</p>
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-bg-card rounded-xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary">Letzte Bewertungen</h3>
            <Link
              to={`/venues/${primaryVenue.slug}#reviews`}
              className="text-accent-purple hover:text-accent-purple/80 text-sm font-medium transition-colors"
            >
              Alle anzeigen →
            </Link>
          </div>
          {primaryVenue.reviews && primaryVenue.reviews.length > 0 ? (
            <div className="space-y-4">
              {primaryVenue.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-text-primary font-semibold">
                      {review.reviewer_name || 'Anonym'}
                    </p>
                    <div className="flex gap-1">
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
                  {review.comment && (
                    <p className="text-text-secondary text-sm line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">Noch keine Bewertungen</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default VenueDashboard;
