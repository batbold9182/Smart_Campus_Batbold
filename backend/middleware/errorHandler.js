function errorHandler(err, req, res, next) {
  console.error(err);

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

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(400)
      .json({ message: err.message || `Duplicate value for ${field}` });
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
