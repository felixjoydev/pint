import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../theme-store'

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useThemeStore.getState().reset()
  })

  it('has correct initial state', () => {
    const state = useThemeStore.getState()
    expect(state.font).toBe('sans')
    expect(state.colorTheme).toBe('default')
    expect(state.mode).toBe('system')
  })

  it('setFont updates font independently', () => {
    useThemeStore.getState().setFont('serif')
    const state = useThemeStore.getState()
    expect(state.font).toBe('serif')
    expect(state.colorTheme).toBe('default')
    expect(state.mode).toBe('system')
  })

  it('setColorTheme updates color theme independently', () => {
    useThemeStore.getState().setColorTheme('ocean')
    const state = useThemeStore.getState()
    expect(state.font).toBe('sans')
    expect(state.colorTheme).toBe('ocean')
    expect(state.mode).toBe('system')
  })

  it('setMode updates mode independently', () => {
    useThemeStore.getState().setMode('dark')
    const state = useThemeStore.getState()
    expect(state.font).toBe('sans')
    expect(state.colorTheme).toBe('default')
    expect(state.mode).toBe('dark')
  })

  it('allows independent font and color theme selection', () => {
    useThemeStore.getState().setFont('mono')
    useThemeStore.getState().setColorTheme('forest')
    const state = useThemeStore.getState()
    expect(state.font).toBe('mono')
    expect(state.colorTheme).toBe('forest')
  })

  it('reset returns to initial state', () => {
    useThemeStore.getState().setFont('rounded')
    useThemeStore.getState().setColorTheme('lavender')
    useThemeStore.getState().setMode('light')
    useThemeStore.getState().reset()

    const state = useThemeStore.getState()
    expect(state.font).toBe('sans')
    expect(state.colorTheme).toBe('default')
    expect(state.mode).toBe('system')
  })
})
