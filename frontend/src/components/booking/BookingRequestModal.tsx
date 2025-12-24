import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { createBookingRequest } from '../../services/bookingService'
import { useAuth } from '../../contexts/AuthContext'
import { sanitizeInput, sanitizeHTML, sanitizeURL } from '../../lib/security/sanitize'

interface BookingRequestModalProps {
  isOpen: boolean
  onClose: () => void
  artist: {
    id: string
    kuenstlername: string
    jobbezeichnung?: string
    preis_pro_stunde?: number | null
    preis_pro_veranstaltung?: number | null
    profile_image_url?: string
  }
  preSelectedDate?: string | null
}

const EVENT_TYPES = [
  { value: 'hochzeit', label: 'Hochzeit' },
  { value: 'firmenfeier', label: 'Firmenfeier' },
  { value: 'geburtstag', label: 'Geburtstag' },
  { value: 'festival', label: 'Festival' },
  { value: 'club', label: 'Club Event' },
  { value: 'konzert', label: 'Konzert' },
  { value: 'gala', label: 'Gala' },
  { value: 'messe', label: 'Messe' },
  { value: 'privat', label: 'Private Feier' },
  { value: 'other', label: 'Sonstiges' },
]

export function BookingRequestModal({ isOpen, onClose, artist, preSelectedDate }: BookingRequestModalProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state - initialize with preSelectedDate if provided
  const [formData, setFormData] = useState({
    event_type: '',
    event_date: preSelectedDate || '',
    event_time_start: '',
    event_time_end: '',
    event_size: '',
    event_location_name: '',
    event_location_address: '',
    event_location_maps_link: '',
    proposed_budget: '',
    message: '',
    equipment_available: '',
    equipment_needed: '',
    hospitality_unterbringung: false,
    hospitality_verpflegung: false,
    transport_type: '',
  })

  // Update event_date when preSelectedDate changes
  useEffect(() => {
    if (preSelectedDate) {
      setFormData(prev => ({ ...prev, event_date: preSelectedDate }))
    }
  }, [preSelectedDate])

  if (!isOpen) return null

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('Du musst eingeloggt sein, um eine Anfrage zu senden.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Sanitize all text inputs before sending to backend
      const sanitizedLocationName = sanitizeInput(formData.event_location_name)
      const sanitizedLocationAddress = sanitizeInput(formData.event_location_address)
      const sanitizedMapsLink = sanitizeURL(formData.event_location_maps_link)
      const sanitizedMessage = sanitizeHTML(formData.message)
      const sanitizedEquipmentAvailable = sanitizeInput(formData.equipment_available)
      const sanitizedEquipmentNeeded = sanitizeInput(formData.equipment_needed)

      const { error: submitError } = await createBookingRequest({
        artist_id: artist.id,
        requester_id: user.id,
        event_type: formData.event_type || null,
        event_date: formData.event_date,
        event_time_start: formData.event_time_start || null,
        event_time_end: formData.event_time_end || null,
        event_size: formData.event_size ? parseInt(formData.event_size) : null,
        event_location_name: sanitizedLocationName || null,
        event_location_address: sanitizedLocationAddress || null,
        event_location_maps_link: sanitizedMapsLink || null,
        proposed_budget: formData.proposed_budget ? parseFloat(formData.proposed_budget) : null,
        message: sanitizedMessage || null,
        equipment_available: sanitizedEquipmentAvailable || null,
        equipment_needed: sanitizedEquipmentNeeded || null,
        hospitality_unterbringung: formData.hospitality_unterbringung,
        hospitality_verpflegung: formData.hospitality_verpflegung,
        transport_type: formData.transport_type || null,
      })

      if (submitError) {
        setError(submitError.message)
        return
      }

      setSubmitSuccess(true)
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToRequests = () => {
    onClose()
    navigate('/dashboard/requests')
  }

  const resetAndClose = () => {
    setStep(1)
    setSubmitSuccess(false)
    setError(null)
    setFormData({
      event_type: '',
      event_date: '',
      event_time_start: '',
      event_time_end: '',
      event_size: '',
      event_location_name: '',
      event_location_address: '',
      event_location_maps_link: '',
      proposed_budget: '',
      message: '',
      equipment_available: '',
      equipment_needed: '',
      hospitality_unterbringung: false,
      hospitality_verpflegung: false,
      transport_type: '',
    })
    onClose()
  }

  // Success screen
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Anfrage gesendet!</h2>
          <p className="text-white/60 mb-6">
            Deine Buchungsanfrage an <span className="text-white font-medium">{artist.kuenstlername}</span> wurde erfolgreich gesendet. Du wirst benachrichtigt, sobald der Künstler antwortet.
          </p>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={goToRequests}>
              Meine Anfragen ansehen
            </Button>
            <Button variant="ghost" fullWidth onClick={resetAndClose}>
              Schließen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {artist.profile_image_url ? (
                <img
                  src={artist.profile_image_url}
                  alt={artist.kuenstlername}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold text-lg">
                    {artist.kuenstlername.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">Buchungsanfrage</h2>
                <p className="text-white/60 text-sm">{artist.kuenstlername} {artist.jobbezeichnung && `• ${artist.jobbezeichnung}`}</p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="text-white/60 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-purple-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span className={step >= 1 ? 'text-purple-400' : ''}>Event Details</span>
            <span className={step >= 2 ? 'text-purple-400' : ''}>Location & Budget</span>
            <span className={step >= 3 ? 'text-purple-400' : ''}>Anforderungen</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Event-Typ <span className="text-red-400">*</span>
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Bitte auswählen...</option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Event-Datum <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Startzeit
                  </label>
                  <input
                    type="time"
                    name="event_time_start"
                    value={formData.event_time_start}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Endzeit
                  </label>
                  <input
                    type="time"
                    name="event_time_end"
                    value={formData.event_time_end}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Erwartete Gäste
                </label>
                <input
                  type="number"
                  name="event_size"
                  value={formData.event_size}
                  onChange={handleInputChange}
                  placeholder="z.B. 150"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location & Budget */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  name="event_location_name"
                  value={formData.event_location_name}
                  onChange={handleInputChange}
                  placeholder="z.B. Schloss Biebrich"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  name="event_location_address"
                  value={formData.event_location_address}
                  onChange={handleInputChange}
                  placeholder="Straße, PLZ, Stadt"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Google Maps Link
                </label>
                <input
                  type="url"
                  name="event_location_maps_link"
                  value={formData.event_location_maps_link}
                  onChange={handleInputChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Budget (EUR)
                </label>
                <input
                  type="number"
                  name="proposed_budget"
                  value={formData.proposed_budget}
                  onChange={handleInputChange}
                  placeholder="z.B. 1500"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
                {(artist.preis_pro_stunde || artist.preis_pro_veranstaltung) && (
                  <p className="mt-2 text-white/40 text-xs">
                    Preisinfo: {artist.preis_pro_stunde && `${artist.preis_pro_stunde}€/Stunde`}
                    {artist.preis_pro_stunde && artist.preis_pro_veranstaltung && ' • '}
                    {artist.preis_pro_veranstaltung && `${artist.preis_pro_veranstaltung}€/Veranstaltung`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nachricht an den Künstler
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Beschreibe dein Event und was du dir vorstellst..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Vorhandenes Equipment
                </label>
                <textarea
                  name="equipment_available"
                  value={formData.equipment_available}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Welche Technik ist vor Ort vorhanden?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Benötigtes Equipment
                </label>
                <textarea
                  name="equipment_needed"
                  value={formData.equipment_needed}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Was soll der Künstler mitbringen?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-4">
                  Hospitality
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hospitality_unterbringung"
                      checked={formData.hospitality_unterbringung}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <span className="text-white">Unterbringung wird gestellt</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hospitality_verpflegung"
                      checked={formData.hospitality_verpflegung}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <span className="text-white">Verpflegung wird gestellt</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Transport
                </label>
                <select
                  name="transport_type"
                  value={formData.transport_type}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Nicht angegeben</option>
                  <option value="selbst">Künstler reist selbst an</option>
                  <option value="abholung">Abholung wird organisiert</option>
                  <option value="shuttle">Shuttle-Service vorhanden</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Zurück
            </Button>
          ) : (
            <Button variant="ghost" onClick={resetAndClose}>
              Abbrechen
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.event_type || !formData.event_date)}
            >
              Weiter
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wird gesendet...' : 'Anfrage senden'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
