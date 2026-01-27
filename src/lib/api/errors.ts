/**
 * API Error Classes
 *
 * Standardized error classes for consistent API error handling.
 */

/**
 * Base API error class.
 */
export class ApiError extends Error {
  public status: number
  public code: string
  public details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * 404 Not Found error.
 */
export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`)
  }
}

/**
 * 400 Validation error with details.
 */
export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', details)
  }
}

/**
 * 401 Unauthorized error.
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message)
  }
}

/**
 * 403 Forbidden error.
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied') {
    super(403, 'FORBIDDEN', message)
  }
}

/**
 * 409 Conflict error.
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, 'CONFLICT', message)
  }
}

/**
 * 403 Tier limit error for feature restrictions.
 */
export class TierLimitError extends ApiError {
  constructor(feature: string, requiredTier: string) {
    super(403, 'TIER_LIMIT', `${feature} requires ${requiredTier} tier or higher`)
  }
}

/**
 * 403 Post limit error for free tier.
 */
export class PostLimitError extends ApiError {
  constructor(limit: number) {
    super(403, 'POST_LIMIT', `Post limit of ${limit} reached. Upgrade to Pro for unlimited posts.`)
  }
}
