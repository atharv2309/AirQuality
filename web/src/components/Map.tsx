'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers not showing
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapProps {
  onLocationSelect?: (lat: number, lon: number) => void
  selectedLocation?: { lat: number; lon: number } | null
  height?: string
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export function Map({ onLocationSelect, selectedLocation, height = '400px' }: MapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  // Default to Los Angeles coordinates
  const defaultCenter: [number, number] = [34.0522, -118.2437]
  const center: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lon] 
    : defaultCenter

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
            <Popup>
              <div className="text-sm">
                <strong>Selected Location</strong><br />
                Lat: {selectedLocation.lat.toFixed(4)}<br />
                Lon: {selectedLocation.lon.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
        Click anywhere on the map to get air quality forecast for that location
      </div>
    </div>
  )
}