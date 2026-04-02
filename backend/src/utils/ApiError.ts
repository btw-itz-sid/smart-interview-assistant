// ============================================
// Custom API Error Class
// Yeh class custom errors banana easy banati hai
// Har error mein statusCode aur message hota hai
// ============================================

// ApiError class built-in Error class ko extend karti hai
// Isse hum statusCode bhi attach kar sakte hain error ke saath
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Stack trace maintain karne ke liye
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common errors ke liye shortcut functions
// Isse baar baar new ApiError likhne ki zaroorat nahi
export class NotFoundError extends ApiError {
  constructor(message = 'Resource nahi mila') {
    super(404, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized - Pehle login karo') {
    super(401, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Invalid request data') {
    super(400, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied - Permission nahi hai') {
    super(403, message);
  }
}
