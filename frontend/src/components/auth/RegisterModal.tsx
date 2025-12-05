import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { MultiSelect } from '../ui/MultiSelect'

// Types
export type UserType = 'fan' | 'artist' | 'service_provider' | 'event_organizer'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

type Step = 1 | 2 | 3

// User type cards configuration
const userTypes = [
  {
    id: 'fan' as UserType,
    icon: '🎵',
    title: 'Fan / Community',
    tagline: 'Entdecke großartige Künstler und unvergessliche Events'
  },
  {
    id: 'artist' as UserType,
    icon: '🎤',
    title: 'Artist',
    tagline: 'Zeige dein Talent und werde gebucht'
  },
  {
    id: 'service_provider' as UserType,
    icon: '🛠️',
    title: 'Service Provider',
    tagline: 'Verbinde dich mit Event-Planern die dich brauchen'
  },
  {
    id: 'event_organizer' as UserType,
    icon: '🎉',
    title: 'Event Organizer',
    tagline: 'Plane perfekte Events mit den richtigen Leuten'
  }
]

// Options
const genreOptions = [
  'Pop', 'Rock', 'Jazz', 'Electronic', 'Hip-Hop', 'Classical',
  'R&B', 'Schlager', 'Latin', 'Metal', 'Folk', 'World'
]

const professionOptions = [
  'DJ', 'Singer', 'Band', 'Guitarist', 'Pianist', 'Saxophonist',
  'Drummer', 'Violinist', 'Producer', 'Other'
]

const industryOptions = [
  'Catering', 'Photography', 'Videography', 'Decoration', 'Security',
  'Sound & Light', 'Florist', 'Hairdresser & Makeup', 'Transportation',
  'Equipment Rental', 'Event Planning', 'Venue', 'Other'
]

const businessTypeOptions = [
  'Freiberufler', 'Einzelunternehmer', 'GbR', 'GmbH', 'UG', 'Other'
]

const eventOrganizerBusinessTypes = [
  'Privatperson', 'Unternehmen', 'Agentur', 'Venue/Location', 'Verein', 'Other'
]

const crowdSizeOptions = [
  'Intimate (under 50)', 'Medium (50-200)', 'Large (200-500)', 'Massive (500+)', 'It varies!'
]

const eventVibeOptions = [
  'Elegant & Sophisticated', 'Fun & Party', 'Professional & Corporate',
  'Creative & Artsy', 'Relaxed & Casual', 'High Energy & Wild'
]

const musicPreferenceOptions = [
  'Pop & Charts', 'Electronic & House', 'Rock & Alternative', 'Jazz & Soul',
  'Hip-Hop & R&B', 'Classical & Orchestra', 'Schlager & Volksmusik', 'Open to everything!'
]

const mustHaveServiceOptions = [
  'Live Music / DJ', 'Catering', 'Photography & Video',
  'Decoration & Styling', 'Security', 'Sound & Lighting'
]

// Form Data Interface
interface FormData {
  // Base fields
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
  newsletterSubscribed: boolean

  // Artist fields
  genres: string[]
  profession: string

  // Service Provider / Event Organizer fields
  industry: string

  // Shared business fields
  address: string
  taxNumber: string
  vatId: string
  businessType: string
  phone: string

  // Event Organizer preferences
  crowdSize: string
  eventVibes: string[]
  musicPreferences: string[]
  mustHaveServices: string[]
}

// Initial form data
const initialFormData: FormData = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
  newsletterSubscribed: false,
  genres: [],
  profession: '',
  industry: '',
  address: '',
  taxNumber: '',
  vatId: '',
  businessType: '',
  phone: '',
  crowdSize: '',
  eventVibes: [],
  musicPreferences: [],
  mustHaveServices: []
}

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
            step === currentStep
              ? 'bg-white'
              : step < currentStep
              ? 'bg-white/60'
              : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  )
}

