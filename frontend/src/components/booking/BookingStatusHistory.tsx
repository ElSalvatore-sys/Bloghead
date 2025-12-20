import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, User, CheckCircle, XCircle, AlertCircle, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { getBookingStatusHistory } from '../../services/bookingMessagesService'
import type { BookingStatusHistory as StatusHistoryType } from '../../types/booking'
import { BOOKING_REQUEST_STATUS_LABELS } from '../../types/booking'

interface BookingStatusHistoryProps {
  bookingId: string
  className?: string
}

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  draft: FileText,
  pending: Clock,
  accepted: CheckCircle,
  rejected: XCircle,
  negotiating: AlertCircle,
  confirmed: CheckCircle,
  deposit_pending: DollarSign,
  deposit_paid: DollarSign,
  completed: CheckCircle,
  cancelled: XCircle,
  expired: Clock,
  disputed: AlertCircle,
}

const STATUS_BG_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  accepted: 'bg-blue-500/20 text-blue-400',
  rejected: 'bg-red-500/20 text-red-400',
  negotiating: 'bg-orange-500/20 text-orange-400',
  confirmed: 'bg-green-500/20 text-green-400',
  deposit_pending: 'bg-yellow-500/20 text-yellow-400',
  deposit_paid: 'bg-green-500/20 text-green-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  expired: 'bg-gray-500/20 text-gray-400',
  disputed: 'bg-red-500/20 text-red-400',
}

export function BookingStatusHistory({ bookingId, className = '' }: BookingStatusHistoryProps) {
  const [history, setHistory] = useState<StatusHistoryType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getBookingStatusHistory(bookingId)
        setHistory(data)
      } catch (error) {
        console.error('Error loading status history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [bookingId])

  const getStatusLabel = (status: string): string => {
    return BOOKING_REQUEST_STATUS_LABELS[status as keyof typeof BOOKING_REQUEST_STATUS_LABELS] || status
  }

  if (isLoading) {
    return (
      <div className={`bg-bg-card rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-bg-card rounded-xl p-6 ${className}`}>
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent-purple" />
        Status-Verlauf
      </h3>

      {history.length === 0 ? (
        <p className="text-white/60 text-center py-4">
          Noch keine Statusänderungen
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => {
            const Icon = STATUS_ICONS[item.new_status] || Clock
            const bgColor = STATUS_BG_COLORS[item.new_status] || 'bg-gray-500/20 text-gray-400'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full min-h-[24px] bg-white/10 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.previous_status && (
                      <>
                        <span className="text-white/60 text-sm">
                          {getStatusLabel(item.previous_status)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/40" />
                      </>
                    )}
                    <span className="font-medium text-white">
                      {getStatusLabel(item.new_status)}
                    </span>
                  </div>

                  {item.change_reason && (
                    <p className="text-sm text-white/60 mt-1">
                      {item.change_reason}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    <span>
                      {format(new Date(item.created_at), "d. MMMM yyyy 'um' HH:mm", { locale: de })}
                    </span>
                    {item.changed_by_user && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.changed_by_user.vorname} {item.changed_by_user.nachname}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BookingStatusHistory
