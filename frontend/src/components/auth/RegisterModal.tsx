import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { MultiSelect } from '../ui/MultiSelect'
import { sanitizeInput, isValidEmail, isValidPhone, validatePassword } from '../../lib/security/sanitize'
import { modalAnimation, buttonTap, staggerContainer, staggerItem } from '@/lib/animations'

// Types
export type UserType = 'fan' | 'artist' | 'service_provider' | 'event_organizer'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

type Step = 1 | 2 | 3

// User type cards configuration with gradients and recommended badge
const userTypes = [
  {
    id: 'fan' as UserType,
    icon: '🎵',
    title: 'Fan / Community',
    tagline: 'Entdecke Künstler & unvergessliche Events',
    gradient: 'from-blue-500/20 to-purple-500/20',
    hoverGradient: 'hover:from-blue-500/30 hover:to-purple-500/30',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400'
  },
  {
    id: 'artist' as UserType,
    icon: '🎤',
    title: 'Künstler',
    tagline: 'Zeig dein Talent und werde gebucht',
    gradient: 'from-purple-500/20 to-pink-500/20',
    hoverGradient: 'hover:from-purple-500/30 hover:to-pink-500/30',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400'
  },
  {
    id: 'service_provider' as UserType,
    icon: '🛠️',
    title: 'Dienstleister',
    tagline: 'Verbinde dich mit Event-Planern',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    hoverGradient: 'hover:from-orange-500/30 hover:to-yellow-500/30',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400'
  },
  {
    id: 'event_organizer' as UserType,
    icon: '🎉',
    title: 'Event-Veranstalter',
    tagline: 'Plane perfekte Events mit den richtigen Leuten',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    hoverGradient: 'hover:from-emerald-500/30 hover:to-teal-500/30',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400'
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

// Shorter German labels for crowd size
const crowdSizeOptions = [
  { value: 'intimate', label: 'Intim (< 50)' },
  { value: 'medium', label: 'Mittel (50-200)' },
  { value: 'large', label: 'Groß (200-500)' },
  { value: 'massive', label: 'Riesig (500+)' },
  { value: 'varies', label: 'Variiert!' }
]

// Shorter vibe labels
const eventVibeOptions = [
  { value: 'elegant', label: 'Elegant', icon: '✨' },
  { value: 'party', label: 'Party', icon: '🎊' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'creative', label: 'Kreativ', icon: '🎨' },
  { value: 'relaxed', label: 'Entspannt', icon: '😌' },
  { value: 'wild', label: 'Wild', icon: '🔥' }
]

// Music preferences
const musicPreferenceOptions = [
  { value: 'pop', label: 'Pop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'classical', label: 'Klassik' },
  { value: 'schlager', label: 'Schlager' },
  { value: 'everything', label: 'Alles!' }
]

// Must-have services with icons
const mustHaveServiceOptions = [
  { value: 'music', label: 'Live Musik / DJ', icon: '🎵' },
  { value: 'catering', label: 'Catering', icon: '🍽️' },
  { value: 'photo', label: 'Foto & Video', icon: '📸' },
  { value: 'deco', label: 'Dekoration', icon: '🎨' },
  { value: 'security', label: 'Security', icon: '🛡️' },
  { value: 'sound', label: 'Sound & Licht', icon: '🔊' }
]

// Form Data Interface
interface FormData {
  username: string
  firstName: string
  lastName: string
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
  newsletterSubscribed: boolean
  genres: string[]
  profession: string
  industry: string
  address: string
  taxNumber: string
  vatId: string
  businessType: string
  phone: string
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
  confirmEmail: '',
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

// Progress bar component
function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="flex gap-1.5">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              s <= step ? 'w-8 bg-gradient-to-r from-purple-500 to-orange-500' : 'w-4 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Step 1: Choose Your Role with polished cards
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-display text-white mb-2">
          WILLKOMMEN BEI BLOGHEAD
        </h2>
        <p className="text-gray-400 text-sm">Wähle deinen Account-Typ</p>
      </motion.div>

      {/* User Type Cards - Staggered Animation */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {userTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => onSelect(type.id)}
            disabled={isLoading}
            className={`
              relative p-5 md:p-6 rounded-2xl border-2 text-left
              bg-gradient-to-br ${type.gradient} ${type.hoverGradient}
              ${type.borderColor} ${type.hoverBorder}
              transition-colors duration-300 ease-out
              disabled:opacity-50
              group
            `}
            variants={staggerItem}
            whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(97, 10, 209, 0.15)' } : undefined}
            whileTap={!isLoading ? { scale: 0.98 } : undefined}
          >
            {/* Icon with hover animation */}
            <motion.div
              className="text-4xl mb-4"
              whileHover={{ scale: 1.1, rotate: -3 }}
              transition={{ duration: 0.3 }}
            >
              {type.icon}
            </motion.div>

            {/* Title & Tagline */}
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">
              {type.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
              {type.tagline}
            </p>

            {/* Arrow indicator */}
            <motion.div
              className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/20 transition-all"
              whileHover={{ x: 4 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </motion.button>
        ))}
      </motion.div>

      {/* Divider */}
      <motion.div
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-gray-500 text-xs uppercase tracking-wider">oder schnell mit</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>

      {/* Social Sign Up - Side by side */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          type="button"
          onClick={onGoogleSignUp}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-white/20 bg-white py-3 text-sm font-medium text-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          whileHover={!isLoading ? { scale: 1.02, backgroundColor: '#f3f4f6' } : undefined}
          whileTap={!isLoading ? buttonTap : undefined}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="hidden sm:inline">Google</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={onFacebookSignUp}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-[#1877F2] py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          whileHover={!isLoading ? { scale: 1.02, backgroundColor: '#166FE5' } : undefined}
          whileTap={!isLoading ? buttonTap : undefined}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="hidden sm:inline">Facebook</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// Section Header Component
function SectionHeader({ number, title, color }: { number: number; title: string; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400',
    teal: 'bg-teal-500/20 text-teal-400',
    pink: 'bg-pink-500/20 text-pink-400'
  }

  return (
    <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-3">
      <span className={`w-7 h-7 rounded-full ${colorClasses[color]} flex items-center justify-center text-xs font-bold`}>
        {number}
      </span>
      {title}
    </h4>
  )
}

// Step 2: Registration Form with organized sections
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
  const currentType = userTypes.find(t => t.id === userType)!

  const handleChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: 'eventVibes' | 'musicPreferences' | 'mustHaveServices', item: string) => {
    setFormData(prev => {
      const current = prev[field] as string[]
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) }
      } else {
        return { ...prev, [field]: [...current, item] }
      }
    })
  }

  const getUsernameLabel = () => {
    switch (userType) {
      case 'fan': return 'Mitgliedsname'
      case 'artist': return 'Künstlername'
      case 'service_provider': return 'Firmenname'
      case 'event_organizer': return 'Name / Firma'
      default: return 'Username'
    }
  }

  const getNewsletterText = () => {
    switch (userType) {
      case 'fan': return 'Halte mich über coole Events auf dem Laufenden'
      case 'artist': return 'Benachrichtige mich über Booking-Anfragen'
      case 'service_provider': return 'Benachrichtige mich über neue Aufträge'
      case 'event_organizer': return 'Event-Trends und Planungstipps erhalten'
      default: return 'Newsletter abonnieren'
    }
  }

  const inputBaseClass = `
    w-full px-4 py-3
    bg-white/5 border border-white/20 rounded-xl
    text-white placeholder:text-gray-500 text-sm
    transition-all duration-200
    focus:outline-none focus:border-purple-500 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20
    disabled:opacity-50
  `

  const selectBaseClass = `
    w-full px-4 py-3
    bg-white/5 border border-white/20 rounded-xl
    text-white text-sm
    transition-all duration-200
    focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
    disabled:opacity-50
    appearance-none cursor-pointer
  `

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with back button */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50 group"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </motion.button>
        <ProgressBar step={2} />
      </motion.div>

      {/* User type indicator */}
      <motion.div
        className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <span className="text-3xl">{currentType.icon}</span>
        <div>
          <p className="text-white font-medium">{currentType.title}</p>
          <p className="text-gray-500 text-sm">Account erstellen</p>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            className="mb-6 rounded-xl bg-red-500/20 border border-red-500/50 p-4 text-sm text-white flex items-center gap-3"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xl">⚠️</span>
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form content */}
      <motion.form
        onSubmit={onSubmit}
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >

        {/* SECTION 1: Account */}
        <div>
          <SectionHeader number={1} title="Account" color="purple" />
          <div className="space-y-4 pl-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Vorname *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={isLoading}
                  className={`${inputBaseClass} ${errors.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
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
                  className={`${inputBaseClass} ${errors.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Mustermann"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            {/* Mitgliedsname directly after name for Fan users */}
            {userType === 'fan' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{getUsernameLabel()} *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={isLoading}
                  className={`${inputBaseClass} ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="max_fan"
                />
                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
              </div>
            )}

            {/* Username for non-fan users */}
            {userType !== 'fan' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{getUsernameLabel()} *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={isLoading}
                  className={`${inputBaseClass} ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder={userType === 'artist' ? 'DJ Max' : 'max_events'}
                />
                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">E-Mail *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isLoading}
                className={`${inputBaseClass} ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="max@example.de"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">E-Mail bestätigen *</label>
              <input
                type="email"
                value={formData.confirmEmail}
                onChange={(e) => handleChange('confirmEmail', e.target.value)}
                disabled={isLoading}
                className={`${inputBaseClass} ${errors.confirmEmail ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="max@example.de"
              />
              {errors.confirmEmail && <p className="mt-1 text-xs text-red-400">{errors.confirmEmail}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Passwort *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isLoading}
                  className={`${inputBaseClass} ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
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
                  className={`${inputBaseClass} ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Professional Details (not for fans) */}
        {userType !== 'fan' && (
          <div>
            <SectionHeader
              number={2}
              title={userType === 'artist' ? 'Deine Musik' : 'Dein Business'}
              color="orange"
            />
            <div className="space-y-4 pl-10">
              {/* Artist Fields */}
              {userType === 'artist' && (
                <>
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
                </>
              )}

              {/* Service Provider Fields */}
              {userType === 'service_provider' && (
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
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: Business Details (not for fans) */}
        {userType !== 'fan' && (
          <div>
            <SectionHeader number={3} title="Geschäftsdaten" color="teal" />
            <div className="space-y-4 pl-10">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                  Adresse {userType === 'service_provider' && <span className="text-red-400">*</span>}
                </label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    {userType === 'artist' ? 'Steuernr. / USt-IdNr.' : 'USt-IdNr.'}
                    {userType === 'service_provider' && <span className="text-red-400"> *</span>}
                  </label>
                  <input
                    type="text"
                    value={userType === 'artist' ? formData.taxNumber : formData.vatId}
                    onChange={(e) => handleChange(userType === 'artist' ? 'taxNumber' : 'vatId', e.target.value)}
                    disabled={isLoading}
                    className={`${inputBaseClass} ${errors.vatId ? 'border-red-500' : ''}`}
                    placeholder="DE123456789"
                  />
                  {errors.vatId && <p className="mt-1 text-xs text-red-400">{errors.vatId}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    {userType === 'event_organizer' ? 'Typ' : 'Unternehmensform'}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      disabled={isLoading}
                      className={selectBaseClass}
                    >
                      <option value="">Auswählen...</option>
                      {(userType === 'event_organizer' ? eventOrganizerBusinessTypes : businessTypeOptions).map(opt => (
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
                  Telefon {(userType === 'service_provider' || userType === 'event_organizer') && <span className="text-red-400">* Pflichtfeld</span>}
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
        )}

        {/* SECTION 4: Event Organizer Personalization */}
        {userType === 'event_organizer' && (
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-orange-900/20 border border-purple-500/20 overflow-hidden">
            {/* Decorative sparkles */}
            <div className="absolute top-4 right-4 text-2xl animate-pulse">✨</div>
            <div className="absolute bottom-4 left-4 text-lg opacity-50">🎯</div>

            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-display text-white">Personalisiere dein Erlebnis</h4>
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black">
                Empfohlen
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Hilf uns, die perfekten Matches zu finden! (Optional)</p>

            {/* Crowd Size */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-3">
                <span>👥</span> Typische Gästezahl?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {crowdSizeOptions.map(size => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => handleChange('crowdSize', size.value)}
                    className={`
                      p-3 rounded-xl text-sm transition-all duration-200
                      ${formData.crowdSize === size.value
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:scale-[1.02]'}
                    `}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Vibe - Pill buttons */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-3">
                <span>🎨</span> Event-Stimmung?
              </label>
              <div className="flex flex-wrap gap-2">
                {eventVibeOptions.map(vibe => (
                  <button
                    key={vibe.value}
                    type="button"
                    onClick={() => toggleArrayItem('eventVibes', vibe.value)}
                    className={`
                      px-4 py-2 rounded-full text-sm transition-all duration-200 flex items-center gap-2
                      ${formData.eventVibes.includes(vibe.value)
                        ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg scale-[1.02]'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-[1.02]'}
                    `}
                  >
                    <span>{vibe.icon}</span>
                    {vibe.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Music Preferences - Pill buttons */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-3">
                <span>🎵</span> Musikvorlieben?
              </label>
              <div className="flex flex-wrap gap-2">
                {musicPreferenceOptions.map(music => (
                  <button
                    key={music.value}
                    type="button"
                    onClick={() => toggleArrayItem('musicPreferences', music.value)}
                    className={`
                      px-4 py-2 rounded-full text-sm transition-all duration-200
                      ${formData.musicPreferences.includes(music.value)
                        ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg scale-[1.02]'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-[1.02]'}
                    `}
                  >
                    {music.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Must-have Services */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-3">
                <span>💡</span> Must-have Services?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mustHaveServiceOptions.map(service => (
                  <button
                    key={service.value}
                    type="button"
                    onClick={() => toggleArrayItem('mustHaveServices', service.value)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                      ${formData.mustHaveServices.includes(service.value)
                        ? 'bg-purple-500/30 border-2 border-purple-500 text-white scale-[1.02]'
                        : 'bg-white/5 border-2 border-transparent text-gray-300 hover:bg-white/10 hover:scale-[1.02]'}
                    `}
                  >
                    <span className="text-xl">{service.icon}</span>
                    <span className="text-sm">{service.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Terms & Newsletter */}
        <div className="space-y-3 pb-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => handleChange('termsAccepted', e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-5 h-5 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 accent-purple-500"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              Ich akzeptiere die{' '}
              <a href="/agb" className="text-purple-400 hover:underline">AGB</a>{' '}
              und{' '}
              <a href="/datenschutz" className="text-purple-400 hover:underline">Datenschutzerklärung</a> *
            </span>
          </label>
          {errors.termsAccepted && <p className="text-xs text-red-400 ml-8">{errors.termsAccepted}</p>}

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.newsletterSubscribed}
              onChange={(e) => handleChange('newsletterSubscribed', e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-5 h-5 rounded border-gray-600 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 accent-purple-500"
            />
            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
              {getNewsletterText()}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.termsAccepted}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-300 flex items-center justify-center gap-2"
          whileHover={!isLoading && formData.termsAccepted ? { scale: 1.01, boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)' } : undefined}
          whileTap={!isLoading && formData.termsAccepted ? { scale: 0.98 } : undefined}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Wird registriert...</span>
            </>
          ) : (
            <>
              Jetzt registrieren
              <span className="text-xl">🚀</span>
            </>
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  )
}

// Step 3: Success Screen with celebration
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
      case 'fan': return 'coole Events zu entdecken!'
      case 'artist': return 'dein Talent zu zeigen!'
      case 'service_provider': return 'mit Kunden zu connecten!'
      case 'event_organizer': return 'unvergessliche Events zu planen!'
      default: return 'loszulegen!'
    }
  }

  return (
    <motion.div
      className="text-center py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Success checkmark */}
      <motion.div
        className="relative inline-block mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
          <motion.svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </motion.svg>
        </div>
        <motion.div
          className="absolute -top-1 -right-1 text-2xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
        >
          ✨
        </motion.div>
      </motion.div>

      <motion.h2
        className="text-2xl font-display text-white mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Registrierung erfolgreich!
      </motion.h2>
      <motion.p
        className="text-gray-400 text-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Du bist fast bereit, {getSuccessMessage()}
      </motion.p>

      {/* Email confirmation box */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-left"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📧</span>
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Bestätigungs-E-Mail gesendet</h3>
            <p className="text-gray-400 text-sm">
              Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
            </p>
          </div>
        </div>

        {/* Help section */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Keine E-Mail erhalten?</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              Prüfe deinen Spam-Ordner
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              Warte ein paar Minuten
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              Kontaktiere uns: <a href="mailto:support@bloghead.de" className="text-purple-400 hover:underline">support@bloghead.de</a>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={onResendEmail}
          disabled={isResending}
          className="px-5 py-2.5 border border-white/30 rounded-xl text-white text-sm transition-colors disabled:opacity-50"
          whileHover={!isResending ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' } : undefined}
          whileTap={!isResending ? { scale: 0.98 } : undefined}
        >
          {isResending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sende...
            </span>
          ) : (
            'E-Mail erneut senden'
          )}
        </motion.button>
        <motion.button
          onClick={onClose}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl text-white text-sm font-medium transition-colors"
          whileHover={{ scale: 1.02, opacity: 0.9 }}
          whileTap={{ scale: 0.98 }}
        >
          Zur Startseite
        </motion.button>
      </motion.div>
    </motion.div>
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
      // NOTE: Removed document.body.style.overflow = 'hidden' - it breaks mobile scrolling!
      // The modal's own scroll container handles overflow properly
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
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

    // Sanitize all text inputs
    const sanitizedUsername = sanitizeInput(formData.username)
    const sanitizedFirstName = sanitizeInput(formData.firstName)
    const sanitizedLastName = sanitizeInput(formData.lastName)
    const sanitizedEmail = sanitizeInput(formData.email).toLowerCase()
    const sanitizedConfirmEmail = sanitizeInput(formData.confirmEmail).toLowerCase()
    const sanitizedPhone = sanitizeInput(formData.phone)

    if (!sanitizedUsername) errors.username = 'Erforderlich'
    if (!sanitizedFirstName) errors.firstName = 'Erforderlich'
    if (!sanitizedLastName) errors.lastName = 'Erforderlich'
    if (!sanitizedEmail) {
      errors.email = 'Erforderlich'
    } else if (!isValidEmail(sanitizedEmail)) {
      errors.email = 'Ungültige E-Mail-Adresse'
    }
    if (!sanitizedConfirmEmail) {
      errors.confirmEmail = 'Erforderlich'
    } else if (sanitizedEmail !== sanitizedConfirmEmail) {
      errors.confirmEmail = 'E-Mail-Adressen stimmen nicht überein'
    }

    // Use validatePassword from sanitize.ts
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0] || 'Ungültiges Passwort'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Stimmt nicht überein'
    }
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'Bitte akzeptieren'
    }

    if (selectedType === 'artist') {
      if (formData.genres.length === 0) errors.genres = 'Mind. ein Genre'
      if (!formData.profession) errors.profession = 'Erforderlich'
    }

    if (selectedType === 'service_provider') {
      if (!formData.industry) errors.industry = 'Erforderlich'
      if (!sanitizeInput(formData.address)) errors.address = 'Erforderlich'
      if (!sanitizeInput(formData.vatId)) errors.vatId = 'Erforderlich'
      if (!sanitizedPhone) {
        errors.phone = 'Pflichtfeld'
      } else if (!isValidPhone(sanitizedPhone)) {
        errors.phone = 'Ungültige Telefonnummer'
      }
    }

    if (selectedType === 'event_organizer') {
      if (!sanitizedPhone) {
        errors.phone = 'Pflichtfeld'
      } else if (sanitizedPhone && !isValidPhone(sanitizedPhone)) {
        errors.phone = 'Ungültige Telefonnummer'
      }
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
      // Sanitize all inputs before sending to backend
      const sanitizedEmail = sanitizeInput(formData.email).toLowerCase()
      const sanitizedUsername = sanitizeInput(formData.username)
      const sanitizedFirstName = sanitizeInput(formData.firstName)
      const sanitizedLastName = sanitizeInput(formData.lastName)
      const sanitizedPhone = sanitizeInput(formData.phone)
      const sanitizedAddress = sanitizeInput(formData.address)

      const metadata: Record<string, unknown> = {
        user_type: selectedType,
        membername: sanitizedUsername,
        vorname: sanitizedFirstName,
        nachname: sanitizedLastName,
        full_name: `${sanitizedFirstName} ${sanitizedLastName}`,
        newsletter_subscribed: formData.newsletterSubscribed,
      }

      if (selectedType === 'artist') {
        metadata.genres = formData.genres
        metadata.profession = sanitizeInput(formData.profession)
        metadata.address = sanitizedAddress
        metadata.tax_number = sanitizeInput(formData.taxNumber)
        metadata.business_type = sanitizeInput(formData.businessType)
        metadata.phone = sanitizedPhone
      }

      if (selectedType === 'service_provider') {
        metadata.industry = sanitizeInput(formData.industry)
        metadata.address = sanitizedAddress
        metadata.vat_id = sanitizeInput(formData.vatId)
        metadata.business_type = sanitizeInput(formData.businessType)
        metadata.phone = sanitizedPhone
      }

      if (selectedType === 'event_organizer') {
        metadata.address = sanitizedAddress
        metadata.vat_id = sanitizeInput(formData.vatId)
        metadata.business_type = sanitizeInput(formData.businessType)
        metadata.phone = sanitizedPhone
        metadata.preferences = {
          crowd_size: formData.crowdSize,
          event_vibes: formData.eventVibes,
          music_preferences: formData.musicPreferences,
          must_have_services: formData.mustHaveServices
        }
      }

      const { error } = await signUp(sanitizedEmail, formData.password, metadata)

      if (error) {
        if (error.message.includes('already registered')) {
          setSubmitError('Diese E-Mail ist bereits registriert.')
        } else if (error.message.includes('Password')) {
          setSubmitError('Passwort muss mind. 6 Zeichen haben.')
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
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsResending(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* CSS for scrollbar */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>

          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={modalAnimation.overlay.initial}
            animate={modalAnimation.overlay.animate}
            exit={modalAnimation.overlay.exit}
            transition={modalAnimation.overlay.transition}
            onClick={() => !isLoading && onClose()}
          />

          {/* Scrollable container */}
          <motion.div
            className="modal-scroll-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-center">
              {/* Modal box */}
              <motion.div
                className={`
                  modal-box relative
                  ${step === 1 ? 'max-w-xl' : step === 2 ? 'max-w-2xl' : 'max-w-md'}
                  bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
                  border border-white/10 rounded-2xl
                  shadow-2xl shadow-purple-500/10
                `}
                initial={modalAnimation.content.initial}
                animate={modalAnimation.content.animate}
                exit={modalAnimation.content.exit}
                transition={modalAnimation.content.transition}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10 disabled:opacity-50"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Content with padding */}
                <div className="p-6 md:p-8">
                  {/* Step Content with AnimatePresence for transitions */}
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div key="step1">
                        <UserTypeStep
                          onSelect={handleUserTypeSelect}
                          onGoogleSignUp={handleGoogleSignUp}
                          onFacebookSignUp={handleFacebookSignUp}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}
                    {step === 2 && selectedType && (
                      <motion.div key="step2">
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
                      </motion.div>
                    )}
                    {step === 3 && selectedType && (
                      <motion.div key="step3">
                        <SuccessStep
                          userType={selectedType}
                          onClose={onClose}
                          onResendEmail={handleResendEmail}
                          isResending={isResending}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Login link - at bottom */}
                <AnimatePresence>
                  {step !== 3 && (
                    <motion.div
                      className="px-6 md:px-8 pb-6 pt-4 border-t border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-sm text-gray-500 text-center">
                        Bereits registriert?{' '}
                        <motion.button
                          onClick={onLoginClick}
                          disabled={isLoading}
                          className="text-purple-400 hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                        >
                          Anmelden
                        </motion.button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
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
