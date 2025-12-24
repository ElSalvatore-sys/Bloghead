import { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Euro,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  CalendarCheck,
  TrendingUp,
  Wallet,
  Building2
} from 'lucide-react'
import { BookingsPageSkeleton } from '@/components/ui/DashboardSkeletons'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useBookings, useBookingStats } from '../../hooks/useBookings'
import {
  formatTimeRange,
  getEventTypeIcon,
  getPaymentMilestones,
  getContractStatus,
  getPayoutStatus,
  getCalendarSyncStatus,
  BOOKING_STATUS_CONFIG,
  type Booking
} from '../../services/bookingService'

type BookingTab = 'upcoming' | 'past'

// Mock data fallback
const mockBookings: Booking[] = [
  {
    id: 'mock-1',
    booking_number: 'BH-2024-000001',
    request_id: null,
    artist_id: 'artist-1',
    client_id: 'client-1',
    veranstalter_id: null,
    event_date: '2025-02-15',
    event_time_start: '19:00',
    event_time_end: '23:00',
    event_type: 'firmenfeier',
    event_location_name: 'TechCorp HQ',
    event_location_address: 'Frankfurt am Main',
    event_size: 150,
    contract_url: 'https://example.com/contract.pdf',
    contract_signed_artist: true,
    contract_signed_artist_at: '2024-12-01',
    contract_signed_client: true,
    contract_signed_client_at: '2024-12-02',
    total_price: 2500,
    deposit_amount: 500,
    deposit_due_date: '2025-01-15',
    deposit_paid_at: '2025-01-10',
    final_payment_amount: 2000,
    final_payment_due_date: '2025-02-20',
    final_payment_paid_at: null,
    platform_fee_percentage: 10,
    platform_fee_amount: 250,
    artist_payout_amount: 2250,
    payout_status: 'pending',
    payout_scheduled_date: '2025-02-22',
    payout_completed_at: null,
    status: 'confirmed',
    cancellation_policy: null,
    cancellation_fee_percentage: null,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    google_calendar_event_id: 'gc-123',
    apple_calendar_event_id: null,
    ical_uid: null,
    created_at: '2024-12-01',
    updated_at: null,
    artist_profile: {
      id: 'artist-1',
      kuenstlername: 'DJ MaxBeat',
      jobbezeichnung: 'DJ & Producer',
      star_rating: 4.8
    },
    client: {
      id: 'client-1',
      membername: 'techcorp',
      vorname: 'Max',
      nachname: 'Mustermann',
      profile_image_url: null
    }
  },
  {
    id: 'mock-2',
    booking_number: 'BH-2024-000002',
    request_id: null,
    artist_id: 'artist-1',
    client_id: 'client-2',
    veranstalter_id: null,
    event_date: '2025-06-20',
    event_time_start: '15:00',
    event_time_end: '02:00',
    event_type: 'hochzeit',
    event_location_name: 'Schloss Rheingau',
    event_location_address: 'Rheingau',
    event_size: 80,
    contract_url: 'https://example.com/contract2.pdf',
    contract_signed_artist: true,
    contract_signed_artist_at: '2024-11-15',
    contract_signed_client: false,
    contract_signed_client_at: null,
    total_price: 1800,
    deposit_amount: 400,
    deposit_due_date: '2025-03-01',
    deposit_paid_at: null,
    final_payment_amount: 1400,
    final_payment_due_date: '2025-06-25',
    final_payment_paid_at: null,
    platform_fee_percentage: 10,
    platform_fee_amount: 180,
    artist_payout_amount: 1620,
    payout_status: null,
    payout_scheduled_date: null,
    payout_completed_at: null,
    status: 'confirmed',
    cancellation_policy: null,
    cancellation_fee_percentage: null,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    google_calendar_event_id: null,
    apple_calendar_event_id: null,
    ical_uid: null,
    created_at: '2024-11-01',
    updated_at: null,
    artist_profile: {
      id: 'artist-1',
      kuenstlername: 'DJ MaxBeat',
      jobbezeichnung: 'DJ & Producer',
      star_rating: 4.8
    },
    client: {
      id: 'client-2',
      membername: 'meyer_wedding',
      vorname: 'Lisa',
      nachname: 'Meyer',
      profile_image_url: null
    }
  },
  {
    id: 'mock-3',
    booking_number: 'BH-2024-000003',
    request_id: null,
    artist_id: 'artist-1',
    client_id: 'client-3',
    veranstalter_id: null,
    event_date: '2024-11-10',
    event_time_start: '20:00',
    event_time_end: '01:00',
    event_type: 'geburtstag',
    event_location_name: 'Private Villa',
    event_location_address: 'Wiesbaden',
    event_size: 50,
    contract_url: 'https://example.com/contract3.pdf',
    contract_signed_artist: true,
    contract_signed_artist_at: '2024-10-01',
    contract_signed_client: true,
    contract_signed_client_at: '2024-10-02',
    total_price: 800,
    deposit_amount: 200,
    deposit_due_date: '2024-10-15',
    deposit_paid_at: '2024-10-12',
    final_payment_amount: 600,
    final_payment_due_date: '2024-11-15',
    final_payment_paid_at: '2024-11-12',
    platform_fee_percentage: 10,
    platform_fee_amount: 80,
    artist_payout_amount: 720,
    payout_status: 'completed',
    payout_scheduled_date: '2024-11-17',
    payout_completed_at: '2024-11-17',
    status: 'completed',
    cancellation_policy: null,
    cancellation_fee_percentage: null,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    google_calendar_event_id: 'gc-456',
    apple_calendar_event_id: null,
    ical_uid: 'ical-123',
    created_at: '2024-09-15',
    updated_at: null,
    artist_profile: {
      id: 'artist-1',
      kuenstlername: 'DJ MaxBeat',
      jobbezeichnung: 'DJ & Producer',
      star_rating: 4.8
    },
    client: {
      id: 'client-3',
      membername: 'max_party',
      vorname: 'Max',
      nachname: 'Schmidt',
      profile_image_url: null
    }
  }
]

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-white',
  loading = false
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: string
  loading?: boolean
}) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon size={18} />
        </div>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>
        {loading ? '...' : value}
      </p>
    </div>
  )
}

