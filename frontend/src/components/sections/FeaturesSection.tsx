import { GradientBrush } from '../ui/GradientBrush'

interface Feature {
  icon: React.ReactNode
  label: string
}

// Feature Icons as inline SVGs for maximum flexibility
function CalendarManagementIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        d="M38.8,6.5h-2V5.7c0-1.1-0.4-2.2-1.2-2.9c-0.8-0.8-1.8-1.2-2.9-1.2c-2.3,0-4.2,1.9-4.2,4.2v0.8h-9V5.7c0-1.1-0.4-2.2-1.2-2.9c-0.8-0.8-1.8-1.2-2.9-1.2c-2.3,0-4.2,1.9-4.2,4.2v0.8h-2C6.3,6.5,4,8.8,4,11.6V17v24.3c0,2.8,2.3,5.2,5.2,5.2h29.7c2.8,0,5.2-2.3,5.2-5.2V17v-5.3C44,8.8,41.7,6.5,38.8,6.5z M31.2,5.7c0-0.8,0.6-1.4,1.4-1.4c0.4,0,0.7,0.1,1,0.4s0.4,0.6,0.4,1v2.1v2.1c0,0.8-0.6,1.4-1.4,1.4c-0.8,0-1.4-0.6-1.4-1.4V7.8C31.2,7.8,31.2,5.7,31.2,5.7z M13.9,5.7c0-0.8,0.6-1.4,1.4-1.4c0.4,0,0.7,0.1,1,0.4c0.3,0.3,0.4,0.6,0.4,1v2.1v2.1c0,0.8-0.6,1.4-1.4,1.4c-0.8,0-1.4-0.6-1.4-1.4V7.8V5.7z M6.7,11.6c0-1.3,1.1-2.4,2.4-2.4h2V10c0,2.3,1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2V9.2h9V10c0,2.3,1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2V9.2h2c1.3,0,2.4,1.1,2.4,2.4v4H6.7V11.6z M41.3,41.3c0,1.3-1.1,2.4-2.4,2.4H9.2c-1.3,0-2.4-1.1-2.4-2.4v-23h34.5V41.3z"
        fill="currentColor"
      />
      <g>
        <path
          d="M33.2,30.1c0-0.6-0.5-1-1.1-1c-0.6,0-1.1,0.5-1.1,1.1v0.2c0,0.1,0,0.3,0,0.4c0,3.9-3.1,7-7,7s-7-3.1-7-7s3.1-7,7-7c1.2,0,2.4,0.3,3.5,0.9c0.5,0.3,1.2,0.1,1.5-0.4s0.1-1.2-0.4-1.5c-1.4-0.8-3-1.2-4.6-1.2c-5.1,0-9.2,4.1-9.2,9.2S18.9,40,24,40s9.2-4.1,9.2-9.2C33.2,30.5,33.2,30.3,33.2,30.1z"
          fill="currentColor"
        />
        <path
          d="M23.9,34.5c-0.3,0-0.6-0.1-0.8-0.4l-3.3-3.3c-0.5-0.5-0.5-1.2,0-1.7s1.2-0.5,1.7,0l2.5,2.5l7.3-7.3c0.5-0.5,1.2-0.5,1.7,0s0.5,1.2,0,1.7l-8.2,8.2C24.5,34.4,24.2,34.5,23.9,34.5z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

function BookkeepingIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <rect x="6" y="4" width="36" height="40" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M14 14h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 22h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 30h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="34" r="8" fill="currentColor" />
      <path d="M34 30v8" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 34h8" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ArtistPresentationIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        d="M24.7,23.9c5.6,0,10.1-4.4,10.1-10.1S30.3,3.7,24.7,3.7S14.6,8.2,14.6,13.8S19.1,23.9,24.7,23.9z M24.7,6.5c4,0,7.2,3.1,7.2,7.2S28.8,21,24.7,21s-7.2-3.1-7.2-7.2S20.7,6.5,24.7,6.5z"
        fill="currentColor"
      />
      <path
        d="M26.2,26.8h-2.9c-8.8,0-15.9,7.1-15.9,15.8C7.4,43.4,8,44,8.9,44h31.7c0.9,0,1.5-0.6,1.5-1.5C42,33.8,34.9,26.8,26.2,26.8z M10.5,41.2c0.7-6.6,6.4-11.5,12.8-11.5h2.9c6.6,0,12.1,4.9,12.8,11.5H10.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function WorldwideCommunityIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <ellipse cx="24" cy="24" rx="8" ry="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M4 24h40" stroke="currentColor" strokeWidth="2.5" />
      <path d="M6 14h36" stroke="currentColor" strokeWidth="2" />
      <path d="M6 34h36" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function USPIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        d="M11.4,41.8L13.3,30c0.1-0.4-0.1-0.8-0.4-1l-8.6-8.2c-0.7-0.7-0.3-1.9,0.6-2l11.8-1.8c0.4-0.1,0.7-0.3,0.9-0.7l5.2-10.8c0.4-0.9,1.7-0.9,2.1,0l5.4,10.7c0.2,0.3,0.5,0.6,0.9,0.6L43,18.3c1,0.1,1.4,1.3,0.7,2l-8.5,8.4c-0.3,0.3-0.4,0.7-0.3,1.1l2.1,11.7c0.2,1-0.8,1.7-1.7,1.3l-10.6-5.4c-0.3-0.2-0.8-0.2-1.1,0l-10.5,5.7C12.3,43.5,11.2,42.8,11.4,41.8z"
        fill="currentColor"
      />
    </svg>
  )
}

const features: Feature[] = [
  {
    icon: <CalendarManagementIcon className="w-12 h-12 md:w-16 md:h-16" />,
    label: 'ESSENTIAL CALENDARMANAGEMENT',
  },
  {
    icon: <BookkeepingIcon className="w-12 h-12 md:w-16 md:h-16" />,
    label: 'BOOKKEEPING',
  },
  {
    icon: <ArtistPresentationIcon className="w-12 h-12 md:w-16 md:h-16" />,
    label: 'ARTIST PRESENTATION',
  },
  {
    icon: <WorldwideCommunityIcon className="w-12 h-12 md:w-16 md:h-16" />,
    label: 'WORLDWIDE COMMUNITY',
  },
  {
    icon: <USPIcon className="w-12 h-12 md:w-16 md:h-16" />,
    label: 'GETTING YOUR USP',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-bg-primary py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            FEATURES
          </h2>
          <div className="flex justify-center">
            <GradientBrush className="w-32 md:w-40" size="md" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-4 md:p-6 rounded-lg transition-all duration-300 hover:bg-bg-card-hover hover:-translate-y-1 cursor-pointer"
            >
              {/* Icon Container */}
              <div className="text-white mb-4 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>

              {/* Label */}
              <span className="text-text-secondary text-xs md:text-sm font-medium tracking-wide uppercase leading-tight">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
