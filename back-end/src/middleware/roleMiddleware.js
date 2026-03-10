exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra đã đăng nhập chưa
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Bạn chưa đăng nhập",
        });
      }

      const userRole = req.user.role;

      // Kiểm tra role có được phép không
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access denied - Bạn không có quyền truy cập",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error.message,
      });
    }
  };
};