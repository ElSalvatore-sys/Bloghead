import { motion } from 'framer-motion'

interface PriceRangeInputProps {
  minValue: number | null
  maxValue: number | null
  onMinChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
  label: string
  helpText?: string
  currency?: string
  minPlaceholder?: string
  maxPlaceholder?: string
  className?: string
}

export function PriceRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label,
  helpText,
  currency = '€',
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  className = ''
}: PriceRangeInputProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onMinChange(null)
    } else {
      const num = parseFloat(val)
      if (!isNaN(num) && num >= 0) {
        onMinChange(num)
      }
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onMaxChange(null)
    } else {
      const num = parseFloat(val)
      if (!isNaN(num) && num >= 0) {
        onMaxChange(num)
      }
    }
  }

  const hasError = minValue !== null && maxValue !== null && minValue > maxValue

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>

      <div className="flex items-center gap-3">
        {/* Min Input */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {currency}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={minValue ?? ''}
            onChange={handleMinChange}
            placeholder={minPlaceholder}
            className={`w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-[#610AD1]'
            }`}
          />
        </div>

        {/* Separator */}
        <span className="text-gray-500">–</span>

        {/* Max Input */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {currency}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={maxValue ?? ''}
            onChange={handleMaxChange}
            placeholder={maxPlaceholder}
            className={`w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-[#610AD1]'
            }`}
          />
        </div>
      </div>

      {hasError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-400"
        >
          Minimum darf nicht größer als Maximum sein
        </motion.p>
      )}

      {helpText && !hasError && (
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
}
