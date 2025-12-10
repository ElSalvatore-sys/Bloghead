import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { BookingForm, type BookingFormData } from './BookingForm'
import { createBookingRequest } from '../../services/bookingService'
import type { CalendarDay } from '../../types/booking'

interface ArtistInfo {
  id: string
  userId?: string
  user_id?: string
  kuenstlername: string
  jobbezeichnung?: string | null
  profileImageUrl?: string | null
  profile_image_url?: string | null
  preis_pro_stunde?: number | null
  preis_pro_veranstaltung?: number | null
  star_rating?: number | null
}

interface ArtistBookingModalProps {
  isOpen: boolean
  onClose: () => void
  artist: ArtistInfo
  // New style: provide availability and handlers
  availability?: CalendarDay[]
  availabilityLoading?: boolean
  onMonthChange?: (year: number, month: number) => void
  currentMonth?: number
  currentYear?: number
  // Alternative: just provide preSelectedDate for simple usage
  preSelectedDate?: string | null
}

type BookingStep = 'calendar' | 'form' | 'confirmation'

export function ArtistBookingModal({
  isOpen,
  onClose,
  artist,
  availability = [],
  availabilityLoading = false,
  onMonthChange,
  currentMonth: propCurrentMonth,
  currentYear: propCurrentYear,
  preSelectedDate
}: ArtistBookingModalProps) {
  const { user } = useAuth()

  // Internal state for month/year if not provided
  const now = new Date()
  const [internalMonth, setInternalMonth] = useState(now.getMonth())
  const [internalYear, setInternalYear] = useState(now.getFullYear())

  // Use props or internal state
  const currentMonth = propCurrentMonth ?? internalMonth
  const currentYear = propCurrentYear ?? internalYear

  const handleMonthChange = (year: number, month: number) => {
    if (onMonthChange) {
      onMonthChange(year, month)
    } else {
      setInternalYear(year)
      setInternalMonth(month)
    }
  }

  // Get profile image URL (handle both naming conventions)
  const profileImageUrl = artist.profileImageUrl || artist.profile_image_url

  // Get min price
  const artistMinPrice = artist.preis_pro_veranstaltung ?? artist.preis_pro_stunde ?? undefined

  const [step, setStep] = useState<BookingStep>('calendar')
  const [selectedDate, setSelectedDate] = useState<string | null>(preSelectedDate || null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [, setBookingRequestId] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // If preSelectedDate is provided, skip to form step
      if (preSelectedDate) {
        setStep('form')
        setSelectedDate(preSelectedDate)
      } else {
        setStep('calendar')
        setSelectedDate(null)
      }
      setSubmitError(null)
      setBookingRequestId(null)
    }
  }, [isOpen, preSelectedDate])

  // Handle date selection
  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setStep('form')
  }

  // Handle form submission
  const handleSubmitBooking = async (formData: BookingFormData) => {
    if (!user || !selectedDate) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const { data, error } = await createBookingRequest({
        artist_id: artist.id,
        requester_id: user.id,
        event_date: selectedDate,
        event_time_start: formData.startTime,
        event_time_end: formData.endTime,
        event_type: formData.eventType,
        event_location_name: formData.location,
        event_location_address: formData.locationAddress,
        proposed_budget: formData.proposedBudget,
        message: formData.notes
      })

      if (error) throw error

      setBookingRequestId(data?.id || null)
      setStep('confirmation')
    } catch (err) {
      console.error('Booking request error:', err)
      setSubmitError('Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    if (step === 'form') {
      setStep('calendar')
    } else if (step === 'confirmation') {
      onClose()
    }
  }

  // Get step number for progress indicator
  const getStepNumber = () => {
    switch (step) {
      case 'calendar':
        return 1
      case 'form':
        return 2
      case 'confirmation':
        return 3
    }
  }

  if (!isOpen) return null

  // Login required state
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Anmeldung erforderlich</h2>
          <p className="text-gray-400 mb-6">
            Melde dich an, um eine Buchungsanfrage zu senden.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <a
              href="/login"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] hover:opacity-90 text-white font-medium rounded-xl transition-opacity text-center"
            >
              Anmelden
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            {/* Artist mini profile */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={artist.kuenstlername}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {artist.kuenstlername.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{artist.kuenstlername} buchen</h2>
              {artist.jobbezeichnung && (
                <p className="text-gray-400 text-sm">{artist.jobbezeichnung}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Schliessen"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['Datum waehlen', 'Details eingeben', 'Bestaetigung'].map((label, index) => {
              const stepNum = index + 1
              const isActive = getStepNumber() === stepNum
              const isCompleted = getStepNumber() > stepNum

              return (
                <div key={label} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span className={`text-sm hidden sm:block ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-white/10'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Calendar */}
          {step === 'calendar' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Waehle ein Datum</h3>
                <p className="text-gray-400">
                  Gruen markierte Tage sind verfuegbar fuer Buchungen
                </p>
              </div>

              <AvailabilityCalendar
                availability={availability}
                loading={availabilityLoading}
                mode="view"
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onMonthChange={handleMonthChange}
                disablePastDates={true}
              />

              {/* Price info */}
              {(artist.preis_pro_stunde || artist.preis_pro_veranstaltung) && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Preisinfo</h4>
                  <div className="flex flex-wrap gap-4">
                    {artist.preis_pro_stunde && (
                      <div>
                        <span className="text-white font-medium">{artist.preis_pro_stunde.toLocaleString('de-DE')} EUR</span>
                        <span className="text-gray-400 text-sm ml-1">/ Stunde</span>
                      </div>
                    )}
                    {artist.preis_pro_veranstaltung && (
                      <div>
                        <span className="text-white font-medium">{artist.preis_pro_veranstaltung.toLocaleString('de-DE')} EUR</span>
                        <span className="text-gray-400 text-sm ml-1">/ Veranstaltung</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Form */}
          {step === 'form' && (
            <div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Zurueck zur Datumsauswahl</span>
              </button>

              <BookingForm
                initialDate={selectedDate}
                artistName={artist.kuenstlername}
                artistMinPrice={artistMinPrice}
                onSubmit={handleSubmitBooking}
                onCancel={handleBack}
                loading={submitting}
                error={submitError}
              />
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Anfrage gesendet!</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Deine Buchungsanfrage wurde erfolgreich an {artist.kuenstlername} gesendet.
                Du erhaeltst eine Benachrichtigung, sobald der Kuenstler antwortet.
              </p>

              {/* Summary */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 max-w-sm mx-auto mb-8 text-left">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Zusammenfassung</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kuenstler</span>
                    <span className="text-white">{artist.kuenstlername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Datum</span>
                    <span className="text-white">
                      {selectedDate && new Date(selectedDate).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-yellow-400">Ausstehend</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <a
                  href="/dashboard/requests"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Meine Anfragen
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] hover:opacity-90 text-white font-medium rounded-xl transition-opacity"
                >
                  Fertig
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArtistBookingModal
