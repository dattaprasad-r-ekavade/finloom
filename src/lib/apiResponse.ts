import { NextResponse } from 'next/server';

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = unknown> = ErrorResponse | SuccessResponse<T>;

/**
 * Creates a standardized error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: unknown
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error,
  };
  
  if (details !== undefined) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Creates a standardized success response
 */
export function successResponse<T = unknown>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      ...(data && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Common error handlers
 */
export const ErrorHandlers = {
  badRequest: (message: string = 'Bad request') =>
    errorResponse(message, 400),

  unauthorized: (message: string = 'Unauthorized') =>
    errorResponse(message, 401),

  forbidden: (message: string = 'Forbidden') =>
    errorResponse(message, 403),

  notFound: (message: string = 'Resource not found') =>
    errorResponse(message, 404),

  conflict: (message: string = 'Resource already exists') =>
    errorResponse(message, 409),

  validationError: (message: string, details?: unknown) =>
    errorResponse(message, 422, details),

  serverError: (message: string = 'Internal server error', details?: unknown) =>
    errorResponse(message, 500, details),
};

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter((field) => !body[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Email validation regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength validation (min 8 chars)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
