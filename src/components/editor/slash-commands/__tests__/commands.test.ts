import { describe, it, expect, vi } from 'vitest'
import { SLASH_COMMANDS, filterCommands, type SlashCommand } from '../commands'

describe('SLASH_COMMANDS', () => {
  it('has all required commands (12 commands)', () => {
    expect(SLASH_COMMANDS.length).toBe(12)
  })

  it('each command has required properties', () => {
    SLASH_COMMANDS.forEach((command) => {
      expect(command).toHaveProperty('id')
      expect(command).toHaveProperty('title')
      expect(command).toHaveProperty('description')
      expect(command).toHaveProperty('icon')
      expect(command).toHaveProperty('keywords')
      expect(command).toHaveProperty('action')

      expect(typeof command.id).toBe('string')
      expect(typeof command.title).toBe('string')
      expect(typeof command.description).toBe('string')
      expect(typeof command.action).toBe('function')
      expect(Array.isArray(command.keywords)).toBe(true)
    })
  })

  it('has unique command ids', () => {
    const ids = SLASH_COMMANDS.map((cmd) => cmd.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('keywords are searchable strings', () => {
    SLASH_COMMANDS.forEach((command) => {
      command.keywords.forEach((keyword) => {
        expect(typeof keyword).toBe('string')
        expect(keyword.length).toBeGreaterThan(0)
      })
    })
  })

  it('actions are callable functions', () => {
    const mockEditor = {
      chain: () => ({
        focus: () => ({
          toggleHeading: () => ({ run: vi.fn() }),
          setParagraph: () => ({ run: vi.fn() }),
          toggleBulletList: () => ({ run: vi.fn() }),
          toggleOrderedList: () => ({ run: vi.fn() }),
          toggleBlockquote: () => ({ run: vi.fn() }),
          toggleCodeBlock: () => ({ run: vi.fn() }),
          setHorizontalRule: () => ({ run: vi.fn() }),
          insertTable: () => ({ run: vi.fn() }),
        }),
      }),
    }

    SLASH_COMMANDS.forEach((command) => {
      // Should not throw
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        command.action(mockEditor as any)
      }).not.toThrow()
    })
  })
})

describe('filterCommands', () => {
  it('returns all commands when query is empty', () => {
    const result = filterCommands('')
    expect(result).toEqual(SLASH_COMMANDS)
  })

  it('filters by title', () => {
    const result = filterCommands('heading')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((cmd) => cmd.title.toLowerCase().includes('heading'))).toBe(true)
  })

  it('filters by description', () => {
    const result = filterCommands('bulleted')
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters by keywords', () => {
    const result = filterCommands('h1')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((cmd) => cmd.keywords.includes('h1'))).toBe(true)
  })

  it('returns empty array for no matches', () => {
    const result = filterCommands('xyznonexistent')
    expect(result).toEqual([])
  })

  it('is case insensitive', () => {
    const lowerResult = filterCommands('heading')
    const upperResult = filterCommands('HEADING')
    expect(lowerResult).toEqual(upperResult)
  })
})
