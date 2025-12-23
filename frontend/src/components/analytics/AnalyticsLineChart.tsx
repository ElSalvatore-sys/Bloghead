/**
 * AnalyticsLineChart - Phase 8 Analytics
 * Recharts wrapper for time series line charts
 */

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts'
import { formatCurrency, formatNumber, type ChartDataPoint } from '@/services/analyticsService'

// Support both ChartDataPoint from service and generic data
type DataPoint = ChartDataPoint | Record<string, string | number | undefined>

interface LineConfig {
  dataKey: string
  name: string
  color: string
  strokeWidth?: number
  dotSize?: number
  showArea?: boolean
}

interface AnalyticsLineChartProps {
  data: DataPoint[]
  lines?: LineConfig[]
  xAxisKey?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showDots?: boolean
  formatYAxis?: 'number' | 'currency' | 'percent'
  formatTooltip?: (value: number) => string
  animate?: boolean
  gradientId?: string
  className?: string
}

// Default single line configuration
const defaultLine: LineConfig = {
  dataKey: 'value',
  name: 'Wert',
  color: '#7C3AED', // accent-purple
  strokeWidth: 2,
  dotSize: 4,
  showArea: true,
}

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
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
            className="w-3 h-3 rounded-full"
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

export function AnalyticsLineChart({
  data,
  lines = [defaultLine],
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = false,
  showDots = true,
  formatYAxis = 'number',
  formatTooltip,
  animate = true,
  gradientId = 'lineGradient',
  className = '',
}: AnalyticsLineChartProps) {
  // Format Y-axis values
  const formatYAxisValue = (value: number): string => {
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
    return formatYAxisValue(value)
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Gradient definitions */}
          <defs>
            {lines.map((line, index) => (
              <linearGradient
                key={`${gradientId}-${index}`}
                id={`${gradientId}-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
          )}

          {/* X Axis */}
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            dy={10}
          />

          {/* Y Axis */}
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickFormatter={formatYAxisValue}
            dx={-10}
            width={60}
          />

          {/* Tooltip */}
          <Tooltip
            content={<CustomTooltip formatValue={formatTooltipValue} />}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />

          {/* Legend */}
          {showLegend && lines.length > 1 && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-white/80 text-sm">{value}</span>
              )}
            />
          )}

          {/* Areas (if enabled) */}
          {lines.map(
            (line, index) =>
              line.showArea && (
                <Area
                  key={`area-${index}`}
                  type="monotone"
                  dataKey={line.dataKey}
                  fill={`url(#${gradientId}-${index})`}
                  stroke="none"
                  isAnimationActive={animate}
                />
              )
          )}

          {/* Lines */}
          {lines.map((line, index) => (
            <Line
              key={`line-${index}`}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={
                showDots
                  ? {
                      fill: line.color,
                      strokeWidth: 0,
                      r: line.dotSize || 4,
                    }
                  : false
              }
              activeDot={{
                fill: line.color,
                stroke: '#fff',
                strokeWidth: 2,
                r: 6,
              }}
              isAnimationActive={animate}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AnalyticsLineChart
