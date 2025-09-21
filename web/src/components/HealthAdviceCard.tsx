'use client'

import { useState, useEffect } from 'react'
import { AqiBadge } from './AqiBadge'

interface HealthAdviceCardProps {
  aqi: number
}

interface HealthRecommendations {
  level: string
  message: string
  recommendations: string[]
  sensitive_groups: string
  mask_needed: boolean
  outdoor_activities: string
}

export function HealthAdviceCard({ aqi }: HealthAdviceCardProps) {
  const [healthData, setHealthData] = useState<HealthRecommendations | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)

  useEffect(() => {
    if (aqi > 0) {
      fetchHealthRecommendations()
    }
  }, [aqi])

  const fetchHealthRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/health/recommendations?aqi=${aqi}`)
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
      }
    } catch (error) {
      console.error('Failed to fetch health recommendations:', error)
      // Fallback to local recommendations
      setHealthData(getLocalHealthAdvice(aqi))
    } finally {
      setLoading(false)
    }
  }

  const getLocalHealthAdvice = (aqi: number): HealthRecommendations => {
    if (aqi <= 50) {
      return {
        level: 'Good',
        message: 'Air quality is excellent! Perfect for all outdoor activities.',
        recommendations: ['Great time for outdoor exercise', 'Enjoy walks in parks', 'Safe for children to play outside'],
        sensitive_groups: 'No precautions needed for any group',
        mask_needed: false,
        outdoor_activities: 'Highly recommended'
      }
    } else if (aqi <= 100) {
      return {
        level: 'Moderate',
        message: 'Air quality is acceptable for most people.',
        recommendations: ['Outdoor activities are generally safe', 'Sensitive individuals should monitor symptoms'],
        sensitive_groups: 'Sensitive individuals may experience minor symptoms',
        mask_needed: false,
        outdoor_activities: 'Generally safe'
      }
    } else if (aqi <= 150) {
      return {
        level: 'Unhealthy for Sensitive Groups',
        message: 'Sensitive groups should take precautions.',
        recommendations: ['Consider wearing masks for sensitive individuals', 'Limit prolonged outdoor activities'],
        sensitive_groups: 'Children, elderly, and people with heart/lung conditions should limit exposure',
        mask_needed: true,
        outdoor_activities: 'Limited for sensitive groups'
      }
    } else if (aqi <= 200) {
      return {
        level: 'Unhealthy',
        message: 'Everyone should take precautions to limit exposure.',
        recommendations: ['Wear N95 masks when outdoors', 'Stay indoors as much as possible', 'Avoid outdoor exercise'],
        sensitive_groups: 'High risk - should avoid outdoor activities entirely',
        mask_needed: true,
        outdoor_activities: 'Not recommended'
      }
    } else if (aqi <= 300) {
      return {
        level: 'Very Unhealthy',
        message: 'Health alert! Everyone should avoid outdoor activities.',
        recommendations: ['Emergency precautions - stay indoors', 'Wear N95/P100 masks if you must go outside'],
        sensitive_groups: 'Emergency risk - seek immediate medical attention if experiencing symptoms',
        mask_needed: true,
        outdoor_activities: 'Strongly discouraged'
      }
    } else {
      return {
        level: 'Hazardous',
        message: 'Health emergency! Avoid all outdoor exposure.',
        recommendations: ['Emergency conditions - stay indoors immediately', 'N95/P100 masks required for any outdoor exposure'],
        sensitive_groups: 'Life-threatening conditions - immediate medical attention may be required',
        mask_needed: true,
        outdoor_activities: 'Prohibited'
      }
    }
  }

  const getHealthIcon = (level: string) => {
    switch (level) {
      case 'Good': return '😊'
      case 'Moderate': return '😐'
      case 'Unhealthy for Sensitive Groups': return '😷'
      case 'Unhealthy': return '😨'
      case 'Very Unhealthy': return '🚨'
      case 'Hazardous': return '☠️'
      default: return '🌤️'
    }
  }

  const currentHealthData = healthData || getLocalHealthAdvice(aqi)

  return (
    <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="text-4xl animate-pulse-slow">{getHealthIcon(currentHealthData.level)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">💊 Health Advisory</h3>
            <AqiBadge aqi={aqi} size="sm" />
          </div>
          
          {loading && (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 mb-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className="mr-2">🌤️</span>
                Current Conditions - {currentHealthData.level}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{currentHealthData.message}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Key Recommendations
              </h4>
              <ul className="space-y-2">
                {(showAllRecommendations ? currentHealthData.recommendations : currentHealthData.recommendations.slice(0, 2)).map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="mr-2 text-green-600 dark:text-green-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              {currentHealthData.recommendations.length > 2 && (
                <button
                  onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {showAllRecommendations 
                    ? 'Show less' 
                    : `+${currentHealthData.recommendations.length - 2} more`
                  }
                </button>
              )}
            </div>

            {currentHealthData.mask_needed && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                  <span className="mr-2">😷</span>
                  Mask Recommendation
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {aqi <= 150 ? 'Consider wearing masks, especially for sensitive individuals' : 
                   aqi <= 200 ? 'N95 or equivalent masks recommended when outdoors' :
                   'N95/P100 masks required for any outdoor exposure'}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className="mr-2">👥</span>
                Sensitive Groups
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{currentHealthData.sensitive_groups}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <span className="mr-2">⚖️</span>
              Based on international air quality standards including EPA and WHO guidelines. Consult healthcare providers for personal medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}