import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../use-theme'
import { useThemeStore } from '@/stores/theme-store'
import { FONT_OPTIONS, COLOR_THEMES } from '@/lib/theme'

describe('useTheme', () => {
  beforeEach(() => {
    useThemeStore.getState().reset()
  })

  it('returns current theme values', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.font).toBe('sans')
    expect(result.current.colorTheme).toBe('default')
    expect(result.current.mode).toBe('system')
  })

  it('returns font config for current font', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.fontConfig).toEqual(FONT_OPTIONS.sans)
    expect(result.current.fontConfig.fontFamily).toContain('system-ui')
  })

  it('returns color config for current theme', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.colorConfig).toEqual(COLOR_THEMES.default)
    expect(result.current.colorConfig.light.primary).toBe('#E86A4C')
  })

  it('setFont updates font and config', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setFont('serif')
    })

    expect(result.current.font).toBe('serif')
    expect(result.current.fontConfig).toEqual(FONT_OPTIONS.serif)
  })

  it('setColorTheme updates theme and config', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setColorTheme('ocean')
    })

    expect(result.current.colorTheme).toBe('ocean')
    expect(result.current.colorConfig).toEqual(COLOR_THEMES.ocean)
  })

  it('provides all font options', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.fontOptions).toEqual(FONT_OPTIONS)
    expect(Object.keys(result.current.fontOptions)).toEqual([
      'serif',
      'sans',
      'mono',
      'rounded',
    ])
  })

  it('provides all color themes', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.colorThemes).toEqual(COLOR_THEMES)
    expect(Object.keys(result.current.colorThemes)).toEqual([
      'default',
      'ocean',
      'forest',
      'sunset',
      'lavender',
      'midnight',
    ])
  })

  it('reset returns to defaults', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setFont('mono')
      result.current.setColorTheme('forest')
      result.current.setMode('dark')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.font).toBe('sans')
    expect(result.current.colorTheme).toBe('default')
    expect(result.current.mode).toBe('system')
  })
})
