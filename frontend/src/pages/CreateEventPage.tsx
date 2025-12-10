import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createEvent } from '../services/eventService'
import { Button } from '../components/ui'

// Step types
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

// Icons
function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const stepLabels = ['Genre', 'Artists', 'Venue', 'Catering', 'Sound', 'Extras']

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={stepNum} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-200
                  ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-accent-purple text-white'
                      : 'bg-white/10 text-white/40'}
                `}
              >
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : stepNum}
              </div>
              <span className={`text-xs mt-1 ${isCurrent ? 'text-white' : 'text-white/40'}`}>
                {stepLabels[i]}
              </span>
            </div>
            {stepNum < totalSteps && (
              <div
                className={`w-8 h-0.5 mx-1 ${stepNum < currentStep ? 'bg-green-500' : 'bg-white/10'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Event data interface
interface EventData {
  // Step 1: Genre
  eventType: string
  eventName: string
  eventDate: string
  startTime: string
  endTime: string
  expectedGuests: number

  // Step 2: Artists
  selectedArtists: string[]
  artistBudget: number

  // Step 3: Venue
  venueName: string
  venueAddress: string
  venueCity: string
  venuePostalCode: string
  isIndoor: boolean
  isOutdoor: boolean

  // Step 4: Catering
  cateringNeeded: boolean
  cateringType: string
  cateringBudget: number
  dietaryRestrictions: string[]

  // Step 5: Sound & Light
  soundNeeded: boolean
  lightNeeded: boolean
  techBudget: number
  techNotes: string

  // Step 6: Extras
  photographerNeeded: boolean
  videographerNeeded: boolean
  securityNeeded: boolean
  decorationNeeded: boolean
  extraNotes: string
}

const initialEventData: EventData = {
  eventType: '',
  eventName: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  expectedGuests: 0,
  selectedArtists: [],
  artistBudget: 0,
  venueName: '',
  venueAddress: '',
  venueCity: '',
  venuePostalCode: '',
  isIndoor: true,
  isOutdoor: false,
  cateringNeeded: false,
  cateringType: '',
  cateringBudget: 0,
  dietaryRestrictions: [],
  soundNeeded: false,
  lightNeeded: false,
  techBudget: 0,
  techNotes: '',
  photographerNeeded: false,
  videographerNeeded: false,
  securityNeeded: false,
  decorationNeeded: false,
  extraNotes: '',
}

// Event types
const eventTypes = [
  { id: 'wedding', label: 'Hochzeit', icon: '💒' },
  { id: 'corporate', label: 'Firmenfeier', icon: '🏢' },
  { id: 'birthday', label: 'Geburtstag', icon: '🎂' },
  { id: 'concert', label: 'Konzert', icon: '🎵' },
  { id: 'festival', label: 'Festival', icon: '🎪' },
  { id: 'party', label: 'Party', icon: '🎉' },
  { id: 'exhibition', label: 'Messe', icon: '🎭' },
  { id: 'other', label: 'Sonstiges', icon: '📅' },
]

// Catering types
const cateringTypes = [
  { id: 'buffet', label: 'Buffet' },
  { id: 'menu', label: 'Menü' },
  { id: 'fingerfood', label: 'Fingerfood' },
  { id: 'cocktail', label: 'Cocktail-Empfang' },
]

// Dietary options
const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarisch' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Koscher' },
  { id: 'glutenfree', label: 'Glutenfrei' },
]

