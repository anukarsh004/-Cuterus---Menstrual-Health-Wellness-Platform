/**
 * Enhanced error handling middleware
 * Distinguishes between different error types and returns appropriate responses
 */

export class AppError extends Error {
  constructor(message, statusCode, errorType, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorTypes = {
  NETWORK_FAILURE: 'NETWORK_FAILURE',
  BACKEND_OFFLINE: 'BACKEND_OFFLINE',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_API_KEY: 'INVALID_API_KEY',
  AUTH_FAILURE: 'AUTH_FAILURE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
};

export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    type: err.errorType || 'UNKNOWN',
    statusCode: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorType: err.errorType,
      timestamp: err.timestamp,
      details: err.details,
    });
  }

  // Handle fetch/network errors
  if (err.message?.includes('Failed to fetch') || err.message?.includes('fetch failed') || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'AI service is currently unreachable. Please try again later.',
      errorType: ErrorTypes.NETWORK_FAILURE,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle timeout errors
  if (err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('timed out')) {
    return res.status(504).json({
      success: false,
      error: 'AI service request timed out. Please try again.',
      errorType: ErrorTypes.TIMEOUT,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    errorType: ErrorTypes.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    errorType: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profile',
      'POST /api/ai/chat',
      'GET /api/chat/rooms',
      'GET /api/calendar/events',
      'GET /api/analytics/summary',
    ],
  });
}

