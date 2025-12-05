import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'

// Types
export type AccountType = 'artist' | 'customer' | 'fan'
export type MembershipTier = 'basic' | 'premium'

export interface RegistrationData {
  accountType: AccountType
  membershipTier: MembershipTier
  name: string
  vorname: string
  email: string
  telefonnummer: string
  membername: string
  password: string
}

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

type Step = 1 | 2 | 3 | 'success'

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: Step }) {
  if (currentStep === 'success') return null

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

// Step 1: Account Type Selection
function AccountTypeStep({
  onSelect,
  onGoogleSignUp,
  onFacebookSignUp,
  isLoading,
}: {
  onSelect: (type: AccountType) => void
  onGoogleSignUp: () => void
  onFacebookSignUp: () => void
  isLoading: boolean
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide mb-8">
        NEU BEI BLOGHEAD?
      </h2>

      <div className="flex flex-col gap-4">
        {/* Primary choice - gradient button */}
        <button
          onClick={() => onSelect('artist')}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-accent-red to-accent-salmon text-white font-bold uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
        >
          ARTIST / VERANSTALTER
        </button>

        {/* Secondary choices - outline buttons */}
        <button
          onClick={() => onSelect('customer')}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-transparent border-2 border-accent-purple text-white font-bold uppercase tracking-wider rounded-full hover:bg-accent-purple/20 transition-all duration-200 disabled:opacity-50"
        >
          CUSTOMER
        </button>

        <button
          onClick={() => onSelect('fan')}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-transparent border-2 border-accent-purple text-white font-bold uppercase tracking-wider rounded-full hover:bg-accent-purple/20 transition-all duration-200 disabled:opacity-50"
        >
          FAN
        </button>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/60 text-xs uppercase tracking-wider">oder</span>
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

// Step 2: Membership Selection
function MembershipStep({
  onSelect,
  onBack,
  isLoading,
}: {
  onSelect: (tier: MembershipTier) => void
  onBack: () => void
  isLoading: boolean
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide text-center mb-8">
        WÄHLE DEIN PAKET
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Basic Plan */}
        <div className="bg-bg-card/50 border border-white/20 rounded-xl p-5 flex flex-col">
          <h3 className="text-lg font-bold text-white uppercase mb-2">BASIC</h3>
          <p className="text-xl font-bold text-white mb-4">
            9,99€<span className="text-sm font-normal text-text-muted">/MONAT</span>
          </p>
          <ul className="flex-1 space-y-2 mb-6">
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Profil erstellen</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Buchungsanfragen</span>
            </li>
          </ul>
          <button
            onClick={() => onSelect('basic')}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-transparent border-2 border-white/30 text-white font-bold uppercase text-sm tracking-wider rounded-full hover:border-white/50 hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
          >
            AUSWÄHLEN
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-b from-accent-purple/30 to-bg-card/50 border border-accent-purple rounded-xl p-5 flex flex-col relative overflow-hidden">
          {/* Highlighted badge */}
          <div className="absolute top-0 right-0 bg-accent-purple text-white text-xs font-bold uppercase px-3 py-1 rounded-bl-lg">
            Beliebt
          </div>
          <h3 className="text-lg font-bold text-white uppercase mb-2">PREMIUM</h3>
          <p className="text-xl font-bold text-white mb-4">
            19,99€<span className="text-sm font-normal text-text-muted">/MONAT</span>
          </p>
          <ul className="flex-1 space-y-2 mb-6">
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Alles aus Basic</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Priority Listing</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Analytics Dashboard</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Verifiziertes Profil</span>
            </li>
          </ul>
          <button
            onClick={() => onSelect('premium')}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold uppercase text-sm tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          >
            AUSWÄHLEN
          </button>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        disabled={isLoading}
        className="w-full py-3 text-text-muted hover:text-white text-sm uppercase tracking-wider transition-colors duration-200 disabled:opacity-50"
      >
        ← Zurück
      </button>
    </div>
  )
}

// Step 3: Registration Form
function RegistrationFormStep({
  onSubmit,
  onBack,
  isLoading,
  error,
}: {
  onSubmit: (data: Omit<RegistrationData, 'accountType' | 'membershipTier'>) => void
  onBack: () => void
  isLoading: boolean
  error: string | null
}) {
  const [formData, setFormData] = useState({
    name: '',
    vorname: '',
    email: '',
    telefonnummer: '',
    membername: '',
    password: '',
    passwordConfirm: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name ist erforderlich'
    if (!formData.vorname.trim()) newErrors.vorname = 'Vorname ist erforderlich'
    if (!formData.email.trim()) {
      newErrors.email = 'Email ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige Email-Adresse'
    }
    if (!formData.telefonnummer.trim()) newErrors.telefonnummer = 'Telefonnummer ist erforderlich'
    if (!formData.membername.trim()) newErrors.membername = 'Membername ist erforderlich'
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen lang sein'
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwörter stimmen nicht überein'
    }
    if (!acceptedTerms) {
      newErrors.terms = 'Bitte akzeptieren Sie die AGB'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        name: formData.name,
        vorname: formData.vorname,
        email: formData.email,
        telefonnummer: formData.telefonnummer,
        membername: formData.membername,
        password: formData.password,
      })
    }
  }

  const inputBaseClass = `
    w-full px-5 py-3
    bg-transparent border border-white/30 rounded-full
    text-white placeholder:text-text-muted placeholder:uppercase placeholder:text-xs placeholder:tracking-wider
    transition-colors duration-200
    focus:outline-none focus:border-accent-purple
    disabled:opacity-50
  `

  return (
    <div>
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide text-center mb-6">
        REGISTRIEREN
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-white">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="NAME"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.name ? 'border-accent-red' : ''}`}
          />
          {errors.name && <p className="mt-1 text-xs text-accent-red">{errors.name}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="VORNAME"
            value={formData.vorname}
            onChange={(e) => handleChange('vorname', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.vorname ? 'border-accent-red' : ''}`}
          />
          {errors.vorname && <p className="mt-1 text-xs text-accent-red">{errors.vorname}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="EMAIL"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.email ? 'border-accent-red' : ''}`}
          />
          {errors.email && <p className="mt-1 text-xs text-accent-red">{errors.email}</p>}
        </div>

        <div>
          <input
            type="tel"
            placeholder="TELEFONNUMMER"
            value={formData.telefonnummer}
            onChange={(e) => handleChange('telefonnummer', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.telefonnummer ? 'border-accent-red' : ''}`}
          />
          {errors.telefonnummer && <p className="mt-1 text-xs text-accent-red">{errors.telefonnummer}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="MEMBERNAME"
            value={formData.membername}
            onChange={(e) => handleChange('membername', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.membername ? 'border-accent-red' : ''}`}
          />
          {errors.membername && <p className="mt-1 text-xs text-accent-red">{errors.membername}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="PASSWORT"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.password ? 'border-accent-red' : ''}`}
          />
          {errors.password && <p className="mt-1 text-xs text-accent-red">{errors.password}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="PASSWORT WIEDERHOLEN"
            value={formData.passwordConfirm}
            onChange={(e) => handleChange('passwordConfirm', e.target.value)}
            disabled={isLoading}
            className={`${inputBaseClass} ${errors.passwordConfirm ? 'border-accent-red' : ''}`}
          />
          {errors.passwordConfirm && <p className="mt-1 text-xs text-accent-red">{errors.passwordConfirm}</p>}
        </div>

        {/* Terms checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked)
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }))
              }}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent text-accent-purple focus:ring-accent-purple focus:ring-offset-0"
            />
            <span className="text-sm text-text-secondary">
              Ich akzeptiere die{' '}
              <a href="/agb" className="text-accent-purple hover:underline">
                AGB
              </a>{' '}
              und{' '}
              <a href="/datenschutz" className="text-accent-purple hover:underline">
                Datenschutzerklärung
              </a>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-accent-red">{errors.terms}</p>}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 mt-4 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
            'REGISTRIEREN'
          )}
        </button>
      </form>

      {/* Back button */}
      <button
        onClick={onBack}
        disabled={isLoading}
        className="w-full py-3 mt-4 text-text-muted hover:text-white text-sm uppercase tracking-wider transition-colors duration-200 disabled:opacity-50"
      >
        ← Zurück
      </button>
    </div>
  )
}

// Success Step
function SuccessStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide mb-4">
        FAST GESCHAFFT!
      </h2>
      <p className="text-text-secondary mb-6">
        Wir haben dir eine E-Mail geschickt. Bitte bestätige deine E-Mail-Adresse, um deine Registrierung abzuschließen.
      </p>
      <button
        onClick={onClose}
        className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-all duration-200"
      >
        VERSTANDEN
      </button>
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
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setRegistrationData({})
      setError(null)
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

  const handleAccountTypeSelect = (type: AccountType) => {
    setRegistrationData((prev) => ({ ...prev, accountType: type }))
    setStep(2)
  }

  const handleMembershipSelect = (tier: MembershipTier) => {
    setRegistrationData((prev) => ({ ...prev, membershipTier: tier }))
    setStep(3)
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Google-Registrierung fehlgeschlagen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { error } = await signInWithFacebook()
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Facebook-Registrierung fehlgeschlagen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (formData: Omit<RegistrationData, 'accountType' | 'membershipTier'>) => {
    setError(null)
    setIsLoading(true)

    try {
      const metadata = {
        user_type: registrationData.accountType,
        membership_tier: registrationData.membershipTier,
        full_name: `${formData.vorname} ${formData.name}`,
        first_name: formData.vorname,
        last_name: formData.name,
        phone: formData.telefonnummer,
        membername: formData.membername,
      }

      const { error } = await signUp(formData.email, formData.password, metadata)

      if (error) {
        // Map Supabase error messages to German
        if (error.message.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert.')
        } else if (error.message.includes('Password')) {
          setError('Das Passwort muss mindestens 6 Zeichen lang sein.')
        } else {
          setError(error.message)
        }
      } else {
        setStep('success')
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full mx-4
          ${step === 2 ? 'max-w-xl' : 'max-w-md'}
          bg-gradient-to-b from-accent-purple to-bg-card
          border border-white/10 rounded-2xl
          shadow-2xl p-8
          animate-in fade-in zoom-in-95 duration-200
          max-h-[90vh] overflow-y-auto
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors z-10 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Global Error */}
        {error && step === 1 && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-white">
            {error}
          </div>
        )}

        {/* Step Content with transition */}
        <div className="transition-all duration-300 ease-out">
          {step === 1 && (
            <AccountTypeStep
              onSelect={handleAccountTypeSelect}
              onGoogleSignUp={handleGoogleSignUp}
              onFacebookSignUp={handleFacebookSignUp}
              isLoading={isLoading}
            />
          )}
          {step === 2 && (
            <MembershipStep
              onSelect={handleMembershipSelect}
              onBack={() => setStep(1)}
              isLoading={isLoading}
            />
          )}
          {step === 3 && (
            <RegistrationFormStep
              onSubmit={handleFormSubmit}
              onBack={() => setStep(2)}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === 'success' && (
            <SuccessStep onClose={onClose} />
          )}
        </div>

        {/* Login link */}
        {step !== 'success' && (
          <div className="mt-6 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-text-muted">
              Bereits registriert?{' '}
              <button
                onClick={onLoginClick}
                disabled={isLoading}
                className="text-accent-purple hover:underline font-medium disabled:opacity-50"
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
