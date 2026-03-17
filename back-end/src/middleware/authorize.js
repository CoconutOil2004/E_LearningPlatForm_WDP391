exports.authorize = (...roles) => {
  return (req, res, next) => {
    // check if logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please log in",
      });
    }

    // check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Insufficient permissions",
      });
    }

    next();
  };
};