// Step 1: Choose Your Role
function UserTypeStep({
  onSelect,
  onGoogleSignUp,
  onFacebookSignUp,
  isLoading,
}: {
  onSelect: (type: UserType) => void
  onGoogleSignUp: () => void
  onFacebookSignUp: () => void
  isLoading: boolean
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide mb-2">
        WILLKOMMEN BEI BLOGHEAD
      </h2>
      <p className="text-gray-400 text-sm mb-8">Wähle deinen Account-Typ</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {userTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            disabled={isLoading}
            className="group p-5 bg-white/5 border border-white/20 rounded-xl text-left hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-200 disabled:opacity-50"
          >
            <div className="text-3xl mb-3">{type.icon}</div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-1 group-hover:text-purple-400 transition-colors">
              {type.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              {type.tagline}
            </p>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/60 text-xs uppercase tracking-wider">oder schnell mit</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Social Sign Up */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onGoogleSignUp}
          disabled={isLoading}
          className="w-full rounded-full border border-white/30 bg-white py-3 text-sm font-medium text-gray-800 transition-all hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Mit Google registrieren
        </button>

        <button
          type="button"
          onClick={onFacebookSignUp}
          disabled={isLoading}
          className="w-full rounded-full bg-[#1877F2] py-3 text-sm font-medium text-white transition-all hover:bg-[#166FE5] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Mit Facebook registrieren
        </button>
      </div>
    </div>
  )
}

// Step 2: Registration Form
function RegistrationFormStep({
  userType,
  formData,
  setFormData,
  errors,
  onSubmit,
  onBack,
  isLoading,
  submitError,
}: {
  userType: UserType
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  errors: Record<string, string>
  onSubmit: (e: FormEvent) => void
  onBack: () => void
  isLoading: boolean
  submitError: string | null
}) {
  const handleChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getUsernameLabel = () => {
    switch (userType) {
      case 'fan': return 'Member Name'
      case 'artist': return 'Künstlername'
      case 'service_provider': return 'Firmenname'
      case 'event_organizer': return 'Name / Firma'
      default: return 'Username'
    }
  }

  const getNewsletterText = () => {
    switch (userType) {
      case 'fan': return 'Updates zu Events und Künstlern erhalten'
      case 'artist': return 'Tipps für Künstler und Booking-Chancen erhalten'
      case 'service_provider': return 'Leads und Aufträge per E-Mail erhalten'
      case 'event_organizer': return 'Event-Trends und Planungstipps erhalten'
      default: return 'Newsletter abonnieren'
    }
  }

  const inputBaseClass = `
    w-full px-4 py-3
    bg-white/5 border border-white/20 rounded-xl
    text-white placeholder:text-gray-500 text-sm
    transition-colors duration-200
    focus:outline-none focus:border-purple-500 focus:bg-white/10
    disabled:opacity-50
  `

  const selectBaseClass = `
    w-full px-4 py-3
    bg-white/5 border border-white/20 rounded-xl
    text-white text-sm
    transition-colors duration-200
    focus:outline-none focus:border-purple-500
    disabled:opacity-50
    appearance-none cursor-pointer
  `

  return (
    <div>
      <button
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{userTypes.find(t => t.id === userType)?.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            {userTypes.find(t => t.id === userType)?.title}
          </h2>
          <p className="text-gray-400 text-xs">Account erstellen</p>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/50 p-3 text-sm text-white">
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Base Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Vorname *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={isLoading}
              className={`${inputBaseClass} ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="Max"
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Nachname *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={isLoading}
              className={`${inputBaseClass} ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Mustermann"
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{getUsernameLabel()} *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.username ? 'border-red-500' : ''}`}
            placeholder={userType === 'artist' ? 'DJ Max' : 'max_events'}
          />
          {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">E-Mail *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.email ? 'border-red-500' : ''}`}
            placeholder="max@example.de"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Passwort *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isLoading}
              className={`${inputBaseClass} ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Passwort bestätigen *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={isLoading}
              className={`${inputBaseClass} ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Artist Fields */}
        {userType === 'artist' && (
          <>
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Künstler-Informationen</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Genres * (max. 5)</label>
                  <MultiSelect
                    options={genreOptions}
                    selected={formData.genres}
                    onChange={(genres) => handleChange('genres', genres)}
                    placeholder="Genres auswählen..."
                    max={5}
                  />
                  {errors.genres && <p className="mt-1 text-xs text-red-400">{errors.genres}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Beruf / Rolle *</label>
                  <div className="relative">
                    <select
                      value={formData.profession}
                      onChange={(e) => handleChange('profession', e.target.value)}
                      disabled={isLoading}
                      className={`${selectBaseClass} ${errors.profession ? 'border-red-500' : ''}`}
                    >
                      <option value="">Auswählen...</option>
                      {professionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.profession && <p className="mt-1 text-xs text-red-400">{errors.profession}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={isLoading}
                    className={inputBaseClass}
                    placeholder="Straße, PLZ, Stadt"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Steuernummer / USt-IdNr.</label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => handleChange('taxNumber', e.target.value)}
                      disabled={isLoading}
                      className={inputBaseClass}
                      placeholder="DE123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Unternehmensform</label>
                    <div className="relative">
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleChange('businessType', e.target.value)}
                        disabled={isLoading}
                        className={selectBaseClass}
                      >
                        <option value="">Auswählen...</option>
                        {businessTypeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                    className={inputBaseClass}
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Service Provider Fields */}
        {userType === 'service_provider' && (
          <>
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Firmen-Informationen</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Branche *</label>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      disabled={isLoading}
                      className={`${selectBaseClass} ${errors.industry ? 'border-red-500' : ''}`}
                    >
                      <option value="">Auswählen...</option>
                      {industryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.industry && <p className="mt-1 text-xs text-red-400">{errors.industry}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Adresse *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={isLoading}
                    className={`${inputBaseClass} ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="Straße, PLZ, Stadt"
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">USt-IdNr. *</label>
                    <input
                      type="text"
                      value={formData.vatId}
                      onChange={(e) => handleChange('vatId', e.target.value)}
                      disabled={isLoading}
                      className={`${inputBaseClass} ${errors.vatId ? 'border-red-500' : ''}`}
                      placeholder="DE123456789"
                    />
                    {errors.vatId && <p className="mt-1 text-xs text-red-400">{errors.vatId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Unternehmensform</label>
                    <div className="relative">
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleChange('businessType', e.target.value)}
                        disabled={isLoading}
                        className={selectBaseClass}
                      >
                        <option value="">Auswählen...</option>
                        {businessTypeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Telefon * <span className="text-red-400">Pflichtfeld</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                    className={`${inputBaseClass} ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+49 123 456789"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Event Organizer Fields */}
        {userType === 'event_organizer' && (
          <>
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Veranstalter-Informationen</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={isLoading}
                    className={inputBaseClass}
                    placeholder="Straße, PLZ, Stadt"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">USt-IdNr. (optional)</label>
                    <input
                      type="text"
                      value={formData.vatId}
                      onChange={(e) => handleChange('vatId', e.target.value)}
                      disabled={isLoading}
                      className={inputBaseClass}
                      placeholder="Für Unternehmen"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Typ</label>
                    <div className="relative">
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleChange('businessType', e.target.value)}
                        disabled={isLoading}
                        className={selectBaseClass}
                      >
                        <option value="">Auswählen...</option>
                        {eventOrganizerBusinessTypes.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Telefon * <span className="text-red-400">Pflichtfeld</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                    className={`${inputBaseClass} ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+49 123 456789"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Personalization Section */}
            <div className="mt-6 p-5 bg-purple-900/20 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-display text-white mb-1">✨ PERSONALIZE YOUR EXPERIENCE</h3>
              <p className="text-gray-400 text-xs mb-5">Hilf uns, die perfekten Matches für deine Events zu finden!</p>

              {/* Crowd Size */}
              <div className="mb-5">
                <label className="text-white font-medium text-sm mb-3 block">👥 Deine typische Gästezahl?</label>
                <div className="grid grid-cols-2 gap-2">
                  {crowdSizeOptions.map(size => (
                    <label key={size} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="crowdSize"
                        value={size}
                        checked={formData.crowdSize === size}
                        onChange={(e) => handleChange('crowdSize', e.target.value)}
                        className="accent-purple-500"
                      />
                      <span className="text-gray-300 text-xs">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Event Vibe */}
              <div className="mb-5">
                <label className="text-white font-medium text-sm mb-3 block">🎨 Was ist dein Event-Vibe?</label>
                <div className="grid grid-cols-2 gap-2">
                  {eventVibeOptions.map(vibe => (
                    <label key={vibe} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        value={vibe}
                        checked={formData.eventVibes.includes(vibe)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('eventVibes', [...formData.eventVibes, vibe])
                          } else {
                            handleChange('eventVibes', formData.eventVibes.filter(v => v !== vibe))
                          }
                        }}
                        className="accent-purple-500"
                      />
                      <span className="text-gray-300 text-xs">{vibe}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Music Preferences */}
              <div className="mb-5">
                <label className="text-white font-medium text-sm mb-1 block">🎵 Musik-Präferenzen?</label>
                <p className="text-gray-500 text-xs mb-3">Hilft uns, die perfekten Künstler zu empfehlen</p>
                <div className="grid grid-cols-2 gap-2">
                  {musicPreferenceOptions.map(music => (
                    <label key={music} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        value={music}
                        checked={formData.musicPreferences.includes(music)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('musicPreferences', [...formData.musicPreferences, music])
                          } else {
                            handleChange('musicPreferences', formData.musicPreferences.filter(m => m !== music))
                          }
                        }}
                        className="accent-purple-500"
                      />
                      <span className="text-gray-300 text-xs">{music}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Must-have Services */}
              <div>
                <label className="text-white font-medium text-sm mb-3 block">💡 Must-have Services für deine Events?</label>
                <div className="grid grid-cols-2 gap-2">
                  {mustHaveServiceOptions.map(service => (
                    <label key={service} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        value={service}
                        checked={formData.mustHaveServices.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('mustHaveServices', [...formData.mustHaveServices, service])
                          } else {
                            handleChange('mustHaveServices', formData.mustHaveServices.filter(s => s !== service))
                          }
                        }}
                        className="accent-purple-500"
                      />
                      <span className="text-gray-300 text-xs">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Terms & Newsletter */}
        <div className="pt-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => handleChange('termsAccepted', e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent text-purple-500 focus:ring-purple-500 focus:ring-offset-0 accent-purple-500"
            />
            <span className="text-sm text-gray-400">
              Ich akzeptiere die{' '}
              <a href="/agb" className="text-purple-400 hover:underline">AGB</a>{' '}
              und{' '}
              <a href="/datenschutz" className="text-purple-400 hover:underline">Datenschutzerklärung</a> *
            </span>
          </label>
          {errors.termsAccepted && <p className="text-xs text-red-400 ml-7">{errors.termsAccepted}</p>}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.newsletterSubscribed}
              onChange={(e) => handleChange('newsletterSubscribed', e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent text-purple-500 focus:ring-purple-500 focus:ring-offset-0 accent-purple-500"
            />
            <span className="text-sm text-gray-400">
              {getNewsletterText()}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>WIRD REGISTRIERT...</span>
            </>
          ) : (
            'ACCOUNT ERSTELLEN'
          )}
        </button>
      </form>
    </div>
  )
}

// Step 3: Success Screen
function SuccessStep({
  userType,
  onClose,
  onResendEmail,
  isResending,
}: {
  userType: UserType
  onClose: () => void
  onResendEmail: () => void
  isResending: boolean
}) {
  const getSuccessMessage = () => {
    switch (userType) {
      case 'fan': return 'explore amazing events!'
      case 'artist': return 'showcase your talent!'
      case 'service_provider': return 'connect with clients!'
      case 'event_organizer': return 'plan unforgettable events!'
      default: return 'get started!'
    }
  }

  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-3xl font-display text-white mb-4">Willkommen bei Bloghead!</h2>
      <p className="text-gray-400 mb-6">
        Check your email to verify your account.<br />
        Once verified, you'll be ready to {getSuccessMessage()}
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onResendEmail}
          disabled={isResending}
          className="px-6 py-2.5 border border-white/30 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isResending ? 'Sending...' : 'Resend Email'}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

// Main RegisterModal component
export function RegisterModal({
  isOpen,
  onClose,
  onLoginClick,
}: RegisterModalProps) {
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [selectedType, setSelectedType] = useState<UserType | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setSelectedType(null)
      setFormData(initialFormData)
      setFormErrors({})
      setSubmitError(null)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, isLoading])

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedType(type)
    setStep(2)
  }

  const handleGoogleSignUp = async () => {
    setSubmitError(null)
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setSubmitError(error.message)
      }
    } catch {
      setSubmitError('Google-Registrierung fehlgeschlagen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    setSubmitError(null)
    setIsLoading(true)
    try {
      const { error } = await signInWithFacebook()
      if (error) {
        setSubmitError(error.message)
      }
    } catch {
      setSubmitError('Facebook-Registrierung fehlgeschlagen.')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    // Base validation (all users)
    if (!formData.username.trim()) errors.username = 'Erforderlich'
    if (!formData.firstName.trim()) errors.firstName = 'Erforderlich'
    if (!formData.lastName.trim()) errors.lastName = 'Erforderlich'
    if (!formData.email.trim()) {
      errors.email = 'Erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ungültige E-Mail-Adresse'
    }
    if (!formData.password) {
      errors.password = 'Erforderlich'
    } else if (formData.password.length < 8) {
      errors.password = 'Mindestens 8 Zeichen'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwörter stimmen nicht überein'
    }
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'Bitte akzeptieren Sie die AGB'
    }

    // Artist validation
    if (selectedType === 'artist') {
      if (formData.genres.length === 0) errors.genres = 'Mindestens ein Genre auswählen'
      if (!formData.profession) errors.profession = 'Erforderlich'
    }

    // Service Provider validation
    if (selectedType === 'service_provider') {
      if (!formData.industry) errors.industry = 'Erforderlich'
      if (!formData.address.trim()) errors.address = 'Erforderlich'
      if (!formData.vatId.trim()) errors.vatId = 'Erforderlich'
      if (!formData.phone.trim()) errors.phone = 'Telefon ist Pflicht für Service Provider'
    }

    // Event Organizer validation
    if (selectedType === 'event_organizer') {
      if (!formData.phone.trim()) errors.phone = 'Telefon ist Pflicht für Event Organizer'
    }

    return errors
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setSubmitError(null)
    setIsLoading(true)

    try {
      // Build metadata based on user type
      const metadata: Record<string, unknown> = {
        user_type: selectedType,
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        newsletter_subscribed: formData.newsletterSubscribed,
      }

      if (selectedType === 'artist') {
        metadata.genres = formData.genres
        metadata.profession = formData.profession
        metadata.address = formData.address
        metadata.tax_number = formData.taxNumber
        metadata.business_type = formData.businessType
        metadata.phone = formData.phone
      }

      if (selectedType === 'service_provider') {
        metadata.industry = formData.industry
        metadata.address = formData.address
        metadata.vat_id = formData.vatId
        metadata.business_type = formData.businessType
        metadata.phone = formData.phone
      }

      if (selectedType === 'event_organizer') {
        metadata.address = formData.address
        metadata.vat_id = formData.vatId
        metadata.business_type = formData.businessType
        metadata.phone = formData.phone
        // Preferences
        metadata.preferences = {
          crowd_size: formData.crowdSize,
          event_vibes: formData.eventVibes,
          music_preferences: formData.musicPreferences,
          must_have_services: formData.mustHaveServices
        }
      }

      const { error } = await signUp(formData.email, formData.password, metadata)

      if (error) {
        if (error.message.includes('already registered')) {
          setSubmitError('Diese E-Mail-Adresse ist bereits registriert.')
        } else if (error.message.includes('Password')) {
          setSubmitError('Das Passwort muss mindestens 6 Zeichen lang sein.')
        } else {
          setSubmitError(error.message)
        }
      } else {
        setStep(3)
      }
    } catch {
      setSubmitError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      // Supabase automatically sends verification email on signUp
      // For resend, we could use supabase.auth.resend() if needed
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    } finally {
      setIsResending(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full
          ${step === 1 ? 'max-w-lg' : step === 2 ? 'max-w-2xl' : 'max-w-md'}
          bg-gradient-to-b from-purple-900/80 to-gray-900
          border border-white/10 rounded-2xl
          shadow-2xl p-6 md:p-8
          animate-in fade-in zoom-in-95 duration-200
          max-h-[90vh] overflow-y-auto
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Indicator */}
        {step !== 3 && <StepIndicator currentStep={step} />}

        {/* Step Content */}
        <div className="transition-all duration-300 ease-out">
          {step === 1 && (
            <UserTypeStep
              onSelect={handleUserTypeSelect}
              onGoogleSignUp={handleGoogleSignUp}
              onFacebookSignUp={handleFacebookSignUp}
              isLoading={isLoading}
            />
          )}
          {step === 2 && selectedType && (
            <RegistrationFormStep
              userType={selectedType}
              formData={formData}
              setFormData={setFormData}
              errors={formErrors}
              onSubmit={handleFormSubmit}
              onBack={() => setStep(1)}
              isLoading={isLoading}
              submitError={submitError}
            />
          )}
          {step === 3 && selectedType && (
            <SuccessStep
              userType={selectedType}
              onClose={onClose}
              onResendEmail={handleResendEmail}
              isResending={isResending}
            />
          )}
        </div>

        {/* Login link */}
        {step !== 3 && (
          <div className="mt-6 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-500">
              Bereits registriert?{' '}
              <button
                onClick={onLoginClick}
                disabled={isLoading}
                className="text-purple-400 hover:underline font-medium disabled:opacity-50"
              >
                Anmelden
              </button>
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// Re-export types for backward compatibility
export type { UserType as AccountType }
export type MembershipTier = 'basic' | 'premium'
export interface RegistrationData {
  accountType: UserType
  membershipTier: MembershipTier
  name: string
  vorname: string
  email: string
  telefonnummer: string
  membername: string
  password: string
}
