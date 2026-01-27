import { describe, it, expect, vi } from 'vitest'
import { ZodError, ZodIssueCode } from 'zod'
import {
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  handleApiError,
} from '../response'
import { ApiError, NotFoundError, ValidationError } from '../errors'

describe('successResponse', () => {
  it('should return JSON with 200 status', async () => {
    const response = successResponse({ posts: [] })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ posts: [] })
  })

  it('should accept custom status', async () => {
    const response = successResponse({ updated: true }, 200)
    expect(response.status).toBe(200)
  })

  it('should handle complex data', async () => {
    const data = {
      posts: [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
      ],
      total: 2,
    }
    const response = successResponse(data)
    const json = await response.json()
    expect(json).toEqual(data)
  })
})

describe('createdResponse', () => {
  it('should return JSON with 201 status', async () => {
    const response = createdResponse({ id: '123', title: 'New Post' })
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json).toEqual({ id: '123', title: 'New Post' })
  })
})

describe('noContentResponse', () => {
  it('should return 204 status with no body', () => {
    const response = noContentResponse()
    expect(response.status).toBe(204)
    expect(response.body).toBeNull()
  })
})

describe('errorResponse', () => {
  it('should format ApiError correctly', async () => {
    const error = new NotFoundError('Post')
    const response = errorResponse(error)
    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe('NOT_FOUND')
    expect(json.error.message).toBe('Post not found')
  })

  it('should include details when present', async () => {
    const error = new ValidationError([{ path: 'title', message: 'Required' }])
    const response = errorResponse(error)
    const json = await response.json()
    expect(json.error.details).toBeDefined()
    expect(json.error.details).toEqual([{ path: 'title', message: 'Required' }])
  })

  it('should omit details when not present', async () => {
    const error = new ApiError(400, 'BAD_REQUEST', 'Bad request')
    const response = errorResponse(error)
    const json = await response.json()
    expect(json.error.details).toBeUndefined()
  })
})

describe('handleApiError', () => {
  it('should handle ApiError', async () => {
    const error = new NotFoundError('Page')
    const response = handleApiError(error)
    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('should handle ZodError', async () => {
    const zodError = new ZodError([
      {
        code: ZodIssueCode.too_small,
        minimum: 1,
        origin: 'string',
        inclusive: true,
        message: 'Title is required',
        path: ['title'],
      } as const,
    ])
    const response = handleApiError(zodError)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.details[0].path).toBe('title')
    expect(json.error.details[0].message).toBe('Title is required')
  })

  it('should handle ZodError with nested path', async () => {
    const zodError = new ZodError([
      {
        code: ZodIssueCode.invalid_type,
        expected: 'string',
        message: 'Expected string',
        path: ['settings', 'theme', 'color'],
      } as const,
    ])
    const response = handleApiError(zodError)
    const json = await response.json()
    expect(json.error.details[0].path).toBe('settings.theme.color')
  })

  it('should handle Prisma unique constraint error', async () => {
    const error = new Error('Unique constraint failed on the fields: (`slug`)')
    const response = handleApiError(error)
    expect(response.status).toBe(409)
    const json = await response.json()
    expect(json.error.code).toBe('CONFLICT')
  })

  it('should handle unknown errors as 500', async () => {
    const response = handleApiError(new Error('Something went wrong'))
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('Internal server error')
  })

  it('should handle non-Error objects as 500', async () => {
    const response = handleApiError('string error')
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })

  it('should log errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Test error')
    handleApiError(error)
    expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
    consoleSpy.mockRestore()
  })
})
