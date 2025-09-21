'use client'

interface DataSource {
  satellite: boolean
  ground_sensors: boolean
  aqicn?: boolean
  weather: boolean
}

interface DataSourceIndicatorProps {
  dataSources: DataSource
  dataQuality: string
  model: string
  className?: string
}

export function DataSourceIndicator({ dataSources, dataQuality, model, className = '' }: DataSourceIndicatorProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'high': return '🟢'
      case 'medium': return '🟡'
      case 'low': return '🟠'
      default: return '⚪'
    }
  }

  const isRealTime = model.includes('tempo_openaq') || dataSources.satellite || dataSources.ground_sensors

  return (
    <div className={`bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <span className="mr-2">🔗</span>
          Data Sources
        </h4>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getQualityColor(dataQuality)}`}>
            {getQualityIcon(dataQuality)} {dataQuality.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className={`text-center p-2 rounded-xl ${
          dataSources.satellite 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <div className="text-lg">🛰️</div>
          <div className="text-xs font-medium">NASA TEMPO</div>
          <div className="text-xs">{dataSources.satellite ? 'Active' : 'Offline'}</div>
        </div>

        <div className={`text-center p-2 rounded-xl ${
          dataSources.ground_sensors
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <div className="text-lg">📡</div>
          <div className="text-xs font-medium">OpenAQ</div>
          <div className="text-xs">{dataSources.ground_sensors ? 'Active' : 'Offline'}</div>
        </div>

        <div className={`text-center p-2 rounded-xl ${
          dataSources.aqicn
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <div className="text-lg">🌏</div>
          <div className="text-xs font-medium">AQICN</div>
          <div className="text-xs">{dataSources.aqicn ? 'Active' : 'Offline'}</div>
        </div>

        <div className={`text-center p-2 rounded-xl ${
          dataSources.weather
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <div className="text-lg">🌤️</div>
          <div className="text-xs font-medium">Weather</div>
          <div className="text-xs">{dataSources.weather ? 'Active' : 'Offline'}</div>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-2">
        <div className="flex items-center justify-between">
          <span>🤖 Model: </span>
          <span className="font-mono">{model}</span>
        </div>
        {isRealTime && (
          <div className="mt-1 flex items-center text-green-600 dark:text-green-400">
            <span className="mr-1">⚡</span>
            <span>Real-time data integration active</span>
          </div>
        )}
      </div>
    </div>
  )
}