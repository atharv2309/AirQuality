'use client'

import { Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatForChart, getUserTimezone, getTimezoneAbbreviation } from '@/utils/timezone'

interface ForecastData {
  hour: number
  timestamp: string
  aqi: number
  aqi_lower: number
  aqi_upper: number
  pm25: number
  category: string
}

interface ForecastChartProps {
  data: ForecastData[]
  height?: number
}

export function ForecastChart({ data, height = 300 }: ForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No forecast data available</p>
      </div>
    )
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const userTimezone = getUserTimezone()
    return date.toLocaleTimeString('en-US', { 
      timeZone: userTimezone,
      hour: 'numeric', 
      hour12: true 
    })
  }


  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">📈</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">24-Hour Air Quality Forecast</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">AQI values with uncertainty bands ✨</p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-300 dark:text-gray-600" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="currentColor"
            fontSize={12}
            className="text-gray-900 dark:text-gray-100"
          />
          <YAxis 
            stroke="currentColor"
            fontSize={12}
            className="text-gray-900 dark:text-gray-100"
            label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'aqi') return [value, 'AQI']
              if (name === 'aqi_upper') return [value, 'Upper bound']
              if (name === 'aqi_lower') return [value, 'Lower bound']
              return [value, name]
            }}
            labelFormatter={(timestamp: string) => {
              const userTimezone = getUserTimezone()
              const tzAbbr = getTimezoneAbbreviation(userTimezone)
              return formatForChart(timestamp) + ` ${tzAbbr}`
            }}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '6px',
              fontSize: '14px',
              color: 'var(--tooltip-text)'
            }}
            wrapperStyle={{
              '--tooltip-bg': 'white',
              '--tooltip-border': '#e5e7eb',
              '--tooltip-text': 'black'
            } as React.CSSProperties}
            className="dark:[--tooltip-bg:theme(colors.gray.800)] dark:[--tooltip-border:theme(colors.gray.600)] dark:[--tooltip-text:white]"
          />
          <Legend />
          
          {/* Uncertainty band */}
          <Area
            dataKey="aqi_upper"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.1}
            name="Uncertainty band"
          />
          <Area
            dataKey="aqi_lower"
            stroke="none"
            fill="white"
            fillOpacity={1}
          />
          
          {/* Main AQI line */}
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="AQI Forecast"
          />
          
          {/* Upper and lower bound lines */}
          <Line
            type="monotone"
            dataKey="aqi_upper"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="Upper bound"
          />
          <Line
            type="monotone"
            dataKey="aqi_lower"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="Lower bound"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
          <span className="mr-2">🤖</span>
          Forecast uses persistence baseline model with ±20 AQI uncertainty bands
        </p>
      </div>
    </div>
  )
}