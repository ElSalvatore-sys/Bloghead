import { useState } from 'react'
import { PlayIcon } from '../icons'

interface AudioTrack {
  id: string
  title: string
  duration?: string
  waveform?: number[] // Array of heights for waveform bars
}

interface AudioPlayerProps {
  className?: string
  tracks?: AudioTrack[]
  title?: string
}

// Generate random waveform data for visual effect
function generateWaveform(length: number = 50): number[] {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2)
}

// Static waveform visualization component
function WaveformDisplay({
  waveform,
  isPlaying = false,
  progress = 0,
  className = '',
}: {
  waveform: number[]
  isPlaying?: boolean
  progress?: number
  className?: string
}) {
  const progressIndex = Math.floor((progress / 100) * waveform.length)

  return (
    <div className={`flex items-center gap-[2px] h-8 ${className}`}>
      {waveform.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-colors duration-150 ${
            index < progressIndex
              ? 'bg-gradient-to-t from-accent-purple to-accent-red'
              : 'bg-white/30'
          } ${isPlaying ? 'animate-pulse' : ''}`}
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  )
}

// Pause icon
function PauseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="currentColor"
      className={className}
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
      <rect x="16" y="14" width="5" height="20" rx="1" fill="currentColor" />
      <rect x="27" y="14" width="5" height="20" rx="1" fill="currentColor" />
    </svg>
  )
}

export function AudioPlayer({
  className = '',
  tracks = [],
  title = 'LISTEN TO ME ON SOUNDCLOUD',
}: AudioPlayerProps) {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({})

  // Default tracks if none provided
  const displayTracks: AudioTrack[] = tracks.length > 0 ? tracks : [
    { id: '1', title: 'Track 1', duration: '3:24', waveform: generateWaveform(40) },
    { id: '2', title: 'Track 2', duration: '4:12', waveform: generateWaveform(40) },
    { id: '3', title: 'Track 3', duration: '2:58', waveform: generateWaveform(40) },
    { id: '4', title: 'Track 4', duration: '5:01', waveform: generateWaveform(40) },
    { id: '5', title: 'Track 5', duration: '3:45', waveform: generateWaveform(40) },
    { id: '6', title: 'Track 6', duration: '4:33', waveform: generateWaveform(40) },
  ]

  const togglePlay = (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null)
    } else {
      setPlayingTrackId(trackId)
      // Simulate progress (in real app, this would be tied to actual audio)
      if (!progress[trackId]) {
        setProgress(prev => ({ ...prev, [trackId]: 0 }))
      }
    }
  }

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <PlayIcon size={24} className="text-white/60" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {/* Main Audio Player with Waveform */}
      <div className="bg-bg-card/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Play Button */}
          <button
            onClick={() => togglePlay('main')}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-accent-purple to-accent-red flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            aria-label={playingTrackId === 'main' ? 'Pause' : 'Play'}
          >
            {playingTrackId === 'main' ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Main Waveform */}
          <div className="flex-1">
            <WaveformDisplay
              waveform={generateWaveform(80)}
              isPlaying={playingTrackId === 'main'}
              progress={progress['main'] || 0}
              className="w-full"
            />
          </div>

          {/* Duration */}
          <span className="text-white/60 text-sm">3:24</span>
        </div>
      </div>

      {/* Track List */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
        {displayTracks.map((track) => (
          <div
            key={track.id}
            className="flex-shrink-0 w-32 bg-bg-card/30 rounded-lg p-3 hover:bg-bg-card/50 transition-colors cursor-pointer"
            onClick={() => togglePlay(track.id)}
          >
            {/* Track Thumbnail with Waveform */}
            <div className="h-16 mb-2 flex items-end justify-center bg-gradient-to-t from-accent-purple/20 to-transparent rounded">
              <WaveformDisplay
                waveform={track.waveform || generateWaveform(20)}
                isPlaying={playingTrackId === track.id}
                progress={progress[track.id] || 0}
                className="h-12 px-1"
              />
            </div>

            {/* Track Info */}
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs truncate flex-1">
                {track.title}
              </span>
              <button
                className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label={playingTrackId === track.id ? 'Pause' : 'Play'}
              >
                {playingTrackId === track.id ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
            {track.duration && (
              <span className="text-white/40 text-xs">{track.duration}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple single-track audio player variant
export function SimpleAudioPlayer({
  className = '',
  title = 'Now Playing',
}: {
  className?: string
  title?: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress] = useState(30) // Demo progress

  return (
    <div className={`bg-bg-card/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-accent-purple to-accent-red flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Track Info and Waveform */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate mb-2">{title}</p>
          <WaveformDisplay
            waveform={generateWaveform(60)}
            isPlaying={isPlaying}
            progress={progress}
            className="w-full h-6"
          />
        </div>

        {/* Duration */}
        <span className="text-white/60 text-xs">3:24</span>
      </div>
    </div>
  )
}
