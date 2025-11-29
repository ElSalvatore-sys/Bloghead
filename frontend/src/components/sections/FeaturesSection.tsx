interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Einfache Buchung',
    description: 'Buche deinen Lieblingskünstler mit nur wenigen Klicks.',
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
        <path d="M24 16v8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Künstler Präsentation',
    description: 'Präsentiere dich als Künstler mit einem professionellen Profil.',
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <path d="M12 36l12-24 12 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 28h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sichere Bezahlung',
    description: 'Zahlungen werden sicher über unsere Plattform abgewickelt.',
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="12" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: 'Bloghead Coins',
    description: 'Nutze unser einzigartiges Coins-System für Buchungen.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-bg-primary py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide mb-4">
            Every business is essential to have a professional USP
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Unsere Plattform bietet dir alle Werkzeuge, die du brauchst.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:bg-bg-card/50 transition-colors duration-200"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-accent-purple">
                {feature.icon}
              </div>
              {/* Title */}
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">
                {feature.title}
              </h3>
              {/* Description */}
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 flex justify-center">
          <div className="w-32 h-1 brush-stroke rounded-full" />
        </div>
      </div>
    </section>
  )
}
