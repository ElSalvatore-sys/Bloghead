import { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Filter,
  Loader2,
  MapPin,
  ExternalLink,
  Users,
  Calendar,
  Euro,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
  TrendingUp,
  Inbox,
  Send,
  Ban
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useBookingRequests, useRequestStats } from '../../hooks/useBookings'
import {
  getEventTypeIcon,
  formatTimeRange,
  getExpirationStatus,
  type BookingRequest
} from '../../services/bookingService'

type RequestStatus = 'all' | 'pending' | 'accepted' | 'declined' | 'negotiating' | 'cancelled'

// Mock data fallback - used when no real data exists
const mockRequests: BookingRequest[] = [
  {
    id: '1',
    artist_id: 'artist-1',
    requester_id: 'user-1',
    veranstalter_id: null,
    event_date: '2025-02-15',
    event_time_start: '19:00',
    event_time_end: '23:00',
    event_type: 'firmenfeier',
    event_location_name: 'Kurhaus Wiesbaden',
    event_location_address: 'Kurhausplatz 1, 65189 Wiesbaden',
    event_location_maps_link: 'https://maps.google.com/?q=Kurhaus+Wiesbaden',
    event_size: 150,
    event_description: 'Jährliche Firmenfeier mit ca. 150 Gästen. Wir suchen einen DJ für gehobene Unterhaltungsmusik.',
    equipment_available: 'PA-Anlage vorhanden',
    equipment_needed: null,
    hospitality_unterbringung: true,
    hospitality_verpflegung: true,
    transport_type: 'eigene_anreise',
    proposed_budget: 2500,
    agreed_price: null,
    deposit_amount: null,
    message: 'Wir freuen uns auf Ihre Rückmeldung!',
    status: 'pending',
    rejection_reason: null,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: null,
    created_at: '2024-12-05T10:00:00Z',
    updated_at: null,
    requester: {
      id: 'user-1',
      membername: 'eventgmbh',
      vorname: 'Max',
      nachname: 'Mustermann',
      profile_image_url: null
    },
    artist: {
      id: 'artist-1',
      kuenstlername: 'DJ MaxStyle',
      jobbezeichnung: 'DJ & Producer',
      star_rating: 4.8
    }
  },
  {
    id: '2',
    artist_id: 'artist-1',
    requester_id: 'user-2',
    veranstalter_id: null,
    event_date: '2025-06-20',
    event_time_start: '14:00',
    event_time_end: '02:00',
    event_type: 'hochzeit',
    event_location_name: 'Schloss Johannisberg',
    event_location_address: 'Grund, 65366 Geisenheim',
    event_location_maps_link: 'https://maps.google.com/?q=Schloss+Johannisberg',
    event_size: 80,
    event_description: 'Traumhochzeit im Rheingau. Wir suchen einen DJ für die Feier nach der Trauung.',
    equipment_available: null,
    equipment_needed: 'Komplette DJ-Anlage benötigt',
    hospitality_unterbringung: true,
    hospitality_verpflegung: true,
    transport_type: 'shuttle',
    proposed_budget: 1800,
    agreed_price: 1800,
    deposit_amount: 500,
    message: 'Freuen uns auf einen unvergesslichen Tag!',
    status: 'accepted',
    rejection_reason: null,
    expires_at: null,
    responded_at: '2024-12-04T15:30:00Z',
    created_at: '2024-12-03T09:00:00Z',
    updated_at: '2024-12-04T15:30:00Z',
    requester: {
      id: 'user-2',
      membername: 'hochzeitsplaner',
      vorname: 'Anna',
      nachname: 'Schmidt',
      profile_image_url: null
    },
    artist: {
      id: 'artist-1',
      kuenstlername: 'DJ MaxStyle',
      jobbezeichnung: 'DJ & Producer',
      star_rating: 4.8
    }
  },
  {
    id: '3',
    artist_id: 'artist-2',
    requester_id: 'user-1',
    veranstalter_id: null,
    event_date: '2025-03-10',
    event_time_start: '18:00',
    event_time_end: '22:00',
    event_type: 'privat',
    event_location_name: 'Private Location',
    event_location_address: 'Mainz',
    event_location_maps_link: null,
    event_size: 50,
    event_description: 'Privates Geburtstagsevent mit gehobener Atmosphäre.',
    equipment_available: null,
    equipment_needed: null,
    hospitality_unterbringung: false,
    hospitality_verpflegung: true,
    transport_type: null,
    proposed_budget: 1000,
    agreed_price: null,
    deposit_amount: null,
    message: 'Leider können wir den Termin nicht wahrnehmen.',
    status: 'declined',
    rejection_reason: 'Terminkonflikt mit anderem Event',
    expires_at: null,
    responded_at: '2024-12-02T11:00:00Z',
    created_at: '2024-12-01T14:00:00Z',
    updated_at: '2024-12-02T11:00:00Z',
    requester: {
      id: 'user-1',
      membername: 'eventgmbh',
      vorname: 'Max',
      nachname: 'Mustermann',
      profile_image_url: null
    },
    artist: {
      id: 'artist-2',
      kuenstlername: 'Catering Deluxe',
      jobbezeichnung: 'Premium Catering Service',
      star_rating: 4.5
    }
  }
]

