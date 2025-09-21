'use client'

import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex-shrink-0">
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 p-1 overflow-hidden"
        aria-label="Toggle theme"
      >
      <span
        className={`inline-block h-8 w-8 transform rounded-full bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
        }`}
      >
        <span className="flex h-full w-full items-center justify-center">
          {theme === 'light' ? (
            <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </span>
      </span>
      </button>
    </div>
  )
}