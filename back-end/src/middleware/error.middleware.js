const logger = require('../utils/logger');

/**
 * Global Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  
  // Log the error
  logger.error(`[${req.method}] ${req.path} >> ${err.message}`, {
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user._id : 'anonymous'
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorMiddleware;
