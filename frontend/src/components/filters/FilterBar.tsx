import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/Button'

// Chevron icon for dropdowns
function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

// Filter Dropdown Component
interface FilterDropdownProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isInput?: boolean
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  isInput = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  if (isInput) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          className="
            px-6 py-3 min-w-[150px]
            bg-transparent
            border border-white/30 rounded-full
            font-sans text-sm font-medium text-white
            uppercase tracking-wider
            placeholder:text-white/60 placeholder:uppercase
            focus:outline-none focus:border-accent-purple
            transition-colors duration-200
          "
        />
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-2
          px-6 py-3 min-w-[150px]
          bg-transparent
          border rounded-full
          font-sans text-sm font-medium text-white
          uppercase tracking-wider
          transition-all duration-200
          ${isOpen ? 'border-accent-purple bg-accent-purple/10' : 'border-white/30 hover:border-white/50'}
        `}
      >
        <span className={value ? 'text-white' : 'text-white/60'}>
          {selectedOption?.label || placeholder || label}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-full z-10">
          <div className="bg-bg-card border border-white/10 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2.5 text-left
                  text-sm font-medium uppercase tracking-wider
                  transition-colors duration-150
                  ${option.value === value
                    ? 'bg-accent-purple/20 text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Range Slider Component
interface RangeSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

export function RangeSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = 'km',
}: RangeSliderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div ref={sliderRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-2
          px-6 py-3 min-w-[120px]
          bg-transparent
          border rounded-full
          font-sans text-sm font-medium text-white
          uppercase tracking-wider
          transition-all duration-200
          ${isOpen ? 'border-accent-purple bg-accent-purple/10' : 'border-white/30 hover:border-white/50'}
        `}
      >
        <span>{value} {unit}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 z-10">
          <div className="bg-bg-card border border-white/10 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-white/60 uppercase tracking-wider">{label}</span>
              <span className="text-sm font-bold text-white">{value} {unit}</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full">
              <div
                className="absolute h-full bg-gradient-to-r from-accent-purple to-accent-red rounded-full"
                style={{ width: `${percentage}%` }}
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="
                  absolute inset-0 w-full h-full opacity-0 cursor-pointer
                "
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${percentage}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>{min} {unit}</span>
              <span>{max} {unit}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Filter Bar Props
export interface FilterBarFilters {
  name: string
  genre: string
  location: string
  radius: number
  category: string
}

interface FilterBarProps {
  filters: FilterBarFilters
  onFiltersChange: (filters: FilterBarFilters) => void
  onApply: () => void
  genreOptions?: { value: string; label: string }[]
  categoryOptions?: { value: string; label: string }[]
}

// Default options
const defaultGenreOptions = [
  { value: '', label: 'Alle Genres' },
  { value: 'hip-hop', label: 'Hip Hop' },
  { value: 'rnb', label: "R'n'B" },
  { value: 'electronic', label: 'Electronic' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Klassik' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'latin', label: 'Latin' },
]

const defaultCategoryOptions = [
  { value: '', label: 'Alle Kategorien' },
  { value: 'dj', label: 'DJ' },
  { value: 'singer', label: 'Sänger/in' },
  { value: 'band', label: 'Band' },
  { value: 'rapper', label: 'Rapper/in' },
  { value: 'musician', label: 'Musiker/in' },
  { value: 'producer', label: 'Produzent/in' },
  { value: 'duo', label: 'Duo' },
]

export function FilterBar({
  filters,
  onFiltersChange,
  onApply,
  genreOptions = defaultGenreOptions,
  categoryOptions = defaultCategoryOptions,
}: FilterBarProps) {
  const updateFilter = <K extends keyof FilterBarFilters>(
    key: K,
    value: FilterBarFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
      {/* Name Input */}
      <FilterDropdown
        label="Name"
        options={[]}
        value={filters.name}
        onChange={(value) => updateFilter('name', value)}
        placeholder="Name"
        isInput
      />

      {/* Genre Dropdown */}
      <FilterDropdown
        label="Genre"
        options={genreOptions}
        value={filters.genre}
        onChange={(value) => updateFilter('genre', value)}
        placeholder="Genre"
      />

      {/* Location Input */}
      <FilterDropdown
        label="Ort"
        options={[]}
        value={filters.location}
        onChange={(value) => updateFilter('location', value)}
        placeholder="Ort Eingeben"
        isInput
      />

      {/* Radius Slider */}
      <RangeSlider
        label="Umkreis"
        value={filters.radius}
        onChange={(value) => updateFilter('radius', value)}
        min={5}
        max={200}
        step={5}
        unit="km"
      />

      {/* Category Dropdown */}
      <FilterDropdown
        label="Kategorie"
        options={categoryOptions}
        value={filters.category}
        onChange={(value) => updateFilter('category', value)}
        placeholder="Kategorie"
      />

      {/* Apply Button */}
      <Button
        variant="primary"
        size="md"
        onClick={onApply}
        className="rounded-full px-6 uppercase tracking-wider"
      >
        Filter Anwenden
      </Button>
    </div>
  )
}
