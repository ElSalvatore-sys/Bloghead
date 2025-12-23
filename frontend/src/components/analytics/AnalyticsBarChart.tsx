/**
 * AnalyticsBarChart - Phase 8 Analytics
 * Recharts wrapper for bar charts
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { formatCurrency, formatNumber } from '@/services/analyticsService'

interface DataPoint {
  name: string
  value: number
  color?: string
  [key: string]: string | number | undefined
}

interface BarConfig {
  dataKey: string
  name: string
  color: string
  stackId?: string
  radius?: [number, number, number, number]
}

interface AnalyticsBarChartProps {
  data: DataPoint[]
  bars?: BarConfig[]
  xAxisKey?: string
  height?: number
  layout?: 'horizontal' | 'vertical'
  showGrid?: boolean
  showLegend?: boolean
  formatYAxis?: 'number' | 'currency' | 'percent'
  formatTooltip?: (value: number) => string
  animate?: boolean
  barSize?: number
  barGap?: number
  useDataColors?: boolean // Use colors from data points
  className?: string
}

// Default single bar configuration
const defaultBar: BarConfig = {
  dataKey: 'value',
  name: 'Wert',
  color: '#7C3AED', // accent-purple
  radius: [4, 4, 0, 0],
}

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    payload: DataPoint
  }>
  label?: string
  formatValue?: (value: number) => string
}

function CustomTooltip({ active, payload, label, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white/60 text-xs mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80 text-sm">{entry.name}:</span>
          <span className="text-white font-semibold text-sm">
            {formatValue ? formatValue(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsBarChart({
  data,
  bars = [defaultBar],
  xAxisKey = 'name',
  height = 300,
  layout = 'horizontal',
  showGrid = true,
  showLegend = false,
  formatYAxis = 'number',
  formatTooltip,
  animate = true,
  barSize,
  barGap = 4,
  useDataColors = false,
  className = '',
}: AnalyticsBarChartProps) {
  // Format axis values
  const formatAxisValue = (value: number): string => {
    switch (formatYAxis) {
      case 'currency':
        return formatCurrency(value)
      case 'percent':
        return `${value}%`
      default:
        return formatNumber(value)
    }
  }

  // Format tooltip values
  const formatTooltipValue = (value: number): string => {
    if (formatTooltip) return formatTooltip(value)
    return formatAxisValue(value)
  }

  const isVertical = layout === 'vertical'

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barGap={barGap}
        >
          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}

          {/* X Axis */}
          <XAxis
            type={isVertical ? 'number' : 'category'}
            dataKey={isVertical ? undefined : xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickFormatter={isVertical ? formatAxisValue : undefined}
            dy={isVertical ? 0 : 10}
          />

          {/* Y Axis */}
          <YAxis
            type={isVertical ? 'category' : 'number'}
            dataKey={isVertical ? xAxisKey : undefined}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickFormatter={isVertical ? undefined : formatAxisValue}
            dx={-10}
            width={isVertical ? 100 : 60}
          />

          {/* Tooltip */}
          <Tooltip
            content={<CustomTooltip formatValue={formatTooltipValue} />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />

          {/* Legend */}
          {showLegend && bars.length > 1 && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-white/80 text-sm">{value}</span>
              )}
            />
          )}

          {/* Bars */}
          {bars.map((bar, barIndex) => (
            <Bar
              key={`bar-${barIndex}`}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stackId}
              radius={bar.radius || [4, 4, 0, 0]}
              barSize={barSize}
              isAnimationActive={animate}
            >
              {/* Individual cell colors from data */}
              {useDataColors &&
                data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || bar.color}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AnalyticsBarChart
