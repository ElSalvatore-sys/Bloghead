// ============================================
// VENUE BOOKING MODAL - Artist Booking Request
// Modal for artists to request venue bookings
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Venue } from '@/types/venue';

export interface VenueBookingRequest {
  venue_id: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  expected_attendance: number;
  event_type: string;
  message: string;
}

interface VenueBookingModalProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VenueBookingRequest) => Promise<void>;
}

export function VenueBookingModal({
  venue,
  isOpen,
  onClose,
  onSubmit,
}: VenueBookingModalProps) {
  const [formData, setFormData] = useState<Partial<VenueBookingRequest>>({
    venue_id: venue.id,
    event_date: '',
    start_time: '',
    end_time: '',
    expected_attendance: undefined,
    event_type: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update field
  const updateField = (field: keyof VenueBookingRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.event_date) {
      newErrors.event_date = 'Bitte wählen Sie ein Datum';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Bitte wählen Sie eine Startzeit';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Bitte wählen Sie eine Endzeit';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Endzeit muss nach der Startzeit liegen';
    }

    if (!formData.expected_attendance || formData.expected_attendance <= 0) {
      newErrors.expected_attendance = 'Bitte geben Sie die erwartete Teilnehmerzahl an';
    }

    if (
      venue.capacity_max &&
      formData.expected_attendance &&
      formData.expected_attendance > venue.capacity_max
    ) {
      newErrors.expected_attendance = `Maximale Kapazität: ${venue.capacity_max} Personen`;
    }

    if (!formData.event_type) {
      newErrors.event_type = 'Bitte wählen Sie eine Veranstaltungsart';
    }

    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = 'Bitte geben Sie eine aussagekräftige Nachricht ein (mind. 10 Zeichen)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData as VenueBookingRequest);
      // Reset form and close modal on success
      setFormData({
        venue_id: venue.id,
        event_date: '',
        start_time: '',
        end_time: '',
        expected_attendance: undefined,
        event_type: '',
        message: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to submit booking request:', error);
      setErrors({
        submit: 'Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">Buchungsanfrage</h2>
                  <p className="text-text-secondary text-sm mt-1">{venue.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-5">
                  {/* Event Date */}
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Veranstaltungsdatum *
                    </label>
                    <input
                      type="date"
                      value={formData.event_date || ''}
                      onChange={(e) => updateField('event_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple transition-colors ${
                        errors.event_date ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {errors.event_date && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.event_date}
                      </p>
                    )}
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Startzeit *
                      </label>
                      <input
                        type="time"
                        value={formData.start_time || ''}
                        onChange={(e) => updateField('start_time', e.target.value)}
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple transition-colors ${
                          errors.start_time ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.start_time && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.start_time}
                        </p>
                      )}
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Endzeit *
                      </label>
                      <input
                        type="time"
                        value={formData.end_time || ''}
                        onChange={(e) => updateField('end_time', e.target.value)}
                        className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple transition-colors ${
                          errors.end_time ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.end_time && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.end_time}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expected Attendance */}
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Erwartete Teilnehmerzahl *
                      {venue.capacity_max && (
                        <span className="text-text-muted ml-2">(Max. {venue.capacity_max})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={formData.expected_attendance || ''}
                      onChange={(e) => updateField('expected_attendance', parseInt(e.target.value) || 0)}
                      min="1"
                      max={venue.capacity_max}
                      placeholder="z.B. 100"
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple transition-colors ${
                        errors.expected_attendance ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {errors.expected_attendance && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.expected_attendance}
                      </p>
                    )}
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Veranstaltungsart *
                    </label>
                    <select
                      value={formData.event_type || ''}
                      onChange={(e) => updateField('event_type', e.target.value)}
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple transition-colors ${
                        errors.event_type ? 'border-red-500' : 'border-white/10'
                      }`}
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="concert">Konzert</option>
                      <option value="dj_set">DJ Set</option>
                      <option value="party">Party</option>
                      <option value="festival">Festival</option>
                      <option value="private">Private Veranstaltung</option>
                      <option value="corporate">Firmenveranstaltung</option>
                      <option value="wedding">Hochzeit</option>
                      <option value="other">Sonstiges</option>
                    </select>
                    {errors.event_type && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.event_type}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">
                      Nachricht *
                    </label>
                    <textarea
                      value={formData.message || ''}
                      onChange={(e) => updateField('message', e.target.value)}
                      rows={5}
                      placeholder="Beschreiben Sie Ihre Veranstaltung, Ihre Wünsche und besondere Anforderungen..."
                      className={`w-full px-4 py-3 bg-bg-secondary border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple transition-colors resize-none ${
                        errors.message ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.message}
                      </p>
                    )}
                    <p className="text-text-muted text-xs mt-1">
                      {formData.message?.length || 0} Zeichen (mind. 10)
                    </p>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.submit}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default VenueBookingModal;
