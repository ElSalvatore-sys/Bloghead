interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'purple' | 'orange' | 'green' | 'blue' | 'red'
}

const colorClasses = {
  purple: 'from-purple-600 to-purple-800',
  orange: 'from-orange-500 to-orange-700',
  green: 'from-green-500 to-green-700',
  blue: 'from-blue-500 to-blue-700',
  red: 'from-red-500 to-red-700'
}

export function StatsCard({ title, value, icon, trend, color = 'purple' }: StatsCardProps) {
  return (
    <div className="bg-[#262626] rounded-xl p-6 border border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-gray-500 ml-1">vs. letzter Monat</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
