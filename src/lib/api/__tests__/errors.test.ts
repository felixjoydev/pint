import { describe, it, expect } from 'vitest'
import {
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TierLimitError,
  PostLimitError,
} from '../errors'

describe('ApiError', () => {
  it('should create error with all properties', () => {
    const error = new ApiError(400, 'TEST_ERROR', 'Test message', { field: 'value' })
    expect(error.status).toBe(400)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.message).toBe('Test message')
    expect(error.details).toEqual({ field: 'value' })
    expect(error.name).toBe('ApiError')
  })

  it('should create error without details', () => {
    const error = new ApiError(400, 'TEST_ERROR', 'Test message')
    expect(error.details).toBeUndefined()
  })

  it('should be instanceof Error', () => {
    const error = new ApiError(400, 'TEST_ERROR', 'Test message')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('NotFoundError', () => {
  it('should create 404 error', () => {
    const error = new NotFoundError('Post')
    expect(error.status).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Post not found')
  })

  it('should work with different resources', () => {
    const pageError = new NotFoundError('Page')
    expect(pageError.message).toBe('Page not found')

    const widgetError = new NotFoundError('Widget')
    expect(widgetError.message).toBe('Widget not found')
  })
})

describe('ValidationError', () => {
  it('should create 400 error with details', () => {
    const details = [{ path: 'title', message: 'Required' }]
    const error = new ValidationError(details)
    expect(error.status).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.message).toBe('Validation failed')
    expect(error.details).toEqual(details)
  })

  it('should accept complex details', () => {
    const details = {
      fields: [
        { path: 'title', message: 'Required' },
        { path: 'email', message: 'Invalid format' },
      ],
    }
    const error = new ValidationError(details)
    expect(error.details).toEqual(details)
  })
})

describe('UnauthorizedError', () => {
  it('should create 401 error with default message', () => {
    const error = new UnauthorizedError()
    expect(error.status).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.message).toBe('Authentication required')
  })

  it('should accept custom message', () => {
    const error = new UnauthorizedError('Token expired')
    expect(error.message).toBe('Token expired')
  })
})

describe('ForbiddenError', () => {
  it('should create 403 error with default message', () => {
    const error = new ForbiddenError()
    expect(error.status).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
    expect(error.message).toBe('Access denied')
  })

  it('should accept custom message', () => {
    const error = new ForbiddenError('You do not have permission')
    expect(error.message).toBe('You do not have permission')
  })
})

describe('ConflictError', () => {
  it('should create 409 error', () => {
    const error = new ConflictError('Slug already exists')
    expect(error.status).toBe(409)
    expect(error.code).toBe('CONFLICT')
    expect(error.message).toBe('Slug already exists')
  })
})

describe('TierLimitError', () => {
  it('should create tier limit error', () => {
    const error = new TierLimitError('Custom domains', 'Pro')
    expect(error.status).toBe(403)
    expect(error.code).toBe('TIER_LIMIT')
    expect(error.message).toBe('Custom domains requires Pro tier or higher')
  })

  it('should work with different features and tiers', () => {
    const error = new TierLimitError('AI Editor', 'Max')
    expect(error.message).toBe('AI Editor requires Max tier or higher')
  })
})

describe('PostLimitError', () => {
  it('should create post limit error', () => {
    const error = new PostLimitError(50)
    expect(error.status).toBe(403)
    expect(error.code).toBe('POST_LIMIT')
    expect(error.message).toContain('50')
    expect(error.message).toContain('Upgrade to Pro')
  })
})
