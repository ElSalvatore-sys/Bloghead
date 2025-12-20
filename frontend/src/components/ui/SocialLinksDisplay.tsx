import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  SpotifyIcon,
  SoundCloudIcon,
  LinkedInIcon,
  TwitterIcon,
  WebsiteIcon,
} from '../icons'

interface SocialLink {
  platform: string
  url: string
}

interface SocialLinksDisplayProps {
  socialMedia?: SocialLink[] | Record<string, string> | null
  // Fallback to individual fields
  instagramProfile?: string | null
  soundcloudUrl?: string | null
  websiteUrl?: string | null
  className?: string
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Platform config with icons and URL builders
const PLATFORM_CONFIG: Record<string, {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  buildUrl: (handle: string) => string
  color: string
}> = {
  instagram: {
    icon: InstagramIcon,
    label: 'Instagram',
    buildUrl: (handle) => {
      const cleanHandle = handle.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '')
      return `https://instagram.com/${cleanHandle}`
    },
    color: 'hover:text-pink-500',
  },
  tiktok: {
    icon: TikTokIcon,
    label: 'TikTok',
    buildUrl: (handle) => {
      const cleanHandle = handle.replace('@', '').replace('https://tiktok.com/@', '').replace('https://www.tiktok.com/@', '')
      return `https://tiktok.com/@${cleanHandle}`
    },
    color: 'hover:text-white',
  },
  youtube: {
    icon: YouTubeIcon,
    label: 'YouTube',
    buildUrl: (url) => {
      if (url.startsWith('http')) return url
      return `https://youtube.com/${url}`
    },
    color: 'hover:text-red-500',
  },
  spotify: {
    icon: SpotifyIcon,
    label: 'Spotify',
    buildUrl: (url) => {
      if (url.startsWith('http')) return url
      return `https://open.spotify.com/artist/${url}`
    },
    color: 'hover:text-green-500',
  },
  soundcloud: {
    icon: SoundCloudIcon,
    label: 'SoundCloud',
    buildUrl: (url) => {
      if (url.startsWith('http')) return url
      return `https://soundcloud.com/${url}`
    },
    color: 'hover:text-orange-500',
  },
  facebook: {
    icon: FacebookIcon,
    label: 'Facebook',
    buildUrl: (url) => {
      if (url.startsWith('http')) return url
      return `https://facebook.com/${url}`
    },
    color: 'hover:text-blue-500',
  },
  twitter: {
    icon: TwitterIcon,
    label: 'Twitter/X',
    buildUrl: (handle) => {
      const cleanHandle = handle.replace('@', '').replace('https://twitter.com/', '').replace('https://x.com/', '')
      return `https://x.com/${cleanHandle}`
    },
    color: 'hover:text-white',
  },
  linkedin: {
    icon: LinkedInIcon,
    label: 'LinkedIn',
    buildUrl: (url) => {
      if (url.startsWith('http')) return url
      return `https://linkedin.com/in/${url}`
    },
    color: 'hover:text-blue-400',
  },
  website: {
    icon: WebsiteIcon,
    label: 'Website',
    buildUrl: (url) => {
      if (url.startsWith('http')) return url
      return `https://${url}`
    },
    color: 'hover:text-accent-purple',
  },
}

const SIZE_MAP = {
  sm: 20,
  md: 24,
  lg: 32,
}

export function SocialLinksDisplay({
  socialMedia,
  instagramProfile,
  soundcloudUrl,
  websiteUrl,
  className = '',
  showLabels = false,
  size = 'md',
}: SocialLinksDisplayProps) {
  // Normalize social media data to array format
  const socialLinks: SocialLink[] = []

  if (socialMedia) {
    if (Array.isArray(socialMedia)) {
      // Already in array format
      socialLinks.push(...socialMedia.filter(link => link.platform && link.url))
    } else {
      // Object format - convert to array
      Object.entries(socialMedia).forEach(([platform, url]) => {
        if (url) socialLinks.push({ platform, url })
      })
    }
  }

  // Add fallback individual fields if not already in socialLinks
  if (instagramProfile && !socialLinks.find(l => l.platform === 'instagram')) {
    socialLinks.push({ platform: 'instagram', url: instagramProfile })
  }
  if (soundcloudUrl && !socialLinks.find(l => l.platform === 'soundcloud')) {
    socialLinks.push({ platform: 'soundcloud', url: soundcloudUrl })
  }
  if (websiteUrl && !socialLinks.find(l => l.platform === 'website')) {
    socialLinks.push({ platform: 'website', url: websiteUrl })
  }

  // Filter to only known platforms with valid URLs
  const validLinks = socialLinks.filter(
    link => link.url && PLATFORM_CONFIG[link.platform.toLowerCase()]
  )

  if (validLinks.length === 0) {
    return null
  }

  const iconSize = SIZE_MAP[size]

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {validLinks.map((link) => {
        const platform = link.platform.toLowerCase()
        const config = PLATFORM_CONFIG[platform]
        if (!config) return null

        const IconComponent = config.icon
        const url = config.buildUrl(link.url)

        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-white/60 ${config.color} transition-colors duration-200`}
            title={config.label}
          >
            <IconComponent size={iconSize} />
            {showLabels && (
              <span className="text-sm">{config.label}</span>
            )}
          </a>
        )
      })}
    </div>
  )
}
