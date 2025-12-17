/**
 * Stripe Checkout Form Component
 *
 * Handles payment collection with German payment methods:
 * - Credit/Debit Cards (Visa, Mastercard, Amex)
 * - SEPA Direct Debit
 * - Giropay
 * - Sofortüberweisung
 */

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import type { StripeElementsOptions, Appearance } from '@stripe/stripe-js'
import { getStripe, formatAmountEur, getGermanErrorMessage } from '../../services/stripeService'

// ============================================
// TYPES
// ============================================

interface CheckoutFormProps {
  clientSecret: string
  amountCents: number
  description?: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  onCancel?: () => void
  returnUrl?: string
}

interface CheckoutFormInnerProps extends Omit<CheckoutFormProps, 'clientSecret'> {}

// ============================================
// STRIPE APPEARANCE (Dark Theme)
// ============================================

const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#a855f7', // Purple-500
    colorBackground: '#1f1f1f',
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    colorTextSecondary: '#9ca3af',
    colorTextPlaceholder: '#6b7280',
    fontFamily: 'Roboto, system-ui, -apple-system, sans-serif',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#2d2d2d',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'none',
    },
    '.Input:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '.Input:focus': {
      border: '1px solid #a855f7',
      boxShadow: '0 0 0 1px #a855f7',
    },
    '.Input--invalid': {
      border: '1px solid #ef4444',
    },
    '.Label': {
      color: '#9ca3af',
      fontSize: '14px',
      fontWeight: '500',
    },
    '.Tab': {
      backgroundColor: '#2d2d2d',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    '.Tab:hover': {
      backgroundColor: '#3d3d3d',
    },
    '.Tab--selected': {
      backgroundColor: '#a855f7',
      borderColor: '#a855f7',
    },
    '.TabIcon': {
      fill: '#9ca3af',
    },
    '.TabIcon--selected': {
      fill: '#ffffff',
    },
  },
}

// ============================================
// INNER FORM COMPONENT
// ============================================

function CheckoutFormInner({
  amountCents,
  description,
  onSuccess,
  onError,
  onCancel,
  returnUrl,
}: CheckoutFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Handle error
        const germanMessage = error.code
          ? getGermanErrorMessage(error.code)
          : error.message || 'Zahlung fehlgeschlagen'

        setErrorMessage(germanMessage)
        onError(germanMessage)
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent.id)
        } else if (paymentIntent.status === 'processing') {
          // Payment is processing (e.g., SEPA)
          onSuccess(paymentIntent.id)
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other action required
          setErrorMessage('Zusätzliche Authentifizierung erforderlich. Bitte folgen Sie den Anweisungen.')
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Summary */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Zu zahlen</p>
            <p className="text-2xl font-bold text-white">{formatAmountEur(amountCents)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-xl">
            💳
          </div>
        </div>
        {description && (
          <p className="text-sm text-gray-400 mt-2">{description}</p>
        )}
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'sepa_debit', 'giropay', 'sofort'],
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'DE',
                },
              },
            },
            business: {
              name: 'Bloghead',
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-white transition-all
          ${isProcessing || !stripe
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 active:scale-[0.99]'
          }
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Wird verarbeitet...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🔒 {formatAmountEur(amountCents)} bezahlen
          </span>
        )}
      </button>

      {/* Cancel Button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full py-3 px-6 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Abbrechen
        </button>
      )}

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>🔐</span>
        <span>Sichere Zahlung über Stripe. Ihre Daten sind verschlüsselt.</span>
      </div>

      {/* Accepted Payment Methods */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
        <span className="text-xs text-gray-500">Akzeptierte Zahlungsmethoden:</span>
        <div className="flex items-center gap-2">
          <span title="Visa">💳</span>
          <span title="Mastercard">💳</span>
          <span title="SEPA">🏦</span>
          <span title="Giropay">🔵</span>
        </div>
      </div>
    </form>
  )
}

// ============================================
// MAIN CHECKOUT FORM (with Elements Provider)
// ============================================

export function CheckoutForm(props: CheckoutFormProps) {
  const stripePromise = getStripe()

  const elementsOptions: StripeElementsOptions = {
    clientSecret: props.clientSecret,
    appearance: stripeAppearance,
    locale: 'de',
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutFormInner
        amountCents={props.amountCents}
        description={props.description}
        onSuccess={props.onSuccess}
        onError={props.onError}
        onCancel={props.onCancel}
        returnUrl={props.returnUrl}
      />
    </Elements>
  )
}

// ============================================
// PAYMENT STATUS COMPONENT
// ============================================

interface PaymentStatusProps {
  status: 'processing' | 'succeeded' | 'failed'
  message?: string
  onRetry?: () => void
  onClose?: () => void
}

export function PaymentStatus({ status, message, onRetry, onClose }: PaymentStatusProps) {
  const statusConfig = {
    processing: {
      icon: '⏳',
      title: 'Zahlung wird verarbeitet',
      description: 'Ihre Zahlung wird verarbeitet. Dies kann bei SEPA-Lastschriften einige Tage dauern.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    succeeded: {
      icon: '✅',
      title: 'Zahlung erfolgreich',
      description: 'Ihre Zahlung wurde erfolgreich verarbeitet.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    failed: {
      icon: '❌',
      title: 'Zahlung fehlgeschlagen',
      description: message || 'Die Zahlung konnte nicht verarbeitet werden.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`p-6 rounded-2xl ${config.bgColor} border ${config.borderColor}`}>
      <div className="text-center space-y-4">
        <span className="text-5xl">{config.icon}</span>
        <h3 className={`text-xl font-semibold ${config.color}`}>{config.title}</h3>
        <p className="text-gray-400">{config.description}</p>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
            >
              Erneut versuchen
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-6 ${
                status === 'succeeded'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-white/10 hover:bg-white/20'
              } text-white font-medium rounded-xl transition-colors`}
            >
              {status === 'succeeded' ? 'Weiter' : 'Schließen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutForm
