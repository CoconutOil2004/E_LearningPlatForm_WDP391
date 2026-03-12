const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =====================================
   PROTECT ROUTE (Require Login)
===================================== */
const protect = async (req, res, next) => {
  try {
    let token;

    /* ======================
       GET TOKEN FROM HEADER
    ====================== */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    /* ======================
       VERIFY TOKEN
    ====================== */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ======================
       FIND USER
    ====================== */
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /* attach user to request */
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      error: error.message,
    });
  }
};

/* =====================================
   OPTIONAL AUTH — không bắt buộc login
   Nếu có token hợp lệ → gắn req.user
   Nếu không có / hết hạn → req.user = null, next()
===================================== */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    req.user = user || null;
    next();
  } catch {
    // Token lỗi/hết hạn → coi như guest
    req.user = null;
    next();
  }
};

module.exports = { protect, optionalAuth };
