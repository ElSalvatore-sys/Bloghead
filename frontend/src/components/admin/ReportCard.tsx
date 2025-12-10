import type { Report } from '../../services/adminService'

interface ReportCardProps {
  report: Report
  onUpdateStatus: (reportId: string, status: string) => void
}

export function ReportCard({ report, onUpdateStatus }: ReportCardProps) {
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
      pending: 'bg-yellow-600/20 text-yellow-400',
      reviewing: 'bg-blue-600/20 text-blue-400',
      resolved: 'bg-green-600/20 text-green-400',
      dismissed: 'bg-gray-600/20 text-gray-400'
    }
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      reviewing: 'In Bearbeitung',
      resolved: 'Geloest',
      dismissed: 'Abgelehnt'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Belaestigung',
      inappropriate: 'Unangemessen',
      fraud: 'Betrug',
      other: 'Sonstiges'
    }
    return labels[type] || type
  }

  return (
    <div className="bg-[#262626] rounded-xl p-5 border border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400 text-sm font-medium">
              {getReportTypeLabel(report.report_type)}
            </span>
            {getStatusBadge(report.status)}
          </div>
          <p className="text-gray-400 text-xs">
            Gemeldet am {formatDate(report.created_at)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-white mb-2">{report.reason}</p>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-500">Gemeldet von: </span>
            <span className="text-gray-300">
              {report.reporter?.membername || 'Unbekannt'}
            </span>
          </div>
          {report.reported_user && (
            <div>
              <span className="text-gray-500">Gemeldeter User: </span>
              <span className="text-gray-300">
                {report.reported_user.membername}
              </span>
            </div>
          )}
        </div>
      </div>

      {report.status === 'pending' || report.status === 'reviewing' ? (
        <div className="flex gap-2">
          {report.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(report.id, 'reviewing')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              In Bearbeitung nehmen
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(report.id, 'resolved')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            Als geloest markieren
          </button>
          <button
            onClick={() => onUpdateStatus(report.id, 'dismissed')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Ablehnen
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          {report.resolved_at && (
            <span>Geloest am {formatDate(report.resolved_at)}</span>
          )}
        </div>
      )}
    </div>
  )
}
