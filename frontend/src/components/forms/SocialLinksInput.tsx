import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SOCIAL_PLATFORM_OPTIONS } from '../../constants/profileOptions'

interface SocialLink {
  platform: string
  url: string
}

interface SocialLinksInputProps {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
  label: string
  helpText?: string
  maxLinks?: number
  className?: string
}

// Platform icons
const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconClasses = "w-5 h-5"

  switch (platform) {
    case 'instagram':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'facebook':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    case 'tiktok':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    case 'youtube':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    case 'twitter':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'spotify':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      )
    case 'soundcloud':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.19-1.332c-.01-.057-.044-.094-.09-.094m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.458-.24-2.563c0-.06-.059-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.225-2.544-.225-2.64c-.016-.075-.075-.135-.15-.135m.93-.121c-.09 0-.149.075-.165.164l-.18 2.76.195 2.621c.016.09.075.164.165.164.075 0 .149-.074.164-.164l.21-2.621-.21-2.76c-.015-.089-.074-.164-.164-.164m.93-.135c-.104 0-.18.089-.18.194l-.165 2.88.18 2.699c0 .104.075.194.18.194s.18-.09.194-.194l.195-2.699-.195-2.88c-.014-.105-.089-.194-.194-.194m.944-.135c-.104 0-.194.104-.21.21l-.149 3.015.164 2.759c.016.105.106.21.21.21s.194-.105.21-.21l.18-2.759-.18-3.015c-.016-.106-.105-.21-.21-.21m.945-.105c-.119 0-.209.105-.225.225l-.135 3.12.15 2.819c.015.119.105.224.224.224.12 0 .21-.105.225-.224l.165-2.819-.165-3.12c-.015-.12-.105-.225-.225-.225m1.904-1.74c-.105 0-.18.06-.225.135-.03.029-.03.06-.03.089l-.165 4.77.18 2.88c0 .03 0 .06.03.09.044.074.119.134.224.134.12 0 .194-.06.239-.135.015-.029.015-.06.015-.089l.195-2.88-.195-4.77c0-.03 0-.059-.015-.089-.045-.075-.12-.135-.239-.135m.93-.254c-.135 0-.255.12-.27.27l-.135 5.01.15 2.909c.015.149.135.27.27.27.149 0 .254-.121.269-.27l.165-2.909-.165-5.01c-.015-.15-.12-.27-.27-.27m.93-.405c-.149 0-.27.135-.284.285l-.121 5.4.135 2.939c.014.149.135.284.284.284.15 0 .27-.135.285-.284l.15-2.939-.15-5.4c-.015-.15-.135-.285-.285-.285m.945-.225c-.165 0-.3.149-.314.314l-.107 5.609.122 2.955c.014.164.149.314.314.314.149 0 .3-.15.314-.314l.12-2.955-.12-5.609c-.014-.165-.165-.314-.314-.314m.944-.09c-.18 0-.314.165-.33.345l-.09 5.699.105 2.969c.015.18.149.33.33.33.164 0 .314-.15.329-.33l.105-2.969-.105-5.699c-.015-.18-.164-.345-.329-.345m1.875-.734c-.21 0-.389.18-.389.389v8.652c0 .21.179.405.389.405h.255c2.596 0 4.695-2.085 4.695-4.665 0-2.594-2.1-4.781-4.695-4.781"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    case 'website':
    default:
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
        </svg>
      )
  }
}

export function SocialLinksInput({
  value = [],
  onChange,
  label,
  helpText,
  maxLinks = 8,
  className = ''
}: SocialLinksInputProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addLink = (platform: string) => {
    if (value.length >= maxLinks) return
    if (value.some(l => l.platform === platform)) return

    onChange([...value, { platform, url: '' }])
    setShowAddMenu(false)
  }

  const updateLink = (index: number, url: string) => {
    const newLinks = [...value]
    newLinks[index] = { ...newLinks[index], url }
    onChange(newLinks)
  }

  const removeLink = (index: number) => {
    const newLinks = [...value]
    newLinks.splice(index, 1)
    onChange(newLinks)
  }

  const availablePlatforms = SOCIAL_PLATFORM_OPTIONS.filter(
    p => !value.some(l => l.platform === p.value)
  )

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {value.map((link, index) => {
            const platformInfo = SOCIAL_PLATFORM_OPTIONS.find(p => p.value === link.platform)
            return (
              <motion.div
                key={link.platform}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-gray-400">
                  <PlatformIcon platform={link.platform} />
                </div>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder={platformInfo?.placeholder || 'URL eingeben'}
                  className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#610AD1] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="p-2.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Add Button */}
        {value.length < maxLinks && availablePlatforms.length > 0 && (
          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2.5 text-[#610AD1] hover:bg-[#610AD1]/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plattform hinzufügen
            </motion.button>

            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-64 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto py-2">
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform.value}
                        type="button"
                        onClick={() => addLink(platform.value)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-[#610AD1]/20 hover:text-white transition-colors"
                      >
                        <PlatformIcon platform={platform.value} />
                        <span>{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {helpText && (
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
}
