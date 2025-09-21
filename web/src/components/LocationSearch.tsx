'use client'

import { useState, useEffect, useRef } from 'react'

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, address: string) => void
}

interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      // Using Nominatim (OpenStreetMap) geocoding as fallback since it's free
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      )
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchLocations(query)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    onLocationSelect(lat, lon, result.display_name)
    setQuery(result.display_name.split(',')[0]) // Show just the main location name
    setShowResults(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city or location..."
          className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin text-gray-400">🔄</div>
          ) : (
            <span className="text-gray-400">🔍</span>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-black/95 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">📍</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.display_name.split(',')[0]}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.display_name.split(',').slice(1, 3).join(',')}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 3 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-black/95 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl p-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">🤷‍♀️</div>
            No locations found for "{query}"
          </div>
        </div>
      )}
    </div>
  )
}