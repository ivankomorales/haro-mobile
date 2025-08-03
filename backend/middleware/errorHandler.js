// middleware/errorHandler.js

// Custom error-handling middleware for Express
const errorHandler = (err, req, res, next) => {
  //console.error(`[${new Date().toISOString()}] ❌ Error:`, err);

  // Use provided statusCode or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Prepare basic error response
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Include error stack trace only in development mode
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  // Log error to the console
  console.error(`[ERROR ${statusCode}]: ${err.message}`);

  // Send error response to the client
  res.status(statusCode).json(response);
};

module.exports = errorHandler;
