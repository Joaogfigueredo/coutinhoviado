import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle({ className = '', floating = true }) {
  const { isDark, toggleTheme } = useTheme()

  const positionClasses = floating ? 'fixed top-4 right-4 z-50' : ''

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${positionClasses}
        p-3 rounded-full
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        shadow-lg hover:shadow-xl
        text-gray-700 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        ${className}
      `}
      title={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
      aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 animate-pulse" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  )
}