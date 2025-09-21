import { cn } from '@/lib/utils'

interface AqiBadgeProps {
  aqi: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function AqiBadge({ aqi, size = 'md', showLabel = true }: AqiBadgeProps) {
  const getAqiInfo = (aqi: number) => {
    if (aqi <= 50) {
      return { category: 'Good', color: 'bg-gradient-to-r from-green-400 to-green-600', textColor: 'text-white', emoji: '😊' }
    } else if (aqi <= 100) {
      return { category: 'Moderate', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', textColor: 'text-white', emoji: '😐' }
    } else if (aqi <= 150) {
      return { category: 'USG', color: 'bg-gradient-to-r from-orange-400 to-orange-600', textColor: 'text-white', emoji: '😷' }
    } else if (aqi <= 200) {
      return { category: 'Unhealthy', color: 'bg-gradient-to-r from-red-400 to-red-600', textColor: 'text-white', emoji: '😨' }
    } else if (aqi <= 300) {
      return { category: 'Very Unhealthy', color: 'bg-gradient-to-r from-purple-500 to-purple-700', textColor: 'text-white', emoji: '🚨' }
    } else {
      return { category: 'Hazardous', color: 'bg-gradient-to-r from-red-700 to-red-900', textColor: 'text-white', emoji: '☠️' }
    }
  }

  const { category, color, textColor, emoji } = getAqiInfo(aqi)
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base'
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-2xl font-bold shadow-lg transform transition-all duration-200 hover:scale-105',
      color,
      textColor,
      sizeClasses[size]
    )}>
      <span className="text-lg">{emoji}</span>
      <span className="font-black">{aqi}</span>
      {showLabel && <span className="font-medium">{category}</span>}
    </div>
  )
}