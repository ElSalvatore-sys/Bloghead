import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface FeaturesSectionProps {
  onRegisterClick?: () => void
}

// User type cards data
const userTypes = [
  {
    id: 'community',
    title: 'COMMUNITY',
    icon: CommunityIcon,
    color: '#FB7A43', // Orange
    description: 'Du willst wissen, was bei deinen Lieblingsacts abgeht und neue Artists entdecken, ohne zehn Apps zu checken? Mit deinem kostenlosen Profil folgst und supportest du Artists, findest Events & Tickets an einem Ort, staerkst lokale Acts, triffst Gleichgesinnte und bekommst exklusive Einblicke & Specials.',
  },
  {
    id: 'artist',
    title: 'ARTIST',
    icon: ArtistIcon,
    color: '#610AD1', // Purple
    description: 'Dein Artist-Profil buendelt Buchungen, Gigs, Kontakte & Rechnungen und hilft dir gleichzeitig, Reichweite, Fanbase und Einnahmen ueber Gigs, Links & Merch auszubauen.',
  },
  {
    id: 'dienstleister',
    title: 'DIENSTLEISTER',
    icon: DienstleisterIcon,
    color: '#F92B02', // Red
    description: 'Mit deinem Dienstleister-Profil nutzt du alle Office-Funktionen fuer Angebote, Vertraege, Rechnungen & Kontakte und wirst gleichzeitig fuer Events gefunden, gebucht und baust deinen Kundenstamm systematisch aus.',
  },
  {
    id: 'veranstalter',
    title: 'VERANSTALTER',
    icon: VeranstalterIcon,
    color: '#610AD1', // Purple
    description: 'Mit deinem Veranstalter-Profil planst du deine Events einfach auf einer Plattform, buendelst Anfragen, Buchungen, Vertraege & Rechnungen und hast passende Artists und Dienstleister direkt an deiner Seite.',
  },
]

export function FeaturesSection({ onRegisterClick }: FeaturesSectionProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (user) {
      navigate('/events')
    } else if (onRegisterClick) {
      onRegisterClick()
    } else {
      navigate('/registrieren')
    }
  }

  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title */}
        <motion.div
          className="mb-12 md:mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white italic mb-4">
            Fuer wen ist Bloghead?
          </h2>
          {/* Gradient underline bar */}
          <motion.div
            className="h-1 w-32 md:w-40 mt-4 mx-auto"
            style={{
              background: 'linear-gradient(90deg, #610AD1 0%, #F92B02 100%)'
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </motion.div>

        {/* 4 User Type Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
        >
          {userTypes.map((userType) => (
            <motion.div key={userType.id} variants={staggerItem}>
              <UserTypeCard userType={userType} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button - Centered */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={handleClick}
            className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 px-10 py-3 tracking-wider uppercase rounded-full text-sm font-bold"
          >
            {user ? 'Events Entdecken' : 'Jetzt Registrieren'}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// User Type Card Component
function UserTypeCard({ userType }: { userType: typeof userTypes[0] }) {
  const IconComponent = userType.icon

  return (
    <div
      className="rounded-2xl p-6 md:p-8 flex flex-col h-full border border-white/10 hover:border-white/20 transition-colors"
      style={{
        background: `linear-gradient(135deg, ${userType.color}15 0%, ${userType.color}05 100%)`,
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 mb-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: userType.color }}
      >
        <IconComponent className="w-7 h-7 text-white" />
      </div>

      {/* Title */}
      <h3
        className="text-white text-xl md:text-2xl font-bold mb-4 uppercase tracking-wide"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {userType.title}
      </h3>

      {/* Description */}
      <p
        className="text-white/70 text-sm md:text-base leading-relaxed flex-grow"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {userType.description}
      </p>
    </div>
  )
}

// Icons for each user type
function CommunityIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ArtistIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

function DienstleisterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function VeranstalterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  )
}
