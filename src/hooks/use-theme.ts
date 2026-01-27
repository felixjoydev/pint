'use client'

import { useThemeStore } from '@/stores/theme-store'
import { FONT_OPTIONS, COLOR_THEMES } from '@/lib/theme'

export function useTheme() {
  const { font, colorTheme, mode, setFont, setColorTheme, setMode, reset } =
    useThemeStore()

  const fontConfig = FONT_OPTIONS[font]
  const colorConfig = COLOR_THEMES[colorTheme]

  return {
    // Current values
    font,
    colorTheme,
    mode,

    // Config objects
    fontConfig,
    colorConfig,

    // Setters
    setFont,
    setColorTheme,
    setMode,
    reset,

    // Available options
    fontOptions: FONT_OPTIONS,
    colorThemes: COLOR_THEMES,
  }
}
