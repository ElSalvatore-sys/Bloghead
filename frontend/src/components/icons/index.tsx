import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string
}

// Base icon wrapper
const Icon = ({ size = 24, className = '', children, ...props }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={`${className}`}
    {...props}
  >
    {children}
  </svg>
)

// Heart Icon (outline)
export function HeartIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M47.1,16.1C46.3,8.3,40.7,2.7,33.7,2.7c-3.4,0-7,2-9.8,5.6c-2.8-3.5-6.2-5.6-9.6-5.6c-7,0-12.6,5.6-13.4,13.4c-0.1,0.6-0.3,2.4,0.4,5.2c1,4.1,3.2,7.8,6.5,10.8l16.1,14.6L40.2,32c3.3-3,5.5-6.7,6.5-10.8C47.3,18.4,47.1,16.6,47.1,16.1z M38,29.6L23.9,42.1L10,29.6c-2.8-2.5-4.6-5.6-5.4-9.1c-0.6-2.4-0.4-3.8-0.3-3.9l0-0.1C4.8,10.4,9,6,14.3,6c3.4,0,6.5,3.2,8.3,6.3l1.3,2.1l1.3-2.1c1.7-2.9,5-6.3,8.5-6.3c5.3,0,9.5,4.4,10.1,10.5l0,0.1c0,0.1,0.2,1.5-0.3,3.9C42.6,23.9,40.7,27.1,38,29.6z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Heart Filled Icon
export function HeartFilledIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M47.1,16.1C46.3,8.3,40.7,2.7,33.7,2.7c-3.4,0-7,2-9.8,5.6c-2.8-3.5-6.2-5.6-9.6-5.6c-7,0-12.6,5.6-13.4,13.4c-0.1,0.6-0.3,2.4,0.4,5.2c1,4.1,3.2,7.8,6.5,10.8l16.1,14.6L40.2,32c3.3-3,5.5-6.7,6.5-10.8C47.3,18.4,47.1,16.6,47.1,16.1z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Star Icon (outline)
export function StarIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M11.4,41.8L13.3,30c0.1-0.4-0.1-0.8-0.4-1l-8.6-8.2c-0.7-0.7-0.3-1.9,0.6-2l11.8-1.8c0.4-0.1,0.7-0.3,0.9-0.7l5.2-10.8c0.4-0.9,1.7-0.9,2.1,0l5.4,10.7c0.2,0.3,0.5,0.6,0.9,0.6L43,18.3c1,0.1,1.4,1.3,0.7,2l-8.5,8.4c-0.3,0.3-0.4,0.7-0.3,1.1l2.1,11.7c0.2,1-0.8,1.7-1.7,1.3l-10.6-5.4c-0.3-0.2-0.8-0.2-1.1,0l-10.5,5.7C12.3,43.5,11.2,42.8,11.4,41.8z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
    </Icon>
  )
}

// Star Filled Icon
export function StarFilledIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M11.4,41.8L13.3,30c0.1-0.4-0.1-0.8-0.4-1l-8.6-8.2c-0.7-0.7-0.3-1.9,0.6-2l11.8-1.8c0.4-0.1,0.7-0.3,0.9-0.7l5.2-10.8c0.4-0.9,1.7-0.9,2.1,0l5.4,10.7c0.2,0.3,0.5,0.6,0.9,0.6L43,18.3c1,0.1,1.4,1.3,0.7,2l-8.5,8.4c-0.3,0.3-0.4,0.7-0.3,1.1l2.1,11.7c0.2,1-0.8,1.7-1.7,1.3l-10.6-5.4c-0.3-0.2-0.8-0.2-1.1,0l-10.5,5.7C12.3,43.5,11.2,42.8,11.4,41.8z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Calendar Icon
export function CalendarIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M38.8,6.5h-2V5.7c0-1.1-0.4-2.2-1.2-2.9c-0.8-0.8-1.8-1.2-2.9-1.2c-2.3,0-4.2,1.9-4.2,4.2v0.8h-9V5.7c0-1.1-0.4-2.2-1.2-2.9c-0.8-0.8-1.8-1.2-2.9-1.2c-2.3,0-4.2,1.9-4.2,4.2v0.8h-2C6.3,6.5,4,8.8,4,11.6V17v24.3c0,2.8,2.3,5.2,5.2,5.2h29.7c2.8,0,5.2-2.3,5.2-5.2V17v-5.3C44,8.8,41.7,6.5,38.8,6.5z M31.2,5.7c0-0.8,0.6-1.4,1.4-1.4c0.4,0,0.7,0.1,1,0.4s0.4,0.6,0.4,1v2.1v2.1c0,0.8-0.6,1.4-1.4,1.4c-0.8,0-1.4-0.6-1.4-1.4V7.8C31.2,7.8,31.2,5.7,31.2,5.7z M13.9,5.7c0-0.8,0.6-1.4,1.4-1.4c0.4,0,0.7,0.1,1,0.4c0.3,0.3,0.4,0.6,0.4,1v2.1v2.1c0,0.8-0.6,1.4-1.4,1.4c-0.8,0-1.4-0.6-1.4-1.4V7.8V5.7z M6.7,11.6c0-1.3,1.1-2.4,2.4-2.4h2V10c0,2.3,1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2V9.2h9V10c0,2.3,1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2V9.2h2c1.3,0,2.4,1.1,2.4,2.4v4H6.7V11.6z M41.3,41.3c0,1.3-1.1,2.4-2.4,2.4H9.2c-1.3,0-2.4-1.1-2.4-2.4v-23h34.5V41.3z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Profile/User Icon
export function UserIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M24 4C17.4 4 12 9.4 12 16s5.4 12 12 12 12-5.4 12-12S30.6 4 24 4zm0 20c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
        fill="currentColor"
      />
      <path
        d="M24 30c-8.8 0-16 5.4-16 12v2h32v-2c0-6.6-7.2-12-16-12z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Instagram Icon