// Payment milestone badge
function PaymentBadge({
  milestone
}: {
  milestone: { label: string; isPaid: boolean; isOverdue: boolean; daysUntilDue: number | null }
}) {
  if (milestone.isPaid) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
        <CheckCircle2 size={12} />
        {milestone.label} bezahlt
      </span>
    )
  }

  if (milestone.isOverdue) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
        <AlertCircle size={12} />
        {milestone.label} überfällig
      </span>
    )
  }

  if (milestone.daysUntilDue !== null && milestone.daysUntilDue <= 7) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
        <Clock size={12} />
        {milestone.label} in {milestone.daysUntilDue}T
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
      {milestone.label} ausstehend
    </span>
  )
}

// Booking card component
function BookingCard({ booking, isPast }: { booking: Booking; isPast: boolean }) {
  const statusConfig = BOOKING_STATUS_CONFIG[booking.status]
  const contractStatus = getContractStatus(booking)
  const payoutStatus = getPayoutStatus(booking)
  const calendarSync = getCalendarSyncStatus(booking)
  const paymentMilestones = getPaymentMilestones(booking)

  // Get client display name
  const clientName = booking.client
    ? `${booking.client.vorname} ${booking.client.nachname}`
    : booking.veranstalter?.company_name || 'Unbekannt'

  return (
    <div className="bg-bg-secondary rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          {/* Event type icon */}
          <div className="text-4xl">
            {getEventTypeIcon(booking.event_type)}
          </div>
          <div>
            <p className="text-purple-400 text-sm font-mono mb-1">{booking.booking_number}</p>
            <h3 className="text-xl font-display text-white">
              {booking.event_type
                ? booking.event_type.charAt(0).toUpperCase() + booking.event_type.slice(1)
                : 'Event'}
            </h3>
            <p className="text-gray-400 flex items-center gap-2">
              <Building2 size={14} />
              {clientName}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          {calendarSync.anySync && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
              <CalendarCheck size={12} />
              Sync
            </span>
          )}
        </div>
      </div>

      {/* Event details grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={18} />
          <span>{new Date(booking.event_date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={18} />
          <span>{formatTimeRange(booking.event_time_start, booking.event_time_end)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin size={18} />
          <span className="truncate" title={booking.event_location_address || ''}>
            {booking.event_location_name || booking.event_location_address || 'Ort nicht angegeben'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={18} />
          <span>{booking.event_size || '?'} Gäste</span>
        </div>
        <div className="flex items-center gap-2 text-green-400 font-bold">
          <Euro size={18} />
          <span>{booking.total_price.toLocaleString('de-DE')} EUR</span>
        </div>
      </div>

      {/* Contract & Payment section */}
      <div className="border-t border-white/10 pt-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contract status */}
          <div className="flex items-center gap-3">
            <FileText size={18} className={
              contractStatus.color === 'green' ? 'text-green-400' :
              contractStatus.color === 'yellow' ? 'text-yellow-400' :
              'text-gray-400'
            } />
            <div>
              <p className="text-xs text-gray-500">Vertrag</p>
              <p className={`text-sm ${
                contractStatus.color === 'green' ? 'text-green-400' :
                contractStatus.color === 'yellow' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {contractStatus.label}
              </p>
            </div>
          </div>

          {/* Payment milestones */}
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {paymentMilestones.length > 0 ? (
                paymentMilestones.map((m, i) => (
                  <PaymentBadge key={i} milestone={m} />
                ))
              ) : (
                <span className="text-xs text-gray-500">Keine Zahlungen</span>
              )}
            </div>
          </div>

          {/* Payout status (for artists) */}
          <div className="flex items-center gap-3">
            <Wallet size={18} className={
              payoutStatus.color === 'green' ? 'text-green-400' :
              payoutStatus.color === 'blue' ? 'text-blue-400' :
              payoutStatus.color === 'yellow' ? 'text-yellow-400' :
              payoutStatus.color === 'red' ? 'text-red-400' :
              'text-gray-400'
            } />
            <div>
              <p className="text-xs text-gray-500">Auszahlung</p>
              <p className={`text-sm ${
                payoutStatus.color === 'green' ? 'text-green-400' :
                payoutStatus.color === 'blue' ? 'text-blue-400' :
                payoutStatus.color === 'yellow' ? 'text-yellow-400' :
                payoutStatus.color === 'red' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {payoutStatus.label}
                {payoutStatus.amount && ` (${payoutStatus.amount.toLocaleString('de-DE')} EUR)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center gap-2">
          <ExternalLink size={18} />
          Details
        </button>
        {booking.contract_url && (
          <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl text-purple-400 transition-all flex items-center gap-2">
            <FileText size={18} />
            Vertrag
          </button>
        )}
        {isPast && booking.status === 'completed' && (
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 transition-all">
            Bewertung abgeben
          </button>
        )}
        {!isPast && !calendarSync.anySync && (
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-blue-400 transition-all flex items-center gap-2">
            <CalendarCheck size={18} />
            Kalender sync
          </button>
        )}
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const [tab, setTab] = useState<BookingTab>('upcoming')
  const [useMockData, setUseMockData] = useState(false)

  const { bookings: realBookings, loading, error } = useBookings(tab)
  const { stats, loading: statsLoading } = useBookingStats()

  // Switch to mock data if no real data or error
  useEffect(() => {
    if (!loading && (error || realBookings.length === 0)) {
      setUseMockData(true)
    } else if (realBookings.length > 0) {
      setUseMockData(false)
    }
  }, [loading, error, realBookings])

  // Filter mock data by tab
  const displayBookings: Booking[] = useMockData
    ? mockBookings.filter(b => {
        const eventDate = new Date(b.event_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return tab === 'upcoming' ? eventDate >= today : eventDate < today
      })
    : realBookings

  // Calculate stats from mock data if needed
  const displayStats = useMockData
    ? {
        upcoming: mockBookings.filter(b => new Date(b.event_date) >= new Date()).length,
        completed: mockBookings.filter(b => b.status === 'completed').length,
        thisMonth: 1,
        totalRevenue: mockBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.total_price, 0),
        pendingPayout: mockBookings
          .filter(b => b.status === 'completed' && !b.payout_completed_at)
          .reduce((sum, b) => sum + (b.artist_payout_amount || 0), 0)
      }
    : stats

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display text-white">Meine Buchungen</h1>
        {useMockData && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            Demo-Daten
          </span>
        )}
      </div>

      {/* Stats with icons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={Calendar}
          label="Anstehend"
          value={displayStats.upcoming}
          color="text-white"
          loading={statsLoading && !useMockData}
        />
        <StatCard
          icon={CheckCircle2}
          label="Abgeschlossen"
          value={displayStats.completed}
          color="text-white"
          loading={statsLoading && !useMockData}
        />
        <StatCard
          icon={TrendingUp}
          label="Diesen Monat"
          value={displayStats.thisMonth}
          color="text-purple-400"
          loading={statsLoading && !useMockData}
        />
        <StatCard
          icon={Euro}
          label="Gesamtumsatz"
          value={`${displayStats.totalRevenue.toLocaleString('de-DE')} EUR`}
          color="text-green-400"
          loading={statsLoading && !useMockData}
        />
        <StatCard
          icon={Wallet}
          label="Ausstehend"
          value={`${displayStats.pendingPayout.toLocaleString('de-DE')} EUR`}
          color="text-yellow-400"
          loading={statsLoading && !useMockData}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            tab === 'upcoming'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Calendar size={18} />
          Anstehend
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            tab === 'past'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <CheckCircle2 size={18} />
          Vergangen
        </button>
      </div>

      {/* Loading State */}
      {loading && !useMockData && <BookingsPageSkeleton />}

      {/* Bookings List */}
      {!loading && (
        <div className="space-y-4">
          {displayBookings.length === 0 ? (
            <div className="bg-bg-secondary rounded-2xl border border-white/10 p-12 text-center">
              <div className="text-6xl mb-4">
                {tab === 'upcoming' ? '📅' : '✅'}
              </div>
              <h3 className="text-xl text-white mb-2">Keine Buchungen</h3>
              <p className="text-gray-500">
                {tab === 'upcoming'
                  ? 'Du hast keine anstehenden Buchungen.'
                  : 'Du hast noch keine abgeschlossenen Buchungen.'}
              </p>
            </div>
          ) : (
            displayBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isPast={tab === 'past'}
              />
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
