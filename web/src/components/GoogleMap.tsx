'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface GoogleMapProps {
  onLocationSelect?: (lat: number, lon: number) => void
  selectedLocation?: { lat: number; lon: number } | null
  height?: string
  isMaximized?: boolean
  onToggleMaximize?: () => void
  mapType?: 'terrain' | 'satellite' | 'roadmap'
  onMapTypeChange?: (type: 'terrain' | 'satellite' | 'roadmap') => void
}

export function GoogleMap({ 
  onLocationSelect, 
  selectedLocation, 
  height = '500px',
  isMaximized = false,
  onToggleMaximize,
  mapType = 'terrain',
  onMapTypeChange
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Google Maps API key not configured')
      return
    }

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      })

      await loader.load()

      const mapOptions: google.maps.MapOptions = {
        center: selectedLocation || { lat: 34.0522, lng: -118.2437 },
        zoom: 10,
        mapTypeId: mapType as google.maps.MapTypeId,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeControl: false, // We'll add our custom control
      }

      const map = new google.maps.Map(mapRef.current, mapOptions)
      mapInstanceRef.current = map

      // Add click listener
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && onLocationSelect) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          onLocationSelect(lat, lng)
        }
      })

      setIsLoaded(true)
    } catch (err) {
      console.error('Error loading Google Maps:', err)
      setError('Failed to load Google Maps')
    }
  }, [selectedLocation, mapType, onLocationSelect])

  // Update map type when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && mapType) {
      mapInstanceRef.current.setMapTypeId(mapType as google.maps.MapTypeId)
    }
  }, [mapType])

  // Update marker when selected location changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // Add new marker
      const marker = new google.maps.Marker({
        position: { lat: selectedLocation.lat, lng: selectedLocation.lon },
        map: mapInstanceRef.current,
        title: `AQI Location: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      })

      markerRef.current = marker

      // Center map on marker
      mapInstanceRef.current.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lon })
    }
  }, [selectedLocation])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  if (error) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl p-8"
           style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Map not available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{error}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
            Falling back to basic map functionality
          </p>
        </div>
      </div>
    )
  }

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
          className="absolute top-20 left-4 z-10 bg-white dark:bg-black rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
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
        ref={mapRef} 
        className="w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: isMaximized ? '100vh' : height }}
      />
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center animate-pulse">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </div>
  )
}