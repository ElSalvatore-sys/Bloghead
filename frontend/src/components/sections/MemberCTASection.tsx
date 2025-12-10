import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

interface MemberCTASectionProps {
  className?: string
  onMemberClick?: () => void
}

export function MemberCTASection({ className = '', onMemberClick }: MemberCTASectionProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (user) {
      navigate('/dashboard/profile')
    } else if (onMemberClick) {
      onMemberClick()
    } else {
      navigate('/registrieren')
    }
  }

  return (
    <section
      className={`relative w-full py-20 md:py-28 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%)',
      }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main Title - Hyperwave Font italic */}
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight italic">
          Starte jetzt mit deinem Profil auf Bloghead.
        </h2>

        {/* CTA Button */}
        <Button
          variant="outline"
          onClick={handleClick}
          className="border-white text-white hover:bg-white/10 px-10 py-4 tracking-wider uppercase rounded-full text-sm md:text-base font-bold"
        >
          {user ? 'Zum Dashboard' : 'Kostenlos Registrieren'}
        </Button>
      </div>
    </section>
  )
}
