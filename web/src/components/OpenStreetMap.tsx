'use client'

import { useEffect, useRef, useState } from 'react'

interface OpenStreetMapProps {
  onLocationSelect?: (lat: number, lon: number) => void
  selectedLocation?: { lat: number; lon: number } | null
  height?: string
  isMaximized?: boolean
  onToggleMaximize?: () => void
  mapType?: 'terrain' | 'satellite' | 'roadmap'
  onMapTypeChange?: (type: 'terrain' | 'satellite' | 'roadmap') => void
}

export function OpenStreetMap({ 
  onLocationSelect, 
  selectedLocation, 
  height = '500px',
  isMaximized = false,
  onToggleMaximize,
  mapType = 'terrain',
  onMapTypeChange
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Tile layer URLs for different map types
  const tileUrls = {
    roadmap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    satelliteLabels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
  }

  const attributions = {
    roadmap: '© OpenStreetMap contributors',
    terrain: '© OpenTopoMap (CC-BY-SA)',
    satellite: '© Esri, Maxar, Earthstar Geographics'
  }

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // Load Leaflet JS
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          initializeMap()
        }
        document.head.appendChild(script)
      } else if (window.L) {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (!mapRef.current || map) return

      const L = window.L
      
      // Initialize map
      const mapInstance = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([selectedLocation?.lat || 34.0522, selectedLocation?.lon || -118.2437], 10)

      // Add tile layer
      const tileLayer = L.tileLayer(tileUrls[mapType], {
        attribution: attributions[mapType],
        maxZoom: 18
      }).addTo(mapInstance)

      // Add attribution control
      L.control.attribution({
        position: 'bottomright',
        prefix: false
      }).addTo(mapInstance)

      // Add click handler
      mapInstance.on('click', (e: any) => {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng)
        }
      })

      setMap(mapInstance)
      setIsLoaded(true)
    }

    loadLeaflet()

    return () => {
      if (map) {
        map.remove()
        setMap(null)
      }
    }
  }, [])

  // Update map type when prop changes
  useEffect(() => {
    if (map && window.L) {
      // Remove existing tile layers
      map.eachLayer((layer: any) => {
        if (layer._url) {
          map.removeLayer(layer)
        }
      })

      // Add new tile layer
      const L = window.L
      const baseTileLayer = L.tileLayer(tileUrls[mapType], {
        attribution: attributions[mapType],
        maxZoom: 18
      }).addTo(map)

      // Add labels overlay for satellite view
      if (mapType === 'satellite') {
        L.tileLayer(tileUrls.satelliteLabels, {
          maxZoom: 18,
          opacity: 0.8
        }).addTo(map)
      }
    }
  }, [mapType, map])

  // Update marker when selected location changes
  useEffect(() => {
    if (map && window.L && selectedLocation) {
      const L = window.L

      // Remove existing marker
      if (marker) {
        map.removeLayer(marker)
      }

      // Create custom icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #3B82F6;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: 'custom-marker'
      })

      // Add new marker
      const newMarker = L.marker([selectedLocation.lat, selectedLocation.lon], {
        icon: customIcon
      }).addTo(map)

      setMarker(newMarker)

      // Center map on marker
      map.setView([selectedLocation.lat, selectedLocation.lon], map.getZoom())
    }
  }, [selectedLocation, map])

  return (
    <div className="relative">
      {/* Map Type Selector */}
      {onMapTypeChange && (
        <div className="absolute top-4 right-4 z-[1000] flex bg-white dark:bg-black rounded-2xl p-1 shadow-lg border border-gray-200 dark:border-gray-600">
          <button
            onClick={() => onMapTypeChange('roadmap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mapType === 'roadmap' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🗺️ Streets
          </button>
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
        </div>
      )}

      {/* Maximize Button */}
      {onToggleMaximize && (
        <button
          onClick={onToggleMaximize}
          className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-black rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
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
        className={`w-full rounded-2xl overflow-hidden shadow-2xl ${isMaximized ? 'z-0' : ''}`}
        style={{ height: isMaximized ? '100vh' : height }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center animate-pulse">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 dark:text-gray-400">Loading OpenStreetMap...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Add global type declaration for Leaflet
declare global {
  interface Window {
    L: any
  }
}