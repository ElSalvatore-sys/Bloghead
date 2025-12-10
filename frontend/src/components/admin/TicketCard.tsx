import type { SupportTicket } from '../../services/adminService'

interface TicketCardProps {
  ticket: SupportTicket
  onUpdateStatus: (ticketId: string, status: SupportTicket['status']) => void
  onAssign: (ticketId: string) => void
}

export function TicketCard({ ticket, onUpdateStatus, onAssign }: TicketCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-yellow-600/20 text-yellow-400',
      in_progress: 'bg-blue-600/20 text-blue-400',
      resolved: 'bg-green-600/20 text-green-400',
      closed: 'bg-gray-600/20 text-gray-400'
    }
    const labels: Record<string, string> = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      resolved: 'Geloest',
      closed: 'Geschlossen'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-gray-600/20 text-gray-400',
      medium: 'bg-blue-600/20 text-blue-400',
      high: 'bg-orange-600/20 text-orange-400',
      urgent: 'bg-red-600/20 text-red-400'
    }
    const labels: Record<string, string> = {
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
      urgent: 'Dringend'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[priority] || styles.medium}`}>
        {labels[priority] || priority}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: 'Allgemein',
      technical: 'Technisch',
      billing: 'Abrechnung',
      account: 'Konto',
      booking: 'Buchung',
      other: 'Sonstiges'
    }
    return labels[category] || category
  }

  return (
    <div className="bg-[#262626] rounded-xl p-5 border border-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">{ticket.subject}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
            <span className="text-gray-500 text-xs">
              {getCategoryLabel(ticket.category)}
            </span>
          </div>
        </div>
        <span className="text-gray-500 text-xs">
          #{ticket.id.slice(0, 8)}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          <span>Von: </span>
          <span className="text-gray-300">
            {ticket.user?.membername || 'Unbekannt'}
          </span>
          <span className="mx-2">|</span>
          <span>{formatDate(ticket.created_at)}</span>
        </div>
      </div>

      {(ticket.status === 'open' || ticket.status === 'in_progress') && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
          {ticket.status === 'open' && (
            <button
              onClick={() => onAssign(ticket.id)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Uebernehmen
            </button>
          )}
          {ticket.status === 'in_progress' && (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'resolved')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Als geloest markieren
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(ticket.id, 'closed')}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Schliessen
          </button>
        </div>
      )}
    </div>
  )
}
