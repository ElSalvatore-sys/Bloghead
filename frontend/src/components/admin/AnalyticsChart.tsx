interface ChartData {
  label: string
  value: number
}

interface AnalyticsChartProps {
  title: string
  data: ChartData[]
  type?: 'bar' | 'line'
  color?: string
  valuePrefix?: string
  valueSuffix?: string
}

export function AnalyticsChart({
  title,
  data,
  type = 'bar',
  color = '#9333ea',
  valuePrefix = '',
  valueSuffix = ''
}: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
        <h3 className="text-white font-medium mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          Keine Daten verfuegbar
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minBarHeight = 4

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${valuePrefix}${(value / 1000000).toFixed(1)}M${valueSuffix}`
    }
    if (value >= 1000) {
      return `${valuePrefix}${(value / 1000).toFixed(1)}K${valueSuffix}`
    }
    return `${valuePrefix}${value}${valueSuffix}`
  }

  return (
    <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
      <h3 className="text-white font-medium mb-4">{title}</h3>

      {type === 'bar' ? (
        <div className="h-48 flex items-end gap-2">
          {data.map((item, index) => {
            const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : minBarHeight
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-gray-400 text-xs">
                  {formatValue(item.value)}
                </span>
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${Math.max(heightPercent, minBarHeight)}%`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                  title={`${item.label}: ${formatValue(item.value)}`}
                />
                <span className="text-gray-500 text-xs truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-48 relative">
          <svg className="w-full h-full" viewBox={`0 0 ${data.length * 50} 100`} preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={100 - y}
                x2={data.length * 50}
                y2={100 - y}
                stroke="#374151"
                strokeWidth="0.5"
              />
            ))}

            {/* Line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data
                .map((item, index) => {
                  const x = index * 50 + 25
                  const y = maxValue > 0 ? 100 - (item.value / maxValue) * 90 : 95
                  return `${x},${y}`
                })
                .join(' ')}
            />

            {/* Area fill */}
            <polygon
              fill={`${color}20`}
              points={`25,100 ${data
                .map((item, index) => {
                  const x = index * 50 + 25
                  const y = maxValue > 0 ? 100 - (item.value / maxValue) * 90 : 95
                  return `${x},${y}`
                })
                .join(' ')} ${(data.length - 1) * 50 + 25},100`}
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = index * 50 + 25
              const y = maxValue > 0 ? 100 - (item.value / maxValue) * 90 : 95
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="hover:r-4 transition-all cursor-pointer"
                >
                  <title>{`${item.label}: ${formatValue(item.value)}`}</title>
                </circle>
              )
            })}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2">
            {data.map((item, index) => (
              <span key={index} className="text-gray-500 text-xs">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Pie chart for user distribution
interface PieChartProps {
  title: string
  data: ChartData[]
  colors?: string[]
}

export function PieChart({ title, data, colors = ['#9333ea', '#f97316', '#22c55e', '#3b82f6', '#ef4444'] }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
        <h3 className="text-white font-medium mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          Keine Daten verfuegbar
        </div>
      </div>
    )
  }

  // Calculate segments
  let currentAngle = 0
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    currentAngle += angle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (startAngle + angle - 90) * (Math.PI / 180)

    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    return {
      ...item,
      percentage,
      color: colors[index % colors.length],
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    }
  })

  return (
    <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
      <h3 className="text-white font-medium mb-4">{title}</h3>

      <div className="flex items-center gap-6">
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>

        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-300 text-sm flex-1">{segment.label}</span>
              <span className="text-gray-500 text-sm">
                {segment.value} ({segment.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
