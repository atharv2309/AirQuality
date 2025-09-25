'use client'

import { useEffect, useState } from 'react'
import { AqiBadge } from './AqiBadge'
import { HealthAdviceCard } from './HealthAdviceCard'
import { ForecastChart } from './ForecastChart'

interface ForecastData {
  hour: number
  timestamp: string
  aqi: number
  aqi_lower: number
  aqi_upper: number
  pm25: number
  category: string
}

interface ForecastResponse {
  lat: number
  lon: number
  forecast: ForecastData[]
  model: string
  generated_at: string
}

interface MaximizedMapOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  forecastData: ForecastResponse | null
  selectedLocation: { lat: number; lon: number } | null
  loading: boolean
  error: string | null
}

export function MaximizedMapOverlay({
  isOpen,
  onClose,
  children,
  forecastData,
  selectedLocation,
  loading,
  error
}: MaximizedMapOverlayProps) {
  const [showChart, setShowChart] = useState(false)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentAqi = forecastData?.forecast[0]?.aqi || 0

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0 z-10" style={{ zIndex: 1 }}>
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>
      </div>

      {/* Top Control Bar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[60] flex items-center space-x-4">
        {/* Location Info */}
        {selectedLocation && (
          <div className="backdrop-blur-sm bg-white/95 dark:bg-black/95 rounded-2xl px-4 py-2 border border-white/30 dark:border-gray-600/70 shadow-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
            </p>
          </div>
        )}

        {/* Current AQI */}
        {forecastData && (
          <div className="backdrop-blur-sm bg-white/95 dark:bg-black/95 rounded-2xl px-4 py-2 border border-white/30 dark:border-gray-600/70 shadow-xl flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current AQI:</span>
            <AqiBadge aqi={currentAqi} size="sm" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              PM2.5: {forecastData.forecast[0]?.pm25?.toFixed(1)} μg/m³
            </span>
          </div>
        )}

        {/* Loading/Error States */}
        {loading && (
          <div className="backdrop-blur-sm bg-blue-50/95 dark:bg-blue-900/95 rounded-2xl px-4 py-2 border border-blue-200/50 dark:border-blue-600/50 shadow-xl">
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="animate-pulse">⏳</div>
              <span>Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="backdrop-blur-sm bg-red-50/95 dark:bg-red-900/95 rounded-2xl px-4 py-2 border border-red-200/50 dark:border-red-600/50 shadow-xl">
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
              <span>❌</span>
              <span>Error loading data</span>
            </div>
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-20 right-6 z-[100] flex items-center space-x-3">
        {/* Chart Toggle Button */}
        {selectedLocation && forecastData && (
          <button
            onClick={() => setShowChart(!showChart)}
            className={`p-3 rounded-2xl shadow-2xl border transition-all ${
              showChart
                ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                : 'bg-white dark:bg-black text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title={showChart ? 'Hide Forecast Chart' : 'Show 24h Forecast'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-white dark:bg-black rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Collapsible Side Panel for Chart */}
      {selectedLocation && forecastData && (
        <div className={`absolute top-0 right-0 h-full z-[55] transition-transform duration-300 ease-in-out ${
          showChart ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="w-96 h-full bg-white/95 dark:bg-black/95 backdrop-blur-sm border-l border-white/30 dark:border-gray-600/70 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">24-Hour Forecast</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Air Quality Trends</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChart(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Chart */}
                <div className="mb-6">
                  <ForecastChart data={forecastData.forecast} height={280} />
                </div>

                {/* Health Advisory */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Health Advisory</h4>
                  <HealthAdviceCard aqi={currentAqi} />
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Current Conditions</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PM2.5</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {forecastData.forecast[0]?.pm25?.toFixed(1)} μg/m³
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {forecastData.forecast[0]?.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}