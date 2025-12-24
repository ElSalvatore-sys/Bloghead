import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AdminCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function AdminCard({ children, className = '', hover = true, delay = 0 }: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? {
        y: -2,
        boxShadow: '0 8px 30px rgba(97, 10, 209, 0.15)',
        transition: { duration: 0.2 }
      } : undefined}
      className={`bg-[#1e1e1e] rounded-xl border border-gray-800/50
        shadow-lg backdrop-blur-sm transition-colors duration-200
        hover:border-purple-500/30 ${className}`}
    >
      {children}
    </motion.div>
  )
}
