'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { FONT_OPTIONS, COLOR_THEMES } from '@/lib/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { font, colorTheme, mode } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply theme CSS variables
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // Apply font
    const fontConfig = FONT_OPTIONS[font]
    root.style.setProperty('--font-body', fontConfig.fontFamily)

    // Determine actual mode (resolve 'system' to light/dark)
    const resolvedMode: 'light' | 'dark' =
      mode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : mode

    // Apply color theme
    const themeColors = COLOR_THEMES[colorTheme][resolvedMode]
    root.setAttribute('data-theme', colorTheme)
    root.setAttribute('data-mode', resolvedMode)

    // Set CSS variables for colors
    Object.entries(themeColors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value as string)
    })

    // Toggle dark class for Tailwind dark mode
    if (resolvedMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [font, colorTheme, mode, mounted])

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted) return
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      // Trigger re-render to apply new colors
      useThemeStore.getState().setMode('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode, mounted])

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
