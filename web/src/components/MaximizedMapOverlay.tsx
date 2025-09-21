'use client'

import { useEffect } from 'react'
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

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[100] bg-white dark:bg-black rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Left Side Data Panel */}
      {selectedLocation && (
        <div className="absolute left-4 md:left-6 top-6 bottom-6 w-80 md:w-96 space-y-4 z-[55]">
          
          {/* Location Info */}
          <div className="backdrop-blur-sm bg-white/95 dark:bg-black/95 rounded-3xl p-4 border border-white/30 dark:border-gray-600/70 shadow-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">📍</span>
              <h3 className="font-bold text-gray-900 dark:text-white">Selected Location</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
            </p>
            {loading && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-pulse">⏳</div>
                <span>Getting fresh forecast data...</span>
              </div>
            )}
            {error && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <span>❌</span>
                <span>Error: {error}</span>
              </div>
            )}
          </div>

          {forecastData && (
            <>
              {/* Current Forecast */}
              <div className="backdrop-blur-sm bg-white/95 dark:bg-black/95 rounded-3xl p-4 border border-white/30 dark:border-gray-600/70 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📊</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">Current Forecast</h3>
                  </div>
                  <AqiBadge aqi={currentAqi} size="sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">PM2.5</p>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                      {forecastData.forecast[0]?.pm25?.toFixed(1)} 
                      <span className="text-xs font-normal ml-1">μg/m³</span>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-3">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Category</p>
                    <p className="text-sm font-bold text-purple-800 dark:text-purple-300">
                      {forecastData.forecast[0]?.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Advisory */}
              <div className="backdrop-blur-sm bg-white/95 dark:bg-black/95 rounded-3xl border border-white/30 dark:border-gray-600/70 shadow-2xl">
                <HealthAdviceCard aqi={currentAqi} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Right Side Forecast Chart */}
      {selectedLocation && forecastData && (
        <div className="absolute right-4 md:right-6 top-20 bottom-6 w-80 md:w-96 z-[55]">
          <div className="backdrop-blur-sm bg-white/95 dark:bg-black/95 rounded-3xl p-4 border border-white/30 dark:border-gray-600/70 shadow-2xl h-full">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">📈</span>
              <h3 className="font-bold text-gray-900 dark:text-white">24-Hour Forecast</h3>
            </div>
            <ForecastChart data={forecastData.forecast} height={350} />
          </div>
        </div>
      )}
    </div>
  )
}