/**
 * AnalyticsPieChart - Phase 8 Analytics
 * Recharts wrapper for pie/donut charts
 */

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency, formatNumber } from '@/services/analyticsService'

interface DataPoint {
  name: string
  value: number
  color?: string
}

interface AnalyticsPieChartProps {
  data: DataPoint[]
  height?: number
  innerRadius?: number // 0 = pie, >0 = donut
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
  formatValue?: 'number' | 'currency' | 'percent'
  animate?: boolean
  centerLabel?: string
  centerValue?: string | number
  className?: string
}

// Default colors for the pie chart
const DEFAULT_COLORS = [
  '#7C3AED', // accent-purple
  '#EC4899', // pink
  '#FB7A43', // orange
  '#10B981', // green
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
]

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: DataPoint & { color: string }
  }>
  formatValue?: (value: number) => string
}

function CustomTooltip({ active, payload, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const entry = payload[0]

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.payload.color }}
        />
        <span className="text-white/80 text-sm">{entry.name}:</span>
        <span className="text-white font-semibold text-sm">
          {formatValue ? formatValue(entry.value) : entry.value}
        </span>
      </div>
    </div>
  )
}

export function AnalyticsPieChart({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = true,
  showLabels = false,
  formatValue = 'number',
  animate = true,
  centerLabel,
  centerValue,
  className = '',
}: AnalyticsPieChartProps) {
  // Add default colors to data if not provided
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  // Format value based on type
  const formatValueFn = (value: number): string => {
    switch (formatValue) {
      case 'currency':
        return formatCurrency(value)
      case 'percent':
        return `${value}%`
      default:
        return formatNumber(value)
    }
  }

  // Custom label renderer that handles undefined values
  const renderCustomLabel = (entry: { name?: string; percent?: number }) => {
    const name = entry.name || ''
    const percent = entry.percent || 0
    return `${name} (${(percent * 100).toFixed(0)}%)`
  }

  return (
    <div className={`w-full relative ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={showLabels ? renderCustomLabel : false}
            labelLine={showLabels}
            isAnimationActive={animate}
          >
            {dataWithColors.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                style={{ outline: 'none', cursor: 'pointer' }}
              />
            ))}
          </Pie>

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip formatValue={formatValueFn} />} />

          {/* Legend */}
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-white/80 text-sm">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label for donut charts */}
      {innerRadius > 0 && (centerLabel || centerValue) && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
          style={{ marginTop: showLegend ? -20 : 0 }}
        >
          {centerValue && (
            <p className="text-2xl font-bold text-white">{centerValue}</p>
          )}
          {centerLabel && (
            <p className="text-sm text-white/60">{centerLabel}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default AnalyticsPieChart
