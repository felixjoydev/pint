import { describe, it, expect } from 'vitest'
import { updateSettingsSchema } from '../settings'

describe('updateSettingsSchema', () => {
  it('should validate basic settings', () => {
    const settings = {
      title: 'My Blog',
      description: 'A blog about things',
    }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(true)
  })

  it('should reject title over 100 characters', () => {
    const settings = { title: 'a'.repeat(101) }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(false)
  })

  it('should reject empty title', () => {
    const settings = { title: '' }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(false)
  })

  it('should reject description over 500 characters', () => {
    const settings = { description: 'a'.repeat(501) }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(false)
  })

  it('should validate theme enum', () => {
    const settings = { defaultTheme: 'dark' }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(true)
  })

  it('should reject invalid theme', () => {
    const settings = { defaultTheme: 'purple' }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(false)
  })

  it('should validate all valid themes', () => {
    expect(updateSettingsSchema.safeParse({ defaultTheme: 'light' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ defaultTheme: 'dark' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ defaultTheme: 'sepia' }).success).toBe(true)
  })

  it('should validate language as 2 characters', () => {
    const valid = { language: 'en' }
    const invalid = { language: 'eng' }
    expect(updateSettingsSchema.safeParse(valid).success).toBe(true)
    expect(updateSettingsSchema.safeParse(invalid).success).toBe(false)
  })

  it('should validate font size enum', () => {
    expect(updateSettingsSchema.safeParse({ defaultFontSize: 'small' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ defaultFontSize: 'medium' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ defaultFontSize: 'large' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ defaultFontSize: 'xlarge' }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ defaultFontSize: 'huge' }).success).toBe(false)
  })

  it('should validate RSS item count range', () => {
    expect(updateSettingsSchema.safeParse({ rssItemCount: 10 }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ rssItemCount: 100 }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ rssItemCount: 50 }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ rssItemCount: 9 }).success).toBe(false)
    expect(updateSettingsSchema.safeParse({ rssItemCount: 101 }).success).toBe(false)
  })

  it('should validate SEO meta limits', () => {
    expect(updateSettingsSchema.safeParse({ customMetaTitle: 'a'.repeat(60) }).success).toBe(true)
    expect(updateSettingsSchema.safeParse({ customMetaTitle: 'a'.repeat(61) }).success).toBe(false)
    expect(updateSettingsSchema.safeParse({ customMetaDescription: 'a'.repeat(160) }).success).toBe(
      true
    )
    expect(updateSettingsSchema.safeParse({ customMetaDescription: 'a'.repeat(161) }).success).toBe(
      false
    )
  })

  it('should validate boolean settings', () => {
    const settings = {
      seoEnabled: true,
      robotsIndexing: false,
      likesEnabled: true,
      likesPublic: false,
      rssFullContent: true,
      analyticsEnabled: false,
    }
    const result = updateSettingsSchema.safeParse(settings)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updateSettingsSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
