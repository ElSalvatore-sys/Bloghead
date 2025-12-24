import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { TableSkeleton } from './AdminSkeleton'
import { AdminEmptyState } from './AdminEmptyState'
import { Database } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  onRowClick?: (row: T) => void
  keyExtractor: (row: T) => string
}

export function AdminTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle = 'Keine Daten gefunden',
  emptyDescription,
  emptyIcon = Database,
  onRowClick,
  keyExtractor
}: AdminTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length} />
  }

  if (data.length === 0) {
    return (
      <AdminEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1e1e1e] rounded-xl border border-gray-800/50 overflow-hidden shadow-lg"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#262626] border-b border-gray-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-400
                    uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/30">
            <AnimatePresence mode="popLayout">
              {data.map((row, index) => (
                <motion.tr
                  key={keyExtractor(row)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors duration-150
                    ${onRowClick ? 'cursor-pointer hover:bg-gray-800/30' : 'hover:bg-gray-800/20'}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-4 text-sm text-gray-300 ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
