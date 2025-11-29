import { Link } from 'react-router-dom'
import { useState } from 'react'

interface Artist {
  id: string
  name: string
  role: string
  image?: string
}

// Placeholder artists data
const artists: Artist[] = [
  { id: '1', name: 'Max Mustermann', role: 'DJ' },
  { id: '2', name: 'Lisa Schmidt', role: 'Singer' },
  { id: '3', name: 'Tom Weber', role: 'Musician' },
  { id: '4', name: 'Anna Becker', role: 'DJ' },
  { id: '5', name: 'Paul Fischer', role: 'Singer' },
]

export function ArtistsCarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % artists.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + artists.length) % artists.length)
  }

  return (
    <section className="bg-bg-primary py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              ARTISTS
            </h2>
            <div className="w-24 h-1 brush-stroke rounded-full" />
          </div>

          <div className="max-w-md">
            <h3 className="text-white text-lg font-bold uppercase tracking-wide mb-2">
              Upgrade your business
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              One of the most important challenges of each artist is not only to be an
              entertainer, but also kind of influencer, content creator. We will help
              you reach your goals.
            </p>
          </div>
        </div>

        {/* Artists Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-bg-card border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-bg-card-hover transition-colors"
            aria-label="Previous artist"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-bg-card border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-bg-card-hover transition-colors"
            aria-label="Next artist"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Cards Container */}
          <div className="flex gap-6 transition-transform duration-300 ease-out" style={{ transform: `translateX(-${currentIndex * 20}%)` }}>
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex-shrink-0 w-64 md:w-72"
              >
                {/* Artist Image */}
                <div className="aspect-square bg-gradient-to-br from-accent-purple/20 via-bg-card to-accent-red/20 rounded-lg mb-4 relative overflow-hidden group">
                  {/* Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/30 text-6xl font-display">
                      {artist.name[0]}
                    </span>
                  </div>
                  {/* Favorite Icon */}
                  <button className="absolute top-3 right-3 text-white/50 hover:text-accent-purple transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Artist Info */}
                <h4 className="text-white font-bold uppercase tracking-wide mb-1">
                  {artist.name}
                </h4>
                <p className="text-text-secondary text-sm uppercase tracking-wide mb-3">
                  {artist.role}
                </p>

                {/* Book Button */}
                <Link
                  to={`/artists/${artist.id}`}
                  className="inline-block w-full text-center px-6 py-2.5 bg-gradient-to-r from-accent-purple to-accent-red text-white font-bold text-xs uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity"
                >
                  Jetzt buchen
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm uppercase tracking-wider transition-colors"
          >
            Alle Künstler ansehen
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
