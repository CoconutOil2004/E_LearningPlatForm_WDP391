const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (file.mimetype && allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, png, gif, webp)"), false);
  }
};

/** Multer: nhiều ảnh, field name "images", tối đa 10 file, mỗi file max 5MB */
const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).array("images", 10);

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File ảnh vượt quá dung lượng cho phép (5MB/file)." });
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ success: false, message: "Tối đa 10 ảnh mỗi lần." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || "Lỗi upload file." });
  }
  next();
};

module.exports = uploadImages;
module.exports.handleUploadError = handleUploadError;
