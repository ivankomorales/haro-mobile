// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  //console.error(`[${new Date().toISOString()}] ❌ Error:`, err);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  console.error(`[ERROR ${statusCode}]: ${err.message}`);

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
