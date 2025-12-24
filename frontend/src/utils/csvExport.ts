/**
 * CSV Export Utility
 * Exports data arrays to downloadable CSV files
 */

export interface CSVColumn<T> {
  key: keyof T | ((row: T) => string | number | null | undefined)
  label: string
}

/**
 * Export data to a CSV file
 * @param data - Array of objects to export
 * @param filename - Base filename (without extension)
 * @param columns - Column definitions with keys and labels
 */
export function exportToCSV<T extends object>(
  data: T[],
  filename: string,
  columns: CSVColumn<T>[]
): void {
  if (data.length === 0) {
    alert('Keine Daten zum Exportieren')
    return
  }

  // Build header row
  const header = columns.map(c => escapeCSV(c.label)).join(',')

  // Build data rows
  const rows = data.map(row =>
    columns
      .map(c => {
        let value: unknown
        if (typeof c.key === 'function') {
          value = c.key(row)
        } else {
          value = row[c.key]
        }
        return escapeCSV(formatValue(value))
      })
      .join(',')
  )

  // Combine header and rows
  const csv = [header, ...rows].join('\n')

  // Create and trigger download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${formatDate(new Date())}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format value for CSV output
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein'
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('de-DE')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format currency for CSV
 */
export function formatCurrencyCSV(amount: number | null | undefined, currency = 'EUR'): string {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Format date/time for CSV
 */
export function formatDateTimeCSV(dateString: string | null | undefined): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
