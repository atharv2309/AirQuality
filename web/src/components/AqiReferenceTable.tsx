'use client'

import { useState, useEffect } from 'react'

interface AqiCategory {
  range: string
  level: string
  color: string
  description: string
  health_impact: string
  recommendations: string[]
}

interface AqiReferenceData {
  categories: AqiCategory[]
  sources: string[]
  last_updated: string
}

export function AqiReferenceTable() {
  const [referenceData, setReferenceData] = useState<AqiReferenceData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchReferenceData = async () => {
    if (referenceData) return // Don't fetch if we already have data
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/aqi/reference')
      if (response.ok) {
        const data = await response.json()
        setReferenceData(data)
      }
    } catch (error) {
      console.error('Failed to fetch AQI reference data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      fetchReferenceData()
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
      <button
        onClick={handleToggle}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-3xl"
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            AQI Reference Guide
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Understanding Air Quality Levels
          </span>
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-600 dark:text-gray-400">
                Loading reference data...
              </div>
            </div>
          )}

          {referenceData && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                          AQI Range
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                          Health Impact
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                          Key Recommendations
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {referenceData.categories.map((category, index) => (
                        <tr
                          key={index}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-mono font-bold text-gray-900 dark:text-white">
                                {category.range}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {category.level}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {category.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700 dark:text-gray-300">
                              {category.health_impact}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              {category.recommendations.slice(0, 2).map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                              {category.recommendations.length > 2 && (
                                <li className="text-blue-600 dark:text-blue-400">
                                  +{category.recommendations.length - 2} more...
                                </li>
                              )}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      About This Guide
                    </p>
                    <p className="text-blue-700 dark:text-blue-400 mb-2">
                      This AQI reference follows international standards and provides health-focused recommendations 
                      that go beyond basic EPA guidelines. Our system recommends specific protective measures like 
                      N95 masks and air purifiers based on scientific evidence.
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <p><strong>Sources:</strong> {referenceData.sources.join(', ')}</p>
                      <p><strong>Last Updated:</strong> {new Date(referenceData.last_updated).toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })} {Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Important Notes
                    </p>
                    <ul className="text-amber-700 dark:text-amber-400 space-y-1 text-xs">
                      <li>• Sensitive groups include children, elderly, pregnant women, and people with heart/lung conditions</li>
                      <li>• Air quality can change rapidly - check forecasts regularly</li>
                      <li>• When in doubt, choose more protective measures</li>
                      <li>• Consult healthcare providers for personalized advice</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}