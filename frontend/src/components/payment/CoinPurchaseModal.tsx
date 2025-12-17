/**
 * Coin Purchase Modal Component
 *
 * Modal for purchasing Bloghead Coins using Stripe
 * Supports German payment methods with secure checkout
 */

import { useState } from 'react'
import { CheckoutForm, PaymentStatus } from './CheckoutForm'
import { COIN_PACKAGES, coinPurchaseService, formatAmountEur, type CoinPackage } from '../../services/stripeService'

// ============================================
// TYPES
// ============================================

interface CoinPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (coins: number, bonusCoins: number) => void
  userId: string
}

type ModalStep = 'select' | 'checkout' | 'status'
type PaymentStatusType = 'processing' | 'succeeded' | 'failed'

// Extended package type with display name for UI
interface DisplayPackage extends CoinPackage {
  name: string
  priceEurCents: number
}

// ============================================
// COIN PURCHASE MODAL
// ============================================

// Convert CoinPackage to DisplayPackage for UI
function toDisplayPackage(pkg: CoinPackage): DisplayPackage {
  return {
    ...pkg,
    name: pkg.label,
    priceEurCents: pkg.priceCents,
  }
}

export function CoinPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  userId: _userId, // Reserved for future authenticated checkout
}: CoinPurchaseModalProps) {
  const [step, setStep] = useState<ModalStep>('select')
  const [selectedPackage, setSelectedPackage] = useState<DisplayPackage | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const displayPackages = COIN_PACKAGES.map(toDisplayPackage)

  const handlePackageSelect = async (pkg: DisplayPackage) => {
    setSelectedPackage(pkg)
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await coinPurchaseService.createCheckout(pkg.id)

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url
      } else {
        throw new Error(result.error || 'Keine Zahlungssitzung erhalten')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Fehler beim Starten der Zahlung')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentStatus('succeeded')
    setStep('status')

    if (selectedPackage) {
      // Trigger callback after a short delay to show success state
      setTimeout(() => {
        onSuccess(selectedPackage.coins, selectedPackage.bonus)
      }, 2000)
    }

    console.log('Payment succeeded:', paymentIntentId)
  }

  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed')
    setErrorMessage(error)
    setStep('status')
  }

  const handleRetry = () => {
    setStep('select')
    setSelectedPackage(null)
    setClientSecret(null)
    setPaymentStatus('processing')
    setErrorMessage(null)
  }

  const handleClose = () => {
    // Reset state on close
    setStep('select')
    setSelectedPackage(null)
    setClientSecret(null)
    setPaymentStatus('processing')
    setErrorMessage(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={step === 'checkout' ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1f1f1f] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-[#1f1f1f] p-6 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-xl">
              🪙
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Coins kaufen</h2>
              <p className="text-sm text-gray-400">
                {step === 'select' && 'Paket auswählen'}
                {step === 'checkout' && 'Zahlung abschließen'}
                {step === 'status' && 'Zahlungsstatus'}
              </p>
            </div>
          </div>

          {step !== 'checkout' && (
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Package Selection */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-6">
                Wählen Sie ein Coin-Paket. Coins können für Buchungen und Premium-Features verwendet werden.
              </p>

              <div className="grid gap-4">
                {displayPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg)}
                    disabled={isLoading}
                    className={`
                      relative p-4 rounded-xl border-2 text-left transition-all
                      ${pkg.popular
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.99]'}
                    `}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute -top-3 left-4 px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                        Beliebt
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold text-purple-400">
                            {pkg.coins.toLocaleString('de-DE')}
                          </span>
                          <span className="text-gray-400">Coins</span>
                          {pkg.bonus > 0 && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                              +{pkg.bonus} Bonus
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {formatAmountEur(pkg.priceEurCents)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(pkg.priceEurCents / (pkg.coins + pkg.bonus) / 100).toFixed(3)}€/Coin
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <span className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <span>Zahlung wird vorbereitet...</span>
                </div>
              )}

              {/* Info Note */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start gap-3">
                  <span className="text-xl">ℹ️</span>
                  <div className="text-sm text-gray-400">
                    <p className="font-medium text-white mb-1">Sichere Zahlung</p>
                    <p>
                      Alle Zahlungen werden sicher über Stripe abgewickelt.
                      Wir akzeptieren Kreditkarten, SEPA-Lastschrift, Giropay und Sofortüberweisung.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Step */}
          {step === 'checkout' && clientSecret && selectedPackage && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span>←</span>
                <span>Anderes Paket wählen</span>
              </button>

              {/* Selected Package Summary */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Ausgewähltes Paket</p>
                    <p className="text-lg font-bold text-white">{selectedPackage.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-300">
                      {selectedPackage.coins.toLocaleString('de-DE')} Coins
                      {selectedPackage.bonus > 0 && ` + ${selectedPackage.bonus} Bonus`}
                    </p>
                    <p className="text-lg font-bold text-white">
                      {formatAmountEur(selectedPackage.priceEurCents)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stripe Checkout Form */}
              <CheckoutForm
                clientSecret={clientSecret}
                amountCents={selectedPackage.priceEurCents}
                description={`${selectedPackage.coins.toLocaleString('de-DE')} Bloghead Coins${selectedPackage.bonus > 0 ? ` + ${selectedPackage.bonus} Bonus` : ''}`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handleRetry}
              />
            </div>
          )}

          {/* Status Step */}
          {step === 'status' && (
            <PaymentStatus
              status={paymentStatus}
              message={errorMessage || undefined}
              onRetry={paymentStatus === 'failed' ? handleRetry : undefined}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CoinPurchaseModal