export default function MyRequestsPage() {
  const [filter, setFilter] = useState<RequestStatus>('all')
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [useMockData, setUseMockData] = useState(false)
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { requests: realRequests, loading, error, refetch, updateStatus, cancelRequest } = useBookingRequests(tab)
  const { stats, loading: statsLoading } = useRequestStats()

  // Switch to mock data if no real data or error
  useEffect(() => {
    if (!loading && (error || realRequests.length === 0)) {
      setUseMockData(true)
    } else if (realRequests.length > 0) {
      setUseMockData(false)
    }
  }, [loading, error, realRequests])

  // Filter requests
  const displayRequests = useMockData
    ? mockRequests.filter(req => {
        // For mock data, filter by status only (tab switching handled by UI)
        if (filter === 'all') return true
        return req.status === filter
      })
    : realRequests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
      })

  const toggleExpand = (requestId: string) => {
    setExpandedRequests(prev => {
      const next = new Set(prev)
      if (next.has(requestId)) {
        next.delete(requestId)
      } else {
        next.add(requestId)
      }
      return next
    })
  }

  const handleAccept = async (requestId: string) => {
    if (useMockData) return
    await updateStatus(requestId, 'accepted')
  }

  const handleDecline = async (requestId: string, reason?: string) => {
    if (useMockData) return
    await updateStatus(requestId, 'declined', reason)
  }

  const handleNegotiate = async (requestId: string) => {
    if (useMockData) return
    await updateStatus(requestId, 'negotiating')
  }

  const handleCancel = async (requestId: string) => {
    if (useMockData) return
    setCancellingId(requestId)
    await cancelRequest(requestId, 'Vom Anfragenden storniert')
    setCancellingId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm"><Clock size={14} /> Ausstehend</span>
      case 'accepted':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"><CheckCircle size={14} /> Angenommen</span>
      case 'declined':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"><XCircle size={14} /> Abgelehnt</span>
      case 'negotiating':
        return <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"><MessageCircle size={14} /> In Verhandlung</span>
      case 'cancelled':
        return <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm"><Ban size={14} /> Storniert</span>
      case 'expired':
        return <span className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm"><AlertTriangle size={14} /> Abgelaufen</span>
      default:
        return null
    }
  }

  const getProfileImage = (request: BookingRequest) => {
    if (tab === 'incoming') {
      // Show requester's image
      return request.requester?.profile_image_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          request.requester?.vorname && request.requester?.nachname
            ? `${request.requester.vorname} ${request.requester.nachname}`
            : request.requester?.membername || 'User'
        )}&background=610AD1&color=fff&size=80`
    } else {
      // Show artist's image - would need to join artist profile image
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        request.artist?.kuenstlername || 'Artist'
      )}&background=610AD1&color=fff&size=80`
    }
  }

  const getDisplayName = (request: BookingRequest) => {
    if (tab === 'incoming') {
      if (request.requester?.vorname && request.requester?.nachname) {
        return `${request.requester.vorname} ${request.requester.nachname}`
      }
      return request.requester?.membername || 'Unbekannt'
    } else {
      return request.artist?.kuenstlername || 'Unbekannt'
    }
  }

  return (
    <DashboardLayout>
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display text-white">Meine Anfragen</h1>
          {useMockData && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
              Demo-Daten
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '-' : (useMockData ? 1 : stats.pending)}
                </p>
                <p className="text-xs text-gray-500">Ausstehend</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '-' : (useMockData ? 3 : stats.totalIncoming)}
                </p>
                <p className="text-xs text-gray-500">Eingehend gesamt</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '-' : (useMockData ? 67 : stats.responseRate)}%
                </p>
                <p className="text-xs text-gray-500">Annahmerate</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '-' : (useMockData ? 2 : stats.outgoing)}
                </p>
                <p className="text-xs text-gray-500">Ausgehend</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab('incoming')
            if (!useMockData) refetch()
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            tab === 'incoming'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Inbox size={18} />
          Eingehend
        </button>
        <button
          onClick={() => {
            setTab('outgoing')
            if (!useMockData) refetch()
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            tab === 'outgoing'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Send size={18} />
          Ausgehend
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={18} className="text-gray-500" />
        {(['all', 'pending', 'accepted', 'declined', 'negotiating', 'cancelled'] as RequestStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              filter === status
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {status === 'all' ? 'Alle' :
             status === 'pending' ? 'Ausstehend' :
             status === 'accepted' ? 'Angenommen' :
             status === 'declined' ? 'Abgelehnt' :
             status === 'negotiating' ? 'Verhandlung' : 'Storniert'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && !useMockData && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Requests List */}
      {!loading && (
        <div className="space-y-4">
          {displayRequests.length === 0 ? (
            <div className="bg-bg-secondary rounded-2xl border border-white/10 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl text-white mb-2">Keine Anfragen</h3>
              <p className="text-gray-500">
                {tab === 'incoming'
                  ? 'Du hast noch keine eingehenden Anfragen.'
                  : 'Du hast noch keine Anfragen gesendet.'}
              </p>
            </div>
          ) : (
            displayRequests.map(request => {
              const expiration = getExpirationStatus(request.expires_at)
              const isExpanded = expandedRequests.has(request.id)

              return (
                <div
                  key={request.id}
                  className="bg-bg-secondary rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  {/* Main Content */}
                  <div className="p-6">
                    {/* Header Row: Profile + Event Type + Status */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        {/* Profile Image */}
                        <img
                          src={getProfileImage(request)}
                          alt={getDisplayName(request)}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-gray-400 text-sm">
                              {tab === 'incoming' ? 'Von' : 'An'}
                            </p>
                            <span className="text-white font-medium">{getDisplayName(request)}</span>
                            {request.artist?.star_rating && tab === 'outgoing' && (
                              <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                <Star size={14} className="fill-yellow-400" />
                                {request.artist.star_rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {/* Event Type Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getEventTypeIcon(request.event_type)}</span>
                            <h3 className="text-xl font-display text-white capitalize">
                              {request.event_type?.replace('_', ' ') || 'Event'}
                            </h3>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(request.status)}
                        {/* Expiration Warning */}
                        {request.status === 'pending' && expiration.isExpiringSoon && (
                          <span className="flex items-center gap-1 text-orange-400 text-xs">
                            <AlertTriangle size={12} />
                            {expiration.text}
                          </span>
                        )}
                        {request.status === 'pending' && expiration.isExpired && (
                          <span className="flex items-center gap-1 text-red-400 text-xs">
                            <AlertTriangle size={12} />
                            {expiration.text}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Calendar size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-xs">Datum & Zeit</p>
                          <p className="text-white text-sm">
                            {new Date(request.event_date).toLocaleDateString('de-DE', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatTimeRange(request.event_time_start, request.event_time_end)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-xs">Location</p>
                          <p className="text-white text-sm">{request.event_location_name || 'Nicht angegeben'}</p>
                          {request.event_location_maps_link && (
                            <a
                              href={request.event_location_maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-purple-400 text-xs hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink size={10} />
                              Karte öffnen
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Users size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-xs">Gäste</p>
                          <p className="text-white text-sm">
                            {request.event_size ? `ca. ${request.event_size}` : 'Nicht angegeben'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Euro size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-xs">Budget</p>
                          <p className="text-white text-sm">
                            {request.proposed_budget
                              ? `${request.proposed_budget.toLocaleString('de-DE')} EUR`
                              : 'Auf Anfrage'}
                          </p>
                          {request.agreed_price && (
                            <p className="text-green-400 text-xs">
                              Vereinbart: {request.agreed_price.toLocaleString('de-DE')} EUR
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message Preview */}
                    {request.message && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 italic">
                        "{request.message}"
                      </p>
                    )}

                    {/* Rejection Reason */}
                    {request.status === 'declined' && request.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                          <strong>Ablehnungsgrund:</strong> {request.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpand(request.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors mb-4"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Weniger anzeigen' : 'Mehr Details'}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
                        {/* Event Description */}
                        {request.event_description && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Event-Beschreibung</p>
                            <p className="text-white text-sm">{request.event_description}</p>
                          </div>
                        )}

                        {/* Full Address */}
                        {request.event_location_address && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Adresse</p>
                            <p className="text-white text-sm">{request.event_location_address}</p>
                          </div>
                        )}

                        {/* Equipment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {request.equipment_available && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Vorhandenes Equipment</p>
                              <p className="text-white text-sm">{request.equipment_available}</p>
                            </div>
                          )}
                          {request.equipment_needed && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Benötigtes Equipment</p>
                              <p className="text-white text-sm">{request.equipment_needed}</p>
                            </div>
                          )}
                        </div>

                        {/* Hospitality */}
                        <div className="flex flex-wrap gap-2">
                          {request.hospitality_unterbringung && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              Unterkunft gestellt
                            </span>
                          )}
                          {request.hospitality_verpflegung && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              Verpflegung gestellt
                            </span>
                          )}
                          {request.transport_type && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                              Transport: {request.transport_type.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        {/* Deposit Info */}
                        {request.deposit_amount && (
                          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-purple-400 text-sm">
                              <strong>Anzahlung:</strong> {request.deposit_amount.toLocaleString('de-DE')} EUR
                            </p>
                          </div>
                        )}

                        {/* Timestamps */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Angefragt: {new Date(request.created_at).toLocaleDateString('de-DE')}</span>
                          {request.responded_at && (
                            <span>Beantwortet: {new Date(request.responded_at).toLocaleDateString('de-DE')}</span>
                          )}
                          {request.expires_at && request.status === 'pending' && (
                            <span className={expiration.isExpiringSoon ? 'text-orange-400' : ''}>
                              Ablauf: {new Date(request.expires_at).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                      {/* Incoming Request Actions */}
                      {request.status === 'pending' && tab === 'incoming' && (
                        <>
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white transition-all flex items-center gap-2"
                          >
                            <CheckCircle size={18} />
                            Annehmen
                          </button>
                          <button
                            onClick={() => handleNegotiate(request.id)}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl text-blue-400 transition-all flex items-center gap-2"
                          >
                            <MessageCircle size={18} />
                            Verhandeln
                          </button>
                          <button
                            onClick={() => handleDecline(request.id)}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl text-red-400 transition-all flex items-center gap-2"
                          >
                            <XCircle size={18} />
                            Ablehnen
                          </button>
                        </>
                      )}

                      {/* Outgoing Request Cancel Button */}
                      {request.status === 'pending' && tab === 'outgoing' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          disabled={cancellingId === request.id}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl text-red-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === request.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Ban size={18} />
                          )}
                          Stornieren
                        </button>
                      )}

                      {/* Message Button - Always shown */}
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center gap-2">
                        <MessageCircle size={18} />
                        Nachricht
                      </button>

                      {/* View Details for accepted bookings */}
                      {request.status === 'accepted' && (
                        <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl text-purple-400 transition-all flex items-center gap-2">
                          <ExternalLink size={18} />
                          Buchung ansehen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
