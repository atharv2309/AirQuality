'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

// You'll need to get a free API key from https://account.mapbox.com/
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface MapboxAQIProps {
  onLocationSelect?: (lat: number, lon: number) => void
  selectedLocation?: { lat: number; lon: number } | null
  height?: string
  isMaximized?: boolean
  onToggleMaximize?: () => void
}

export function MapboxAQI({
  onLocationSelect,
  selectedLocation,
  height = '500px',
  isMaximized = false,
  onToggleMaximize
}: MapboxAQIProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const currentMarker = useRef<mapboxgl.Marker | null>(null)


  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !MAPBOX_ACCESS_TOKEN) return

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    const mapInstance = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Professional light style
      center: [-95.7129, 37.0902], // Center of US
      zoom: 4,
      projection: 'mercator'
    })

    // Add map controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add fullscreen control if not maximized
    if (!isMaximized && onToggleMaximize) {
      const fullscreenBtn = document.createElement('button')
      fullscreenBtn.className = 'mapbox-ctrl mapbox-ctrl-group'
      fullscreenBtn.innerHTML = `
        <button class="mapbox-ctrl-fullscreen" type="button" aria-label="Toggle fullscreen">
          <span class="mapbox-ctrl-icon" aria-hidden="true" title="Toggle fullscreen">⛶</span>
        </button>
      `
      fullscreenBtn.onclick = onToggleMaximize

      const controlContainer = document.createElement('div')
      controlContainer.className = 'mapboxgl-ctrl-top-right'
      controlContainer.appendChild(fullscreenBtn)
    }

    mapInstance.on('load', () => {
      // Add click handler for location selection
      mapInstance.on('click', (e) => {
        if (onLocationSelect) {
          onLocationSelect(e.lngLat.lat, e.lngLat.lng)
        }
      })
    })

    map.current = mapInstance

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onLocationSelect, onToggleMaximize, isMaximized])


  // Update selected location marker
  useEffect(() => {
    if (!map.current || !selectedLocation) return

    // Remove existing marker
    if (currentMarker.current) {
      currentMarker.current.remove()
    }

    // Create new marker
    const markerElement = document.createElement('div')
    markerElement.className = 'selected-location-marker'
    markerElement.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007cbf;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    `

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat([selectedLocation.lon, selectedLocation.lat])
      .addTo(map.current)

    currentMarker.current = marker

    // Center map on selected location
    map.current.flyTo({
      center: [selectedLocation.lon, selectedLocation.lat],
      zoom: 10,
      duration: 1000
    })
  }, [selectedLocation])

  // Show token warning if not configured
  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl"
        style={{ height }}
      >
        <div className="text-center p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Mapbox Configuration Required
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please add your Mapbox access token to display the map
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="rounded-2xl overflow-hidden"
        style={{ height }}
      />

      {/* Map Style Toggle */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => map.current?.setStyle('mapbox://styles/mapbox/light-v11')}
            className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Light Mode"
          >
            Light
          </button>
          <button
            onClick={() => map.current?.setStyle('mapbox://styles/mapbox/dark-v11')}
            className="px-3 py-1 text-sm rounded bg-gray-700 text-white hover:bg-gray-800 transition-colors"
            title="Dark Mode"
          >
            Dark
          </button>
          <button
            onClick={() => map.current?.setStyle('mapbox://styles/mapbox/satellite-streets-v12')}
            className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
            title="Satellite"
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Get Air Quality Data</h4>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          Click anywhere on the map to get real-time air quality data and forecasts for that location.
        </p>
      </div>
    </div>
  )
}