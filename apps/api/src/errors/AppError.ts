/**
 * Base application error class.
 *
 * isOperational = true  → expected error (bad input, not found, auth failure, etc.)
 *                       → log as `warn`, respond with typed payload
 *
 * isOperational = false → programming bug (unexpected, should never happen)
 *                       → log as `fatal`, respond with generic 500
 *                       → TODO: trigger crash notifier (Discord webhook, Sentry, etc.)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = 'INTERNAL_ERROR',
    isOperational = true,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', true, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS', true);
  }
}

export class PaymentRequiredError extends AppError {
  public readonly currentBalance: number;
  public readonly requiredCredits: number;

  constructor(
    currentBalance: number,
    requiredCredits: number,
    action: string,
  ) {
    super(
      `Insufficient credits for action '${action}'. Required: ${requiredCredits}, available: ${currentBalance}.`,
      402,
      'INSUFFICIENT_CREDITS',
      true,
      { currentBalance, requiredCredits, action },
    );
    this.currentBalance = currentBalance;
    this.requiredCredits = requiredCredits;
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 500, 'INTERNAL_ERROR', false, details);
  }
}
