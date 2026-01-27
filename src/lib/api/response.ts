/**
 * API Response Helpers
 *
 * Standardized response utilities for consistent API responses.
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError, ValidationError } from './errors'

/**
 * Create a success response with data.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Create a 201 Created response.
 */
export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

/**
 * Create a 204 No Content response.
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

/**
 * Create an error response from ApiError.
 */
export function errorResponse(error: ApiError) {
  const errorBody: { code: string; message: string; details?: unknown } = {
    code: error.code,
    message: error.message,
  }
  if (error.details) {
    errorBody.details = error.details
  }
  return NextResponse.json({ error: errorBody }, { status: error.status })
}

/**
 * Handle any error and convert to appropriate response.
 * Handles ApiError, ZodError, and unknown errors.
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Handle our custom ApiError
  if (error instanceof ApiError) {
    return errorResponse(error)
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse(
      new ValidationError(
        error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
      )
    )
  }

  // Handle Prisma unique constraint error
  if (error instanceof Error && error.message.includes('Unique constraint')) {
    return errorResponse(new ApiError(409, 'CONFLICT', 'Resource already exists'))
  }

  // Handle unknown errors as 500
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 }
  )
}
