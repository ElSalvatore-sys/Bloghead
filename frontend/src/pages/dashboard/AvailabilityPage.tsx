/**
 * AvailabilityPage - Dashboard page for artist availability management
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvailabilityCalendar, AvailabilitySettings, BlockedDatesManager } from '../../components/availability'
import { useAuth } from '../../contexts/AuthContext'

// Icons
function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function BanIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ChevronUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

type TabType = 'calendar' | 'blocked' | 'settings'

export function AvailabilityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [showHelp, setShowHelp] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white/50">Bitte melde dich an.</p>
      </div>
    )
  }

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'calendar', label: 'Kalender', icon: CalendarIcon },
    { id: 'blocked', label: 'Blockierte Zeiten', icon: BanIcon },
    { id: 'settings', label: 'Einstellungen', icon: SettingsIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Meine Verfügbarkeit</h1>
          <p className="text-white/50 mt-1">
            Verwalte deine verfügbaren Termine für Buchungen
          </p>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <InfoIcon className="w-4 h-4" />
          Hilfe
          {showHelp ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Help Section */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">So funktioniert's</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Verfügbar</p>
                    <p className="text-white/50">Du kannst an diesem Tag gebucht werden</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded bg-accent-purple/20 border-2 border-accent-purple flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Gebucht</p>
                    <p className="text-white/50">Du hast bereits eine Buchung</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded bg-red-500/20 border-2 border-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Blockiert</p>
                    <p className="text-white/50">Nicht verfügbar (Urlaub, etc.)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded bg-yellow-500/20 border-2 border-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Vorläufig</p>
                    <p className="text-white/50">Noch nicht bestätigt</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  <strong className="text-white">Tipp:</strong> Klicke auf "Mehrere Tage auswählen" im Kalender,
                  um mehrere Tage gleichzeitig zu bearbeiten.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-purple text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'calendar' && (
          <AvailabilityCalendar artistId={user.id} />
        )}

        {activeTab === 'blocked' && (
          <BlockedDatesManager artistId={user.id} />
        )}

        {activeTab === 'settings' && (
          <AvailabilitySettings artistId={user.id} />
        )}
      </motion.div>
    </div>
  )
}

export default AvailabilityPage
