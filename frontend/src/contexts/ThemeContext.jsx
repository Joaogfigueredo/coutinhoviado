import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}

const STORAGE_KEY = 'moneymap-theme' // 'dark' | 'light'

export const ThemeProvider = ({ children }) => {
  const apply = useCallback((isDark) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(isDark ? 'dark' : 'light')
    root.style.colorScheme = isDark ? 'dark' : 'light'
    root.dataset.theme = isDark ? 'dark' : 'light'

    // Vars globais p/ CSS fora do Tailwind (opcional, mas ajuda)
    root.style.setProperty('--app-background', isDark ? '#020617' : '#f8fafc')
    root.style.setProperty('--app-surface', isDark ? '#0f172a' : '#ffffff')
    root.style.setProperty('--app-foreground', isDark ? '#f8fafc' : '#0f172a')

    if (document.body) {
      document.body.classList.remove('dark', 'light')
      document.body.classList.add(isDark ? 'dark' : 'light')
      document.body.dataset.theme = isDark ? 'dark' : 'light'
      document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc'
      document.body.style.color = isDark ? '#f8fafc' : '#0f172a'
    }

    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
  }, [])

  const [isDark, setIsDark] = useState(false)

  // Aplica ANTES da pintura inicial
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      const startDark = saved ? saved === 'dark' : !!prefers
      setIsDark(startDark)
      apply(startDark)
    } catch {
      apply(false)
    }
  }, [apply])

  const setTheme = useCallback((theme) => {
    const next = theme === 'dark'
    setIsDark(next)
    apply(next)
  }, [apply])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      apply(next)
      return next
    })
  }, [apply])

  const value = useMemo(() => ({
    isDark,
    theme: isDark ? 'dark' : 'light',
    setTheme,
    toggleTheme,
  }), [isDark, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}