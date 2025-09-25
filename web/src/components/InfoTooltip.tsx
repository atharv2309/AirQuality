'use client'

import { useState, useRef, useEffect } from 'react'

interface InfoTooltipProps {
  text: string
  className?: string
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'left' | 'center' | 'right'>('center')
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'bottom'>('top')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && buttonRef.current) {
      const tooltip = tooltipRef.current
      const button = buttonRef.current
      const rect = button.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      // Calculate horizontal position
      // Check if centering the tooltip would cause overflow
      const tooltipCenterLeft = rect.left + rect.width / 2 - tooltipRect.width / 2
      const tooltipCenterRight = tooltipCenterLeft + tooltipRect.width

      const wouldOverflowLeft = tooltipCenterLeft < 20
      const wouldOverflowRight = tooltipCenterRight > windowWidth - 20

      if (wouldOverflowLeft) {
        setPosition('left')
      } else if (wouldOverflowRight) {
        setPosition('right')
      } else {
        setPosition('center')
      }

      // Calculate vertical position - if near bottom, show above
      // Use a more generous buffer for bottom positioning
      const isNearBottom = rect.bottom > windowHeight - 200
      setVerticalPosition(isNearBottom ? 'top' : 'bottom')
    }
  }, [isVisible])

  const handleShow = () => setIsVisible(true)
  const handleHide = () => setIsVisible(false)

  const getTooltipClasses = () => {
    const verticalClass = verticalPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
    const baseClasses = `absolute z-50 ${verticalClass} px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg border border-gray-700 dark:border-gray-300 w-64 max-w-sm whitespace-normal`

    switch (position) {
      case 'left':
        return `${baseClasses} left-0`
      case 'right':
        return `${baseClasses} right-0`
      default:
        return `${baseClasses} left-1/2 transform -translate-x-1/2`
    }
  }

  const getArrowClasses = () => {
    const arrowDirection = verticalPosition === 'top'
      ? "top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"
      : "bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100"

    const baseClasses = `absolute ${arrowDirection}`

    switch (position) {
      case 'left':
        return `${baseClasses} left-4`
      case 'right':
        return `${baseClasses} right-4`
      default:
        return `${baseClasses} left-1/2 transform -translate-x-1/2`
    }
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
        className="ml-1 w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="More information"
      >
        i
      </button>
      
      {isVisible && (
        <div ref={tooltipRef} className={getTooltipClasses()}>
          <div className="text-left leading-relaxed">{text}</div>
          {/* Arrow */}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  )
}