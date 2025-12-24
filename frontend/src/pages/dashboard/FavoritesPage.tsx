import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Placeholder data
const mockFavorites = [
  {
    id: '1',
    type: 'artist',
    name: 'DJ Thunder',
    image: '/images/alexander-popov-f3e6YNo3Y98-unsplash.webp',
    category: 'DJ',
    rating: 4.8,
  },
  {
    id: '2',
    type: 'artist',
    name: 'Sarah Voice',
    image: '/images/jazmin-quaynor-8ALMAJP0Ago-unsplash.webp',
    category: 'Sängerin',
    rating: 4.9,
  },
  {
    id: '3',
    type: 'service',
    name: 'Premium Catering',
    image: '/images/pexels-luis-quintero-2091383.webp',
    category: 'Catering',
    rating: 4.7,
  },
]

function HeartFilledIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function FavoritesPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-white mb-8">Meine Favoriten</h1>

      <AnimatePresence mode="wait">
        {mockFavorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-bg-card rounded-xl border border-white/10 p-12 text-center"
        >
          <HeartFilledIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Keine Favoriten</h2>
          <p className="text-text-muted mb-6">
            Du hast noch keine Künstler oder Dienstleister zu deinen Favoriten hinzugefügt.
          </p>
          <Link
            to="/artists"
            className="inline-block px-6 py-3 bg-accent-purple text-white font-medium rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            Künstler entdecken
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mockFavorites.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
              to={item.type === 'artist' ? `/artists/${item.id}` : `/services/${item.id}`}
              className="group bg-bg-card rounded-xl border border-white/10 overflow-hidden hover:border-accent-purple/50 transition-colors"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Favorite Button */}
                <button
                  className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-accent-red hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Remove from favorites
                  }}
                >
                  <HeartFilledIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-accent-purple transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-text-muted text-sm">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-accent-salmon">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  )
}