export function InstagramIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="36" cy="12" r="2.5" fill="currentColor" />
    </Icon>
  )
}

// Facebook Icon
export function FacebookIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
      <path
        d="M30 16h-4a6 6 0 0 0-6 6v4h-4v6h4v10h6V32h4l2-6h-6v-4a2 2 0 0 1 2-2h4v-4z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Audio/Sound Wave Icon
export function AudioIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <rect x="6" y="20" width="4" height="8" rx="2" fill="currentColor" />
      <rect x="14" y="14" width="4" height="20" rx="2" fill="currentColor" />
      <rect x="22" y="8" width="4" height="32" rx="2" fill="currentColor" />
      <rect x="30" y="14" width="4" height="20" rx="2" fill="currentColor" />
      <rect x="38" y="20" width="4" height="8" rx="2" fill="currentColor" />
    </Icon>
  )
}

// Community Icon
export function CommunityIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="14" r="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="10" cy="20" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="38" cy="20" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M4 38c0-6 4-10 10-10h20c6 0 10 4 10 10" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </Icon>
  )
}

// Upload Icon
export function UploadIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path d="M24 6v28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 18l12-12 12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 42h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// Download Icon
export function DownloadIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path d="M24 6v28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 22l12 12 12-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 42h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// Edit/Pencil Icon
export function EditIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M6 38l4-16L34 8l8 8-24 24-16 4 4-4z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M28 14l8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// Camera Icon
export function CameraIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <rect x="4" y="12" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="24" cy="26" r="8" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M16 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="3" fill="none" />
    </Icon>
  )
}

// Play Icon
export function PlayIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M18 14l16 10-16 10V14z" fill="currentColor" />
    </Icon>
  )
}

// Next/Arrow Icon
export function NextIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M18 8l16 16-16 16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Icon>
  )
}

// Coin Icon
export function CoinIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="none" />
      <text x="24" y="30" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold">B</text>
    </Icon>
  )
}

// Link Icon
export function LinkIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M20 28l-4 4a6 6 0 0 1-8.5-8.5l4-4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 20l4-4a6 6 0 0 1 8.5 8.5l-4 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M18 30l12-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// Menu Icon (hamburger)
export function MenuIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path d="M8 12h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 24h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 36h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// Close Icon (X)
export function CloseIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path d="M12 12l24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 12l-24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// Plus Icon
export function PlusIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M24 14v20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 24h20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Icon>
  )
}

// TikTok Icon
export function TikTokIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M34 8h-6v24a6 6 0 1 1-6-6v-6a12 12 0 1 0 12 12V18c2 2 5 4 8 4v-6c-4 0-8-4-8-8z"
        fill="currentColor"
      />
    </Icon>
  )
}

// YouTube Icon
export function YouTubeIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <rect x="4" y="10" width="40" height="28" rx="6" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M20 18l10 6-10 6V18z" fill="currentColor" />
    </Icon>
  )
}

// Spotify Icon
export function SpotifyIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M12 20c8-2 16 0 24 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M14 26c6-1.5 12 0 18 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M16 32c5-1 10 0 14 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Icon>
  )
}

// SoundCloud Icon
export function SoundCloudIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <rect x="6" y="26" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="12" y="20" width="3" height="18" rx="1" fill="currentColor" />
      <rect x="18" y="16" width="3" height="22" rx="1" fill="currentColor" />
      <rect x="24" y="18" width="3" height="20" rx="1" fill="currentColor" />
      <rect x="30" y="14" width="3" height="24" rx="1" fill="currentColor" />
      <path d="M36 14c6 0 8 4 8 10s-2 10-8 10" stroke="currentColor" strokeWidth="3" fill="none" />
    </Icon>
  )
}

// LinkedIn Icon
export function LinkedInIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="14" cy="14" r="3" fill="currentColor" />
      <rect x="11" y="20" width="6" height="20" fill="currentColor" />
      <path d="M24 20v20M24 28c0-4 3-8 8-8s8 4 8 8v12" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    </Icon>
  )
}

// Twitter/X Icon
export function TwitterIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <path
        d="M8 8l14 16L8 40h4l10-12 8 12h12L28 24l12-16h-4L26 18l-6-10H8z"
        fill="currentColor"
      />
    </Icon>
  )
}

// Website/Globe Icon
export function WebsiteIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <Icon size={size} className={className} {...props}>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
      <ellipse cx="24" cy="24" rx="8" ry="20" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M4 24h40" stroke="currentColor" strokeWidth="3" />
      <path d="M8 14h32" stroke="currentColor" strokeWidth="2" />
      <path d="M8 34h32" stroke="currentColor" strokeWidth="2" />
    </Icon>
  )
}
