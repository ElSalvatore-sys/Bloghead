import { motion } from 'framer-motion'
import { Grid3X3, Map } from 'lucide-react'

export type ViewMode = 'grid' | 'map'

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ view, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`inline-flex items-center bg-bg-card border border-white/10 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onViewChange('grid')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'grid' ? 'text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        {view === 'grid' && (
          <motion.div
            layoutId="viewToggle"
            className="absolute inset-0 bg-accent-purple rounded-md -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Raster</span>
      </button>

      <button
        onClick={() => onViewChange('map')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'map' ? 'text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        {view === 'map' && (
          <motion.div
            layoutId="viewToggle"
            className="absolute inset-0 bg-accent-purple rounded-md -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Map className="w-4 h-4" />
        <span className="hidden sm:inline">Karte</span>
      </button>
    </div>
  )
}

export default ViewToggle
