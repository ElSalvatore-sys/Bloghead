import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

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
  onRegister: (data: RegistrationData) => void
  onLoginClick: () => void
}

type Step = 1 | 2 | 3

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

// Step 1: Account Type Selection
function AccountTypeStep({
  onSelect,
}: {
  onSelect: (type: AccountType) => void
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
          className="w-full py-4 px-6 bg-gradient-to-r from-accent-red to-accent-salmon text-white font-bold uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
        >
          ARTIST / VERANSTALTER
        </button>

        {/* Secondary choices - outline buttons */}
        <button
          onClick={() => onSelect('customer')}
          className="w-full py-4 px-6 bg-transparent border-2 border-accent-purple text-white font-bold uppercase tracking-wider rounded-full hover:bg-accent-purple/20 transition-all duration-200"
        >
          CUSTOMER
        </button>

        <button
          onClick={() => onSelect('fan')}
          className="w-full py-4 px-6 bg-transparent border-2 border-accent-purple text-white font-bold uppercase tracking-wider rounded-full hover:bg-accent-purple/20 transition-all duration-200"
        >
          FAN
        </button>
      </div>
    </div>
  )
}

// Step 2: Membership Selection
function MembershipStep({
  onSelect,
  onBack,
}: {
  onSelect: (tier: MembershipTier) => void
  onBack: () => void
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
              <span>Vorteil 1</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Vorteil 2</span>
            </li>
          </ul>
          <button
            onClick={() => onSelect('basic')}
            className="w-full py-3 px-4 bg-transparent border-2 border-white/30 text-white font-bold uppercase text-sm tracking-wider rounded-full hover:border-white/50 hover:bg-white/10 transition-all duration-200"
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
              <span>Vorteil 1</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Vorteil 2</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Vorteil 3</span>
            </li>
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <svg className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Vorteil 4</span>
            </li>
          </ul>
          <button
            onClick={() => onSelect('premium')}
            className="w-full py-3 px-4 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold uppercase text-sm tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            AUSWÄHLEN
          </button>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-3 text-text-muted hover:text-white text-sm uppercase tracking-wider transition-colors duration-200"
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
}: {
  onSubmit: (data: Omit<RegistrationData, 'accountType' | 'membershipTier'>) => void
  onBack: () => void
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
  `

  return (
    <div>
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide text-center mb-6">
        REGISTRIEREN
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="NAME"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
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
          className="w-full py-4 mt-4 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold uppercase tracking-wider rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
        >
          REGISTRIEREN
        </button>
      </form>

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-3 mt-4 text-text-muted hover:text-white text-sm uppercase tracking-wider transition-colors duration-200"
      >
        ← Zurück
      </button>
    </div>
  )
}

// Main RegisterModal component
export function RegisterModal({
  isOpen,
  onClose,
  onRegister,
  onLoginClick,
}: RegisterModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationData>>({})

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setRegistrationData({})
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleAccountTypeSelect = (type: AccountType) => {
    setRegistrationData((prev) => ({ ...prev, accountType: type }))
    setStep(2)
  }

  const handleMembershipSelect = (tier: MembershipTier) => {
    setRegistrationData((prev) => ({ ...prev, membershipTier: tier }))
    setStep(3)
  }

  const handleFormSubmit = (formData: Omit<RegistrationData, 'accountType' | 'membershipTier'>) => {
    const completeData: RegistrationData = {
      accountType: registrationData.accountType!,
      membershipTier: registrationData.membershipTier!,
      ...formData,
    }
    onRegister(completeData)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
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
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Step Content with transition */}
        <div className="transition-all duration-300 ease-out">
          {step === 1 && <AccountTypeStep onSelect={handleAccountTypeSelect} />}
          {step === 2 && (
            <MembershipStep
              onSelect={handleMembershipSelect}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <RegistrationFormStep
              onSubmit={handleFormSubmit}
              onBack={() => setStep(2)}
            />
          )}
        </div>

        {/* Login link */}
        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <p className="text-sm text-text-muted">
            Bereits registriert?{' '}
            <button
              onClick={onLoginClick}
              className="text-accent-purple hover:underline font-medium"
            >
              Anmelden
            </button>
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
