import { useState } from 'react'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  max?: number
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  max,
  className = ''
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else if (!max || selected.length < max) {
      onChange([...selected, option])
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected chips display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[48px] px-4 py-2 bg-white/5 border border-white/20 rounded-xl cursor-pointer flex flex-wrap gap-2 items-center hover:border-white/40 transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        ) : (
          selected.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-sm text-white"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleOption(item)
                }}
                className="hover:text-red-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        )}
        <svg
          className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute z-20 w-full mt-2 py-2 bg-gray-900 border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                disabled={max !== undefined && !selected.includes(option) && selected.length >= max}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between
                  ${selected.includes(option)
                    ? 'bg-purple-600/20 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                  }
                  ${max !== undefined && !selected.includes(option) && selected.length >= max
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }
                `}
              >
                {option}
                {selected.includes(option) && (
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Max indicator */}
      {max && (
        <p className="mt-1 text-xs text-gray-500">
          {selected.length}/{max} ausgewählt
        </p>
      )}
    </div>
  )
}
