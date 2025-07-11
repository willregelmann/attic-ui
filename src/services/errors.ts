// Standardized error handling system

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp?: string;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;
  public readonly timestamp: string;

  constructor(response: ApiErrorResponse | string, statusCode = 0) {
    if (typeof response === 'string') {
      super(response);
      this.code = 'UNKNOWN_ERROR';
      this.statusCode = statusCode;
      this.timestamp = new Date().toISOString();
    } else {
      super(response.message);
      this.code = response.code || 'API_ERROR';
      this.statusCode = response.statusCode;
      this.errors = response.errors;
      this.timestamp = response.timestamp || new Date().toISOString();
    }

    this.name = 'ApiError';
  }

  // Helper methods for common error types
  static networkError(message = 'Network connection failed'): ApiError {
    return new ApiError({
      success: false,
      message,
      code: 'NETWORK_ERROR',
      statusCode: 0,
    });
  }

  static authenticationError(message = 'Authentication failed'): ApiError {
    return new ApiError({
      success: false,
      message,
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }

  static validationError(message = 'Validation failed', errors: Record<string, string[]> = {}): ApiError {
    return new ApiError({
      success: false,
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 422,
      errors,
    });
  }

  static serverError(message = 'Server error occurred'): ApiError {
    return new ApiError({
      success: false,
      message,
      code: 'SERVER_ERROR',
      statusCode: 500,
    });
  }

  // Check if error is a specific type
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  isAuthenticationError(): boolean {
    return this.code === 'AUTHENTICATION_ERROR' || this.statusCode === 401;
  }

  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' || this.statusCode === 422;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  // Get user-friendly error message
  getUserMessage(): string {
    switch (this.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Please sign in again to continue.';
      case 'VALIDATION_ERROR':
        return this.message || 'Please check your input and try again.';
      case 'SERVER_ERROR':
        return 'Something went wrong on our end. Please try again in a few moments.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  // Get validation errors for forms
  getValidationErrors(): Record<string, string> {
    if (!this.errors) return {};
    
    // Convert array of errors to single string per field
    return Object.entries(this.errors).reduce((acc, [field, errors]) => {
      acc[field] = errors[0] || 'Invalid value';
      return acc;
    }, {} as Record<string, string>);
  }
}

// Error boundary helper for React components
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unexpected error occurred');
};

// Global error logger
export const logError = (error: ApiError, context?: string): void => {
  const errorInfo = {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    context,
    timestamp: error.timestamp,
    stack: error.stack,
  };

  // In development, log to console
  if (import.meta.env.DEV) {
    console.error('🚨 API Error:', errorInfo);
  }

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // TODO: Send to Sentry, LogRocket, or similar service
    // Sentry.captureException(error, { extra: errorInfo });
  }
};