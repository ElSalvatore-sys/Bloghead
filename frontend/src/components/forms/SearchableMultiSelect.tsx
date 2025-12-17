import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Option {
  value: string
  label: string
}

interface SearchableMultiSelectProps {
  options: readonly Option[] | Option[]
  value: string[]
  onChange: (value: string[]) => void
  label: string
  placeholder?: string
  helpText?: string
  maxSelections?: number
  allowCustom?: boolean
  customPlaceholder?: string
  className?: string
}

export function SearchableMultiSelect({
  options,
  value = [],
  onChange,
  label,
  placeholder = 'Suchen...',
  helpText,
  maxSelections,
  allowCustom = false,
  customPlaceholder = 'Eigene Option hinzufügen...',
  className = ''
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customValue, setCustomValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search
  const filteredOptions = options.filter(
    opt =>
      !value.includes(opt.value) &&
      opt.label.toLowerCase().includes(search.toLowerCase())
  )

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      if (maxSelections && value.length >= maxSelections) return
      onChange([...value, optValue])
    }
    setSearch('')
  }

  const addCustomOption = () => {
    if (!customValue.trim()) return
    if (maxSelections && value.length >= maxSelections) return
    if (value.includes(customValue.trim())) return

    onChange([...value, customValue.trim()])
    setCustomValue('')
  }

  const removeValue = (val: string) => {
    onChange(value.filter(v => v !== val))
  }

  const getLabel = (val: string) => {
    const opt = options.find(o => o.value === val)
    return opt ? opt.label : val // Return value itself for custom options
  }

  const canAddMore = !maxSelections || value.length < maxSelections

  return (
    <div className={className} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
        {maxSelections && (
          <span className="text-gray-500 font-normal ml-2">
            ({value.length}/{maxSelections})
          </span>
        )}
      </label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        <AnimatePresence mode="popLayout">
          {value.map(val => (
            <motion.span
              key={val}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#610AD1]/20 text-[#610AD1] rounded-full text-sm"
            >
              {getLabel(val)}
              <button
                type="button"
                onClick={() => removeValue(val)}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div
          className={`relative flex items-center bg-[#1a1a1a] border border-gray-700 rounded-lg transition-all ${
            isOpen ? 'ring-2 ring-[#610AD1] border-transparent' : ''
          }`}
        >
          <svg
            className="absolute left-3 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={canAddMore ? placeholder : 'Maximum erreicht'}
            disabled={!canAddMore}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && canAddMore && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-[#610AD1]/20 hover:text-white transition-colors"
                    >
                      {option.label}
                    </button>
                  ))
                ) : search && !allowCustom ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    Keine Ergebnisse für "{search}"
                  </div>
                ) : null}

                {/* Custom option input */}
                {allowCustom && (
                  <div className="border-t border-gray-700 p-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomOption()
                          }
                        }}
                        placeholder={customPlaceholder}
                        className="flex-1 px-3 py-2 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#610AD1]"
                      />
                      <motion.button
                        type="button"
                        onClick={addCustomOption}
                        disabled={!customValue.trim()}
                        className="px-3 py-2 bg-[#610AD1] text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {helpText && (
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
}
