import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ChatLayout } from '../../components/chat/ChatLayout'

export default function MyChatPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversation')

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-[#171717] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Meine Nachrichten</h1>
            <p className="text-gray-400">
              Kommuniziere mit Kuenstlern und Veranstaltern
            </p>
          </div>

          {/* Login prompt */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Anmeldung erforderlich
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Melde dich an, um deine Nachrichten zu sehen und mit Kuenstlern und Veranstaltern zu kommunizieren.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#610AD1] to-[#F92B02] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <span>Jetzt anmelden</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171717] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Meine Nachrichten</h1>
          <p className="text-gray-400">
            Kommuniziere mit Kuenstlern und Veranstaltern
          </p>
        </div>

        {/* Chat Container */}
        <div
          className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
          style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}
        >
          <ChatLayout initialConversationId={conversationId} />
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/artists"
            className="px-4 py-2 bg-gradient-to-r from-[#610AD1] to-[#F92B02] hover:opacity-90 text-white rounded-lg transition-opacity flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Kuenstler finden</span>
          </a>
          <a
            href="/dashboard/bookings"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📅</span>
            <span>Meine Buchungen</span>
          </a>
        </div>
      </div>
    </div>
  )
}
