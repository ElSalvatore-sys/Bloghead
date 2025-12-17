/**
 * Payment Method Selector Component
 *
 * Displays and manages saved payment methods for a user
 * Supports German payment methods (Cards, SEPA, Giropay)
 */

import { useState, useEffect } from 'react'
import { paymentMethodsService, GERMAN_PAYMENT_METHODS } from '../../services/stripeService'

// ============================================
// TYPES
// ============================================

interface PaymentMethod {
  id: string
  stripePaymentMethodId: string
  type: 'card' | 'sepa_debit' | 'giropay' | 'sofort'
  isDefault: boolean
  // Card-specific
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  // SEPA-specific
  sepaBankName?: string
  sepaLast4?: string
  // Billing
  billingName?: string
  billingEmail?: string
}

interface PaymentMethodSelectorProps {
  userId: string
  selectedMethodId?: string
  onSelect: (methodId: string) => void
  onAddNew?: () => void
  showAddNew?: boolean
  disabled?: boolean
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPaymentMethodIcon(type: string, brand?: string): string {
  if (type === 'card') {
    const brandIcons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
    }
    return brandIcons[brand?.toLowerCase() || ''] || '💳'
  }

  const typeIcons: Record<string, string> = {
    sepa_debit: '🏦',
    giropay: '🔵',
    sofort: '🟠',
  }
  return typeIcons[type] || '💳'
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  if (method.type === 'card' && method.cardBrand && method.cardLast4) {
    return `${method.cardBrand.charAt(0).toUpperCase()}${method.cardBrand.slice(1)} •••• ${method.cardLast4}`
  }

  if (method.type === 'sepa_debit' && method.sepaLast4) {
    return `SEPA ${method.sepaBankName ? `(${method.sepaBankName})` : ''} •••• ${method.sepaLast4}`
  }

  return GERMAN_PAYMENT_METHODS.find(m => m.id === method.type)?.label || method.type
}

function getExpiryLabel(month?: number, year?: number): string | null {
  if (!month || !year) return null
  return `Gültig bis ${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
}

function isExpired(month?: number, year?: number): boolean {
  if (!month || !year) return false
  const now = new Date()
  const expiry = new Date(year, month - 1)
  return expiry < now
}

// ============================================
// PAYMENT METHOD SELECTOR
// ============================================

export function PaymentMethodSelector({
  userId,
  selectedMethodId,
  onSelect,
  onAddNew,
  showAddNew = true,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch payment methods on mount
  useEffect(() => {
    fetchPaymentMethods()
  }, [userId])

  const fetchPaymentMethods = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await paymentMethodsService.getSavedMethods(userId)
      // Map the result to PaymentMethod interface
      const mappedMethods: PaymentMethod[] = result.methods.map((m) => ({
        id: m.id,
        stripePaymentMethodId: m.id, // Assuming id is the Stripe ID
        type: m.type as PaymentMethod['type'],
        isDefault: m.isDefault,
        cardBrand: m.cardBrand,
        cardLast4: m.cardLast4,
        cardExpMonth: m.cardExpMonth,
        cardExpYear: m.cardExpYear,
        sepaBankName: m.sepaBankName,
        sepaLast4: m.sepaLast4,
      }))
      setMethods(mappedMethods)

      // Auto-select default method if none selected
      if (!selectedMethodId && mappedMethods.length > 0) {
        const defaultMethod = mappedMethods.find(m => m.isDefault) || mappedMethods[0]
        onSelect(defaultMethod.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Zahlungsmethoden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      await paymentMethodsService.setDefault(methodId)
      setMethods(prev =>
        prev.map(m => ({
          ...m,
          isDefault: m.id === methodId,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Setzen der Standard-Zahlungsmethode')
    }
  }

  const handleDelete = async (methodId: string) => {
    if (!confirm('Möchten Sie diese Zahlungsmethode wirklich entfernen?')) return

    setDeletingId(methodId)
    try {
      await paymentMethodsService.remove(methodId)
      setMethods(prev => prev.filter(m => m.id !== methodId))

      // If deleted method was selected, select another
      if (selectedMethodId === methodId && methods.length > 1) {
        const remaining = methods.filter(m => m.id !== methodId)
        onSelect(remaining[0]?.id || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Entfernen der Zahlungsmethode')
    } finally {
      setDeletingId(null)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div
            key={i}
            className="p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-red-400 text-lg">⚠️</span>
          <div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchPaymentMethods}
              className="mt-2 text-sm text-purple-400 hover:text-purple-300"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (methods.length === 0) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center text-3xl mb-4">
          💳
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Keine Zahlungsmethoden
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Fügen Sie eine Zahlungsmethode hinzu, um Buchungen durchzuführen.
        </p>
        {showAddNew && onAddNew && (
          <button
            onClick={onAddNew}
            disabled={disabled}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Zahlungsmethode hinzufügen
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Payment Methods List */}
      {methods.map(method => {
        const isSelected = selectedMethodId === method.id
        const expired = method.type === 'card' && isExpired(method.cardExpMonth, method.cardExpYear)
        const isDeleting = deletingId === method.id

        return (
          <div
            key={method.id}
            className={`
              relative p-4 rounded-xl border-2 transition-all cursor-pointer
              ${isSelected
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              }
              ${disabled || isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
              ${expired ? 'border-red-500/50' : ''}
            `}
            onClick={() => !disabled && !isDeleting && !expired && onSelect(method.id)}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${isSelected ? 'bg-purple-500/20' : 'bg-white/10'}
                `}
              >
                {getPaymentMethodIcon(method.type, method.cardBrand)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white truncate">
                    {getPaymentMethodLabel(method)}
                  </p>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                      Standard
                    </span>
                  )}
                  {expired && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                      Abgelaufen
                    </span>
                  )}
                </div>
                {method.type === 'card' && (
                  <p className={`text-sm ${expired ? 'text-red-400' : 'text-gray-400'}`}>
                    {getExpiryLabel(method.cardExpMonth, method.cardExpYear)}
                  </p>
                )}
                {method.billingName && (
                  <p className="text-sm text-gray-500 truncate">
                    {method.billingName}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Radio Button */}
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-purple-500' : 'border-gray-500'}
                  `}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  )}
                </div>

                {/* Dropdown Menu */}
                <MethodMenu
                  method={method}
                  onSetDefault={() => handleSetDefault(method.id)}
                  onDelete={() => handleDelete(method.id)}
                  disabled={disabled || isDeleting}
                />
              </div>
            </div>

            {/* Loading Overlay */}
            {isDeleting && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        )
      })}

      {/* Add New Button */}
      {showAddNew && onAddNew && (
        <button
          onClick={onAddNew}
          disabled={disabled}
          className="w-full p-4 border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">+</span>
          <span>Neue Zahlungsmethode hinzufügen</span>
        </button>
      )}
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface MethodMenuProps {
  method: PaymentMethod
  onSetDefault: () => void
  onDelete: () => void
  disabled: boolean
}

function MethodMenu({ method, onSetDefault, onDelete, disabled }: MethodMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
      >
        ⋮
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 z-50 w-48 py-1 bg-[#2d2d2d] border border-white/10 rounded-lg shadow-xl">
            {!method.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSetDefault()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
              >
                Als Standard festlegen
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Entfernen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default PaymentMethodSelector
