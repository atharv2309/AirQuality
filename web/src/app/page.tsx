'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ForecastChart } from '@/components/ForecastChart'
import { HealthAdviceCard } from '@/components/HealthAdviceCard'
import { AqiBadge } from '@/components/AqiBadge'
import { LocationSearch } from '@/components/LocationSearch'
import { MaximizedMapOverlay } from '@/components/MaximizedMapOverlay'
import { AqiReferenceTable } from '@/components/AqiReferenceTable'
import { InfoTooltip } from '@/components/InfoTooltip'
import { DataSourceIndicator } from '@/components/DataSourceIndicator'
import { formatWithTimezone, getTimezoneDisplay } from '@/utils/timezone'

const OpenStreetMap = dynamic(() => import('@/components/OpenStreetMap').then(mod => ({ default: mod.OpenStreetMap })), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center">
    <div className="animate-pulse-slow">Loading map...</div>
  </div>
})

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
  data_sources?: {
    satellite: boolean
    ground_sensors: boolean
    weather: boolean
  }
  data_quality?: string
  real_time_data?: any
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lon: number} | null>(null)
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMapMaximized, setIsMapMaximized] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [geolocationError, setGeolocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [mapType, setMapType] = useState<'terrain' | 'satellite' | 'roadmap'>('satellite')
  const [showAQIOverlay, setShowAQIOverlay] = useState(false)

  const handleLocationSelect = async (lat: number, lon: number) => {
    setSelectedLocation({ lat, lon })
    setLoading(true)
    setError(null)
    setForecastData(null) // Clear previous data immediately

    try {
      // Get location name via reverse geocoding
      await updateLocationName(lat, lon)

      // Add cache busting and random parameter to ensure fresh data
      const timestamp = Date.now()
      const response = await fetch(`http://localhost:8000/forecast?lat=${lat}&lon=${lon}&horizon=24&_t=${timestamp}`, {
        cache: 'no-store', // Prevent caching
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data')
      }

      const data: ForecastResponse = await response.json()
      setForecastData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast')
      console.error('Forecast fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.display_name) {
          setSelectedAddress(data.display_name)
        }
      }
    } catch (error) {
      console.error('Failed to get location name:', error)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by this browser')
      return
    }

    setIsLoadingLocation(true)
    setGeolocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        handleLocationSelect(latitude, longitude)
        setIsLoadingLocation(false)
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setGeolocationError(errorMessage)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Auto-detect location on component mount
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const handleSearchLocationSelect = (lat: number, lon: number, address: string) => {
    setSelectedAddress(address)
    handleLocationSelect(lat, lon)
  }

  const handleToggleMapMaximize = () => {
    setIsMapMaximized(!isMapMaximized)
  }


  const currentAqi = forecastData?.forecast[0]?.aqi || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-black dark:via-gray-900 dark:to-gray-800 transition-all duration-500">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-white/20 dark:border-gray-600/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">AQ</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AirQuality
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">From EarthData to Action • Times in {getTimezoneDisplay()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LocationSearch onLocationSelect={handleSearchLocationSelect} />
              <button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-2xl font-medium transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                title="Use my current location"
              >
                {isLoadingLocation ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Map */}
          <div className="space-y-6 animate-fade-in">
            <div className="backdrop-blur-sm bg-white/70 dark:bg-black/70 rounded-3xl p-6 border border-white/20 dark:border-gray-600/50 shadow-xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🗺️</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Location
                </h2>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <OpenStreetMap
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                  height="500px"
                  isMaximized={isMapMaximized}
                  onToggleMaximize={handleToggleMapMaximize}
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                  showAQIOverlay={showAQIOverlay}
                  onToggleAQIOverlay={() => setShowAQIOverlay(!showAQIOverlay)}
                />
              </div>
            </div>

            {selectedLocation && (
              <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl animate-slide-up">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">📍</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">Selected Location</h3>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-4">
                  {selectedAddress && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                      {selectedAddress}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                  </p>
                  {loading && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                      <span>Getting fresh forecast data...</span>
                    </div>
                  )}
                  {error && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                      <span>Error: {error}</span>
                    </div>
                  )}
                  {geolocationError && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                      <span>{geolocationError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AQI Reference Table - Below Selected Location */}
            {selectedLocation && (
              <div className="animate-slide-up">
                <AqiReferenceTable />
              </div>
            )}
          </div>

          {/* Right Column - Forecast Data */}
          <div className="space-y-6 animate-fade-in">
            {forecastData && (
              <>
                {/* Current AQI & Health Advice */}
                <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl animate-slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Current Forecast
                      </h2>
                    </div>
                    <AqiBadge aqi={currentAqi} size="lg" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4">
                      <div className="flex items-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">PM2.5</p>
                        <InfoTooltip text="PM2.5 are fine particulate matter with diameter ≤2.5 micrometers. These tiny particles can penetrate deep into lungs and bloodstream, causing respiratory and cardiovascular health issues. WHO guideline: 15 μg/m³ annual average." />
                      </div>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {forecastData.forecast[0]?.pm25?.toFixed(1)} 
                        <span className="text-sm font-normal ml-1">μg/m³</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Category</p>
                      <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                        {forecastData.forecast[0]?.category}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Model: {forecastData.model} | Generated: {formatWithTimezone(forecastData.generated_at)}
                    </p>
                  </div>
                </div>

                {/* Health Advice Card */}
                <div className="animate-slide-up">
                  <HealthAdviceCard aqi={currentAqi} />
                </div>

                {/* Forecast Chart */}
                <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl animate-slide-up">
                  <ForecastChart data={forecastData.forecast} height={350} />
                </div>

                {/* Data Sources Indicator */}
                {forecastData.data_sources && (
                  <div className="animate-slide-up">
                    <DataSourceIndicator 
                      dataSources={forecastData.data_sources}
                      dataQuality={forecastData.data_quality || 'unknown'}
                      model={forecastData.model}
                    />
                  </div>
                )}
              </>
            )}


            {!forecastData && !loading && (
              <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl p-12 border border-white/20 dark:border-gray-700/50 shadow-xl text-center animate-fade-in">
                <div className="text-6xl mb-6 animate-pulse-slow text-blue-500">AQ</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Ready to Explore?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  Click anywhere on the map to discover air quality insights and health guidance
                </p>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium">
                  <span>Tap the map to start</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Credits */}
      <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-between items-end pointer-events-none">
        {/* Info Tooltip - positioned to avoid cutoff */}
        <div className="pointer-events-auto">
          <InfoTooltip
            text={
              forecastData?.model?.includes('tempo_openaq')
                ? "Using real-time data integration: NASA TEMPO satellite measurements, OpenAQ ground-based sensors, and weather data for accurate air quality assessments."
                : "Real-time air quality data from NASA TEMPO satellite and OpenAQ ground sensors with EPA health standards."
            }
          />
        </div>

        {/* Made with Love Credits */}
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2 text-sm text-white">
          <span>Made with</span>
          <span className="text-red-500 animate-pulse">♥</span>
          <span>for the planet by Atharv and Pragati</span>
        </div>
      </div>

      {/* Maximized Map Overlay */}
      <MaximizedMapOverlay
        isOpen={isMapMaximized}
        onClose={() => setIsMapMaximized(false)}
        forecastData={forecastData}
        selectedLocation={selectedLocation}
        loading={loading}
        error={error}
      >
        <OpenStreetMap
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          height="100vh"
          isMaximized={true}
          onToggleMaximize={handleToggleMapMaximize}
          mapType={mapType}
          onMapTypeChange={setMapType}
          showAQIOverlay={showAQIOverlay}
          onToggleAQIOverlay={() => setShowAQIOverlay(!showAQIOverlay)}
        />
      </MaximizedMapOverlay>
    </div>
  )
}
