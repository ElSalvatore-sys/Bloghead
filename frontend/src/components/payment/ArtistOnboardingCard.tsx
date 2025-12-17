/**
 * Artist Onboarding Card Component
 *
 * Card component to guide artists through Stripe Connect onboarding
 * Shows current status and next steps for receiving payouts
 */

import { useState, useEffect } from 'react'
import { stripeConnectService } from '../../services/stripeService'

// ============================================
// TYPES
// ============================================

interface ArtistOnboardingCardProps {
  artistId: string
  onOnboardingComplete?: () => void
}

interface OnboardingStatus {
  hasAccount: boolean
  accountId: string | null
  isComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements: string[]
  needsOnboarding: boolean
  canReceivePayments: boolean
}

type OnboardingStep = 'not_started' | 'pending' | 'incomplete' | 'complete'

// ============================================
// HELPER FUNCTIONS
// ============================================

function getOnboardingStep(status: OnboardingStatus | null): OnboardingStep {
  if (!status || !status.hasAccount) return 'not_started'
  if (status.isComplete && status.chargesEnabled && status.payoutsEnabled) return 'complete'
  if (status.detailsSubmitted) return 'incomplete'
  return 'pending'
}

function getStepConfig(step: OnboardingStep) {
  const configs = {
    not_started: {
      icon: '🚀',
      title: 'Zahlungen aktivieren',
      description: 'Richten Sie Ihr Auszahlungskonto ein, um Zahlungen von Buchungen zu erhalten.',
      buttonText: 'Jetzt einrichten',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      statusColor: 'text-gray-400',
      statusBg: 'bg-gray-500/10',
      statusBorder: 'border-gray-500/30',
    },
    pending: {
      icon: '⏳',
      title: 'Einrichtung fortsetzen',
      description: 'Schließen Sie die Einrichtung Ihres Auszahlungskontos ab.',
      buttonText: 'Fortsetzen',
      buttonColor: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      statusColor: 'text-yellow-400',
      statusBg: 'bg-yellow-500/10',
      statusBorder: 'border-yellow-500/30',
    },
    incomplete: {
      icon: '⚠️',
      title: 'Zusätzliche Informationen erforderlich',
      description: 'Stripe benötigt zusätzliche Informationen für Ihr Konto.',
      buttonText: 'Informationen ergänzen',
      buttonColor: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
      statusColor: 'text-orange-400',
      statusBg: 'bg-orange-500/10',
      statusBorder: 'border-orange-500/30',
    },
    complete: {
      icon: '✅',
      title: 'Zahlungen aktiviert',
      description: 'Sie können jetzt Zahlungen empfangen und Auszahlungen erhalten.',
      buttonText: 'Dashboard öffnen',
      buttonColor: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      statusColor: 'text-green-400',
      statusBg: 'bg-green-500/10',
      statusBorder: 'border-green-500/30',
    },
  }
  return configs[step]
}

// ============================================
// ARTIST ONBOARDING CARD
// ============================================

