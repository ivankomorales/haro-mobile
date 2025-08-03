// utils/ApiError.js

// Custom error class that extends the built-in Error
class ApiError extends Error {
  constructor(message, statusCode) {
    // Call the parent Error constructor with the message
    super(message);

    // Set the custom status code (e.g., 400, 404, 500)
    this.statusCode = statusCode;

    // Capture the stack trace (excluding this constructor)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
