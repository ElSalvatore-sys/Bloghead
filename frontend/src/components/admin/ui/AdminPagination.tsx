import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true
}: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5
    let start = Math.max(1, currentPage - Math.floor(showPages / 2))
    const end = Math.min(totalPages, start + showPages - 1)

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const ButtonStyle = `p-2 rounded-lg transition-all duration-200
    disabled:opacity-30 disabled:cursor-not-allowed`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-1"
    >
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${ButtonStyle} text-gray-400 hover:text-white hover:bg-gray-800/50`}
          title="Erste Seite"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${ButtonStyle} text-gray-400 hover:text-white hover:bg-gray-800/50`}
        title="Vorherige Seite"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200
                ${currentPage === page
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
            >
              {page}
            </motion.button>
          ) : (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              {page}
            </span>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${ButtonStyle} text-gray-400 hover:text-white hover:bg-gray-800/50`}
        title="Nächste Seite"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${ButtonStyle} text-gray-400 hover:text-white hover:bg-gray-800/50`}
          title="Letzte Seite"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}
