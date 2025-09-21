'use client'

import { useState } from 'react'

interface SimpleMapProps {
  onLocationSelect?: (lat: number, lon: number) => void
  selectedLocation?: { lat: number; lon: number } | null
  height?: string
  isMaximized?: boolean
  onToggleMaximize?: () => void
  mapType?: 'terrain' | 'satellite' | 'roadmap'
  onMapTypeChange?: (type: 'terrain' | 'satellite' | 'roadmap') => void
}

export function SimpleMap({ 
  onLocationSelect, 
  selectedLocation, 
  height = '500px',
  isMaximized = false,
  onToggleMaximize,
  mapType = 'terrain',
  onMapTypeChange
}: SimpleMapProps) {
  const [coordinates, setCoordinates] = useState('')

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const coords = coordinates.split(',').map(s => s.trim())
    if (coords.length === 2) {
      const lat = parseFloat(coords[0])
      const lon = parseFloat(coords[1])
      if (!isNaN(lat) && !isNaN(lon) && onLocationSelect) {
        onLocationSelect(lat, lon)
      }
    }
  }

  const quickLocations = [
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 }
  ]

  return (
    <div className="relative">
      {/* Map Type Selector */}
      {onMapTypeChange && (
        <div className="absolute top-4 right-4 z-10 flex bg-white dark:bg-black rounded-2xl p-1 shadow-lg border border-gray-200 dark:border-gray-600">
          <button
            onClick={() => onMapTypeChange('terrain')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mapType === 'terrain' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🌄 Terrain
          </button>
          <button
            onClick={() => onMapTypeChange('satellite')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mapType === 'satellite' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => onMapTypeChange('roadmap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mapType === 'roadmap' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🗺️ Roads
          </button>
        </div>
      )}

      {/* Maximize Button */}
      {onToggleMaximize && (
        <button
          onClick={onToggleMaximize}
          className="absolute top-4 left-4 z-10 bg-white dark:bg-black rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          title={isMaximized ? "Minimize map" : "Maximize map"}
        >
          {isMaximized ? (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      )}

      <div 
        className="w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
        style={{ height: isMaximized ? '100vh' : height }}
      >
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-6">🗺️</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Interactive Location Selector
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Choose a location below or enter coordinates to get air quality data
          </p>

          {/* Quick Location Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {quickLocations.map((location) => (
              <button
                key={location.name}
                onClick={() => onLocationSelect?.(location.lat, location.lon)}
                className="px-4 py-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all text-sm font-medium text-gray-800 dark:text-white shadow-sm hover:shadow-md"
              >
                📍 {location.name}
              </button>
            ))}
          </div>

          {/* Manual Coordinate Entry */}
          <form onSubmit={handleCoordinateSubmit} className="w-full max-w-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                placeholder="Enter lat, lon (e.g., 34.0522, -118.2437)"
                className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                Go
              </button>
            </div>
          </form>

          {selectedLocation && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                📍 Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}