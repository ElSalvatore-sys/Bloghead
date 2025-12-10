import { useState } from 'react'
import {
  EVENT_TYPE_OPTIONS,
  type EventType
} from '../../types/booking'

export interface BookingFormData {
  eventDate: string
  startTime: string
  endTime: string
  eventType: EventType
  location: string
  locationAddress?: string
  notes?: string
  proposedBudget?: number
}

interface BookingFormProps {
  // Initial values
  initialDate?: string | null
  artistName?: string
  artistMinPrice?: number

  // Callbacks
  onSubmit: (data: BookingFormData) => Promise<void>
  onCancel?: () => void

  // State
  loading?: boolean
  error?: string | null
}

export function BookingForm({
  initialDate,
  artistName,
  artistMinPrice,
  onSubmit,
  onCancel,
  loading = false,
  error
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    eventDate: initialDate || '',
    startTime: '20:00',
    endTime: '02:00',
    eventType: 'private_party',
    location: '',
    locationAddress: '',
    notes: '',
    proposedBudget: artistMinPrice || undefined
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.eventDate) {
      errors.eventDate = 'Bitte waehle ein Datum'
    }

    if (!formData.startTime) {
      errors.startTime = 'Bitte gib eine Startzeit an'
    }

    if (!formData.endTime) {
      errors.endTime = 'Bitte gib eine Endzeit an'
    }

    if (!formData.location.trim()) {
      errors.location = 'Bitte gib einen Veranstaltungsort an'
    }

    if (!formData.eventType) {
      errors.eventType = 'Bitte waehle einen Veranstaltungstyp'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await onSubmit(formData)
  }

  // Format date for display
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Artist name header (if provided) */}
      {artistName && (
        <div className="text-center pb-4 border-b border-white/10">
          <p className="text-gray-400 text-sm">Buchungsanfrage fuer</p>
          <h3 className="text-xl font-bold text-white mt-1">{artistName}</h3>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Date field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Veranstaltungsdatum *
        </label>
        {initialDate ? (
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white font-medium">{formatDateDisplay(initialDate)}</p>
            <input type="hidden" name="eventDate" value={initialDate} />
          </div>
        ) : (
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.eventDate ? 'border-red-500' : 'border-white/10'
            }`}
          />
        )}
        {validationErrors.eventDate && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.eventDate}</p>
        )}
      </div>

      {/* Time fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Startzeit *
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.startTime ? 'border-red-500' : 'border-white/10'
            }`}
          />
          {validationErrors.startTime && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Endzeit *
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.endTime ? 'border-red-500' : 'border-white/10'
            }`}
          />
          {validationErrors.endTime && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.endTime}</p>
          )}
        </div>
      </div>

      {/* Event type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Art der Veranstaltung *
        </label>
        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            validationErrors.eventType ? 'border-red-500' : 'border-white/10'
          }`}
        >
          {EVENT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value} className="bg-[#171717]">
              {option.label}
            </option>
          ))}
        </select>
        {validationErrors.eventType && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.eventType}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Veranstaltungsort *
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="z.B. Club XYZ, Musterstadt"
          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            validationErrors.location ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {validationErrors.location && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.location}</p>
        )}
      </div>

      {/* Location address */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Adresse
        </label>
        <input
          type="text"
          name="locationAddress"
          value={formData.locationAddress}
          onChange={handleChange}
          placeholder="Strasse, PLZ Ort"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Budget (EUR)
          {artistMinPrice && (
            <span className="text-gray-500 ml-2">
              (Mindestpreis: {artistMinPrice.toLocaleString('de-DE')} EUR)
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="number"
            name="proposedBudget"
            value={formData.proposedBudget || ''}
            onChange={handleChange}
            placeholder="Dein Budget"
            min={0}
            step={50}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nachricht an den Kuenstler
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Beschreibe deine Veranstaltung, besondere Wuensche, Musikrichtung, etc."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Wird gesendet...</span>
            </>
          ) : (
            <>
              <span>Anfrage senden</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center">
        Der Kuenstler wird deine Anfrage pruefen und sich bei dir melden.
        Du gehst noch keine Verpflichtung ein.
      </p>
    </form>
  )
}

export default BookingForm
