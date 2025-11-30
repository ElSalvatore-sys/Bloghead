import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef, useRef, useState } from 'react'
import { PlusIcon, CloseIcon, LinkIcon } from '../icons'

// Form Section wrapper
interface FormSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, children, className = '' }: FormSectionProps) {
  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Form row for side-by-side fields
interface FormRowProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function FormRow({ children, columns = 2, className = '' }: FormRowProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  )
}

// Form Input with label
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required, error, className = '', ...props }, ref) => {
    const inputId = props.id || label.toLowerCase().replace(/\s+/g, '-').replace(/[*]/g, '')

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2"
        >
          {label}{required && <span className="text-accent-red ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-5 py-3
            bg-transparent border border-white/30 rounded-full
            text-white placeholder:text-white/40
            text-sm
            transition-colors duration-200
            focus:outline-none focus:border-accent-purple
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-accent-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-accent-red">{error}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

// Form Textarea with label
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  error?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, required, error, className = '', ...props }, ref) => {
    const inputId = props.id || label.toLowerCase().replace(/\s+/g, '-').replace(/[*]/g, '')

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2"
        >
          {label}{required && <span className="text-accent-red ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full px-5 py-3
            bg-transparent border border-white/30 rounded-2xl
            text-white placeholder:text-white/40
            text-sm
            transition-colors duration-200
            focus:outline-none focus:border-accent-purple
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-accent-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-accent-red">{error}</p>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// Form Select with label
interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  error?: string
  options: { value: string; label: string }[]
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, required, error, options, className = '', ...props }, ref) => {
    const inputId = props.id || label.toLowerCase().replace(/\s+/g, '-').replace(/[*]/g, '')

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2"
        >
          {label}{required && <span className="text-accent-red ml-1">*</span>}
        </label>
        <select
          ref={ref}
          id={inputId}
          className={`
            w-full px-5 py-3
            bg-transparent border border-white/30 rounded-full
            text-white
            text-sm
            transition-colors duration-200
            focus:outline-none focus:border-accent-purple
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            cursor-pointer
            ${error ? 'border-accent-red' : ''}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff60' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 1rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-bg-card">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-accent-red">{error}</p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'

// Checkbox with label
interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    const inputId = props.id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <label
        htmlFor={inputId}
        className={`flex items-center gap-3 cursor-pointer ${className}`}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="
            w-5 h-5
            rounded border border-white/30
            bg-transparent
            text-accent-purple
            focus:ring-accent-purple focus:ring-offset-0 focus:ring-2
            cursor-pointer
          "
          {...props}
        />
        <span className="text-sm text-white">{label}</span>
      </label>
    )
  }
)

FormCheckbox.displayName = 'FormCheckbox'

// Tags input component
interface TagsInputProps {
  label: string
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
}

export function TagsInput({ label, tags, onTagsChange, placeholder = 'Tag hinzufügen...' }: TagsInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      const value = input.value.trim()
      if (value && !tags.includes(value)) {
        onTagsChange([...tags, value])
        input.value = ''
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="
              inline-flex items-center gap-1 px-3 py-1
              bg-accent-purple/20 text-white text-sm
              rounded-full
            "
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-accent-red transition-colors"
            >
              <CloseIcon size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="
          w-full px-5 py-3
          bg-transparent border border-white/30 rounded-full
          text-white placeholder:text-white/40
          text-sm
          transition-colors duration-200
          focus:outline-none focus:border-accent-purple
        "
      />
    </div>
  )
}

// Social media links input
interface SocialLink {
  platform: string
  url: string
}

interface SocialLinksInputProps {
  label: string
  links: SocialLink[]
  onLinksChange: (links: SocialLink[]) => void
}

export function SocialLinksInput({ label, links, onLinksChange }: SocialLinksInputProps) {
  const addLink = () => {
    onLinksChange([...links, { platform: '', url: '' }])
  }

  const updateLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    onLinksChange(newLinks)
  }

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <LinkIcon size={20} className="text-white/60" />
            </div>
            <select
              value={link.platform}
              onChange={(e) => updateLink(index, 'platform', e.target.value)}
              className="
                w-32 px-3 py-2
                bg-transparent border border-white/30 rounded-full
                text-white text-sm
                focus:outline-none focus:border-accent-purple
                appearance-none cursor-pointer
              "
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff60' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.2em 1.2em',
              }}
            >
              <option value="" className="bg-bg-card">Plattform</option>
              <option value="instagram" className="bg-bg-card">Instagram</option>
              <option value="facebook" className="bg-bg-card">Facebook</option>
              <option value="twitter" className="bg-bg-card">Twitter</option>
              <option value="youtube" className="bg-bg-card">YouTube</option>
              <option value="soundcloud" className="bg-bg-card">SoundCloud</option>
              <option value="spotify" className="bg-bg-card">Spotify</option>
              <option value="website" className="bg-bg-card">Website</option>
            </select>
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              placeholder="https://"
              className="
                flex-1 px-4 py-2
                bg-transparent border border-white/30 rounded-full
                text-white placeholder:text-white/40
                text-sm
                focus:outline-none focus:border-accent-purple
              "
            />
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="p-2 text-white/60 hover:text-accent-red transition-colors"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addLink}
        className="
          mt-3 flex items-center gap-2 px-4 py-2
          text-white/60 hover:text-white
          text-sm font-medium uppercase tracking-wide
          transition-colors
        "
      >
        <PlusIcon size={20} />
        Link hinzufügen
      </button>
    </div>
  )
}

// File upload input
interface FileUploadProps {
  label: string
  accept?: string
  currentFile?: string
  onFileSelect: (file: File) => void
}

export function FileUpload({ label, accept = '*', currentFile, onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div
        onClick={handleClick}
        className="
          w-full px-5 py-4
          border border-dashed border-white/30 rounded-2xl
          flex items-center justify-center gap-3
          cursor-pointer
          hover:border-accent-purple transition-colors
        "
      >
        <PlusIcon size={24} className="text-white/60" />
        <span className="text-sm text-white/60">
          {currentFile || 'Datei hochladen'}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}

// Audio upload with preview player
interface AudioUploadProps {
  label: string
  audioUrl?: string
  onAudioSelect: (file: File, url: string) => void
}

export function AudioUpload({ label, audioUrl, onAudioSelect }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const displayUrl = preview || audioUrl

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      onAudioSelect(file, url)
    }
  }

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
        {label}
      </label>

      {displayUrl ? (
        <div className="space-y-3">
          <audio
            controls
            src={displayUrl}
            className="w-full h-12 rounded-full"
            style={{
              filter: 'invert(1)',
            }}
          />
          <button
            type="button"
            onClick={handleClick}
            className="
              text-sm text-accent-purple hover:text-accent-salmon
              transition-colors
            "
          >
            Andere Datei wählen
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="
            w-full px-5 py-6
            border border-dashed border-white/30 rounded-2xl
            flex flex-col items-center justify-center gap-2
            cursor-pointer
            hover:border-accent-purple transition-colors
          "
        >
          <PlusIcon size={32} className="text-white/60" />
          <span className="text-sm text-white/60">Hörprobe hinzufügen</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}

