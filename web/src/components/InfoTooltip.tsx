'use client'

import { useState, useRef, useEffect } from 'react'

interface InfoTooltipProps {
  text: string
  className?: string
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'left' | 'center' | 'right'>('center')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && buttonRef.current) {
      const tooltip = tooltipRef.current
      const button = buttonRef.current
      const rect = button.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      const windowWidth = window.innerWidth
      
      // Calculate if tooltip would overflow
      const wouldOverflowLeft = rect.left + tooltipRect.width / 2 < 20
      const wouldOverflowRight = rect.right - tooltipRect.width / 2 > windowWidth - 20
      
      if (wouldOverflowLeft) {
        setPosition('left')
      } else if (wouldOverflowRight) {
        setPosition('right')
      } else {
        setPosition('center')
      }
    }
  }, [isVisible])

  const handleShow = () => setIsVisible(true)
  const handleHide = () => setIsVisible(false)

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 bottom-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg border border-gray-700 dark:border-gray-300 w-64 max-w-sm whitespace-normal"
    
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
    const baseClasses = "absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"
    
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