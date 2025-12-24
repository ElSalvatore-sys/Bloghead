import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink'
  delay?: number
}

const colorStyles = {
  purple: {
    gradient: 'from-purple-600 to-purple-800',
    shadow: 'shadow-purple-500/20',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400'
  },
  blue: {
    gradient: 'from-blue-600 to-blue-800',
    shadow: 'shadow-blue-500/20',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400'
  },
  green: {
    gradient: 'from-green-600 to-green-800',
    shadow: 'shadow-green-500/20',
    bg: 'bg-green-500/10',
    text: 'text-green-400'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-700',
    shadow: 'shadow-orange-500/20',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400'
  },
  red: {
    gradient: 'from-red-600 to-red-800',
    shadow: 'shadow-red-500/20',
    bg: 'bg-red-500/10',
    text: 'text-red-400'
  },
  pink: {
    gradient: 'from-pink-600 to-pink-800',
    shadow: 'shadow-pink-500/20',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400'
  }
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs. letzter Monat',
  color = 'purple',
  delay = 0
}: AdminStatCardProps) {
  const styles = colorStyles[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        transition: { duration: 0.2 }
      }}
      className="bg-[#1e1e1e] rounded-xl border border-gray-800/50 p-6
        shadow-lg hover:border-gray-700/50 transition-colors duration-200"
    >
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.1, duration: 0.3 }}
          className={`p-3 rounded-xl bg-gradient-to-br ${styles.gradient} ${styles.shadow} shadow-lg`}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        {trend !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full
              ${trend >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}
          >
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </motion.div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.15 }}
          className="text-3xl font-bold text-white mt-1"
        >
          {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
        </motion.p>
        {trend !== undefined && (
          <p className="text-xs text-gray-500 mt-2">{trendLabel}</p>
        )}
      </div>
    </motion.div>
  )
}
