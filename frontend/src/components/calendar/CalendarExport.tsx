import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  ExternalLink,
  Loader2,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  exportFullCalendar,
  getBookingsAsCalendarEvents,
  downloadICS,
  generateGoogleCalendarUrl,
  generateICS,
  type CalendarEvent
} from '../../services/calendarSyncService';

// Apple icon component
function AppleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

interface CalendarExportProps {
  className?: string;
}

export function CalendarExport({ className = '' }: CalendarExportProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<CalendarEvent[]>([]);
  const [showBookings, setShowBookings] = useState(false);

  if (!user) return null;

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const icsContent = await exportFullCalendar(user.id);
      downloadICS(icsContent, 'bloghead-kalender.ics');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShowBookings = async () => {
    if (showBookings) {
      setShowBookings(false);
      return;
    }

    try {
      const bookings = await getBookingsAsCalendarEvents(user.id);
      setUpcomingBookings(bookings);
      setShowBookings(true);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleAddToGoogle = (event: CalendarEvent) => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank');
  };

  const handleDownloadSingle = (event: CalendarEvent) => {
    const icsContent = generateICS([event], event.title);
    downloadICS(icsContent, `${event.title.replace(/\s+/g, '-')}.ics`);
  };

  return (
    <div className={`bg-bg-card border border-white/10 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-accent-purple" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Kalender Sync</h3>
          <p className="text-sm text-text-secondary">Exportiere zu Google oder Apple Kalender</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-3">
        {/* Export All */}
        <button
          onClick={handleExportAll}
          disabled={isExporting}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-text-secondary" />
            <div className="text-left">
              <p className="text-white font-medium">Alles exportieren (.ics)</p>
              <p className="text-xs text-text-secondary">Buchungen & Verfügbarkeit</p>
            </div>
          </div>
          {isExporting ? (
            <Loader2 className="w-5 h-5 text-accent-purple animate-spin" />
          ) : exportSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <span className="text-xs text-text-secondary">Download</span>
          )}
        </button>

        {/* Apple Calendar Info */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
          <AppleIcon className="w-5 h-5 text-text-secondary" />
          <div>
            <p className="text-white font-medium text-sm">Apple Kalender</p>
            <p className="text-xs text-text-secondary">
              .ics Datei öffnen → automatisch importiert
            </p>
          </div>
        </div>

        {/* Google Calendar Info */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
          <CalendarDays className="w-5 h-5 text-text-secondary" />
          <div>
            <p className="text-white font-medium text-sm">Google Kalender</p>
            <p className="text-xs text-text-secondary">
              .ics importieren oder einzelne Events hinzufügen
            </p>
          </div>
        </div>
      </div>

      {/* Show Bookings Toggle */}
      <button
        onClick={handleShowBookings}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
      >
        {showBookings ? 'Buchungen ausblenden' : 'Einzelne Buchungen anzeigen'}
      </button>

      {/* Individual Bookings */}
      {showBookings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-2"
        >
          {upcomingBookings.length === 0 ? (
            <p className="text-center text-text-secondary py-4 text-sm">
              Keine bestätigten Buchungen
            </p>
          ) : (
            upcomingBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">{booking.title}</p>
                  <p className="text-xs text-text-secondary">
                    {booking.startDate.toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddToGoogle(booking)}
                    title="Zu Google Kalender"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDownloadSingle(booking)}
                    title="Als .ics herunterladen"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CalendarExport;
