// ============================================
// VENUE EDIT PAGE - Owner Edit Interface
// Tabbed editing interface for venue owners
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  ArrowLeft,
  Info,
  Image as ImageIcon,
  Settings,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { getVenueBySlug, updateVenue } from '@/services/venueService';
import type { Venue, VenueUpdateInput, VenueType, PriceRange } from '@/types/venue';
import { VENUE_TYPE_LABELS, PRICE_RANGE_LABELS } from '@/types/venue';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

const TABS = [
  { id: 'basic', label: 'Grundinformationen', icon: Info },
  { id: 'gallery', label: 'Galerie', icon: ImageIcon },
  { id: 'details', label: 'Details', icon: Settings },
  { id: 'hours', label: 'Öffnungszeiten', icon: Calendar },
];

// Loading skeleton
function EditPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 w-64 bg-bg-card rounded mb-6" />
      <div className="flex gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-32 bg-bg-card rounded" />
        ))}
      </div>
      <div className="bg-bg-card rounded-xl h-96" />
    </div>
  );
}

export function VenueEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('basic');
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VenueUpdateInput>({});
  const [hasChanges, setHasChanges] = useState(false);

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

      const venueData = await getVenueBySlug(slug);

      if (!venueData) {
        setError('Location nicht gefunden.');
        return;
      }

      // Check if user is owner
      if (user && venueData.owner_id !== user.id) {
        setError('Sie haben keine Berechtigung, diese Location zu bearbeiten.');
        return;
      }

      setVenue(venueData);
      // Initialize form data with current venue data
      setFormData({
        name: venueData.name,
        venue_type: venueData.venue_type,
        city: venueData.city,
        address: venueData.address,
        postal_code: venueData.postal_code,
        capacity_min: venueData.capacity_min,
        capacity_max: venueData.capacity_max,
        price_range: venueData.price_range,
        description: venueData.description,
        tagline: venueData.tagline,
        is_active: venueData.is_active,
      });
    } catch (err) {
      console.error('Failed to load venue:', err);
      setError('Fehler beim Laden der Location.');
    } finally {
      setLoading(false);
    }
  };

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!venue) return;

    try {
      setSaving(true);
      await updateVenue(venue.id, formData);
      setHasChanges(false);
      alert('Änderungen gespeichert!');
      // Reload venue data
      await loadVenue();
    } catch (err) {
      console.error('Failed to save changes:', err);
      alert('Fehler beim Speichern der Änderungen.');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return <EditPageSkeleton />;
  }

  // Error state
  if (error || !venue) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Fehler</h2>
          <p className="text-text-secondary mb-6">{error || 'Location nicht gefunden'}</p>
          <Button onClick={() => navigate('/dashboard/venue')}>Zurück zum Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/venues/${venue.slug}`)}
              className="p-2 hover:bg-bg-card rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-text-secondary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{venue.name} bearbeiten</h1>
              <p className="text-text-secondary">Aktualisieren Sie Ihre Location</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent-purple text-white'
                    : 'bg-bg-card text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-bg-card rounded-xl p-6 md:p-8 border border-white/5"
        >
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Grundinformationen</h2>

              {/* Name */}
              <div>
                <label className="block text-text-secondary mb-2">Location Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                />
              </div>

              {/* Venue Type */}
              <div>
                <label className="block text-text-secondary mb-2">Typ</label>
                <select
                  value={formData.venue_type || ''}
                  onChange={(e) => updateFormData('venue_type', e.target.value as VenueType)}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                >
                  <option value="">Bitte wählen</option>
                  {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-text-secondary mb-2">Stadt</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                />
              </div>

              {/* Address & Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-text-secondary mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-2">PLZ</label>
                  <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => updateFormData('postal_code', e.target.value)}
                    className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-text-secondary mb-2">Slogan</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => updateFormData('tagline', e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                />
                <p className="text-text-muted text-xs mt-1">
                  {formData.tagline?.length || 0}/100 Zeichen
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                <div>
                  <p className="text-text-primary font-medium">Location aktiv</p>
                  <p className="text-text-muted text-sm">
                    Deaktivieren Sie Ihre Location, um sie vorübergehend zu verbergen
                  </p>
                </div>
                <label className="relative inline-block w-14 h-7">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => updateFormData('is_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-bg-primary rounded-full peer-checked:bg-accent-purple transition-colors cursor-pointer" />
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7" />
                </label>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Galerie verwalten</h2>
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                <ImageIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary mb-2">Galeriefunktion</p>
                <p className="text-text-muted text-sm">
                  Wird in einer zukünftigen Version implementiert
                </p>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Details</h2>

              {/* Description */}
              <div>
                <label className="block text-text-secondary mb-2">Beschreibung</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors resize-none"
                />
              </div>

              {/* Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary mb-2">Min. Kapazität</label>
                  <input
                    type="number"
                    value={formData.capacity_min || ''}
                    onChange={(e) =>
                      updateFormData('capacity_min', e.target.value ? Number(e.target.value) : undefined)
                    }
                    min="0"
                    className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-2">Max. Kapazität</label>
                  <input
                    type="number"
                    value={formData.capacity_max || ''}
                    onChange={(e) =>
                      updateFormData('capacity_max', e.target.value ? Number(e.target.value) : undefined)
                    }
                    min="0"
                    className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-text-secondary mb-2">Preisklasse</label>
                <select
                  value={formData.price_range || ''}
                  onChange={(e) => updateFormData('price_range', e.target.value as PriceRange)}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                >
                  <option value="">Bitte wählen</option>
                  {Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Öffnungszeiten</h2>
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary mb-2">Öffnungszeiten-Editor</p>
                <p className="text-text-muted text-sm">
                  Wird in einer zukünftigen Version implementiert
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Reminder */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-accent-purple text-white px-6 py-4 rounded-lg shadow-lg"
          >
            <p className="font-medium">Sie haben nicht gespeicherte Änderungen</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-2 w-full px-4 py-2 bg-white text-accent-purple rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {saving ? 'Wird gespeichert...' : 'Jetzt speichern'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default VenueEditPage;