export function ArtistOnboardingCard({
  artistId,
  onOnboardingComplete,
}: ArtistOnboardingCardProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current onboarding status
  useEffect(() => {
    fetchStatus()
  }, [artistId])

  const fetchStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const accountStatus = await stripeConnectService.getAccountStatus(artistId)

      // Map service response to OnboardingStatus
      const mappedStatus: OnboardingStatus = {
        hasAccount: accountStatus.hasAccount,
        accountId: accountStatus.account?.stripeAccountId || null,
        isComplete: accountStatus.account?.onboardingCompleted || false,
        chargesEnabled: accountStatus.account?.chargesEnabled || false,
        payoutsEnabled: accountStatus.account?.payoutsEnabled || false,
        detailsSubmitted: accountStatus.account?.onboardingCompleted || false,
        requirements: [],
        needsOnboarding: accountStatus.needsOnboarding,
        canReceivePayments: accountStatus.canReceivePayments,
      }

      setStatus(mappedStatus)

      // Check if onboarding just completed
      if (mappedStatus.isComplete && mappedStatus.chargesEnabled && mappedStatus.payoutsEnabled) {
        onOnboardingComplete?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = async () => {
    setIsButtonLoading(true)
    setError(null)

    try {
      const step = getOnboardingStep(status)

      if (step === 'complete') {
        // Open Stripe Express Dashboard
        const result = await stripeConnectService.getDashboardLink(artistId)
        if (result.url) {
          window.open(result.url, '_blank')
        } else {
          throw new Error(result.error || 'Dashboard-Link konnte nicht erstellt werden')
        }
      } else {
        // Start or continue onboarding
        const result = await stripeConnectService.getOnboardingLink(artistId)
        if (result.url) {
          window.location.href = result.url
        } else {
          throw new Error(result.error || 'Onboarding-Link konnte nicht erstellt werden')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Öffnen des Links')
    } finally {
      setIsButtonLoading(false)
    }
  }

  const step = getOnboardingStep(status)
  const config = getStepConfig(step)

  // Loading State
  if (isLoading) {
    return (
      <div className={`p-6 rounded-2xl ${config.statusBg} border ${config.statusBorder}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
          <div>
            <div className="h-5 w-40 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-60 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 rounded-2xl ${config.statusBg} border ${config.statusBorder}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
          {config.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${config.statusColor}`}>
            {config.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {config.description}
          </p>
        </div>
      </div>

      {/* Status Details (for incomplete accounts) */}
      {step === 'incomplete' && status?.requirements && status.requirements.length > 0 && (
        <div className="mb-6 p-4 bg-black/20 rounded-xl">
          <p className="text-sm font-medium text-white mb-2">Erforderliche Informationen:</p>
          <ul className="space-y-1">
            {status.requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                {translateRequirement(req)}
              </li>
            ))}
            {status.requirements.length > 3 && (
              <li className="text-sm text-gray-500">
                +{status.requirements.length - 3} weitere
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Status Badges (for complete accounts) */}
      {step === 'complete' && status && (
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge
            label="Zahlungen"
            enabled={status.chargesEnabled}
          />
          <StatusBadge
            label="Auszahlungen"
            enabled={status.payoutsEnabled}
          />
          <StatusBadge
            label="Verifiziert"
            enabled={status.detailsSubmitted}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleButtonClick}
        disabled={isButtonLoading}
        className={`
          w-full py-3 px-6 rounded-xl font-semibold text-white transition-all
          ${isButtonLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'}
          ${config.buttonColor}
        `}
      >
        {isButtonLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Wird geladen...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {step === 'complete' ? '📊' : '→'}
            {config.buttonText}
          </span>
        )}
      </button>

      {/* Help Link */}
      <div className="mt-4 text-center">
        <a
          href="https://support.stripe.com/topics/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          Hilfe bei der Einrichtung?
        </a>
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatusBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
        ${enabled
          ? 'bg-green-500/20 text-green-400'
          : 'bg-gray-500/20 text-gray-400'
        }
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
      {label}
    </span>
  )
}

// ============================================
// HELPER: Translate Stripe requirements to German
// ============================================

function translateRequirement(requirement: string): string {
  const translations: Record<string, string> = {
    'individual.verification.document': 'Ausweisdokument',
    'individual.verification.additional_document': 'Zusätzliches Dokument',
    'business_profile.url': 'Website-URL',
    'business_profile.mcc': 'Geschäftskategorie',
    'tos_acceptance.date': 'Nutzungsbedingungen akzeptieren',
    'external_account': 'Bankkonto hinzufügen',
    'individual.address.city': 'Stadt',
    'individual.address.line1': 'Adresse',
    'individual.address.postal_code': 'Postleitzahl',
    'individual.dob.day': 'Geburtsdatum',
    'individual.first_name': 'Vorname',
    'individual.last_name': 'Nachname',
    'individual.phone': 'Telefonnummer',
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(translations)) {
    if (requirement.includes(key)) {
      return value
    }
  }

  // Return cleaned requirement if no translation found
  return requirement
    .replace('individual.', '')
    .replace('business_profile.', '')
    .replace(/_/g, ' ')
    .replace(/\./g, ' - ')
}

export default ArtistOnboardingCard
