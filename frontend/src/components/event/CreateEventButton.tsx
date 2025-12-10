import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

interface CreateEventButtonProps {
  className?: string
}

export function CreateEventButton({ className = '' }: CreateEventButtonProps) {
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  // Only show for event organizers (Veranstalter)
  const isEventOrganizer = userProfile?.user_type === 'event_organizer'

  if (!isEventOrganizer) {
    return null
  }

  return (
    <button
      onClick={() => navigate('/events/create')}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-r from-accent-purple to-accent-red
        text-white shadow-lg
        hover:shadow-xl hover:scale-105
        transition-all duration-200
        flex items-center justify-center
        ${className}
      `}
      aria-label="Event erstellen"
    >
      <PlusIcon className="w-6 h-6" />
    </button>
  )
}
