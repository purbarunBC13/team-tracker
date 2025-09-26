// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: errors.join(", ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  // Default server error
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
