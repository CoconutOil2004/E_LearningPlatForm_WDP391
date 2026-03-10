exports.authorize = (...roles) => {
  return (req, res, next) => {
    // kiểm tra đã login chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Bạn chưa đăng nhập",
      });
    }

    // kiểm tra role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Bạn không có quyền truy cập",
      });
    }

    next();
  };
};