export function CreateEventPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [eventData, setEventData] = useState<EventData>(initialEventData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateEventData = (updates: Partial<EventData>) => {
    setEventData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as WizardStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep)
    } else {
      navigate(-1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('Nicht angemeldet')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const eventPayload = {
        organizer_id: user.id,
        title: eventData.eventName,
        event_type: eventData.eventType,
        event_date: eventData.eventDate,
        start_time: eventData.startTime,
        end_time: eventData.endTime || undefined,
        venue_name: eventData.venueName || undefined,
        address: eventData.venueAddress || undefined,
        city: eventData.venueCity,
        postal_code: eventData.venuePostalCode || undefined,
        country: 'Deutschland',
        is_indoor: eventData.isIndoor,
        is_outdoor: eventData.isOutdoor,
        expected_guests: eventData.expectedGuests || undefined,
        status: 'draft' as const,
        is_public: false,
        description: eventData.extraNotes || '',
      }

      const { error: createError } = await createEvent(eventPayload)

      if (createError) {
        setError('Event konnte nicht erstellt werden')
        console.error('Create event error:', createError)
      } else {
        navigate('/dashboard/my-events')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setSaving(false)
    }
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Genre data={eventData} onUpdate={updateEventData} />
      case 2:
        return <Step2Artists data={eventData} onUpdate={updateEventData} />
      case 3:
        return <Step3Venue data={eventData} onUpdate={updateEventData} />
      case 4:
        return <Step4Catering data={eventData} onUpdate={updateEventData} />
      case 5:
        return <Step5Sound data={eventData} onUpdate={updateEventData} />
      case 6:
        return <Step6Extras data={eventData} onUpdate={updateEventData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl text-white text-center mb-2">
          Event erstellen
        </h1>
        <p className="text-white/60 text-center mb-8">
          Schritt {currentStep} von 6
        </p>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={6} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-bg-card rounded-2xl border border-white/10 p-6 md:p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-8"
          >
            Zurück
          </Button>

          {currentStep < 6 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="px-8"
            >
              Weiter
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={saving}
              className="px-8"
            >
              {saving ? 'Wird erstellt...' : 'Event erstellen'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step 1: Genre & Basic Info
function Step1Genre({ data, onUpdate }: { data: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Was für ein Event planst du?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onUpdate({ eventType: type.id })}
              className={`
                p-4 rounded-xl border text-center transition-all
                ${data.eventType === type.id
                  ? 'border-accent-purple bg-accent-purple/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'}
              `}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Event-Name</label>
        <input
          type="text"
          value={data.eventName}
          onChange={(e) => onUpdate({ eventName: e.target.value })}
          placeholder="z.B. Sommerfest 2024"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Datum</label>
          <input
            type="date"
            value={data.eventDate}
            onChange={(e) => onUpdate({ eventDate: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Erwartete Gäste</label>
          <input
            type="number"
            value={data.expectedGuests || ''}
            onChange={(e) => onUpdate({ expectedGuests: parseInt(e.target.value) || 0 })}
            placeholder="z.B. 100"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Startzeit</label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => onUpdate({ startTime: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Endzeit (optional)</label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => onUpdate({ endTime: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
          />
        </div>
      </div>
    </div>
  )
}

// Step 2: Artists
function Step2Artists({ data, onUpdate }: { data: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Künstler für dein Event</h2>
        <p className="text-white/60 mb-6">
          Wähle Artists aus unserem Katalog oder gib dein Budget an.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Artist-Budget (€)</label>
        <input
          type="number"
          value={data.artistBudget || ''}
          onChange={(e) => onUpdate({ artistBudget: parseInt(e.target.value) || 0 })}
          placeholder="z.B. 2000"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
        />
      </div>

      <div className="bg-white/5 rounded-xl p-6 text-center">
        <p className="text-white/60 mb-4">Artist-Auswahl wird nach Event-Erstellung freigeschaltet.</p>
        <button
          onClick={() => window.open('/artists', '_blank')}
          className="text-accent-purple hover:underline"
        >
          Artists durchstöbern →
        </button>
      </div>
    </div>
  )
}

// Step 3: Venue
function Step3Venue({ data, onUpdate }: { data: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Location</h2>
        <p className="text-white/60 mb-6">
          Wo findet dein Event statt?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Location-Name</label>
        <input
          type="text"
          value={data.venueName}
          onChange={(e) => onUpdate({ venueName: e.target.value })}
          placeholder="z.B. Stadthalle Frankfurt"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Adresse</label>
        <input
          type="text"
          value={data.venueAddress}
          onChange={(e) => onUpdate({ venueAddress: e.target.value })}
          placeholder="Straße und Hausnummer"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">PLZ</label>
          <input
            type="text"
            value={data.venuePostalCode}
            onChange={(e) => onUpdate({ venuePostalCode: e.target.value })}
            placeholder="z.B. 60311"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Stadt</label>
          <input
            type="text"
            value={data.venueCity}
            onChange={(e) => onUpdate({ venueCity: e.target.value })}
            placeholder="z.B. Frankfurt"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">Art der Location</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isIndoor}
              onChange={(e) => onUpdate({ isIndoor: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
            />
            <span className="text-white">Indoor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isOutdoor}
              onChange={(e) => onUpdate({ isOutdoor: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
            />
            <span className="text-white">Outdoor</span>
          </label>
        </div>
      </div>
    </div>
  )
}

// Step 4: Catering
function Step4Catering({ data, onUpdate }: { data: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  const toggleDietary = (id: string) => {
    const current = data.dietaryRestrictions
    if (current.includes(id)) {
      onUpdate({ dietaryRestrictions: current.filter(d => d !== id) })
    } else {
      onUpdate({ dietaryRestrictions: [...current, id] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Catering</h2>
        <p className="text-white/60 mb-6">
          Benötigst du Catering für dein Event?
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.cateringNeeded}
          onChange={(e) => onUpdate({ cateringNeeded: e.target.checked })}
          className="w-6 h-6 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
        />
        <span className="text-white font-medium">Ja, ich benötige Catering</span>
      </label>

      {data.cateringNeeded && (
        <>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">Catering-Art</label>
            <div className="grid grid-cols-2 gap-3">
              {cateringTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onUpdate({ cateringType: type.id })}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${data.cateringType === type.id
                      ? 'border-accent-purple bg-accent-purple/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Catering-Budget (€)</label>
            <input
              type="number"
              value={data.cateringBudget || ''}
              onChange={(e) => onUpdate({ cateringBudget: parseInt(e.target.value) || 0 })}
              placeholder="z.B. 1500"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">Besondere Anforderungen</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleDietary(option.id)}
                  className={`
                    px-4 py-2 rounded-full text-sm transition-all
                    ${data.dietaryRestrictions.includes(option.id)
                      ? 'bg-accent-purple text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Step 5: Sound & Light
function Step5Sound({ data, onUpdate }: { data: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Technik</h2>
        <p className="text-white/60 mb-6">
          Welche technische Ausstattung benötigst du?
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <input
            type="checkbox"
            checked={data.soundNeeded}
            onChange={(e) => onUpdate({ soundNeeded: e.target.checked })}
            className="w-6 h-6 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
          />
          <div>
            <span className="text-white font-medium block">Soundanlage</span>
            <span className="text-white/50 text-sm">PA-System, Mikrofone, DJ-Equipment</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <input
            type="checkbox"
            checked={data.lightNeeded}
            onChange={(e) => onUpdate({ lightNeeded: e.target.checked })}
            className="w-6 h-6 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
          />
          <div>
            <span className="text-white font-medium block">Lichttechnik</span>
            <span className="text-white/50 text-sm">Moving Heads, LED-Bars, Effektbeleuchtung</span>
          </div>
        </label>
      </div>

      {(data.soundNeeded || data.lightNeeded) && (
        <>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Technik-Budget (€)</label>
            <input
              type="number"
              value={data.techBudget || ''}
              onChange={(e) => onUpdate({ techBudget: parseInt(e.target.value) || 0 })}
              placeholder="z.B. 800"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Besondere Anforderungen</label>
            <textarea
              value={data.techNotes}
              onChange={(e) => onUpdate({ techNotes: e.target.value })}
              placeholder="z.B. Bühnenmaße, Stromanschlüsse, besondere Wünsche..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple resize-none"
            />
          </div>
        </>
      )}
    </div>
  )
}

// Step 6: Extras
function Step6Extras({ data, onUpdate }: { data: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Extras</h2>
        <p className="text-white/60 mb-6">
          Weitere Dienstleistungen für dein Event
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <input
            type="checkbox"
            checked={data.photographerNeeded}
            onChange={(e) => onUpdate({ photographerNeeded: e.target.checked })}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
          />
          <span className="text-white">Fotograf</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <input
            type="checkbox"
            checked={data.videographerNeeded}
            onChange={(e) => onUpdate({ videographerNeeded: e.target.checked })}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
          />
          <span className="text-white">Videograf</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <input
            type="checkbox"
            checked={data.securityNeeded}
            onChange={(e) => onUpdate({ securityNeeded: e.target.checked })}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
          />
          <span className="text-white">Security</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <input
            type="checkbox"
            checked={data.decorationNeeded}
            onChange={(e) => onUpdate({ decorationNeeded: e.target.checked })}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple"
          />
          <span className="text-white">Dekoration</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Weitere Anmerkungen</label>
        <textarea
          value={data.extraNotes}
          onChange={(e) => onUpdate({ extraNotes: e.target.value })}
          placeholder="Gibt es noch etwas, das wir wissen sollten?"
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple resize-none"
        />
      </div>

      {/* Summary Preview */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Zusammenfassung</h3>
        <div className="space-y-2 text-sm">
          {data.eventName && (
            <p className="text-white/70">
              <span className="text-white font-medium">Event:</span> {data.eventName}
            </p>
          )}
          {data.eventDate && (
            <p className="text-white/70">
              <span className="text-white font-medium">Datum:</span>{' '}
              {new Date(data.eventDate).toLocaleDateString('de-DE')}
            </p>
          )}
          {data.venueCity && (
            <p className="text-white/70">
              <span className="text-white font-medium">Ort:</span> {data.venueName || data.venueCity}
            </p>
          )}
          {data.expectedGuests > 0 && (
            <p className="text-white/70">
              <span className="text-white font-medium">Gäste:</span> ca. {data.expectedGuests}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
