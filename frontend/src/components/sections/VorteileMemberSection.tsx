interface Vorteil {
  title: string
  description: string
}

const vorteile: Vorteil[] = [
  {
    title: 'Professionelles Profil',
    description: 'Erstelle ein aussagekräftiges Profil mit Fotos, Videos und Bewertungen.',
  },
  {
    title: 'Direkte Buchungen',
    description: 'Erhalte Anfragen direkt von Veranstaltern und verwalte deine Termine.',
  },
  {
    title: 'Sichere Zahlungen',
    description: 'Alle Zahlungen werden sicher über unsere Plattform abgewickelt.',
  },
  {
    title: 'Netzwerk aufbauen',
    description: 'Verbinde dich mit anderen Künstlern und Veranstaltern in der Community.',
  },
]

export function VorteileMemberSection() {
  return (
    <section className="bg-bg-primary py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide mb-4">
            Vorteile Member
          </h2>
          <div className="w-24 h-1 brush-stroke rounded-full mx-auto" />
        </div>

        {/* Vorteile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {vorteile.map((vorteil, index) => (
            <div
              key={index}
              className="p-6 bg-bg-card rounded-lg border border-white/5 hover:border-accent-purple/30 transition-colors"
            >
              {/* Number indicator */}
              <div className="inline-flex items-center justify-center w-8 h-8 mb-4 bg-gradient-to-br from-accent-purple to-accent-red rounded-full text-white text-sm font-bold">
                {index + 1}
              </div>
              {/* Title */}
              <h3 className="text-white font-bold text-base uppercase tracking-wide mb-2">
                {vorteil.title}
              </h3>
              {/* Description */}
              <p className="text-text-muted text-sm leading-relaxed">
                {vorteil.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
