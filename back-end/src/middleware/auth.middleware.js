const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Corrected import to use User model specifically
const logger = require('../utils/logger');

/**
 * Main authentication middleware (Protect route)
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch fresh user from DB to ensure they still exist and have correct role
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or token invalid'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/**
 * Optional Authentication - attaches user if token is valid, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'unknown'}) is not allowed to access this resource`
      });
    }
    next();
  };
};

// Compatibility aliases and specific role guards
const protect = authMiddleware;
const authorize = authorizeRoles;
const isAdmin = authorizeRoles('admin');
const isInstructor = authorizeRoles('instructor');
const isStudent = authorizeRoles('student');
const isStudentOrInstructor = authorizeRoles('student', 'instructor');

module.exports = {
  authMiddleware,
  protect,
  optionalAuth,
  authorizeRoles,
  authorize,
  isInstructor,
  isAdmin,
  isStudent,
  isStudentOrInstructor
};
