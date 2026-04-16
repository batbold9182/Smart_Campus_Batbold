function errorHandler(err, req, res, next) {
  // Avoid logging sensitive request data; log only the error type and message
  const logMessage = `[${err.name || "Error"}] ${err.message || ""}`;
  if ((err.statusCode || err.status || 500) >= 500) {
    console.error(logMessage, err.stack);
  } else {
    console.warn(logMessage);
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // MongoDB duplicate key → 409 Conflict
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(409)
      .json({ message: `Duplicate value for ${field}` });
  }

  // MongoDB network / timeout errors
  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongoTimeoutError" ||
    err.name === "MongoServerSelectionError"
  ) {
    return res
      .status(503)
      .json({ message: "Database is temporarily unavailable. Please try again." });
  }

  // External fetch timeout
  if (err.name === "AbortError") {
    return res
      .status(503)
      .json({ message: "External service timed out. Please try again." });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
}

module.exports = errorHandler;
