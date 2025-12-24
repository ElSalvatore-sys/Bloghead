import { motion } from 'framer-motion'
import { FileQuestion, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface AdminEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  children?: ReactNode
}

export function AdminEmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  children
}: AdminEmptyStateProps) {
  const ActionIcon = action?.icon || Plus

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center
        bg-[#1e1e1e] rounded-xl border border-gray-800/50 border-dashed"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="p-4 bg-gray-800/50 rounded-full mb-4"
      >
        <Icon className="w-8 h-8 text-gray-500" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-semibold text-white mb-2"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-md mb-6"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700
            text-white font-medium rounded-lg transition-colors duration-200
            shadow-lg shadow-purple-500/20"
        >
          <ActionIcon className="w-4 h-4" />
          {action.label}
        </motion.button>
      )}
      {children}
    </motion.div>
  )
}
