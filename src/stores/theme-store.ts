import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type FontOption,
  type ColorTheme,
  type ThemeMode,
  DEFAULT_FONT,
  DEFAULT_COLOR_THEME,
  DEFAULT_MODE,
} from '@/lib/theme'

export interface ThemeState {
  font: FontOption
  colorTheme: ColorTheme
  mode: ThemeMode
  setFont: (_font: FontOption) => void
  setColorTheme: (_theme: ColorTheme) => void
  setMode: (_mode: ThemeMode) => void
  reset: () => void
}

const initialState = {
  font: DEFAULT_FONT,
  colorTheme: DEFAULT_COLOR_THEME,
  mode: DEFAULT_MODE,
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...initialState,
      setFont: (font) => set({ font }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setMode: (mode) => set({ mode }),
      reset: () => set(initialState),
    }),
    {
      name: 'pint-theme',
    }
  )
)
