import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, MessageCircle, Filter, Loader2 } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useBookingRequests } from '../../hooks/useBookings'

type RequestStatus = 'all' | 'pending' | 'accepted' | 'declined'

// Mock data fallback - used when no real data exists
const mockRequests = [
  {
    id: '1',
    type: 'incoming',
    from: 'Event GmbH',
    to: '',
    event: 'Firmenfeier 2025',
    date: '2025-02-15',
    guests: 150,
    budget: '2.500 EUR',
    status: 'pending',
    message: 'Wir suchen einen DJ für unsere Firmenfeier...',
    createdAt: '2024-12-05'
  },
  {
    id: '2',
    type: 'incoming',
    from: 'Hochzeitsplaner Schmidt',
    to: '',
    event: 'Hochzeit Meyer',
    date: '2025-06-20',
    guests: 80,
    budget: '1.800 EUR',
    status: 'accepted',
    message: 'Für eine Hochzeit im Rheingau suchen wir...',
    createdAt: '2024-12-03'
  },
  {
    id: '3',
    type: 'outgoing',
    from: '',
    to: 'Catering Deluxe',
    event: 'Mein Event',
    date: '2025-03-10',
    guests: 50,
    budget: '1.000 EUR',
    status: 'declined',
    message: 'Ich benötige Catering für ein privates Event...',
    createdAt: '2024-12-01'
  }
]

export default function MyRequestsPage() {
  const [filter, setFilter] = useState<RequestStatus>('all')
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [useMockData, setUseMockData] = useState(false)

  const { requests: realRequests, loading, error, refetch, updateStatus } = useBookingRequests(tab)

  // Switch to mock data if no real data or error
  useEffect(() => {
    if (!loading && (error || realRequests.length === 0)) {
      setUseMockData(true)
    } else if (realRequests.length > 0) {
      setUseMockData(false)
    }
  }, [loading, error, realRequests])

  // Transform real requests to display format or use mock data
  const displayRequests = useMockData
    ? mockRequests.filter(req => {
        if (req.type !== tab) return false
        if (filter === 'all') return true
        return req.status === filter
      })
    : realRequests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
      }).map(req => ({
        id: req.id,
        type: tab,
        from: req.requester?.full_name || req.requester?.email || 'Unbekannt',
        to: req.recipient_artist?.artist_name || req.recipient_provider?.business_name || 'Unbekannt',
        event: req.event_name,
        date: req.event_date,
        guests: req.expected_guests || 0,
        budget: req.budget_max ? `${req.budget_min?.toLocaleString('de-DE')} - ${req.budget_max.toLocaleString('de-DE')} EUR` : 'Auf Anfrage',
        status: req.status,
        message: req.message || '',
        createdAt: req.created_at
      }))

  const handleAccept = async (requestId: string) => {
    if (useMockData) return
    await updateStatus(requestId, 'accepted')
  }

  const handleDecline = async (requestId: string) => {
    if (useMockData) return
    await updateStatus(requestId, 'declined')
  }

  const handleNegotiate = async (requestId: string) => {
    if (useMockData) return
    await updateStatus(requestId, 'negotiating')
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
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display text-white">Meine Anfragen</h1>
        {useMockData && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            Demo-Daten
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab('incoming')
            if (!useMockData) refetch()
          }}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === 'incoming'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Eingehend
        </button>
        <button
          onClick={() => {
            setTab('outgoing')
            if (!useMockData) refetch()
          }}
          className={`px-4 py-2 rounded-xl transition-all ${
            tab === 'outgoing'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Ausgehend
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={18} className="text-gray-500" />
        {(['all', 'pending', 'accepted', 'declined'] as RequestStatus[]).map(status => (
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
             status === 'accepted' ? 'Angenommen' : 'Abgelehnt'}
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
            displayRequests.map(request => (
              <div
                key={request.id}
                className="bg-bg-secondary rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      {tab === 'incoming' ? `Von: ${request.from}` : `An: ${request.to}`}
                    </p>
                    <h3 className="text-xl font-display text-white">{request.event}</h3>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Datum</p>
                    <p className="text-white">{new Date(request.date).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Gäste</p>
                    <p className="text-white">{request.guests}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Budget</p>
                    <p className="text-white">{request.budget}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Angefragt am</p>
                    <p className="text-white">{new Date(request.createdAt).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>

                <p className="text-gray-400 mb-4 line-clamp-2">{request.message}</p>

                <div className="flex flex-wrap gap-2">
                  {request.status === 'pending' && tab === 'incoming' && (
                    <>
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white transition-all"
                      >
                        Annehmen
                      </button>
                      <button
                        onClick={() => handleNegotiate(request.id)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                      >
                        Verhandeln
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl text-red-400 transition-all"
                      >
                        Ablehnen
                      </button>
                    </>
                  )}
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center gap-2">
                    <MessageCircle size={18} />
                    Nachricht
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
