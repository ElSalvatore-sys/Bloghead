// ============================================
// ADMIN VENUES PAGE - Venue Management
// Admin interface for managing all venues
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Download,
  Search,
  X,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Building2,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  TableSkeleton,
} from '@/components/admin/ui';
import { supabase } from '@/lib/supabase';
import type { Venue } from '@/types/venue';
import { VENUE_TYPE_LABELS } from '@/types/venue';
import { exportToCSV, formatDateTimeCSV, type CSVColumn } from '@/utils/csvExport';

export function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    active: 0,
  });

  // Load venues
  const loadVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      // Apply verification filter
      if (filter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (filter === 'unverified') {
        query = query.eq('is_verified', false);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setVenues(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error('Failed to load venues:', err);
      setError('Fehler beim Laden der Locations');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('venues')
        .select('is_verified, is_active');

      if (statsError) throw statsError;

      const total = data?.length || 0;
      const verified = data?.filter((v) => v.is_verified).length || 0;
      const active = data?.filter((v) => v.is_active).length || 0;

      setStats({ total, verified, active });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadVenues();
    loadStats();
  }, [loadVenues, loadStats]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVenues();
  };

  // Toggle verification
  const handleToggleVerification = async (venueId: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('venues')
        .update({ is_verified: !currentStatus })
        .eq('id', venueId);

      if (updateError) throw updateError;

      setSuccessMessage(
        currentStatus ? 'Location-Verifizierung entfernt' : 'Location verifiziert'
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      loadVenues();
      loadStats();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      setError('Fehler beim Aktualisieren des Verifizierungsstatus');
    }
  };

  // Toggle active status
  const handleToggleActive = async (venueId: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('venues')
        .update({ is_active: !currentStatus })
        .eq('id', venueId);

      if (updateError) throw updateError;

      setSuccessMessage(
        currentStatus ? 'Location deaktiviert' : 'Location aktiviert'
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      loadVenues();
      loadStats();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      setError('Fehler beim Aktualisieren des Aktiv-Status');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const columns: CSVColumn<Venue>[] = [
      { key: 'name', label: 'Name' },
      { key: (v) => v.venue_type ? VENUE_TYPE_LABELS[v.venue_type] : '', label: 'Typ' },
      { key: (v) => v.city || '', label: 'Stadt' },
      { key: (v) => v.address || '', label: 'Adresse' },
      { key: (v) => v.postal_code || '', label: 'PLZ' },
      { key: (v) => v.capacity_max || '', label: 'Kapazität' },
      { key: 'is_verified', label: 'Verifiziert' },
      { key: 'is_active', label: 'Aktiv' },
      { key: (v) => v.email || '', label: 'E-Mail' },
      { key: (v) => v.phone || '', label: 'Telefon' },
      { key: (v) => formatDateTimeCSV(v.created_at), label: 'Erstellt' },
    ];
    exportToCSV(venues, 'locations', columns);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AdminPageHeader
        icon={MapPin}
        title="Location-Verwaltung"
        description={`${total} Location${total !== 1 ? 's' : ''} gesamt`}
        actions={
          <AdminButton
            variant="secondary"
            icon={Download}
            onClick={handleExportCSV}
            disabled={venues.length === 0}
          >
            CSV Export
          </AdminButton>
        }
      />

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard hover={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Gesamt</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-purple" />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard hover={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Verifiziert</p>
                <p className="text-3xl font-bold text-white">{stats.verified}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard hover={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Aktiv</p>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search and Filter */}
      <AdminCard hover={false}>
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nach Name oder Stadt suchen..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'verified' | 'unverified')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-purple"
            >
              <option value="all">Alle</option>
              <option value="verified">Nur Verifiziert</option>
              <option value="unverified">Nur Unverifiziert</option>
            </select>

            <AdminButton type="submit">
              Suchen
            </AdminButton>
          </form>

          {/* Table */}
          {loading ? (
            <TableSkeleton rows={10} cols={7} />
          ) : venues.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Keine Locations gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Typ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Stadt</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Kapazität</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Erstellt</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                {venues.map((venue) => (
                  <tr key={venue.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-accent-purple" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{venue.name}</p>
                          {venue.tagline && (
                            <p className="text-xs text-gray-400">{venue.tagline}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-300">
                        {venue.venue_type ? VENUE_TYPE_LABELS[venue.venue_type] : '-'}
                      </span>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-300">{venue.city || '-'}</span>
                    </td>

                    {/* Capacity */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-300">
                        {venue.capacity_max ? `bis ${venue.capacity_max}` : '-'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <AdminBadge variant={venue.is_verified ? 'success' : 'warning'}>
                          {venue.is_verified ? 'Verifiziert' : 'Unverifiziert'}
                        </AdminBadge>
                        <AdminBadge variant={venue.is_active ? 'info' : 'error'}>
                          {venue.is_active ? 'Aktiv' : 'Inaktiv'}
                        </AdminBadge>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-400">
                        {new Date(venue.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <a
                          href={`/venues/${venue.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ansehen"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>

                        {/* Toggle Verification */}
                        <button
                          onClick={() => handleToggleVerification(venue.id, venue.is_verified)}
                          className={`p-2 hover:bg-gray-700 rounded-lg transition-colors ${
                            venue.is_verified ? 'text-green-500' : 'text-gray-400'
                          }`}
                          title={
                            venue.is_verified
                              ? 'Verifizierung entfernen'
                              : 'Verifizieren'
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(venue.id, venue.is_active)}
                          className={`p-2 hover:bg-gray-700 rounded-lg transition-colors ${
                            venue.is_active ? 'text-blue-500' : 'text-gray-400'
                          }`}
                          title={venue.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {venue.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </AdminCard>
    </motion.div>
  );
}

export default AdminVenuesPage;
