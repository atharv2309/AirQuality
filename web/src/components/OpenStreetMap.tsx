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
  showAQIOverlay?: boolean
  onToggleAQIOverlay?: () => void
}

export function OpenStreetMap({
  onLocationSelect,
  selectedLocation,
  height = '500px',
  isMaximized = false,
  onToggleMaximize,
  mapType = 'satellite',
  onMapTypeChange,
  showAQIOverlay = false,
  onToggleAQIOverlay
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [aqiHeatmapLayer, setAqiHeatmapLayer] = useState<any>(null)
  const [aqiData, setAqiData] = useState<any[]>([])
  const [isLoadingAQI, setIsLoadingAQI] = useState(false)

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

  // Fetch AQI data for current map bounds
  const fetchAQIData = async (mapInstance: any) => {
    if (!mapInstance) return

    setIsLoadingAQI(true)
    try {
      const bounds = mapInstance.getBounds()
      const north = bounds.getNorth()
      const south = bounds.getSouth()
      const east = bounds.getEast()
      const west = bounds.getWest()

      const response = await fetch(
        `http://localhost:8000/aqi/regional?north=${north}&south=${south}&east=${east}&west=${west}&grid_size=10`,
        {
          signal: AbortSignal.timeout(15000) // 15 second timeout
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched AQI data:', {
          dataPoints: data.data_points,
          sampleData: data.data?.slice(0, 3),
          bounds: data.bounds
        })
        setAqiData(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch AQI data:', error)
    } finally {
      setIsLoadingAQI(false)
    }
  }

  // Create AQI heatmap layer
  const createAQIHeatmapLayer = () => {
    if (!window.L || !window.L.heatLayer || !aqiData.length) {
      console.log('Heatmap layer not available:', {
        hasL: !!window.L,
        hasHeatLayer: !!(window.L && window.L.heatLayer),
        dataLength: aqiData.length
      })
      return null
    }

    const heatmapPoints = aqiData.map(point => [
      point.lat,
      point.lon,
      Math.max(0.3, point.aqi / 150) // Better visibility with higher minimum intensity
    ])

    console.log('Creating heatmap with points:', heatmapPoints.length, heatmapPoints.slice(0, 3))

    return window.L.heatLayer(heatmapPoints, {
      radius: 50,
      blur: 30,
      maxZoom: 18,
      max: 2.0, // Increased max for better visibility
      minOpacity: 0.4, // Minimum opacity for better visibility
      gradient: {
        0.0: 'rgba(0,228,0,0.8)',    // Good - Green with transparency
        0.2: 'rgba(255,255,0,0.8)',  // Moderate - Yellow
        0.4: 'rgba(255,126,0,0.8)',  // Unhealthy for Sensitive - Orange
        0.6: 'rgba(255,0,0,0.8)',    // Unhealthy - Red
        0.8: 'rgba(143,63,151,0.8)', // Very Unhealthy - Purple
        1.0: 'rgba(126,0,35,0.8)'    // Hazardous - Maroon
      }
    })
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
          // Load Leaflet Heatmap plugin
          const heatmapScript = document.createElement('script')
          heatmapScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js'
          heatmapScript.onload = () => {
            initializeMap()
          }
          document.head.appendChild(heatmapScript)
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
      L.tileLayer(tileUrls[mapType], {
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

      // Add map move listeners to refresh AQI data
      mapInstance.on('moveend', () => {
        if (showAQIOverlay) {
          fetchAQIData(mapInstance)
        }
      })

      mapInstance.on('zoomend', () => {
        if (showAQIOverlay) {
          fetchAQIData(mapInstance)
        }
      })

      setMap(mapInstance)
      setIsLoaded(true)

      // Initial AQI data fetch if overlay is already enabled
      if (showAQIOverlay) {
        fetchAQIData(mapInstance)
      }
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
      L.tileLayer(tileUrls[mapType], {
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

  // Handle AQI overlay toggling
  useEffect(() => {
    if (!map || !isLoaded) return

    if (showAQIOverlay) {
      // Fetch AQI data and add overlay
      fetchAQIData(map)
    } else {
      // Remove existing heatmap layer
      if (aqiHeatmapLayer) {
        map.removeLayer(aqiHeatmapLayer)
        setAqiHeatmapLayer(null)
      }
    }
  }, [showAQIOverlay, map, isLoaded])

  // Update heatmap when AQI data changes
  useEffect(() => {
    if (!map || !showAQIOverlay || !aqiData.length) return

    // Remove existing heatmap layer
    if (aqiHeatmapLayer) {
      map.removeLayer(aqiHeatmapLayer)
    }

    // Create and add new heatmap layer
    const newHeatmapLayer = createAQIHeatmapLayer()
    if (newHeatmapLayer) {
      newHeatmapLayer.addTo(map)
      setAqiHeatmapLayer(newHeatmapLayer)
    }
  }, [aqiData, map, showAQIOverlay])

  // Handle fullscreen mode changes - invalidate map size
  useEffect(() => {
    if (!map) return

    // Small delay to let the DOM update before invalidating size
    const timer = setTimeout(() => {
      map.invalidateSize(true)

      // If AQI overlay is active, refresh data for new view
      if (showAQIOverlay) {
        fetchAQIData(map)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isMaximized, map])

  return (
    <div className="relative">
      {/* Compact Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        {/* Map Type Dropdown */}
        {onMapTypeChange && (
          <div className="relative">
            <select
              value={mapType}
              onChange={(e) => onMapTypeChange(e.target.value as any)}
              className="bg-white dark:bg-black rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="satellite">🛰️ Satellite</option>
              <option value="terrain">🌄 Terrain</option>
              <option value="roadmap">🗺️ Streets</option>
            </select>
          </div>
        )}

        {/* AQI Overlay Toggle */}
        {onToggleAQIOverlay && (
          <button
            onClick={onToggleAQIOverlay}
            className={`px-3 py-2 rounded-lg shadow-lg border text-sm font-medium transition-all relative ${
              showAQIOverlay
                ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title={`${showAQIOverlay ? 'Hide' : 'Show'} AQI Overlay`}
          >
            {isLoadingAQI ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>🌬️ AQI</span>
                {showAQIOverlay && (
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                )}
              </div>
            )}
          </button>
        )}
      </div>

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